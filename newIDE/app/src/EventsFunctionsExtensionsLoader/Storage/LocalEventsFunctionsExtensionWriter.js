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

  static chooseCustomObjectFile = (objectName?: string): Promise<?string> => {
    if (!dialog) return Promise.reject('Not supported');
    const browserWindow = remote.getCurrentWindow();

    return dialog
      .showSaveDialog(browserWindow, {
        title: 'Export an object of the project',
        filters: [
          {
            name: 'GDevelop 5 object configuration',
            extensions: ['gdo'],
          },
        ],
        defaultPath: objectName || 'Object',
      })
      .then(({ filePath }) => {
        if (!filePath) return null;
        return filePath;
      });
  };

  static writeCustomObject = (
    customObject: gdObject,
    filepath: string
  ): Promise<void> => {
    // TODO Fix the memory crash
    // I think the clone method is bugged, it doesn't keep the Configuration.
    const exportedObject = customObject.clone().get();
    exportedObject.setTags('');
    exportedObject.getVariables().clear();
    exportedObject.getEffects().clear();
    exportedObject
      .getAllBehaviorNames()
      .toJSArray()
      .forEach(name => exportedObject.removeBehavior(name));
    const serializedObject = serializeToJSObject(exportedObject);
    return writeJSONFile(serializedObject, filepath).catch(err => {
      console.error('Unable to write the object:', err);
      throw err;
    });
  };
}
