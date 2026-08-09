// @flow

// $FlowFixMe[cannot-resolve-module] Jest runs these filesystem tests in Node.
import fs from 'fs-extra';
// $FlowFixMe[cannot-resolve-module]
import os from 'os';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';
import {
  getLocalProjectLastModifiedDate,
  getLocalProjectLastModifiedDateSync,
} from './LocalProjectFileModificationTime';

const writeFileWithModificationTime = (
  filePath: string,
  modificationTime: number
) => {
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, 'test');
  const date = new Date(modificationTime);
  fs.utimesSync(filePath, date, date);
};

describe('getLocalProjectLastModifiedDate', () => {
  let temporaryDirectory;

  beforeEach(() => {
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-project-mtime-')
    );
  });

  afterEach(() => {
    const resolved = path.resolve(temporaryDirectory);
    if (!resolved.startsWith(path.resolve(os.tmpdir()))) {
      throw new Error(
        'Refusing to remove a directory outside the OS temp root.'
      );
    }
    fs.removeSync(resolved);
  });

  it('returns the newest multi-file project definition modification time', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    writeFileWithModificationTime(entryPath, 100000);
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'constants.toml'),
      200000
    );
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'scenes', 'Main', 'Main.events'),
      300000
    );
    writeFileWithModificationTime(
      path.join(temporaryDirectory, '.gdevelop', 'settings-catalog.json'),
      350000
    );
    writeFileWithModificationTime(
      path.join(temporaryDirectory, '.gdevelop', 'layout-catalog.json'),
      400000
    );

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(350000);
  });

  it('ignores resources and generated autosaves', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    writeFileWithModificationTime(entryPath, 100000);
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'scenes', 'Main', 'scene.settings'),
      200000
    );
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'assets', 'external-data.json'),
      400000
    );
    writeFileWithModificationTime(
      path.join(
        temporaryDirectory,
        '.gdevelop',
        'autosave',
        'current',
        'project.gdevelop'
      ),
      500000
    );

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(200000);
  });

  it('ignores Constants changes', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    writeFileWithModificationTime(entryPath, 100000);
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'scenes', 'Main', 'Main.events'),
      200000
    );
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'constants.toml'),
      300000
    );

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(200000);
  });

  it('checks the entry file for a legacy single-file project', async () => {
    const entryPath = path.join(temporaryDirectory, 'game.json');
    writeFileWithModificationTime(entryPath, 600000);

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(600000);
  });

  it('can scan without relying on asynchronous filesystem callbacks', () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    writeFileWithModificationTime(entryPath, 100000);
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'scenes', 'Main', 'Main.events'),
      700000
    );
    const statSpy = jest
      .spyOn(fs, 'stat')
      .mockImplementation(() => new Promise(() => {}));
    const readdirSpy = jest
      .spyOn(fs, 'readdir')
      .mockImplementation(() => new Promise(() => {}));

    try {
      expect(getLocalProjectLastModifiedDateSync(entryPath)).toBe(700000);
      expect(statSpy).not.toHaveBeenCalled();
      expect(readdirSpy).not.toHaveBeenCalled();
    } finally {
      statSpy.mockRestore();
      readdirSpy.mockRestore();
    }
  });
});
