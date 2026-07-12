// @flow

// $FlowFixMe[cannot-resolve-module] Jest runs these format tests in Node.
import fs from 'fs';
// $FlowFixMe[cannot-resolve-module] Jest runs these format tests in Node.
import path from 'path';
import {
  MULTI_FILE_CONFIG_URI,
  MULTI_FILE_ENTRY_URI,
  MULTI_FILE_RESOURCES_URI,
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
  resources: {
    resources: [
      {
        file: 'assets/Player.png',
        kind: 'image',
        metadata: '',
        name: 'Player.png',
        smoothed: true,
        userAdded: true,
      },
    ],
    resourceFolders: [],
  },
  objects: [],
  objectsFolderStructure: { folderName: '__ROOT', children: [] },
  objectsGroups: [],
  variables: [],
  globalConfig: {
    enabled: true,
    rawJson: { userOwned: 'kept' },
    nullable: null,
    mixed: [1, 'two'],
  },
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
    expect(files[MULTI_FILE_ENTRY_URI]).toContain('eventsDslVersion = "2.0"');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('sceneFiles');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('extensionFiles');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('externalSettings');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toMatch(
      /game:\/\/[^"']+\.settings/
    );
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('game://scenes/');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('[project.resources');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('[project.globalConfig');
    expect(files[MULTI_FILE_CONFIG_URI]).toContain('[project.globalConfig]');
    expect(files[MULTI_FILE_RESOURCES_URI]).toContain('[project.resources]');
    expect(files[MULTI_FILE_RESOURCES_URI]).toContain(
      '[[project.resources.resources]]'
    );
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
    expect(
      files[
        'game://extensions/Combat/functions/CalculateDamage/function.settings'
      ]
    ).toContain('order = 0');
    expect(files['game://extensions/Combat/extension.settings']).toContain(
      'order = 0'
    );
    expect(files['game://extensions/Combat/extension.settings']).not.toContain(
      'functionFiles'
    );
    expect(files['game://extensions/Combat/extension.settings']).not.toContain(
      'prefabFiles'
    );
    expect(files['game://extensions/Combat/extension.settings']).not.toContain(
      'behaviorFiles'
    );
    expect(files['game://extensions/Combat/extension.settings']).not.toMatch(
      /game:\/\/[^"']+\.settings/
    );
  });

  test('discovers settings by fixed folders and restores locally owned order', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.eventsFunctionsExtensions[0].eventsFunctions.push(
      functionObject('ResetCombat')
    );
    project.eventsFunctionsExtensions.push({
      name: 'Support',
      fullName: 'Support',
      version: '1.0.0',
      eventsFunctionsFolderStructure: {
        folderName: '__ROOT',
        children: [],
      },
      eventsFunctions: [functionObject('Help')],
      eventsBasedObjects: [],
      eventsBasedBehaviors: [],
    });

    const files = decomposeLegacyProjectToFiles(project);
    const reversedFiles = Object.fromEntries(Object.entries(files).reverse());
    const output = composeLegacyProjectFromFiles(reversedFiles);

    expect(
      output.eventsFunctionsExtensions.map(extension => extension.name)
    ).toEqual(['Combat', 'Support']);
    expect(
      output.eventsFunctionsExtensions[0].eventsFunctions.map(
        functionObject => functionObject.name
      )
    ).toEqual(['CalculateDamage', 'ResetCombat']);
    expect(files['game://extensions/Support/extension.settings']).toContain(
      'order = 1'
    );
    expect(
      files['game://extensions/Combat/functions/ResetCombat/function.settings']
    ).toContain('order = 1');
  });

  test('keeps read compatibility with settings-file indexes from early drafts', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files[MULTI_FILE_ENTRY_URI] += `
[[project.extensionFiles]]
name = "Combat"
settings = "game://extensions/Combat/extension.settings"
`;
    files['game://extensions/Combat/extension.settings'] += `
[[extensions.Combat.functionFiles]]
name = "CalculateDamage"
settings = "game://extensions/Combat/functions/CalculateDamage/function.settings"

[[extensions.Combat.prefabFiles]]
name = "Enemy"
settings = "game://extensions/Combat/prefabs/Enemy/prefab.settings"

[[extensions.Combat.behaviorFiles]]
name = "Health"
settings = "game://extensions/Combat/behaviors/Health/behavior.settings"
`;

    expect(
      areLegacyProjectsEquivalent(
        projectFixture,
        composeLegacyProjectFromFiles(files)
      )
    ).toBe(true);
  });

  test('rejects a project that declares an obsolete events DSL grammar', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files[MULTI_FILE_ENTRY_URI] = files[MULTI_FILE_ENTRY_URI].replace(
      'eventsDslVersion = "2.0"',
      'eventsDslVersion = "1.3"'
    );

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_UNSUPPORTED_VERSION' })
    );
  });

  test('keeps read compatibility with resources embedded in project.settings', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.resources = { resources: [], resourceFolders: [] };
    const files = decomposeLegacyProjectToFiles(project);
    delete files[MULTI_FILE_RESOURCES_URI];
    files[MULTI_FILE_ENTRY_URI] += `
[project.resources]
resources = []
resourceFolders = []
`;

    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('keeps read compatibility with global config embedded in project.settings', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.globalConfig = { mode: 'embedded' };
    const files = decomposeLegacyProjectToFiles(project);
    delete files[MULTI_FILE_CONFIG_URI];
    files[MULTI_FILE_ENTRY_URI] += `
[project.globalConfig]
mode = "embedded"
`;

    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('preserves absent and empty global config without ownership ambiguity', () => {
    const withoutConfig = JSON.parse(JSON.stringify(projectFixture));
    delete withoutConfig.globalConfig;
    const filesWithoutConfig = decomposeLegacyProjectToFiles(withoutConfig);
    expect(filesWithoutConfig[MULTI_FILE_CONFIG_URI]).toBeUndefined();
    expect(
      Object.prototype.hasOwnProperty.call(
        composeLegacyProjectFromFiles(filesWithoutConfig),
        'globalConfig'
      )
    ).toBe(false);

    const withEmptyConfig = JSON.parse(JSON.stringify(projectFixture));
    withEmptyConfig.globalConfig = {};
    const filesWithEmptyConfig = decomposeLegacyProjectToFiles(withEmptyConfig);
    expect(filesWithEmptyConfig[MULTI_FILE_CONFIG_URI]).toContain(
      '[gdevelopConfig]'
    );
    expect(filesWithEmptyConfig[MULTI_FILE_CONFIG_URI]).toContain(
      '[project.globalConfig]'
    );
    expect(
      composeLegacyProjectFromFiles(filesWithEmptyConfig).globalConfig
    ).toEqual({});
  });

  test('rejects a discovered child settings fragment without its owner', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    delete files['game://extensions/Combat/extension.settings'];

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_ORPHAN_SETTINGS' })
    );
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
    expect(files[MULTI_FILE_CONFIG_URI]).toContain('[gdevelopConfig.rawJson]');
    expect(files[MULTI_FILE_CONFIG_URI]).toContain(
      '[project.globalConfig.rawJson]'
    );
    expect(files[MULTI_FILE_CONFIG_URI]).toContain('userOwned = "kept"');
    expect(files[MULTI_FILE_CONFIG_URI]).toContain('"/nullable" = "null"');
    expect(files[MULTI_FILE_CONFIG_URI]).toContain('"/mixed" = \'[1,"two"]\'');
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

    expect(files[MULTI_FILE_CONFIG_URI]).toContain(
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
