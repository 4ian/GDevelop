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
} from './MultiFileProjectFormat';

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
    settingsField('events', 'canonical game:// URI ending in .events', {
      required: true,
    }),
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
    policy:
      'Read an existing object of the same registered type before authoring type-specific configuration; preserve all unknown fields and child tables.',
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
      settingsField('layout', 'canonical game:// URI ending in .layout', {
        required: true,
      }),
      settingsField('events', 'canonical game:// URI ending in .events', {
        required: true,
      }),
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
      {
        table: 'externalEventFiles',
        header: '[[externalEventFiles]]',
        repeated: true,
        emptyForm: 'externalEventFiles = [ ]',
        fields: [
          settingsField('name', 'globally unique external-event name', {
            required: true,
          }),
          settingsField('order', 'project-wide contiguous zero-based integer', {
            required: true,
          }),
          settingsField(
            'events',
            'canonical game://scenes/<owner>/externals URI ending in .events',
            {
              required: true,
            }
          ),
        ],
        forbiddenFields: ['associatedLayout', 'linkedScene', 'unresolvedScene'],
        additionalFields:
          'preserve unknown ExternalEvents serializer metadata fields; the owning scene supplies associatedLayout',
      },
      {
        table: 'externalLayoutFiles',
        header: '[[externalLayoutFiles]]',
        repeated: true,
        emptyForm: 'externalLayoutFiles = [ ]',
        fields: [
          settingsField('name', 'globally unique external-layout name', {
            required: true,
          }),
          settingsField('order', 'project-wide contiguous zero-based integer', {
            required: true,
          }),
          settingsField(
            'layout',
            'canonical game://scenes/<owner>/externals URI ending in .layout',
            {
              required: true,
            }
          ),
        ],
        forbiddenFields: ['associatedLayout', 'linkedScene', 'unresolvedScene'],
        additionalFields:
          'preserve unknown ExternalLayout serializer metadata fields; the owning scene supplies associatedLayout',
      },
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current Layout serializer fields except layout/events/object ownership fields',
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
      settingsField('layout', 'canonical game:// URI ending in .layout', {
        required: true,
      }),
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
      {
        table: 'variants',
        header: '[[variants]]',
        repeated: true,
        emptyForm: 'variants = [ ]',
        fields: [
          settingsField('name', 'unique variant name', { required: true }),
          settingsField('layout', 'canonical game:// URI ending in .layout', {
            required: true,
          }),
          settingsField('assetStoreAssetId', 'string'),
          settingsField('assetStoreOriginalName', 'string'),
        ],
        childTables: [
          objectGroupsTable('variants.'),
          objectGroupRequiredBehaviorsTable('variants.'),
        ],
        additionalFields:
          'preserve unknown current EventsBasedObjectVariant metadata fields except split layout/object fields',
      },
      rawJsonTable,
    ],
    additionalFields:
      'preserve unknown current EventsBasedObject metadata fields except split functions/layout/objects',
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
      'events',
      'name',
    ],
    commonFields: [
      'objectGroups',
      'objectGroupRequiredBehaviors',
      'variables',
      'behaviorsSharedData',
      'externalEventFiles',
      'externalLayoutFiles',
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
    schema: SETTINGS_FILE_SCHEMAS.scene,
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
    ],
    schema: SETTINGS_FILE_SCHEMAS.extension,
  },
  {
    kind: 'function',
    requiredMarker: { field: 'kind', value: 'function' },
    path: 'extensions/<Extension>/functions/<Function>/function.settings',
    mountedNamespace: 'extensions."<Extension>".functions."<Function>"',
    tomlRoot: true,
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
      'variants',
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
    schema: SETTINGS_FILE_SCHEMAS.prefab,
  },
  {
    kind: 'prefab-object',
    requiredMarker: { field: 'kind', value: 'object' },
    path:
      'extensions/<Extension>/prefabs/<Prefab>/{objects|variants/<Variant>/objects}/<Object>.settings',
    mountedNamespace:
      'extensions."<Extension>".prefabs."<Prefab>".{objects|variantObjects."<Variant>"}."<Object>"',
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
      'extensions/<Extension>/prefabs/<Prefab>/functions/<Function>/function.settings',
    mountedNamespace:
      'extensions."<Extension>".prefabs."<Prefab>".functions."<Function>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'events',
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
      'extensions/<Extension>/behaviors/<Behavior>/functions/<Function>/function.settings',
    mountedNamespace:
      'extensions."<Extension>".behaviors."<Behavior>".functions."<Function>"',
    tomlRoot: true,
    requiredFields: [
      'kind',
      'settingsFormatVersion',
      'order',
      'folder',
      'name',
      'events',
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
  return validateProjectSettingsCatalog({
    format: 'gdevelop-settings-catalog',
    formatVersion: 1,
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
        'Use canonical game:// URIs for .layout and .events references.',
        `Use kind, settingsFormatVersion=${MULTI_FILE_FORMAT_VERSION}, and contiguous zero-based order fields exactly where the file-kind entry requires them. External event/layout order is global across all scene.settings documents.`,
        'Store external event and layout manifests as [[externalEventFiles]] and [[externalLayoutFiles]] records in their owning scene.settings. Store their sources below that scene folder in externals/. The scene owner supplies associatedLayout; do not write associatedLayout, linkedScene, or unresolvedScene in source manifests.',
        'Write every non-empty variable container as repeated [[variables]], [[globalVariables]], or [[sceneVariables]] records. Each record contains an explicit non-empty name and the complete descriptor fields, for example name = "Controllers", type = "array", and children = [...]. Write variables = [ ], globalVariables = [ ], or sceneVariables = [ ] only for an empty container. Keyed [variables] tables, whole-container inline tables, and non-empty inline descriptor arrays are forbidden.',
        'Write object groups only as an [objectGroups] TOML table whose keys are group names and whose values are arrays of object names, for example Buttons = ["PauseButton", "Retry"]. Preserve per-group requiredBehaviors in the optional [objectGroupRequiredBehaviors] companion table using the same group key and an array of behavior-type strings. Write objectGroups = { } when there are no groups. The retired objectsGroups field and array/table-descriptor forms are forbidden.',
        'Write Sprite originPoint and centerPoint as inline TOML tables. Write named points and customCollisionMask polygons as inline arrays of point tables. Never expand point data into dotted TOML headers.',
        'Never write a legacy *FolderStructure field or optional grouping directories. For an object or owner function, write its editor grouping as folder = ["Parent", "Child"] in that component settings file. Use folder = [] for the root.',
        'Each global, scene, default-prefab, or variant-prefab object definition and its attached behaviors belong in its flat objects/<Object>.settings source location; instances and per-instance behavior overrides belong in .layout.',
        'Each prefab or behavior function owns the flat functions/<Function>/function.settings location and a sibling <Function>.events body. Owner settings never embed function metadata.',
        'For an attached behavior, use behaviorTypes[].properties for author-writable fields. Editor-hidden and deprecated descriptors are intentionally absent from this catalog, but existing serialized fields not listed there are preserved verbatim because they may be configured by a specialized editor and required at runtime.',
        'Preserve unknown serializer fields. Never invent an object, behavior, or effect type absent from this catalog.',
        'Never edit generated files below .gdevelop or legacy game.json.',
      ],
      objectDefinition:
        'An object definition requires name, type, and behaviors. Preserve its type-specific serializer fields and nested variables/effects.',
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
    counts: {
      fileKinds: SETTINGS_FILE_KINDS.length,
      settingsOwners: settingsOwners.length,
      objectTypes: registeredTypes.objectTypes.length,
      behaviorTypes: registeredTypes.behaviorTypes.length,
      effectTypes: registeredTypes.effectTypes.length,
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
    header: '[editor]',
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
    header: '[[layers]]',
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
    header: '[[layers]]',
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
    header: '[[effects]]',
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
    header: '[[instances]]',
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
    header: '[[variables]]',
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
    header: '[[behaviors]]',
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
  behaviorTypes,
}: {|
  project: gdProject,
  serializedProject: Object,
  effectTypes?: Array<Object>,
  behaviorTypes?: Array<Object>,
|}): Object => {
  const registeredTypes =
    effectTypes && behaviorTypes
      ? null
      : collectRegisteredTypes(project, serializedProject);
  const registeredEffectTypes =
    effectTypes || (registeredTypes && registeredTypes.effectTypes) || [];
  const registeredBehaviorTypes =
    behaviorTypes || (registeredTypes && registeredTypes.behaviorTypes) || [];
  const behaviorOverrideSchemas = registeredBehaviorTypes.map(behavior => ({
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
  return validateProjectLayoutCatalog({
    format: 'gdevelop-layout-catalog',
    formatVersion: 1,
    project: projectIdentity(project),
    authoring: {
      sourceExtension: '.layout',
      syntax: 'Standard flat TOML using short layout record headers.',
      rules: [
        'Read the owning settings namespace and the matching context entry before editing a layout.',
        'Use only the listed [layout], [editor], [[layers]], [[effects]], [[instances]], [[variables]], and [[behaviors]] tables and fields.',
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
    effectTypes: registeredEffectTypes,
    behaviorOverrideSchemas,
    counts: {
      tables: LAYOUT_TABLES.length,
      contexts: contexts.length,
      effectTypes: registeredEffectTypes.length,
      behaviorOverrideSchemas: behaviorOverrideSchemas.length,
    },
  });
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
  ]);
  validateUniqueEntries(validated.fileKinds, entry => entry.kind, 'file kind');
  validated.fileKinds.forEach(fileKind => {
    const expectedFileKind = SETTINGS_FILE_KINDS.find(
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
  return validated;
};

export const validateProjectLayoutCatalog = (catalog: any): Object => {
  const validated = validateBaseCatalog(catalog, 'gdevelop-layout-catalog', [
    'tables',
    'contexts',
    'effectTypes',
    'behaviorOverrideSchemas',
  ]);
  validateUniqueEntries(
    validated.tables,
    entry => `${entry.table}\u0000${entry.variant || ''}`,
    'layout table'
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
  ]);

export const serializeProjectLayoutCatalog = (catalog: Object): string =>
  serializeCatalog(validateProjectLayoutCatalog(catalog), [
    'tables',
    'contexts',
    'effectTypes',
    'behaviorOverrideSchemas',
  ]);
