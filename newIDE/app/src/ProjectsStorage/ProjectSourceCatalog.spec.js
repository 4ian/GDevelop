// @flow

import {
  ProjectSourceCatalogError,
  buildBehaviorPropertySchemasByType,
  buildProjectLayoutCatalog,
  buildProjectSettingsCatalog,
  serializeProjectLayoutCatalog,
  serializeProjectSettingsCatalog,
  validateProjectLayoutCatalog,
  validateProjectSettingsCatalog,
} from './ProjectSourceCatalog';
import { insertNewEventsBasedBehavior } from '../EventsFunctionsList/CreateEventsBasedBehavior';
import { reloadProjectEventsFunctionsExtensionMetadata } from '../EventsFunctionsExtensionsLoader';
import { serializeToJSObject } from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

const base = format => ({
  format,
  formatVersion: 1,
  project: { name: 'Test', uuid: 'test' },
  authoring: { rules: [] },
  counts: {},
});

describe('project source catalogs', () => {
  test('validates and compactly serializes a settings catalog', () => {
    const catalog = {
      ...base('gdevelop-settings-catalog'),
      fileKinds: [
        {
          kind: 'project',
          path: 'project.settings',
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
    };

    const source = serializeProjectSettingsCatalog(catalog);
    expect(JSON.parse(source)).toEqual(catalog);
    expect(source).toContain('\n{"type":"Sprite"}\n');
    expect(validateProjectSettingsCatalog(JSON.parse(source))).toEqual(catalog);
  });

  test('validates and compactly serializes a layout catalog', () => {
    const catalog = {
      ...base('gdevelop-layout-catalog'),
      tables: [
        { table: 'layout', header: '[layout]' },
        {
          table: 'layers',
          header: '[[layers]]',
          variant: 'external reference',
        },
      ],
      contexts: [
        {
          kind: 'scene',
          owner: { scene: 'Main' },
          layers: [''],
          objects: [],
        },
      ],
      effectTypes: [],
      behaviorOverrideSchemas: [],
    };

    const source = serializeProjectLayoutCatalog(catalog);
    expect(JSON.parse(source)).toEqual(catalog);
    expect(source).toContain('\n{"kind":"scene"');
    expect(validateProjectLayoutCatalog(JSON.parse(source))).toEqual(catalog);
  });

  test('rejects duplicate type and malformed context entries', () => {
    expect(() =>
      validateProjectSettingsCatalog({
        ...base('gdevelop-settings-catalog'),
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
        ...base('gdevelop-settings-catalog'),
        fileKinds: [{ kind: 'project' }],
        settingsOwners: [],
        objectTypes: [],
        behaviorTypes: [],
        effectTypes: [],
      })
    ).toThrow('File kind project must declare a schema');
    expect(() =>
      validateProjectLayoutCatalog({
        ...base('gdevelop-layout-catalog'),
        tables: [{ table: 'layout', header: '[layout]' }],
        contexts: [{ kind: 'scene' }],
        effectTypes: [],
        behaviorOverrideSchemas: [],
      })
    ).toThrow(ProjectSourceCatalogError);
  });

  test('generates the flat layout TOML authoring schema', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const catalog = buildProjectLayoutCatalog({
      project,
      serializedProject: {
        objects: [],
        layouts: [],
        externalLayouts: [],
        eventsFunctionsExtensions: [],
      },
      effectTypes: [],
      behaviorTypes: [],
    });

    expect(catalog.authoring.syntax).toContain('Standard flat TOML');
    expect(catalog.tables.map(table => table.header)).toEqual([
      '[layout]',
      '[editor]',
      '[[layers]]',
      '[[layers]]',
      '[[effects]]',
      '[[instances]]',
      '[[variables]]',
      '[[behaviors]]',
    ]);
    expect(
      catalog.tables.find(table => table.table === 'editor').fields
    ).toContainEqual(
      expect.objectContaining({ name: 'selected_layer_unresolved' })
    );
    expect(
      catalog.tables.find(table => table.table === 'instances').fields
    ).toContainEqual(expect.objectContaining({ name: 'properties' }));
    const effectTable = catalog.tables.find(table => table.table === 'effects');
    expect(effectTable.fields).not.toContainEqual(
      expect.objectContaining({ name: 'params' })
    );
    expect(effectTable.parameterFields).toEqual({
      placement: 'direct fields on [[effects]]',
      schema: 'effectTypes[type].parameters',
      scalarTypes: ['number', 'string', 'boolean'],
    });
    expect(catalog.authoring.rules.join('\n')).toContain(
      'Effect parameters are direct fields on [[effects]]'
    );
    expect(catalog.counts.tables).toBe(catalog.tables.length);
    expect(catalog).not.toHaveProperty('elements');
    project.delete();
  });

  test('reads project behavior details from serialized definitions instead of volatile metadata wrappers', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const extensionName = 'CatalogLocalBehaviorTest';
    const extension = project.insertNewEventsFunctionsExtension(
      extensionName,
      0
    );
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
      catalog.fileKinds.find(fileKind => fileKind.kind === 'static-data')
    ).toMatchObject({
      path: 'static-data.toml',
      mountedNamespace: 'editor.staticData',
      tomlRoot: true,
      requiredFields: [],
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
    const externalsSchema = catalog.fileKinds.find(
      fileKind => fileKind.kind === 'externals'
    ).schema;
    expect(externalsSchema.childTables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'eventFiles',
          header: '[[eventFiles]]',
          fields: expect.arrayContaining([
            expect.objectContaining({
              name: 'linkedScene',
              type: expect.stringContaining('scene name'),
              required: true,
            }),
            expect.objectContaining({
              name: 'events',
              type: expect.stringContaining('.events'),
              required: true,
            }),
          ]),
        }),
        expect.objectContaining({
          table: 'layoutFiles',
          header: '[[layoutFiles]]',
          fields: expect.arrayContaining([
            expect.objectContaining({ name: 'linkedScene', required: true }),
            expect.objectContaining({
              name: 'layout',
              type: expect.stringContaining('.layout'),
              required: true,
            }),
          ]),
        }),
      ])
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
        .find(fileKind => fileKind.kind === 'prefab')
        .schema.childTables.find(table => table.table === 'variants')
        .childTables.map(table => table.header)
    ).toEqual(
      expect.arrayContaining([
        '[variants.objectGroups]',
        '[variants.objectGroupRequiredBehaviors]',
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
