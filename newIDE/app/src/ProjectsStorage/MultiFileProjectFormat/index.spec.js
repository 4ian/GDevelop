// @flow

import {
  MULTI_FILE_CONSTANTS_URI,
  MULTI_FILE_ENTRY_URI,
  MULTI_FILE_FORMAT_VERSION,
  MULTI_FILE_RESOURCES_URI,
  MultiFileProjectError,
  areLegacyProjectsEquivalent,
  composeLegacyProjectFromFiles,
  decomposeLegacyProjectToFiles,
  encodeManagedName,
  getLegacyProjectFirstDifferenceDescription,
  parseConstantsFromToml,
  parseTomlSource,
  removeLegacyFolderStructuresFromProject,
  serializeConstantsToToml,
  validateGameUri,
} from './index';

const standardEvent = () => ({
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [],
});

const serializedObjectGroup = (
  name,
  objectNames,
  requiredBehaviorTypes = undefined
) => ({
  name,
  objects: objectNames.map(objectName => ({ name: objectName })),
  ...(requiredBehaviorTypes
    ? {
        requiredBehaviors: requiredBehaviorTypes.map(type => ({ type })),
      }
    : {}),
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
  constants: {
    enabled: true,
    rawJson: { userOwned: 'kept' },
    sheet: {
      row: { column: 'ssdfs', column2: 'ss' },
      row2: { column: 'zzz', column2: 'ssfssdfsf' },
    },
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
  test('describes the first normalized verification difference without dumping large values', () => {
    const left = {
      ...projectFixture,
      layouts: [
        {
          ...projectFixture.layouts[0],
          title: 'A'.repeat(200),
        },
      ],
    };
    const right = {
      ...projectFixture,
      layouts: [
        {
          ...projectFixture.layouts[0],
          title: `${'A'.repeat(100)}B${'A'.repeat(99)}`,
        },
      ],
    };

    expect(getLegacyProjectFirstDifferenceDescription(left, right)).toBe(
      '$.layouts[0].title: strings differ at character 100 (original length 200, reconstructed length 200).'
    );
    expect(getLegacyProjectFirstDifferenceDescription(left, left)).toBeNull();
  });

  test('treats omitted and empty trailing instruction parameters as equivalent', () => {
    const withOmittedParameters = {
      ...projectFixture,
      layouts: [
        {
          ...projectFixture.layouts[0],
          events: [
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
          ],
        },
      ],
    };
    const withEmptyParameters = {
      ...withOmittedParameters,
      layouts: [
        {
          ...withOmittedParameters.layouts[0],
          events: [
            {
              ...withOmittedParameters.layouts[0].events[0],
              conditions: [
                {
                  ...withOmittedParameters.layouts[0].events[0].conditions[0],
                  parameters: ['Player', 'Platform', '', '', ''],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(
      getLegacyProjectFirstDifferenceDescription(
        withOmittedParameters,
        withEmptyParameters
      )
    ).toBeNull();
  });

  test('ignores configured code-only instruction parameters during verification', () => {
    const withRuntimeData = {
      ...projectFixture,
      layouts: [
        {
          ...projectFixture.layouts[0],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: { value: 'Extension::Action' },
                  parameters: ['Object', 'stale runtime data', 'Value'],
                },
              ],
            },
          ],
        },
      ],
    };
    const withoutRuntimeData = JSON.parse(JSON.stringify(withRuntimeData));
    withoutRuntimeData.layouts[0].events[0].actions[0].parameters[1] = '';

    expect(
      getLegacyProjectFirstDifferenceDescription(
        withRuntimeData,
        withoutRuntimeData
      )
    ).not.toBeNull();
    expect(
      getLegacyProjectFirstDifferenceDescription(
        withRuntimeData,
        withoutRuntimeData,
        {
          instructionParameterIndicesToIgnoreByType: {
            'Extension::Action': [1],
          },
        }
      )
    ).toBeNull();
  });

  test('round-trips every component kind through embedded layout settings and IfDo', () => {
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
    expect(files[MULTI_FILE_ENTRY_URI]).toContain(
      `combinedSettingsFormatVersion = ${MULTI_FILE_FORMAT_VERSION}`
    );
    expect(files[MULTI_FILE_ENTRY_URI]).toContain('variables = [ ]');
    expect(files[MULTI_FILE_ENTRY_URI]).toContain('eventsDslVersion = "3.0"');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('sceneFiles');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('extensionFiles');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('externalSettings');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toMatch(
      /game:\/\/[^"']+\.settings/
    );
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('game://scenes/');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('[project.resources');
    expect(files[MULTI_FILE_ENTRY_URI]).not.toContain('[project.constants');
    expect(files[MULTI_FILE_CONSTANTS_URI]).toContain('[sheet.row]');
    expect(files[MULTI_FILE_CONSTANTS_URI]).toContain('column = "ssdfs"');
    expect(files[MULTI_FILE_CONSTANTS_URI]).not.toContain('[settings');
    expect(files[MULTI_FILE_CONSTANTS_URI]).not.toContain('[constants');
    expect(files[MULTI_FILE_CONSTANTS_URI]).not.toContain(
      'settingsFormatVersion'
    );
    expect(files[MULTI_FILE_RESOURCES_URI]).not.toContain(
      '[project.resources]'
    );
    expect(files[MULTI_FILE_RESOURCES_URI]).toContain('[[resources]]');
    expect(files['game://scenes/Main/scene.settings']).toContain('[layout]');
    expect(files['game://scenes/Main/scene.settings']).not.toContain(
      'events = '
    );
    expect(files['game://scenes/Main/scene.settings']).toContain('order = 0');
    expect(files['game://scenes/Main/Main.layout']).toBeUndefined();
    expect(files['game://scenes/Main/functions/sceneUpdate.events']).toContain(
      '@event'
    );
    expect(files['game://scenes/Main/scene.settings']).not.toContain(
      'externalEventFiles'
    );
    expect(files['game://scenes/Main/scene.settings']).not.toContain(
      'externalLayoutFiles'
    );
    expect(files['game://externals/external.settings']).toBeUndefined();
    expect(
      files[
        'game://scenes/Main/external-events/Shared%20Combat/functions/sceneUpdate.events'
      ]
    ).toContain('@event');
    expect(
      files[
        'game://scenes/Main/external-events/Shared%20Combat/external-events.settings'
      ]
    ).toContain('kind = "externalEvents"');
    expect(
      files['game://scenes/Main/external-layout/Shared%20Combat.settings']
    ).toContain('[layout]');
    expect(
      files['game://extensions/Combat/functions/CalculateDamage.settings']
    ).not.toContain('[extensions.');
    expect(
      files['game://extensions/Combat/functions/CalculateDamage.settings']
    ).toContain('order = 0');
    expect(
      files[
        'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage.settings'
      ]
    ).toContain('name = "TakeDamage"');
    expect(
      files[
        'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage.events'
      ]
    ).toContain('@event');
    expect(
      files['game://extensions/Combat/behaviors/Health/functions/Heal.settings']
    ).toContain('name = "Heal"');
    expect(
      files['game://extensions/Combat/behaviors/Health/functions/Heal.events']
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

  test('round-trips all scene and External Events lifecycle functions through fixed directories', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].sceneLoadEvents = [standardEvent()];
    project.layouts[0].sceneSignalEvents = [standardEvent()];
    project.layouts[0].sceneUnloadEvents = [standardEvent()];
    project.externalEvents[0].sceneLoadEvents = [standardEvent()];
    project.externalEvents[0].sceneSignalEvents = [standardEvent()];
    project.externalEvents[0].sceneUnloadEvents = [standardEvent()];

    const files = decomposeLegacyProjectToFiles(project);
    for (const role of [
      'sceneLoad',
      'sceneSignal',
      'sceneUpdate',
      'sceneUnload',
    ]) {
      expect(files[`game://scenes/Main/functions/${role}.settings`]).toContain(
        `lifecycleRole = "${role}"`
      );
      expect(files[`game://scenes/Main/functions/${role}.events`]).toContain(
        '@event'
      );
      expect(
        files[
          `game://scenes/Main/external-events/Shared%20Combat/functions/${role}.settings`
        ]
      ).toContain(`lifecycleRole = "${role}"`);
    }
    expect(
      files['game://scenes/Main/functions/sceneSignal.settings']
    ).toContain('name = "SignalName"');
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);

    const baselineFiles = decomposeLegacyProjectToFiles(projectFixture);
    expect(
      baselineFiles['game://scenes/Main/functions/sceneLoad.settings']
    ).toBeUndefined();
    expect(
      baselineFiles['game://scenes/Main/functions/sceneUpdate.settings']
    ).toBeDefined();
  });

  test('rejects version 4 projects without a production compatibility reader', () => {
    const version4Files = Object.fromEntries(
      Object.entries(decomposeLegacyProjectToFiles(projectFixture)).map(
        ([uri, source]) => [
          uri,
          source
            .replace(
              `combinedSettingsFormatVersion = ${MULTI_FILE_FORMAT_VERSION}`,
              'combinedSettingsFormatVersion = 4'
            )
            .replace(
              new RegExp(
                `settingsFormatVersion = ${MULTI_FILE_FORMAT_VERSION}`,
                'g'
              ),
              'settingsFormatVersion = 4'
            ),
        ]
      )
    );

    expect(() => composeLegacyProjectFromFiles(version4Files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_UNSUPPORTED_VERSION' })
    );
  });

  test('rejects missing or mutable lifecycle function identity', () => {
    const missingUpdate = decomposeLegacyProjectToFiles(projectFixture);
    delete missingUpdate['game://scenes/Main/functions/sceneUpdate.settings'];
    delete missingUpdate['game://scenes/Main/functions/sceneUpdate.events'];
    expect(() => composeLegacyProjectFromFiles(missingUpdate)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_MISSING_FILE' })
    );

    const mutableRole = decomposeLegacyProjectToFiles(projectFixture);
    const settingsUri = 'game://scenes/Main/functions/sceneUpdate.settings';
    mutableRole[settingsUri] = mutableRole[settingsUri].replace(
      'lifecycleRole = "sceneUpdate"',
      'lifecycleRole = "sceneLoad"'
    );
    expect(() => composeLegacyProjectFromFiles(mutableRole)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_IDENTITY_MISMATCH' })
    );
  });

  test('round-trips instances that start hidden through layout TOML', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].instances.push({
      name: 'Player',
      x: 10,
      y: 20,
      angle: 0,
      zOrder: 0,
      layer: '',
      customSize: false,
      width: 0,
      height: 0,
      hidden: true,
      persistentUuid: '00000000-0000-4000-8000-000000000001',
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
    });

    const files = decomposeLegacyProjectToFiles(project);
    expect(files['game://scenes/Main/scene.settings']).toContain(
      'hidden = true'
    );

    const output = composeLegacyProjectFromFiles(files);
    expect(output.layouts[0].instances[0].hidden).toBe(true);
    expect(areLegacyProjectsEquivalent(project, output)).toBe(true);
  });

  test('omits empty scene shared-data entries for custom and native behaviors', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].behaviorsSharedData = [
      { name: 'Health', type: 'Combat::Health' },
      {
        name: 'Platform',
        type: 'PlatformBehavior::PlatformBehavior',
        quickCustomizationVisibility: 'hidden',
      },
    ];

    const files = decomposeLegacyProjectToFiles(project);
    const sceneSettings = files['game://scenes/Main/scene.settings'];
    const parsedSceneSettings = parseTomlSource(sceneSettings);

    expect(sceneSettings).not.toMatch(/\[\[[^\]]*behaviorsSharedData\]\]/);
    expect(parsedSceneSettings.behaviorsSharedData).toEqual([]);
    expect(
      composeLegacyProjectFromFiles(files).layouts[0].behaviorsSharedData
    ).toEqual([]);
  });

  test('keeps scene shared-data entries for behaviors with shared properties', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.eventsFunctionsExtensions[0].eventsBasedBehaviors[0].sharedPropertyDescriptors = [
      { name: 'MaximumHealth', type: 'Number', value: '100' },
    ];
    project.layouts[0].behaviorsSharedData = [
      {
        name: 'Health',
        type: 'Combat::Health',
        MaximumHealth: 80,
      },
    ];

    const files = decomposeLegacyProjectToFiles(project);
    const sceneSettings = files['game://scenes/Main/scene.settings'];

    expect(sceneSettings).toMatch(/\[\[[^\]]*behaviorsSharedData\]\]/);
    expect(
      composeLegacyProjectFromFiles(files).layouts[0].behaviorsSharedData
    ).toEqual(project.layouts[0].behaviorsSharedData);
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
      files['game://extensions/Combat/functions/ResetCombat.settings']
    ).toContain('order = 1');
  });

  test('rejects namespaced settings-file indexes from early drafts', () => {
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

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_LOCAL_SETTINGS' })
    );
  });

  test('rejects a project that declares an obsolete events DSL grammar', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files[MULTI_FILE_ENTRY_URI] = files[MULTI_FILE_ENTRY_URI].replace(
      'eventsDslVersion = "3.0"',
      'eventsDslVersion = "1.3"'
    );

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_UNSUPPORTED_VERSION' })
    );
  });

  test('rejects version 2 multi-file settings without compatibility loading', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files[MULTI_FILE_ENTRY_URI] = files[MULTI_FILE_ENTRY_URI].replace(
      `combinedSettingsFormatVersion = ${MULTI_FILE_FORMAT_VERSION}`,
      'combinedSettingsFormatVersion = 2'
    );
    files['game://externals/external.settings'] = 'not valid TOML';

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_UNSUPPORTED_VERSION' })
    );
  });

  test('rejects resources embedded in project.gdevelop', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.resources = { resources: [], resourceFolders: [] };
    const files = decomposeLegacyProjectToFiles(project);
    delete files[MULTI_FILE_RESOURCES_URI];
    files[MULTI_FILE_ENTRY_URI] += `
[project.resources]
resources = []
resourceFolders = []
`;

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_LOCAL_SETTINGS' })
    );
  });

  test('rejects constants embedded in project.gdevelop', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.constants = { mode: 'embedded' };
    const files = decomposeLegacyProjectToFiles(project);
    delete files[MULTI_FILE_CONSTANTS_URI];
    files[MULTI_FILE_ENTRY_URI] += `
[project.constants]
mode = "embedded"
`;

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_LOCAL_SETTINGS' })
    );
  });

  test('requires constants.toml and preserves an empty Constants document', () => {
    const withoutConstants = JSON.parse(JSON.stringify(projectFixture));
    delete withoutConstants.constants;
    const filesWithoutConstants = decomposeLegacyProjectToFiles(
      withoutConstants
    );
    expect(filesWithoutConstants[MULTI_FILE_CONSTANTS_URI]).toBeUndefined();
    expect(() => composeLegacyProjectFromFiles(filesWithoutConstants)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_MISSING_FILE' })
    );

    const withEmptyConstants = JSON.parse(JSON.stringify(projectFixture));
    withEmptyConstants.constants = {};
    const filesWithEmptyConstants = decomposeLegacyProjectToFiles(
      withEmptyConstants
    );
    expect(filesWithEmptyConstants[MULTI_FILE_CONSTANTS_URI]).toBe('\n');
    expect(
      composeLegacyProjectFromFiles(filesWithEmptyConstants).constants
    ).toEqual({});
  });

  test('writes Constants as unwrapped root TOML data', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.constants = {
      sheet: {
        row: { column: 'ssdfs', column2: 'ss' },
        row2: { column: 'zzz', column2: 'ssfssdfsf' },
      },
    };

    const files = decomposeLegacyProjectToFiles(project);

    const expectedToml = `[sheet.row]
column = "ssdfs"
column2 = "ss"

[sheet.row2]
column = "zzz"
column2 = "ssfssdfsf"
`;
    expect(files[MULTI_FILE_CONSTANTS_URI]).toBe(expectedToml);
    expect(serializeConstantsToToml(project.constants)).toBe(expectedToml);
    expect(parseConstantsFromToml(expectedToml)).toEqual(project.constants);
    expect(composeLegacyProjectFromFiles(files).constants).toEqual(
      project.constants
    );
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
    const layoutSource = files['game://scenes/Main/scene.settings'];
    const settingsDocument = parseTomlSource(
      files['game://scenes/Main/scene.settings']
    );
    const layoutDocument = settingsDocument.layout;
    expect(layoutSource).toContain('[layout]\nversion = 1\nbackground = ');
    expect(layoutDocument).not.toHaveProperty('objects');
    expect(layoutDocument).not.toHaveProperty('objectsFolderStructure');
    expect(layoutDocument).not.toHaveProperty('variables');
    expect(layoutDocument).not.toHaveProperty('objectsGroups');
    expect(layoutDocument).not.toHaveProperty('title');
    expect(settingsDocument).not.toHaveProperty('objects');
    const objectSettingsDocument = parseTomlSource(
      files['game://scenes/Main/objects/Player.settings']
    );
    expect(objectSettingsDocument).toMatchObject({
      kind: 'object',
      order: 0,
      folder: ['Actors'],
      name: 'Player',
      type: 'Sprite',
      behaviors: [
        {
          name: 'PlatformerObject',
          type: 'PlatformBehavior::PlatformerObjectBehavior',
        },
      ],
    });
    expect(settingsDocument).not.toHaveProperty('objectsFolderStructure');
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
      files['game://objects/GlobalPlayer.settings']
    );
    const output = composeLegacyProjectFromFiles(files);

    expect(projectSettings).not.toHaveProperty('objects');
    expect(objectSettings).toMatchObject({
      kind: 'object',
      order: 0,
      folder: ['Actors'],
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

  test('validates attached behaviors with catalog serialized property keys', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].objects = [
      {
        name: 'Player',
        type: 'Sprite',
        behaviors: [{ name: 'Move', type: 'Test::Move', Speed: 12 }],
      },
    ];
    const files = decomposeLegacyProjectToFiles(project);
    const objectUri = 'game://scenes/Main/objects/Player.settings';
    const options = {
      behaviorPropertySchemasByType: {
        'Test::Move': {
          keySpace: 'serialized',
          unknownPropertyPolicy: 'error',
          properties: [
            {
              authoringKey: 'Speed',
              serializedKey: 'speed',
              type: 'Number',
            },
          ],
        },
      },
    };

    expect(() => composeLegacyProjectFromFiles(files, options)).toThrow(
      expect.objectContaining({ code: 'BEHAVIOR_PROPERTY_KEY_MISMATCH' })
    );
    files[objectUri] = files[objectUri].replace('Speed = 12', 'speed = 12');
    expect(
      composeLegacyProjectFromFiles(files, options).layouts[0].objects[0]
        .behaviors[0]
    ).toMatchObject({ name: 'Move', type: 'Test::Move', speed: 12 });
  });

  test('preserves behavior properties omitted from an authoring schema', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].objects = [
      {
        name: 'Player',
        type: 'Sprite',
        behaviors: [
          {
            name: 'Physics',
            type: 'Test::Strict',
            speed: 12,
            hiddenRuntimeValue: 99,
            privateRuntimeValue: 'secret',
          },
          {
            name: 'Compatibility',
            type: 'Test::Preserve',
            pluginOwnedValue: 'kept',
          },
        ],
      },
    ];
    project.layouts[0].instances = [
      {
        name: 'Player',
        x: 0,
        y: 0,
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
            name: 'Physics',
            type: 'Test::Strict',
            speed: 24,
            hiddenRuntimeValue: 199,
            privateRuntimeValue: 'instance-secret',
          },
          {
            name: 'Compatibility',
            type: 'Test::Preserve',
            pluginOwnedValue: 'instance-kept',
          },
        ],
      },
    ];
    const options = {
      behaviorPropertySchemasByType: {
        'Test::Strict': {
          keySpace: 'serialized',
          unknownPropertyPolicy: 'preserve',
          properties: [
            {
              authoringKey: 'Speed',
              serializedKey: 'speed',
              type: 'Number',
            },
          ],
        },
        'Test::Preserve': {
          keySpace: 'serialized',
          unknownPropertyPolicy: 'preserve',
          properties: [],
        },
      },
    };

    const files = decomposeLegacyProjectToFiles(project, options);
    const objectSource = files['game://scenes/Main/objects/Player.settings'];
    const layoutSource = files['game://scenes/Main/scene.settings'];
    expect(objectSource).toContain('speed = 12');
    expect(layoutSource).toContain('speed = 24');
    expect(objectSource).toContain('hiddenRuntimeValue = 99');
    expect(objectSource).toContain('privateRuntimeValue = "secret"');
    expect(layoutSource).toContain('hiddenRuntimeValue = 199');
    expect(layoutSource).toContain('privateRuntimeValue = "instance-secret"');
    expect(objectSource).toContain('pluginOwnedValue = "kept"');
    expect(layoutSource).toContain('pluginOwnedValue = "instance-kept"');

    const composed = composeLegacyProjectFromFiles(files, options);
    expect(composed.layouts[0].objects[0].behaviors[0]).toEqual({
      name: 'Physics',
      type: 'Test::Strict',
      speed: 12,
      hiddenRuntimeValue: 99,
      privateRuntimeValue: 'secret',
    });
    expect(
      composed.layouts[0].instances[0].behaviorOverridings[0]
    ).toMatchObject({
      name: 'Physics',
      type: 'Test::Strict',
      speed: 24,
      hiddenRuntimeValue: 199,
      privateRuntimeValue: 'instance-secret',
    });
    expect(areLegacyProjectsEquivalent(project, composed, options)).toBe(true);
    expect(project.layouts[0].objects[0].behaviors[0]).toHaveProperty(
      'hiddenRuntimeValue',
      99
    );
  });

  test('writes Sprite point settings as inline TOML values', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.objects = [
      {
        name: 'Player',
        type: 'Sprite',
        behaviors: [],
        animations: [
          {
            name: 'Idle',
            directions: [
              {
                looping: false,
                timeBetweenFrames: 0.1,
                sprites: [
                  {
                    image: 'Player.png',
                    originPoint: { name: 'origine', x: 0, y: 0 },
                    centerPoint: {
                      name: 'centre',
                      x: 16,
                      y: 16,
                      automatic: true,
                    },
                    points: [{ name: 'Muzzle', x: 28, y: 8 }],
                    hasCustomCollisionMask: true,
                    customCollisionMask: [
                      [{ x: 0, y: 0 }, { x: 32, y: 0 }, { x: 16, y: 32 }],
                    ],
                  },
                ],
              },
            ],
            useMultipleDirections: false,
          },
        ],
      },
    ];

    const files = decomposeLegacyProjectToFiles(project);
    const source = files['game://objects/Player.settings'];

    expect(source).toContain(
      'originPoint = { name = "origine", x = 0, y = 0 }'
    );
    expect(source).toContain(
      'centerPoint = { name = "centre", x = 16, y = 16, automatic = true }'
    );
    expect(source).toContain('points = [ { name = "Muzzle", x = 28, y = 8 } ]');
    expect(source).toContain(
      'customCollisionMask = [ [ { x = 0, y = 0 }, { x = 32, y = 0 }, { x = 16, y = 32 } ] ]'
    );
    expect(source).not.toMatch(
      /^\[+.*(?:originPoint|centerPoint|points|customCollisionMask)\]+$/m
    );
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('writes empty Sprite point and variable arrays compactly', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].objects = [
      {
        name: 'Board',
        type: 'Sprite',
        variables: [],
        behaviors: [],
        animations: [
          {
            name: '',
            directions: [
              {
                looping: false,
                timeBetweenFrames: 0.1,
                sprites: [
                  {
                    image: 'board.svg',
                    originPoint: { name: 'origine', x: 0, y: 0 },
                    centerPoint: {
                      name: 'centre',
                      x: 0,
                      y: 0,
                      automatic: true,
                    },
                    points: [],
                    hasCustomCollisionMask: false,
                    customCollisionMask: [],
                  },
                ],
              },
            ],
            useMultipleDirections: false,
          },
        ],
      },
    ];

    const files = decomposeLegacyProjectToFiles(project);
    const source = files['game://scenes/Main/objects/Board.settings'];

    expect(source).toContain('points = [ ]');
    expect(source).toContain('customCollisionMask = [ ]');
    expect(source).not.toContain('[  ]');
    expect(source).toContain('variables = [ ]');
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('rejects namespaced serialized folder trees without compatibility', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    files['game://extensions/Combat/extension.settings'] += `
[extensions.Combat.eventsFunctionsFolderStructure]
folderName = "__ROOT"
`;

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({
        code: 'MULTIFILE_INVALID_LOCAL_SETTINGS',
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

  test('stores prefab and behavior functions as flat same-stem pairs', () => {
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
      'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage.settings';
    const behaviorFunctionUri =
      'game://extensions/Combat/behaviors/Health/functions/Heal.settings';
    const prefabFunction = parseTomlSource(files[prefabFunctionUri]);
    const behaviorFunction = parseTomlSource(files[behaviorFunctionUri]);
    const output = composeLegacyProjectFromFiles(files);
    const outputPrefab =
      output.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    const outputBehavior =
      output.eventsFunctionsExtensions[0].eventsBasedBehaviors[0];

    expect(prefabFunction).toMatchObject({
      kind: 'function',
      order: 0,
      folder: ['Combat actions'],
      name: 'TakeDamage',
    });
    expect(behaviorFunction).toMatchObject({
      kind: 'function',
      order: 0,
      folder: ['Recovery'],
      name: 'Heal',
    });
    expect(prefabFunction).not.toHaveProperty('events');
    expect(behaviorFunction).not.toHaveProperty('events');
    expect(
      parseTomlSource(
        files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
      )
    ).not.toHaveProperty('functions');
    expect(
      parseTomlSource(
        files['game://extensions/Combat/behaviors/Health/behavior.settings']
      )
    ).not.toHaveProperty('functions');
    expect(outputPrefab.eventsFunctionsFolderStructure).toEqual(
      prefab.eventsFunctionsFolderStructure
    );
    expect(outputBehavior.eventsFunctionsFolderStructure).toEqual(
      behavior.eventsFunctionsFolderStructure
    );
    expect(areLegacyProjectsEquivalent(project, output)).toBe(true);
  });

  test('rejects malformed folder grouping values', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].objects = [
      { name: 'Player', type: 'Sprite', behaviors: [] },
    ];
    const files = decomposeLegacyProjectToFiles(project);
    const objectUri = 'game://scenes/Main/objects/Player.settings';
    files[objectUri] = files[objectUri].replace(
      'folder = [ ]',
      'folder = "Actors"'
    );

    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_SCHEMA' })
    );
  });

  test('rejects invalid or stray owner-function source paths', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const functionUri =
      'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage.settings';
    files[functionUri] +=
      'events = "game://extensions/Combat/prefabs/Enemy/TakeDamage.events"\n';
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_RETIRED_FUNCTION_SOURCE' })
    );

    const filesWithStraySettings = decomposeLegacyProjectToFiles(
      projectFixture
    );
    filesWithStraySettings[
      'game://extensions/Combat/behaviors/Health/functions/Recovery/Heal/function.settings'
    ] = `kind = "function"\nsettingsFormatVersion = ${MULTI_FILE_FORMAT_VERSION}\n`;
    expect(() => composeLegacyProjectFromFiles(filesWithStraySettings)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_RETIRED_FUNCTION_SOURCE' })
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
    prefab.objectsGroups = [serializedObjectGroup('Parts', ['Body'])];
    const files = decomposeLegacyProjectToFiles(project);
    const settingsDocument = parseTomlSource(
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
    );
    const layoutDocument = settingsDocument.layout;
    const prefabSettings = settingsDocument;

    expect(layoutDocument).not.toHaveProperty('objects');
    expect(layoutDocument).not.toHaveProperty('objectsFolderStructure');
    expect(layoutDocument).not.toHaveProperty('objectsGroups');
    expect(prefabSettings).not.toHaveProperty('objects');
    expect(prefabSettings.objectGroups).toEqual({ Parts: ['Body'] });
    expect(
      parseTomlSource(
        files['game://extensions/Combat/prefabs/Enemy/objects/Body.settings']
      )
    ).toMatchObject({
      kind: 'object',
      order: 0,
      folder: ['Visuals'],
      name: 'Body',
      type: 'Sprite',
      behaviors: [{ name: 'Tween', type: 'Tween::TweenBehavior' }],
    });
    expect(
      composeLegacyProjectFromFiles(files).eventsFunctionsExtensions[0]
        .eventsBasedObjects[0].objects
    ).toEqual(prefab.objects);
  });

  test('round-trips hidden behavior properties without advertising them', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const behaviorDefinition =
      project.eventsFunctionsExtensions[0].eventsBasedBehaviors[0];
    behaviorDefinition.propertyDescriptors = [
      { name: 'VisibleValue', type: 'Number', value: '5' },
      {
        name: 'RuntimeValue',
        type: 'Number',
        value: '0',
        hidden: true,
      },
    ];
    const makeObject = (name: string) => ({
      name,
      type: 'Sprite',
      behaviors: [
        {
          name: 'Health',
          type: 'Combat::Health',
          VisibleValue: 7,
          RuntimeValue: 99,
        },
      ],
    });
    project.objects = [makeObject('GlobalPlayer')];
    project.layouts[0].objects = [makeObject('ScenePlayer')];
    const prefab = project.eventsFunctionsExtensions[0].eventsBasedObjects[0];
    prefab.objects = [makeObject('PrefabPlayer')];
    prefab.variants[0].objects = [makeObject('VariantPlayer')];

    const objectUris = [
      'game://objects/GlobalPlayer.settings',
      'game://scenes/Main/objects/ScenePlayer.settings',
      'game://extensions/Combat/prefabs/Enemy/objects/PrefabPlayer.settings',
      'game://extensions/Combat/prefabs/Enemy/variants/Armored/objects/VariantPlayer.settings',
    ];
    const files = decomposeLegacyProjectToFiles(project);
    objectUris.forEach(objectUri => {
      const objectDocument = parseTomlSource(files[objectUri]);
      const attachedBehavior = objectDocument.behaviors[0];
      expect(attachedBehavior).toMatchObject({
        name: 'Health',
        type: 'Combat::Health',
        VisibleValue: 7,
        RuntimeValue: 99,
      });
      expect(files[objectUri]).toContain('RuntimeValue = 99');
    });
    const composed = composeLegacyProjectFromFiles(files);
    const composedObjects = [
      composed.objects[0],
      composed.layouts[0].objects[0],
      composed.eventsFunctionsExtensions[0].eventsBasedObjects[0].objects[0],
      composed.eventsFunctionsExtensions[0].eventsBasedObjects[0].variants[0]
        .objects[0],
    ];
    composedObjects.forEach(object => {
      expect(object.behaviors[0]).toHaveProperty('RuntimeValue', 99);
    });
    expect(areLegacyProjectsEquivalent(project, composed)).toBe(true);

    const objectUri = 'game://scenes/Main/objects/ScenePlayer.settings';
    const filesWithHiddenProperty = { ...files };
    filesWithHiddenProperty[objectUri] = files[objectUri].replace(
      'RuntimeValue = 99',
      'RuntimeValue = 123'
    );
    expect(
      composeLegacyProjectFromFiles(filesWithHiddenProperty).layouts[0]
        .objects[0].behaviors[0]
    ).toHaveProperty('RuntimeValue', 123);
  });

  test('stores every settings-owned object group in a compact objectGroups table', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const extension = project.eventsFunctionsExtensions[0];
    const prefab = extension.eventsBasedObjects[0];
    const behavior = extension.eventsBasedBehaviors[0];
    project.objectsGroups = [
      serializedObjectGroup(
        'Global Actors',
        ['GlobalPlayer', 'GlobalEnemy'],
        ['PlatformBehavior::PlatformerObjectBehavior']
      ),
    ];
    project.layouts[0].objectsGroups = [
      serializedObjectGroup('Buttons', ['PauseButton', 'Retry']),
    ];
    extension.eventsFunctions[0].objectGroups = [
      serializedObjectGroup('Targets', ['Target', 'OtherTarget']),
    ];
    prefab.objectsGroups = [serializedObjectGroup('Parts', ['Body', 'Label'])];
    prefab.variants[0].objectsGroups = [
      serializedObjectGroup('Variant Parts', ['ArmoredBody']),
    ];
    prefab.eventsFunctions[0].objectGroups = [
      serializedObjectGroup('Hit Targets', ['Target']),
    ];
    behavior.eventsFunctions[0].objectGroups = [
      serializedObjectGroup('Healing Targets', ['Target']),
    ];

    const files = decomposeLegacyProjectToFiles(project);
    const projectSettings = parseTomlSource(files[MULTI_FILE_ENTRY_URI]);
    const sceneSettings = parseTomlSource(
      files['game://scenes/Main/scene.settings']
    );
    const extensionFunctionSettings = parseTomlSource(
      files['game://extensions/Combat/functions/CalculateDamage.settings']
    );
    const prefabSettings = parseTomlSource(
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
    );
    const prefabFunctionSettings = parseTomlSource(
      files[
        'game://extensions/Combat/prefabs/Enemy/functions/TakeDamage.settings'
      ]
    );
    const behaviorFunctionSettings = parseTomlSource(
      files['game://extensions/Combat/behaviors/Health/functions/Heal.settings']
    );
    const variantSettings = parseTomlSource(
      files[
        'game://extensions/Combat/prefabs/Enemy/variants/Armored/variant.settings'
      ]
    );

    expect(projectSettings.objectGroups).toEqual({
      'Global Actors': ['GlobalPlayer', 'GlobalEnemy'],
    });
    expect(projectSettings.objectGroupRequiredBehaviors).toEqual({
      'Global Actors': ['PlatformBehavior::PlatformerObjectBehavior'],
    });
    expect(sceneSettings.objectGroups).toEqual({
      Buttons: ['PauseButton', 'Retry'],
    });
    expect(extensionFunctionSettings.objectGroups).toEqual({
      Targets: ['Target', 'OtherTarget'],
    });
    expect(prefabSettings.objectGroups).toEqual({
      Parts: ['Body', 'Label'],
    });
    expect(variantSettings.objectGroups).toEqual({
      'Variant Parts': ['ArmoredBody'],
    });
    expect(prefabFunctionSettings.objectGroups).toEqual({
      'Hit Targets': ['Target'],
    });
    expect(behaviorFunctionSettings.objectGroups).toEqual({
      'Healing Targets': ['Target'],
    });
    expect(files[MULTI_FILE_ENTRY_URI]).toContain('[objectGroups]');
    expect(files[MULTI_FILE_ENTRY_URI]).toContain(
      '"Global Actors" = [ "GlobalPlayer", "GlobalEnemy" ]'
    );
    expect(files[MULTI_FILE_ENTRY_URI]).toContain(
      '[objectGroupRequiredBehaviors]'
    );
    expect(
      files[
        'game://extensions/Combat/prefabs/Enemy/variants/Armored/variant.settings'
      ]
    ).toContain('[objectGroups]');
    expect(
      Object.values(files)
        .filter(source => typeof source === 'string')
        .join('\n')
    ).not.toMatch(/\[\[objectsGroups(?:\.|\]\])/);
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('rejects every retired or malformed object-group source form', () => {
    const filesWithObjectsGroups = decomposeLegacyProjectToFiles(
      projectFixture
    );
    filesWithObjectsGroups[MULTI_FILE_ENTRY_URI] += `
[[objectsGroups]]
name = "Legacy"
objects = [ "Player" ]
`;
    expect(() => composeLegacyProjectFromFiles(filesWithObjectsGroups)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_OBJECT_GROUPS' })
    );

    const functionUri =
      'game://extensions/Combat/functions/CalculateDamage.settings';
    const filesWithArrayGroups = decomposeLegacyProjectToFiles(projectFixture);
    filesWithArrayGroups[functionUri] = filesWithArrayGroups[
      functionUri
    ].replace('objectGroups = { }\n', 'objectGroups = []\n');
    expect(() => composeLegacyProjectFromFiles(filesWithArrayGroups)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_OBJECT_GROUPS' })
    );

    const filesWithOrphanRequirements = decomposeLegacyProjectToFiles(
      projectFixture
    );
    filesWithOrphanRequirements[
      MULTI_FILE_ENTRY_URI
    ] = filesWithOrphanRequirements[MULTI_FILE_ENTRY_URI].replace(
      'objectGroups = { }\n',
      '[objectGroups]\nButtons = [ "Player" ]\n\n[objectGroupRequiredBehaviors]\nMissing = [ "Tween::TweenBehavior" ]\n'
    );
    expect(() =>
      composeLegacyProjectFromFiles(filesWithOrphanRequirements)
    ).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_OBJECT_GROUPS' })
    );

    const filesWithNonStringMember = decomposeLegacyProjectToFiles(
      projectFixture
    );
    filesWithNonStringMember[MULTI_FILE_ENTRY_URI] = filesWithNonStringMember[
      MULTI_FILE_ENTRY_URI
    ].replace('objectGroups = { }\n', '[objectGroups]\nButtons = [ 1 ]\n');
    expect(() =>
      composeLegacyProjectFromFiles(filesWithNonStringMember)
    ).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_OBJECT_GROUPS' })
    );
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
    );
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
      'game://extensions/Combat/prefabs/Enemy/variants/Armored/objects/Shield.settings';
    const objectDocument = parseTomlSource(files[objectUri]);
    const outputVariant = composeLegacyProjectFromFiles(files)
      .eventsFunctionsExtensions[0].eventsBasedObjects[0].variants[0];

    expect(objectDocument).toMatchObject({
      kind: 'object',
      order: 0,
      folder: ['Equipment'],
      type: 'Sprite',
    });
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
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
    ).toContain('grid_size = [16, 24, 32]');
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);
  });

  test('migrates legacy editor RGB fields to the current packed grid color', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.eventsFunctionsExtensions[0].eventsBasedObjects[0].editionSettings = {
      gridR: 158,
      gridG: 180,
      gridB: 255,
    };

    const files = decomposeLegacyProjectToFiles(project);
    const output = composeLegacyProjectFromFiles(files);

    expect(
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings']
    ).toContain('grid_color = "#9EB4FF"');
    expect(
      output.eventsFunctionsExtensions[0].eventsBasedObjects[0].editionSettings
        .gridColor
    ).toBe(0x9eb4ff);
    expect(areLegacyProjectsEquivalent(project, output)).toBe(true);
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

  test('rejects retired standalone layout sources without a compatibility path', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const layoutUri = 'game://scenes/Main/Main.layout';
    files[layoutUri] = '<layout version=1 background=#000000></layout>\n';
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_RETIRED_LAYOUT_SOURCE' })
    );
  });

  test('rejects Constant values that TOML cannot represent directly', () => {
    const withNull = JSON.parse(JSON.stringify(projectFixture));
    withNull.constants.nullable = null;
    expect(() => decomposeLegacyProjectToFiles(withNull)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_UNREPRESENTABLE_VALUE' })
    );

    const withMixedArray = JSON.parse(JSON.stringify(projectFixture));
    withMixedArray.constants.mixed = [1, 'two'];
    expect(() => decomposeLegacyProjectToFiles(withMixedArray)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_UNREPRESENTABLE_VALUE' })
    );
  });

  test('treats a Constants rawJson key as ordinary user data', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    expect(files[MULTI_FILE_CONSTANTS_URI]).toContain('[rawJson]');
    expect(files[MULTI_FILE_CONSTANTS_URI]).toContain('userOwned = "kept"');
    expect(composeLegacyProjectFromFiles(files).constants).toEqual(
      projectFixture.constants
    );
  });

  test('does not reinterpret an arbitrary Constants variables key', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.constants.variables = {};
    const files = decomposeLegacyProjectToFiles(project);
    expect(files[MULTI_FILE_CONSTANTS_URI]).toContain('variables = { }');
    expect(composeLegacyProjectFromFiles(files).constants).toEqual(
      project.constants
    );
  });

  test('all settings fragments are local-root TOML documents', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    const settings = Object.keys(files)
      .filter(uri => uri.endsWith('.settings'))
      .map(uri => files[uri]);
    settings.forEach(source => {
      expect(() => parseTomlSource(source)).not.toThrow();
      expect(source).not.toMatch(
        /^\[(?:project|scenes|extensions|externals)\b/m
      );
    });
    expect(() => composeLegacyProjectFromFiles(files)).not.toThrow();
  });

  test('accepts Git-style CRLF line endings in every settings source', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    Object.keys(files).forEach(uri => {
      if (
        !uri.endsWith('.settings') &&
        !uri.endsWith('.toml') &&
        !uri.endsWith('.layout')
      )
        return;
      files[uri] = files[uri].replace(/\n/g, '\r\n');
    });

    const output = composeLegacyProjectFromFiles(files);

    expect(areLegacyProjectsEquivalent(projectFixture, output)).toBe(true);
  });

  test('stores every settings-owned variable definition as a repeated named record', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    const numberVariable = (name, value) => ({
      name,
      type: 'number',
      value,
    });
    project.variables = [
      {
        ...numberVariable('GlobalScore', 12),
        folded: true,
        persistentUuid: 'global-score-variable',
      },
    ];
    project.layouts[0].variables = [
      { name: 'SceneState', type: 'string', value: 'Ready' },
    ];
    project.layouts[0].objects = [
      {
        name: 'Player',
        type: 'Sprite',
        behaviors: [],
        variables: [numberVariable('Health', 100)],
      },
    ];
    const extension = project.eventsFunctionsExtensions[0];
    extension.globalVariables = [
      {
        name: 'Difficulty',
        type: 'enum',
        value: 'Hard',
        values: ['Easy', 'Hard'],
      },
    ];
    extension.sceneVariables = [
      {
        name: 'Controllers',
        type: 'array',
        children: [
          {
            type: 'structure',
            children: [
              {
                name: 'Buttons',
                type: 'array',
                children: [
                  {
                    type: 'structure',
                    children: [
                      { name: 'State', type: 'string', value: 'Idle' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    extension.eventsBasedObjects[0].variables = [
      { name: 'Enabled', type: 'boolean', value: true },
    ];
    extension.eventsBasedBehaviors[0].variables = [
      numberVariable('Cooldown', 0.25),
    ];

    const files = decomposeLegacyProjectToFiles(project);
    const extensionSource =
      files['game://extensions/Combat/extension.settings'];
    const projectSource = files[MULTI_FILE_ENTRY_URI];
    const sceneSource = files['game://scenes/Main/scene.settings'];
    const objectSource = files['game://scenes/Main/objects/Player.settings'];
    const prefabSource =
      files['game://extensions/Combat/prefabs/Enemy/prefab.settings'];
    const behaviorSource =
      files['game://extensions/Combat/behaviors/Health/behavior.settings'];

    expect(projectSource).toContain('[[variables]]');
    expect(sceneSource).toContain('[[variables]]');
    expect(objectSource).toContain('[[variables]]');
    expect(extensionSource).toContain('[[globalVariables]]');
    expect(extensionSource).toContain('[[sceneVariables]]');
    expect(prefabSource).toContain('[[variables]]');
    expect(behaviorSource).toContain('[[variables]]');
    expect(extensionSource).toContain(
      'name = "Controllers"\ntype = "array"\nchildren = [ { type = "structure"'
    );
    expect(extensionSource).toContain(
      'name = "Difficulty"\ntype = "enum"\nvalue = "Hard"\nvalues = [ "Easy", "Hard" ]'
    );
    expect(sceneSource).toContain(
      'name = "SceneState"\ntype = "string"\nvalue = "Ready"'
    );
    expect(prefabSource).toContain(
      'name = "Enabled"\ntype = "boolean"\nvalue = true'
    );
    expect(behaviorSource).toContain(
      'name = "Cooldown"\ntype = "number"\nvalue = 0.25'
    );
    Object.keys(files)
      .filter(uri => uri.endsWith('.settings'))
      .forEach(uri => {
        expect(files[uri]).not.toMatch(
          /^\[(?:variables|globalVariables|sceneVariables)\]$/m
        );
        expect(files[uri]).not.toMatch(
          /^(?:variables|globalVariables|sceneVariables)\s*=\s*\[\s*\{/m
        );
      });
    expect(
      areLegacyProjectsEquivalent(project, composeLegacyProjectFromFiles(files))
    ).toBe(true);

    const malformedFiles = { ...files };
    malformedFiles[
      'game://extensions/Combat/extension.settings'
    ] = extensionSource.replace('name = "Controllers"\n', '');
    expect(() => composeLegacyProjectFromFiles(malformedFiles)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_VARIABLES' })
    );

    expect(() =>
      parseTomlSource(
        '[variables]\nScore = [{ type = "number", value = 1 }]\n',
        MULTI_FILE_ENTRY_URI
      )
    ).toThrow(expect.objectContaining({ code: 'MULTIFILE_INVALID_VARIABLES' }));
    expect(() =>
      parseTomlSource(
        'variables = [{ name = "Score", type = "number", value = 1 }]\n',
        MULTI_FILE_ENTRY_URI
      )
    ).toThrow(expect.objectContaining({ code: 'MULTIFILE_INVALID_VARIABLES' }));
    expect(() =>
      parseTomlSource('variables = { }\n', MULTI_FILE_ENTRY_URI)
    ).toThrow(expect.objectContaining({ code: 'MULTIFILE_INVALID_VARIABLES' }));
    expect(() =>
      parseTomlSource(
        '[[variables]]\nname = "Data"\ntype = "structure"\n\n[[variables.children]]\nname = "Value"\ntype = "number"\nvalue = 1\n',
        MULTI_FILE_ENTRY_URI
      )
    ).toThrow(expect.objectContaining({ code: 'MULTIFILE_INVALID_VARIABLES' }));
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
    project.constants.multiline = 'first line\n second line';
    const files = decomposeLegacyProjectToFiles(project);
    const output = composeLegacyProjectFromFiles(files);

    expect(files[MULTI_FILE_CONSTANTS_URI]).toContain(
      'multiline = """\nfirst line\n second line"""'
    );
    expect(output.constants.multiline).toBe('first line\n second line');
  });

  test('stores unsafe JSON integers losslessly outside TOML integer fields', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].behaviorsSharedData = [
      { EasingFactor: 358874684797066000000 },
    ];
    const files = decomposeLegacyProjectToFiles(project);
    const sceneSettings = files['game://scenes/Main/scene.settings'];

    expect(sceneSettings).toContain('[rawJson]');
    expect(sceneSettings).toContain('358874684797066000000');
    expect(composeLegacyProjectFromFiles(files).layouts[0]).toMatchObject({
      behaviorsSharedData: [{ EasingFactor: 358874684797066000000 }],
    });
  });

  test('uses deterministic distinct files for case-colliding object names', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts[0].objects = [
      { name: 'getmoney', type: 'Sprite', behaviors: [] },
      { name: 'GetMoney', type: 'Sprite', behaviors: [] },
    ];
    const files = decomposeLegacyProjectToFiles(project);
    const objectUris = Object.keys(files).filter(uri =>
      uri.startsWith('game://scenes/Main/objects/')
    );

    expect(objectUris).toHaveLength(2);
    expect(new Set(objectUris.map(uri => uri.toLowerCase())).size).toBe(2);
    expect(
      composeLegacyProjectFromFiles(files).layouts[0].objects.map(
        object => object.name
      )
    ).toEqual(['getmoney', 'GetMoney']);
  });

  test('rejects an external layout whose linked scene was removed', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.externalLayouts[0].associatedLayout = 'Removed Scene';
    expect(() => decomposeLegacyProjectToFiles(project)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_EXTERNAL_SCENE_REQUIRED' })
    );
  });

  test('rejects empty external scene associations and retired external settings', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.externalEvents[0].associatedLayout = '';
    expect(() => decomposeLegacyProjectToFiles(project)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_EXTERNAL_SCENE_REQUIRED' })
    );

    const files = decomposeLegacyProjectToFiles(projectFixture);
    files['game://externals/external.settings'] = 'not valid TOML';
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({
        code: 'MULTIFILE_RETIRED_EXTERNAL_SETTINGS',
      })
    );
  });

  test('derives external ownership from scene settings and enforces global order', () => {
    const project = JSON.parse(JSON.stringify(projectFixture));
    project.layouts.push({
      ...JSON.parse(JSON.stringify(project.layouts[0])),
      name: 'Secondary',
      objects: [],
      instances: [],
      events: [],
    });
    project.externalEvents.push({
      name: 'Secondary Logic',
      associatedLayout: 'Secondary',
      events: [],
    });
    const files = decomposeLegacyProjectToFiles(project);
    expect(
      composeLegacyProjectFromFiles(files).externalEvents.map(external => ({
        name: external.name,
        associatedLayout: external.associatedLayout,
      }))
    ).toEqual([
      { name: 'Shared Combat', associatedLayout: 'Main' },
      { name: 'Secondary Logic', associatedLayout: 'Secondary' },
    ]);

    const secondarySettingsUri =
      'game://scenes/Secondary/external-events/Secondary%20Logic/external-events.settings';
    files[secondarySettingsUri] = files[secondarySettingsUri].replace(
      'order = 1',
      'order = 3'
    );
    expect(() => composeLegacyProjectFromFiles(files)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_SCHEMA' })
    );
  });

  test('rejects link metadata and external sources outside the owning scene folder', () => {
    const filesWithLinkMetadata = decomposeLegacyProjectToFiles(projectFixture);
    const ownerSettingsUri =
      'game://scenes/Main/external-events/Shared%20Combat/external-events.settings';
    filesWithLinkMetadata[ownerSettingsUri] = `${
      filesWithLinkMetadata[ownerSettingsUri]
    }linkedScene = "Main"\n`;
    expect(() => composeLegacyProjectFromFiles(filesWithLinkMetadata)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_INVALID_LOCAL_SETTINGS' })
    );

    const filesWithMovedSource = decomposeLegacyProjectToFiles(projectFixture);
    const canonicalUri =
      'game://scenes/Main/external-events/Shared%20Combat/functions/sceneUpdate.events';
    const movedUri = 'game://scenes/Main/Shared%20Combat.events';
    filesWithMovedSource[movedUri] = filesWithMovedSource[canonicalUri];
    delete filesWithMovedSource[canonicalUri];
    expect(() => composeLegacyProjectFromFiles(filesWithMovedSource)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_OWNERSHIP_CONFLICT' })
    );
  });

  test('rejects retired combined external directories and orphan events bodies', () => {
    const filesWithRetiredExternalPath = decomposeLegacyProjectToFiles(
      projectFixture
    );
    const canonicalOwnerUri =
      'game://scenes/Main/external-events/Shared%20Combat/external-events.settings';
    const retiredOwnerUri =
      'game://scenes/Main/externals/Shared%20Combat/external-events.settings';
    filesWithRetiredExternalPath[retiredOwnerUri] =
      filesWithRetiredExternalPath[canonicalOwnerUri];
    Object.keys(filesWithRetiredExternalPath)
      .filter(uri => uri.includes('/external-events/Shared%20Combat/'))
      .forEach(uri => delete filesWithRetiredExternalPath[uri]);
    expect(() =>
      composeLegacyProjectFromFiles(filesWithRetiredExternalPath)
    ).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_RETIRED_EXTERNAL_SOURCE' })
    );

    const filesWithOrphanEvents = decomposeLegacyProjectToFiles(projectFixture);
    filesWithOrphanEvents[
      'game://scenes/Main/external-events/Shared%20Combat/functions/sceneLoad.events'
    ] = '';
    expect(() => composeLegacyProjectFromFiles(filesWithOrphanEvents)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_ORPHAN_EVENTS' })
    );
  });

  test('uses canonical safe game URIs and encoded names', () => {
    expect(encodeManagedName('Shared Combat')).toBe('Shared%20Combat');
    expect(encodeManagedName('NUL')).toBe('%4EUL');
    expect(encodeManagedName('场景')).toBe('%E5%9C%BA%E6%99%AF');
    expect(
      validateGameUri('game://scenes/Main/externals/Shared%20Combat.events')
    ).toBe('scenes/Main/externals/Shared Combat.events');
    expect(validateGameUri('game://scenes/%4EUL/scene.settings')).toBe(
      'scenes/NUL/scene.settings'
    );
  });

  test.each([
    '../outside.events',
    'game://../outside.events',
    'game://scenes\\Main.events',
    'game://C:/game/project.gdevelop',
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
    objectInLayout['game://scenes/Main/scene.settings'] = objectInLayout[
      'game://scenes/Main/scene.settings'
    ].replace('background = ', 'objects = []\nbackground = ');
    expect(() => composeLegacyProjectFromFiles(objectInLayout)).toThrow(
      expect.objectContaining({ code: 'LAYOUT_UNKNOWN_FIELD' })
    );

    const duplicated = decomposeLegacyProjectToFiles(projectFixture);
    const sceneUpdateSettingsUri =
      'game://scenes/Main/functions/sceneUpdate.settings';
    duplicated[sceneUpdateSettingsUri] +=
      'events = "game://scenes/Main/functions/sceneUpdate.events"\n';
    expect(() => composeLegacyProjectFromFiles(duplicated)).toThrow(
      expect.objectContaining({ code: 'MULTIFILE_RETIRED_FUNCTION_SOURCE' })
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

  test('round-trips canonical embedded layout TOML through the multi-file project', () => {
    const files = decomposeLegacyProjectToFiles(projectFixture);
    expect(files['game://scenes/Main/scene.settings']).toMatch(
      /\[layout\]\nversion = 1\nbackground = /
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

    files['game://scenes/Main/scene.settings'] = files[
      'game://scenes/Main/scene.settings'
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
        'game://extensions/Combat/prefabs/Enemy/prefab.settings'
      ]
    ).toContain(childInstance.persistentUuid);
    expect(
      duplicateAcrossLayoutsFiles[
        'game://extensions/Combat/prefabs/Enemy/variants/Armored/variant.settings'
      ]
    ).toContain(childInstance.persistentUuid);
    expect(
      duplicateAcrossLayoutsFiles[
        'game://scenes/Main/external-layout/Duplicate.settings'
      ]
    ).toContain(project.layouts[0].instances[0].persistentUuid);
  });
});
