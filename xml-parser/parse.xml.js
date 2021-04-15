const fs = require('fs');
const path = require('path');
const XmlStream = require('xml-stream');

function logMemory() {
  const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
  console.log(`Memory used approximately ${used} MB`);
}

function parseXml(file) {
  const stream = fs.createReadStream(file);

  const xml = new XmlStream(stream);
  xml.collect('InventoryDetail');
  xml.collect('Inv');
  xml.on('endElement: Book', function(node) {

    const invs = node.Inventory.InventoryDetail.map(inv => {
        const invs = inv.Inv.map(i => (
          `\t\tbin ${i['$'].bin} with ${i['$text']}`
        ))

        return `\tstore: ${inv['$'].Store} \n ${invs.join('\n')}`
    })

    const log = `Book ${node.Isbn} is emitted with inventories\n ${invs.join('\n')}\n`
    process.stdout.write(log);
  });

  xml.on('startElement: BookStores', logMemory);
  xml.on('end', logMemory);
  xml.on('error', function(message) {
    console.log('Parsing as failed: ' + message);
  });
}

parseXml(path.resolve(__dirname, 'assets', 'nested.xml'))
