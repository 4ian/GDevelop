const getElectronAppCommandLineArguments = (
  processArgv,
  { isDev, isDefaultApp }
) => {
  // When the app is launched with the Electron binary (`electron app`), the
  // app folder is present in argv even if ELECTRON_IS_DEV forces production
  // mode for the renderer. Electron switches can precede that folder, so find
  // the first non-switch argument instead of assuming the folder is argv[1].
  if (isDev || isDefaultApp) {
    const electronAppPathArgumentIndex = processArgv.findIndex(
      (argument, index) => index > 0 && !argument.startsWith('-')
    );
    return electronAppPathArgumentIndex === -1
      ? []
      : processArgv.slice(electronAppPathArgumentIndex + 1);
  }

  return processArgv.slice(1);
};

module.exports = {
  getElectronAppCommandLineArguments,
};
