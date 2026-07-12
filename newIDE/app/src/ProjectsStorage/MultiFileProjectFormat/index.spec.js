// @flow

import {
  MULTI_FILE_CONFIG_URI,
  MULTI_FILE_ENTRY_URI,
  MULTI_FILE_RESOURCES_URI,
  MultiFileProjectError,
  areLegacyProjectsEquivalent,
  composeLegacyProjectFromFiles,
  decomposeLegacyProjectToFiles,
  encodeManagedName,
  parseTomlSource,
  removeLegacyFolderStructuresFromProject,
  validateGameUri,
} from './index';
import { compileLayoutDsl } from '../LayoutDsl';

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

describe('GDevelop multi-file project format', () => {
  test('round-trips every component kind through settings TOML, Layout DSL, and IfDo', () => {
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
    expect(
      files[
        'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage/function.settings'
      ]
    ).toContain('[extensions.Combat.prefabs.Enemy.functions.TakeDamage]');
    expect(
      files[
        'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage/TakeDamage.events'
      ]
    ).toContain('@event');
    expect(
      files[
        'game://extensions/Combat/behaviors/Health/functions/Heal/function.settings'
      ]
    ).toContain('[extensions.Combat.behaviors.Health.functions.Heal]');
    expect(
      files[
        'game://extensions/Combat/behaviors/Health/functions/Heal/Heal.events'
      ]
    ).toContain('@event');
    expect(
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
    ).not.toContain('.functions.');
    expect(
      files['game://extensions/Combat/behaviors/Health/behavior.settings']
    ).not.toContain('.functions.');
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
    Object.entries(files)
      .filter(([uri]) => uri.endsWith('.settings'))
      .forEach(([, source]) => {
        expect(source).not.toMatch(
          /(?:eventsFunctions|objects|properties|sharedProperties)FolderStructure/
        );
      });
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

  test('keeps scene layout files placement-focused', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].objects = [
      {
        name: 'Player',
        type: 'Sprite',
        behaviors: [
          {
            name: 'PlatformerObject',
            type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        ],
      },
    ];
    project.layouts[0].objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Actors',
          children: [{ objectName: 'Player' }],
        },
      ],
    };
    const files = decomposeLegacyProjectToFiles(project);
    const layoutSource = files['game://scenes/Main/Main.layout'];
    const layoutDocument = compileLayoutDsl(layoutSource, {
      kind: 'scene',
      objectNames: ['Player'],
    });
    const settingsDocument = parseTomlSource(
      files['game://scenes/Main/scene.settings']
    );
    expect(layoutSource).toMatch(/^<layout version=1 background=/);
    expect(layoutDocument).not.toHaveProperty('objects');
    expect(layoutDocument).not.toHaveProperty('objectsFolderStructure');
    expect(layoutDocument).not.toHaveProperty('variables');
    expect(layoutDocument).not.toHaveProperty('objectsGroups');
    expect(layoutDocument).not.toHaveProperty('title');
    expect(settingsDocument.scenes.Main).not.toHaveProperty('objects');
    const objectSettingsDocument = parseTomlSource(
      files['game://scenes/Main/objects/Actors/Player.settings']
    );
    expect(objectSettingsDocument.scenes.Main.objects.Player).toMatchObject({
      kind: 'object',
      order: 0,
      name: 'Player',
      type: 'Sprite',
      behaviors: [
        {
          name: 'PlatformerObject',
          type: 'PlatformBehavior::PlatformerObjectBehavior',
        },
      ],
    });
    expect(settingsDocument.scenes.Main).not.toHaveProperty(
      'objectsFolderStructure'
    );
    expect(composeLegacyProjectFromFiles(files).layouts[0].objects).toEqual(
      project.layouts[0].objects
    );
  });

  test('stores global objects in physical root object folders', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.objects = [
      {
        name: 'GlobalPlayer',
        type: 'Sprite',
        behaviors: [
          {
            name: 'Tween',
            type: 'Tween::TweenBehavior',
          },
        ],
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

    const files = decomposeLegacyProjectToFiles(project);
    const projectSettings = parseTomlSource(files[MULTI_FILE_ENTRY_URI]);
    const objectSettings = parseTomlSource(
      files['game://objects/Actors/GlobalPlayer.settings']
    );
    const output = composeLegacyProjectFromFiles(files);

    expect(projectSettings.project).not.toHaveProperty('objects');
    expect(objectSettings.project.objects.GlobalPlayer).toMatchObject({
      kind: 'object',
      order: 0,
      name: 'GlobalPlayer',
      type: 'Sprite',
      behaviors: [{ name: 'Tween', type: 'Tween::TweenBehavior' }],
    });
    expect(output.objects).toEqual(project.objects);
    expect(output.objectsFolderStructure).toEqual(
      project.objectsFolderStructure
    );
    expect(areLegacyProjectsEquivalent(project, output)).toBe(true);
  });

  test('rejects serialized folder trees instead of keeping compatibility', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files['game://extensions/Combat/extension.settings'] += `
[extensions.Combat.eventsFunctionsFolderStructure]
folderName = "__ROOT"
`;

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({
        code: 'MULTIFILE_FORBIDDEN_FOLDER_STRUCTURE',
      })
    );
  });

  test('uses physical sources instead of every legacy logical folder tree', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const folder = {
      folderName: '__ROOT',
      children: [{ folderName: 'Legacy group', children: [] }],
    };
    const extension = project.eventsFunctionsExtensions[0];
    const prefab = extension.eventsBasedObjects[0];
    const behavior = extension.eventsBasedBehaviors[0];

    project.objectsFolderStructure = folder;
    project.layouts[0].objectsFolderStructure = folder;
    extension.eventsFunctionsFolderStructure = folder;
    prefab.objectsFolderStructure = folder;
    prefab.eventsFunctionsFolderStructure = folder;
    prefab.propertiesFolderStructure = folder;
    prefab.variants[0].objectsFolderStructure = folder;
    behavior.eventsFunctionsFolderStructure = folder;
    behavior.propertiesFolderStructure = folder;
    behavior.sharedPropertiesFolderStructure = folder;

    const files = decomposeLegacyProjectToFiles(project);
    const output = composeLegacyProjectFromFiles(files);

    expect(
      Object.entries(files)
        .filter(([uri]) => uri.endsWith('.settings'))
        .some(([, source]) => /FolderStructure/.test(source))
    ).toBe(false);
    expect(
      JSON.stringify(removeLegacyFolderStructuresFromProject(output))
    ).not.toMatch(/FolderStructure/);
    expect(areLegacyProjectsEquivalent(project, output)).toBe(true);
  });

  test('stores prefab and behavior functions in dedicated physical function folders', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const extension = project.eventsFunctionsExtensions[0];
    const prefab = extension.eventsBasedObjects[0];
    const behavior = extension.eventsBasedBehaviors[0];
    prefab.eventsFunctionsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Combat actions',
          children: [{ functionName: 'TakeDamage' }],
        },
      ],
    };
    behavior.eventsFunctionsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Recovery',
          children: [{ functionName: 'Heal' }],
        },
      ],
    };

    const files = decomposeLegacyProjectToFiles(project);
    const prefabFunctionUri =
      'game://extensions/Combat/prefabs/Enemy/functions/Combat%20actions/TakeDamage/function.settings';
    const behaviorFunctionUri =
      'game://extensions/Combat/behaviors/Health/functions/Recovery/Heal/function.settings';
    const prefabFunction = parseTomlSource(files[prefabFunctionUri]).extensions
      .Combat.prefabs.Enemy.functions.TakeDamage;
    const behaviorFunction = parseTomlSource(files[behaviorFunctionUri])
      .extensions.Combat.behaviors.Health.functions.Heal;
    const output = composeLegacyProjectFromFiles(files);
    const outputPrefab =
      output.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    const outputBehavior =
      output.eventsFunctionsExtensions[0].eventsBasedBehaviors[0];

    expect(prefabFunction).toMatchObject({
      kind: 'function',
      order: 0,
      name: 'TakeDamage',
      events:
        'game://extensions/Combat/prefabs/Enemy/functions/Combat%20actions/TakeDamage/TakeDamage.events',
    });
    expect(behaviorFunction).toMatchObject({
      kind: 'function',
      order: 0,
      name: 'Heal',
      events:
        'game://extensions/Combat/behaviors/Health/functions/Recovery/Heal/Heal.events',
    });
    expect(
      parseTomlSource(
        files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
      ).extensions.Combat.prefabs.Enemy
    ).not.toHaveProperty('functions');
    expect(
      parseTomlSource(
        files['game://extensions/Combat/behaviors/Health/behavior.settings']
      ).extensions.Combat.behaviors.Health
    ).not.toHaveProperty('functions');
    expect(outputPrefab.eventsFunctionsFolderStructure).toEqual(
      prefab.eventsFunctionsFolderStructure
    );
    expect(outputBehavior.eventsFunctionsFolderStructure).toEqual(
      behavior.eventsFunctionsFolderStructure
    );
    expect(areLegacyProjectsEquivalent(project, output)).toBe(true);
  });

  test('rejects invalid or stray owner-function source paths', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const functionUri =
      'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage/function.settings';
    files[functionUri] = files[functionUri].replace(
      'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage/TakeDamage.events',
      'game://extensions/Combat/prefabs/Enemy/TakeDamage.events'
    );
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_MANIFEST_PATH' })
    );

    const filesWithStraySettings = decomposeLegacyProjectToFiles(
      projectFixture
    );
    filesWithStraySettings[
      'game://extensions/Combat/behaviors/Health/functions/Recovery/Heal/notes.settings'
    ] = '[notes]\nvalue = true\n';
    expect(() => composeLegacyProjectFromFiles(filesWithStraySettings)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_ORPHAN_SETTINGS' })
    );
  });

  test('stores prefab object definitions in physical object settings', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const prefab = project.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    prefab.objects = [
      {
        name: 'Body',
        type: 'Sprite',
        behaviors: [
          {
            name: 'Tween',
            type: 'Tween::TweenBehavior',
          },
        ],
      },
    ];
    prefab.objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Visuals',
          children: [{ objectName: 'Body' }],
        },
      ],
    };
    prefab.objectsGroups = [{ name: 'Parts', objects: ['Body'] }];
    const files = decomposeLegacyProjectToFiles(project);
    const layoutDocument = compileLayoutDsl(
      files['game://extensions/Combat/prefabs/Enemy/Enemy.layout'],
      { kind: 'prefab', objectNames: ['Body'] }
    );
    const settingsDocument = parseTomlSource(
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
    );
    const prefabSettings = settingsDocument.extensions.Combat.prefabs.Enemy;

    expect(layoutDocument).not.toHaveProperty('objects');
    expect(layoutDocument).not.toHaveProperty('objectsFolderStructure');
    expect(layoutDocument).not.toHaveProperty('objectsGroups');
    expect(prefabSettings).not.toHaveProperty('objects');
    expect(prefabSettings.objectsGroups).toEqual(prefab.objectsGroups);
    expect(
      parseTomlSource(
        files[
          'game://extensions/Combat/prefabs/Enemy/objects/Visuals/Body.settings'
        ]
      ).extensions.Combat.prefabs.Enemy.objects.Body
    ).toMatchObject({
      kind: 'object',
      order: 0,
      name: 'Body',
      type: 'Sprite',
      behaviors: [{ name: 'Tween', type: 'Tween::TweenBehavior' }],
    });
    expect(
      composeLegacyProjectFromFiles(files).eventsFunctionsExtensions[0]
        .eventsBasedObjects[0].objects
    ).toEqual(prefab.objects);
  });

  test('keeps prefab properties as flat arrays without property folders', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const prefab = project.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    prefab.propertyDescriptors = [
      { name: 'Health', type: 'Number', value: '100' },
      { name: 'Label', type: 'String', value: 'Enemy' },
    ];
    prefab.propertiesFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Stats',
          children: [{ propertyName: 'Health' }],
        },
      ],
    };

    const files = decomposeLegacyProjectToFiles(project);
    const prefabSettings = parseTomlSource(
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
    ).extensions.Combat.prefabs.Enemy;
    const outputPrefab = composeLegacyProjectFromFiles(files)
      .eventsFunctionsExtensions[0].eventsBasedObjects[0];

    expect(prefabSettings.propertyDescriptors).toEqual(
      prefab.propertyDescriptors
    );
    expect(prefabSettings).not.toHaveProperty('propertiesFolderStructure');
    expect(outputPrefab.propertyDescriptors).toEqual(
      prefab.propertyDescriptors
    );
    expect(outputPrefab).not.toHaveProperty('propertiesFolderStructure');
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('stores prefab variant objects in physical variant folders', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const variant =
      project.eventsFunctionsExtensions[0].eventsBasedObjects[0].variants[0];
    variant.objects = [
      {
        name: 'Shield',
        type: 'Sprite',
        behaviors: [],
      },
    ];
    variant.objectsFolderStructure = {
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Equipment',
          children: [{ objectName: 'Shield' }],
        },
      ],
    };

    const files = decomposeLegacyProjectToFiles(project);
    const objectUri =
      'game://extensions/Combat/prefabs/Enemy/variants/Armored/objects/Equipment/Shield.settings';
    const objectDocument = parseTomlSource(files[objectUri]);
    const outputVariant = composeLegacyProjectFromFiles(files)
      .eventsFunctionsExtensions[0].eventsBasedObjects[0].variants[0];

    expect(
      objectDocument.extensions.Combat.prefabs.Enemy.variantObjects.Armored
        .Shield
    ).toMatchObject({ kind: 'object', order: 0, type: 'Sprite' });
    expect(outputVariant.objects).toEqual(variant.objects);
    expect(outputVariant.objectsFolderStructure).toEqual({
      folderName: '__ROOT',
      children: [
        {
          folderName: 'Equipment',
          children: [{ objectName: 'Shield' }],
        },
      ],
    });
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('saves partially initialized prefab editor settings', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.eventsFunctionsExtensions[0].eventsBasedObjects[0].editionSettings = {
      gridWidth: 16,
      gridHeight: 24,
    };
    const files = decomposeLegacyProjectToFiles(project);
    expect(
      files['game://extensions/Combat/prefabs/Enemy/Enemy.layout']
    ).toContain('grid-size=16,24,32');
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('saves custom-object variants with untouched empty editor settings', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const variant =
      project.eventsFunctionsExtensions[0].eventsBasedObjects[0].variants[0];

    // This is the representation emitted by libGD for some newly installed
    // asset-store custom-object variants (for example StarRatingBar).
    variant.editionSettings = [];

    const files = decomposeLegacyProjectToFiles(project);
    const output = composeLegacyProjectFromFiles(files);

    expect(
      output.eventsFunctionsExtensions[0].eventsBasedObjects[0].variants[0]
        .editionSettings
    ).toEqual({});
    expect(areLegacyProjectsEquivalent(project, output)).toBe(true);
  });

  test('rejects retired TOML layout sources without a compatibility path', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const layoutUri = 'game://scenes/Main/Main.layout';
    files[layoutUri] = 'format = "gdevelop-scene-layout"\nformatVersion = 2\n';
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'LAYOUT_SYNTAX' })
    );
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
      .filter(uri => uri.endsWith('.settings'))
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

    const objectInLayout = decomposeLegacyProjectToFiles(projectFixture);
    objectInLayout['game://scenes/Main/Main.layout'] = objectInLayout[
      'game://scenes/Main/Main.layout'
    ].replace('</layout>', '  <objects />\n</layout>');
    expect(() => composeLegacyProjectFromFiles(objectInLayout)).toThrow(
      expect.objectContaining({ code: 'LAYOUT_INVALID_CHILD' })
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

  test('round-trips canonical layout DSL through the multi-file project', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    expect(files['game://scenes/Main/Main.layout']).toMatch(
      /^<layout version=1 background=/
    );
    expect(
      areLegacyProjectsEquivalent(
        projectFixture,
        composeLegacyProjectFromFiles(files)
      )
    ).toBe(true);
  });

  test('uses owner metadata and layout-local UUIDs while compiling layouts', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].objects = [
      {
        name: 'Player',
        type: 'Sprite',
        behaviors: [{ name: 'Move', type: 'Movement::Move' }],
      },
    ];
    project.layouts[0].instances = [
      {
        name: 'Player',
        x: 1,
        y: 2,
        angle: 0,
        zOrder: 0,
        layer: '',
        customSize: false,
        width: 0,
        height: 0,
        persistentUuid: '00000000-0000-4000-8000-000000000001',
        numberProperties: [],
        stringProperties: [],
        initialVariables: [],
        behaviorOverridings: [
          {
            name: 'Move',
            type: 'Movement::Move',
            speed: 10,
            isFolded: false,
            isMuted: false,
            isInheritedFromObjectType: false,
            quickCustomizationVisibility: 'default',
            propertiesQuickCustomizationVisibilities: {},
          },
        ],
      },
    ];
    const files = decomposeLegacyProjectToFiles(project);
    expect(
      composeLegacyProjectFromFiles(files).layouts[0].instances[0]
    ).toMatchObject({
      name: 'Player',
      behaviorOverridings: [
        { name: 'Move', type: 'Movement::Move', speed: 10 },
      ],
    });

    files['game://scenes/Main/Main.layout'] = files[
      'game://scenes/Main/Main.layout'
    ].replace(/Player/g, 'Missing');
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'LAYOUT_UNKNOWN_OBJECT' })
    );

    project.externalLayouts = [
      {
        name: 'Duplicate',
        associatedLayout: 'Main',
        instances: [
          JSON.parse(JSON.stringify(project.layouts[0].instances[0])),
        ],
        editionSettings: {},
      },
    ];
    const prefab = project.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    const variant = prefab.variants[0];
    const childObject = {
      name: 'Part',
      type: 'Sprite',
      behaviors: [],
    };
    const childLayer = { name: '', visibility: true, isLocked: false };
    const childInstance = {
      name: 'Part',
      x: 0,
      y: 0,
      angle: 0,
      zOrder: 0,
      layer: '',
      customSize: false,
      width: 0,
      height: 0,
      persistentUuid: '00000000-0000-4000-8000-000000000002',
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
    };
    prefab.objects = [childObject];
    prefab.layers = [childLayer];
    prefab.instances = [childInstance];
    variant.objects = [JSON.parse(JSON.stringify(childObject))];
    variant.layers = [JSON.parse(JSON.stringify(childLayer))];
    variant.instances = [JSON.parse(JSON.stringify(childInstance))];

    const duplicateAcrossLayoutsFiles = decomposeLegacyProjectToFiles(project);
    expect(
      areLegacyProjectsEquivalent(
        project,
        composeLegacyProjectFromFiles(duplicateAcrossLayoutsFiles)
      )
    ).toBe(true);
    expect(
      duplicateAcrossLayoutsFiles[
        'game://extensions/Combat/prefabs/Enemy/Enemy.layout'
      ]
    ).toContain(childInstance.persistentUuid);
    expect(
      duplicateAcrossLayoutsFiles[
        'game://extensions/Combat/prefabs/Enemy/variants/Armored.layout'
      ]
    ).toContain(childInstance.persistentUuid);
    expect(
      duplicateAcrossLayoutsFiles['game://externals/Duplicate.layout']
    ).toContain(project.layouts[0].instances[0].persistentUuid);
  });
});
