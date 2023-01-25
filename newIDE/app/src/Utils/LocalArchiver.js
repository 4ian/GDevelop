// @flow

import optionalRequire from './OptionalRequire';
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
        `Archive written at ${outputFilename}, ${fileSize} total bytes.`
      );
      if (sizeLimit && fileSize > sizeLimit) {
        const roundFileSizeInMb = Math.round(fileSize / (1000 * 1000));
        reject(
          new Error(
            `Archive is of size ${roundFileSizeInMb} MB, which is above the limit allowed of ${sizeLimit /
              (1000 * 1000)} MB.`
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
