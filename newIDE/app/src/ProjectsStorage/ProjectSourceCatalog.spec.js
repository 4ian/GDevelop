// @flow

import {
  ProjectSourceCatalogError,
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
      fileKinds: [{ kind: 'project', path: 'project.settings' }],
      settingsOwners: [{ kind: 'project', name: 'Test' }],
      objectTypes: [{ type: 'Sprite' }],
      behaviorTypes: [{ type: 'Tween::TweenBehavior' }],
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
      elements: [
        { element: 'layout' },
        { element: 'layer', variant: 'external reference' },
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
        fileKinds: [{ kind: 'project' }],
        settingsOwners: [],
        objectTypes: [{ type: 'Sprite' }, { type: 'Sprite' }],
        behaviorTypes: [],
        effectTypes: [],
      })
    ).toThrow(ProjectSourceCatalogError);
    expect(() =>
      validateProjectLayoutCatalog({
        ...base('gdevelop-layout-catalog'),
        elements: [{ element: 'layout' }],
        contexts: [{ kind: 'scene' }],
        effectTypes: [],
      })
    ).toThrow(ProjectSourceCatalogError);
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
    expect(
      catalog.fileKinds.find(fileKind => fileKind.kind === 'scene-object')
    ).toMatchObject({
      path: 'scenes/<Scene>/objects/<Object>.settings',
      mountedNamespace: 'scenes."<Scene>".objects."<Object>"',
      tomlRoot: true,
      requiredFields: expect.arrayContaining(['folder']),
    });
    expect(catalog.authoring.rules.join('\n')).toContain(
      'folder = ["Parent", "Child"]'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      'Controllers = [{ type = "array"'
    );
    expect(catalog.authoring.rules.join('\n')).toContain(
      'Never write a whole variable container as variables = { ... }'
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
    expect(catalog.authoring.variableDefinition).toContain(
      'does not repeat name'
    );
    expect(catalog.authoring.variableDefinition).toContain('[variables]');
    const entry = catalog.behaviorTypes.find(
      behaviorEntry => behaviorEntry.type === behaviorType
    );

    expect(entry).toBeDefined();
    expect(entry.properties).toEqual([
      {
        name: 'Speed',
        type: 'Number',
        defaultValue: '42',
        label: 'Speed',
      },
      {
        name: 'Platformer',
        type: 'Behavior',
        defaultValue: '',
        label: 'Platformer behavior',
        extraInfo: ['PlatformBehavior::PlatformerObjectBehavior'],
      },
    ]);
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
