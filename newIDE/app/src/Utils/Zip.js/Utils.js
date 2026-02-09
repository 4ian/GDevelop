// @flow

import { initializeZipJs } from '.';

export const unzipFirstEntryOfBlob = async (
  zippedBlob: Blob
): Promise<string> => {
  const zipJs: ZipJs = await initializeZipJs();

  return new Promise((resolve, reject) => {
    zipJs.createReader(
      // $FlowFixMe[invalid-constructor]
      new zipJs.BlobReader(zippedBlob),
      zipReader => {
        zipReader.getEntries(entries => {
          // $FlowFixMe[invalid-constructor]
          entries[0].getData(new zipJs.TextWriter(), result => {
            resolve(result);
          });
        });
      },
      error => {
        console.error('An error occurred when unzipping blob', error);
        reject(error);
      }
    );
  });
};

export const createZipWithSingleTextFile = async (
  textFileContent: string,
  fileName: string = 'file.txt'
): Promise<Blob> => {
  const zipJs: ZipJs = await initializeZipJs();
  // $FlowFixMe[invalid-constructor]
  const textReader = new zipJs.TextReader(textFileContent);

  return new Promise((resolve, reject) => {
    zipJs.createWriter(
      // $FlowFixMe[invalid-constructor]
      new zipJs.BlobWriter('application/zip'),
      zipWriter => {
        zipWriter.add(fileName, textReader, () => {
          zipWriter.close(blob => {
            resolve(blob);
          });
        });
      },
      error => {
        console.error('An error occurred when zipping content', error);
        reject(error);
      }
    );
  });
};
