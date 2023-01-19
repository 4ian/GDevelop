// @flow

export type EventsFunctionsExtensionOpener = {
  chooseEventsFunctionExtensionFile: () => Promise<?any>,
  readEventsFunctionExtensionFile: (filepath: any) => Promise<Object>,
};

export type EventsFunctionsExtensionWriter = {
  chooseEventsFunctionExtensionFile: (
    extensionName?: string
  ) => Promise<?string>,
  writeEventsFunctionsExtension: (
    extension: gdEventsFunctionsExtension,
    filepath: string
  ) => Promise<void>,
  chooseObjectAssetFile: (objectName?: string) => Promise<?string>,
  writeObjectsAssets: (
    project: gdProject,
    exportedObjects: gdObject[],
    filepath: string
  ) => Promise<void>,
};
