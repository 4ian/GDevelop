// @flow

const gdjsRoot =
  'https://s3-eu-west-1.amazonaws.com/gdevelop-resources/GDJS-5.0.0-beta81';

type FileSet = 'preview' | 'cordova' | 'electron';

const filesToDownload: { [FileSet]: Array<string> } = {
  preview: ['/Runtime/index.html'],
  cordova: [
    '/Runtime/Cordova/www/index.html',
    '/Runtime/Cordova/config.xml',
    '/Runtime/Cordova/package.json',
  ],
  electron: [
    '/Runtime/index.html',
    '/Runtime/Electron/main.js',
    '/Runtime/Electron/package.json',
  ],
};

export type TextFileDescriptor = {| text: string, filePath: string |};

export const findGDJS = (
  fileSet: FileSet
): Promise<{|
  gdjsRoot: string,
  filesContent: Array<TextFileDescriptor>,
|}> => {
  return Promise.all(
    filesToDownload[fileSet].map(relativeFilePath => {
      const url = gdjsRoot + relativeFilePath;

      // Don't do any caching, rely on the browser cache only.
      return fetch(url).then(response => {
        if (!response.ok) {
          console.error(`Error while downloading "${url}"`, response);
          throw new Error(`Error while downloading "${url}" (status: ${response.status})`);
        }
        return response.text().then(text => ({
          filePath: url,
          text,
        }));
      });
    })
  ).then(filesContent => {
    return {
      gdjsRoot,
      filesContent,
    };
  });
};
