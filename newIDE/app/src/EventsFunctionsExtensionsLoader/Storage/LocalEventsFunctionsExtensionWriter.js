// @flow
import { serializeToJSObject } from '../../Utils/Serializer';
import optionalRequire from '../../Utils/OptionalRequire';
const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

const writeJSONFile = (object: Object, filepath: string): Promise<void> => {
  if (!fs) return Promise.reject(new Error('Filesystem is not supported.'));

  try {
    const content = JSON.stringify(object, null, 2);
    return fs.ensureDir(path.dirname(filepath)).then(
      () =>
        new Promise((resolve, reject) => {
          fs.writeFile(filepath, content, (err: ?Error) => {
            if (err) {
              return reject(err);
            }

            return resolve();
          });
        })
    );
  } catch (stringifyException) {
    return Promise.reject(stringifyException);
  }
};

export default class LocalEventsFunctionsExtensionWriter {
  static chooseEventsFunctionExtensionFile = (
    extensionName?: string
  ): Promise<?string> => {
    if (!dialog) return Promise.reject('Not supported');
    const browserWindow = remote.getCurrentWindow();

    return dialog
      .showSaveDialog(browserWindow, {
        title: 'Export an extension of the project',
        filters: [
          {
            name: 'GDevelop 5 "events based" extension',
            extensions: ['json'],
          },
        ],
        defaultPath: extensionName || 'Extension.json',
      })
      .then(({ filePath }) => {
        if (!filePath) return null;
        return filePath;
      });
  };

  static writeEventsFunctionsExtension = (
    extension: gdEventsFunctionsExtension,
    filepath: string
  ): Promise<void> => {
    const serializedObject = serializeToJSObject(extension);
    return writeJSONFile(serializedObject, filepath).catch(err => {
      console.error('Unable to write the events function extension:', err);
      throw err;
    });
  };
}
