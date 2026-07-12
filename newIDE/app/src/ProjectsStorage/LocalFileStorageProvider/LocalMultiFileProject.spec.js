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
import {
  GENERATED_LEGACY_PROJECT_RELATIVE_PATH,
  getProjectLocation,
  onSaveProject,
  writeProjectInstructionCatalog,
} from './LocalProjectWriter';
import { ensureProjectHasDefaultScene } from '../../ProjectCreation/CreateProject';

const projectFixture = {
  gdVersion: { major: 5, minor: 6, build: 0, revision: 0 },
  properties: { name: 'Filesystem project', projectUuid: 'id' },
  resources: { resources: [], resourceFolders: [] },
  objects: [],
  objectsFolderStructure: { folderName: '__ROOT', children: [] },
  objectsGroups: [],
  variables: [],
  globalConfig: {},
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
      fs.existsSync(path.join(temporaryDirectory, 'resources.settings'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(temporaryDirectory, 'config.settings'))
    ).toBe(true);
    expect(fs.readFileSync(entryPath, 'utf8')).not.toContain(
      '[project.resources'
    );
    expect(fs.readFileSync(entryPath, 'utf8')).not.toContain(
      '[project.globalConfig'
    );
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

  test('loads named IfDo instructions through the generated catalog', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files['game://scenes/Main/Main.events'] =
      '@event\ndo Network::Send url="\\"https://example.com\\"" runtime=""\n';
    await writeMultiFileSourceTree({ entryPath, files });
    const catalog = {
      format: 'gdevelop-ifdo-instruction-catalog',
      formatVersion: 1,
      actions: [
        {
          kind: 'action',
          type: 'Network::Send',
          parameters: [
            {
              dslName: 'url',
              isOptional: false,
              isCodeOnly: false,
            },
            {
              dslName: 'runtime',
              isOptional: false,
              isCodeOnly: true,
            },
          ],
        },
      ],
      conditions: [],
      expressions: [],
    };
    const catalogPath = path.join(
      temporaryDirectory,
      '.gdevelop/instructions-catalog.json'
    );
    fs.ensureDirSync(path.dirname(catalogPath));
    fs.writeFileSync(catalogPath, JSON.stringify(catalog), 'utf8');

    const project = await openMultiFileProject(entryPath);
    expect(project.layouts[0].events[0].actions[0]).toMatchObject({
      type: { value: 'Network::Send' },
      parameters: ['"https://example.com"', ''],
    });
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

    const changedObjectProject = JSON.parse(JSON.stringify(changedProject));
    changedObjectProject.layouts[0].objects.push({
      name: 'Player',
      type: 'Sprite',
      behaviors: [
        {
          name: 'PlatformerObject',
          type: 'PlatformBehavior::PlatformerObjectBehavior',
        },
      ],
    });
    expect(
      await writeLegacyProjectAsMultiFile(changedObjectProject, entryPath)
    ).toEqual(['game://scenes/Main/scene.settings']);

    const changedInstanceProject = JSON.parse(
      JSON.stringify(changedObjectProject)
    );
    changedInstanceProject.layouts[0].layers = [{ name: '' }];
    changedInstanceProject.layouts[0].instances.push({
      name: 'Player',
      persistentUuid: '00000000-0000-4000-8000-000000000001',
      x: 100,
      y: 200,
      angle: 0,
      layer: '',
      zOrder: 1,
      customSize: false,
      width: 0,
      height: 0,
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
    });
    expect(
      await writeLegacyProjectAsMultiFile(changedInstanceProject, entryPath)
    ).toEqual(['game://scenes/Main/Main.layout']);

    const changedResourcesProject = JSON.parse(
      JSON.stringify(changedInstanceProject)
    );
    changedResourcesProject.resources.resources.push({
      file: 'assets/New.png',
      kind: 'image',
      metadata: '',
      name: 'New.png',
      smoothed: true,
      userAdded: true,
    });
    expect(
      await writeLegacyProjectAsMultiFile(changedResourcesProject, entryPath)
    ).toEqual(['game://resources.settings']);

    const changedConfigProject = JSON.parse(
      JSON.stringify(changedResourcesProject)
    );
    changedConfigProject.globalConfig.newSetting = true;
    expect(
      await writeLegacyProjectAsMultiFile(changedConfigProject, entryPath)
    ).toEqual(['game://config.settings']);

    const withoutConfigProject = JSON.parse(
      JSON.stringify(changedConfigProject)
    );
    delete withoutConfigProject.globalConfig;
    expect(
      await writeLegacyProjectAsMultiFile(withoutConfigProject, entryPath)
    ).toEqual(['game://config.settings']);
    expect(
      fs.existsSync(path.join(temporaryDirectory, 'config.settings'))
    ).toBe(false);
  });

  test('routes prefab definition and instance edits to their owning files', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.eventsFunctionsExtensions = [
      {
        name: 'Local',
        eventsFunctions: [],
        eventsBasedBehaviors: [],
        eventsBasedObjects: [
          {
            name: 'Widget',
            areaMinX: 0,
            areaMinY: 0,
            areaMinZ: 0,
            areaMaxX: 64,
            areaMaxY: 64,
            areaMaxZ: 64,
            objects: [],
            objectsFolderStructure: {
              folderName: '__ROOT',
              children: [],
            },
            objectsGroups: [],
            layers: [],
            instances: [],
            editionSettings: {},
            eventsFunctions: [],
            variants: [],
          },
        ],
      },
    ];
    await writeLegacyProjectAsMultiFile(project, entryPath);

    const changedDefinition = JSON.parse(JSON.stringify(project));
    changedDefinition.eventsFunctionsExtensions[0].eventsBasedObjects[0].objects.push(
      {
        name: 'Body',
        type: 'Sprite',
        behaviors: [{ name: 'Tween', type: 'Tween::TweenBehavior' }],
      }
    );
    expect(
      await writeLegacyProjectAsMultiFile(changedDefinition, entryPath)
    ).toEqual([
      'game://extensions/Local/prefabs/Widget/prefab.settings',
    ]);

    const changedInstance = JSON.parse(JSON.stringify(changedDefinition));
    changedInstance.eventsFunctionsExtensions[0].eventsBasedObjects[0].layers = [
      { name: '' },
    ];
    changedInstance.eventsFunctionsExtensions[0].eventsBasedObjects[0].instances.push(
      {
        name: 'Body',
        persistentUuid: '00000000-0000-4000-8000-000000000002',
        x: 0,
        y: 0,
        angle: 0,
        layer: '',
        zOrder: 0,
        customSize: false,
        width: 0,
        height: 0,
        numberProperties: [],
        stringProperties: [],
        initialVariables: [],
      }
    );
    expect(
      await writeLegacyProjectAsMultiFile(changedInstance, entryPath)
    ).toEqual(['game://extensions/Local/prefabs/Widget/Widget.layout']);
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
    expect(fs.existsSync(path.dirname(userFile))).toBe(true);
  });

  test('renames all files owned by extension components and removes empty old folders', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.settings');
    const makeFunction = (name: string) => ({
      name,
      functionType: 'Action',
      fullName: name,
      description: '',
      sentence: '',
      group: '',
      private: false,
      async: false,
      parameters: [],
      objectGroups: [],
      events: [],
    });
    let project = JSON.parse(JSON.stringify(projectFixture));
    project.eventsFunctionsExtensions = [
      {
        name: 'Combat',
        fullName: 'Combat',
        eventsFunctionsFolderStructure: {
          folderName: '__ROOT',
          children: [],
        },
        eventsFunctions: [makeFunction('CalculateDamage')],
        eventsBasedObjects: [
          {
            name: 'Enemy',
            fullName: 'Enemy',
            objects: [],
            objectsFolderStructure: {
              folderName: '__ROOT',
              children: [],
            },
            objectsGroups: [],
            areaMinX: 0,
            areaMinY: 0,
            areaMinZ: 0,
            areaMaxX: 64,
            areaMaxY: 64,
            areaMaxZ: 0,
            layers: [],
            instances: [],
            editionSettings: {},
            eventsFunctions: [makeFunction('TakeDamage')],
            variants: [],
          },
        ],
        eventsBasedBehaviors: [
          {
            name: 'Health',
            fullName: 'Health',
            eventsFunctions: [makeFunction('Heal')],
          },
        ],
      },
    ];
    const exists = (relativePath: string) =>
      fs.existsSync(path.join(temporaryDirectory, ...relativePath.split('/')));

    await writeLegacyProjectAsMultiFile(project, entryPath);

    let renamed = JSON.parse(JSON.stringify(project));
    renamed.eventsFunctionsExtensions[0].eventsFunctions[0].name =
      'ComputeDamage';
    await writeLegacyProjectAsMultiFile(renamed, entryPath);
    expect(exists('extensions/Combat/functions/CalculateDamage')).toBe(false);
    expect(
      exists('extensions/Combat/functions/ComputeDamage/function.settings')
    ).toBe(true);
    expect(
      exists('extensions/Combat/functions/ComputeDamage/ComputeDamage.events')
    ).toBe(true);
    project = renamed;

    renamed = JSON.parse(JSON.stringify(project));
    const renamedPrefab =
      renamed.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    renamedPrefab.name = 'Boss';
    renamedPrefab.eventsFunctions[0].name = 'ReceiveDamage';
    await writeLegacyProjectAsMultiFile(renamed, entryPath);
    expect(exists('extensions/Combat/prefabs/Enemy')).toBe(false);
    expect(exists('extensions/Combat/prefabs/Boss/prefab.settings')).toBe(true);
    expect(exists('extensions/Combat/prefabs/Boss/Boss.layout')).toBe(true);
    expect(exists('extensions/Combat/prefabs/Boss/ReceiveDamage.events')).toBe(
      true
    );
    const prefabSettings = fs.readFileSync(
      path.join(
        temporaryDirectory,
        'extensions/Combat/prefabs/Boss/prefab.settings'
      ),
      'utf8'
    );
    expect(prefabSettings).toContain(
      'layout = "game://extensions/Combat/prefabs/Boss/Boss.layout"'
    );
    expect(prefabSettings).toContain(
      'events = "game://extensions/Combat/prefabs/Boss/ReceiveDamage.events"'
    );
    project = renamed;

    renamed = JSON.parse(JSON.stringify(project));
    const renamedBehavior =
      renamed.eventsFunctionsExtensions[0].eventsBasedBehaviors[0];
    renamedBehavior.name = 'Vitality';
    renamedBehavior.eventsFunctions[0].name = 'Restore';
    await writeLegacyProjectAsMultiFile(renamed, entryPath);
    expect(exists('extensions/Combat/behaviors/Health')).toBe(false);
    expect(
      exists('extensions/Combat/behaviors/Vitality/behavior.settings')
    ).toBe(true);
    expect(exists('extensions/Combat/behaviors/Vitality/Restore.events')).toBe(
      true
    );
    project = renamed;

    renamed = JSON.parse(JSON.stringify(project));
    renamed.eventsFunctionsExtensions[0].name = 'Battle';
    await writeLegacyProjectAsMultiFile(renamed, entryPath);
    expect(exists('extensions/Combat')).toBe(false);
    expect(exists('extensions/Battle/extension.settings')).toBe(true);
    expect(
      exists('extensions/Battle/functions/ComputeDamage/ComputeDamage.events')
    ).toBe(true);
    expect(exists('extensions/Battle/prefabs/Boss/Boss.layout')).toBe(true);
    expect(exists('extensions/Battle/behaviors/Vitality/Restore.events')).toBe(
      true
    );
    expect(
      areLegacyProjectsEquivalent(
        renamed,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
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
      areLegacyProjectsEquivalent(firstResult.content, secondResult.content)
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

  test('writes the complete AI instruction catalog in .gdevelop', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    const catalog = await writeProjectInstructionCatalog(
      project,
      temporaryDirectory
    );
    const catalogPath = path.join(
      temporaryDirectory,
      '.gdevelop/instructions-catalog.json'
    );

    expect(fs.existsSync(catalogPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(catalogPath, 'utf8')).counts).toEqual(
      catalog.counts
    );
    expect(catalog.counts.actions).toBeGreaterThan(100);
    expect(catalog.counts.conditions).toBeGreaterThan(100);
    expect(catalog.counts.expressions).toBeGreaterThan(100);
    project.delete();
  });

  test('writes the generated legacy game.json on every multi-file save', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Generated compatibility project');
    const entryPath = path.join(temporaryDirectory, 'project.settings');

    await onSaveProject(
      project,
      ({
        fileIdentifier: entryPath,
        name: project.getName(),
        gameId: project.getProjectUuid(),
        lastModifiedDate: 0,
      }: any),
      undefined,
      {
        showAlert: jest.fn(),
        showConfirmation: jest.fn(),
      }
    );

    const generatedPath = path.join(
      temporaryDirectory,
      ...GENERATED_LEGACY_PROJECT_RELATIVE_PATH.split('/')
    );
    expect(fs.existsSync(generatedPath)).toBe(true);
    expect(
      JSON.parse(fs.readFileSync(generatedPath, 'utf8')).properties.name
    ).toBe('Generated compatibility project');
    project.delete();
  });

  test('writes the default scene sources on the first project save', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('New game');
    ensureProjectHasDefaultScene(project);

    await onSaveProject(
      project,
      ({
        fileIdentifier: path.join(temporaryDirectory, 'project.settings'),
        name: project.getName(),
        gameId: project.getProjectUuid(),
        lastModifiedDate: 0,
      }: any),
      undefined,
      {
        showAlert: jest.fn(),
        showConfirmation: jest.fn(),
      }
    );

    const sceneDirectory = path.join(
      temporaryDirectory,
      'scenes',
      'UntitledScene'
    );
    expect(fs.existsSync(path.join(sceneDirectory, 'scene.settings'))).toBe(
      true
    );
    expect(
      fs.existsSync(path.join(sceneDirectory, 'UntitledScene.layout'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(sceneDirectory, 'UntitledScene.events'))
    ).toBe(true);
    project.delete();
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
