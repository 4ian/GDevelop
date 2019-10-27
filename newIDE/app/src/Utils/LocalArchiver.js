// @flow

import optionalRequire from './OptionalRequire.js';
const fs = optionalRequire('fs');
const archiver = optionalRequire('archiver');

// TODO: Move in a Archiver folder?
/**
 * Archive the given folder to a file. Only available when running on Electron runtime.
 */
export const archiveLocalFolder = ({
  path,
  outputFilename,
}: {|
  path: string,
  outputFilename: string,
|}): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!fs || !archiver) return reject(new Error('Archiver unavailable'));

    const output = fs.createWriteStream(outputFilename);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', () => {
      console.log(
        `Archive written at ${outputFilename}, ${archive.pointer()} total bytes.`
      );
      resolve(outputFilename);
    });

    archive.on('error', err => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory(path, false);

    archive.finalize();
  });
};
