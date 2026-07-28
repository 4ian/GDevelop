// @flow

describe('NpmScriptExecutor', () => {
  afterEach(() => {
    delete (global: any).require;
    jest.resetModules();
  });

  it('requests dependency installation and dist opening for a binary build', () => {
    const send = jest.fn<[string, Object], void>();
    (global: any).require = (moduleName: string) => {
      if (moduleName === 'electron') {
        return { ipcRenderer: { send } };
      }
      throw new Error(`Unexpected module: ${moduleName}`);
    };

    const { runNpmScript } = require('./NpmScriptExecutor');
    expect(
      runNpmScript('C:\\Exports\\My game', {
        script: 'build',
        installDependencies: true,
        openFolderAfterSuccess: 'dist',
      })
    ).toBe(true);
    expect(send).toHaveBeenCalledWith('run-npm-script', {
      projectPath: 'C:\\Exports\\My game',
      npmScript: 'build',
      keepTerminalOpen: false,
      installDependencies: true,
      openFolderAfterSuccess: 'dist',
    });
  });
});
