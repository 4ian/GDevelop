// @flow
import { type SerializedExtension } from '../../Utils/GDevelopServices/Extension';

export type EventsFunctionsExtensionOpener = {
  chooseEventsFunctionExtensionFile: () => Promise<Array<any>>,
  readEventsFunctionExtensionFile: (
    filepath: any
  ) => Promise<SerializedExtension>,
};

export type EventsFunctionsExtensionWriter = {
  chooseEventsFunctionExtensionFile: (
    extensionName?: string
  ) => Promise<?string>,
  writeSerializedObject: (
    serializedObject: Object,
    filepath: string
  ) => Promise<void>,
};
