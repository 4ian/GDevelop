// @flow

import optionalRequire from './OptionalRequire.js';
import optionalLazyRequire from '../Utils/OptionalLazyRequire';
const fs = optionalRequire('fs');
const lazyRequireArchiver = optionalLazyRequire('archiver');

// TODO: Move in a Archiver folder?
/**
 * Archive the given folder to a file. Only available when running on Electron runtime.
 */
export const archiveLocalFolder = ({
  path,
  outputFilename,
  sizeLimit,
}: {|
  path: string,
  outputFilename: string,
  sizeLimit?: number,
|}): Promise<string> => {
  const archiver = lazyRequireArchiver();
  return new Promise((resolve, reject) => {
    if (!fs || !archiver) return reject(new Error('Archiver unavailable'));

    const output = fs.createWriteStream(outputFilename);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', () => {
      const fileSize = archive.pointer();
      console.log(
        `Archive written at ${outputFilename}, ${fileSize}} total bytes.`
      );
      if (sizeLimit && fileSize > sizeLimit) {
        reject(
          new Error(
            `Archive is of size ${fileSize} bytes, which is above the limit allowed of ${sizeLimit} bytes.`
          )
        );
      }
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
