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
  sizeOptions,
}: {|
  path: string,
  outputFilename: string,
  sizeOptions?: {|
    limit: number,
    getMessage: (fileSizeInMb: number) => string,
  |},
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
      if (sizeOptions && fileSize > sizeOptions.limit) {
        const roundFileSizeInMb = Math.round(fileSize / (1000 * 1000));
        reject(new Error(sizeOptions.getMessage(roundFileSizeInMb)));
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
