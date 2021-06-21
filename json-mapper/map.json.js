const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream')

function logMemory() {
  const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
  console.log(`Memory used approximately ${used} MB`);
}

function parseJson(file) {
  const readStream = fs.createReadStream(file)

  let nodes = 0

  readStream.pipe(JSONStream.parse('*'))
    .on('data', (d) => {
      process.stdout.write('.')

      if (nodes % 100 === 0) {
        process.stdout.write(' ' + Math.round(process.memoryUsage().heapUsed / (1024 ** 2)).toString() + ' ')
      }

      nodes++
    })
    .on('finish', () => {
      logMemory()
    })
    .pipe(JSONStream.stringify('[', ',', ']'))
    // Pipe to normal products json
    .pipe(fs.createWriteStream('/tmp/' + path.basename(__filename)))
}

parseJson('/tmp/products0.json')
