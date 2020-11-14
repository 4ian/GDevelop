import path from 'path';

const mockElectron = {
  ipcRenderer: {
    invoke: jest.fn(),
  },
};
const mockFsExtra = {
  ensureDir: jest.fn(),
  existsSync: jest.fn(),
};

const mockOptionalRequire = jest.fn(
  (
    moduleName,
    config = {
      rethrowException: false,
    }
  ) => {
    if (moduleName === 'electron') {
      return mockElectron;
    }
    if (moduleName === 'fs-extra') {
      return mockFsExtra;
    }
    if (moduleName === 'path') {
      return path;
    }

    throw new Error(
      `The mock of optionalRequire does not support module with name: ${moduleName}. Please edit the mock to add it.`
    );
  }
);

mockOptionalRequire.mockElectron = mockElectron;
mockOptionalRequire.mockFsExtra = mockFsExtra;

module.exports = mockOptionalRequire;
