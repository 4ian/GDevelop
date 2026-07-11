// @flow

// $FlowFixMe[cannot-resolve-module] Jest runs these format tests in Node.
import fs from 'fs';
// $FlowFixMe[cannot-resolve-module] Jest runs these format tests in Node.
import path from 'path';
import {
  MULTI_FILE_ENTRY_URI,
  MultiFileProjectError,
  SCENE_LAYOUT_FIELDS,
  areLegacyProjectsEquivalent,
  composeLegacyProjectFromFiles,
  decomposeLegacyProjectToFiles,
  encodeManagedName,
  normalizeLegacyProjectForMultiFile,
  parseTomlSource,
  validateGameUri,
} from './index';

declare var __dirname: string;

const standardEvent = () => ({
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [],
});

const functionObject = name => ({
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
  events: [standardEvent()],
});

const projectFixture = {
  gdVersion: { major: 5, minor: 6, build: 0, revision: 0 },
  properties: {
    name: 'Multi-file test',
    projectUuid: 'project-id',
    folderProject: false,
  },
  resources: { resources: [], resourceFolders: [] },
  objects: [],
  objectsFolderStructure: { folderName: '__ROOT', children: [] },
  objectsGroups: [],
  variables: [],
  globalConfig: { nullable: null, mixed: [1, 'two'] },
  firstLayout: 'Main',
  previewLayout: 'Main',
  layouts: [
    {
      name: 'Main',
      mangledName: 'Main',
      r: 12,
      v: 34,
      b: 56,
      title: 'Game',
      standardSortMethod: true,
      stopSoundsOnStartup: true,
      disableInputWhenNotFocused: true,
      variables: [],
      objectsGroups: [],
      behaviorsSharedData: [],
      uiSettings: { grid: false },
      objects: [],
      objectsFolderStructure: { folderName: '__ROOT', children: [] },
      instances: [],
      layers: [{ name: '', visibility: true, isLocked: false }],
      events: [standardEvent()],
    },
  ],
  externalEvents: [
    {
      name: 'Shared Combat',
      associatedLayout: 'Main',
      events: [standardEvent()],
    },
  ],
  externalLayouts: [
    {
      name: 'Shared Combat',
      associatedLayout: 'Main',
      instances: [],
      editionSettings: { grid: false },
    },
  ],
  eventsFunctionsExtensions: [
    {
      name: 'Combat',
      fullName: 'Combat',
      version: '1.0.0',
      description: ['Combat helpers'],
      eventsFunctionsFolderStructure: { folderName: '__ROOT', children: [] },
      eventsFunctions: [functionObject('CalculateDamage')],
      eventsBasedObjects: [
        {
          name: 'Enemy',
          fullName: 'Enemy',
          description: 'Enemy prefab',
          areaMinX: 0,
          areaMinY: 0,
          areaMinZ: 0,
          areaMaxX: 64,
          areaMaxY: 64,
          areaMaxZ: 64,
          objects: [],
          objectsFolderStructure: { folderName: '__ROOT', children: [] },
          objectsGroups: [],
          layers: [],
          instances: [],
          editionSettings: {},
          eventsFunctions: [functionObject('TakeDamage')],
          variants: [
            {
              name: 'Armored',
              assetStoreAssetId: '',
              areaMinX: 0,
              areaMinY: 0,
              areaMinZ: 0,
              areaMaxX: 96,
              areaMaxY: 96,
              areaMaxZ: 96,
              objects: [],
              objectsFolderStructure: {
                folderName: '__ROOT',
                children: [],
              },
              objectsGroups: [],
              layers: [],
              instances: [],
              editionSettings: {},
            },
          ],
        },
      ],
      eventsBasedBehaviors: [
        {
          name: 'Health',
          fullName: 'Health',
          description: 'Health behavior',
          eventsFunctions: [functionObject('Heal')],
        },
      ],
    },
  ],
};

const collectJsonFiles = (directory: string): Array<string> =>
  fs.readdirSync(directory).flatMap(name => {
    const filePath = path.join(directory, name);
    return fs.statSync(filePath).isDirectory()
      ? collectJsonFiles(filePath)
      : filePath.endsWith('.json')
      ? [filePath]
      : [];
  });

const findFirstDifference = (
  left: any,
  right: any,
  pointer: string = ''
): string => {
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length)
      return `${pointer}: array lengths ${left.length} !== ${right.length}`;
    for (let index = 0; index < left.length; index++) {
      const difference = findFirstDifference(
        left[index],
        right[index],
        `${pointer}/${index}`
      );
      if (difference) return difference;
    }
    return '';
  }
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const keys = [
      ...new Set([...Object.keys(left), ...Object.keys(right)]),
    ].sort();
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(left, key))
        return `${pointer}/${key}: missing from input`;
      if (!Object.prototype.hasOwnProperty.call(right, key))
        return `${pointer}/${key}: missing from output`;
      const difference = findFirstDifference(
        left[key],
        right[key],
        `${pointer}/${key}`
      );
      if (difference) return difference;
    }
    return '';
  }
  return `${pointer}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`;
};

describe('GDevelop multi-file project format', () => {
  test('round-trips every component kind through TOML and IfDo', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture, {
      migration: {
        source: 'game://game.json',
        sourceSha256: 'hash',
        importedAt: '2026-07-11T10:30:00Z',
        importerVersion: 1,
      },
    });
    const output = composeLegacyProjectFromFiles(files);

    expect(areLegacyProjectsEquivalent(projectFixture, output)).toBe(true);
    expect(files[MULTI_FILE_ENTRY_URI]).toContain('[gdevelop]');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('sceneFiles');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('game://scenes/');
    expect(files['game://scenes/Main/scene.settings']).toContain(
      'layout = "game://scenes/Main/Main.layout"'
    );
    expect(files['game://scenes/Main/scene.settings']).toContain(
      'events = "game://scenes/Main/Main.events"'
    );
    expect(files['game://scenes/Main/scene.settings']).toContain('order = 0');
    expect(files['game://scenes/Main/Main.layout']).not.toContain('events');
    expect(files['game://scenes/Main/Main.events']).toContain('@event');
    expect(files['game://externals/external.settings']).toContain(
      '[[externals.eventFiles]]'
    );
    expect(
      files[
        'game://extensions/Combat/functions/CalculateDamage/function.settings'
      ]
    ).toContain('[extensions.Combat.functions.CalculateDamage]');
  });

  test('keeps scene layout files visual/UI-focused', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const layoutDocument = parseTomlSource(
      files['game://scenes/Main/Main.layout']
    );
    expect(Object.keys(layoutDocument.layout).sort()).toEqual(
      [...SCENE_LAYOUT_FIELDS].sort()
    );
    expect(layoutDocument.layout).not.toHaveProperty('variables');
    expect(layoutDocument.layout).not.toHaveProperty('objectsGroups');
    expect(layoutDocument.layout).not.toHaveProperty('title');
  });

  test('stores unsupported TOML values as canonical raw JSON pointers', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    expect(files[MULTI_FILE_ENTRY_URI]).toContain('[project.rawJson]');
    expect(files[MULTI_FILE_ENTRY_URI]).toContain(
      '"/globalConfig/nullable" = "null"'
    );
    expect(files[MULTI_FILE_ENTRY_URI]).toContain(
      '"/globalConfig/mixed" = \'[1,"two"]\''
    );
    expect(composeLegacyProjectFromFiles(files).globalConfig).toEqual(
      projectFixture.globalConfig
    );
  });

  test('all settings fragments append into one conflict-free TOML document', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const settings = Object.keys(files)
      .filter(uri => uri.endsWith('.settings'))
      .map(uri => files[uri].trimEnd())
      .join('\n\n');
    expect(() => parseTomlSource(`${settings}\n`)).not.toThrow();
  });

  test('writes TOML without indentation', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    Object.keys(files)
      .filter(uri => uri.endsWith('.settings') || uri.endsWith('.layout'))
      .forEach(uri => {
        expect(files[uri]).not.toMatch(/^[ \t]+/m);
      });
  });

  test('preserves leading whitespace inside multiline TOML strings', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.globalConfig.multiline = 'first line\n second line';
    const files = decomposeLegacyProjectToFiles(project);
    const output = composeLegacyProjectFromFiles(files);

    expect(files[MULTI_FILE_ENTRY_URI]).toContain(
      'multiline = """\nfirst line\n second line"""'
    );
    expect(output.globalConfig.multiline).toBe('first line\n second line');
  });

  test('uses canonical safe game URIs and encoded names', () => {
    expect(encodeManagedName('Shared Combat')).toBe('Shared%20Combat');
    expect(encodeManagedName('NUL')).toBe('%4EUL');
    expect(encodeManagedName('场景')).toBe('%E5%9C%BA%E6%99%AF');
    expect(validateGameUri('game://externals/Shared%20Combat.events')).toBe(
      'externals/Shared Combat.events'
    );
    expect(validateGameUri('game://scenes/%4EUL/scene.settings')).toBe(
      'scenes/NUL/scene.settings'
    );
  });

  test.each([
    '../outside.events',
    'game://../outside.events',
    'game://scenes\\Main.events',
    'game://C:/game/project.settings',
    'game://scenes/%2e%2e/file.events',
    'game://scenes/%ZZ/file.events',
  ])('rejects unsafe managed URI %s', uri => {
    expect(() => validateGameUri(uri)).toThrow(MultiFileProjectError);
  });

  test('rejects cross-file ownership conflicts and duplicate references', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const sceneSettingsUri = 'game://scenes/Main/scene.settings';
    files[sceneSettingsUri] = files[sceneSettingsUri].replace(
      'title = "Game"',
      'title = "Game"\nr = 42'
    );
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      MultiFileProjectError
    );

    const duplicated = decomposeLegacyProjectToFiles(projectFixture);
    duplicated[sceneSettingsUri] = duplicated[sceneSettingsUri].replace(
      'events = "game://scenes/Main/Main.events"',
      'events = "game://scenes/Main/Main.layout"'
    );
    expect(() => composeLegacyProjectFromFiles(duplicated)).toThrow(
      MultiFileProjectError
    );

    const duplicateIdentityProject = JSON.parse(JSON.stringify(projectFixture));
    duplicateIdentityProject.layouts.push(
      JSON.parse(JSON.stringify(duplicateIdentityProject.layouts[0]))
    );
    expect(() =>
      composeLegacyProjectFromFiles(
        decomposeLegacyProjectToFiles(duplicateIdentityProject)
      )
    ).toThrow(MultiFileProjectError);
  });

  test('round-trips all repository GDJS project fixtures', () => {
    const repositoryRoot = path.resolve(__dirname, '../../../../..');
    const projectFiles = collectJsonFiles(
      path.join(repositoryRoot, 'GDJS/tests/games')
    );
    let convertedProjects = 0;
    projectFiles.forEach(filePath => {
      const project = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(project.layouts) || !project.properties) return;
      const files = decomposeLegacyProjectToFiles(project);
      const output = composeLegacyProjectFromFiles(files);
      if (!areLegacyProjectsEquivalent(project, output)) {
        throw new Error(
          `Multi-file round-trip failed for ${filePath}: ${findFirstDifference(
            normalizeLegacyProjectForMultiFile(project),
            normalizeLegacyProjectForMultiFile(output)
          )}`
        );
      }
      convertedProjects++;
    });
    expect(convertedProjects).toBeGreaterThan(20);
  });
});
