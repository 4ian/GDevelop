// @flow

// $FlowFixMe[cannot-resolve-module] Jest runs these filesystem tests in Node.
import fs from 'fs-extra';
// $FlowFixMe[cannot-resolve-module]
import os from 'os';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';
import {
  decomposeLegacyProjectToFiles,
  areLegacyProjectsEquivalent,
} from '../MultiFileProjectFormat';
import {
  hashLegacySource,
  migrateLegacyProject,
  openMultiFileProject,
  readMultiFileSourceTree,
  recoverMultiFileTransactions,
  resolveGameUriToPath,
  writeLegacyProjectAsMultiFile,
  writeMultiFileSourceTree,
} from './LocalMultiFileProject';
import { onOpen } from './LocalProjectOpener';
import { getProjectLocation } from './LocalProjectWriter';

const projectFixture = {
  gdVersion: { major: 5, minor: 6, build: 0, revision: 0 },
  properties: { name: 'Filesystem project', projectUuid: 'id' },
  resources: { resources: [], resourceFolders: [] },
  objects: [],
  objectsFolderStructure: { folderName: '__ROOT', children: [] },
  objectsGroups: [],
  variables: [],
  layouts: [
    {
      name: 'Main',
      mangledName: 'Main',
      title: 'Original',
      r: 0,
      v: 0,
      b: 0,
      uiSettings: {},
      objects: [],
      objectsFolderStructure: { folderName: '__ROOT', children: [] },
      instances: [],
      layers: [],
      variables: [],
      objectsGroups: [],
      behaviorsSharedData: [],
      events: [],
    },
  ],
  externalEvents: [],
  externalLayouts: [],
  eventsFunctionsExtensions: [],
};

describe('Local multi-file project storage', () => {
  let temporaryDirectory;

  beforeEach(() => {
    temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-multifile-')
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

  test('writes, verifies, and opens a source tree', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const changed = await writeMultiFileSourceTree({ entryPath, files });

    expect(changed).toContain('game://project.settings');
    expect(fs.existsSync(entryPath)).toBe(true);
    expect(
      fs.existsSync(path.join(temporaryDirectory, 'scenes/Main/Main.events'))
    ).toBe(true);
    expect(
      areLegacyProjectsEquivalent(
        projectFixture,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
    const sourceTree = await readMultiFileSourceTree(entryPath);
    expect(new Set(Object.keys(sourceTree.files))).toEqual(
      new Set(Object.keys(files))
    );
  });

  test('writes only changed owned components', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    expect(
      await writeLegacyProjectAsMultiFile(projectFixture, entryPath)
    ).toEqual([]);

    const changedProject = JSON.parse(JSON.stringify(projectFixture));
    changedProject.layouts[0].title = 'Changed';
    expect(
      await writeLegacyProjectAsMultiFile(changedProject, entryPath)
    ).toEqual(['game://scenes/Main/scene.settings']);
  });

  test('removes only obsolete files owned by the previous manifest', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    const userFile = path.join(temporaryDirectory, 'scenes/Main/notes.txt');
    fs.writeFileSync(userFile, 'keep me', 'utf8');

    const withoutScene = JSON.parse(JSON.stringify(projectFixture));
    withoutScene.layouts = [];
    const changed = await writeLegacyProjectAsMultiFile(
      withoutScene,
      entryPath
    );

    expect(changed).toEqual(
      expect.arrayContaining([
        'game://scenes/Main/scene.settings',
        'game://scenes/Main/Main.layout',
        'game://scenes/Main/Main.events',
      ])
    );
    expect(
      fs.existsSync(path.join(temporaryDirectory, 'scenes/Main/Main.events'))
    ).toBe(false);
    expect(fs.readFileSync(userFile, 'utf8')).toBe('keep me');
  });

  test('migrates without modifying the original JSON', async () => {
    const legacyPath = path.join(temporaryDirectory, 'game.json');
    const legacySource = `${JSON.stringify(projectFixture, null, 2)}\n`;
    fs.writeFileSync(legacyPath, legacySource, 'utf8');

    const { entryPath } = await migrateLegacyProject({
      legacyPath,
      legacySource,
      legacyProject: projectFixture,
    });

    expect(fs.readFileSync(legacyPath, 'utf8')).toBe(legacySource);
    expect(fs.readFileSync(entryPath, 'utf8')).toContain(
      `sourceSha256 = "${hashLegacySource(legacySource)}"`
    );
    expect(
      areLegacyProjectsEquivalent(
        projectFixture,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
  });

  test('local project opening migrates once and redirects metadata', async () => {
    const legacyPath = path.join(temporaryDirectory, 'game.json');
    const legacySource = `${JSON.stringify(projectFixture, null, 2)}\n`;
    fs.writeFileSync(legacyPath, legacySource, 'utf8');

    const firstResult = await onOpen({ fileIdentifier: legacyPath });
    if (!firstResult.fileMetadata)
      throw new Error('Expected migration metadata.');
    expect(firstResult.fileMetadata.fileIdentifier).toBe(
      path.join(temporaryDirectory, 'project.settings')
    );
    expect(fs.readFileSync(legacyPath, 'utf8')).toBe(legacySource);

    const secondResult = await onOpen({ fileIdentifier: legacyPath });
    if (!secondResult.fileMetadata)
      throw new Error('Expected redirected migration metadata.');
    expect(secondResult.fileMetadata.fileIdentifier).toBe(
      path.join(temporaryDirectory, 'project.settings')
    );
    expect(
      areLegacyProjectsEquivalent(projectFixture, secondResult.content)
    ).toBe(true);

    fs.writeFileSync(legacyPath, `${legacySource} `, 'utf8');
    await expect(onOpen({ fileIdentifier: legacyPath })).rejects.toThrow(
      /diverged/
    );
  });

  test('resolves managed paths inside the project root', () => {
    expect(
      resolveGameUriToPath(temporaryDirectory, 'game://scenes/Main/Main.events')
    ).toBe(path.join(temporaryDirectory, 'scenes/Main/Main.events'));
    expect(() =>
      resolveGameUriToPath(temporaryDirectory, 'game://../escape.events')
    ).toThrow();
  });

  test('uses project.settings as the default local project entry', () => {
    expect(
      getProjectLocation({
        projectName: 'My Game',
        saveAsLocation: null,
        newProjectsDefaultFolder: temporaryDirectory,
      }).fileIdentifier
    ).toBe(path.join(temporaryDirectory, 'My Game', 'project.settings'));
  });

  test('rolls back an interrupted staged transaction', async () => {
    const target = path.join(temporaryDirectory, 'scenes/Main/Main.events');
    fs.ensureDirSync(path.dirname(target));
    fs.writeFileSync(target, 'new content', 'utf8');
    const transactionRoot = path.join(
      temporaryDirectory,
      '.gdevelop/transactions/interrupted'
    );
    const backup = path.join(transactionRoot, 'backup/scenes/Main/Main.events');
    fs.ensureDirSync(path.dirname(backup));
    fs.writeFileSync(backup, 'old content', 'utf8');
    fs.writeFileSync(
      path.join(transactionRoot, 'journal.json'),
      JSON.stringify({
        version: 1,
        state: 'staged',
        changedUris: ['game://scenes/Main/Main.events'],
      }),
      'utf8'
    );

    await recoverMultiFileTransactions(temporaryDirectory);
    expect(fs.readFileSync(target, 'utf8')).toBe('old content');
    expect(fs.existsSync(transactionRoot)).toBe(false);
  });
});
