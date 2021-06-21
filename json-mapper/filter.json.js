const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const JSONStream = require('JSONStream')

function logMemory() {
  const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
  console.log(`Memory used approximately ${used} MB`);
}

const codes = [
  "ST01",
  "60",
  "766",
  "851",
  "3118",
  "61",
  "3147",
  "512"
]
function filterRecord(record) {
  return codes.includes(record.locationCode)
}

function parseJson(file) {
  const readStream = fs.createReadStream(file)

  let nodes = 0

  const filterMapper = new Transform({
    objectMode: true,
    transform: (data, _, done) => {
      const filtered = filterRecord(data)
      if (!filtered) {
        return done()
      }
      done(null, data)
    }
  })

  readStream.pipe(JSONStream.parse('*'))
    .pipe(filterMapper)
    .on('finish', () => {
      logMemory()
    })
    .pipe(JSONStream.stringify('[', ',', ']'))
    // Pipe to normal products json
    .pipe(fs.createWriteStream(path.resolve('/tmp', 'inventories.filtered.json')))
}

parseJson(path.resolve('/tmp', 'inventories.json'))
