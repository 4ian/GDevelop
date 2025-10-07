// @flow
import Window from '../Utils/Window';
import { getIDEVersion, getIDEVersionWithHash } from '../Version';

type FileSet =
  | 'preview'
  | 'cordova'
  | 'electron'
  | 'web'
  | 'cocos2d-js'
  | 'facebook-instant-games';

const filesToDownload: { [FileSet]: Array<string> } = {
  preview: ['/Runtime/index.html'],
  web: ['/Runtime/index.html', '/Runtime/Electron/LICENSE.GDevelop.txt'],
  'cocos2d-js': [
    '/Runtime/Cocos2d/cocos2d-js-v3.10.js',
    '/Runtime/Cocos2d/index.html',
    '/Runtime/Cocos2d/main.js',
    '/Runtime/Cocos2d/project.json',
  ],
  'facebook-instant-games': [
    '/Runtime/FacebookInstantGames/fbapp-config.json',
    '/Runtime/FacebookInstantGames/index.html',
  ],
  cordova: [
    '/Runtime/Cordova/www/index.html',
    '/Runtime/Cordova/www/LICENSE.GDevelop.txt',
    '/Runtime/Cordova/config.xml',
    '/Runtime/Cordova/package.json',
  ],
  electron: [
    '/Runtime/index.html',
    '/Runtime/Electron/main.js',
    '/Runtime/Electron/package.json',
    '/Runtime/Electron/LICENSE.GDevelop.txt',
  ],
};

export type TextFileDescriptor = {| text: string, filePath: string |};

export const findGDJS = (
  fileSet: FileSet
): Promise<{|
  gdjsRoot: string,
  filesContent: Array<TextFileDescriptor>,
|}> => {
  // Get GDJS for this version. If you updated the version,
  // run `newIDE/web-app/scripts/deploy-GDJS-Runtime` script.
  let gdjsRoot = `https://resources.gdevelop-app.com/GDJS-${getIDEVersionWithHash()}`;

  if (Window.isDev()) {
    gdjsRoot = `http://localhost:5002`;
  }

  return Promise.all(
    filesToDownload[fileSet].map(relativeFilePath => {
      const url = gdjsRoot + relativeFilePath;

      // Don't do any caching, rely on the browser cache only.
      return fetch(url).then(response => {
        if (!response.ok) {
          console.error(`Error while downloading "${url}"`, response);
          throw new Error(
            `Error while downloading "${url}" (status: ${response.status})`
          );
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
