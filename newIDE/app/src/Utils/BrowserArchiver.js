// @flow

import { initializeZipJs } from './Zip.js';
import path from 'path';

export type BlobFileDescriptor = {|
  filePath: string,
  blob: Blob,
|};

export type TextFileDescriptor = {|
  filePath: string,
  text: string,
|};

export type UrlFileDescriptor = {|
  filePath: string,
  url: string,
|};

function eachCallback<T>(
  array: Array<T>,
  callback: (T, () => void) => void,
  done: () => void
) {
  if (!array.length) {
    done();
    return;
  }
  let index = 0;

  const callNextCallback = () => {
    callback(array[index], () => {
      index++;
      if (index >= array.length) {
        done();
      } else {
        callNextCallback();
      }
    });
  };

  callNextCallback();
}

export const downloadUrlsToBlobs = async ({
  urlFiles,
  onProgress,
}: {|
  urlFiles: Array<UrlFileDescriptor>,
  onProgress: (count: number, total: number) => void,
|}): Promise<Array<BlobFileDescriptor>> => {
  let count = 0;
  return Promise.all(
    urlFiles
      .filter(({ url }) => url.indexOf('.h') === -1) // TODO
      .map(({ url, filePath }) => {
        return fetch(url)
          .then(response => {
            if (!response.ok) {
              console.error(`Error while downloading "${url}"`, response);
              throw new Error(
                `Error while downloading "${url}" (status: ${response.status})`
              );
            }
            return response.blob();
          })
          .then(blob => {
            count++;
            onProgress(count, urlFiles.length);
            return {
              filePath,
              blob,
            };
          });
      })
  ).then((downloadedBlobs: Array<BlobFileDescriptor>) => {
    console.info('All download done');
    return downloadedBlobs;
  });
};

/**
 * Archive the specified blobs and texts into a zip file,
 * returned as a blob.
 */
export const archiveFiles = async ({
  textFiles,
  blobFiles,
  basePath,
  onProgress,
}: {|
  textFiles: Array<TextFileDescriptor>,
  blobFiles: Array<BlobFileDescriptor>,
  basePath: string,
  onProgress: (count: number, total: number) => void,
|}): Promise<Blob> => {
  const zipJs: ZipJs = await initializeZipJs();

  let zippedFilesCount = 0;
  let totalFilesCount = blobFiles.length + textFiles.length;

  return new Promise((resolve, reject) => {
    zipJs.createWriter(
      new zipJs.BlobWriter('application/zip'),
      function(zipWriter) {
        eachCallback(
          blobFiles,
          ({ filePath, blob }, done) => {
            // All files in a zip are relative
            const relativeFilePath = path.relative(basePath, filePath);

            zipWriter.add(
              relativeFilePath,
              new zipJs.BlobReader(blob),
              () => {
                zippedFilesCount++;
                onProgress(zippedFilesCount, totalFilesCount);
                done();
              },
              () => {
                /* We don't track progress at the file level */
              }
            );
          },
          () => {
            eachCallback(
              textFiles,
              ({ filePath, text }, done) => {
                // All files in a zip are relative
                const relativeFilePath = path.relative(basePath, filePath);

                zipWriter.add(
                  relativeFilePath,
                  new zipJs.TextReader(text),
                  () => {
                    zippedFilesCount++;
                    onProgress(zippedFilesCount, totalFilesCount);
                    done();
                  },
                  () => {
                    /* We don't track progress at the file level */
                  }
                );
              },
              () => {
                zipWriter.close((blob: Blob) => {
                  resolve(blob);
                });
              }
            );
          }
        );
      },
      error => {
        console.error('Error while making zip:', error);
        reject(error);
      }
    );
  });
};
