// @flow

// $FlowFixMe[cannot-resolve-module] Jest runs these filesystem tests in Node.
import fs from 'fs-extra';
// $FlowFixMe[cannot-resolve-module]
import os from 'os';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';
import {
  MULTI_FILE_CONSTANTS_URI,
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
  onAutoSaveConstants,
  onSaveProject,
  writeProjectInstructionCatalog,
  writeProjectSettingsCatalog,
  writeProjectSourceCatalogs,
} from './LocalProjectWriter';
import { ensureProjectHasDefaultScene } from '../../ProjectCreation/CreateProject';
import { insertNewEventsBasedBehavior } from '../../EventsFunctionsList/CreateEventsBasedBehavior';
import { reloadProjectEventsFunctionsExtensionMetadata } from '../../EventsFunctionsExtensionsLoader';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';

const projectFixture = {
  gdVersion: { major: 5, minor: 6, build: 0, revision: 0 },
  properties: { name: 'Filesystem project', projectUuid: 'id' },
  resources: { resources: [], resourceFolders: [] },
  objects: [],
  objectsFolderStructure: { folderName: '__ROOT', children: [] },
  objectsGroups: [],
  variables: [],
  constants: {},
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

  test('rejects a noncanonical .gdevelop entry name', async () => {
    await expect(
      readMultiFileSourceTree(
        path.join(temporaryDirectory, 'OtherName.gdevelop')
      )
    ).rejects.toMatchObject({
      code: 'MULTIFILE_INVALID_ENTRY',
      message: 'The multi-file entry must be named project.gdevelop.',
    });
  });

  test('writes, verifies, and opens a source tree', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const changed = await writeMultiFileSourceTree({ entryPath, files });

    expect(changed).toContain('game://project.gdevelop');
    expect(fs.existsSync(entryPath)).toBe(true);
    expect(
      fs.existsSync(path.join(temporaryDirectory, 'resources.settings'))
    ).toBe(true);
    expect(fs.existsSync(path.join(temporaryDirectory, 'constants.toml'))).toBe(
      true
    );
    expect(fs.readFileSync(entryPath, 'utf8')).not.toContain(
      '[project.resources'
    );
    expect(fs.readFileSync(entryPath, 'utf8')).not.toContain(
      '[project.constants'
    );
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'scenes/Main/functions/sceneUpdate.events'
        )
      )
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

  test('discovers only fixed managed settings boundaries', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    const unrelatedSettingsPath = path.join(
      temporaryDirectory,
      'scenes/Main/notes/tool.settings'
    );
    fs.ensureDirSync(path.dirname(unrelatedSettingsPath));
    fs.writeFileSync(unrelatedSettingsPath, 'not valid TOML', 'utf8');

    const sourceTree = await readMultiFileSourceTree(entryPath);

    expect(Object.keys(sourceTree.files)).not.toContain(
      'game://scenes/Main/notes/tool.settings'
    );
    expect(
      areLegacyProjectsEquivalent(
        projectFixture,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
  });

  test('reports a missing same-stem function body as a managed source error', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    fs.unlinkSync(
      path.join(temporaryDirectory, 'scenes/Main/functions/sceneUpdate.events')
    );

    await expect(readMultiFileSourceTree(entryPath)).rejects.toMatchObject({
      code: 'MULTIFILE_MISSING_FILE',
    });
  });

  test('discovers and rejects canonical retired layout and function sources', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    fs.writeFileSync(
      path.join(temporaryDirectory, 'scenes/Main/Main.layout'),
      '[layout]\nversion = 1\n',
      'utf8'
    );

    await expect(openMultiFileProject(entryPath)).rejects.toMatchObject({
      code: 'MULTIFILE_RETIRED_LAYOUT_SOURCE',
    });

    fs.unlinkSync(path.join(temporaryDirectory, 'scenes/Main/Main.layout'));
    const retiredFunctionDirectory = path.join(
      temporaryDirectory,
      'scenes/Main/functions/sceneUpdate'
    );
    fs.ensureDirSync(retiredFunctionDirectory);
    fs.copyFileSync(
      path.join(
        temporaryDirectory,
        'scenes/Main/functions/sceneUpdate.settings'
      ),
      path.join(retiredFunctionDirectory, 'function.settings')
    );

    await expect(openMultiFileProject(entryPath)).rejects.toMatchObject({
      code: 'MULTIFILE_RETIRED_FUNCTION_SOURCE',
    });
  });

  test('stores external sources below their owning scene folder', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.externalEvents = [
      { name: 'Shared Combat', associatedLayout: 'Main', events: [] },
    ];
    project.externalLayouts = [
      {
        name: 'Shared Combat',
        associatedLayout: 'Main',
        instances: [],
        editionSettings: {},
      },
    ];

    await writeLegacyProjectAsMultiFile(project, entryPath);

    const sceneSettingsPath = path.join(
      temporaryDirectory,
      'scenes/Main/scene.settings'
    );
    const sceneSettings = fs.readFileSync(sceneSettingsPath, 'utf8');
    expect(sceneSettings).not.toContain('externalEventFiles');
    expect(sceneSettings).not.toContain('externalLayoutFiles');
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'scenes/Main/external-events/Shared Combat/external-events.settings'
        )
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'scenes/Main/external-events/Shared Combat/functions/sceneUpdate.events'
        )
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'scenes/Main/external-layout/Shared Combat.settings'
        )
      )
    ).toBe(true);
    expect(fs.existsSync(path.join(temporaryDirectory, 'externals'))).toBe(
      false
    );
    expect(
      areLegacyProjectsEquivalent(
        project,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
  });

  test('rejects an events body without a same-stem function settings file', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    const orphanEventsPath = path.join(
      temporaryDirectory,
      'scenes/Main/functions/orphan.events'
    );
    fs.writeFileSync(orphanEventsPath, '', 'utf8');

    await expect(openMultiFileProject(entryPath)).rejects.toMatchObject({
      code: 'MULTIFILE_ORPHAN_EVENTS',
    });
  });

  test('removes the retired combined external directory on the next save', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.externalEvents = [
      { name: 'Shared Combat', associatedLayout: 'Main', events: [] },
    ];
    project.externalLayouts = [
      {
        name: 'Shared Combat',
        associatedLayout: 'Main',
        instances: [],
        editionSettings: {},
      },
    ];
    await writeLegacyProjectAsMultiFile(project, entryPath);

    const sceneRoot = path.join(temporaryDirectory, 'scenes/Main');
    const retiredOwnerRoot = path.join(sceneRoot, 'externals/Shared Combat');
    fs.ensureDirSync(path.dirname(retiredOwnerRoot));
    fs.moveSync(
      path.join(sceneRoot, 'external-events/Shared Combat'),
      retiredOwnerRoot,
      { overwrite: true }
    );
    fs.moveSync(
      path.join(sceneRoot, 'external-layout/Shared Combat.settings'),
      path.join(retiredOwnerRoot, 'external-layout.settings'),
      { overwrite: true }
    );

    await writeLegacyProjectAsMultiFile(project, entryPath);

    expect(fs.existsSync(path.join(sceneRoot, 'externals'))).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          sceneRoot,
          'external-events/Shared Combat/external-events.settings'
        )
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(sceneRoot, 'external-layout/Shared Combat.settings')
      )
    ).toBe(true);
  });

  test('rejects retired external.settings without parsing it', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    const retiredSettingsPath = path.join(
      temporaryDirectory,
      'externals/external.settings'
    );
    fs.ensureDirSync(path.dirname(retiredSettingsPath));
    fs.writeFileSync(retiredSettingsPath, 'not valid TOML', 'utf8');

    await expect(openMultiFileProject(entryPath)).rejects.toMatchObject({
      code: 'MULTIFILE_RETIRED_EXTERNAL_SETTINGS',
    });
  });

  test('leaves an unowned root externals directory untouched', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    const userSourcePath = path.join(
      temporaryDirectory,
      'externals/notes.events'
    );
    fs.ensureDirSync(path.dirname(userSourcePath));
    fs.writeFileSync(userSourcePath, 'user-owned source', 'utf8');

    expect(
      areLegacyProjectsEquivalent(
        projectFixture,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
    await writeLegacyProjectAsMultiFile(projectFixture, entryPath);
    expect(fs.readFileSync(userSourcePath, 'utf8')).toBe('user-owned source');
  });

  test('rejects retired keyed variable tables without rewriting files during open', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.variables = [{ name: 'Score', type: 'number', value: 12 }];
    project.layouts[0].variables = [
      { name: 'State', type: 'string', value: 'Ready' },
    ];
    const files = decomposeLegacyProjectToFiles(project);
    await writeMultiFileSourceTree({ entryPath, files });

    const projectSource = fs
      .readFileSync(entryPath, 'utf8')
      .replace('[[variables]]', '[variables]');
    const sceneSettingsPath = path.join(
      temporaryDirectory,
      'scenes/Main/scene.settings'
    );
    const sceneSource = fs
      .readFileSync(sceneSettingsPath, 'utf8')
      .replace('[[variables]]', '[variables]');
    fs.writeFileSync(entryPath, projectSource, 'utf8');
    fs.writeFileSync(sceneSettingsPath, sceneSource, 'utf8');
    const untouchedEventsPath = path.join(
      temporaryDirectory,
      'scenes/Main/functions/sceneUpdate.events'
    );
    const untouchedEvents = fs.readFileSync(untouchedEventsPath, 'utf8');

    await expect(openMultiFileProject(entryPath)).rejects.toEqual(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_VARIABLES' })
    );
    expect(fs.readFileSync(entryPath, 'utf8')).toBe(projectSource);
    expect(fs.readFileSync(sceneSettingsPath, 'utf8')).toBe(sceneSource);
    expect(fs.readFileSync(untouchedEventsPath, 'utf8')).toBe(untouchedEvents);
  });

  test('uses portable physical names for URI segments invalid on Windows', async () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.firstLayout = 'Extension: Health';
    project.previewLayout = 'Extension: Health';
    project.layouts[0].name = 'Extension: Health';
    project.layouts[0].mangledName = 'ExtensionHealth';
    const files = decomposeLegacyProjectToFiles(project);
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');

    await writeMultiFileSourceTree({ entryPath, files });

    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'scenes',
          'Extension%3A%20Health',
          'scene.settings'
        )
      )
    ).toBe(true);
    expect(
      areLegacyProjectsEquivalent(
        project,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
  });

  test('opens a source tree after Git converts settings files to CRLF', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const files = decomposeLegacyProjectToFiles(projectFixture);
    await writeMultiFileSourceTree({ entryPath, files });
    Object.keys(files).forEach(uri => {
      if (!uri.endsWith('.settings')) return;
      const filePath = resolveGameUriToPath(temporaryDirectory, uri);
      const source = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(filePath, source.replace(/\n/g, '\r\n'), 'utf8');
    });

    expect(
      areLegacyProjectsEquivalent(
        projectFixture,
        await openMultiFileProject(entryPath)
      )
    ).toBe(true);
  });

  test('loads named IfDo instructions through the generated catalog', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files['game://scenes/Main/functions/sceneUpdate.events'] =
      '@event\ndo Network::Send url="https://example.com"\n';
    await writeMultiFileSourceTree({ entryPath, files });
    const catalog = {
      format: 'gdevelop-ifdo-instruction-catalog',
      formatVersion: 2,
      actions: [
        {
          kind: 'action',
          type: 'Network::Send',
          parameters: [
            {
              dslName: 'url',
              type: 'string',
              valueKind: 'text',
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

  test('bootstraps catalogs before compiling named events on first open', async () => {
    const gd: libGDevelop = global.gd;
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const extensionName = 'FirstOpenCatalogTest';
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('First open catalog project');
    ensureProjectHasDefaultScene(project);
    const sceneName = project.getLayoutAt(0).getName();
    const extension = project.insertNewEventsFunctionsExtension(
      extensionName,
      0
    );
    extension.setFullName('First open catalog test');
    const action = extension
      .getEventsFunctions()
      .insertNewEventsFunction('Ping', 0);
    action.setFunctionType(gd.EventsFunction.Action);
    action.setFullName('Ping');

    const files = decomposeLegacyProjectToFiles({
      ...serializeToJSObject(project),
      constants: {},
    });
    files[`game://scenes/${sceneName}/functions/sceneUpdate.events`] =
      '@event\nif SceneJustBegins\ndo FirstOpenCatalogTest::Ping\n';
    project.delete();
    await writeMultiFileSourceTree({ entryPath, files });

    const instructionCatalogPath = path.join(
      temporaryDirectory,
      '.gdevelop/instructions-catalog.json'
    );
    expect(fs.existsSync(instructionCatalogPath)).toBe(false);

    const result = await onOpen({ fileIdentifier: entryPath });

    expect(result.content.constants).toBeUndefined();
    expect(result.constants).toEqual({});
    expect(result.content.layouts[0].events[0]).toMatchObject({
      conditions: [
        {
          type: { value: 'SceneJustBegins' },
        },
      ],
      actions: [
        {
          type: { value: 'FirstOpenCatalogTest::Ping' },
          parameters: ['', ''],
        },
      ],
    });
    expect(fs.existsSync(instructionCatalogPath)).toBe(true);
    expect(
      JSON.parse(fs.readFileSync(instructionCatalogPath, 'utf8')).actions
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'FirstOpenCatalogTest::Ping',
        }),
      ])
    );
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop/settings-catalog.json')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop/layout-catalog.json')
      )
    ).toBe(false);
    expect(
      fs.existsSync(path.join(temporaryDirectory, '.gdevelop/runtime-api.d.ts'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(temporaryDirectory, '.gdevelop/project-api.d.ts'))
    ).toBe(true);
  });

  test('rebuilds a pre-merge settings catalog and removes the retired layout catalog', async () => {
    const gd: libGDevelop = global.gd;
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Catalog upgrade project');
    ensureProjectHasDefaultScene(project);
    const files = decomposeLegacyProjectToFiles({
      ...serializeToJSObject(project),
      constants: {},
    });
    project.delete();
    await writeMultiFileSourceTree({ entryPath, files });
    await onOpen({ fileIdentifier: entryPath });

    const settingsCatalogPath = path.join(
      temporaryDirectory,
      '.gdevelop/settings-catalog.json'
    );
    const retiredLayoutCatalogPath = path.join(
      temporaryDirectory,
      '.gdevelop/layout-catalog.json'
    );
    const staleSettingsCatalog = JSON.parse(
      fs.readFileSync(settingsCatalogPath, 'utf8')
    );
    staleSettingsCatalog.formatVersion = 1;
    fs.writeFileSync(
      settingsCatalogPath,
      JSON.stringify(staleSettingsCatalog),
      'utf8'
    );
    fs.writeFileSync(retiredLayoutCatalogPath, '{"stale":true}\n', 'utf8');

    await onOpen({ fileIdentifier: entryPath });

    const rebuiltSettingsCatalog = JSON.parse(
      fs.readFileSync(settingsCatalogPath, 'utf8')
    );
    expect(rebuiltSettingsCatalog).toMatchObject({
      format: 'gdevelop-settings-catalog',
      formatVersion: 2,
      layoutAuthoring: {
        storage: 'embedded-settings',
        rootTable: 'layout',
      },
    });
    expect(rebuiltSettingsCatalog.layoutTables.length).toBeGreaterThan(0);
    expect(rebuiltSettingsCatalog.layoutContexts).toHaveLength(1);
    expect(fs.existsSync(retiredLayoutCatalogPath)).toBe(false);
  });

  test('writes only changed owned components', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
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
    changedObjectProject.layouts[0].objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Actors',
          children: [{ objectName: 'Player' }],
        },
      ],
    };
    expect(
      await writeLegacyProjectAsMultiFile(changedObjectProject, entryPath)
    ).toEqual(['game://scenes/Main/objects/Player.settings']);

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
    ).toEqual(['game://scenes/Main/scene.settings']);

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

    const changedConstantsProject = JSON.parse(
      JSON.stringify(changedResourcesProject)
    );
    changedConstantsProject.constants.newSetting = true;
    expect(
      await writeLegacyProjectAsMultiFile(changedConstantsProject, entryPath)
    ).toEqual(['game://constants.toml']);

    const withoutConstantsProject = JSON.parse(
      JSON.stringify(changedConstantsProject)
    );
    delete withoutConstantsProject.constants;
    await expect(
      writeLegacyProjectAsMultiFile(withoutConstantsProject, entryPath)
    ).rejects.toMatchObject({ code: 'MULTIFILE_MISSING_FILE' });
    expect(fs.existsSync(path.join(temporaryDirectory, 'constants.toml'))).toBe(
      true
    );
  });

  test('serializes concurrent source writes for the same project', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const firstWrite = writeMultiFileSourceTree({
      entryPath,
      files: {
        [MULTI_FILE_CONSTANTS_URI]: '[sheet.row]\ncolumn = "first"\n',
      },
    });
    const secondWrite = writeMultiFileSourceTree({
      entryPath,
      files: {
        [MULTI_FILE_CONSTANTS_URI]: '[sheet.row]\ncolumn = "second"\n',
      },
    });

    await Promise.all([firstWrite, secondWrite]);

    expect(
      fs.readFileSync(path.join(temporaryDirectory, 'constants.toml'), 'utf8')
    ).toBe('[sheet.row]\ncolumn = "second"\n');
  });

  test('routes prefab definition and instance edits to their owning files', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
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
    changedDefinition.eventsFunctionsExtensions[0].eventsBasedObjects[0].objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Parts',
          children: [{ objectName: 'Body' }],
        },
      ],
    };
    expect(
      await writeLegacyProjectAsMultiFile(changedDefinition, entryPath)
    ).toEqual(['game://extensions/Local/prefabs/Widget/objects/Body.settings']);

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
    ).toEqual(['game://extensions/Local/prefabs/Widget/prefab.settings']);

    const movedDefinition = JSON.parse(JSON.stringify(changedInstance));
    movedDefinition.eventsFunctionsExtensions[0].eventsBasedObjects[0].objectsFolderStructure.children[0].folderName =
      'Visuals';
    expect(
      await writeLegacyProjectAsMultiFile(movedDefinition, entryPath)
    ).toEqual(['game://extensions/Local/prefabs/Widget/objects/Body.settings']);
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'extensions/Local/prefabs/Widget/objects/Body.settings'
        )
      )
    ).toBe(true);
  });

  test('stores global object grouping in its flat settings file', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.objects = [
      {
        name: 'GlobalPlayer',
        type: 'Sprite',
        behaviors: [],
      },
    ];
    project.objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Actors',
          children: [{ objectName: 'GlobalPlayer' }],
        },
      ],
    };

    expect(await writeLegacyProjectAsMultiFile(project, entryPath)).toEqual(
      expect.arrayContaining(['game://objects/GlobalPlayer.settings'])
    );
    expect((await openMultiFileProject(entryPath)).objects).toEqual(
      project.objects
    );

    const movedProject = JSON.parse(JSON.stringify(project));
    movedProject.objectsFolderStructure.children[0].folderName = 'Shared';
    expect(
      await writeLegacyProjectAsMultiFile(movedProject, entryPath)
    ).toEqual(['game://objects/GlobalPlayer.settings']);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, 'objects/GlobalPlayer.settings')
      )
    ).toBe(true);
  });

  test('writes the real libGD object-group shape with required behaviors', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    try {
      project.setName('Object group project');
      const globalObjects = project.getObjects();
      globalObjects.insertNewObject(project, 'Sprite', 'GlobalPlayer', 0);
      const group = globalObjects
        .getObjectGroups()
        .insertNew('Global Actors', 0);
      group.addObject('GlobalPlayer');
      group.addRequiredBehavior('Tween::TweenBehavior');

      const serializedProject = {
        ...serializeToJSObject(project, 'serializeTo'),
        constants: {},
      };
      expect(serializedProject.objectsGroups).toEqual([
        {
          name: 'Global Actors',
          objects: [{ name: 'GlobalPlayer' }],
          requiredBehaviors: [{ type: 'Tween::TweenBehavior' }],
        },
      ]);

      const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
      await writeLegacyProjectAsMultiFile(serializedProject, entryPath);
      const projectSettings = fs.readFileSync(entryPath, 'utf8');
      expect(projectSettings).toContain('[objectGroups]');
      expect(projectSettings).toContain('"Global Actors" = [ "GlobalPlayer" ]');
      expect(projectSettings).toContain('[objectGroupRequiredBehaviors]');
      expect(projectSettings).toContain(
        '"Global Actors" = [ "Tween::TweenBehavior" ]'
      );
      expect(
        areLegacyProjectsEquivalent(
          serializedProject,
          await openMultiFileProject(entryPath)
        )
      ).toBe(true);
    } finally {
      project.delete();
    }
  });

  test('stores prefab and behavior function grouping in function settings', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const makeFunction = name => ({
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
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.eventsFunctionsExtensions = [
      {
        name: 'Local',
        eventsFunctions: [],
        eventsBasedObjects: [
          {
            name: 'Widget',
            objects: [],
            objectsGroups: [],
            areaMinX: 0,
            areaMinY: 0,
            areaMinZ: 0,
            areaMaxX: 64,
            areaMaxY: 64,
            areaMaxZ: 64,
            layers: [],
            instances: [],
            editionSettings: {},
            eventsFunctions: [makeFunction('Initialize')],
            eventsFunctionsFolderStructure: {
              folderName: '__ROOT',
              children: [
                {
                  folderName: 'Lifecycle',
                  children: [{ functionName: 'Initialize' }],
                },
              ],
            },
            variants: [],
          },
        ],
        eventsBasedBehaviors: [
          {
            name: 'Health',
            eventsFunctions: [makeFunction('Heal')],
            eventsFunctionsFolderStructure: {
              folderName: '__ROOT',
              children: [
                {
                  folderName: 'Recovery',
                  children: [{ functionName: 'Heal' }],
                },
              ],
            },
          },
        ],
      },
    ];

    await writeLegacyProjectAsMultiFile(project, entryPath);
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'extensions/Local/prefabs/Widget/functions/Initialize.settings'
        )
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'extensions/Local/behaviors/Health/functions/Heal.events'
        )
      )
    ).toBe(true);
    const opened = await openMultiFileProject(entryPath);
    expect(
      opened.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .eventsFunctionsFolderStructure
    ).toEqual(
      project.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .eventsFunctionsFolderStructure
    );
    expect(
      opened.eventsFunctionsExtensions[0].eventsBasedBehaviors[0]
        .eventsFunctionsFolderStructure
    ).toEqual(
      project.eventsFunctionsExtensions[0].eventsBasedBehaviors[0]
        .eventsFunctionsFolderStructure
    );

    const moved = JSON.parse(JSON.stringify(project));
    moved.eventsFunctionsExtensions[0].eventsBasedObjects[0].eventsFunctionsFolderStructure.children[0].folderName =
      'Setup';
    moved.eventsFunctionsExtensions[0].eventsBasedBehaviors[0].eventsFunctionsFolderStructure.children[0].folderName =
      'State';
    const changed = await writeLegacyProjectAsMultiFile(moved, entryPath);
    expect(changed).toEqual([
      'game://extensions/Local/prefabs/Widget/functions/Initialize.settings',
      'game://extensions/Local/behaviors/Health/functions/Heal.settings',
    ]);
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'extensions/Local/prefabs/Widget/functions/Initialize.settings'
        )
      )
    ).toBe(true);
    expect(
      areLegacyProjectsEquivalent(moved, await openMultiFileProject(entryPath))
    ).toBe(true);
  });

  test('removes only obsolete files owned by the previous manifest', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
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
        'game://scenes/Main/functions/sceneUpdate.settings',
        'game://scenes/Main/functions/sceneUpdate.events',
      ])
    );
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          'scenes/Main/functions/sceneUpdate.events'
        )
      )
    ).toBe(false);
    expect(fs.readFileSync(userFile, 'utf8')).toBe('keep me');
    expect(fs.existsSync(path.dirname(userFile))).toBe(true);
  });

  test('renames all files owned by extension components and removes empty old folders', async () => {
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
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
    expect(exists('extensions/Combat/functions/ComputeDamage.settings')).toBe(
      true
    );
    expect(exists('extensions/Combat/functions/ComputeDamage.events')).toBe(
      true
    );
    project = renamed;

    renamed = JSON.parse(JSON.stringify(project));
    const renamedPrefab =
      renamed.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    renamedPrefab.name = 'Boss';
    renamedPrefab.eventsFunctions[0].name = 'ReceiveDamage';
    await writeLegacyProjectAsMultiFile(renamed, entryPath);
    expect(exists('extensions/Combat/prefabs/Enemy')).toBe(false);
    expect(exists('extensions/Combat/prefabs/Boss/prefab.settings')).toBe(true);
    expect(exists('extensions/Combat/prefabs/Boss/prefab.settings')).toBe(true);
    expect(
      exists('extensions/Combat/prefabs/Boss/functions/ReceiveDamage.settings')
    ).toBe(true);
    expect(
      exists('extensions/Combat/prefabs/Boss/functions/ReceiveDamage.events')
    ).toBe(true);
    const prefabSettings = fs.readFileSync(
      path.join(
        temporaryDirectory,
        'extensions/Combat/prefabs/Boss/prefab.settings'
      ),
      'utf8'
    );
    expect(prefabSettings).toContain('[layout]');
    expect(prefabSettings).not.toContain('.functions.');
    expect(prefabSettings).not.toContain('ReceiveDamage.events');
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
    expect(
      exists('extensions/Combat/behaviors/Vitality/functions/Restore.settings')
    ).toBe(true);
    expect(
      exists('extensions/Combat/behaviors/Vitality/functions/Restore.events')
    ).toBe(true);
    project = renamed;

    renamed = JSON.parse(JSON.stringify(project));
    renamed.eventsFunctionsExtensions[0].name = 'Battle';
    await writeLegacyProjectAsMultiFile(renamed, entryPath);
    expect(exists('extensions/Combat')).toBe(false);
    expect(exists('extensions/Battle/extension.settings')).toBe(true);
    expect(exists('extensions/Battle/functions/ComputeDamage.events')).toBe(
      true
    );
    expect(exists('extensions/Battle/prefabs/Boss/prefab.settings')).toBe(true);
    expect(
      exists('extensions/Battle/behaviors/Vitality/functions/Restore.events')
    ).toBe(true);
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
    const { constants, ...projectContent } = projectFixture;
    const legacySource = `${JSON.stringify(projectContent, null, 2)}\n`;
    fs.writeFileSync(legacyPath, legacySource, 'utf8');
    fs.writeFileSync(
      path.join(temporaryDirectory, 'constants.toml'),
      '',
      'utf8'
    );

    const firstResult = await onOpen({ fileIdentifier: legacyPath });
    if (!firstResult.fileMetadata)
      throw new Error('Expected migration metadata.');
    expect(firstResult.fileMetadata.fileIdentifier).toBe(
      path.join(temporaryDirectory, 'project.gdevelop')
    );
    expect(fs.readFileSync(legacyPath, 'utf8')).toBe(legacySource);
    expect(firstResult.constants).toEqual(constants);

    const secondResult = await onOpen({ fileIdentifier: legacyPath });
    if (!secondResult.fileMetadata)
      throw new Error('Expected redirected migration metadata.');
    expect(secondResult.fileMetadata.fileIdentifier).toBe(
      path.join(temporaryDirectory, 'project.gdevelop')
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

  test('uses the generated folder as the local project root', () => {
    expect(
      getProjectLocation({
        projectName: 'My Game',
        saveAsLocation: null,
        newProjectsDefaultFolder: temporaryDirectory,
      }).fileIdentifier
    ).toBe(path.join(temporaryDirectory, 'project.gdevelop'));
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
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          '.gdevelop/deprecated-instructions-catalog.json'
        )
      )
    ).toBe(false);
    const serializedCatalog = fs.readFileSync(catalogPath, 'utf8');
    const parsedCatalog = JSON.parse(serializedCatalog);
    expect(parsedCatalog.formatVersion).toBe(2);
    expect(parsedCatalog.authoring).toBeUndefined();
    expect(serializedCatalog).not.toContain('serialized operand');
    expect(serializedCatalog).not.toContain('embedded quotes');
    expect(parsedCatalog.counts).toEqual(catalog.counts);
    expect(catalog.counts.actions).toBeGreaterThan(100);
    expect(catalog.counts.conditions).toBeGreaterThan(100);
    expect(catalog.counts.expressions).toBeGreaterThan(100);
    project.delete();
  });

  test('writes one settings catalog with embedded layout authoring data', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Catalog project');
    ensureProjectHasDefaultScene(project);
    const layout = project.getLayoutAt(0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    const settingsPath = path.join(
      temporaryDirectory,
      '.gdevelop/settings-catalog.json'
    );
    const layoutPath = path.join(
      temporaryDirectory,
      '.gdevelop/layout-catalog.json'
    );
    fs.ensureDirSync(path.dirname(layoutPath));
    fs.writeFileSync(layoutPath, '{"stale":true}\n', 'utf8');
    const settingsCatalog = await writeProjectSettingsCatalog(
      project,
      temporaryDirectory
    );

    expect(fs.existsSync(settingsPath)).toBe(true);
    expect(fs.existsSync(layoutPath)).toBe(false);
    const persistedSettingsCatalog = JSON.parse(
      fs.readFileSync(settingsPath, 'utf8')
    );
    expect(persistedSettingsCatalog.counts).toEqual(settingsCatalog.counts);
    expect(JSON.stringify(persistedSettingsCatalog.fileKinds)).not.toMatch(
      /FolderStructure/
    );
    expect(
      persistedSettingsCatalog.fileKinds.every(
        fileKind =>
          fileKind.schema &&
          Array.isArray(fileKind.schema.rootFields) &&
          Array.isArray(fileKind.schema.childTables)
      )
    ).toBe(true);
    expect(
      persistedSettingsCatalog.fileKinds.find(
        fileKind => fileKind.kind === 'scene-lifecycle-function'
      )
    ).toEqual(
      expect.objectContaining({
        path: 'scenes/<Scene>/functions/<Role>.settings',
        requiredFields: expect.arrayContaining(['order', 'lifecycleRole']),
      })
    );
    expect(
      persistedSettingsCatalog.fileKinds.some(
        fileKind => fileKind.kind === 'externals'
      )
    ).toBe(false);
    expect(settingsCatalog.counts.fileKinds).toBe(18);
    expect(settingsCatalog.counts.objectTypes).toBeGreaterThan(5);
    expect(settingsCatalog.counts.behaviorTypes).toBeGreaterThan(5);
    expect(settingsCatalog.layoutContexts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'scene',
          owner: expect.objectContaining({
            scene: 'Game',
            settingsUri: 'game://scenes/Game/scene.settings',
          }),
          objects: expect.arrayContaining([
            expect.objectContaining({ name: 'Player', type: 'Sprite' }),
          ]),
        }),
      ])
    );
    expect(settingsCatalog.behaviorOverrideSchemas.length).toBeGreaterThan(5);
    project.delete();
  });

  test('regenerates every project source catalog together', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Reloaded catalog project');
    ensureProjectHasDefaultScene(project);

    // A never-resolving asynchronous ensureDir reproduces the callback stall
    // that used to strand reload_project. Generated catalogs must use the
    // synchronous verified writer and never touch this async API.
    const ensureDirSpy = jest
      .spyOn(fs, 'ensureDir')
      .mockImplementation(() => new Promise(() => {}));
    const progressPhases = [];
    const cachedProgressPhases = [];

    let counts: Object;
    let cachedCounts: Object;
    try {
      counts = await writeProjectSourceCatalogs(project, temporaryDirectory, {
        reportProgress: phase => progressPhases.push(phase),
      });
      cachedCounts = await writeProjectSourceCatalogs(
        project,
        temporaryDirectory,
        {
          reportProgress: phase => cachedProgressPhases.push(phase),
        }
      );
    } finally {
      ensureDirSpy.mockRestore();
    }

    expect(ensureDirSpy).not.toHaveBeenCalled();
    expect(counts.instructions.actions).toBeGreaterThan(100);
    expect(counts.settings.objectTypes).toBeGreaterThan(5);
    expect(counts.settings.layoutContexts).toBe(1);
    expect(counts.javascript.counts.scenes).toBe(1);
    expect(cachedCounts).toEqual(counts);
    expect(counts.javascript.hashes.runtimeApi).toMatch(/^[0-9a-f]{64}$/);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop/instructions-catalog.json')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          temporaryDirectory,
          '.gdevelop/deprecated-instructions-catalog.json'
        )
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop/settings-catalog.json')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop/layout-catalog.json')
      )
    ).toBe(false);
    expect(
      fs.existsSync(path.join(temporaryDirectory, '.gdevelop/runtime-api.d.ts'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(temporaryDirectory, '.gdevelop/project-api.d.ts'))
    ).toBe(true);
    expect(
      fs.readFileSync(
        path.join(temporaryDirectory, '.gdevelop/runtime-api.d.ts'),
        'utf8'
      )
    ).not.toContain('_instances');
    expect(progressPhases).toEqual([
      'catalog-project-serializing',
      'catalog-project-serialized',
      'catalog-instruction-signature-building',
      'catalog-instruction-signature-built',
      'catalog-instructions-building',
      'catalog-instructions-built',
      'catalog-instructions-writing',
      'catalog-instructions-written',
      'catalog-deprecated-instructions-building',
      'catalog-deprecated-instructions-built',
      'catalog-deprecated-instructions-writing',
      'catalog-deprecated-instructions-written',
      'catalog-settings-building',
      'catalog-settings-built',
      'catalog-settings-writing',
      'catalog-settings-written',
      'catalog-javascript-api-building',
      'catalog-javascript-api-built',
      'catalog-runtime-api-writing',
      'catalog-runtime-api-written',
      'catalog-project-api-writing',
      'catalog-project-api-written',
    ]);
    expect(cachedProgressPhases).toContain('catalog-instructions-cache-hit');
    expect(cachedProgressPhases).toContain(
      'catalog-deprecated-instructions-cache-hit'
    );
    expect(cachedProgressPhases).not.toContain('catalog-instructions-building');
    expect(cachedProgressPhases).not.toContain(
      'catalog-deprecated-instructions-building'
    );
    project.delete();
  });

  test('writes the generated legacy game.json on every multi-file save', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('Generated compatibility project');
    project.setConstantsJson(
      JSON.stringify({ sheet: { row: { column: 'editor only' } } })
    );
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');

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
    expect(
      JSON.parse(fs.readFileSync(generatedPath, 'utf8')).constants
    ).toBeUndefined();
    expect(
      fs.readFileSync(path.join(temporaryDirectory, 'constants.toml'), 'utf8')
    ).toBe(`[sheet.row]
column = "editor only"
`);
    expect(fs.readFileSync(generatedPath, 'utf8')).not.toMatch(
      /(?:eventsFunctions|objects|properties|sharedProperties)FolderStructure/
    );
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop/settings-catalog.json')
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(temporaryDirectory, '.gdevelop/layout-catalog.json')
      )
    ).toBe(false);
    expect(
      fs.existsSync(path.join(temporaryDirectory, '.gdevelop/runtime-api.d.ts'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(temporaryDirectory, '.gdevelop/project-api.d.ts'))
    ).toBe(true);
    project.delete();
  });

  test('auto-saves Constants directly to constants.toml', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const originalEntrySource = '[project]\nname = "Auto-save test"\n';
    fs.writeFileSync(entryPath, originalEntrySource);
    project.setConstantsJson(
      JSON.stringify({
        sheet: {
          row: { column: 'sd', column2: 'sdf' },
          row2: { column: 'zz', column2: '333' },
        },
      })
    );

    await expect(
      onAutoSaveConstants(
        JSON.parse(project.getConstantsJson()),
        ({ fileIdentifier: entryPath }: any)
      )
    ).resolves.toBe(true);

    expect(
      fs.readFileSync(path.join(temporaryDirectory, 'constants.toml'), 'utf8')
    ).toBe(`[sheet.row]
column = "sd"
column2 = "sdf"

[sheet.row2]
column = "zz"
column2 = "333"
`);
    expect(fs.readFileSync(entryPath, 'utf8')).toBe(originalEntrySource);
    project.delete();
  });

  test('saves a platformer collision with its optional boolean default omitted', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const legacyProject = JSON.parse(JSON.stringify(projectFixture));
    legacyProject.properties.name = 'Platformer collision regression';
    legacyProject.properties.platforms = [{ name: 'GDevelop JS platform' }];
    legacyProject.properties.currentPlatform = 'GDevelop JS platform';
    legacyProject.layouts[0].objects = [
      { name: 'Player', type: 'Sprite', behaviors: [] },
      { name: 'Platform', type: 'Sprite', behaviors: [] },
    ];
    legacyProject.layouts[0].events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'CollisionNP' },
            parameters: ['Player', 'Platform', ''],
          },
        ],
        actions: [],
      },
    ];
    try {
      unserializeFromJSObject(project, legacyProject);
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

      const eventsSource = fs.readFileSync(
        path.join(
          temporaryDirectory,
          'scenes/Main/functions/sceneUpdate.events'
        ),
        'utf8'
      );
      expect(eventsSource).toContain(
        'if CollisionNP first_object="Player" second_object="Platform"'
      );
      expect(eventsSource).not.toContain(
        'ignore_objects_that_are_touching_each_other'
      );
      const reopened = await openMultiFileProject(entryPath);
      expect(reopened.layouts[0].events[0].conditions[0]).toMatchObject({
        type: { value: 'CollisionNP' },
        parameters: ['Player', 'Platform', '', '', ''],
      });
    } finally {
      project.delete();
    }
  });

  test('saves and reopens the Physics2 template instruction whose type contains whitespace', async () => {
    const gd: libGDevelop = global.gd;
    // $FlowFixMe[cannot-resolve-module] The extension is loaded by the app in production.
    const physics2ExtensionModule = require('../../../../../Extensions/Physics2Behavior/JsExtension');
    const physics2Extension = physics2ExtensionModule.createExtension(
      message => message,
      gd
    );
    gd.JsPlatform.get().addNewExtension(physics2Extension);
    physics2Extension.delete();
    const project = gd.ProjectHelper.createNewGDJSProject();
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const legacyProject = JSON.parse(JSON.stringify(projectFixture));
    legacyProject.properties.name = 'Physics template regression';
    legacyProject.properties.platforms = [{ name: 'GDevelop JS platform' }];
    legacyProject.properties.currentPlatform = 'GDevelop JS platform';
    legacyProject.layouts[0].objects = [
      {
        name: 'Body',
        type: 'Sprite',
        behaviors: [
          {
            name: 'Physics2',
            type: 'Physics2::Physics2Behavior',
            angularDamping: 0.1,
            bodyType: 'Dynamic',
            bullet: false,
            canSleep: true,
            density: 1,
            fixedRotation: false,
            friction: 0.3,
            gravityScale: 1,
            layers: 3,
            linearDamping: 0.1,
            masks: 5,
            restitution: 0.1,
            shape: 'Box',
          },
        ],
      },
    ];
    legacyProject.layouts[0].events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'Physics2::Remove joint' },
            parameters: ['Object', 'PhysicsBehavior', 'MouseJointID'],
          },
        ],
      },
    ];
    try {
      unserializeFromJSObject(project, legacyProject);
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

      const eventsSource = fs.readFileSync(
        path.join(
          temporaryDirectory,
          'scenes/Main/functions/sceneUpdate.events'
        ),
        'utf8'
      );
      expect(eventsSource).toContain('do "Physics2::Remove joint"');
      expect(eventsSource).not.toContain('@exact');
      const objectSource = fs.readFileSync(
        path.join(temporaryDirectory, 'scenes/Main/objects/Body.settings'),
        'utf8'
      );
      expect(objectSource).toContain('layers = 3');
      expect(objectSource).toContain('masks = 5');
      const reopened = await openMultiFileProject(entryPath);
      expect(reopened.layouts[0].events[0].actions[0]).toMatchObject({
        type: { value: 'Physics2::Remove joint' },
        parameters: ['Object', 'PhysicsBehavior', 'MouseJointID'],
      });
      expect(reopened.layouts[0].objects[0].behaviors[0]).toMatchObject({
        type: 'Physics2::Physics2Behavior',
        layers: 3,
        masks: 5,
      });
    } finally {
      project.delete();
      gd.JsPlatform.get().removeExtension('Physics2');
    }
  });

  test('preserves hidden Physics3D behavior properties without exposing them in the catalog', async () => {
    const gd: libGDevelop = global.gd;
    const hiddenPhysics3DProperties = [
      ['meshShapeResourceName', 'PrivateCollider.glb', 'PrivateCollider.glb'],
      ['shapeOffsetX', '12', 12],
      ['shapeOffsetY', '13', 13],
      ['shapeOffsetZ', '14', 14],
      ['massCenterOffsetX', '34', 34],
      ['massCenterOffsetY', '35', 35],
      ['massCenterOffsetZ', '36', 36],
    ];
    // $FlowFixMe[cannot-resolve-module] The extension is loaded by the app in production.
    const physics3DExtensionModule = require('../../../../../Extensions/Physics3DBehavior/JsExtension');
    const physics3DExtension = physics3DExtensionModule.createExtension(
      message => message,
      gd
    );
    gd.JsPlatform.get().addNewExtension(physics3DExtension);
    physics3DExtension.delete();
    const project = gd.ProjectHelper.createNewGDJSProject();
    const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
    const legacyProject = JSON.parse(JSON.stringify(projectFixture));
    legacyProject.properties.name = 'Physics3D hidden property regression';
    legacyProject.properties.platforms = [{ name: 'GDevelop JS platform' }];
    legacyProject.properties.currentPlatform = 'GDevelop JS platform';
    legacyProject.layouts[0].objects = [
      {
        name: 'Body',
        type: 'Sprite',
        behaviors: [
          {
            name: 'Physics3D',
            type: 'Physics3D::Physics3DBehavior',
            angularDamping: 0.1,
            bodyType: 'Static',
            bullet: false,
            density: 1,
            fixedRotation: false,
            friction: 0.3,
            gravityScale: 1,
            layers: 5,
            linearDamping: 0.1,
            massOverride: 0,
            masks: 9,
            object3D: '',
            restitution: 0.1,
            shape: 'Box',
            shapeOrientation: 'Z',
          },
        ],
      },
    ];
    try {
      unserializeFromJSObject(project, legacyProject);
      const behavior = project
        .getLayout('Main')
        .getObjects()
        .getObject('Body')
        .getBehavior('Physics3D');
      const beforePropertyRead = serializeToJSObject(project, 'serializeTo')
        .layouts[0].objects[0].behaviors[0];
      behavior.getProperties();
      const afterPropertyRead = serializeToJSObject(project, 'serializeTo')
        .layouts[0].objects[0].behaviors[0];
      expect(afterPropertyRead).toEqual(beforePropertyRead);
      hiddenPhysics3DProperties.forEach(([propertyName, propertyValue]) => {
        expect(behavior.updateProperty(propertyName, propertyValue)).toBe(true);
      });
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

      const objectSource = fs.readFileSync(
        path.join(temporaryDirectory, 'scenes/Main/objects/Body.settings'),
        'utf8'
      );
      const settingsCatalog = JSON.parse(
        fs.readFileSync(
          path.join(temporaryDirectory, '.gdevelop/settings-catalog.json'),
          'utf8'
        )
      );
      const generatedGameJson = JSON.parse(
        fs.readFileSync(
          path.join(temporaryDirectory, GENERATED_LEGACY_PROJECT_RELATIVE_PATH),
          'utf8'
        )
      );
      const generatedBehavior =
        generatedGameJson.layouts[0].objects[0].behaviors[0];
      const physics3DPropertyNames = settingsCatalog.behaviorTypes
        .find(
          behaviorType => behaviorType.type === 'Physics3D::Physics3DBehavior'
        )
        .properties.map(property => property.name);
      expect(objectSource).toContain('bodyType = "Static"');
      expect(physics3DPropertyNames).not.toContain('layers');
      expect(physics3DPropertyNames).not.toContain('masks');
      expect(objectSource).toContain('layers = 5');
      expect(objectSource).toContain('masks = 9');
      expect(generatedBehavior).toMatchObject({ layers: 5, masks: 9 });
      hiddenPhysics3DProperties.forEach(([propertyName, , serializedValue]) => {
        expect(physics3DPropertyNames).not.toContain(propertyName);
        expect(objectSource).toContain(propertyName);
        expect(generatedBehavior).toHaveProperty(propertyName, serializedValue);
      });
    } finally {
      project.delete();
      gd.JsPlatform.get().removeExtension('Physics3D');
    }
  });

  test('writes the default scene sources on the first project save', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setName('New game');
    ensureProjectHasDefaultScene(project);

    await onSaveProject(
      project,
      ({
        fileIdentifier: path.join(temporaryDirectory, 'project.gdevelop'),
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

    const sceneDirectory = path.join(temporaryDirectory, 'scenes', 'Game');
    expect(fs.existsSync(path.join(sceneDirectory, 'scene.settings'))).toBe(
      true
    );
    expect(
      fs.readFileSync(path.join(sceneDirectory, 'scene.settings'), 'utf8')
    ).toContain('[layout]');
    expect(
      fs.existsSync(path.join(sceneDirectory, 'functions/sceneUpdate.events'))
    ).toBe(true);
    project.delete();
  });

  test('preserves a legacy serialized behavior property removed from its extension', async () => {
    const gd: libGDevelop = global.gd;
    const project = gd.ProjectHelper.createNewGDJSProject();
    const extensionName = 'LegacyJoystickPropertyTest';
    project.setName('Legacy joystick property');
    ensureProjectHasDefaultScene(project);

    const extension = project.insertNewEventsFunctionsExtension(
      extensionName,
      0
    );
    const behaviorDefinition = insertNewEventsBasedBehavior(extension);
    behaviorDefinition.setName('MultitouchJoystick');
    behaviorDefinition.setFullName('Multitouch joystick');
    behaviorDefinition
      .getPropertyDescriptors()
      .insertNew('ControllerIdentifier', 0)
      .setType('Number')
      .setValue('1');
    reloadProjectEventsFunctionsExtensionMetadata(
      project,
      extension,
      ({
        getIncludeFileFor: () => 'generated.js',
        writeFunctionCode: async () => {},
        writeBehaviorCode: async () => {},
        writeObjectCode: async () => {},
      }: any),
      ({ _: value => (typeof value === 'string' ? value : value.id) }: any)
    );

    const object = project
      .getLayoutAt(0)
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Border', 0);
    const behavior = object.addNewBehavior(
      project,
      `${extensionName}::MultitouchJoystick`,
      'MultitouchJoystick'
    );
    if (!behavior) throw new Error('Expected the behavior to be created.');
    const legacyProject = serializeToJSObject(project, 'serializeTo');
    legacyProject.layouts[0].objects[0].behaviors[0].FloatingEnabled = false;
    unserializeFromJSObject(project, legacyProject);
    expect(
      serializeToJSObject(project, 'serializeTo').layouts[0].objects[0]
        .behaviors[0]
    ).toHaveProperty('FloatingEnabled', false);

    try {
      const entryPath = path.join(temporaryDirectory, 'project.gdevelop');
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

      const objectSource = fs.readFileSync(
        path.join(temporaryDirectory, 'scenes/Game/objects/Border.settings'),
        'utf8'
      );
      expect(objectSource).toContain('FloatingEnabled = false');
      const reopened = await openMultiFileProject(entryPath);
      expect(reopened.layouts[0].objects[0].behaviors[0]).toHaveProperty(
        'FloatingEnabled',
        false
      );
    } finally {
      project.delete();
      gd.JsPlatform.get().removeExtension(extensionName);
    }
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
