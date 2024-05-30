// @flow
import { readJSONFile } from '../../Utils/FileSystem';
import optionalRequire from '../../Utils/OptionalRequire';
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

export default class LocalEventsFunctionsExtensionOpener {
  static chooseEventsFunctionExtensionFile = (): Promise<?string> => {
    if (!dialog) return Promise.reject('Not supported');
    const browserWindow = remote.getCurrentWindow();

    return dialog
      .showOpenDialog(browserWindow, {
        title: 'Import an extension in the project',
        properties: ['openFile'],
        message: 'Choose an extension file to import (.json file)',
        filters: [
          {
            name: 'GDevelop 5 "events based" extension',
            extensions: ['json'],
          },
        ],
      })
      .then(({ filePaths }) => {
        if (!filePaths || !filePaths.length) return null;
        return filePaths[0];
      });
  };

  static readEventsFunctionExtensionFile = (
    filepath: string
  ): Promise<Object> => {
    return readJSONFile(filepath);
  };
}
