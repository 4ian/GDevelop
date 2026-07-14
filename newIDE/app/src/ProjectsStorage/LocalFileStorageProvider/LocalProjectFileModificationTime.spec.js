// @flow

// $FlowFixMe[cannot-resolve-module] Jest runs these filesystem tests in Node.
import fs from 'fs-extra';
// $FlowFixMe[cannot-resolve-module]
import os from 'os';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';
import { getLocalProjectLastModifiedDate } from './LocalProjectFileModificationTime';

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
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    writeFileWithModificationTime(entryPath, 100000);
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'static-data.toml'),
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

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(400000);
  });

  it('ignores resources and generated autosaves', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    writeFileWithModificationTime(entryPath, 100000);
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'scenes', 'Main', 'Main.layout'),
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
        'project.settings'
      ),
      500000
    );

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(200000);
  });

  it('ignores Static Data changes', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    writeFileWithModificationTime(entryPath, 100000);
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'scenes', 'Main', 'Main.events'),
      200000
    );
    writeFileWithModificationTime(
      path.join(temporaryDirectory, 'static-data.toml'),
      300000
    );

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(200000);
  });

  it('checks the entry file for a legacy single-file project', async () => {
    const entryPath = path.join(temporaryDirectory, 'game.json');
    writeFileWithModificationTime(entryPath, 600000);

    expect(await getLocalProjectLastModifiedDate(entryPath)).toBe(600000);
  });
});
