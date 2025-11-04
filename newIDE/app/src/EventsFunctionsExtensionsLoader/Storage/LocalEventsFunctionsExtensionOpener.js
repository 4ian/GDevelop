// @flow
import { openFilesPicker, readJSONFile } from '../../Utils/FileSystem';
import { type SerializedExtension } from '../../Utils/GDevelopServices/Extension';

export default class LocalEventsFunctionsExtensionOpener {
  static chooseEventsFunctionExtensionFile = (): Promise<Array<string>> => {
    return openFilesPicker({
      title: 'Import an extension in the project',
      properties: ['openFile', 'multiSelections'],
      message: 'Choose an extension file to import (.json file)',
      filters: [
        {
          name: 'GDevelop 5 "events based" extension',
          extensions: ['json'],
        },
      ],
    }).then(filePaths => filePaths);
  };

  static readEventsFunctionExtensionFile = (
    filepath: string
  ): Promise<SerializedExtension> => {
    return readJSONFile(filepath);
  };
}
