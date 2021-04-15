const fs = require('fs');
const path = require('path');
const devnull = require('dev-null')
const unzip = require('node-unzip-2');

function readZipEntry(readStream) {
  return new Promise(resolve => {
    //readStream.pipe(devnull());
    readStream.pipe(process.stdout);
    readStream.on('end', resolve);
  })
}

async function readArchive(stream) {

  stream
    .pipe(unzip.Parse())
    .on('entry', function (entry) {

      if (entry.type === 'Directory') {
        console.log(`Folder: ${entry.path}`);
      } else if (entry.path === '2.txt') {
        /**
         * This is a file inside zip achieve.
         * We can stream it to our needs
         */
        console.log(`File: ${entry.path}, size: ${entry.size}`);
        readZipEntry(entry)
      } else {
        console.log(`Ignore File: ${entry.path}, size: ${entry.size}`);
        entry.autodrain()
      }

      const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
      console.log(`Pass [${entry.path}], used approximately ${used} MB`);
    })
}

readArchive(fs.createReadStream(path.resolve(__dirname, 'assets', 'files.zip')))
