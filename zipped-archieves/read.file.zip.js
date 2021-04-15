const path = require('path');
const devnull = require('dev-null')
const StreamZip = require('node-stream-zip');

function readZipEntry(readStream) {
  return new Promise(resolve => {
    readStream.pipe(devnull());
    readStream.on('end', resolve);
  })
}

async function readArchive(archiveFile) {

  const zip = new StreamZip.async({
    file: path.resolve(archiveFile),
    storeEntries: true
  });

  const entriesCount = await zip.entriesCount;
  console.log(`Entries read: ${entriesCount}`);

  const entries = await zip.entries();

  for (const entry of Object.values(entries)) {
    if (entry.isDirectory) {
      console.log(`Folder: ${entry.name}`);
    } else {
      /**
       * This is a file inside zip achieve.
       * We can stream it to our needs
       */
      console.log(`File: ${entry.name}, size: ${entry.size}`);
      await readZipEntry(await zip.stream(entry.name))
    }

    const used = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
    console.log(`The [${entry.name}] used approximately ${used} MB`);
  }

  await zip.close();
}

readArchive(path.resolve(__dirname, 'assets', 'files.zip'))
