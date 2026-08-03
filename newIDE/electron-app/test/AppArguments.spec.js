const assert = require('assert');

const {
  getElectronAppCommandLineArguments,
} = require('../app/Utils/AppArguments');

const run = () => {
  assert.deepStrictEqual(
    getElectronAppCommandLineArguments(['electron.exe', 'app'], {
      isDev: false,
      isDefaultApp: true,
    }),
    []
  );

  assert.deepStrictEqual(
    getElectronAppCommandLineArguments(
      ['electron.exe', '--force_high_performance_gpu', 'app'],
      {
        isDev: false,
        isDefaultApp: true,
      }
    ),
    []
  );

  assert.deepStrictEqual(
    getElectronAppCommandLineArguments(
      [
        'electron.exe',
        '--force_high_performance_gpu',
        'app',
        'C:\\Projects\\game.json',
      ],
      {
        isDev: false,
        isDefaultApp: true,
      }
    ),
    ['C:\\Projects\\game.json']
  );

  assert.deepStrictEqual(
    getElectronAppCommandLineArguments(
      ['electron.exe', 'app', 'C:\\Projects\\game.json'],
      {
        isDev: false,
        isDefaultApp: true,
      }
    ),
    ['C:\\Projects\\game.json']
  );

  assert.deepStrictEqual(
    getElectronAppCommandLineArguments(
      ['GDevelop.exe', 'C:\\Projects\\game.json'],
      {
        isDev: false,
        isDefaultApp: false,
      }
    ),
    ['C:\\Projects\\game.json']
  );

  assert.deepStrictEqual(
    getElectronAppCommandLineArguments(['GDevelop.exe'], {
      isDev: false,
      isDefaultApp: false,
    }),
    []
  );

  assert.deepStrictEqual(
    getElectronAppCommandLineArguments(
      ['electron.exe', 'app', 'C:\\Projects\\game.json'],
      {
        isDev: true,
        isDefaultApp: false,
      }
    ),
    ['C:\\Projects\\game.json']
  );
};

run();
