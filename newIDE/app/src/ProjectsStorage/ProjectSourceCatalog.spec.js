// @flow

import {
  ProjectSourceCatalogError,
  buildBehaviorPropertySchemasByType,
  buildProjectSettingsCatalog,
  serializeProjectSettingsCatalog,
  validateProjectSettingsCatalog,
} from './ProjectSourceCatalog';
import { insertNewEventsBasedBehavior } from '../EventsFunctionsList/CreateEventsBasedBehavior';
import { insertNewEventsBasedObject } from '../EventsFunctionsList/CreateEventsBasedObject';
import { reloadProjectEventsFunctionsExtensionMetadata } from '../EventsFunctionsExtensionsLoader';
import { serializeToJSObject } from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

const baseSettingsCatalog = () => ({
  format: 'gdevelop-settings-catalog',
  formatVersion: 2,
  project: { name: 'Test', uuid: 'test' },
  authoring: { rules: [] },
  layoutAuthoring: {
    sourceExtension: '.settings',
    storage: 'embedded-settings',
    rootTable: 'layout',
  },
  layoutTables: [],
  layoutContexts: [],
  behaviorOverrideSchemas: [],
  counts: {},
});

describe('project source catalogs', () => {
  test('validates and compactly serializes a settings catalog', () => {
    const catalog = {
      ...baseSettingsCatalog(),
      fileKinds: [
        {
          kind: 'project',
          path: 'project.gdevelop',
          requiredMarker: { field: 'kind', value: 'project' },
          schema: {
            rootFields: [{ name: 'kind', type: 'string' }],
            childTables: [],
          },
        },
      ],
      settingsOwners: [{ kind: 'project', name: 'Test' }],
      objectTypes: [{ type: 'Sprite' }],
      behaviorTypes: [
        {
          type: 'Tween::TweenBehavior',
          keySpace: 'serialized',
          unknownPropertyPolicy: 'error',
          properties: [],
          sharedProperties: [],
        },
      ],
      effectTypes: [{ type: 'Effects::Outline' }],
      layoutTables: [
        { table: 'layout', header: '[layout]' },
        {
          table: 'layers',
          header: '[[layers]]',
          variant: 'external reference',
        },
      ],
      layoutContexts: [
        {
          kind: 'scene',
          owner: { scene: 'Main' },
          layers: [''],
          objects: [],
        },
      ],
      behaviorOverrideSchemas: [],
    };

    const source = serializeProjectSettingsCatalog(catalog);
    expect(JSON.parse(source)).toEqual(catalog);
    expect(source).toContain('\n{"type":"Sprite"}\n');
    expect(source).toContain('\n{"kind":"scene"');
    expect(validateProjectSettingsCatalog(JSON.parse(source))).toEqual(catalog);
  });

  test('rejects duplicate type and malformed context entries', () => {
    expect(() =>
      validateProjectSettingsCatalog({
        ...baseSettingsCatalog(),
        fileKinds: [
          {
            kind: 'project',
            schema: { rootFields: [], childTables: [] },
          },
        ],
        settingsOwners: [],
        objectTypes: [{ type: 'Sprite' }, { type: 'Sprite' }],
        behaviorTypes: [],
        effectTypes: [],
      })
    ).toThrow(ProjectSourceCatalogError);
    expect(() =>
      validateProjectSettingsCatalog({
        ...baseSettingsCatalog(),
        fileKinds: [{ kind: 'project' }],
        settingsOwners: [],
        objectTypes: [],
        behaviorTypes: [],
        effectTypes: [],
      })
    ).toThrow('File kind project must declare a schema');
    expect(() =>
      validateProjectSettingsCatalog({
        ...baseSettingsCatalog(),
        fileKinds: [],
        settingsOwners: [],
        objectTypes: [],
        behaviorTypes: [],
        effectTypes: [],
        layoutTables: [{ table: 'layout', header: '[layout]' }],
        layoutContexts: [{ kind: 'scene' }],
        behaviorOverrideSchemas: [],
      })
    ).toThrow(ProjectSourceCatalogError);
  });

  test('generates the flat layout TOML authoring schema', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const catalog = buildProjectSettingsCatalog({
      project,
      serializedProject: {
        objects: [],
        layouts: [],
        externalLayouts: [],
        eventsFunctionsExtensions: [],
      },
    });

    expect(catalog.layoutAuthoring).toMatchObject({
      sourceExtension: '.settings',
      storage: 'embedded-settings',
      rootTable: 'layout',
    });
    expect(catalog.layoutTables.map(table => table.header)).toEqual([
      '[layout]',
      '[layout.editor]',
      '[[layout.layers]]',
      '[[layout.layers]]',
      '[[layout.effects]]',
      '[[layout.instances]]',
      '[[layout.variables]]',
      '[[layout.behaviors]]',
    ]);
    expect(
      catalog.layoutTables.find(table => table.table === 'editor').fields
    ).toContainEqual(
      expect.objectContaining({ name: 'selected_layer_unresolved' })
    );
    expect(
      catalog.layoutTables.find(table => table.table === 'instances').fields
    ).toContainEqual(expect.objectContaining({ name: 'properties' }));
    expect(
      catalog.layoutTables.find(table => table.table === 'instances').fields
    ).toContainEqual(
      expect.objectContaining({ name: 'hidden', default: false })
    );
    const effectTable = catalog.layoutTables.find(
      table => table.table === 'effects'
    );
    expect(effectTable.fields).not.toContainEqual(
      expect.objectContaining({ name: 'params' })
    );
    expect(effectTable.parameterFields).toEqual({
      placement: 'direct fields on [[effects]]',
      schema: 'effectTypes[type].parameters',
      scalarTypes: ['number', 'string', 'boolean'],
    });
    expect(catalog.layoutAuthoring.rules.join('\n')).toContain(
      'Effect parameters are direct fields on [[effects]]'
    );
    expect(catalog.counts.layoutTables).toBe(catalog.layoutTables.length);
    expect(catalog).not.toHaveProperty('elements');
    project.delete();
  });

  test('generates recursive serialized configuration schemas for every object type', () => {
    // $FlowFixMe[cannot-resolve-module] The extension is loaded by the app in production.
    const scene3DExtensionModule = require('../../../../Extensions/3D/JsExtension');
    const platform = gd.JsPlatform.get();
    const wasScene3DExtensionLoaded = platform.isExtensionLoaded('Scene3D');
    if (!wasScene3DExtensionLoaded) {
      const scene3DExtension = scene3DExtensionModule.createExtension(
        message => message,
        gd
      );
      platform.addNewExtension(scene3DExtension);
      scene3DExtension.delete();
    }
    const project = gd.ProjectHelper.createNewGDJSProject();
    try {
      const serializedProject = serializeToJSObject(project, 'serializeTo');

      const catalog = buildProjectSettingsCatalog({
        project,
        serializedProject,
      });

      expect(
        catalog.objectTypes.every(
          objectType =>
            Array.isArray(objectType.properties) &&
            objectType.schema &&
            Array.isArray(objectType.schema.rootFields) &&
            Array.isArray(objectType.schema.childTables)
        )
      ).toBe(true);
      const model3DObject = catalog.objectTypes.find(
        objectType => objectType.type === 'Scene3D::Model3DObject'
      );
      expect(model3DObject).toBeDefined();
      expect(model3DObject.properties).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            authoringKey: 'modelResourceName',
            serializedPath: 'content.modelResourceName',
          }),
        ])
      );
      const contentTable = model3DObject.schema.childTables.find(
        table => table.table === 'content'
      );
      expect(contentTable).toBeDefined();
      expect(contentTable.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'width', type: 'integer' }),
          expect.objectContaining({
            name: 'modelResourceName',
            type: 'string',
          }),
        ])
      );
      expect(contentTable.childTables).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            table: 'content.sharedAnimationModelResources',
            header: '[[content.sharedAnimationModelResources]]',
            repeated: true,
            fields: [
              expect.objectContaining({ name: 'resourceName', type: 'string' }),
            ],
          }),
          expect.objectContaining({
            table: 'content.animations',
            header: '[[content.animations]]',
            repeated: true,
            fields: expect.arrayContaining([
              expect.objectContaining({ name: 'name', type: 'string' }),
              expect.objectContaining({ name: 'source', type: 'string' }),
              expect.objectContaining({
                name: 'sourceModelResourceName',
                type: 'string',
              }),
              expect.objectContaining({ name: 'loop', type: 'boolean' }),
            ]),
          }),
        ])
      );
      expect(JSON.stringify(model3DObject)).not.toContain(
        '__gdevelop_catalog_'
      );
      expect(serializeProjectSettingsCatalog(catalog)).toContain(
        '[[content.sharedAnimationModelResources]]'
      );
      expect(
        catalog.fileKinds.find(fileKind => fileKind.kind === 'scene-object')
          .schema.dynamicFields.schema
      ).toBe('objectTypes[type].schema');
    } finally {
      project.delete();
      if (!wasScene3DExtensionLoaded) platform.removeExtension('Scene3D');
    }
  });

  test('reads project behavior details from serialized definitions instead of volatile metadata wrappers', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const extensionName = 'CatalogLocalBehaviorTest';
    const extension = project.insertNewEventsFunctionsExtension(
      extensionName,
      0
    );
    const eventsBasedObject = insertNewEventsBasedObject({
      eventsFunctionsExtension: extension,
      isRenderedIn3D: false,
    });
    eventsBasedObject.setName('Weapon');
    eventsBasedObject.setFullName('Weapon');
    eventsBasedObject
      .getPropertyDescriptors()
      .insertNew('Ammo', 0)
      .setType('Number')
      .setValue('3')
      .setLabel('Ammo');
    const behavior = insertNewEventsBasedBehavior(extension);
    behavior.setName('Movement');
    behavior.setFullName('Movement');
    behavior
      .getPropertyDescriptors()
      .insertNew('Speed', 0)
      .setType('Number')
      .setValue('42')
      .setLabel('Speed');
    behavior
      .getPropertyDescriptors()
      .insertNew('Internal', 1)
      .setType('String')
      .setHidden(true);
    behavior
      .getPropertyDescriptors()
      .insertNew('Platformer', 2)
      .setType('Behavior')
      .setLabel('Platformer behavior')
      .addExtraInfo('PlatformBehavior::PlatformerObjectBehavior');
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

    const behaviorType = `${extensionName}::Movement`;
    const platformExtensions = gd.JsPlatform.get().getAllPlatformExtensions();
    let platformExtension;
    for (let index = 0; index < platformExtensions.size(); index++) {
      const candidate = platformExtensions.at(index);
      if (candidate.getName() === extensionName) {
        platformExtension = candidate;
        break;
      }
    }
    expect(platformExtension).toBeDefined();
    const metadata = platformExtension.getBehaviorMetadata(behaviorType);
    const getPropertiesSpy = jest.spyOn(metadata, 'getProperties');
    const getRequiredBehaviorTypesSpy = jest.spyOn(
      metadata,
      'getRequiredBehaviorTypes'
    );
    const serializedProject = serializeToJSObject(project, 'serializeTo');

    const catalog = buildProjectSettingsCatalog({
      project,
      serializedProject,
    });
    const platformerEntry = catalog.behaviorTypes.find(
      behaviorEntry =>
        behaviorEntry.type === 'PlatformBehavior::PlatformerObjectBehavior'
    );
    expect(platformerEntry.properties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Acceleration',
          authoringKey: 'Acceleration',
          serializedKey: 'acceleration',
          type: 'Number',
        }),
      ])
    );
    expect(platformerEntry.unknownPropertyPolicy).toBe('preserve');
    const weaponObjectEntry = catalog.objectTypes.find(
      objectEntry => objectEntry.type === `${extensionName}::Weapon`
    );
    expect(weaponObjectEntry.properties).toEqual([
      expect.objectContaining({
        authoringKey: 'Ammo',
        serializedPath: 'content.Ammo',
        type: 'Number',
      }),
    ]);
    expect(
      weaponObjectEntry.schema.childTables
        .find(table => table.table === 'content')
        .fields.find(field => field.name === 'Ammo')
    ).toMatchObject({ type: 'integer', defaultValue: 3 });
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'scene-object')
    ).toMatchObject({
      path: 'scenes/<Scene>/objects/<Object>.settings',
      mountedNamespace: 'scenes."<Scene>".objects."<Object>"',
      tomlRoot: true,
      requiredFields: expect.arrayContaining(['folder']),
      requiredMarker: { field: 'kind', value: 'object' },
    });
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'constants')
    ).toMatchObject({
      path: 'constants.toml',
      mountedNamespace: 'editor.constants',
      tomlRoot: true,
      requiredFields: [],
    });
    const resourcesFileKind = catalog.fileKinds.find(
      fileKind => fileKind.kind === 'resources'
    );
    if (!resourcesFileKind) throw new Error('Resources file kind is missing.');
    const resourcesTable = resourcesFileKind.schema.childTables.find(
      table => table.table === 'resources'
    );
    if (!resourcesTable) throw new Error('Resources table is missing.');
    expect(
      resourcesTable.fields.find(field => field.name === 'kind')
    ).toMatchObject({
      capabilitiesByValue: {
        image: ['image-2d', 'three-texture'],
        model3D: ['model-3d'],
      },
      capabilityNotes: {
        'three-texture': expect.stringContaining('SVG'),
      },
    });
    expect(catalog.authoring.rules.join('\n')).toContain(
      'folder = ["Parent", "Child"]'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      'name = "Controllers", type = "array"'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      'Keyed [variables] tables'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      '[objectGroups] TOML table'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      '[objectGroupRequiredBehaviors]'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      'originPoint and centerPoint as inline TOML tables'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      'Editor-hidden and deprecated descriptors'
    );
    expect(catalog.authoring.behaviorDefinition).toContain(
      'Preserve unlisted serialized properties'
    );
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'project')
        .commonFields
    ).toContain('objectGroups');
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'project')
        .commonFields
    ).toContain('objectGroupRequiredBehaviors');
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'project')
        .commonFields
    ).not.toContain('objectsGroups');
    expect(
      catalog.fileKinds.every(
        fileKind =>
          fileKind.schema &&
          Array.isArray(fileKind.schema.rootFields) &&
          Array.isArray(fileKind.schema.childTables)
      )
    ).toBe(true);
    expect(
      catalog.fileKinds.some(fileKind => fileKind.kind === 'externals')
    ).toBe(false);
    const testsFileKind = catalog.fileKinds.find(
      fileKind => fileKind.kind === 'tests'
    );
    expect(testsFileKind).toEqual(
      expect.objectContaining({
        path: 'tests.settings',
        requiredMarker: { field: 'kind', value: 'tests' },
        forbiddenFields: expect.arrayContaining([
          'lastRunStatus',
          'lastRunAt',
          'lastRunDurationMs',
          'lastRunFramesExecuted',
        ]),
      })
    );
    expect(
      testsFileKind.schema.childTables.find(table => table.table === 'tests')
        .fields
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'scope' }),
        expect.objectContaining({ name: 'extension' }),
        expect.objectContaining({ name: 'file' }),
      ])
    );
    expect(testsFileKind.forbiddenFields).toContain('source');
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'project')
        .forbiddenFields
    ).toContain('tests');
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'extension')
        .forbiddenFields
    ).toContain('tests');
    const sceneSchema = catalog.fileKinds.find(
      fileKind => fileKind.kind === 'scene'
    ).schema;
    expect(sceneSchema.childTables.map(table => table.table)).not.toContain(
      'externalLayoutFiles'
    );
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'external-layout')
    ).toEqual(
      expect.objectContaining({
        path: 'scenes/<Scene>/external-layout/<ExternalLayout>.settings',
        embeddedLayout: { rootTable: 'layout', contextKind: 'external' },
      })
    );
    expect(
      catalog.fileKinds.find(
        fileKind => fileKind.kind === 'scene-lifecycle-function'
      )
    ).toEqual(
      expect.objectContaining({
        path: 'scenes/<Scene>/functions/<Role>.settings',
        requiredFields: expect.arrayContaining(['order', 'lifecycleRole']),
      })
    );
    expect(
      catalog.fileKinds.find(
        fileKind => fileKind.kind === 'scene-lifecycle-function'
      ).requiredFields
    ).not.toContain('events');
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'external-events')
    ).toEqual(
      expect.objectContaining({
        path:
          'scenes/<Scene>/external-events/<ExternalEvents>/external-events.settings',
      })
    );
    expect(
      catalog.fileKinds.find(
        fileKind => fileKind.kind === 'external-lifecycle-function'
      )
    ).toEqual(
      expect.objectContaining({
        path:
          'scenes/<Scene>/external-events/<ExternalEvents>/functions/<Role>.settings',
      })
    );
    expect(
      catalog.fileKinds
        .find(fileKind => fileKind.kind === 'function')
        .schema.childTables.map(table => table.header)
    ).toEqual(
      expect.arrayContaining([
        '[expressionType]',
        '[[parameters]]',
        '[objectGroups]',
      ])
    );
    expect(
      catalog.fileKinds
        .find(fileKind => fileKind.kind === 'prefab-variant')
        .schema.childTables.map(table => table.header)
    ).toEqual(
      expect.arrayContaining([
        '[objectGroups]',
        '[objectGroupRequiredBehaviors]',
      ])
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      'commonFields is only a search summary'
    );
    expect(catalog.authoring.variableDefinition).toContain(
      'Every record contains name'
    );
    expect(catalog.authoring.variableDefinition).toContain('[[variables]]');
    const entry = catalog.behaviorTypes.find(
      behaviorEntry => behaviorEntry.type === behaviorType
    );

    expect(entry).toBeDefined();
    expect(entry.unknownPropertyPolicy).toBe('preserve');
    expect(entry.properties).toEqual([
      {
        name: 'Speed',
        authoringKey: 'Speed',
        serializedKey: 'Speed',
        type: 'Number',
        defaultValue: '42',
        label: 'Speed',
      },
      {
        name: 'Platformer',
        authoringKey: 'Platformer',
        serializedKey: 'Platformer',
        type: 'Behavior',
        defaultValue: '',
        label: 'Platformer behavior',
        extraInfo: ['PlatformBehavior::PlatformerObjectBehavior'],
      },
    ]);
    expect(entry.properties.map(property => property.name)).not.toContain(
      'Internal'
    );
    expect(buildBehaviorPropertySchemasByType(catalog)[behaviorType]).toEqual(
      expect.objectContaining({
        unknownPropertyPolicy: 'preserve',
        properties: expect.not.arrayContaining([
          expect.objectContaining({ serializedKey: 'Internal' }),
        ]),
      })
    );
    expect(serializeProjectSettingsCatalog(catalog)).not.toContain('Internal');
    expect(entry.requiredBehaviorTypes).toEqual([
      'PlatformBehavior::PlatformerObjectBehavior',
    ]);
    expect(getPropertiesSpy).not.toHaveBeenCalled();
    expect(getRequiredBehaviorTypesSpy).not.toHaveBeenCalled();

    const serializedWithoutBehaviorDefinition = JSON.parse(
      JSON.stringify(serializedProject)
    );
    serializedWithoutBehaviorDefinition.eventsFunctionsExtensions[0].eventsBasedBehaviors = [];
    getPropertiesSpy.mockImplementation(() => {
      throw new WebAssembly.RuntimeError('memory access out of bounds');
    });
    getRequiredBehaviorTypesSpy.mockImplementation(() => {
      throw new WebAssembly.RuntimeError('memory access out of bounds');
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const fallbackCatalog = buildProjectSettingsCatalog({
      project,
      serializedProject: serializedWithoutBehaviorDefinition,
    });
    const fallbackEntry = fallbackCatalog.behaviorTypes.find(
      behaviorEntry => behaviorEntry.type === behaviorType
    );
    expect(fallbackEntry.properties).toEqual([]);
    expect(fallbackEntry.requiredBehaviorTypes).toBeUndefined();
    expect(getPropertiesSpy).toHaveBeenCalled();
    expect(getRequiredBehaviorTypesSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(`properties for behavior ${behaviorType}`),
      expect.any(WebAssembly.RuntimeError)
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `required behavior types for behavior ${behaviorType}`
      ),
      expect.any(WebAssembly.RuntimeError)
    );
    warnSpy.mockRestore();
    getRequiredBehaviorTypesSpy.mockRestore();
    getPropertiesSpy.mockRestore();
    project.delete();
  });
});
