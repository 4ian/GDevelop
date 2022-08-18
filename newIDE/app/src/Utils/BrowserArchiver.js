// @flow
import { initializeZipJs } from './Zip.js';
import { checkIfCredentialsRequired } from './CrossOrigin';
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

const addSearchParameterToUrl = (
  url: string,
  urlEncodedParameterName: string,
  urlEncodedValue: string
) => {
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    // blob/data protocol does not support search parameters, which are useless anyway.
    return url;
  }

  const separator = url.indexOf('?') === -1 ? '?' : '&';
  return url + separator + urlEncodedParameterName + '=' + urlEncodedValue;
};

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
      .filter(({ url }) => url.indexOf('.h') === -1) // Should be useless now, still keep it by safety.
      .map(({ url, filePath }) => {
        // To avoid strange/hard to understand CORS issues, we add a dummy parameter.
        // By doing so, we force browser to consider this URL as different than the one traditionally
        // used to render the resource in the editor (usually as an `<img>` or as a background image).
        // If we don't add this distinct parameter, it can happen that browsers fail to load the image
        // as it's already in the **browser cache** but with slightly different request parameters -
        // making the CORS checks fail (even if it's coming from the browser cache).
        //
        // It's happening sometimes (according to loading order probably) in Chrome and (more often)
        // in Safari. It might be linked to Amazon S3 + CloudFront that "doesn't support the Vary: Origin header".
        // To be safe, we entirely avoid the issue with this parameter, making the browsers consider
        // the resources for use in Pixi.js and for the rest of the editor as entirely separate.
        //
        // See:
        // - https://stackoverflow.com/questions/26140487/cross-origin-amazon-s3-not-working-using-chrome
        // - https://stackoverflow.com/questions/20253472/cors-problems-with-amazon-s3-on-the-latest-chomium-and-google-canary
        // - https://stackoverflow.com/a/20299333
        //
        // Search for "cors-cache-workaround" in the codebase for the same workarounds.
        const urlWithParameters = addSearchParameterToUrl(
          url,
          'gdUsage',
          'export'
        );

        return fetch(urlWithParameters, {
          // Include credentials so that resources on GDevelop cloud are properly fetched
          // with the cookie obtained for the project.
          credentials: checkIfCredentialsRequired(urlWithParameters)
            ? // Any resource stored on the GDevelop Cloud buckets needs the "credentials" of the user,
              // i.e: its gdevelop.io cookie, to be passed.
              'include'
            : // For other resources, use "same-origin" as done by default by fetch.
              'same-origin',
        })
          .then(
            response => {
              if (!response.ok) {
                console.error(
                  `Error while downloading "${urlWithParameters}"`,
                  response
                );
                throw new Error(
                  `Error while downloading "${urlWithParameters}" (status: ${
                    response.status
                  })`
                );
              }
              return response.blob();
            },
            error => {
              console.error(
                `Error while downloading "${urlWithParameters}"`,
                error
              );
              throw new Error(
                `Error while downloading "${urlWithParameters}" (network error)`
              );
            }
          )
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
    console.info('All downloads done');
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
  sizeLimit,
}: {|
  textFiles: Array<TextFileDescriptor>,
  blobFiles: Array<BlobFileDescriptor>,
  basePath: string,
  onProgress: (count: number, total: number) => void,
  sizeLimit?: number,
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
                  const fileSize = blob.size;
                  if (sizeLimit && fileSize > sizeLimit) {
                    const roundFileSizeInMb = Math.round(
                      fileSize / (1000 * 1000)
                    );
                    reject(
                      new Error(
                        `Archive is of size ${roundFileSizeInMb} MB, which is above the limit allowed of ${sizeLimit /
                          (1000 * 1000)} MB.`
                      )
                    );
                  }
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
