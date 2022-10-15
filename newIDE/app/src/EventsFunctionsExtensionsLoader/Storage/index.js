// @flow

export type EventsFunctionsExtensionOpener = {
  chooseEventsFunctionExtensionFile: () => Promise<?string>,
  readEventsFunctionExtensionFile: (filepath: string) => Promise<Object>,
};

export type EventsFunctionsExtensionWriter = {
  chooseEventsFunctionExtensionFile: (
    extensionName?: string
  ) => Promise<?string>,
  writeEventsFunctionsExtension: (
    extension: gdEventsFunctionsExtension,
    filepath: string
  ) => Promise<void>,
};
