const fs = require('fs')
const path = require('path')
const { Transform } = require('stream')
const csvParser = require('csv-parser')

function logMemory () {
  const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
  console.log(`Memory used approximately ${used} MB`)
}

function parseCsv (readStream, writeStream) {

  const stringifyToArray = new Transform({
    objectMode: true,
    transform: function (row, _, callback) {
      console.warn('@ ROW @', row)

      const mapped = {
        importType: 'AC', // @TODO
        code: row.item_number,
        name: {
          'en-us': row.item_name
        },
        shortDescription: {
          'en-us': row.description.replace(/(<([^>]+)>)/gi, '') // strip tags
        },
        longDescription: {
          'en-us': row.description
        },
        media: {
          'en-us': [
            row.urls_images.split('|').map((image, i) => ({
              code: `image-${i}`,
              url: image,
              type: 'image',
              sequenceId: i
            }))
          ]
        },
        status: row.is_available === '1' ? 'active' : 'inactive',
        unit: 'each', // @TODO
        unitValue: null, // @TODO
        unitPriceRefValue: null, // @TODO
        unitPriceRefUom: null, // @TODO
        hasCatchWeight: false, // @TODO
        modelType: 'configurable', // @TODO
        isInventoryManaged: row.use_stock === "1",
        parentProductCode: row.parent_item_number || null,
        taxClass: row.tax_class,
        fulfillmentMethods: [
          'directShip',
          'BOPIS',
          'ROPIS'
        ],
        properties: [
          row.properties.split('||').map(prop => {
            const [name,value] = prop.split('=>')

            return {
            code: name.toLowerCase(),
            name: {
              'en-us': name
            },
            value: {
              'en-us': value
            },
            type: 'simple',
            displayGroup: 'properties'
          }})
        ],
        inventoryTreatment: 'showOutOfStock', // @TODO
        categories: [
          row.category_numbers.split('||').map((cat, i) => {
            const [number,pos] = cat.split('=>')

            return {
              code: number,
              isPrimary: i === 0,
              sequenceId: pos || 999999999
            }})
        ],
        options: [
          /**
           * @TODO
           * Read attribute_* and map to options
           * Also map option_* to option
           */
          /*{
            code: 'size',
            values: [
              {
                code: 'xx_large'
              },
              {
                code: 'x_large'
              },
              {
                code: 'large'
              },
              {
                code: 'medium'
              },
              {
                code: 'small'
              }
            ]
          }*/
        ],
        price: {
          price: Number(row.old_unit_amount || row.unit_amount),
          currencyCode: row.currency,
          unit: 'each', // @TODO
          salePrice: Number(row.unit_amount)
        },
        identifiers: {
          sku: row.ean,
          upc: row.upc,
          mfgPartNum: 'NUM1' // @TODO
        }
      }
      callback(null, JSON.stringify([mapped]))
    }
  })

  readStream
    .pipe(csvParser({ separator: ';' }))
    .pipe(stringifyToArray)
    .pipe(writeStream)
    .on('headers', (headers) => {
      console.warn('@ HEADERS @', headers)
    })
    .on('end', logMemory)
}

parseCsv(
  fs.createReadStream(path.resolve(__dirname, 'assets', 'sample.csv')),
  fs.createWriteStream(path.resolve(__dirname, 'assets', 'sample.json'))
)
