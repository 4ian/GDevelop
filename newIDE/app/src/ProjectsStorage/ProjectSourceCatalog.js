// @flow

import { shouldHideExtension } from '../Version';

const gd: libGDevelop = global.gd;

export const PROJECT_SETTINGS_CATALOG_RELATIVE_PATH =
  '.gdevelop/settings-catalog.json';
export const PROJECT_LAYOUT_CATALOG_RELATIVE_PATH =
  '.gdevelop/layout-catalog.json';

export class ProjectSourceCatalogError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ProjectSourceCatalogError';
    this.code = code;
  }
}

const fail = (message: string): empty => {
  throw new ProjectSourceCatalogError(
    'PROJECT_SOURCE_CATALOG_INVALID',
    message
  );
};

const sortedUnique = (values: Array<string>): Array<string> =>
  Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));

const toArray = (collection: any): Array<any> => {
  if (!collection) return [];
  if (typeof collection.toJSArray === 'function') return collection.toJSArray();
  if (
    typeof collection.size === 'function' &&
    typeof collection.at === 'function'
  ) {
    const result = [];
    for (let index = 0; index < collection.size(); index++) {
      result.push(collection.at(index));
    }
    return result;
  }
  return [];
};

const summarizeProperty = (name: string, property: any): ?Object => {
  if (
    (property.isHidden && property.isHidden()) ||
    (property.isDeprecated && property.isDeprecated())
  ) {
    return null;
  }
  const summary: Object = {
    name,
    type: property.getType(),
  };
  const defaultValue = property.getValue && property.getValue();
  if (defaultValue !== undefined) {
    summary.defaultValue = defaultValue;
  }
  const label = property.getLabel && property.getLabel();
  if (label) summary.label = label;
  const description = property.getDescription && property.getDescription();
  if (description) summary.description = description;
  const group = property.getGroup && property.getGroup();
  if (group) summary.group = group;
  if (property.isAdvanced && property.isAdvanced()) summary.advanced = true;
  const choices = property.getChoices && toArray(property.getChoices());
  if (choices && choices.length) {
    summary.choices = choices.map(choice => ({
      value: choice.getValue(),
      label: choice.getLabel(),
    }));
  }
  const extraInfo = property.getExtraInfo && toArray(property.getExtraInfo());
  if (extraInfo && extraInfo.length) summary.extraInfo = extraInfo;
  return summary;
};

const summarizeProperties = (properties: any): Array<Object> => {
  if (!properties || !properties.keys) return [];
  return toArray(properties.keys())
    .sort((left, right) => String(left).localeCompare(String(right)))
    .map(name => summarizeProperty(String(name), properties.get(name)))
    .filter(Boolean);
};

const getProjectExtensionNames = (serializedProject: Object): Set<string> =>
  new Set(
    (serializedProject.eventsFunctionsExtensions || []).map(extension =>
      String(extension.name || '')
    )
  );

const collectRegisteredTypes = (
  project: gdProject,
  serializedProject: Object
): {|
  objectTypes: Array<Object>,
  behaviorTypes: Array<Object>,
  effectTypes: Array<Object>,
|} => {
  const objectTypes = [];
  const behaviorTypes = [];
  const effectTypes = [];
  const localExtensionNames = getProjectExtensionNames(serializedProject);
  const platform = project.getCurrentPlatform();
  const extensions = toArray(platform.getAllPlatformExtensions());

  extensions.forEach(extension => {
    if (shouldHideExtension(project, extension)) return;
    const extensionName = extension.getName();
    const canUsePrivateTypes = localExtensionNames.has(extensionName);

    toArray(extension.getExtensionObjectsTypes()).forEach(type => {
      const objectType = String(type || '');
      if (!objectType) return;
      const metadata = extension.getObjectMetadata(objectType);
      if (
        gd.MetadataProvider.isBadObjectMetadata(metadata) ||
        (metadata.isHidden && metadata.isHidden()) ||
        (metadata.isPrivate() && !canUsePrivateTypes)
      ) {
        return;
      }
      const entry: Object = {
        type: objectType,
        name: metadata.getFullName() || metadata.getName(),
        description: metadata.getDescription(),
        extension: extensionName,
        renderedIn3D: metadata.isRenderedIn3D(),
      };
      const defaultBehaviors = toArray(metadata.getDefaultBehaviors());
      if (defaultBehaviors.length) {
        entry.defaultBehaviorTypes = sortedUnique(defaultBehaviors);
      }
      objectTypes.push(entry);
    });

    toArray(extension.getBehaviorsTypes()).forEach(type => {
      const behaviorType = String(type || '');
      if (!behaviorType) return;
      const metadata = extension.getBehaviorMetadata(behaviorType);
      if (
        gd.MetadataProvider.isBadBehaviorMetadata(metadata) ||
        (metadata.isHidden && metadata.isHidden()) ||
        (metadata.isPrivate() && !canUsePrivateTypes)
      ) {
        return;
      }
      const entry: Object = {
        type: behaviorType,
        name: metadata.getFullName() || metadata.getName(),
        description: metadata.getDescription(),
        extension: extensionName,
        defaultName: metadata.getDefaultName(),
        properties: summarizeProperties(metadata.getProperties()),
        sharedProperties: summarizeProperties(metadata.getSharedProperties()),
      };
      const objectType = metadata.getObjectType();
      if (objectType) entry.objectType = objectType;
      const requiredBehaviorTypes = toArray(
        metadata.getRequiredBehaviorTypes()
      );
      if (requiredBehaviorTypes.length) {
        entry.requiredBehaviorTypes = sortedUnique(requiredBehaviorTypes);
      }
      behaviorTypes.push(entry);
    });

    toArray(extension.getExtensionEffectTypes()).forEach(type => {
      const effectType = String(type || '');
      if (!effectType) return;
      const metadata = extension.getEffectMetadata(effectType);
      if (gd.MetadataProvider.isBadEffectMetadata(metadata)) return;
      effectTypes.push({
        type: effectType,
        name: metadata.getFullName() || metadata.getType(),
        description: metadata.getDescription(),
        extension: extensionName,
        worksForObjects: !metadata.isMarkedAsNotWorkingForObjects(),
        dimensions: metadata.isMarkedAsOnlyWorkingFor2D()
          ? ['2d']
          : metadata.isMarkedAsOnlyWorkingFor3D()
          ? ['3d']
          : ['2d', '3d'],
        unique: metadata.isMarkedAsUnique(),
        parameters: summarizeProperties(metadata.getProperties()),
      });
    });
  });

  const uniqueByType = entries =>
    Array.from(
      entries
        .reduce((byType, entry) => {
          if (!byType.has(entry.type)) byType.set(entry.type, entry);
          return byType;
        }, new Map())
        .values()
    );
  const byType = (left, right) => String(left.type).localeCompare(right.type);
  return {
    objectTypes: uniqueByType(objectTypes).sort(byType),
    behaviorTypes: uniqueByType(behaviorTypes).sort(byType),
    effectTypes: uniqueByType(effectTypes).sort(byType),
  };
};

const SETTINGS_FILE_KINDS = Object.freeze([
  {
    kind: 'project',
    path: 'project.settings',
    namespace: '[project]',
    requiredFields: ['kind', 'settingsFormatVersion'],
    commonFields: [
      'gdVersion',
      'properties',
      'objects',
      'objectsFolderStructure',
      'objectsGroups',
      'variables',
      'firstLayout',
      'previewLayout',
    ],
    forbiddenFields: [
      'resources',
      'globalConfig',
      'layouts',
      'eventsFunctionsExtensions',
      'externalEvents',
      'externalLayouts',
    ],
  },
  {
    kind: 'resources',
    path: 'resources.settings',
    namespace: '[project.resources]',
    requiredFields: ['kind', 'settingsFormatVersion'],
    commonFields: ['resources', 'resourceFolders'],
  },
  {
    kind: 'config',
    path: 'config.settings',
    namespace: '[project.globalConfig]',
    requiredFields: [],
    commonFields: ['arbitrary project global configuration'],
    note:
      'Format metadata belongs in [gdevelopConfig], never inside [project.globalConfig].',
  },
  {
    kind: 'scene',
    path: 'scenes/<Scene>/scene.settings',
    namespace: '[scenes."<Scene>"]',
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'layout',
      'events',
      'name',
    ],
    commonFields: [
      'objects',
      'objectsFolderStructure',
      'objectsGroups',
      'variables',
      'behaviorsSharedData',
      'runtime/loading/input/sound/sort settings',
    ],
    forbiddenFields: ['instances', 'layers', 'uiSettings', 'r', 'v', 'b'],
  },
  {
    kind: 'externals',
    path: 'externals/external.settings',
    namespace: '[externals]',
    requiredFields: ['kind', 'settingsFormatVersion'],
    commonFields: ['eventFiles', 'layoutFiles'],
  },
  {
    kind: 'extension',
    path: 'extensions/<Extension>/extension.settings',
    namespace: '[extensions."<Extension>"]',
    requiredFields: ['kind', 'settingsFormatVersion', 'order', 'name'],
    commonFields: [
      'metadata',
      'dependencies',
      'variables',
      'eventsFunctionsFolderStructure',
    ],
    forbiddenFields: [
      'eventsFunctions',
      'eventsBasedObjects',
      'eventsBasedBehaviors',
    ],
  },
  {
    kind: 'function',
    path: 'extensions/<Extension>/functions/<Function>/function.settings',
    namespace: '[extensions."<Extension>".functions."<Function>"]',
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'extension',
      'name',
      'events',
      'functionType',
    ],
    commonFields: [
      'signature',
      'parameters',
      'objectGroups',
      'editor metadata',
    ],
    forbiddenFields: ['event body'],
  },
  {
    kind: 'prefab',
    path: 'extensions/<Extension>/prefabs/<Prefab>/prefab.settings',
    namespace: '[extensions."<Extension>".prefabs."<Prefab>"]',
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'name',
      'layout',
    ],
    commonFields: [
      'objects',
      'objectsFolderStructure',
      'objectsGroups',
      'variables',
      'propertyDescriptors',
      'functions',
      'variants',
    ],
    forbiddenFields: [
      'instances',
      'layers',
      'editionSettings',
      'areaMin/Max fields',
    ],
  },
  {
    kind: 'behavior',
    path: 'extensions/<Extension>/behaviors/<Behavior>/behavior.settings',
    namespace: '[extensions."<Extension>".behaviors."<Behavior>"]',
    requiredFields: ['kind', 'settingsFormatVersion', 'order', 'name'],
    commonFields: [
      'variables',
      'propertyDescriptors',
      'sharedPropertyDescriptors',
      'functions',
    ],
    forbiddenFields: ['event bodies'],
  },
]);

const summarizeObjectDefinition = (object: Object): Object => ({
  name: String(object.name || ''),
  type: String(object.type || ''),
  behaviors: (object.behaviors || []).map(behavior => ({
    name: String(behavior.name || ''),
    type: String(behavior.type || ''),
  })),
});

const buildSettingsOwners = (serializedProject: Object): Array<Object> => {
  const owners = [
    {
      kind: 'project',
      name: String(
        (serializedProject.properties && serializedProject.properties.name) ||
          ''
      ),
      objects: (serializedProject.objects || []).map(summarizeObjectDefinition),
    },
  ];
  (serializedProject.layouts || []).forEach(scene => {
    owners.push({
      kind: 'scene',
      name: String(scene.name || ''),
      objects: (scene.objects || []).map(summarizeObjectDefinition),
    });
  });
  (serializedProject.eventsFunctionsExtensions || []).forEach(extension => {
    const extensionName = String(extension.name || '');
    owners.push({
      kind: 'extension',
      name: extensionName,
      functions: (extension.eventsFunctions || []).map(item =>
        String(item.name || '')
      ),
      prefabs: (extension.eventsBasedObjects || []).map(item =>
        String(item.name || '')
      ),
      behaviors: (extension.eventsBasedBehaviors || []).map(item =>
        String(item.name || '')
      ),
    });
    (extension.eventsBasedObjects || []).forEach(prefab => {
      owners.push({
        kind: 'prefab',
        extension: extensionName,
        name: String(prefab.name || ''),
        objects: (prefab.objects || []).map(summarizeObjectDefinition),
        functions: (prefab.eventsFunctions || []).map(item =>
          String(item.name || '')
        ),
        variants: (prefab.variants || []).map(item => String(item.name || '')),
      });
    });
    (extension.eventsBasedBehaviors || []).forEach(behavior => {
      owners.push({
        kind: 'behavior',
        extension: extensionName,
        name: String(behavior.name || ''),
        functions: (behavior.eventsFunctions || []).map(item =>
          String(item.name || '')
        ),
      });
    });
  });
  return owners;
};

const projectIdentity = (project: gdProject): Object => ({
  name: project.getName(),
  uuid: project.getProjectUuid(),
});

export const buildProjectSettingsCatalog = ({
  project,
  serializedProject,
}: {|
  project: gdProject,
  serializedProject: Object,
|}): Object => {
  const registeredTypes = collectRegisteredTypes(project, serializedProject);
  const settingsOwners = buildSettingsOwners(serializedProject);
  return validateProjectSettingsCatalog({
    format: 'gdevelop-settings-catalog',
    formatVersion: 1,
    project: projectIdentity(project),
    authoring: {
      sourceExtension: '.settings',
      syntax: 'TOML 1.0 using append-safe, unindented component fragments.',
      rules: [
        'Read the relevant existing settings file before editing or creating a sibling component.',
        'Every settings file owns exactly one namespace and must parse both independently and when appended to all other settings files.',
        'Use quoted TOML path segments for dynamic names and canonical game:// URIs for .layout and .events references.',
        'Use kind, settingsFormatVersion=1, and contiguous zero-based order fields exactly where the file-kind entry requires them.',
        'Object definitions and attached behaviors belong in scene or prefab settings; instances and per-instance behavior overrides belong in .layout.',
        'Preserve unknown serializer fields. Never invent an object, behavior, or effect type absent from this catalog.',
        'Never edit generated files below .gdevelop or legacy game.json.',
      ],
      objectDefinition:
        'An object definition requires name, type, and behaviors. Preserve its type-specific serializer fields and nested variables/effects.',
      behaviorDefinition:
        'An attached behavior requires a unique object-local name and a registered type; initialize properties from that type metadata or an existing definition.',
    },
    fileKinds: SETTINGS_FILE_KINDS,
    settingsOwners,
    objectTypes: registeredTypes.objectTypes,
    behaviorTypes: registeredTypes.behaviorTypes,
    effectTypes: registeredTypes.effectTypes,
    counts: {
      fileKinds: SETTINGS_FILE_KINDS.length,
      settingsOwners: settingsOwners.length,
      objectTypes: registeredTypes.objectTypes.length,
      behaviorTypes: registeredTypes.behaviorTypes.length,
      effectTypes: registeredTypes.effectTypes.length,
    },
  });
};

const LAYOUT_ELEMENTS = Object.freeze([
  {
    element: 'layout',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    attributes: [
      { name: 'version', type: 'integer', required: true, value: 1 },
      {
        name: 'background',
        type: '#RRGGBB',
        requiredIn: ['scene'],
        forbiddenIn: ['prefab', 'prefab-variant', 'external'],
      },
    ],
    children: ['bounds?', 'editor?', 'layer*'],
  },
  {
    element: 'bounds',
    contexts: ['prefab', 'prefab-variant'],
    attributes: [
      { name: 'min', type: 'number,number,number', required: true },
      { name: 'max', type: 'number,number,number', required: true },
    ],
    empty: true,
  },
  {
    element: 'editor',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    attributes: [
      { name: 'grid', type: 'boolean' },
      {
        name: 'grid-type',
        type: 'enum',
        values: ['rectangular', 'isometric'],
      },
      { name: 'grid-size', type: 'non-negative number,number,number' },
      { name: 'grid-offset', type: 'number,number,number' },
      { name: 'grid-color', type: '#RRGGBB' },
      { name: 'grid-alpha', type: 'number', range: '[0,1]' },
      { name: 'snap', type: 'boolean' },
      { name: 'zoom', type: 'number', range: '[0.01,infinity)' },
      { name: 'window-mask', type: 'boolean' },
      { name: 'selected-layer', type: 'string' },
      {
        name: 'mode',
        type: 'enum',
        values: ['instances-editor', 'embedded-game'],
      },
    ],
    empty: true,
  },
  {
    element: 'layer',
    contexts: ['scene', 'prefab', 'prefab-variant'],
    attributes: [
      { name: 'name', type: 'string', required: true },
      { name: 'rendering', type: 'enum', values: ['', '2d', '3d', '2d+3d'] },
      {
        name: 'camera-type',
        type: 'enum',
        values: ['', 'perspective', 'orthographic'],
      },
      {
        name: 'camera-behavior',
        type: 'enum',
        values: ['do-nothing', 'top-left-anchored-if-never-moved'],
      },
      { name: 'visible', type: 'boolean', default: true },
      { name: 'locked', type: 'boolean', default: false },
      { name: 'lighting', type: 'boolean', default: false },
      { name: 'follow-base-camera', type: 'boolean', default: false },
      { name: 'ambient', type: '#RRGGBB', default: '#C8C8C8' },
      { name: 'near', type: 'number', default: 3 },
      { name: 'far', type: 'number', default: 10000 },
      { name: 'fov', type: 'number', range: '(0,180]', default: 45 },
      {
        name: 'max-2d-distance',
        type: 'positive number',
        default: 5000,
      },
    ],
    children: ['camera*', 'effect*', 'instance*'],
    rules: [
      'far must be greater than near',
      'camera/effect/instance order is strict',
    ],
  },
  {
    element: 'layer',
    variant: 'external reference',
    contexts: ['external'],
    attributes: [
      { name: 'name', type: 'existing linked-scene layer', required: true },
    ],
    children: ['instance*'],
  },
  {
    element: 'camera',
    contexts: ['scene', 'prefab', 'prefab-variant'],
    attributes: [
      {
        name: 'size',
        type: 'default | default(width,height) | widthxheight',
        required: true,
      },
      {
        name: 'viewport',
        type:
          'default | default(left,top,right,bottom) | left,top,right,bottom',
        required: true,
      },
    ],
    empty: true,
  },
  {
    element: 'effect',
    contexts: ['scene', 'prefab', 'prefab-variant'],
    attributes: [
      { name: 'name', type: 'string', required: true },
      { name: 'type', type: 'registered effect type', required: true },
      { name: 'folded', type: 'boolean', default: false },
      { name: 'enabled', type: 'boolean', default: true },
      { name: 'numbers', type: 'strict JSON object of finite numbers' },
      { name: 'strings', type: 'strict JSON object of strings' },
      { name: 'booleans', type: 'strict JSON object of booleans' },
    ],
    empty: true,
  },
  {
    element: 'instance',
    sourceForm: '<ObjectName> or <object of="Exact object name">',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    attributes: [
      { name: 'of', type: 'existing object name', requiredFor: '<object>' },
      { name: 'id', type: 'lowercase UUIDv4', required: true },
      { name: 'order', type: 'non-negative integer' },
      { name: 'at', type: 'x,y | x,y,z', required: true },
      { name: 'rotation', type: 'z | x,y,z', default: 0 },
      { name: 'z-order', type: 'integer', default: 0 },
      { name: 'size', type: 'auto | auto(widthxheight) | widthxheight' },
      { name: 'depth', type: 'number' },
      { name: 'opacity', type: 'integer', range: '[0,255]', default: 255 },
      { name: 'flip', type: 'unique comma-list', values: ['x', 'y', 'z'] },
      { name: 'locked', type: 'bare boolean', default: false },
      { name: 'sealed', type: 'bare boolean', default: false },
      { name: 'keep-ratio', type: 'boolean', default: true },
    ],
    children: ['properties?', 'variables?', 'override*'],
  },
  {
    element: 'properties',
    contexts: ['instance'],
    attributes: [
      { name: 'numbers', type: 'strict JSON object of finite numbers' },
      { name: 'strings', type: 'strict JSON object of strings' },
    ],
    empty: true,
  },
  {
    element: 'variables',
    contexts: ['instance'],
    attributes: [],
    children: ['var*'],
  },
  {
    element: 'var',
    contexts: ['variables', 'var'],
    attributes: [
      { name: 'name', type: 'string', requiredExceptIn: ['array'] },
      {
        name: 'type',
        type: 'enum',
        required: true,
        values: ['string', 'enum', 'number', 'boolean', 'structure', 'array'],
      },
      {
        name: 'value',
        type: 'typed primitive',
        requiredFor: 'primitive types',
      },
      {
        name: 'values',
        type: 'unique JSON string array',
        allowedFor: ['enum'],
      },
      { name: 'folded', type: 'boolean', default: false },
      { name: 'id', type: 'lowercase UUIDv4' },
    ],
    children: [
      'var* for structure or array; primitive variables must be empty',
    ],
  },
  {
    element: 'override',
    contexts: ['instance'],
    attributes: [
      { name: 'behavior', type: 'attached behavior name', required: true },
      { name: 'data', type: 'strict JSON object', required: true },
      { name: 'folded', type: 'boolean', default: false },
      { name: 'muted', type: 'boolean', default: false },
      { name: 'inherited', type: 'boolean', default: false },
      {
        name: 'quick',
        type: 'enum',
        values: ['default', 'visible', 'hidden'],
      },
      {
        name: 'property-visibility',
        type: 'strict JSON object with default|visible|hidden values',
      },
    ],
    empty: true,
  },
]);

const mergeObjects = (
  localObjects: Array<Object>,
  fallbackObjects: Array<Object>
): Array<Object> => {
  const byName: Map<string, Object> = new Map();
  fallbackObjects.forEach(object =>
    byName.set(String(object.name || ''), object)
  );
  localObjects.forEach(object => byName.set(String(object.name || ''), object));
  return Array.from(byName.values());
};

const collectInstancePropertyTypes = (
  instances: Array<Object>,
  objectName: string
): Array<Object> => {
  const types: Map<string, string> = new Map();
  instances
    .filter(instance => String(instance.name || '') === objectName)
    .forEach(instance => {
      (instance.numberProperties || []).forEach(property =>
        types.set(String(property.name || ''), 'number')
      );
      (instance.stringProperties || []).forEach(property =>
        types.set(String(property.name || ''), 'string')
      );
    });
  return Array.from(types, ([name, type]) => ({ name, type })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

const summarizeLayoutObject = (
  object: Object,
  instances: Array<Object>
): Object => {
  const entry: Object = summarizeObjectDefinition(object);
  const instanceProperties = collectInstancePropertyTypes(
    instances,
    entry.name
  );
  if (instanceProperties.length) entry.instanceProperties = instanceProperties;
  return entry;
};

const layoutContext = ({
  kind,
  owner,
  objects,
  instances,
  layerNames,
}: {
  kind: string,
  owner: Object,
  objects: Array<Object>,
  instances: Array<Object>,
  layerNames: Array<string>,
}): Object => ({
  kind,
  owner,
  layers: layerNames,
  objects: objects.map(object => summarizeLayoutObject(object, instances)),
});

const buildLayoutContexts = (serializedProject: Object): Array<Object> => {
  const contexts = [];
  const globalObjects = serializedProject.objects || [];
  (serializedProject.layouts || []).forEach(scene => {
    contexts.push(
      layoutContext({
        kind: 'scene',
        owner: { scene: String(scene.name || '') },
        objects: mergeObjects(scene.objects || [], globalObjects),
        instances: scene.instances || [],
        layerNames: (scene.layers || []).map(layer => String(layer.name || '')),
      })
    );
  });
  (serializedProject.eventsFunctionsExtensions || []).forEach(extension => {
    const extensionName = String(extension.name || '');
    (extension.eventsBasedObjects || []).forEach(prefab => {
      const prefabName = String(prefab.name || '');
      contexts.push(
        layoutContext({
          kind: 'prefab',
          owner: { extension: extensionName, prefab: prefabName },
          objects: prefab.objects || [],
          instances: prefab.instances || [],
          layerNames: (prefab.layers || []).map(layer =>
            String(layer.name || '')
          ),
        })
      );
      (prefab.variants || []).forEach(variant => {
        const variantObjects =
          variant.objects !== undefined
            ? variant.objects
            : prefab.objects || [];
        contexts.push(
          layoutContext({
            kind: 'prefab-variant',
            owner: {
              extension: extensionName,
              prefab: prefabName,
              variant: String(variant.name || ''),
            },
            objects: variantObjects,
            instances: variant.instances || [],
            layerNames: (variant.layers || []).map(layer =>
              String(layer.name || '')
            ),
          })
        );
      });
    });
  });
  (serializedProject.externalLayouts || []).forEach(external => {
    const linkedSceneName = String(external.associatedLayout || '');
    const linkedScene = (serializedProject.layouts || []).find(
      scene => String(scene.name || '') === linkedSceneName
    );
    contexts.push(
      layoutContext({
        kind: 'external',
        owner: {
          external: String(external.name || ''),
          linkedScene: linkedSceneName,
        },
        objects: linkedScene
          ? mergeObjects(linkedScene.objects || [], globalObjects)
          : globalObjects,
        instances: external.instances || [],
        layerNames: linkedScene
          ? (linkedScene.layers || []).map(layer => String(layer.name || ''))
          : [],
      })
    );
  });
  return contexts;
};

export const buildProjectLayoutCatalog = ({
  project,
  serializedProject,
  effectTypes,
}: {|
  project: gdProject,
  serializedProject: Object,
  effectTypes?: Array<Object>,
|}): Object => {
  const registeredEffectTypes =
    effectTypes ||
    collectRegisteredTypes(project, serializedProject).effectTypes;
  const contexts = buildLayoutContexts(serializedProject);
  return validateProjectLayoutCatalog({
    format: 'gdevelop-layout-catalog',
    formatVersion: 1,
    project: projectIdentity(project),
    authoring: {
      sourceExtension: '.layout',
      syntax:
        'GDevelop Layout DSL version 1 component-tree markup (not XML, HTML, TOML, or JSON).',
      rules: [
        'Read the owning settings namespace and the matching context entry before editing a layout.',
        'Use only listed elements and attributes. Text nodes, comments, entities, declarations, CDATA, and unknown markup are forbidden.',
        'Strings use JSON escaping; typed maps use strict JSON; colors are uppercase #RRGGBB.',
        'Preserve existing instance UUIDs. New UUIDv4 values must be lowercase and unique within the owning layout.',
        'Use an existing object name from the matching context. Use <object of="..."> for unsafe or reserved object names.',
        'An override may reference only a behavior already attached to that object in the matching context.',
        'Cameras precede effects, effects precede instances, and properties/variables precede overrides.',
        'Object definitions and attached behaviors belong in .settings, while event logic belongs in .events.',
      ],
    },
    elements: LAYOUT_ELEMENTS,
    contexts,
    effectTypes: registeredEffectTypes,
    counts: {
      elements: LAYOUT_ELEMENTS.length,
      contexts: contexts.length,
      effectTypes: registeredEffectTypes.length,
    },
  });
};

const validateBaseCatalog = (
  catalog: any,
  format: string,
  requiredArrays: Array<string>
): Object => {
  if (
    !catalog ||
    typeof catalog !== 'object' ||
    catalog.format !== format ||
    catalog.formatVersion !== 1 ||
    !catalog.project ||
    typeof catalog.project !== 'object' ||
    !catalog.authoring ||
    typeof catalog.authoring !== 'object' ||
    requiredArrays.some(name => !Array.isArray(catalog[name]))
  ) {
    fail(`Unsupported ${format} format.`);
  }
  return catalog;
};

const validateUniqueEntries = (
  entries: Array<Object>,
  getKey: Object => string,
  label: string
) => {
  const keys = new Set();
  entries.forEach(entry => {
    if (!entry || typeof entry !== 'object') fail(`Invalid ${label} entry.`);
    const key = getKey(entry);
    if (!key) fail(`${label} entry has no identity.`);
    if (keys.has(key)) fail(`Duplicate ${label} entry ${key}.`);
    keys.add(key);
  });
};

export const validateProjectSettingsCatalog = (catalog: any): Object => {
  const validated = validateBaseCatalog(catalog, 'gdevelop-settings-catalog', [
    'fileKinds',
    'settingsOwners',
    'objectTypes',
    'behaviorTypes',
    'effectTypes',
  ]);
  validateUniqueEntries(validated.fileKinds, entry => entry.kind, 'file kind');
  validateUniqueEntries(
    validated.objectTypes,
    entry => entry.type,
    'object type'
  );
  validateUniqueEntries(
    validated.behaviorTypes,
    entry => entry.type,
    'behavior type'
  );
  validateUniqueEntries(
    validated.effectTypes,
    entry => entry.type,
    'effect type'
  );
  return validated;
};

export const validateProjectLayoutCatalog = (catalog: any): Object => {
  const validated = validateBaseCatalog(catalog, 'gdevelop-layout-catalog', [
    'elements',
    'contexts',
    'effectTypes',
  ]);
  validateUniqueEntries(
    validated.elements,
    entry => `${entry.element}\u0000${entry.variant || ''}`,
    'layout element'
  );
  validated.contexts.forEach(context => {
    if (
      !context ||
      !['scene', 'prefab', 'prefab-variant', 'external'].includes(
        context.kind
      ) ||
      !context.owner ||
      !Array.isArray(context.layers) ||
      !Array.isArray(context.objects)
    ) {
      fail('Invalid layout context entry.');
    }
  });
  validateUniqueEntries(
    validated.effectTypes,
    entry => entry.type,
    'effect type'
  );
  return validated;
};

const serializeCatalog = (
  catalog: Object,
  orderedArrayNames: Array<string>
): string => {
  const arrays = {};
  orderedArrayNames.forEach(name => {
    arrays[name] = catalog[name];
  });
  const metadata = { ...catalog };
  orderedArrayNames.forEach(name => delete metadata[name]);
  const lines = ['{'];
  Object.keys(metadata).forEach(key => {
    lines.push(`${JSON.stringify(key)}:${JSON.stringify(metadata[key])},`);
  });
  orderedArrayNames.forEach((name, arrayIndex) => {
    lines.push(`${JSON.stringify(name)}:[`);
    arrays[name].forEach((entry, entryIndex) => {
      lines.push(
        `${JSON.stringify(entry)}${
          entryIndex === arrays[name].length - 1 ? '' : ','
        }`
      );
    });
    lines.push(arrayIndex === orderedArrayNames.length - 1 ? ']' : '],');
  });
  lines.push('}', '');
  return lines.join('\n');
};

export const serializeProjectSettingsCatalog = (catalog: Object): string =>
  serializeCatalog(validateProjectSettingsCatalog(catalog), [
    'fileKinds',
    'settingsOwners',
    'objectTypes',
    'behaviorTypes',
    'effectTypes',
  ]);

export const serializeProjectLayoutCatalog = (catalog: Object): string =>
  serializeCatalog(validateProjectLayoutCatalog(catalog), [
    'elements',
    'contexts',
    'effectTypes',
  ]);
