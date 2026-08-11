// @flow

import { initializeZipJs } from '.';

export const unzipTextFilesFromBlob = async (
  zippedBlob: Blob
): Promise<{ [string]: string }> => {
  const zipJs: ZipJs = await initializeZipJs();

  return new Promise<{ [string]: string }>((resolve, reject) => {
    zipJs.createReader(
      // $FlowFixMe[invalid-constructor]
      new zipJs.BlobReader(zippedBlob),
      zipReader => {
        zipReader.getEntries(entries => {
          const textEntries: Array<Promise<[string, string]>> = entries
            .filter(entry => !entry.directory)
            .map(
              entry =>
                new Promise<[string, string]>(resolveEntry => {
                  // $FlowFixMe[invalid-constructor]
                  entry.getData(new zipJs.TextWriter(), (result: string) => {
                    resolveEntry([entry.filename, result]);
                  });
                })
            );
          Promise.all(textEntries).then((results: Array<[string, string]>) => {
            const files: { [string]: string } = {};
            results.forEach(([filename, content]) => {
              files[filename] = content;
            });
            resolve(files);
          }, reject);
        });
      },
      error => {
        console.error('An error occurred when unzipping blob', error);
        reject(error);
      }
    );
  });
};

export const unzipFirstEntryOfBlob = async (
  zippedBlob: Blob
): Promise<string> => {
  const files = await unzipTextFilesFromBlob(zippedBlob);
  const firstFileName = Object.keys(files)[0];
  if (!firstFileName) throw new Error('The archive contains no text file.');
  return files[firstFileName];
};

export const createZipWithTextFiles = async (textFiles: {
  [string]: string,
}): Promise<Blob> => {
  const zipJs: ZipJs = await initializeZipJs();
  const fileNames = Object.keys(textFiles);

  return new Promise<Blob>((resolve, reject) => {
    zipJs.createWriter(
      // $FlowFixMe[invalid-constructor]
      new zipJs.BlobWriter('application/zip'),
      zipWriter => {
        const addNextFile = (index: number): void => {
          if (index >= fileNames.length) {
            zipWriter.close(blob => {
              resolve(blob);
            });
            return;
          }
          const fileName = fileNames[index];
          // $FlowFixMe[invalid-constructor]
          const textReader = new zipJs.TextReader(textFiles[fileName]);
          zipWriter.add(fileName, textReader, () => addNextFile(index + 1));
        };
        addNextFile(0);
      },
      error => {
        console.error('An error occurred when zipping content', error);
        reject(error);
      }
    );
  });
};

export const createZipWithSingleTextFile = async (
  textFileContent: string,
  fileName: string = 'file.txt'
): Promise<Blob> =>
  createZipWithTextFiles({
    [fileName]: textFileContent,
  });
