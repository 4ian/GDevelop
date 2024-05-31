// @flow
import { openFilePicker, readJSONFile } from '../../Utils/FileSystem';

export default class LocalEventsFunctionsExtensionOpener {
  static chooseEventsFunctionExtensionFile = (): Promise<?string> => {
    return openFilePicker({
      title: 'Import an extension in the project',
      properties: ['openFile'],
      message: 'Choose an extension file to import (.json file)',
      filters: [
        {
          name: 'GDevelop 5 "events based" extension',
          extensions: ['json'],
        },
      ],
    }).then(filePath => filePath);
  };

  static readEventsFunctionExtensionFile = (
    filepath: string
  ): Promise<Object> => {
    return readJSONFile(filepath);
  };
}
