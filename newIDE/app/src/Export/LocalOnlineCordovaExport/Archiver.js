// @flow

import optionalRequire from '../../Utils/OptionalRequire.js';
const archiver = optionalRequire('archiver');
const fs = optionalRequire('fs');

export const archiveFolder = ({
  path,
  outputFilename,
}: {
  path: string,
  outputFilename: string,
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFilename);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', () => {
      console.log(`Archive written at ${outputFilename}, ${archive.pointer()} total bytes.`);
      resolve(outputFilename);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory(path, false);

    archive.finalize();
  });
};
