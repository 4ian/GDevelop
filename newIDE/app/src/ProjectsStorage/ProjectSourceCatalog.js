// @flow

import { shouldHideExtension } from '../Version';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  MULTI_FILE_ENTRY_NAME,
  MULTI_FILE_ENTRY_URI,
  MULTI_FILE_FORMAT_VERSION,
  encodeManagedName,
} from './MultiFileProjectFormat';

const gd: libGDevelop = global.gd;

const SCENE_LIFECYCLE_SOURCES = Object.freeze([
  { name: 'sceneLoad', legacyField: 'sceneLoadEvents', order: 0 },
  { name: 'sceneSignal', legacyField: 'sceneSignalEvents', order: 1 },
  { name: 'sceneUpdate', legacyField: 'events', order: 2 },
  { name: 'sceneUnload', legacyField: 'sceneUnloadEvents', order: 3 },
]);

export const PROJECT_SETTINGS_CATALOG_RELATIVE_PATH =
  '.gdevelop/settings-catalog.json';
export const PROJECT_SETTINGS_CATALOG_FORMAT_VERSION = 2;

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
  const type = String((property.getType && property.getType()) || '');
  if (!type) {
    console.warn(
      `[ProjectSourceCatalog] Property ${name} has no registered type and was omitted from the authoring catalog.`
    );
    return null;
  }
  const summary: Object = {
    name,
    authoringKey: name,
    type,
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

const changedTopLevelKeys = (before: Object, after: Object): Array<string> =>
  sortedUnique([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]).filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]));

const propertyProbeValue = (property: any): string => {
  const type = String((property.getType && property.getType()) || '');
  const value = String((property.getValue && property.getValue()) || '');
  if (['Number', 'Integer', 'Float'].includes(type)) {
    const number = Number(value);
    return String(Number.isFinite(number) ? number + 1 : 1);
  }
  if (type === 'Boolean') {
    return ['1', 'true'].includes(value.toLowerCase()) ? '0' : '1';
  }
  const choices = property.getChoices && toArray(property.getChoices());
  if (choices && choices.length) {
    const alternative = choices.find(
      choice => String(choice.getValue()) !== value
    );
    if (alternative) return String(alternative.getValue());
  }
  return `${value}__gdevelop_catalog_probe__`;
};

const inferSerializedPropertyKey = ({
  instance,
  authoringKey,
  property,
}: Object): Object => {
  if (!instance || typeof instance.updateProperty !== 'function') {
    return {
      status: 'unsupported',
      reason: 'No writable metadata instance is registered for this property.',
    };
  }
  let baseline;
  try {
    baseline = serializeToJSObject(instance);
    if (!instance.updateProperty(authoringKey, propertyProbeValue(property))) {
      return {
        status: 'unsupported',
        reason: 'The registered instance rejected the metadata property key.',
      };
    }
    const changedKeys = changedTopLevelKeys(
      baseline,
      serializeToJSObject(instance)
    );
    if (changedKeys.length !== 1) {
      return {
        status: 'unsupported',
        reason:
          changedKeys.length === 0
            ? 'Updating the property did not change serialized data.'
            : `Updating the property changed multiple serialized keys: ${changedKeys.join(
                ', '
              )}.`,
      };
    }
    return { status: 'supported', serializedKey: changedKeys[0] };
  } catch (error) {
    return {
      status: 'unsupported',
      reason: error && error.message ? error.message : String(error),
    };
  } finally {
    if (baseline) {
      try {
        unserializeFromJSObject(instance, baseline);
      } catch (error) {
        console.warn(
          `[ProjectSourceCatalog] Unable to restore metadata instance after probing ${authoringKey}.`,
          error
        );
      }
    }
  }
};

const summarizeProperties = (
  properties: any,
  instance?: any
): Array<Object> => {
  if (!properties || !properties.keys) return [];
  return toArray(properties.keys())
    .sort((left, right) => String(left).localeCompare(String(right)))
    .map(name => {
      const authoringKey = String(name);
      const property = properties.get(name);
      if (
        (property.isHidden && property.isHidden()) ||
        (property.isDeprecated && property.isDeprecated())
      ) {
        return null;
      }
      const summary = summarizeProperty(authoringKey, property);
      if (!summary) return null;
      if (instance !== undefined) {
        const serialization = inferSerializedPropertyKey({
          instance,
          authoringKey,
          property,
        });
        if (serialization.status === 'supported') {
          summary.serializedKey = serialization.serializedKey;
        } else {
          summary.serialization = serialization;
        }
      }
      return summary;
    })
    .filter(Boolean);
};

const summarizeSerializedProperties = (
  propertyDescriptors: ?Array<Object>
): Array<Object> => {
  const descriptors = propertyDescriptors || [];
  return descriptors
    .filter(property => !property.hidden && !property.deprecated)
    .map(property => {
      const summary: Object = {
        name: String(property.name || ''),
        authoringKey: String(property.name || ''),
        serializedKey: String(property.name || ''),
        type: String(property.type || ''),
      };
      if (property.value !== undefined) summary.defaultValue = property.value;
      if (property.label) summary.label = property.label;
      if (property.description) summary.description = property.description;
      if (property.group) summary.group = property.group;
      if (property.advanced) summary.advanced = true;
      if (Array.isArray(property.choices) && property.choices.length) {
        summary.choices = property.choices.map(choice => ({
          value: choice.value,
          label: choice.label,
        }));
      }
      const extraInfo = Array.isArray(property.extraInformation)
        ? property.extraInformation
        : property.extraInfo;
      if (Array.isArray(extraInfo) && extraInfo.length) {
        summary.extraInfo = extraInfo;
      }
      return summary;
    });
};

const getSerializedRequiredBehaviorTypes = (
  behaviorDefinition: Object
): Array<string> =>
  (behaviorDefinition.propertyDescriptors || [])
    .filter(property => property.type === 'Behavior')
    .map(property => {
      const extraInfo = Array.isArray(property.extraInformation)
        ? property.extraInformation
        : property.extraInfo;
      return Array.isArray(extraInfo) && extraInfo.length
        ? String(extraInfo[0] || '')
        : '';
    })
    .filter(Boolean);

const safelySummarizeMetadataProperties = (
  readProperties: () => any,
  instance: any,
  context: string
): Array<Object> => {
  try {
    return summarizeProperties(readProperties(), instance);
  } catch (error) {
    console.warn(
      `[ProjectSourceCatalog] Unable to read ${context}; omitting its property metadata from the generated catalog.`,
      error
    );
    return [];
  }
};

const safelyReadRequiredBehaviorTypes = (
  metadata: gdBehaviorMetadata,
  behaviorType: string
): Array<string> => {
  try {
    return toArray(metadata.getRequiredBehaviorTypes());
  } catch (error) {
    console.warn(
      `[ProjectSourceCatalog] Unable to read required behavior types for behavior ${behaviorType}; omitting them from the generated catalog.`,
      error
    );
    return [];
  }
};

const getProjectExtensionNames = (serializedProject: Object): Set<string> =>
  new Set(
    (serializedProject.eventsFunctionsExtensions || []).map(extension =>
      String(extension.name || '')
    )
  );

const getProjectBehaviorDefinitions = (
  serializedProject: Object
): Map<string, Object> => {
  const definitions: Map<string, Object> = new Map();
  (serializedProject.eventsFunctionsExtensions || []).forEach(extension => {
    const extensionName = String(extension.name || '');
    (extension.eventsBasedBehaviors || []).forEach(behavior => {
      const behaviorName = String(behavior.name || '');
      definitions.set(`${extensionName}::${behaviorName}`, behavior);
    });
  });
  return definitions;
};

const getProjectObjectDefinitions = (
  serializedProject: Object
): Map<string, Object> => {
  const definitions: Map<string, Object> = new Map();
  (serializedProject.eventsFunctionsExtensions || []).forEach(extension => {
    const extensionName = String(extension.name || '');
    (extension.eventsBasedObjects || []).forEach(object => {
      const objectName = String(object.name || '');
      definitions.set(`${extensionName}::${objectName}`, object);
    });
  });
  return definitions;
};

const serializedPropertyDescriptorDefaultValue = (property: Object): any => {
  const type = String(property.type || '').toLowerCase();
  const value = property.value;
  if (
    type.includes('number') ||
    type.includes('integer') ||
    type.includes('float')
  ) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }
  if (type.includes('boolean')) {
    return ['1', 'true'].includes(String(value || '').toLowerCase());
  }
  return String(value || '');
};

const summarizeProjectObjectDefinition = (
  objectDefinition: Object
): {| serializedConfiguration: Object, properties: Array<Object> |} => {
  const properties = summarizeSerializedProperties(
    objectDefinition.propertyDescriptors
  ).map(property => ({
    ...property,
    serializedPath: `content.${property.serializedKey}`,
  }));
  const content: { [string]: any } = {};
  (objectDefinition.propertyDescriptors || [])
    .filter(property => !property.hidden && !property.deprecated)
    .forEach(property => {
      const name = String(property.name || '');
      if (name) {
        content[name] = serializedPropertyDescriptorDefaultValue(property);
      }
    });
  return {
    serializedConfiguration: { content, variant: '' },
    properties,
  };
};

const OBJECT_DEFINITION_FIELDS = new Set([
  'assetStoreId',
  'behaviors',
  'effects',
  'name',
  'persistentUuid',
  'resourcesPreloading',
  'type',
  'variables',
]);

const collectSerializedObjectConfigurationsByType = (
  serializedProject: Object
): Map<string, Array<Object>> => {
  const configurationsByType: Map<string, Array<Object>> = new Map();
  const addObjects = (objects: ?Array<Object>) => {
    (objects || []).forEach(object => {
      if (!object || typeof object !== 'object' || Array.isArray(object)) {
        return;
      }
      const type = String(object.type || '');
      if (!type) return;
      const configuration = {};
      Object.keys(object).forEach(key => {
        if (!OBJECT_DEFINITION_FIELDS.has(key)) {
          configuration[key] = object[key];
        }
      });
      const configurations = configurationsByType.get(type) || [];
      configurations.push(configuration);
      configurationsByType.set(type, configurations);
    });
  };

  addObjects(serializedProject.objects);
  (serializedProject.layouts || []).forEach(layout =>
    addObjects(layout.objects)
  );
  (serializedProject.eventsFunctionsExtensions || []).forEach(extension => {
    (extension.eventsBasedObjects || []).forEach(eventsBasedObject => {
      addObjects(eventsBasedObject.objects);
      (eventsBasedObject.variants || []).forEach(variant =>
        addObjects(variant.objects)
      );
    });
  });
  return configurationsByType;
};

const serializedValueKind = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  }
  return typeof value;
};

type SerializedValueShape = {
  kinds: Array<string>,
  fields: { [string]: SerializedValueShape },
  item: ?SerializedValueShape,
  defaultValue?: any,
  defaultEmpty?: boolean,
};

const mergeSerializedValueShape = (
  shape: ?SerializedValueShape,
  value: any,
  isDefaultValue: boolean = false
): SerializedValueShape => {
  const merged: SerializedValueShape = shape || {
    kinds: [],
    fields: {},
    item: null,
  };
  const kind = serializedValueKind(value);
  if (!merged.kinds.includes(kind)) {
    merged.kinds.push(kind);
    merged.kinds.sort((left, right) => left.localeCompare(right));
  }
  if (
    isDefaultValue &&
    ['boolean', 'integer', 'number', 'string'].includes(kind)
  ) {
    merged.defaultValue = value;
  }
  if (kind === 'object') {
    Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .forEach(key => {
        merged.fields[key] = mergeSerializedValueShape(
          merged.fields[key],
          value[key],
          isDefaultValue
        );
      });
  } else if (kind === 'array') {
    value.forEach(item => {
      merged.item = mergeSerializedValueShape(
        merged.item,
        item,
        isDefaultValue
      );
    });
    if (isDefaultValue && value.length === 0) merged.defaultEmpty = true;
  }
  return merged;
};

const isInlineObjectConfigurationField = (name: string): boolean =>
  ['originPoint', 'centerPoint', 'points', 'customCollisionMask'].includes(
    name
  );

const shapeType = (
  shape: ?SerializedValueShape,
  fieldName: string = ''
): string => {
  if (!shape) return 'value determined by the object serializer';
  const types = shape.kinds.map(kind => {
    if (kind === 'array') {
      if (!shape.item) return 'array';
      const itemType = shapeType(shape.item);
      return isInlineObjectConfigurationField(fieldName)
        ? `${itemType} inline array`
        : `${itemType} array`;
    }
    if (kind === 'object') return 'inline table';
    if (kind === 'null') return 'JSON null stored through [rawJson]';
    return kind;
  });
  if (types.includes('number') && types.includes('integer')) {
    types.splice(types.indexOf('integer'), 1);
  }
  return types.join(' or ');
};

const shapeField = (name: string, shape: SerializedValueShape): Object => {
  const field: Object = settingsField(name, shapeType(shape, name));
  if (shape.defaultValue !== undefined) {
    field.defaultValue = shape.defaultValue;
  }
  if (shape.defaultEmpty) field.emptyValue = [];
  return field;
};

const buildSerializedObjectChildTable = (
  name: string,
  shape: SerializedValueShape,
  parentPath: string
): Object => {
  const path = parentPath ? `${parentPath}.${name}` : name;
  const repeated = shape.kinds.includes('array');
  const recordShape = repeated ? shape.item : shape;
  const fields = [];
  const childTables = [];
  if (recordShape && recordShape.fields) {
    Object.keys(recordShape.fields)
      .sort((left, right) => left.localeCompare(right))
      .forEach(fieldName => {
        const fieldShape = recordShape.fields[fieldName];
        const isObject = fieldShape.kinds.includes('object');
        const isObjectArray =
          fieldShape.kinds.includes('array') &&
          fieldShape.item &&
          fieldShape.item.kinds.includes('object');
        if (
          !isInlineObjectConfigurationField(fieldName) &&
          (isObject || isObjectArray)
        ) {
          childTables.push(
            buildSerializedObjectChildTable(fieldName, fieldShape, path)
          );
        } else {
          fields.push(shapeField(fieldName, fieldShape));
        }
      });
  }
  const table: Object = {
    table: path,
    header: repeated ? `[[${path}]]` : `[${path}]`,
    ...(repeated ? { repeated: true } : {}),
    fields,
  };
  if (repeated) {
    table.emptyForm = `${name} = [ ]${
      parentPath ? ` inside [${parentPath}]` : ' at the object root'
    }`;
  }
  if (childTables.length) table.childTables = childTables;
  return table;
};

const buildSerializedObjectConfigurationSchema = (
  configurations: Array<{| value: Object, isDefault: boolean |}>
): Object => {
  let rootShape: ?SerializedValueShape = null;
  configurations.forEach(({ value, isDefault }) => {
    rootShape = mergeSerializedValueShape(rootShape, value, isDefault);
  });
  const rootFields = [];
  const childTables = [];
  const fields: { [string]: SerializedValueShape } = rootShape
    ? rootShape.fields
    : {};
  Object.keys(fields)
    .sort((left, right) => left.localeCompare(right))
    .forEach(name => {
      const shape = fields[name];
      const isObject = shape.kinds.includes('object');
      const isObjectArray =
        shape.kinds.includes('array') &&
        shape.item &&
        shape.item.kinds.includes('object');
      if (
        !isInlineObjectConfigurationField(name) &&
        (isObject || isObjectArray)
      ) {
        childTables.push(buildSerializedObjectChildTable(name, shape, ''));
      } else {
        rootFields.push(shapeField(name, shape));
      }
    });
  return { rootFields, childTables };
};

const collectSerializedPathsNamed = (
  shape: ?SerializedValueShape,
  searchedName: string,
  parentPath: string = ''
): Array<string> => {
  if (!shape || !shape.fields) return [];
  const paths = [];
  Object.keys(shape.fields).forEach(name => {
    const fieldShape = shape.fields[name];
    const path = parentPath ? `${parentPath}.${name}` : name;
    if (name === searchedName) paths.push(path);
    if (fieldShape.kinds.includes('object')) {
      paths.push(
        ...collectSerializedPathsNamed(fieldShape, searchedName, path)
      );
    }
    if (fieldShape.kinds.includes('array') && fieldShape.item) {
      paths.push(
        ...collectSerializedPathsNamed(
          fieldShape.item,
          searchedName,
          `${path}[]`
        )
      );
    }
  });
  return sortedUnique(paths);
};

// A few native object serializers have public repeated records whose default
// value is an empty array. Populate one record through their public APIs so
// the generated schema contains the record fields even when the project does
// not have an object of that type yet. Other object types are fully described
// by their default serializer and any same-type project objects collected
// above.
const safelyBuildPopulatedObjectConfiguration = (
  objectType: string
): ?Object => {
  const ownedValues: Array<any> = [];
  const own = (value: any): any => {
    ownedValues.push(value);
    return value;
  };
  let configuration;
  try {
    if (
      objectType === 'Scene3D::Model3DObject' &&
      gd.Model3DObjectConfiguration &&
      gd.Model3DAnimation
    ) {
      configuration = own(new gd.Model3DObjectConfiguration());
      configuration.setType(objectType);
      configuration.addSharedAnimationModelResource(
        '__gdevelop_catalog_model_resource__'
      );
      const animation = own(new gd.Model3DAnimation());
      animation.setName('__gdevelop_catalog_animation__');
      animation.setSource('Model');
      animation.setSourceModelResourceName(
        '__gdevelop_catalog_source_model_resource__'
      );
      animation.setShouldLoop(true);
      configuration.addAnimation(animation);
      return serializeToJSObject(configuration);
    }
    if (
      objectType === 'Spine::SpineObject' &&
      gd.SpineObjectConfiguration &&
      gd.SpineAnimation
    ) {
      configuration = own(new gd.SpineObjectConfiguration());
      configuration.setType(objectType);
      const animation = own(new gd.SpineAnimation());
      animation.setName('__gdevelop_catalog_animation__');
      animation.setSource('__gdevelop_catalog_animation_source__');
      animation.setShouldLoop(true);
      configuration.addAnimation(animation);
      return serializeToJSObject(configuration);
    }
    if (
      objectType === 'Sprite' &&
      gd.SpriteObject &&
      gd.Animation &&
      gd.Sprite
    ) {
      configuration = own(new gd.SpriteObject());
      configuration.setType(objectType);
      const animation = own(new gd.Animation());
      animation.setName('__gdevelop_catalog_animation__');
      animation.setDirectionsCount(1);
      const direction = animation.getDirection(0);
      direction.setMetadata('__gdevelop_catalog_direction_metadata__');
      const sprite = own(new gd.Sprite());
      sprite.setImageName('__gdevelop_catalog_image__');
      sprite.setCustomSourceRect(1, 2, 3, 4);
      const point = own(new gd.Point('__gdevelop_catalog_point__'));
      point.setXY(1, 2);
      sprite.addPoint(point);
      direction.addSprite(sprite);
      configuration.getAnimations().addAnimation(animation);
      return serializeToJSObject(configuration);
    }
  } catch (error) {
    console.warn(
      `[ProjectSourceCatalog] Unable to populate repeated serializer records for object ${objectType}; falling back to its default and project object schemas.`,
      error
    );
  } finally {
    ownedValues.reverse().forEach(value => value.delete());
  }
  return null;
};

const safelyReadObjectConfiguration = (
  platform: gdPlatform,
  objectType: string
): {|
  serializedConfiguration: Object,
  populatedConfiguration: ?Object,
  properties: Array<Object>,
|} => {
  let ownedConfiguration;
  try {
    ownedConfiguration = platform.createObjectConfiguration(objectType);
    const configuration = ownedConfiguration.get();
    const serializedConfiguration = serializeToJSObject(configuration);
    const properties = safelySummarizeMetadataProperties(
      () => configuration.getProperties(),
      undefined,
      `properties for object ${objectType}`
    );
    return {
      serializedConfiguration,
      populatedConfiguration: safelyBuildPopulatedObjectConfiguration(
        objectType
      ),
      properties,
    };
  } catch (error) {
    console.warn(
      `[ProjectSourceCatalog] Unable to inspect the default serializer for object ${objectType}; generating its catalog entry from project objects only.`,
      error
    );
    return {
      serializedConfiguration: {},
      populatedConfiguration: safelyBuildPopulatedObjectConfiguration(
        objectType
      ),
      properties: [],
    };
  } finally {
    if (ownedConfiguration) ownedConfiguration.delete();
  }
};

const collectRegisteredTypes = (
  project: gdProject,
  serializedProject: Object,
  additionalExtensions: Array<gdPlatformExtension> = []
): {|
  objectTypes: Array<Object>,
  behaviorTypes: Array<Object>,
  effectTypes: Array<Object>,
|} => {
  const objectTypes = [];
  const behaviorTypes = [];
  const effectTypes = [];
  const localExtensionNames = getProjectExtensionNames(serializedProject);
  const localBehaviorDefinitions = getProjectBehaviorDefinitions(
    serializedProject
  );
  const localObjectDefinitions = getProjectObjectDefinitions(serializedProject);
  const serializedObjectConfigurationsByType = collectSerializedObjectConfigurationsByType(
    serializedProject
  );
  const platform = project.getCurrentPlatform();
  const additionalExtensionNames = new Set(
    additionalExtensions.map(extension => extension.getName())
  );
  const extensions = [
    ...additionalExtensions,
    ...toArray(platform.getAllPlatformExtensions()).filter(
      extension => !additionalExtensionNames.has(extension.getName())
    ),
  ];

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
      const localObjectDefinition = localObjectDefinitions.get(objectType);
      const {
        serializedConfiguration,
        populatedConfiguration = null,
        properties,
      } = localObjectDefinition
        ? summarizeProjectObjectDefinition(localObjectDefinition)
        : safelyReadObjectConfiguration(platform, objectType);
      const configurations = [
        { value: serializedConfiguration, isDefault: true },
        ...(populatedConfiguration
          ? [{ value: populatedConfiguration, isDefault: false }]
          : []),
        ...(serializedObjectConfigurationsByType.get(objectType) || []).map(
          value => ({ value, isDefault: false })
        ),
      ];
      let configurationShape: ?SerializedValueShape = null;
      configurations.forEach(({ value, isDefault }) => {
        configurationShape = mergeSerializedValueShape(
          configurationShape,
          value,
          isDefault
        );
      });
      entry.properties = properties.map(property => {
        const serializedPaths = collectSerializedPathsNamed(
          configurationShape,
          property.authoringKey
        );
        if (serializedPaths.length === 1) {
          return { ...property, serializedPath: serializedPaths[0] };
        }
        if (serializedPaths.length > 1) {
          return { ...property, serializedPaths };
        }
        return property;
      });
      entry.schema = buildSerializedObjectConfigurationSchema(configurations);
      entry.keySpace = 'serialized paths';
      entry.unknownPropertyPolicy = 'preserve';
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
        properties: [],
        sharedProperties: [],
      };
      const localBehaviorDefinition = localBehaviorDefinitions.get(
        behaviorType
      );
      if (localBehaviorDefinition) {
        entry.properties = summarizeSerializedProperties(
          localBehaviorDefinition.propertyDescriptors
        );
        entry.sharedProperties = summarizeSerializedProperties(
          localBehaviorDefinition.sharedPropertyDescriptors
        );
      } else {
        entry.properties = safelySummarizeMetadataProperties(
          () => metadata.getProperties(),
          metadata.get(),
          `properties for behavior ${behaviorType}`
        );
        entry.sharedProperties = safelySummarizeMetadataProperties(
          () => metadata.getSharedProperties(),
          metadata.getSharedDataInstance(),
          `shared properties for behavior ${behaviorType}`
        );
      }
      entry.keySpace = 'serialized';
      // Behavior serializers can retain fields from an older version of an
      // extension after a property descriptor is removed. These fields must
      // survive project conversion: rejecting them makes otherwise valid
      // templates and legacy projects impossible to save.
      entry.unknownPropertyPolicy = 'preserve';
      const objectType = metadata.getObjectType();
      if (objectType) entry.objectType = objectType;
      const requiredBehaviorTypes = localBehaviorDefinition
        ? getSerializedRequiredBehaviorTypes(localBehaviorDefinition)
        : safelyReadRequiredBehaviorTypes(metadata, behaviorType);
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
        parameters: safelySummarizeMetadataProperties(
          () => metadata.getProperties(),
          undefined,
          `parameters for effect ${effectType}`
        ),
      });
    });
  });

  const uniqueByType = (entries: Array<Object>): Array<Object> =>
    Array.from(
      entries
        .reduce((byType, entry) => {
          if (!byType.has(entry.type)) byType.set(entry.type, entry);
          return byType;
        }, new Map())
        .values()
    );
  const byType = (left: Object, right: Object) =>
    String(left.type).localeCompare(right.type);
  return {
    objectTypes: uniqueByType(objectTypes).sort(byType),
    behaviorTypes: uniqueByType(behaviorTypes).sort(byType),
    effectTypes: uniqueByType(effectTypes).sort(byType),
  };
};

const settingsField = (
  name: string,
  type: string,
  options: Object = {}
): Object => ({
  name,
  type,
  ...options,
});

const formatFields = ({
  kind,
  ordered = false,
  folder = false,
  name = false,
}: Object): Array<Object> => [
  settingsField('kind', 'string', { required: true, value: kind }),
  settingsField('settingsFormatVersion', 'integer', {
    required: true,
    value: MULTI_FILE_FORMAT_VERSION,
  }),
  ...(ordered
    ? [
        settingsField('order', 'contiguous zero-based integer', {
          required: true,
        }),
      ]
    : []),
  ...(folder
    ? [
        settingsField('folder', 'ordered string array', {
          required: true,
          emptyValue: [],
        }),
      ]
    : []),
  ...(name ? [settingsField('name', 'string', { required: true })] : []),
];

const rawJsonTable = {
  table: 'rawJson',
  header: '[rawJson]',
  optional: true,
  dynamicFields: {
    key: 'RFC 6901 JSON Pointer relative to this component payload',
    value: 'canonical JSON text string',
  },
  note:
    'Reserved lossless fallback written only for values that TOML cannot represent directly. Preserve existing entries.',
};

const variableRecordFields = [
  settingsField('name', 'non-empty string', { required: true }),
  settingsField('type', 'enum', {
    required: true,
    values: [
      'string',
      'number',
      'boolean',
      'structure',
      'array',
      'enum',
      'mixed',
    ],
  }),
  settingsField('value', 'string, number, or boolean', {
    requiredForTypes: ['string', 'number', 'boolean', 'enum'],
  }),
  settingsField('children', 'inline recursive variable descriptor array', {
    requiredForTypes: ['structure', 'array'],
    note:
      'Structure children have a non-empty name. Array children have no name. Never write a recursive TOML child table.',
  }),
  settingsField('values', 'unique string array', {
    requiredForTypes: ['enum'],
  }),
  settingsField('folded', 'boolean'),
  settingsField('persistentUuid', 'empty string or lowercase UUIDv4 string'),
  settingsField('hasMixedValues', 'boolean'),
];

const variableTable = (name: string): Object => ({
  table: name,
  header: `[[${name}]]`,
  repeated: true,
  emptyForm: `${name} = [ ]`,
  fields: variableRecordFields,
  additionalFields: 'preserve unknown variable serializer fields',
});

const objectGroupsTable = (prefix: string = ''): Object => ({
  table: `${prefix}objectGroups`,
  header: `[${prefix}objectGroups]`,
  optional: true,
  emptyForm: prefix
    ? `objectGroups = { } inside [[${prefix.slice(0, -1)}]]`
    : 'objectGroups = { }',
  dynamicFields: {
    key: 'unique object-group name',
    value: 'ordered string array of existing object names',
  },
});

const objectGroupRequiredBehaviorsTable = (prefix: string = ''): Object => ({
  table: `${prefix}objectGroupRequiredBehaviors`,
  header: `[${prefix}objectGroupRequiredBehaviors]`,
  optional: true,
  dynamicFields: {
    key: `object-group name also present in ${prefix}objectGroups`,
    value: 'ordered string array of registered behavior types',
  },
});

const quickCustomizationTable = (prefix: string): Object => ({
  table: `${prefix}.propertiesQuickCustomizationVisibilities`,
  header: `[${prefix}.propertiesQuickCustomizationVisibilities]`,
  optional: true,
  dynamicFields: {
    key: 'serialized property name',
    value: 'enum: default, visible, or hidden',
  },
});

const attachedBehaviorTable = {
  table: 'behaviors',
  header: '[[behaviors]]',
  repeated: true,
  emptyForm: 'behaviors = [ ]',
  fields: [
    settingsField('name', 'unique object-local string', { required: true }),
    settingsField('type', 'registered behaviorTypes[].type', {
      required: true,
    }),
    settingsField('isFolded', 'boolean', { default: false }),
    settingsField('isMuted', 'boolean', { default: false }),
    settingsField('isInheritedFromObjectType', 'boolean', { default: false }),
    settingsField('quickCustomizationVisibility', 'enum', {
      values: ['default', 'visible', 'hidden'],
    }),
  ],
  childTables: [quickCustomizationTable('behaviors')],
  dynamicFields: {
    source: 'behaviorTypes[type].properties',
    key: 'properties[].serializedKey',
    value: 'properties[].type',
  },
  additionalFields:
    'preserve unlisted existing serializer fields according to behaviorTypes[type].unknownPropertyPolicy',
};

const objectEffectTable = {
  table: 'effects',
  header: '[[effects]]',
  repeated: true,
  emptyForm: 'effects = [ ]',
  fields: [
    settingsField('name', 'unique object-local string', { required: true }),
    settingsField('effectType', 'registered effectTypes[].type', {
      required: true,
    }),
    settingsField('folded', 'boolean', { default: false }),
    settingsField('disabled', 'boolean', { default: false }),
  ],
  childTables: [
    {
      table: 'effects.doubleParameters',
      header: '[effects.doubleParameters]',
      optional: true,
      dynamicFields: {
        source: 'effectTypes[effectType].parameters',
        key: 'effect parameter name',
        value: 'number',
      },
      emptyForm: 'doubleParameters = { } inside [[effects]]',
    },
    {
      table: 'effects.stringParameters',
      header: '[effects.stringParameters]',
      optional: true,
      dynamicFields: {
        source: 'effectTypes[effectType].parameters',
        key: 'effect parameter name',
        value: 'string',
      },
      emptyForm: 'stringParameters = { } inside [[effects]]',
    },
    {
      table: 'effects.booleanParameters',
      header: '[effects.booleanParameters]',
      optional: true,
      dynamicFields: {
        source: 'effectTypes[effectType].parameters',
        key: 'effect parameter name',
        value: 'boolean',
      },
      emptyForm: 'booleanParameters = { } inside [[effects]]',
    },
  ],
};

const propertyDescriptorFields = [
  settingsField('name', 'unique string', { required: true }),
  settingsField('value', 'string', { required: true }),
  settingsField('type', 'property type string', { required: true }),
  settingsField('unit', 'measurement-unit string', {
    emittedWhen: 'type is Number and a measurement unit is defined',
  }),
  settingsField('label', 'string', { required: true }),
  settingsField('description', 'string'),
  settingsField('group', 'compatibility string'),
  settingsField('extraInformation', 'string array'),
  settingsField('hidden', 'boolean', { default: false }),
  settingsField('deprecated', 'boolean', { default: false }),
  settingsField('advanced', 'boolean', { default: false }),
  settingsField('quickCustomizationVisibility', 'enum', {
    values: ['default', 'visible', 'hidden'],
  }),
];

const propertyDescriptorTable = (name: string): Object => ({
  table: name,
  header: `[[${name}]]`,
  repeated: true,
  emptyForm: `${name} = [ ]`,
  fields: propertyDescriptorFields,
  childTables: [
    {
      table: `${name}.choices`,
      header: `[[${name}.choices]]`,
      repeated: true,
      emptyForm: 'choices = [ ] inside the parent property descriptor',
      fields: [
        settingsField('value', 'string', { required: true }),
        settingsField('label', 'string', { required: true }),
      ],
    },
  ],
});

const functionSchema = ({ folder, extensionRequired }: Object): Object => ({
  rootFields: [
    ...formatFields({
      kind: 'function',
      ordered: true,
      folder,
      name: true,
    }),
    ...(extensionRequired
      ? [
          settingsField('extension', 'owning extension name', {
            required: true,
          }),
        ]
      : []),
    settingsField('functionType', 'enum', {
      required: true,
      values: [
        'Action',
        'Condition',
        'Expression',
        'StringExpression',
        'ExpressionAndCondition',
        'ActionWithOperator',
      ],
    }),
    settingsField('fullName', 'string'),
    settingsField('description', 'string'),
    settingsField('sentence', 'string'),
    settingsField('group', 'string'),
    settingsField('getterName', 'string'),
    settingsField('private', 'boolean', { default: false }),
    settingsField('async', 'boolean', { default: false }),
    settingsField('helpUrl', 'string'),
    settingsField('deprecated', 'boolean', { default: false }),
    settingsField('deprecationMessage', 'string'),
  ],
  childTables: [
    {
      table: 'expressionType',
      header: '[expressionType]',
      optional: true,
      requiredForFunctionTypes: [
        'Expression',
        'StringExpression',
        'ExpressionAndCondition',
      ],
      fields: [
        settingsField('type', 'value type string', { required: true }),
        settingsField('supplementaryInformation', 'string'),
        settingsField('optional', 'boolean', { default: false }),
        settingsField('defaultValue', 'string'),
      ],
    },
    {
      table: 'parameters',
      header: '[[parameters]]',
      repeated: true,
      emptyForm: 'parameters = [ ]',
      fields: [
        settingsField('name', 'unique parameter string', { required: true }),
        settingsField('type', 'parameter value type string', {
          required: true,
        }),
        settingsField('supplementaryInformation', 'string'),
        settingsField('optional', 'boolean', { default: false }),
        settingsField('defaultValue', 'string'),
        settingsField('description', 'string', { required: true }),
        settingsField('longDescription', 'string'),
        settingsField('hint', 'string'),
        settingsField('codeOnly', 'boolean', { default: false }),
      ],
    },
    objectGroupsTable(),
    objectGroupRequiredBehaviorsTable(),
    rawJsonTable,
  ],
  additionalFields:
    'preserve unknown current EventsFunction serializer metadata fields',
});

const lifecycleFunctionSchema = (() => {
  const schema = functionSchema({ folder: true, extensionRequired: false });
  return {
    ...schema,
    rootFields: [
      ...schema.rootFields.map(field =>
        field.name === 'order'
          ? {
              ...field,
              type: 'fixed lifecycle integer',
              values: [0, 1, 2, 3],
            }
          : field
      ),
      settingsField('lifecycleRole', 'fixed lifecycle role', {
        required: true,
        values: SCENE_LIFECYCLE_SOURCES.map(source => source.name),
      }),
    ],
    additionalFields:
      'Lifecycle metadata is fixed. Do not rename, reorder, delete, duplicate, make public/async, or change signatures.',
  };
})();

const objectSettingsSchema = {
  rootFields: [
    ...formatFields({
      kind: 'object',
      ordered: true,
      folder: true,
      name: true,
    }),
    settingsField('type', 'registered objectTypes[].type', { required: true }),
    settingsField('persistentUuid', 'lowercase UUIDv4 string'),
    settingsField('assetStoreId', 'string'),
    settingsField('resourcesPreloading', 'string'),
  ],
  childTables: [
    variableTable('variables'),
    attachedBehaviorTable,
    objectEffectTable,
    rawJsonTable,
  ],
  dynamicFields: {
    source: 'the object serializer selected by root field type',
    schema: 'objectTypes[type].schema',
    policy:
      'Use objectTypes[type].schema for public type-specific configuration and preserve unknown legacy or private fields and child tables.',
  },
};

// Keep these contracts aligned with MultiFileProjectFormat's ownership
// projection and the corresponding libGD SerializeTo methods. `header` is the
// exact canonical header emitted by @iarna/toml, including nested records.
const SETTINGS_FILE_SCHEMAS = Object.freeze({
  project: {
    rootFields: [
      settingsField('combinedSettingsFormatVersion', 'integer', {
        required: true,
        value: MULTI_FILE_FORMAT_VERSION,
      }),
      settingsField('eventsDslVersion', 'string', {
        required: true,
        value: '2.0',
      }),
      settingsField('entry', MULTI_FILE_ENTRY_URI, {
        optional: true,
      }),
      ...formatFields({ kind: 'project' }),
      settingsField('initialGDVersion', 'string'),
      settingsField('firstLayout', 'existing scene name', { required: true }),
      settingsField('previewLayout', 'existing scene name'),
    ],
    childTables: [
      {
        table: 'gdVersion',
        header: '[gdVersion]',
        fields: ['major', 'minor', 'build', 'revision'].map(name =>
          settingsField(name, 'integer', { required: true })
        ),
      },
      {
        table: 'properties',
        header: '[properties]',
        fields: [
          settingsField('name', 'string', { required: true }),
          settingsField('description', 'string'),
          settingsField('version', 'string'),
          settingsField('author', 'string'),
          settingsField('windowWidth', 'positive integer'),
          settingsField('windowHeight', 'positive integer'),
          settingsField('latestCompilationDirectory', 'string'),
          settingsField('maxFPS', 'number'),
          settingsField('minFPS', 'number'),
          settingsField('verticalSync', 'boolean'),
          settingsField('scaleMode', 'string'),
          settingsField('pixelsRounding', 'boolean'),
          settingsField('adaptGameResolutionAtRuntime', 'boolean'),
          settingsField('sizeOnStartupMode', 'string'),
          settingsField('antialiasingMode', 'string'),
          settingsField('antialisingEnabledOnMobile', 'boolean'),
          settingsField('projectUuid', 'UUID string'),
          settingsField('folderProject', 'boolean'),
          settingsField('packageName', 'string'),
          settingsField('templateSlug', 'string'),
          settingsField('orientation', 'string'),
          settingsField('areEffectsHiddenInEditor', 'boolean'),
          settingsField('authorIds', 'string array'),
          settingsField('authorUsernames', 'string array'),
          settingsField('categories', 'string array'),
          settingsField('playableDevices', 'unique enum string array', {
            values: ['keyboard', 'gamepad', 'mobile'],
          }),
          settingsField('useDeprecatedZeroAsDefaultZOrder', 'boolean'),
          settingsField('useDeprecatedZeroAsDefaultStringVariable', 'boolean'),
          settingsField('currentPlatform', 'string'),
          settingsField('sceneResourcesPreloading', 'string'),
          settingsField('sceneResourcesUnloading', 'string'),
        ],
        childTables: [
          {
            table: 'properties.platformSpecificAssets',
            header: '[properties.platformSpecificAssets]',
            emptyForm: 'platformSpecificAssets = { } inside [properties]',
            dynamicFields: {
              key: '<platform>-<asset-name>',
              value: 'resource name string',
            },
          },
          {
            table: 'properties.loadingScreen',
            header: '[properties.loadingScreen]',
            fields: [
              settingsField('showGDevelopSplash', 'boolean'),
              settingsField('gdevelopLogoStyle', 'string'),
              settingsField('backgroundImageResourceName', 'resource name'),
              settingsField('backgroundColor', 'integer RGB color'),
              settingsField('backgroundFadeInDuration', 'non-negative number'),
              settingsField('minDuration', 'non-negative number'),
              settingsField(
                'logoAndProgressFadeInDuration',
                'non-negative number'
              ),
              settingsField(
                'logoAndProgressLogoFadeInDelay',
                'non-negative number'
              ),
              settingsField('showProgressBar', 'boolean'),
              settingsField('progressBarMinWidth', 'non-negative number'),
              settingsField('progressBarMaxWidth', 'non-negative number'),
              settingsField('progressBarWidthPercent', 'number'),
              settingsField('progressBarHeight', 'non-negative number'),
              settingsField('progressBarColor', 'integer RGB color'),
            ],
          },
          {
            table: 'properties.watermark',
            header: '[properties.watermark]',
            fields: [
              settingsField('showWatermark', 'boolean'),
              settingsField('placement', 'string'),
            ],
          },
          {
            table: 'properties.extensionProperties',
            header: '[[properties.extensionProperties]]',
            repeated: true,
            emptyForm: 'extensionProperties = [ ] inside [properties]',
            fields: [
              settingsField('extension', 'extension name', { required: true }),
              settingsField('property', 'property name', { required: true }),
              settingsField('value', 'string', { required: true }),
            ],
          },
          {
            table: 'properties.platforms',
            header: '[[properties.platforms]]',
            repeated: true,
            emptyForm: 'platforms = [ ] inside [properties]',
            fields: [
              settingsField('name', 'platform name', { required: true }),
            ],
          },
        ],
        additionalFields:
          'preserve unknown current Project::properties serializer fields',
      },
      variableTable('variables'),
      objectGroupsTable(),
      objectGroupRequiredBehaviorsTable(),
      {
        table: 'migration',
        header: '[migration]',
        optional: true,
        fields: [
          settingsField('source', 'canonical game:// URI'),
          settingsField('sourceSha256', 'lowercase SHA-256 string'),
          settingsField('importedAt', 'RFC 3339 timestamp string'),
          settingsField('importerVersion', 'integer'),
        ],
        additionalFields: 'preserve unknown migration metadata fields',
      },
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current Project serializer fields except split/forbidden ownership fields',
  },
  object: objectSettingsSchema,
  resources: {
    rootFields: [
      ...formatFields({ kind: 'resources' }),
      settingsField(
        'resourceFolders',
        'preserved homogeneous resource-folder array',
        {
          emptyForm: 'resourceFolders = [ ]',
        }
      ),
    ],
    childTables: [
      {
        table: 'resources',
        header: '[[resources]]',
        repeated: true,
        emptyForm: 'resources = [ ]',
        fields: [
          settingsField('kind', 'enum', {
            required: true,
            values: [
              'image',
              'audio',
              'font',
              'video',
              'json',
              'tilemap',
              'tileset',
              'bitmapFont',
              'model3D',
              'atlas',
              'spine',
              'javascript',
              'internal-in-game-editor-only-svg',
            ],
            capabilitiesByValue: {
              image: ['image-2d', 'three-texture'],
              model3D: ['model-3d'],
            },
            capabilityNotes: {
              'three-texture':
                'Image resources can be uploaded to Three.js from the cached Pixi image, canvas, ImageBitmap, ImageData, video, or OffscreenCanvas source. SVG image files are supported after Pixi rasterizes them.',
            },
          }),
          settingsField('name', 'unique resource name', { required: true }),
          settingsField('metadata', 'string', { required: true }),
          settingsField('file', 'project-relative resource path', {
            required: true,
          }),
          settingsField('userAdded', 'boolean', { required: true }),
          settingsField('smoothed', 'boolean', {
            requiredForKinds: ['image'],
          }),
          settingsField('preloadAsMusic', 'boolean', {
            requiredForKinds: ['audio'],
          }),
          settingsField('preloadAsSound', 'boolean', {
            requiredForKinds: ['audio'],
          }),
          settingsField('preloadInCache', 'boolean', {
            requiredForKinds: ['audio'],
          }),
          settingsField('disablePreload', 'boolean', {
            requiredForKinds: ['json', 'tilemap', 'tileset', 'spine'],
          }),
        ],
        childTables: [
          {
            table: 'resources.origin',
            header: '[resources.origin]',
            optional: true,
            fields: [
              settingsField('name', 'origin name string', { required: true }),
              settingsField('identifier', 'origin identifier string', {
                required: true,
              }),
            ],
          },
        ],
        additionalFields:
          'preserve unknown resource-kind serializer fields for forward compatibility',
      },
      rawJsonTable,
    ],
  },
  tests: {
    rootFields: [...formatFields({ kind: 'tests' })],
    childTables: [
      {
        table: 'tests',
        header: '[[tests]]',
        repeated: true,
        emptyForm: 'tests = [ ]',
        fields: [
          settingsField('scope', 'enum', {
            required: true,
            values: ['project', 'extension'],
          }),
          settingsField('extension', 'owning extension name', {
            requiredForScopes: ['extension'],
          }),
          settingsField('order', 'contiguous zero-based integer', {
            required: true,
          }),
          settingsField('name', 'container-unique test name', {
            required: true,
          }),
          settingsField('type', 'enum', {
            required: true,
            values: ['gameplay'],
          }),
          settingsField('description', 'string', { required: true }),
          settingsField(
            'file',
            'canonical root-relative tests/<Encoded basename>.js path',
            { required: true }
          ),
        ],
      },
    ],
    additionalFields:
      'No additional fields. lastRunStatus, lastRunAt, lastRunDurationMs, and lastRunFramesExecuted are forbidden editor state.',
  },
  constants: {
    rootFields: [],
    childTables: [],
    dynamicFields: {
      key: 'arbitrary user-owned TOML-compatible key',
      value:
        'string, finite number, boolean, homogeneous array, table, or nested combination',
    },
    additionalFields:
      'all fields are user-owned; rawJson has no reserved meaning here',
  },
  scene: {
    rootFields: [
      ...formatFields({ kind: 'scene', ordered: true, name: true }),
      settingsField('mangledName', 'string'),
      settingsField('title', 'string'),
      settingsField('standardSortMethod', 'boolean'),
      settingsField('stopSoundsOnStartup', 'boolean'),
      settingsField('resourcesPreloading', 'string'),
      settingsField('resourcesUnloading', 'string'),
      settingsField('disableInputWhenNotFocused', 'boolean'),
    ],
    childTables: [
      variableTable('variables'),
      objectGroupsTable(),
      objectGroupRequiredBehaviorsTable(),
      {
        table: 'behaviorsSharedData',
        header: '[[behaviorsSharedData]]',
        repeated: true,
        emptyForm: 'behaviorsSharedData = [ ]',
        fields: [
          settingsField('name', 'unique scene-local string', {
            required: true,
          }),
          settingsField('type', 'registered behaviorTypes[].type', {
            required: true,
          }),
          settingsField('quickCustomizationVisibility', 'enum', {
            values: ['default', 'visible', 'hidden'],
          }),
        ],
        childTables: [quickCustomizationTable('behaviorsSharedData')],
        dynamicFields: {
          source: 'behaviorTypes[type].sharedProperties',
          key: 'sharedProperties[].serializedKey',
          value: 'sharedProperties[].type',
        },
        additionalFields:
          'preserve unlisted existing shared-data serializer fields',
      },
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current Layout serializer fields except layout/lifecycle-function/object ownership fields',
  },
  sceneLifecycleFunction: lifecycleFunctionSchema,
  externalEvents: {
    rootFields: [
      ...formatFields({ kind: 'externalEvents', ordered: true, name: true }),
    ],
    childTables: [rawJsonTable],
    additionalFields:
      'preserve unknown current ExternalEvents serializer metadata fields except association and lifecycle bodies',
  },
  externalLifecycleFunction: lifecycleFunctionSchema,
  externalLayout: {
    rootFields: [
      ...formatFields({ kind: 'externalLayout', ordered: true, name: true }),
    ],
    childTables: [rawJsonTable],
    additionalFields:
      'preserve unknown current ExternalLayout serializer metadata fields except association and embedded layout fields',
  },
  extension: {
    rootFields: [
      ...formatFields({ kind: 'extension', ordered: true, name: true }),
      settingsField('version', 'string'),
      settingsField('extensionNamespace', 'string'),
      settingsField('shortDescription', 'string'),
      settingsField('description', 'string or string array of lines'),
      settingsField('dimension', 'string'),
      settingsField('fullName', 'string'),
      settingsField('category', 'string'),
      settingsField('tags', 'string array'),
      settingsField('authorIds', 'string array'),
      settingsField('author', 'string'),
      settingsField('previewIconUrl', 'string'),
      settingsField('iconUrl', 'string'),
      settingsField('helpPath', 'string'),
      settingsField('gdevelopVersion', 'string'),
    ],
    childTables: [
      {
        table: 'origin',
        header: '[origin]',
        optional: true,
        fields: [
          settingsField('name', 'origin name string', { required: true }),
          settingsField('identifier', 'origin identifier string', {
            required: true,
          }),
        ],
      },
      {
        table: 'changelog',
        header: '[[changelog]]',
        repeated: true,
        fields: [
          settingsField('version', 'version string', { required: true }),
          settingsField('breaking', 'string or string array of lines', {
            required: true,
          }),
        ],
      },
      {
        table: 'dependencies',
        header: '[[dependencies]]',
        repeated: true,
        emptyForm: 'dependencies = [ ]',
        fields: [
          settingsField('type', 'dependency type string', { required: true }),
          settingsField('exportName', 'string', { required: true }),
          settingsField('name', 'dependency name string', { required: true }),
          settingsField('version', 'version string', { required: true }),
        ],
      },
      {
        table: 'sourceFiles',
        header: '[[sourceFiles]]',
        repeated: true,
        fields: [
          settingsField('resourceName', 'resource name string', {
            required: true,
          }),
          settingsField('includePosition', 'enum', {
            required: true,
            values: ['first', 'last'],
          }),
        ],
      },
      variableTable('globalVariables'),
      variableTable('sceneVariables'),
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current EventsFunctionsExtension metadata fields except split child implementations',
  },
  extensionFunction: functionSchema({
    folder: false,
    extensionRequired: true,
  }),
  prefab: {
    rootFields: [
      ...formatFields({ kind: 'prefab', ordered: true, name: true }),
      settingsField('defaultName', 'string'),
      settingsField('assetStoreTag', 'string'),
      settingsField('assetStoreAssetId', 'string'),
      settingsField('assetStoreOriginalName', 'string'),
      settingsField('is3D', 'boolean', { default: false }),
      settingsField('isAnimatable', 'boolean', { default: false }),
      settingsField('isTextContainer', 'boolean', { default: false }),
      settingsField('isInnerAreaFollowingParentSize', 'boolean', {
        default: false,
      }),
      settingsField('isUsingLegacyInstancesRenderer', 'boolean'),
      settingsField('description', 'string'),
      settingsField('fullName', 'string'),
      settingsField('private', 'boolean', { default: false }),
      settingsField('previewIconUrl', 'string'),
      settingsField('iconUrl', 'string'),
      settingsField('helpPath', 'string'),
    ],
    childTables: [
      variableTable('variables'),
      attachedBehaviorTable,
      propertyDescriptorTable('propertyDescriptors'),
      objectGroupsTable(),
      objectGroupRequiredBehaviorsTable(),
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current EventsBasedObject metadata fields except split functions/layout/objects',
  },
  prefabVariant: {
    rootFields: [
      ...formatFields({ kind: 'prefabVariant', ordered: true, name: true }),
      settingsField('assetStoreAssetId', 'string'),
      settingsField('assetStoreOriginalName', 'string'),
    ],
    childTables: [
      objectGroupsTable(),
      objectGroupRequiredBehaviorsTable(),
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current EventsBasedObjectVariant metadata fields except split layout/object fields',
  },
  prefabFunction: functionSchema({
    folder: true,
    extensionRequired: false,
  }),
  behavior: {
    rootFields: [
      ...formatFields({ kind: 'behavior', ordered: true, name: true }),
      settingsField('description', 'string'),
      settingsField('fullName', 'string'),
      settingsField('private', 'boolean', { default: false }),
      settingsField('previewIconUrl', 'string'),
      settingsField('iconUrl', 'string'),
      settingsField('helpPath', 'string'),
      settingsField('objectType', 'registered object type or empty string'),
      settingsField('quickCustomizationVisibility', 'enum', {
        values: ['default', 'visible', 'hidden'],
      }),
    ],
    childTables: [
      variableTable('variables'),
      propertyDescriptorTable('propertyDescriptors'),
      propertyDescriptorTable('sharedPropertyDescriptors'),
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current EventsBasedBehavior metadata fields except split functions',
  },
  behaviorFunction: functionSchema({
    folder: true,
    extensionRequired: false,
  }),
});

const SETTINGS_FILE_KINDS = Object.freeze([
  {
    kind: 'project',
    requiredMarker: { field: 'kind', value: 'project' },
    path: MULTI_FILE_ENTRY_NAME,
    mountedNamespace: 'project',
    tomlRoot: true,
    requiredFields: ['kind', 'settingsFormatVersion'],
    commonFields: [
      'gdVersion',
      'properties',
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'variables',
      'firstLayout',
      'previewLayout',
    ],
    forbiddenFields: [
      'resources',
      'constants',
      'objects',
      'layouts',
      'eventsFunctionsExtensions',
      'externalEvents',
      'externalLayouts',
      'tests',
    ],
    schema: SETTINGS_FILE_SCHEMAS.project,
  },
  {
    kind: 'global-object',
    requiredMarker: { field: 'kind', value: 'object' },
    path: 'objects/<Object>.settings',
    mountedNamespace: 'project.objects."<Object>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'type',
    ],
    commonFields: [
      'behaviors',
      'variables',
      'effects',
      'type-specific object configuration',
    ],
    forbiddenFields: ['instances', 'layers', 'events'],
    schema: SETTINGS_FILE_SCHEMAS.object,
  },
  {
    kind: 'resources',
    requiredMarker: { field: 'kind', value: 'resources' },
    path: 'resources.settings',
    mountedNamespace: 'project.resources',
    tomlRoot: true,
    requiredFields: ['kind', 'settingsFormatVersion'],
    commonFields: ['resources', 'resourceFolders'],
    schema: SETTINGS_FILE_SCHEMAS.resources,
  },
  {
    kind: 'tests',
    requiredMarker: { field: 'kind', value: 'tests' },
    path: 'tests.settings',
    mountedNamespace: 'tests',
    tomlRoot: true,
    requiredFields: ['kind', 'settingsFormatVersion'],
    commonFields: [
      'project and extension gameplay test metadata',
      'flat root-relative JavaScript file references',
    ],
    forbiddenFields: [
      'source',
      'lastRunStatus',
      'lastRunAt',
      'lastRunDurationMs',
      'lastRunFramesExecuted',
      'inline JavaScript source',
    ],
    note:
      'Each file field is a canonical root-relative tests/<Encoded basename>.js path. JavaScript files are direct children of tests/; folders are forbidden.',
    schema: SETTINGS_FILE_SCHEMAS.tests,
  },
  {
    kind: 'constants',
    path: 'constants.toml',
    mountedNamespace: 'editor.constants',
    tomlRoot: true,
    requiredFields: [],
    commonFields: ['arbitrary TOML-compatible constants'],
    note:
      'The entire document is editor-only Constants. Do not add format metadata or a wrapper table.',
    schema: SETTINGS_FILE_SCHEMAS.constants,
  },
  {
    kind: 'scene',
    requiredMarker: { field: 'kind', value: 'scene' },
    path: 'scenes/<Scene>/scene.settings',
    mountedNamespace: 'scenes."<Scene>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'layout',
      'name',
    ],
    commonFields: [
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'variables',
      'behaviorsSharedData',
      'runtime/loading/input/sound/sort settings',
    ],
    forbiddenFields: [
      'objects',
      'instances',
      'layers',
      'uiSettings',
      'r',
      'v',
      'b',
    ],
    embeddedLayout: { rootTable: 'layout', contextKind: 'scene' },
    schema: SETTINGS_FILE_SCHEMAS.scene,
  },
  {
    kind: 'scene-lifecycle-function',
    requiredMarker: { field: 'kind', value: 'function' },
    path: 'scenes/<Scene>/functions/<Role>.settings',
    mountedNamespace: 'scenes."<Scene>".functions."<Role>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'functionType',
      'lifecycleRole',
    ],
    commonFields: ['fixed signature', 'parameters', 'objectGroups'],
    forbiddenFields: ['mutable function identity', 'event body'],
    note:
      'Only sceneLoad, sceneSignal, sceneUpdate, and sceneUnload are valid. sceneUpdate is required; empty optional same-stem pairs are forbidden.',
    schema: SETTINGS_FILE_SCHEMAS.sceneLifecycleFunction,
  },
  {
    kind: 'external-events',
    requiredMarker: { field: 'kind', value: 'externalEvents' },
    path:
      'scenes/<Scene>/external-events/<ExternalEvents>/external-events.settings',
    mountedNamespace: 'scenes."<Scene>".externalEvents."<ExternalEvents>"',
    tomlRoot: true,
    requiredFields: ['kind', 'settingsFormatVersion', 'order', 'name'],
    commonFields: ['External Events serializer metadata'],
    forbiddenFields: [
      'associatedLayout',
      'linkedScene',
      'unresolvedScene',
      'events',
      'functionFiles',
    ],
    note:
      'The associated scene and function ownership are derived from the physical directory.',
    schema: SETTINGS_FILE_SCHEMAS.externalEvents,
  },
  {
    kind: 'external-layout',
    requiredMarker: { field: 'kind', value: 'externalLayout' },
    path: 'scenes/<Scene>/external-layout/<ExternalLayout>.settings',
    mountedNamespace: 'scenes."<Scene>".externalLayouts."<ExternalLayout>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'name',
      'layout',
    ],
    commonFields: ['ExternalLayout serializer metadata'],
    forbiddenFields: [
      'associatedLayout',
      'linkedScene',
      'unresolvedScene',
      'layout URI',
    ],
    embeddedLayout: { rootTable: 'layout', contextKind: 'external' },
    note:
      'The associated scene is derived from the physical directory; layout is an embedded TOML subtree.',
    schema: SETTINGS_FILE_SCHEMAS.externalLayout,
  },
  {
    kind: 'external-lifecycle-function',
    requiredMarker: { field: 'kind', value: 'function' },
    path:
      'scenes/<Scene>/external-events/<ExternalEvents>/functions/<Role>.settings',
    mountedNamespace:
      'scenes."<Scene>".externalEvents."<ExternalEvents>".functions."<Role>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'functionType',
      'lifecycleRole',
    ],
    commonFields: ['fixed signature', 'parameters', 'objectGroups'],
    forbiddenFields: ['mutable function identity', 'event body'],
    note:
      'Only sceneLoad, sceneSignal, sceneUpdate, and sceneUnload are valid. sceneUpdate is required; empty optional same-stem pairs are forbidden.',
    schema: SETTINGS_FILE_SCHEMAS.externalLifecycleFunction,
  },
  {
    kind: 'scene-object',
    requiredMarker: { field: 'kind', value: 'object' },
    path: 'scenes/<Scene>/objects/<Object>.settings',
    mountedNamespace: 'scenes."<Scene>".objects."<Object>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'type',
    ],
    commonFields: [
      'behaviors',
      'variables',
      'effects',
      'type-specific object configuration',
    ],
    forbiddenFields: ['instances', 'layers', 'events'],
    schema: SETTINGS_FILE_SCHEMAS.object,
  },
  {
    kind: 'extension',
    requiredMarker: { field: 'kind', value: 'extension' },
    path: 'extensions/<Extension>/extension.settings',
    mountedNamespace: 'extensions."<Extension>"',
    tomlRoot: true,
    requiredFields: ['kind', 'settingsFormatVersion', 'order', 'name'],
    commonFields: ['metadata', 'dependencies', 'variables'],
    forbiddenFields: [
      'eventsFunctions',
      'eventsBasedObjects',
      'eventsBasedBehaviors',
      'tests',
    ],
    schema: SETTINGS_FILE_SCHEMAS.extension,
  },
  {
    kind: 'function',
    requiredMarker: { field: 'kind', value: 'function' },
    path: 'extensions/<Extension>/functions/<Function>.settings',
    mountedNamespace: 'extensions."<Extension>".functions."<Function>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'extension',
      'name',
      'functionType',
    ],
    commonFields: [
      'signature',
      'parameters',
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'editor metadata',
    ],
    forbiddenFields: ['event body'],
    schema: SETTINGS_FILE_SCHEMAS.extensionFunction,
  },
  {
    kind: 'prefab',
    requiredMarker: { field: 'kind', value: 'prefab' },
    path: 'extensions/<Extension>/prefabs/<Prefab>/prefab.settings',
    mountedNamespace: 'extensions."<Extension>".prefabs."<Prefab>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'name',
      'layout',
    ],
    commonFields: [
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'variables',
      'propertyDescriptors',
    ],
    forbiddenFields: [
      'instances',
      'layers',
      'editionSettings',
      'areaMin/Max fields',
      'objects',
      'functions',
    ],
    note:
      'propertyDescriptors is one flat ordered array; property folders do not exist.',
    embeddedLayout: { rootTable: 'layout', contextKind: 'prefab' },
    schema: SETTINGS_FILE_SCHEMAS.prefab,
  },
  {
    kind: 'prefab-variant',
    requiredMarker: { field: 'kind', value: 'prefabVariant' },
    path:
      'extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/variant.settings',
    mountedNamespace:
      'extensions."<Extension>".prefabs."<Prefab>".variants."<Variant>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'name',
      'layout',
    ],
    commonFields: [
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'variant metadata',
    ],
    forbiddenFields: ['objects', 'layout URI'],
    embeddedLayout: { rootTable: 'layout', contextKind: 'prefab-variant' },
    schema: SETTINGS_FILE_SCHEMAS.prefabVariant,
  },
  {
    kind: 'prefab-object',
    requiredMarker: { field: 'kind', value: 'object' },
    path:
      'extensions/<Extension>/prefabs/<Prefab>/{objects|variants/<Variant>/objects}/<Object>.settings',
    mountedNamespace:
      'extensions."<Extension>".prefabs."<Prefab>".{objects|variants."<Variant>".objects}."<Object>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'type',
    ],
    commonFields: [
      'behaviors',
      'variables',
      'effects',
      'type-specific object configuration',
    ],
    forbiddenFields: ['instances', 'layers', 'events'],
    schema: SETTINGS_FILE_SCHEMAS.object,
  },
  {
    kind: 'prefab-function',
    requiredMarker: { field: 'kind', value: 'function' },
    path:
      'extensions/<Extension>/prefabs/<Prefab>/functions/<Function>.settings',
    mountedNamespace:
      'extensions."<Extension>".prefabs."<Prefab>".functions."<Function>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'functionType',
    ],
    commonFields: [
      'signature',
      'parameters',
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'editor metadata',
    ],
    forbiddenFields: ['event body'],
    note:
      'folder is an array of editor folder names. The sibling <Function>.events owns the body.',
    schema: SETTINGS_FILE_SCHEMAS.prefabFunction,
  },
  {
    kind: 'behavior',
    requiredMarker: { field: 'kind', value: 'behavior' },
    path: 'extensions/<Extension>/behaviors/<Behavior>/behavior.settings',
    mountedNamespace: 'extensions."<Extension>".behaviors."<Behavior>"',
    tomlRoot: true,
    requiredFields: ['kind', 'settingsFormatVersion', 'order', 'name'],
    commonFields: [
      'variables',
      'propertyDescriptors',
      'sharedPropertyDescriptors',
    ],
    forbiddenFields: ['functions', 'event bodies'],
    note:
      'propertyDescriptors and sharedPropertyDescriptors are flat ordered arrays; property folders do not exist.',
    schema: SETTINGS_FILE_SCHEMAS.behavior,
  },
  {
    kind: 'behavior-function',
    requiredMarker: { field: 'kind', value: 'function' },
    path:
      'extensions/<Extension>/behaviors/<Behavior>/functions/<Function>.settings',
    mountedNamespace:
      'extensions."<Extension>".behaviors."<Behavior>".functions."<Function>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'functionType',
    ],
    commonFields: [
      'signature',
      'parameters',
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'editor metadata',
    ],
    forbiddenFields: ['event body'],
    note:
      'folder is an array of editor folder names. The sibling <Function>.events owns the body.',
    schema: SETTINGS_FILE_SCHEMAS.behaviorFunction,
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
  const owners: Array<Object> = [
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
    const sceneName = String(scene.name || '');
    const sceneFolder = encodeManagedName(sceneName);
    owners.push({
      kind: 'scene',
      name: sceneName,
      objects: (scene.objects || []).map(summarizeObjectDefinition),
      lifecycleFunctions: SCENE_LIFECYCLE_SOURCES.map(source => ({
        name: source.name,
        lifecycleRole: source.name,
        order: source.order,
        materialized:
          source.name === 'sceneUpdate' ||
          !!(scene[source.legacyField] || []).length,
        settingsUri: `game://scenes/${sceneFolder}/functions/${
          source.name
        }.settings`,
        eventsUri: `game://scenes/${sceneFolder}/functions/${
          source.name
        }.events`,
      })),
    });
  });
  (serializedProject.externalEvents || []).forEach(externalEvents => {
    const sceneName = String(externalEvents.associatedLayout || '');
    const name = String(externalEvents.name || '');
    const ownerBaseUri = `game://scenes/${encodeManagedName(
      sceneName
    )}/external-events/${encodeManagedName(name)}`;
    owners.push({
      kind: 'external-events',
      scene: sceneName,
      name,
      settingsUri: `${ownerBaseUri}/external-events.settings`,
      lifecycleFunctions: SCENE_LIFECYCLE_SOURCES.map(source => ({
        name: source.name,
        lifecycleRole: source.name,
        order: source.order,
        materialized:
          source.name === 'sceneUpdate' ||
          !!(externalEvents[source.legacyField] || []).length,
        settingsUri: `${ownerBaseUri}/functions/${source.name}.settings`,
        eventsUri: `${ownerBaseUri}/functions/${source.name}.events`,
      })),
    });
  });
  (serializedProject.externalLayouts || []).forEach(externalLayout => {
    const sceneName = String(externalLayout.associatedLayout || '');
    const name = String(externalLayout.name || '');
    owners.push({
      kind: 'external-layout',
      scene: sceneName,
      name,
      settingsUri: `game://scenes/${encodeManagedName(
        sceneName
      )}/external-layout/${encodeManagedName(name)}.settings`,
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
      (prefab.variants || []).forEach(variant => {
        const variantName = String(variant.name || '');
        owners.push({
          kind: 'prefab-variant',
          extension: extensionName,
          prefab: String(prefab.name || ''),
          name: variantName,
          settingsUri: `game://extensions/${encodeManagedName(
            extensionName
          )}/prefabs/${encodeManagedName(
            String(prefab.name || '')
          )}/variants/${encodeManagedName(variantName)}/variant.settings`,
          objects: (variant.objects || []).map(summarizeObjectDefinition),
        });
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
  additionalExtensions = [],
}: {|
  project: gdProject,
  serializedProject: Object,
  additionalExtensions?: Array<gdPlatformExtension>,
|}): Object => {
  const registeredTypes = collectRegisteredTypes(
    project,
    serializedProject,
    additionalExtensions
  );
  const settingsOwners = buildSettingsOwners(serializedProject);
  const embeddedLayoutCatalog = buildEmbeddedLayoutCatalog({
    serializedProject,
    behaviorTypes: registeredTypes.behaviorTypes,
  });
  return validateProjectSettingsCatalog({
    format: 'gdevelop-settings-catalog',
    formatVersion: PROJECT_SETTINGS_CATALOG_FORMAT_VERSION,
    project: projectIdentity(project),
    authoring: {
      sourceExtension: '.settings',
      syntax:
        'TOML 1.0 using unindented, file-local component documents mounted by physical path.',
      rules: [
        'Read the relevant existing settings file before editing or creating a sibling component.',
        'Use the matching fileKinds[].schema as the complete structural contract: rootFields lists root scalars and childTables recursively lists every canonical TOML table header, record field, dynamic-key rule, empty form, and type-specific schema reference. commonFields is only a search summary and is not a schema.',
        'Write component fields at the TOML root. Never repeat project, scene, extension, prefab, behavior, function, or object names in TOML table headers; the canonical physical path supplies that namespace.',
        'At load time the editor parses each local .settings document, mounts it at fileKinds.mountedNamespace, and strictly merges all mounted settings documents. constants.toml is loaded separately as editor-only Constants. Duplicate ownership is an error.',
        'Layout data is embedded below the reserved [layout] subtree of its owning settings file. Functions derive their same-stem .events sibling from the physical settings path; do not write layout or events URI fields.',
        `Use kind and settingsFormatVersion=${MULTI_FILE_FORMAT_VERSION} exactly where the file-kind entry requires them. Ordinary owner order is contiguous and zero based. Lifecycle order is the fixed sparse semantic value sceneLoad=0, sceneSignal=1, sceneUpdate=2, sceneUnload=3. External Events and external-layout order are independently global.`,
        'Scene and External Events bodies live in fixed functions/<Role>.settings plus same-stem <Role>.events sources. sceneUpdate is always materialized. Omit both files for empty sceneLoad, sceneSignal, and sceneUnload roles. Never rename, add, delete, reorder, duplicate, make async/public, or change the signature of a lifecycle function.',
        'Store every External Events owner at scenes/<Scene>/external-events/<ExternalEvents>/external-events.settings and every external layout at scenes/<Scene>/external-layout/<ExternalLayout>.settings. Derive associatedLayout from that path; do not write associatedLayout, linkedScene, unresolvedScene, events, functionFiles, externalLayoutFiles, or layout URI fields.',
        'Write every non-empty variable container as repeated [[variables]], [[globalVariables]], or [[sceneVariables]] records. Each record contains an explicit non-empty name and the complete descriptor fields, for example name = "Controllers", type = "array", and children = [...]. Write variables = [ ], globalVariables = [ ], or sceneVariables = [ ] only for an empty container. Keyed [variables] tables, whole-container inline tables, and non-empty inline descriptor arrays are forbidden.',
        'Write object groups only as an [objectGroups] TOML table whose keys are group names and whose values are arrays of object names, for example Buttons = ["PauseButton", "Retry"]. Preserve per-group requiredBehaviors in the optional [objectGroupRequiredBehaviors] companion table using the same group key and an array of behavior-type strings. Write objectGroups = { } when there are no groups. The retired objectsGroups field and array/table-descriptor forms are forbidden.',
        'Write Sprite originPoint and centerPoint as inline TOML tables. Write named points and customCollisionMask polygons as inline arrays of point tables. Never expand point data into dotted TOML headers.',
        'Never write a legacy *FolderStructure field or optional grouping directories. For an object or owner function, write its editor grouping as folder = ["Parent", "Child"] in that component settings file. Use folder = [] for the root.',
        'Each global, scene, default-prefab, or variant-prefab object definition and its attached behaviors belong in its dedicated objects/<Object>.settings source location; instances and per-instance behavior overrides belong in the owner settings [layout] subtree.',
        'Each scene, External Events, extension, prefab, or behavior function owns its functions/<Function>.settings location and same-stem <Function>.events body. Function settings never store an events URI, and owner settings never embed function metadata.',
        'Store all project and extension gameplay-test metadata in root tests.settings. Each file field is a scheme-free canonical tests/<Encoded basename>.js path to a direct child of root tests/. The retired source field, subfolders, game:// prefixes, inline JavaScript, and lastRunStatus/lastRunAt/lastRunDurationMs/lastRunFramesExecuted fields are forbidden.',
        'For an object, use objectTypes[type].properties for public generic-editor properties and objectTypes[type].schema for the complete known serialized TOML structure, including nested type-specific tables and repeated records. Preserve unlisted legacy or private serializer fields already present in an object definition.',
        'For an attached behavior, use behaviorTypes[].properties for author-writable fields. Editor-hidden and deprecated descriptors are intentionally absent from this catalog, but existing serialized fields not listed there are preserved verbatim because they may be configured by a specialized editor and required at runtime.',
        'Preserve unknown serializer fields. Never invent an object, behavior, or effect type absent from this catalog.',
        'Never edit generated files below .gdevelop or legacy game.json.',
      ],
      objectDefinition:
        'An object definition requires name, type, and behaviors. Author public type-specific fields through objectTypes[type].properties and objectTypes[type].schema; preserve unlisted legacy or private fields and nested variables/effects.',
      behaviorDefinition:
        'An attached behavior requires a unique object-local name and a registered type. Initialize or edit only author-writable properties listed for that type in behaviorTypes[].properties. Preserve unlisted serialized properties already present in an object definition.',
      variableDefinition:
        'Use one repeated [[variables]], [[globalVariables]], or [[sceneVariables]] record per variable. Every record contains name plus type, value or children, enum values, folded state, persistentUuid, mixed-value state, and unknown fields. Use a root field = [ ] assignment only for an empty container.',
    },
    fileKinds: SETTINGS_FILE_KINDS,
    settingsOwners,
    objectTypes: registeredTypes.objectTypes,
    behaviorTypes: registeredTypes.behaviorTypes,
    effectTypes: registeredTypes.effectTypes,
    layoutAuthoring: embeddedLayoutCatalog.authoring,
    layoutTables: embeddedLayoutCatalog.tables,
    layoutContexts: embeddedLayoutCatalog.contexts,
    behaviorOverrideSchemas: embeddedLayoutCatalog.behaviorOverrideSchemas,
    counts: {
      fileKinds: SETTINGS_FILE_KINDS.length,
      settingsOwners: settingsOwners.length,
      objectTypes: registeredTypes.objectTypes.length,
      behaviorTypes: registeredTypes.behaviorTypes.length,
      effectTypes: registeredTypes.effectTypes.length,
      layoutTables: embeddedLayoutCatalog.tables.length,
      layoutContexts: embeddedLayoutCatalog.contexts.length,
      behaviorOverrideSchemas:
        embeddedLayoutCatalog.behaviorOverrideSchemas.length,
    },
  });
};

const LAYOUT_TABLES = Object.freeze([
  {
    table: 'layout',
    header: '[layout]',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    fields: [
      { name: 'version', type: 'integer', required: true, value: 1 },
      {
        name: 'background',
        type: '"#RRGGBB"',
        requiredIn: ['scene'],
        forbiddenIn: ['prefab', 'prefab-variant', 'external'],
      },
      {
        name: 'bounds',
        type: '{ min = [x, y, z], max = [x, y, z] }',
        requiredIn: ['prefab', 'prefab-variant'],
        forbiddenIn: ['scene', 'external'],
      },
    ],
  },
  {
    table: 'editor',
    header: '[layout.editor]',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    optional: true,
    fields: [
      { name: 'grid', type: 'boolean' },
      {
        name: 'grid_type',
        type: 'enum',
        values: ['rectangular', 'isometric'],
      },
      { name: 'grid_size', type: '[x, y, z] non-negative numbers' },
      { name: 'grid_offset', type: '[x, y, z] numbers' },
      { name: 'grid_color', type: '"#RRGGBB"' },
      { name: 'grid_alpha', type: 'number', range: '[0,1]' },
      { name: 'snap', type: 'boolean' },
      { name: 'zoom', type: 'number', range: '[0.01,infinity)' },
      { name: 'window_mask', type: 'boolean' },
      { name: 'selected_layer', type: 'existing layer name' },
      {
        name: 'selected_layer_unresolved',
        type: 'boolean import marker',
        default: false,
      },
      {
        name: 'mode',
        type: 'enum',
        values: ['instances-editor', 'embedded-game'],
      },
    ],
  },
  {
    table: 'layers',
    header: '[[layout.layers]]',
    contexts: ['scene', 'prefab', 'prefab-variant'],
    repeated: true,
    fields: [
      {
        name: 'id',
        type: 'file-local lowercase letters/digits/hyphens reference',
        required: true,
      },
      { name: 'name', type: 'string', required: true },
      { name: 'rendering', type: 'enum', values: ['', '2d', '3d', '2d+3d'] },
      {
        name: 'camera_type',
        type: 'enum',
        values: ['', 'perspective', 'orthographic'],
      },
      {
        name: 'camera_behavior',
        type: 'enum',
        values: ['do-nothing', 'top-left-anchored-if-never-moved'],
      },
      { name: 'visible', type: 'boolean', default: true },
      { name: 'locked', type: 'boolean', default: false },
      {
        name: 'lighting',
        type: 'boolean',
        default: false,
        description:
          'Marks this layer as a dedicated 2D Lighting Layer. This does not enable Scene3D lighting; use Scene3D light effects for 3D layers.',
        semanticRole: 'dedicated-2d-lighting-layer',
        constraints: [
          {
            code: 'LAYOUT_3D_LAYER_MARKED_AS_LIGHTING_LAYER',
            incompatibleWhen: { rendering: ['3d', '2d+3d'] },
          },
        ],
      },
      { name: 'follow_base_camera', type: 'boolean', default: false },
      { name: 'ambient', type: '"#RRGGBB"', default: '#C8C8C8' },
      { name: 'near', type: 'number', default: 3 },
      { name: 'far', type: 'number', default: 10000 },
      { name: 'fov', type: 'number', range: '(0,180]', default: 45 },
      {
        name: 'max_2d_distance',
        type: 'positive number',
        default: 5000,
      },
      {
        name: 'cameras',
        type:
          'inline table array; each item has size and viewport as "default", numeric arrays, or { default = [...] }',
      },
    ],
    rules: ['far must be greater than near', 'at most 50 cameras'],
  },
  {
    table: 'layers',
    header: '[[layout.layers]]',
    variant: 'external reference',
    contexts: ['external'],
    repeated: true,
    fields: [
      {
        name: 'id',
        type: 'file-local lowercase letters/digits/hyphens reference',
        required: true,
      },
      { name: 'name', type: 'existing linked-scene layer', required: true },
    ],
  },
  {
    table: 'effects',
    header: '[[layout.effects]]',
    contexts: ['scene', 'prefab', 'prefab-variant'],
    repeated: true,
    fields: [
      { name: 'layer', type: 'existing layer id', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'type', type: 'registered effect type', required: true },
      { name: 'folded', type: 'boolean', default: false },
      { name: 'enabled', type: 'boolean', default: true },
    ],
    parameterFields: {
      placement: 'direct fields on [[effects]]',
      schema: 'effectTypes[type].parameters',
      scalarTypes: ['number', 'string', 'boolean'],
    },
  },
  {
    table: 'instances',
    header: '[[layout.instances]]',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    repeated: true,
    fields: [
      { name: 'id', type: 'lowercase UUIDv4', required: true },
      { name: 'object', type: 'existing object name', required: true },
      { name: 'layer', type: 'existing layer id', required: true },
      { name: 'unresolved', type: 'boolean import marker', default: false },
      { name: 'at', type: '[x, y] or [x, y, z]', required: true },
      { name: 'rotation', type: 'z number or [x, y, z]', default: 0 },
      { name: 'z_order', type: 'integer', default: 0 },
      { name: 'size', type: '[width, height] custom size' },
      { name: 'auto_size', type: '[width, height] inactive stored size' },
      { name: 'depth', type: 'number' },
      { name: 'opacity', type: 'integer', range: '[0,255]', default: 255 },
      { name: 'flip', type: 'unique string array', values: ['x', 'y', 'z'] },
      { name: 'locked', type: 'boolean', default: false },
      { name: 'sealed', type: 'boolean', default: false },
      { name: 'hidden', type: 'boolean', default: false },
      { name: 'keep_ratio', type: 'boolean', default: true },
      {
        name: 'properties',
        type: 'inline TOML table of catalog-declared number/string values',
      },
    ],
  },
  {
    table: 'variables',
    header: '[[layout.variables]]',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    repeated: true,
    fields: [
      { name: 'instance', type: 'existing instance UUID', required: true },
      { name: 'name', type: 'string', required: true },
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
        type: 'unique TOML string array',
        allowedFor: ['enum'],
      },
      { name: 'folded', type: 'boolean', default: false },
      { name: 'id', type: 'lowercase UUIDv4' },
      {
        name: 'children',
        type: 'recursive inline variable table array for structure/array',
      },
    ],
  },
  {
    table: 'behaviors',
    header: '[[layout.behaviors]]',
    contexts: ['scene', 'prefab', 'prefab-variant', 'external'],
    repeated: true,
    fields: [
      { name: 'instance', type: 'existing instance UUID', required: true },
      { name: 'name', type: 'attached behavior name', required: true },
      {
        name: 'properties',
        type:
          'inline TOML table keyed by behaviorOverrideSchemas[].properties[].serializedKey',
      },
      { name: 'folded', type: 'boolean', default: false },
      { name: 'muted', type: 'boolean', default: false },
      { name: 'inherited', type: 'boolean', default: false },
      {
        name: 'quick',
        type: 'enum',
        values: ['default', 'visible', 'hidden'],
      },
      {
        name: 'property_visibility',
        type: 'inline TOML table with default|visible|hidden string values',
      },
    ],
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
        owner: {
          scene: String(scene.name || ''),
          settingsUri: `game://scenes/${encodeManagedName(
            String(scene.name || '')
          )}/scene.settings`,
        },
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
          owner: {
            extension: extensionName,
            prefab: prefabName,
            settingsUri: `game://extensions/${encodeManagedName(
              extensionName
            )}/prefabs/${encodeManagedName(prefabName)}/prefab.settings`,
          },
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
              settingsUri: `game://extensions/${encodeManagedName(
                extensionName
              )}/prefabs/${encodeManagedName(
                prefabName
              )}/variants/${encodeManagedName(
                String(variant.name || '')
              )}/variant.settings`,
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
          settingsUri: `game://scenes/${encodeManagedName(
            linkedSceneName
          )}/external-layout/${encodeManagedName(
            String(external.name || '')
          )}.settings`,
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

const buildEmbeddedLayoutCatalog = ({
  serializedProject,
  behaviorTypes,
}: {|
  serializedProject: Object,
  behaviorTypes: Array<Object>,
|}): Object => {
  const behaviorOverrideSchemas = behaviorTypes.map(behavior => ({
    behaviorType: behavior.type,
    keySpace: 'serialized',
    unknownPropertyPolicy: behavior.unknownPropertyPolicy || 'preserve',
    properties: (behavior.properties || [])
      .filter(property => property.serializedKey)
      .map(property => ({
        authoringKey: property.authoringKey || property.name,
        serializedKey: property.serializedKey,
        type: property.type,
      })),
  }));
  const contexts = buildLayoutContexts(serializedProject);
  return {
    authoring: {
      sourceExtension: '.settings',
      storage: 'embedded-settings',
      rootTable: 'layout',
      syntax:
        'Standard TOML embedded below the owning settings file layout namespace.',
      rules: [
        'Read the owning settings file and the matching context entry before editing its embedded layout subtree.',
        'Use only the listed [layout], [layout.editor], [[layout.layers]], [[layout.effects]], [[layout.instances]], [[layout.variables]], and [[layout.behaviors]] tables and fields.',
        'Use standard TOML strings, booleans, numeric arrays, and inline tables. Colors are quoted uppercase #RRGGBB strings.',
        'Preserve existing instance UUIDs. New UUIDv4 values must be lowercase and unique within the owning layout.',
        'Layer ids are short file-local references. Every effect and instance uses an existing layer id; every variable and behavior uses an existing instance UUID.',
        'Effect parameters are direct fields on [[effects]] after type. Use the exact names and TOML scalar types in effectTypes[type].parameters; params is not a valid field.',
        'Use an existing object name from the matching context in instance.object.',
        'A [[behaviors]] record may reference only a behavior already attached to its instance object. Its properties keys must use the exact serializedKey entries in behaviorOverrideSchemas, never editor-facing authoringKey values.',
        'The [[instances]] record order is the global serialized instance order. Never add a synthetic order field.',
        'Object definitions and attached behaviors belong in .settings, while event logic belongs in .events.',
      ],
    },
    tables: LAYOUT_TABLES,
    contexts,
    behaviorOverrideSchemas,
  };
};

export const buildBehaviorPropertySchemasByType = (
  catalogOrBehaviorTypes: Object | Array<Object>
): Object => {
  const behaviorTypes = Array.isArray(catalogOrBehaviorTypes)
    ? catalogOrBehaviorTypes
    : (catalogOrBehaviorTypes && catalogOrBehaviorTypes.behaviorTypes) || [];
  const schemas: { [string]: Object } = {};
  behaviorTypes.forEach(behavior => {
    schemas[String(behavior.type || '')] = {
      keySpace: 'serialized',
      unknownPropertyPolicy: behavior.unknownPropertyPolicy || 'preserve',
      properties: (behavior.properties || [])
        .filter(property => property.serializedKey)
        .map(property => ({
          authoringKey: String(property.authoringKey || property.name || ''),
          serializedKey: String(property.serializedKey || ''),
          type: String(property.type || ''),
        })),
    };
  });
  return schemas;
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
    catalog.formatVersion !== PROJECT_SETTINGS_CATALOG_FORMAT_VERSION ||
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
  const keys: Set<string> = new Set();
  entries.forEach(entry => {
    if (!entry || typeof entry !== 'object') fail(`Invalid ${label} entry.`);
    const key = getKey(entry);
    if (!key) fail(`${label} entry has no identity.`);
    if (keys.has(key)) fail(`Duplicate ${label} entry ${key}.`);
    keys.add(key);
  });
};

const validateSettingsSchemaFields = (fields: any, label: string): void => {
  if (!Array.isArray(fields)) fail(`${label} fields must be an array.`);
  validateUniqueEntries(fields, field => field.name, `${label} field`);
  fields.forEach(field => {
    if (typeof field.type !== 'string' || !field.type) {
      fail(`${label} field ${field.name} must declare a type.`);
    }
  });
};

const validateSettingsChildTables = (tables: any, label: string): void => {
  if (!Array.isArray(tables)) fail(`${label} childTables must be an array.`);
  validateUniqueEntries(tables, table => table.table, `${label} child table`);
  tables.forEach(table => {
    if (typeof table.header !== 'string' || !table.header) {
      fail(`${label} child table ${table.table} must declare a TOML header.`);
    }
    if (table.fields !== undefined) {
      validateSettingsSchemaFields(
        table.fields,
        `${label} child table ${table.table}`
      );
    }
    if (
      table.fields === undefined &&
      table.dynamicFields === undefined &&
      table.additionalFields === undefined
    ) {
      fail(
        `${label} child table ${
          table.table
        } must declare fields, dynamicFields, or an additionalFields contract.`
      );
    }
    if (table.childTables !== undefined) {
      validateSettingsChildTables(
        table.childTables,
        `${label} child table ${table.table}`
      );
    }
  });
};

const validateSettingsFileSchema = (schema: any, kind: string): void => {
  if (!schema || typeof schema !== 'object') {
    fail(`File kind ${kind} must declare a schema.`);
  }
  validateSettingsSchemaFields(schema.rootFields, `File kind ${kind} root`);
  validateSettingsChildTables(schema.childTables, `File kind ${kind}`);
};

export const validateProjectSettingsCatalog = (catalog: any): Object => {
  const validated = validateBaseCatalog(catalog, 'gdevelop-settings-catalog', [
    'fileKinds',
    'settingsOwners',
    'objectTypes',
    'behaviorTypes',
    'effectTypes',
    'layoutTables',
    'layoutContexts',
    'behaviorOverrideSchemas',
  ]);
  validateUniqueEntries(validated.fileKinds, entry => entry.kind, 'file kind');
  validated.fileKinds.forEach(fileKind => {
    const expectedFileKind: any = SETTINGS_FILE_KINDS.find(
      entry => entry.kind === fileKind.kind
    );
    if (!expectedFileKind) fail(`Unknown file kind ${fileKind.kind}.`);
    validateSettingsFileSchema(fileKind.schema, fileKind.kind);
    const expectedMarker = expectedFileKind.requiredMarker;
    if (
      expectedMarker &&
      (!fileKind.requiredMarker ||
        fileKind.requiredMarker.field !== expectedMarker.field ||
        fileKind.requiredMarker.value !== expectedMarker.value)
    ) {
      fail(
        `File kind ${fileKind.kind} must declare persisted marker ${
          expectedMarker.field
        }=${expectedMarker.value}.`
      );
    }
  });
  validateUniqueEntries(
    validated.objectTypes,
    entry => entry.type,
    'object type'
  );
  validated.objectTypes.forEach(objectType => {
    const hasConfigurationContract =
      objectType.properties !== undefined ||
      objectType.schema !== undefined ||
      objectType.keySpace !== undefined ||
      objectType.unknownPropertyPolicy !== undefined;
    if (!hasConfigurationContract) return;
    if (
      objectType.keySpace !== 'serialized paths' ||
      objectType.unknownPropertyPolicy !== 'preserve' ||
      !Array.isArray(objectType.properties) ||
      !objectType.schema
    ) {
      fail(
        `Object type ${objectType.type} has an invalid configuration contract.`
      );
    }
    validateSettingsSchemaFields(
      objectType.schema.rootFields,
      `Object type ${objectType.type} root`
    );
    validateSettingsChildTables(
      objectType.schema.childTables,
      `Object type ${objectType.type}`
    );
    objectType.properties.forEach(property => {
      if (!property.authoringKey || !property.type) {
        fail(
          `Object type ${
            objectType.type
          } has a public property without an authoring key or type.`
        );
      }
    });
  });
  validateUniqueEntries(
    validated.behaviorTypes,
    entry => entry.type,
    'behavior type'
  );
  validated.behaviorTypes.forEach(behavior => {
    if (
      behavior.keySpace !== 'serialized' ||
      !['error', 'preserve'].includes(behavior.unknownPropertyPolicy) ||
      !Array.isArray(behavior.properties) ||
      !Array.isArray(behavior.sharedProperties)
    ) {
      fail(`Behavior type ${behavior.type} has an invalid property contract.`);
    }
    ['properties', 'sharedProperties'].forEach(propertyListName => {
      const serializedKeys: Set<string> = new Set();
      behavior[propertyListName].forEach(property => {
        if (
          !property ||
          !String(property.authoringKey || '') ||
          !String(property.type || '')
        ) {
          fail(
            `Behavior type ${
              behavior.type
            } has a ${propertyListName} entry without an authoring key or type.`
          );
        }
        if (!property.serializedKey) {
          if (
            !property.serialization ||
            property.serialization.status !== 'unsupported' ||
            !String(property.serialization.reason || '')
          ) {
            fail(
              `Behavior property ${behavior.type}.${
                property.authoringKey
              } has no serialized key or explicit unsupported mapping.`
            );
          }
          return;
        }
        if (serializedKeys.has(property.serializedKey)) {
          fail(
            `Behavior type ${
              behavior.type
            } has duplicate serialized property key ${property.serializedKey}.`
          );
        }
        serializedKeys.add(property.serializedKey);
      });
    });
  });
  validateUniqueEntries(
    validated.effectTypes,
    entry => entry.type,
    'effect type'
  );
  if (
    !validated.layoutAuthoring ||
    typeof validated.layoutAuthoring !== 'object' ||
    validated.layoutAuthoring.rootTable !== 'layout' ||
    validated.layoutAuthoring.storage !== 'embedded-settings'
  ) {
    fail('Settings catalog must declare embedded layout authoring metadata.');
  }
  validateUniqueEntries(
    validated.layoutTables,
    entry => `${entry.table}\u0000${entry.variant || ''}`,
    'layout table'
  );
  validated.layoutContexts.forEach(context => {
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
    validated.behaviorOverrideSchemas,
    entry => entry.behaviorType,
    'behavior override schema'
  );
  validated.behaviorOverrideSchemas.forEach(schema => {
    if (
      schema.keySpace !== 'serialized' ||
      !['error', 'preserve'].includes(schema.unknownPropertyPolicy) ||
      !Array.isArray(schema.properties)
    ) {
      fail(
        `Behavior override schema ${
          schema.behaviorType
        } has an invalid key-space contract.`
      );
    }
    validateUniqueEntries(
      schema.properties,
      property => property.serializedKey,
      `serialized property for ${schema.behaviorType}`
    );
    schema.properties.forEach(property => {
      if (!property.authoringKey || !property.type) {
        fail(
          `Behavior override property ${schema.behaviorType}.${
            property.serializedKey
          } has no authoring key or type.`
        );
      }
    });
  });
  return validated;
};

const serializeCatalog = (
  catalog: Object,
  orderedArrayNames: Array<string>
): string => {
  const arrays: { [string]: Array<Object> } = {};
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
    'layoutTables',
    'layoutContexts',
    'behaviorOverrideSchemas',
  ]);
