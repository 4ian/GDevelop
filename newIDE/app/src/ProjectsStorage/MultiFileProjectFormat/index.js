// @noflow

import parseToml from '@iarna/toml/parse-string';
import stringifyToml from '@iarna/toml/stringify';
import { sha256 } from 'js-sha256';
import {
  IFDO_EVENTS_DSL_COVERAGE,
  IfDoError,
  compileIfDoToLegacyEventsJson,
  convertLegacyEventsJsonToIfDo,
  parseLegacyEventsJson,
} from '../../EventsSheet/IfDoEventsDsl';
import {
  LayoutTomlError,
  compileEmbeddedLayoutToml,
  decompileEmbeddedLayoutToml,
} from '../LayoutToml';

export const MULTI_FILE_FORMAT_VERSION = 5;
export const MULTI_FILE_ENTRY_NAME = 'project.gdevelop';
export const MULTI_FILE_ENTRY_URI = 'game://project.gdevelop';
export const MULTI_FILE_RESOURCES_URI = 'game://resources.settings';
export const MULTI_FILE_CONSTANTS_URI = 'game://constants.toml';
export const MULTI_FILE_RETIRED_EXTERNAL_SETTINGS_URI =
  'game://externals/external.settings';

const PROJECT_SPLIT_FIELDS = new Set([
  'resources',
  'constants',
  'objects',
  'layouts',
  'externalEvents',
  'externalLayouts',
  'eventsFunctionsExtensions',
]);

export const LEGACY_FOLDER_STRUCTURE_FIELDS = Object.freeze([
  'eventsFunctionsFolderStructure',
  'objectsFolderStructure',
  'propertiesFolderStructure',
  'sharedPropertiesFolderStructure',
]);
const LEGACY_FOLDER_STRUCTURE_FIELD_SET = new Set(
  LEGACY_FOLDER_STRUCTURE_FIELDS
);
const VARIABLE_DEFINITION_FIELDS = Object.freeze([
  'variables',
  'globalVariables',
  'sceneVariables',
]);
const SOURCE_OBJECT_GROUPS_FIELD = 'objectGroups';
const SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD =
  'objectGroupRequiredBehaviors';
const LEGACY_OWNER_OBJECT_GROUPS_FIELD = 'objectsGroups';

export const SCENE_LAYOUT_FIELDS = Object.freeze([
  'r',
  'v',
  'b',
  'uiSettings',
  'instances',
  'layers',
]);

const PREFAB_LAYOUT_FIELDS = Object.freeze([
  'areaMinX',
  'areaMinY',
  'areaMinZ',
  'areaMaxX',
  'areaMaxY',
  'areaMaxZ',
  'layers',
  'instances',
  'editionSettings',
]);

const EXTERNAL_LAYOUT_FIELDS = Object.freeze(['instances', 'editionSettings']);
const LAYOUT_TOML_KIND_BY_FORMAT = Object.freeze({
  'gdevelop-scene-layout': 'scene',
  'gdevelop-prefab-layout': 'prefab',
  'gdevelop-prefab-variant-layout': 'prefab-variant',
  'gdevelop-external-layout': 'external',
});
const WINDOWS_DEVICE_NAME = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i;
const SIMPLE_URI_SEGMENT = /^[A-Za-z0-9_.-]+$/;

const SCENE_LIFECYCLE_FUNCTION_DEFINITIONS = Object.freeze([
  {
    name: 'sceneLoad',
    legacyField: 'sceneLoadEvents',
    order: 0,
    fullName: 'On scene load',
    description:
      'Events run once after this scene has loaded, before its first update.',
    parameters: [],
  },
  {
    name: 'sceneSignal',
    legacyField: 'sceneSignalEvents',
    order: 1,
    fullName: 'On scene signal',
    description:
      'Events run once for each scene signal delivered to this scene.',
    parameters: [
      {
        name: 'SignalName',
        type: 'string',
        description: 'Delivered scene signal name',
        optional: false,
        defaultValue: '',
        codeOnly: false,
      },
      {
        name: 'Payload',
        type: 'string',
        description: 'Delivered immutable string payload',
        optional: false,
        defaultValue: '',
        codeOnly: false,
      },
    ],
  },
  {
    name: 'sceneUpdate',
    legacyField: 'events',
    order: 2,
    fullName: 'Scene update',
    description: 'Events run every frame while this scene is active.',
    parameters: [],
  },
  {
    name: 'sceneUnload',
    legacyField: 'sceneUnloadEvents',
    order: 3,
    fullName: 'On scene unload',
    description:
      'Events run once before this scene and its objects are unloaded.',
    parameters: [],
  },
]);

const SCENE_LIFECYCLE_FUNCTION_NAMES = new Set(
  SCENE_LIFECYCLE_FUNCTION_DEFINITIONS.map(definition => definition.name)
);

export class MultiFileProjectError extends Error {
  code: string;
  fileUri: ?string;
  line: ?number;
  column: ?number;

  constructor(code: string, message: string, fileUri?: string) {
    super(fileUri ? `${message} (${fileUri})` : message);
    this.name = 'MultiFileProjectError';
    this.code = code;
    this.fileUri = fileUri || null;
    this.line = null;
    this.column = null;
  }
}

const fail = (code: string, message: string, fileUri?: string): empty => {
  throw new MultiFileProjectError(code, message, fileUri);
};

const rethrowLayoutTomlError = (error, fileUri): empty => {
  const wrapped = new MultiFileProjectError(error.code, error.message);
  wrapped.fileUri = fileUri;
  wrapped.line = error.line;
  wrapped.column = error.column;
  throw wrapped;
};

const rethrowIfDoError = (error, fileUri): empty => {
  const wrapped = new MultiFileProjectError(error.code, error.message);
  wrapped.fileUri = fileUri;
  wrapped.line = error.line;
  throw wrapped;
};

const clone = value =>
  JSON.parse(
    JSON.stringify(value, (key, nestedValue) => {
      if (typeof nestedValue !== 'bigint') return nestedValue;
      const numberValue = Number(nestedValue);
      if (!Number.isSafeInteger(numberValue)) {
        fail(
          'MULTIFILE_UNREPRESENTABLE_VALUE',
          'TOML integers outside the JSON safe-integer range are forbidden.'
        );
      }
      return numberValue;
    })
  );

const removeLegacyFolderStructures = value => {
  if (Array.isArray(value)) {
    value.forEach(removeLegacyFolderStructures);
    return value;
  }
  if (!value || typeof value !== 'object') return value;
  Object.keys(value).forEach(key => {
    if (LEGACY_FOLDER_STRUCTURE_FIELD_SET.has(key)) delete value[key];
    else removeLegacyFolderStructures(value[key]);
  });
  return value;
};

export const removeLegacyFolderStructuresFromProject = legacyProject =>
  removeLegacyFolderStructures(clone(legacyProject));

const ATTACHED_BEHAVIOR_IDENTITY_FIELDS = new Set([
  'name',
  'type',
  'isFolded',
  'isMuted',
  'isInheritedFromObjectType',
  'quickCustomizationVisibility',
  'propertiesQuickCustomizationVisibilities',
]);

const rejectLegacyFolderStructures = (value, fileUri, pointer = '') => {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      rejectLegacyFolderStructures(item, fileUri, `${pointer}/${index}`)
    );
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.keys(value).forEach(key => {
    const childPointer = `${pointer}/${quotePointerToken(key)}`;
    if (LEGACY_FOLDER_STRUCTURE_FIELD_SET.has(key)) {
      fail(
        'MULTIFILE_FORBIDDEN_FOLDER_STRUCTURE',
        `${key} is not part of the multi-file format. Use the physical project folders instead (${childPointer}).`,
        fileUri
      );
    }
    rejectLegacyFolderStructures(value[key], fileUri, childPointer);
  });
};

const asObject = (value, label, fileUri) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('MULTIFILE_INVALID_SCHEMA', `${label} must be a table.`, fileUri);
  }
  return value;
};

const asArray = (value, label, fileUri) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    fail('MULTIFILE_INVALID_SCHEMA', `${label} must be an array.`, fileUri);
  }
  return value;
};

const expectString = (value, label, fileUri) => {
  if (typeof value !== 'string') {
    fail('MULTIFILE_INVALID_SCHEMA', `${label} must be a string.`, fileUri);
  }
  return value;
};

const quotePointerToken = token =>
  String(token)
    .replace(/~/g, '~0')
    .replace(/\//g, '~1');

const unquotePointerToken = token =>
  token.replace(/~1/g, '/').replace(/~0/g, '~');

const canonicalJson = value => JSON.stringify(value);

const scalarKind = value =>
  value === null
    ? 'null'
    : Array.isArray(value)
    ? 'array'
    : typeof value === 'object'
    ? 'object'
    : typeof value;

const compactVariableDefinitionFields = payload => {
  const compacted = clone(payload);
  VARIABLE_DEFINITION_FIELDS.forEach(field => {
    if (compacted[field] === undefined) return;
    if (!Array.isArray(compacted[field])) {
      fail(
        'MULTIFILE_INVALID_VARIABLES',
        `${field} must be a variable-definition array before serialization.`
      );
    }
    const names = new Set();
    compacted[field].forEach((variable, index) => {
      if (
        !variable ||
        typeof variable !== 'object' ||
        Array.isArray(variable)
      ) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field}[${index}] must be a variable descriptor.`
        );
      }
      const name = variable.name;
      if (typeof name !== 'string' || !name.length) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field}[${index}].name must be a non-empty string.`
        );
      }
      if (names.has(name)) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field} contains duplicate variable ${name}.`
        );
      }
      names.add(name);
    });
  });
  return compacted;
};

const validateObjectGroupStringArray = (values, label, fileUri) => {
  const strings = asArray(values, label, fileUri);
  strings.forEach((value, index) => {
    if (typeof value !== 'string') {
      fail(
        'MULTIFILE_INVALID_OBJECT_GROUPS',
        `${label}[${index}] must be a string.`,
        fileUri
      );
    }
  });
  return strings;
};

const compactObjectGroupDescriptors = (descriptors, descriptorField, label) =>
  asArray(descriptors, label, undefined).map((descriptor, index) => {
    if (
      !descriptor ||
      typeof descriptor !== 'object' ||
      Array.isArray(descriptor) ||
      Object.keys(descriptor).length !== 1 ||
      typeof descriptor[descriptorField] !== 'string'
    ) {
      fail(
        'MULTIFILE_INVALID_OBJECT_GROUPS',
        `${label}[${index}] must contain exactly one string ${descriptorField} field.`
      );
    }
    return descriptor[descriptorField];
  });

const compactObjectGroupFields = payload => {
  const compacted = clone(payload);
  const compactGroupsOn = (owner, legacyField, label) => {
    if (owner[legacyField] === undefined) return;
    if (
      legacyField !== SOURCE_OBJECT_GROUPS_FIELD &&
      owner[SOURCE_OBJECT_GROUPS_FIELD] !== undefined
    ) {
      fail(
        'MULTIFILE_INVALID_OBJECT_GROUPS',
        `${label} cannot contain both objectsGroups and objectGroups.`
      );
    }
    if (owner[SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD] !== undefined) {
      fail(
        'MULTIFILE_INVALID_OBJECT_GROUPS',
        `${label} cannot contain the source-only ${SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD} field before projection.`
      );
    }
    const legacyGroups = asArray(owner[legacyField], label, undefined);
    const groupsByName = {};
    const requiredBehaviorsByGroupName = {};
    legacyGroups.forEach((group, index) => {
      if (!group || typeof group !== 'object' || Array.isArray(group)) {
        fail(
          'MULTIFILE_INVALID_OBJECT_GROUPS',
          `${label}[${index}] must be an object-group descriptor.`
        );
      }
      const fields = Object.keys(group);
      if (
        (fields.length !== 2 && fields.length !== 3) ||
        !fields.includes('name') ||
        !fields.includes('objects') ||
        (fields.length === 3 && !fields.includes('requiredBehaviors'))
      ) {
        fail(
          'MULTIFILE_INVALID_OBJECT_GROUPS',
          `${label}[${index}] must contain name, objects, and optionally requiredBehaviors.`
        );
      }
      const name = group.name;
      if (typeof name !== 'string') {
        fail(
          'MULTIFILE_INVALID_OBJECT_GROUPS',
          `${label}[${index}].name must be a string.`
        );
      }
      if (Object.prototype.hasOwnProperty.call(groupsByName, name)) {
        fail(
          'MULTIFILE_INVALID_OBJECT_GROUPS',
          `${label} contains duplicate group ${name}.`
        );
      }
      Object.defineProperty(groupsByName, name, {
        value: compactObjectGroupDescriptors(
          group.objects,
          'name',
          `${label}.${name}.objects`
        ),
        enumerable: true,
        configurable: true,
        writable: true,
      });
      if (Object.prototype.hasOwnProperty.call(group, 'requiredBehaviors')) {
        Object.defineProperty(requiredBehaviorsByGroupName, name, {
          value: compactObjectGroupDescriptors(
            group.requiredBehaviors,
            'type',
            `${label}.${name}.requiredBehaviors`
          ),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
    });
    delete owner[legacyField];
    owner[SOURCE_OBJECT_GROUPS_FIELD] = groupsByName;
    if (Object.keys(requiredBehaviorsByGroupName).length) {
      owner[
        SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD
      ] = requiredBehaviorsByGroupName;
    }
  };

  const rootLegacyField =
    compacted[LEGACY_OWNER_OBJECT_GROUPS_FIELD] !== undefined
      ? LEGACY_OWNER_OBJECT_GROUPS_FIELD
      : compacted[SOURCE_OBJECT_GROUPS_FIELD] !== undefined
      ? SOURCE_OBJECT_GROUPS_FIELD
      : null;
  if (rootLegacyField) {
    compactGroupsOn(compacted, rootLegacyField, rootLegacyField);
  }
  if (Array.isArray(compacted.variants)) {
    compacted.variants.forEach((variant, index) => {
      if (!variant || typeof variant !== 'object' || Array.isArray(variant)) {
        return;
      }
      compactGroupsOn(
        variant,
        LEGACY_OWNER_OBJECT_GROUPS_FIELD,
        `variants[${index}].objectsGroups`
      );
    });
  }
  return compacted;
};

const restoreVariableDefinitionFields = (payload, fileUri) => {
  const restored = clone(payload);
  VARIABLE_DEFINITION_FIELDS.forEach(field => {
    if (restored[field] === undefined) return;
    const variables = asArray(restored[field], field, fileUri);
    const names = new Set();
    variables.forEach((variable, index) => {
      if (
        !variable ||
        typeof variable !== 'object' ||
        Array.isArray(variable)
      ) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field}[${index}] must be a variable descriptor.`,
          fileUri
        );
      }
      const name = variable.name;
      if (typeof name !== 'string' || !name.length) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field}[${index}].name must be a non-empty string.`,
          fileUri
        );
      }
      if (names.has(name)) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field} contains duplicate variable ${name}.`,
          fileUri
        );
      }
      names.add(name);
    });
  });
  return restored;
};

const restoreObjectGroupFields = (payload, fileUri) => {
  const restored = clone(payload);
  const restoreGroupsOn = (owner, legacyField, label) => {
    if (owner[LEGACY_OWNER_OBJECT_GROUPS_FIELD] !== undefined) {
      fail(
        'MULTIFILE_INVALID_OBJECT_GROUPS',
        `${label} uses retired objectsGroups source syntax. Use an objectGroups table.`,
        fileUri
      );
    }
    if (owner[SOURCE_OBJECT_GROUPS_FIELD] === undefined) {
      if (owner[SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD] !== undefined) {
        fail(
          'MULTIFILE_INVALID_OBJECT_GROUPS',
          `${label} cannot define required behaviors without objectGroups.`,
          fileUri
        );
      }
      return;
    }
    const sourceGroups = owner[SOURCE_OBJECT_GROUPS_FIELD];
    if (
      !sourceGroups ||
      typeof sourceGroups !== 'object' ||
      Array.isArray(sourceGroups)
    ) {
      fail(
        'MULTIFILE_INVALID_OBJECT_GROUPS',
        `${label} must be a TOML table keyed by group name.`,
        fileUri
      );
    }
    const groupsByName = sourceGroups;
    const sourceRequiredBehaviors =
      owner[SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD];
    if (
      sourceRequiredBehaviors !== undefined &&
      (!sourceRequiredBehaviors ||
        typeof sourceRequiredBehaviors !== 'object' ||
        Array.isArray(sourceRequiredBehaviors))
    ) {
      fail(
        'MULTIFILE_INVALID_OBJECT_GROUPS',
        `${SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD} must be a TOML table keyed by group name.`,
        fileUri
      );
    }
    const requiredBehaviorsByGroupName = sourceRequiredBehaviors || {};
    Object.keys(requiredBehaviorsByGroupName).forEach(name => {
      if (!Object.prototype.hasOwnProperty.call(groupsByName, name)) {
        fail(
          'MULTIFILE_INVALID_OBJECT_GROUPS',
          `${SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD}.${name} does not match an object group.`,
          fileUri
        );
      }
    });
    const legacyGroups = Object.keys(groupsByName).map(name => {
      const objects = validateObjectGroupStringArray(
        groupsByName[name],
        `${label}.${name}`,
        fileUri
      ).map(objectName => ({ name: objectName }));
      if (
        Object.prototype.hasOwnProperty.call(requiredBehaviorsByGroupName, name)
      ) {
        return {
          name,
          objects,
          requiredBehaviors: validateObjectGroupStringArray(
            requiredBehaviorsByGroupName[name],
            `${SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD}.${name}`,
            fileUri
          ).map(behaviorType => ({ type: behaviorType })),
        };
      }
      return { name, objects };
    });
    delete owner[SOURCE_OBJECT_GROUPS_FIELD];
    delete owner[SOURCE_OBJECT_GROUP_REQUIRED_BEHAVIORS_FIELD];
    owner[legacyField] = legacyGroups;
  };

  restoreGroupsOn(
    restored,
    restored.kind === 'function'
      ? SOURCE_OBJECT_GROUPS_FIELD
      : LEGACY_OWNER_OBJECT_GROUPS_FIELD,
    SOURCE_OBJECT_GROUPS_FIELD
  );
  if (Array.isArray(restored.variants)) {
    restored.variants.forEach((variant, index) => {
      if (!variant || typeof variant !== 'object' || Array.isArray(variant)) {
        return;
      }
      restoreGroupsOn(
        variant,
        LEGACY_OWNER_OBJECT_GROUPS_FIELD,
        `variants[${index}].objectGroups`
      );
    });
  }
  return restored;
};

const projectTomlProjection = payload => {
  const rawJson = {};

  const visit = (value, pointer) => {
    if (value === null) {
      rawJson[pointer] = canonicalJson(value);
      return undefined;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        fail(
          'MULTIFILE_UNREPRESENTABLE_VALUE',
          `Non-finite number at ${pointer || '/'} cannot be stored.`
        );
      }
      if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
        rawJson[pointer] = canonicalJson(value);
        return undefined;
      }
      return value;
    }
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      const kinds = new Set(value.map(scalarKind));
      const compatible = !kinds.has('null') && kinds.size <= 1;
      if (!compatible) {
        rawJson[pointer] = canonicalJson(value);
        return undefined;
      }
      return value.map((item, index) =>
        visit(item, `${pointer}/${quotePointerToken(index)}`)
      );
    }
    if (value && typeof value === 'object') {
      if (value instanceof Date) {
        fail(
          'MULTIFILE_UNREPRESENTABLE_VALUE',
          `TOML dates are forbidden at ${pointer || '/'}.`
        );
      }
      const result = {};
      Object.keys(value).forEach(key => {
        const childPointer = `${pointer}/${quotePointerToken(key)}`;
        const child = visit(value[key], childPointer);
        if (child !== undefined) result[key] = child;
      });
      return result;
    }
    fail(
      'MULTIFILE_UNREPRESENTABLE_VALUE',
      `Unsupported value at ${pointer || '/'}.`
    );
  };

  const projected = visit(payload, '');
  return { projected, rawJson };
};

const projectConstantsTomlPayload = (payload, fileUri) => {
  const { projected, rawJson } = projectTomlProjection(payload);
  const unsupportedPointers = Object.keys(rawJson);
  if (unsupportedPointers.length) {
    const pointer = unsupportedPointers[0] || '/';
    fail(
      'MULTIFILE_UNREPRESENTABLE_VALUE',
      `Constant value at ${pointer} cannot be represented directly in TOML. constants.toml only stores TOML-compatible data.`,
      fileUri
    );
  }
  return projected;
};

const projectTomlPayload = payload => {
  const { projected, rawJson } = projectTomlProjection(
    compactObjectGroupFields(compactVariableDefinitionFields(payload))
  );
  if (Object.prototype.hasOwnProperty.call(projected, 'rawJson')) {
    fail(
      'MULTIFILE_RESERVED_FIELD',
      'The rawJson key is reserved by the multi-file projection.'
    );
  }
  if (Object.keys(rawJson).length) projected.rawJson = rawJson;
  return projected;
};

const setJsonPointer = (root, pointer, value, fileUri) => {
  if (!pointer.startsWith('/')) {
    fail(
      'MULTIFILE_INVALID_RAW_POINTER',
      `Raw JSON pointer must start with /: ${pointer}`,
      fileUri
    );
  }
  const tokens = pointer
    .slice(1)
    .split('/')
    .map(unquotePointerToken);
  let current = root;
  tokens.slice(0, -1).forEach(token => {
    if (!current || typeof current !== 'object') {
      fail(
        'MULTIFILE_INVALID_RAW_POINTER',
        `Raw JSON pointer overlaps a scalar: ${pointer}`,
        fileUri
      );
    }
    if (current[token] === undefined) current[token] = {};
    current = current[token];
  });
  const finalToken = tokens[tokens.length - 1];
  if (Object.prototype.hasOwnProperty.call(current, finalToken)) {
    fail(
      'MULTIFILE_INVALID_RAW_POINTER',
      `Raw JSON pointer overlaps projected data: ${pointer}`,
      fileUri
    );
  }
  current[finalToken] = value;
};

const restoreTomlProjection = (namespace, rawJson, fileUri) => {
  const payload = clone(namespace);
  if (rawJson !== undefined) {
    asObject(rawJson, 'rawJson', fileUri);
    const pointers = Object.keys(rawJson).sort(
      (left, right) => left.split('/').length - right.split('/').length
    );
    pointers.forEach((pointer, index) => {
      if (
        pointers
          .slice(0, index)
          .some(parent =>
            pointer.startsWith(parent.endsWith('/') ? parent : `${parent}/`)
          )
      ) {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Overlapping raw JSON pointer: ${pointer}`,
          fileUri
        );
      }
      const encoded = rawJson[pointer];
      if (typeof encoded !== 'string') {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Raw JSON value must be canonical JSON text: ${pointer}`,
          fileUri
        );
      }
      let value;
      try {
        value = JSON.parse(encoded);
      } catch (error) {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Invalid raw JSON at ${pointer}: ${error.message}`,
          fileUri
        );
      }
      if (canonicalJson(value) !== encoded) {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Raw JSON is not canonical at ${pointer}.`,
          fileUri
        );
      }
      setJsonPointer(payload, pointer, value, fileUri);
    });
  }
  return payload;
};

const restoreTomlPayload = (namespace, fileUri) => {
  const payload = clone(namespace);
  const rawJson = payload.rawJson;
  delete payload.rawJson;
  const restoredPayload = restoreTomlProjection(payload, rawJson, fileUri);
  rejectLegacyFolderStructures(restoredPayload, fileUri);
  return restoreObjectGroupFields(
    restoreVariableDefinitionFields(restoredPayload, fileUri),
    fileUri
  );
};

const normalizeLf = source =>
  source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const ownsVariableDefinitionContainers = fileUri =>
  fileUri !== MULTI_FILE_CONSTANTS_URI && fileUri !== MULTI_FILE_RESOURCES_URI;

const stripTomlStructuralIndentation = source => {
  let inMultilineBasicString = false;
  return source
    .split('\n')
    .map(line => {
      const output = inMultilineBasicString
        ? line
        : line.replace(/^[ \t]+/, '');
      for (let index = 0; index <= output.length - 3; index++) {
        if (output.slice(index, index + 3) !== '"""') continue;
        let backslashCount = 0;
        for (let cursor = index - 1; output[cursor] === '\\'; cursor--)
          backslashCount++;
        if (backslashCount % 2 === 0) {
          inMultilineBasicString = !inMultilineBasicString;
          index += 2;
        }
      }
      return output;
    })
    .join('\n');
};

const stringifyInlineTomlKey = key =>
  /^[A-Za-z0-9_-]+$/.test(key) ? key : stringifyToml.value(String(key));

const stringifyInlineTomlValue = value => {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[ ]';
    return `[ ${value.map(stringifyInlineTomlValue).join(', ')} ]`;
  }
  if (value && typeof value === 'object') {
    const assignments = Object.keys(value).map(
      key =>
        `${stringifyInlineTomlKey(key)} = ${stringifyInlineTomlValue(
          value[key]
        )}`
    );
    return `{ ${assignments.join(', ')}${assignments.length ? ' ' : ''}}`;
  }
  return stringifyToml.value(value);
};

const isPointRecord = value =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  typeof value.x === 'number' &&
  typeof value.y === 'number';

const isInlinePointValue = (key, value) => {
  if (key === 'originPoint' || key === 'centerPoint') {
    return isPointRecord(value);
  }
  if (key === 'points') {
    return Array.isArray(value) && value.every(isPointRecord);
  }
  if (key === 'customCollisionMask') {
    return (
      Array.isArray(value) &&
      value.every(
        polygon => Array.isArray(polygon) && polygon.every(isPointRecord)
      )
    );
  }
  return false;
};

const serializeToml = object => {
  // TOML table nesting is already explicit in dotted headers. Keeping every
  // generated line at column zero avoids presentation-only whitespace churn.
  const serializable = clone(object);
  const inlineValues = new Map();
  let tokenIndex = 0;
  const serializedInput = canonicalJson(serializable);
  const reserveUniqueToken = category => {
    let token;
    do {
      token = `__GDEVELOP_${category}_${tokenIndex++}__`;
    } while (serializedInput.includes(token) || inlineValues.has(token));
    return token;
  };
  const reserveInlineValue = value => {
    const token = reserveUniqueToken('INLINE_TOML');
    inlineValues.set(token, stringifyInlineTomlValue(value));
    return token;
  };
  const reservePointValues = value => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach(reservePointValues);
      return;
    }
    Object.keys(value).forEach(key => {
      if (isInlinePointValue(key, value[key])) {
        value[key] = reserveInlineValue(value[key]);
        return;
      }
      reservePointValues(value[key]);
    });
  };
  VARIABLE_DEFINITION_FIELDS.forEach(field => {
    if (!Array.isArray(serializable[field])) return;
    serializable[field].forEach(variable => {
      if (!variable || typeof variable !== 'object') return;
      Object.keys(variable).forEach(key => {
        const value = variable[key];
        if (value && typeof value === 'object') {
          variable[key] = reserveInlineValue(value);
        }
      });
    });
  });
  reservePointValues(serializable);
  const output = stripTomlStructuralIndentation(
    normalizeLf(stringifyToml(serializable))
  ).trimEnd();
  let expandedOutput = output;
  inlineValues.forEach((inlineValue, token) => {
    expandedOutput = expandedOutput.replace(
      stringifyToml.value(token),
      inlineValue
    );
  });
  return `${expandedOutput.trimEnd()}\n`;
};

export const parseTomlSource = (source, fileUri = '<memory>') => {
  if (typeof source !== 'string') {
    fail('MULTIFILE_INVALID_SOURCE', 'Source must be UTF-8 text.', fileUri);
  }
  if (source.charCodeAt(0) === 0xfeff) {
    fail('MULTIFILE_INVALID_SOURCE', 'UTF-8 BOM is forbidden.', fileUri);
  }
  // Accept text produced by Git and editors on every operating system. The
  // serializer still writes canonical LF-only sources, so accepting CRLF or
  // legacy CR input does not introduce line-ending churn on the next save.
  const normalizedSource = normalizeLf(source);
  if (/^(?:<<<<<<<|=======|>>>>>>>)/m.test(normalizedSource)) {
    fail(
      'MULTIFILE_MERGE_CONFLICT',
      'Git conflict markers are not valid.',
      fileUri
    );
  }
  try {
    const parsed = parseToml(normalizedSource);
    const rejectDates = value => {
      if (value instanceof Date) {
        fail('MULTIFILE_INVALID_SOURCE', 'TOML dates are forbidden.', fileUri);
      }
      if (Array.isArray(value)) value.forEach(rejectDates);
      else if (value && typeof value === 'object')
        Object.keys(value).forEach(key => rejectDates(value[key]));
    };
    rejectDates(parsed);
    if (!ownsVariableDefinitionContainers(fileUri)) return parsed;
    VARIABLE_DEFINITION_FIELDS.forEach(field => {
      if (parsed[field] === undefined) return;
      if (!Array.isArray(parsed[field])) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field} must use repeated [[${field}]] records.`,
          fileUri
        );
      }
      const repeatedTablePattern = new RegExp(
        `^\\[\\[${field}\\]\\](?:\\s*#.*)?$`,
        'm'
      );
      const emptyArrayPattern = new RegExp(
        `^${field}\\s*=\\s*\\[\\s*\\](?:\\s*#.*)?$`,
        'm'
      );
      const nestedTablePattern = new RegExp(`^\\[\\[?${field}\\.`, 'm');
      if (
        (parsed[field].length > 0 &&
          !repeatedTablePattern.test(normalizedSource)) ||
        (parsed[field].length === 0 &&
          !emptyArrayPattern.test(normalizedSource)) ||
        nestedTablePattern.test(normalizedSource)
      ) {
        fail(
          'MULTIFILE_INVALID_VARIABLES',
          `${field} must use repeated [[${field}]] records; use ${field} = [ ] only when it is empty.`,
          fileUri
        );
      }
    });
    return parsed;
  } catch (error) {
    if (error instanceof MultiFileProjectError) throw error;
    fail('MULTIFILE_INVALID_TOML', error.message, fileUri);
  }
};

export const serializeConstantsToToml = constants =>
  serializeToml(
    projectConstantsTomlPayload(
      asObject(constants, 'Constants'),
      MULTI_FILE_CONSTANTS_URI
    )
  );

export const parseConstantsFromToml = source =>
  projectConstantsTomlPayload(
    asObject(
      parseTomlSource(source, MULTI_FILE_CONSTANTS_URI),
      'Constants',
      MULTI_FILE_CONSTANTS_URI
    ),
    MULTI_FILE_CONSTANTS_URI
  );

const encodeUtf8Byte = byte =>
  `%${byte
    .toString(16)
    .toUpperCase()
    .padStart(2, '0')}`;

export const encodeManagedName = displayName => {
  const normalized = String(displayName).normalize('NFC');
  let encoded = '';
  for (const character of normalized) {
    if (/^[A-Za-z0-9_.-]$/.test(character)) encoded += character;
    else {
      const bytes = unescape(encodeURIComponent(character))
        .split('')
        .map(item => item.charCodeAt(0));
      encoded += bytes.map(encodeUtf8Byte).join('');
    }
  }
  encoded = encoded.replace(/\.+$/g, dots => '%2E'.repeat(dots.length));
  if (
    encoded === '.' ||
    encoded === '..' ||
    WINDOWS_DEVICE_NAME.test(encoded)
  ) {
    const first = normalized.charCodeAt(0);
    encoded = `${encodeUtf8Byte(first)}${encoded.slice(1)}`;
  }
  return encoded || '_unnamed';
};

const stableHash8 = value => {
  return sha256(String(value)).slice(0, 8);
};

const uniqueManagedName = (displayName, used) => {
  let encoded = encodeManagedName(displayName);
  const collisionKey = decodeURIComponent(encoded)
    .normalize('NFC')
    .toLowerCase();
  if (used.has(collisionKey)) encoded += `~${stableHash8(String(displayName))}`;
  used.add(
    decodeURIComponent(encoded)
      .normalize('NFC')
      .toLowerCase()
  );
  return encoded;
};

const encodeUriPath = segments =>
  `game://${segments.map(segment => String(segment)).join('/')}`;

export const validateGameUri = uri => {
  if (typeof uri !== 'string' || !uri.startsWith('game://')) {
    fail('MULTIFILE_INVALID_URI', `Managed reference must use game://: ${uri}`);
  }
  const relative = uri.slice('game://'.length);
  if (
    !relative ||
    relative.includes('\\') ||
    relative.includes('?') ||
    relative.includes('#') ||
    /^[A-Za-z]:/.test(relative) ||
    relative.startsWith('/')
  ) {
    fail('MULTIFILE_INVALID_URI', `Invalid game URI: ${uri}`);
  }
  const segments = relative.split('/');
  if (
    segments.some(segment => !segment || segment === '.' || segment === '..')
  ) {
    fail('MULTIFILE_INVALID_URI', `Invalid game URI segment: ${uri}`);
  }
  segments.forEach(segment => {
    if (/%(?![0-9A-F]{2})/.test(segment)) {
      fail('MULTIFILE_INVALID_URI', `Invalid percent encoding: ${uri}`);
    }
    let decoded;
    try {
      decoded = decodeURIComponent(segment);
    } catch (error) {
      fail('MULTIFILE_INVALID_URI', `Invalid UTF-8 path encoding: ${uri}`);
    }
    if (
      decoded.normalize('NFC') !== decoded ||
      decoded === '.' ||
      decoded === '..'
    ) {
      fail('MULTIFILE_INVALID_URI', `Non-canonical game URI: ${uri}`);
    }
    if (
      SIMPLE_URI_SEGMENT.test(decoded) &&
      segment !== decoded &&
      !WINDOWS_DEVICE_NAME.test(decoded) &&
      !decoded.endsWith('.')
    ) {
      fail('MULTIFILE_INVALID_URI', `Unnecessary percent encoding: ${uri}`);
    }
  });
  return segments.map(segment => decodeURIComponent(segment)).join('/');
};

const takeFields = (source, fields) => {
  const output = {};
  fields.forEach(field => {
    if (source[field] !== undefined) output[field] = clone(source[field]);
  });
  return output;
};

const omitFields = (source, fields) => {
  const output = {};
  Object.keys(source).forEach(key => {
    if (!fields.has(key)) output[key] = clone(source[key]);
  });
  return output;
};

const projectSettingsNamespace = document => {
  const output = removeLegacyFolderStructures(clone(document));
  let found = false;
  const visit = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    if (
      typeof value.kind === 'string' &&
      value.settingsFormatVersion === MULTI_FILE_FORMAT_VERSION
    ) {
      if (found) {
        fail(
          'MULTIFILE_INVALID_SCHEMA',
          'A settings fragment must own exactly one component namespace.'
        );
      }
      found = true;
      const projected = projectTomlPayload(value);
      Object.keys(value).forEach(key => delete value[key]);
      Object.assign(value, projected);
      return;
    }
    Object.keys(value).forEach(key => visit(value[key]));
  };
  visit(output);
  if (!found) {
    fail(
      'MULTIFILE_INVALID_SCHEMA',
      'A settings fragment is missing its owned component namespace.'
    );
  }
  return output;
};

const findOwnedSettingsPayload = document => {
  let payload = null;
  const visit = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    if (
      typeof value.kind === 'string' &&
      value.settingsFormatVersion === MULTI_FILE_FORMAT_VERSION
    ) {
      if (payload) {
        fail(
          'MULTIFILE_INVALID_SCHEMA',
          'A settings fragment must own exactly one component namespace.'
        );
      }
      payload = value;
      return;
    }
    Object.keys(value).forEach(key => visit(value[key]));
  };
  visit(document);
  if (!payload) {
    fail(
      'MULTIFILE_INVALID_SCHEMA',
      'A settings fragment is missing its owned component namespace.'
    );
  }
  return payload;
};

const mountSettingsPayload = (path, payload) => {
  const document = {};
  let namespace = document;
  path.forEach((segment, index) => {
    if (index === path.length - 1) namespace[segment] = payload;
    else namespace = namespace[segment] = {};
  });
  return document;
};

const settingsNamespacePathForUri = (uri, payload) => {
  validateGameUri(uri);
  const segments = uri
    .slice('game://'.length)
    .split('/')
    .map(segment => decodeURIComponent(segment));
  const name = String(payload.name || '');
  if (uri === MULTI_FILE_RESOURCES_URI) return ['project', 'resources'];
  if (segments.length === 2 && segments[0] === 'objects')
    return ['project', 'objects', name];
  if (
    segments.length === 3 &&
    segments[0] === 'scenes' &&
    segments[2] === 'scene.settings'
  )
    return ['scenes', name];
  if (
    segments.length === 4 &&
    segments[0] === 'scenes' &&
    segments[2] === 'objects'
  )
    return ['scenes', segments[1], 'objects', name];
  if (
    segments.length === 4 &&
    segments[0] === 'scenes' &&
    segments[2] === 'functions' &&
    segments[3].endsWith('.settings')
  )
    return ['scenes', segments[1], 'functions', name];
  if (
    segments.length === 5 &&
    segments[0] === 'scenes' &&
    segments[2] === 'external-events' &&
    segments[4] === 'external-events.settings'
  )
    return ['scenes', segments[1], 'externalEvents', name];
  if (
    segments.length === 6 &&
    segments[0] === 'scenes' &&
    segments[2] === 'external-events' &&
    segments[4] === 'functions' &&
    segments[5].endsWith('.settings')
  )
    return [
      'scenes',
      segments[1],
      'externalEvents',
      segments[3],
      'functions',
      name,
    ];
  if (
    segments.length === 4 &&
    segments[0] === 'scenes' &&
    segments[2] === 'external-layout' &&
    segments[3].endsWith('.settings')
  )
    return ['scenes', segments[1], 'externalLayouts', name];
  if (
    segments.length === 3 &&
    segments[0] === 'extensions' &&
    segments[2] === 'extension.settings'
  )
    return ['extensions', name];
  if (
    segments.length === 4 &&
    segments[0] === 'extensions' &&
    segments[2] === 'functions' &&
    segments[3].endsWith('.settings')
  )
    return ['extensions', segments[1], 'functions', name];
  if (
    segments.length === 5 &&
    segments[0] === 'extensions' &&
    ((segments[2] === 'prefabs' && segments[4] === 'prefab.settings') ||
      (segments[2] === 'behaviors' && segments[4] === 'behavior.settings'))
  )
    return ['extensions', segments[1], segments[2], name];
  if (
    segments.length === 6 &&
    segments[0] === 'extensions' &&
    segments[2] === 'prefabs' &&
    segments[4] === 'objects'
  )
    return ['extensions', segments[1], 'prefabs', segments[3], 'objects', name];
  if (
    segments.length === 8 &&
    segments[0] === 'extensions' &&
    segments[2] === 'prefabs' &&
    segments[4] === 'variants' &&
    segments[6] === 'objects'
  )
    return [
      'extensions',
      segments[1],
      'prefabs',
      segments[3],
      'variants',
      segments[5],
      'objects',
      name,
    ];
  if (
    segments.length === 7 &&
    segments[0] === 'extensions' &&
    segments[2] === 'prefabs' &&
    segments[4] === 'variants' &&
    segments[6] === 'variant.settings'
  )
    return [
      'extensions',
      segments[1],
      'prefabs',
      segments[3],
      'variants',
      name,
    ];
  if (
    segments.length === 6 &&
    segments[0] === 'extensions' &&
    (segments[2] === 'prefabs' || segments[2] === 'behaviors') &&
    segments[4] === 'functions' &&
    segments[5].endsWith('.settings')
  )
    return [
      'extensions',
      segments[1],
      segments[2],
      segments[3],
      'functions',
      name,
    ];
  fail(
    'MULTIFILE_INVALID_MANIFEST_PATH',
    'Settings file path does not identify a supported component namespace.',
    uri
  );
};

const decompileEmbeddedLayoutSource = (
  format,
  layout,
  fileUri,
  semanticContext = {}
) => {
  const kind = LAYOUT_TOML_KIND_BY_FORMAT[format];
  if (!kind)
    fail(
      'MULTIFILE_INVALID_LAYOUT',
      `Unknown layout format ${format}.`,
      fileUri
    );
  try {
    return decompileEmbeddedLayoutToml(layout, {
      kind,
      fileUri,
      ...semanticContext,
      usedInstanceUuids: new Set(),
    });
  } catch (error) {
    if (error instanceof LayoutTomlError)
      rethrowLayoutTomlError(error, fileUri);
    throw error;
  }
};

const putSettingsFile = (files, uri, namespace, embeddedLayoutSource) => {
  validateGameUri(uri);
  if (files[uri] !== undefined) {
    fail(
      'MULTIFILE_DUPLICATE_SOURCE_PATH',
      'Two project components resolve to the same settings path.',
      uri
    );
  }
  const projectedDocument = projectSettingsNamespace(namespace);
  const payload = findOwnedSettingsPayload(projectedDocument);
  if (uri === MULTI_FILE_ENTRY_URI) {
    const gdevelop = projectedDocument.gdevelop || {};
    files[uri] = serializeToml({ ...gdevelop, ...payload });
    return;
  }
  const settingsSource = serializeToml(payload).trimEnd();
  files[uri] = embeddedLayoutSource
    ? `${settingsSource}\n\n${embeddedLayoutSource.trimEnd()}\n`
    : `${settingsSource}\n`;
};

const putEventsFile = (files, uri, events, eventsDslOptions) => {
  validateGameUri(uri);
  files[uri] = convertLegacyEventsJsonToIfDo(
    JSON.stringify(events || []),
    eventsDslOptions || {}
  );
};

const functionSettingsPayload = (extensionName, functionObject, order) => ({
  kind: 'function',
  settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
  order,
  ...omitFields(functionObject, new Set(['events'])),
  extension: extensionName,
});

const splitOwnerFunctions = ({
  functions,
  folderStructure,
  baseSegments,
  namespaceForFunction,
  files,
  eventsDslOptions,
}) => {
  const foldersByFunctionName = ownedFolderValues(
    folderStructure,
    'functionName'
  );
  (functions || []).forEach((functionObject, order) => {
    const functionName = String(functionObject.name || '');
    const functionFileName = encodeManagedName(functionName);
    const settingsUri = encodeUriPath([
      ...baseSegments,
      `${functionFileName}.settings`,
    ]);
    const eventsUri = encodeUriPath([
      ...baseSegments,
      `${functionFileName}.events`,
    ]);
    putSettingsFile(
      files,
      settingsUri,
      namespaceForFunction(functionName, {
        kind: 'function',
        settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
        order,
        ...omitFields(functionObject, new Set(['events', 'folder'])),
        folder: foldersByFunctionName.get(functionName) || [],
        name: functionName,
      })
    );
    putEventsFile(
      files,
      eventsUri,
      functionObject.events || [],
      eventsDslOptions
    );
  });
};

const lifecycleFunctionSettingsPayload = definition => ({
  kind: 'function',
  settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
  order: definition.order,
  folder: ['Lifecycle'],
  name: definition.name,
  functionType: 'Action',
  lifecycleRole: definition.name,
  fullName: definition.fullName,
  description: definition.description,
  sentence: '',
  private: true,
  async: false,
  parameters: definition.parameters,
  objectGroups: [],
});

const splitSceneLifecycleFunctions = ({
  owner,
  baseSegments,
  namespaceForFunction,
  files,
  eventsDslOptions,
}) => {
  SCENE_LIFECYCLE_FUNCTION_DEFINITIONS.forEach(definition => {
    const events = owner[definition.legacyField] || [];
    if (definition.name !== 'sceneUpdate' && events.length === 0) return;

    const settingsUri = encodeUriPath([
      ...baseSegments,
      'functions',
      `${definition.name}.settings`,
    ]);
    const eventsUri = encodeUriPath([
      ...baseSegments,
      'functions',
      `${definition.name}.events`,
    ]);
    putSettingsFile(
      files,
      settingsUri,
      namespaceForFunction(
        definition.name,
        lifecycleFunctionSettingsPayload(definition)
      )
    );
    putEventsFile(files, eventsUri, events, eventsDslOptions);
  });
};

const ownedFolderValues = (folderStructure, itemNameField) => {
  const foldersByItemName = new Map();
  const visit = (folder, parentFolders) => {
    (folder && Array.isArray(folder.children) ? folder.children : []).forEach(
      child => {
        if (
          child &&
          typeof child.folderName === 'string' &&
          child[itemNameField] === undefined
        ) {
          visit(child, [...parentFolders, child.folderName]);
        } else if (child && typeof child[itemNameField] === 'string') {
          if (!foldersByItemName.has(child[itemNameField])) {
            foldersByItemName.set(child[itemNameField], parentFolders);
          }
        }
      }
    );
  };
  visit(folderStructure, []);
  return foldersByItemName;
};

const splitObjectDefinitions = ({
  objects,
  folderStructure,
  baseSegments,
  namespaceForObject,
  files,
}) => {
  const foldersByObjectName = ownedFolderValues(folderStructure, 'objectName');
  const objectFileNames = new Set();
  (objects || []).forEach((object, order) => {
    const name = String(object.name || '');
    const fileName = uniqueManagedName(name, objectFileNames);
    const uri = encodeUriPath([...baseSegments, `${fileName}.settings`]);
    putSettingsFile(
      files,
      uri,
      namespaceForObject(name, {
        kind: 'object',
        settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
        order,
        ...omitFields(object, new Set(['folder'])),
        folder: foldersByObjectName.get(name) || [],
        name,
      })
    );
  });
};

const splitPrefab = ({
  extensionName,
  prefab,
  order,
  baseSegments,
  files,
  eventsDslOptions,
}) => {
  const prefabName = String(prefab.name || '');
  const prefabSettingsUri = encodeUriPath([...baseSegments, 'prefab.settings']);
  const embeddedLayoutSource = decompileEmbeddedLayoutSource(
    'gdevelop-prefab-layout',
    takeFields(prefab, PREFAB_LAYOUT_FIELDS),
    prefabSettingsUri,
    layoutObjectContext(prefab.objects || [])
  );
  splitObjectDefinitions({
    objects: prefab.objects,
    folderStructure: prefab.objectsFolderStructure,
    baseSegments: [...baseSegments, 'objects'],
    files,
    namespaceForObject: (objectName, payload) => ({
      extensions: {
        [extensionName]: {
          prefabs: {
            [prefabName]: {
              objects: { [objectName]: payload },
            },
          },
        },
      },
    }),
  });
  splitOwnerFunctions({
    functions: prefab.eventsFunctions,
    folderStructure: prefab.eventsFunctionsFolderStructure,
    baseSegments: [...baseSegments, 'functions'],
    namespaceForFunction: (functionName, payload) => ({
      extensions: {
        [extensionName]: {
          prefabs: {
            [prefabName]: {
              functions: { [functionName]: payload },
            },
          },
        },
      },
    }),
    files,
    eventsDslOptions,
  });
  const variantNames = new Set();
  (prefab.variants || []).forEach((variant, variantOrder) => {
    const variantName = String(variant.name || '');
    const variantFileName = uniqueManagedName(variantName, variantNames);
    const variantBaseSegments = [...baseSegments, 'variants', variantFileName];
    const variantSettingsUri = encodeUriPath([
      ...variantBaseSegments,
      'variant.settings',
    ]);
    splitObjectDefinitions({
      objects: variant.objects,
      folderStructure: variant.objectsFolderStructure,
      baseSegments: [...variantBaseSegments, 'objects'],
      files,
      namespaceForObject: (objectName, payload) => ({
        extensions: {
          [extensionName]: {
            prefabs: {
              [prefabName]: {
                variants: {
                  [variantName]: {
                    objects: { [objectName]: payload },
                  },
                },
              },
            },
          },
        },
      }),
    });
    const variantMetadata = omitFields(
      variant,
      new Set([...PREFAB_LAYOUT_FIELDS, 'objects'])
    );
    putSettingsFile(
      files,
      variantSettingsUri,
      {
        extensions: {
          [extensionName]: {
            prefabs: {
              [prefabName]: {
                variants: {
                  [variantName]: {
                    ...variantMetadata,
                    kind: 'prefabVariant',
                    settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
                    order: variantOrder,
                    name: variantName,
                  },
                },
              },
            },
          },
        },
      },
      decompileEmbeddedLayoutSource(
        'gdevelop-prefab-variant-layout',
        takeFields(variant, PREFAB_LAYOUT_FIELDS),
        variantSettingsUri,
        layoutObjectContext(
          variant.objects !== undefined ? variant.objects : prefab.objects || []
        )
      )
    );
  });
  const metadata = omitFields(
    prefab,
    new Set([...PREFAB_LAYOUT_FIELDS, 'objects', 'eventsFunctions', 'variants'])
  );
  return {
    payload: {
      kind: 'prefab',
      settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
      order,
      ...metadata,
      name: prefabName,
    },
    embeddedLayoutSource,
  };
};

const splitBehavior = ({
  extensionName,
  behavior,
  order,
  baseSegments,
  files,
  eventsDslOptions,
}) => {
  const behaviorName = String(behavior.name || '');
  splitOwnerFunctions({
    functions: behavior.eventsFunctions,
    folderStructure: behavior.eventsFunctionsFolderStructure,
    baseSegments: [...baseSegments, 'functions'],
    namespaceForFunction: (functionName, payload) => ({
      extensions: {
        [extensionName]: {
          behaviors: {
            [behaviorName]: {
              functions: { [functionName]: payload },
            },
          },
        },
      },
    }),
    files,
    eventsDslOptions,
  });
  return {
    kind: 'behavior',
    settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
    order,
    ...omitFields(behavior, new Set(['eventsFunctions'])),
    name: behaviorName,
  };
};

const BEHAVIOR_SHARED_DATA_METADATA_FIELDS = new Set([
  'name',
  'type',
  'propertiesQuickCustomizationVisibilities',
  'quickCustomizationVisibility',
]);

const removeEmptyBehaviorSharedData = layout =>
  !Array.isArray(layout.behaviorsSharedData)
    ? layout
    : {
        ...layout,
        behaviorsSharedData: layout.behaviorsSharedData.filter(
          sharedData =>
            !sharedData ||
            typeof sharedData !== 'object' ||
            Array.isArray(sharedData) ||
            Object.keys(sharedData).some(
              field => !BEHAVIOR_SHARED_DATA_METADATA_FIELDS.has(field)
            )
        ),
      };

export const decomposeLegacyProjectToFiles = (legacyProject, options = {}) => {
  const project = clone(asObject(legacyProject, 'Project'));
  const files = {};
  const projectPayload = omitFields(project, PROJECT_SPLIT_FIELDS);
  const sceneNames = new Set();
  const extensionNames = new Set();

  splitObjectDefinitions({
    objects: project.objects,
    folderStructure: project.objectsFolderStructure,
    baseSegments: ['objects'],
    files,
    namespaceForObject: (objectName, payload) => ({
      project: {
        objects: { [objectName]: payload },
      },
    }),
  });

  if (project.resources !== undefined) {
    putSettingsFile(files, MULTI_FILE_RESOURCES_URI, {
      project: {
        resources: {
          kind: 'resources',
          settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
          ...clone(project.resources),
        },
      },
    });
  }

  if (project.constants !== undefined) {
    validateGameUri(MULTI_FILE_CONSTANTS_URI);
    files[MULTI_FILE_CONSTANTS_URI] = serializeConstantsToToml(
      asObject(project.constants, 'Project constants')
    );
  }

  const sceneInfos = (project.layouts || []).map((layout, order) => {
    const name = String(layout.name || '');
    return {
      layout,
      layoutWithoutEmptyBehaviorSharedData: removeEmptyBehaviorSharedData(
        layout
      ),
      name,
      order,
      folderName: uniqueManagedName(name, sceneNames),
    };
  });
  const sceneInfoByName = new Map();
  sceneInfos.forEach(sceneInfo => {
    if (sceneInfoByName.has(sceneInfo.name)) {
      fail(
        'MULTIFILE_DUPLICATE_IDENTITY',
        `Scene settings contain duplicate name ${JSON.stringify(
          sceneInfo.name
        )}.`
      );
    }
    sceneInfoByName.set(sceneInfo.name, sceneInfo);
  });
  const requireExternalSceneInfo = (external, kind) => {
    const associatedLayout = String(external.associatedLayout || '');
    const sceneInfo = sceneInfoByName.get(associatedLayout);
    if (!associatedLayout || !sceneInfo) {
      fail(
        'MULTIFILE_EXTERNAL_SCENE_REQUIRED',
        `${kind} ${JSON.stringify(
          String(external.name || '')
        )} must be associated with an existing scene before saving.`
      );
    }
    return sceneInfo;
  };
  const externalEventNames = new Set();
  const externalEventDisplayNames = new Set();
  (project.externalEvents || []).forEach((external, order) => {
    const name = String(external.name || '');
    if (!name || externalEventDisplayNames.has(name)) {
      fail(
        name ? 'MULTIFILE_DUPLICATE_IDENTITY' : 'MULTIFILE_INVALID_SCHEMA',
        name
          ? `External event settings contain duplicate name ${JSON.stringify(
              name
            )}.`
          : 'External event name must not be empty.'
      );
    }
    externalEventDisplayNames.add(name);
    const sceneInfo = requireExternalSceneInfo(external, 'External event');
    const fileName = uniqueManagedName(name, externalEventNames);
    const externalBaseSegments = [
      'scenes',
      sceneInfo.folderName,
      'external-events',
      fileName,
    ];
    const ownerSettingsUri = encodeUriPath([
      ...externalBaseSegments,
      'external-events.settings',
    ]);
    putSettingsFile(files, ownerSettingsUri, {
      scenes: {
        [sceneInfo.name]: {
          externalEvents: {
            [name]: {
              kind: 'externalEvents',
              settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
              order,
              ...omitFields(
                external,
                new Set([
                  'name',
                  'order',
                  'associatedLayout',
                  'linkedScene',
                  'unresolvedScene',
                  'events',
                  'sceneLoadEvents',
                  'sceneSignalEvents',
                  'sceneUnloadEvents',
                ])
              ),
              name,
            },
          },
        },
      },
    });
    splitSceneLifecycleFunctions({
      owner: external,
      baseSegments: externalBaseSegments,
      namespaceForFunction: (functionName, payload) => ({
        scenes: {
          [sceneInfo.name]: {
            externalEvents: {
              [name]: {
                functions: { [functionName]: payload },
              },
            },
          },
        },
      }),
      files,
      eventsDslOptions: options.eventsDslOptions,
    });
  });
  const externalLayoutNames = new Set();
  const externalLayoutDisplayNames = new Set();
  (project.externalLayouts || []).forEach((external, order) => {
    const name = String(external.name || '');
    if (!name || externalLayoutDisplayNames.has(name)) {
      fail(
        name ? 'MULTIFILE_DUPLICATE_IDENTITY' : 'MULTIFILE_INVALID_SCHEMA',
        name
          ? `External layout settings contain duplicate name ${JSON.stringify(
              name
            )}.`
          : 'External layout name must not be empty.'
      );
    }
    externalLayoutDisplayNames.add(name);
    const sceneInfo = requireExternalSceneInfo(external, 'External layout');
    const fileName = uniqueManagedName(name, externalLayoutNames);
    const ownerSettingsUri = encodeUriPath([
      'scenes',
      sceneInfo.folderName,
      'external-layout',
      `${fileName}.settings`,
    ]);
    const metadata = omitFields(
      external,
      new Set([
        'name',
        'order',
        'associatedLayout',
        'linkedScene',
        'unresolvedScene',
        ...EXTERNAL_LAYOUT_FIELDS,
      ])
    );
    putSettingsFile(
      files,
      ownerSettingsUri,
      {
        scenes: {
          [sceneInfo.name]: {
            externalLayouts: {
              [name]: {
                ...metadata,
                kind: 'externalLayout',
                settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
                order,
                name,
              },
            },
          },
        },
      },
      decompileEmbeddedLayoutSource(
        'gdevelop-external-layout',
        takeFields(external, EXTERNAL_LAYOUT_FIELDS),
        ownerSettingsUri,
        {
          ...layoutObjectContext(
            sceneInfo.layout.objects || [],
            project.objects || []
          ),
          layerNames: (sceneInfo.layout.layers || []).map(layer =>
            String(layer.name || '')
          ),
        }
      )
    );
  });

  sceneInfos.forEach(
    ({
      layout,
      layoutWithoutEmptyBehaviorSharedData,
      name,
      order,
      folderName,
    }) => {
      const settingsUri = encodeUriPath([
        'scenes',
        folderName,
        'scene.settings',
      ]);
      const settingsPayload = omitFields(
        layoutWithoutEmptyBehaviorSharedData,
        new Set([
          ...SCENE_LAYOUT_FIELDS,
          'events',
          'sceneLoadEvents',
          'sceneSignalEvents',
          'sceneUnloadEvents',
          'objects',
          'externalEventFiles',
          'externalLayoutFiles',
        ])
      );
      splitObjectDefinitions({
        objects: layout.objects,
        folderStructure: layout.objectsFolderStructure,
        baseSegments: ['scenes', folderName, 'objects'],
        files,
        namespaceForObject: (objectName, payload) => ({
          scenes: {
            [name]: {
              objects: { [objectName]: payload },
            },
          },
        }),
      });
      putSettingsFile(
        files,
        settingsUri,
        {
          scenes: {
            [name]: {
              kind: 'scene',
              settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
              order,
              ...settingsPayload,
            },
          },
        },
        decompileEmbeddedLayoutSource(
          'gdevelop-scene-layout',
          takeFields(layout, SCENE_LAYOUT_FIELDS),
          settingsUri,
          layoutObjectContext(layout.objects || [], project.objects || [])
        )
      );
      splitSceneLifecycleFunctions({
        owner: layout,
        baseSegments: ['scenes', folderName],
        namespaceForFunction: (functionName, payload) => ({
          scenes: {
            [name]: {
              functions: { [functionName]: payload },
            },
          },
        }),
        files,
        eventsDslOptions: options.eventsDslOptions,
      });
    }
  );

  (project.eventsFunctionsExtensions || []).forEach((extension, order) => {
    const extensionName = String(extension.name || '');
    const extensionFolder = uniqueManagedName(extensionName, extensionNames);
    const extensionBase = ['extensions', extensionFolder];
    const settingsUri = encodeUriPath([...extensionBase, 'extension.settings']);
    const functionNames = new Set();
    const prefabNames = new Set();
    const behaviorNames = new Set();

    (extension.eventsFunctions || []).forEach((functionObject, order) => {
      const name = String(functionObject.name || '');
      const folder = uniqueManagedName(name, functionNames);
      const functionSettingsUri = encodeUriPath([
        ...extensionBase,
        'functions',
        `${folder}.settings`,
      ]);
      const eventsUri = encodeUriPath([
        ...extensionBase,
        'functions',
        `${folder}.events`,
      ]);
      putSettingsFile(files, functionSettingsUri, {
        extensions: {
          [extensionName]: {
            functions: {
              [name]: functionSettingsPayload(
                extensionName,
                functionObject,
                order
              ),
            },
          },
        },
      });
      putEventsFile(
        files,
        eventsUri,
        functionObject.events || [],
        options.eventsDslOptions
      );
    });

    (extension.eventsBasedObjects || []).forEach((prefab, order) => {
      const name = String(prefab.name || '');
      const folder = uniqueManagedName(name, prefabNames);
      const base = [...extensionBase, 'prefabs', folder];
      const prefabSettingsUri = encodeUriPath([...base, 'prefab.settings']);
      const { payload, embeddedLayoutSource } = splitPrefab({
        extensionName,
        prefab,
        order,
        baseSegments: base,
        files,
        eventsDslOptions: options.eventsDslOptions,
      });
      putSettingsFile(
        files,
        prefabSettingsUri,
        {
          extensions: {
            [extensionName]: {
              prefabs: {
                [name]: payload,
              },
            },
          },
        },
        embeddedLayoutSource
      );
    });

    (extension.eventsBasedBehaviors || []).forEach((behavior, order) => {
      const name = String(behavior.name || '');
      const folder = uniqueManagedName(name, behaviorNames);
      const base = [...extensionBase, 'behaviors', folder];
      const behaviorSettingsUri = encodeUriPath([...base, 'behavior.settings']);
      putSettingsFile(files, behaviorSettingsUri, {
        extensions: {
          [extensionName]: {
            behaviors: {
              [name]: splitBehavior({
                extensionName,
                behavior,
                order,
                baseSegments: base,
                files,
                eventsDslOptions: options.eventsDslOptions,
              }),
            },
          },
        },
      });
    });

    const extensionMetadata = omitFields(
      extension,
      new Set(['eventsFunctions', 'eventsBasedObjects', 'eventsBasedBehaviors'])
    );
    putSettingsFile(files, settingsUri, {
      extensions: {
        [extensionName]: {
          kind: 'extension',
          settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
          order,
          ...extensionMetadata,
        },
      },
    });
  });

  const projectNamespace = {
    kind: 'project',
    settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
    ...projectPayload,
    ...(options.migration ? { migration: clone(options.migration) } : {}),
  };
  putSettingsFile(files, MULTI_FILE_ENTRY_URI, {
    gdevelop: {
      combinedSettingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
      eventsDslVersion: IFDO_EVENTS_DSL_COVERAGE.formatVersion,
    },
    project: projectNamespace,
  });

  return files;
};

const parseSettings = (files, uri) => {
  const source = files[uri];
  if (source === undefined) {
    fail('MULTIFILE_MISSING_FILE', 'Referenced settings file is missing.', uri);
  }
  const localDocument = parseTomlSource(source, uri);
  if (uri === MULTI_FILE_ENTRY_URI) {
    if (
      typeof localDocument.kind !== 'string' ||
      localDocument.project !== undefined ||
      localDocument.gdevelop !== undefined
    ) {
      fail(
        'MULTIFILE_INVALID_LOCAL_SETTINGS',
        'project.gdevelop must contain a project payload at the TOML root.',
        uri
      );
    }
    const gdevelop = takeFields(localDocument, [
      'combinedSettingsFormatVersion',
      'eventsDslVersion',
      'entry',
    ]);
    const project = omitFields(
      localDocument,
      new Set(['combinedSettingsFormatVersion', 'eventsDslVersion', 'entry'])
    );
    return { gdevelop, project };
  }
  if (
    typeof localDocument.kind !== 'string' ||
    ['project', 'scenes', 'extensions', 'externals'].some(
      key => localDocument[key] !== undefined
    )
  ) {
    fail(
      'MULTIFILE_INVALID_LOCAL_SETTINGS',
      'Settings files must contain one local component payload at the TOML root.',
      uri
    );
  }
  return mountSettingsPayload(
    settingsNamespacePathForUri(uri, localDocument),
    localDocument
  );
};

const readEmbeddedLayout = (
  files,
  uri,
  expectedFormat,
  semanticContext = {}
) => {
  validateGameUri(uri);
  const source = files[uri];
  if (source === undefined)
    fail('MULTIFILE_MISSING_FILE', 'Layout owner settings are missing.', uri);
  const kind = LAYOUT_TOML_KIND_BY_FORMAT[expectedFormat];
  if (!kind)
    fail(
      'MULTIFILE_INVALID_LAYOUT',
      `Unknown layout format ${expectedFormat}.`,
      uri
    );
  try {
    return compileEmbeddedLayoutToml(source, {
      kind,
      fileUri: uri,
      ...semanticContext,
      usedInstanceUuids: new Set(),
    });
  } catch (error) {
    if (error instanceof LayoutTomlError) rethrowLayoutTomlError(error, uri);
    throw error;
  }
};

const isBehaviorPropertyValueValid = (value, type) => {
  const normalizedType = String(type || '').toLowerCase();
  if (['number', 'float'].includes(normalizedType)) {
    return typeof value === 'number' && Number.isFinite(value);
  }
  if (normalizedType === 'integer') return Number.isInteger(value);
  if (normalizedType === 'boolean') return typeof value === 'boolean';
  return typeof value === 'string';
};

const validateAttachedBehaviorProperties = (
  behaviors,
  behaviorPropertySchemasByType,
  uri,
  objectName
) => {
  if (!behaviorPropertySchemasByType) return;
  (behaviors || []).forEach(behavior => {
    const behaviorType = String(behavior.type || '');
    const schema = behaviorPropertySchemasByType[behaviorType];
    if (!schema) return;
    const properties = schema.properties || [];
    const bySerializedKey = properties.reduce((result, property) => {
      result[property.serializedKey] = property;
      return result;
    }, {});
    const byAuthoringKey = properties.reduce((result, property) => {
      result[property.authoringKey] = property;
      return result;
    }, {});
    Object.keys(behavior).forEach(key => {
      if (ATTACHED_BEHAVIOR_IDENTITY_FIELDS.has(key)) return;
      const property = bySerializedKey[key];
      if (property) {
        if (!isBehaviorPropertyValueValid(behavior[key], property.type)) {
          fail(
            'MULTIFILE_INVALID_BEHAVIOR_PROPERTY',
            `Behavior ${String(
              behavior.name || behaviorType
            )} on ${objectName} property ${key} must be ${property.type}.`,
            uri
          );
        }
        return;
      }
      const authoringProperty = byAuthoringKey[key];
      if (
        authoringProperty &&
        authoringProperty.serializedKey !== authoringProperty.authoringKey
      ) {
        fail(
          'BEHAVIOR_PROPERTY_KEY_MISMATCH',
          `Behavior ${String(
            behavior.name || behaviorType
          )} on ${objectName} uses editor-facing key ${key}; use serialized key ${
            authoringProperty.serializedKey
          }.`,
          uri
        );
      }
      if (schema.unknownPropertyPolicy === 'error') {
        fail(
          'MULTIFILE_UNKNOWN_BEHAVIOR_PROPERTY',
          `Behavior ${String(
            behavior.name || behaviorType
          )} on ${objectName} has unknown serialized property ${key}.`,
          uri
        );
      }
    });
  });
};

const layoutObjectContext = (
  localObjects,
  fallbackObjects = [],
  behaviorPropertySchemasByType
) => {
  const objectsByName = new Map();
  (fallbackObjects || []).forEach(object =>
    objectsByName.set(String(object.name || ''), object)
  );
  (localObjects || []).forEach(object =>
    objectsByName.set(String(object.name || ''), object)
  );
  const behaviorTypesByObject = {};
  objectsByName.forEach((object, objectName) => {
    behaviorTypesByObject[objectName] = (object.behaviors || []).reduce(
      (result, behavior) => {
        result[String(behavior.name || '')] = String(behavior.type || '');
        return result;
      },
      {}
    );
  });
  return {
    objectNames: Array.from(objectsByName.keys()),
    behaviorTypesByObject,
    behaviorPropertySchemasByType,
  };
};

const compileEvents = (files, uri, options) => {
  validateGameUri(uri);
  const source = files[uri];
  if (source === undefined) {
    fail('MULTIFILE_MISSING_FILE', 'Referenced events file is missing.', uri);
  }
  if (/^\s*(?:\[|\{|format\s*=)/.test(source)) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Events files must contain IfDo DSL only.',
      uri
    );
  }
  // Catalog generation needs the project structure and extension metadata,
  // but it cannot compile catalog-authored instructions until that catalog
  // has been generated. Keep validating the file boundary above, then use an
  // empty event list for this bootstrap pass only.
  if (options.skipEventsCompilation) return [];
  try {
    return JSON.parse(
      compileIfDoToLegacyEventsJson(source, options.compileOptions || {})
    );
  } catch (error) {
    if (error instanceof IfDoError) {
      rethrowIfDoError(error, uri);
    }
    throw error;
  }
};

const requireNamespace = (root, path, uri) => {
  let current = root;
  path.forEach(segment => {
    current = asObject(current[segment], path.join('.'), uri);
  });
  return current;
};

const removeFormatFields = payload => {
  const result = clone(payload);
  delete result.kind;
  delete result.settingsFormatVersion;
  return result;
};

const validateManifestIdentity = (entry, payload, uri) => {
  if (
    payload.name !== undefined &&
    String(payload.name) !== String(entry.name)
  ) {
    fail(
      'MULTIFILE_IDENTITY_MISMATCH',
      `Manifest name ${entry.name} does not match content name ${
        payload.name
      }.`,
      uri
    );
  }
};

const assertUniqueManifestNames = (entries, label, uri) => {
  const names = new Set();
  entries.forEach(entry => {
    const name = expectString(entry.name, `${label}.name`, uri);
    if (names.has(name)) {
      fail(
        'MULTIFILE_DUPLICATE_IDENTITY',
        `${label} contains duplicate name ${JSON.stringify(name)}.`,
        uri
      );
    }
    names.add(name);
  });
};

const validateOwnedV5ScenePath = (settingsUri, entry) => {
  const settingsSegments = validateGameUri(settingsUri).split('/');
  if (
    settingsSegments.length !== 3 ||
    settingsSegments[0] !== 'scenes' ||
    settingsSegments[2] !== 'scene.settings'
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Scene ${entry.name} must own scene.settings in its scene folder.`,
      settingsUri
    );
  }
};

const validateExtensionSettingsPath = entry => {
  const segments = validateGameUri(entry.settings).split('/');
  if (
    segments.length !== 3 ||
    segments[0] !== 'extensions' ||
    segments[2] !== 'extension.settings'
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Extension ${entry.name} has an invalid settings path.`
    );
  }
};

const validateChildSettingsPath = (ownerUri, childUri, childKind) => {
  const ownerSegments = validateGameUri(ownerUri).split('/');
  const childSegments = validateGameUri(childUri).split('/');
  const expectedFolder =
    childKind === 'functionFiles'
      ? 'functions'
      : childKind === 'prefabFiles'
      ? 'prefabs'
      : 'behaviors';
  const expectedSettings =
    childKind === 'prefabFiles' ? 'prefab.settings' : 'behavior.settings';
  const functionPathIsValid =
    childKind === 'functionFiles' &&
    childSegments.length === 4 &&
    childSegments[0] === 'extensions' &&
    childSegments[1] === ownerSegments[1] &&
    childSegments[2] === expectedFolder &&
    childSegments[3].endsWith('.settings');
  if (
    !functionPathIsValid &&
    (childSegments.length !== 5 ||
      childSegments[0] !== 'extensions' ||
      childSegments[1] !== ownerSegments[1] ||
      childSegments[2] !== expectedFolder ||
      childSegments[4] !== expectedSettings)
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Child settings must be stored below the owning extension ${expectedFolder} folder.`,
      childUri
    );
  }
};

const readSettingsOrder = (namespace, label, uri) => {
  if (!Number.isInteger(namespace.order) || Number(namespace.order) < 0) {
    fail(
      'MULTIFILE_INVALID_SCHEMA',
      `${label}.order must be a non-negative integer.`,
      uri
    );
  }
  return Number(namespace.order);
};

const assertContiguousSettingsOrder = (documents, label) => {
  documents.forEach(({ entry, uri }, expectedOrder) => {
    if (entry.order !== expectedOrder) {
      fail(
        'MULTIFILE_INVALID_SCHEMA',
        `${label} order must be contiguous from 0; expected ${expectedOrder}.`,
        uri
      );
    }
  });
};

const onlyNamespaceName = (namespace, label, uri) => {
  const names = Object.keys(asObject(namespace, label, uri));
  if (names.length !== 1) {
    fail(
      'MULTIFILE_INVALID_SCHEMA',
      `${label} must contain exactly one component namespace.`,
      uri
    );
  }
  return names[0];
};

const rawGameUriSegments = uri => {
  validateGameUri(uri);
  return uri
    .slice('game://'.length)
    .split('/')
    .map(segment => decodeURIComponent(segment));
};

const readFolderValue = (payload, label, uri) => {
  if (payload.folder === undefined) {
    fail('MULTIFILE_INVALID_SCHEMA', `${label}.folder is required.`, uri);
  }
  const folder = asArray(payload.folder, `${label}.folder`, uri);
  folder.forEach((name, index) => {
    if (typeof name !== 'string' || !name.length) {
      fail(
        'MULTIFILE_INVALID_SCHEMA',
        `${label}.folder[${index}] must be a non-empty string.`,
        uri
      );
    }
  });
  return folder.slice();
};

const mergeMountedSettings = (target, source, uri, path = []) => {
  Object.keys(source).forEach(key => {
    const nextPath = [...path, key];
    if (target[key] === undefined) {
      target[key] = clone(source[key]);
      return;
    }
    if (
      target[key] &&
      source[key] &&
      typeof target[key] === 'object' &&
      typeof source[key] === 'object' &&
      !Array.isArray(target[key]) &&
      !Array.isArray(source[key])
    ) {
      mergeMountedSettings(target[key], source[key], uri, nextPath);
      return;
    }
    fail(
      'MULTIFILE_SETTINGS_MERGE_CONFLICT',
      `Settings namespace ${nextPath.join('.')} is owned more than once.`,
      uri
    );
  });
};

const buildLegacyOwnedFolderStructure = (documents, itemNameField) => {
  const root = { folderName: '__ROOT', children: [] };
  documents.forEach(document => {
    let currentFolder = root;
    document.folder.forEach(folderName => {
      let childFolder = currentFolder.children.find(
        child => child.folderName === folderName
      );
      if (!childFolder) {
        childFolder = { folderName, children: [] };
        currentFolder.children.push(childFolder);
      }
      currentFolder = childFolder;
    });
    currentFolder.children.push({ [itemNameField]: document.entry.name });
  });
  return root;
};

const buildLegacyObjectsFolderStructure = objectDocuments =>
  buildLegacyOwnedFolderStructure(objectDocuments, 'objectName');

const buildLegacyFunctionsFolderStructure = functionDocuments =>
  buildLegacyOwnedFolderStructure(functionDocuments, 'functionName');

const composeOwnerFunctions = (files, functionDocuments, options) =>
  functionDocuments.map(functionDocument => ({
    ...functionDocument.function,
    events: compileEvents(files, functionDocument.eventsUri, options),
  }));

const composePrefab = (
  files,
  namespace,
  options,
  uri,
  objectDocuments = [],
  variantDocuments = [],
  functionDocuments = []
) => {
  const payload = restoreTomlPayload(namespace, uri);
  if (payload.objects !== undefined) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Prefab objects must be stored in physical objects/**/*.settings files.',
      uri
    );
  }
  if (payload.functions !== undefined) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Prefab functions must be stored in physical functions/<Function>.settings files.',
      uri
    );
  }
  const objects = objectDocuments.map(document => document.object);
  const objectContext = layoutObjectContext(
    objects,
    [],
    options.behaviorPropertySchemasByType
  );
  const layout = readEmbeddedLayout(files, uri, 'gdevelop-prefab-layout', {
    ...objectContext,
  });
  Object.keys(layout).forEach(field => {
    if (payload[field] !== undefined) {
      fail(
        'MULTIFILE_OWNERSHIP_CONFLICT',
        `Prefab settings duplicate layout field ${field}.`,
        uri
      );
    }
  });
  const functions = composeOwnerFunctions(files, functionDocuments, options);
  const variants = variantDocuments.map(variantDocument => {
    const entry = variantDocument.payload;
    if (entry.objects !== undefined) {
      fail(
        'MULTIFILE_OWNERSHIP_CONFLICT',
        'Prefab variant objects must be stored in physical objects/**/*.settings files.',
        uri
      );
    }
    const ownedObjectDocuments = variantDocument.objectDocuments || [];
    const variantObjects = ownedObjectDocuments.map(
      document => document.object
    );
    const variantLayout = readEmbeddedLayout(
      files,
      variantDocument.uri,
      'gdevelop-prefab-variant-layout',
      {
        ...layoutObjectContext(
          variantObjects,
          [],
          options.behaviorPropertySchemasByType
        ),
      }
    );
    Object.keys(variantLayout).forEach(field => {
      if (entry[field] !== undefined) {
        fail(
          'MULTIFILE_OWNERSHIP_CONFLICT',
          `Prefab variant settings duplicate layout field ${field}.`,
          uri
        );
      }
    });
    return {
      ...omitFields(removeFormatFields(entry), new Set(['order', 'layout'])),
      objects: variantObjects,
      objectsFolderStructure: buildLegacyObjectsFolderStructure(
        ownedObjectDocuments
      ),
      ...variantLayout,
    };
  });
  const metadata = omitFields(
    removeFormatFields(payload),
    new Set(['order', 'layout', 'functions', 'variants'])
  );
  return {
    ...metadata,
    objects,
    objectsFolderStructure: buildLegacyObjectsFolderStructure(objectDocuments),
    ...layout,
    eventsFunctions: functions,
    eventsFunctionsFolderStructure: buildLegacyFunctionsFolderStructure(
      functionDocuments
    ),
    variants,
  };
};

const composeBehavior = (
  files,
  namespace,
  options,
  uri,
  functionDocuments = []
) => {
  const payload = restoreTomlPayload(namespace, uri);
  if (payload.functions !== undefined) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Behavior functions must be stored as flat functions/<Function>.settings files.',
      uri
    );
  }
  const metadata = omitFields(
    removeFormatFields(payload),
    new Set(['order', 'functions'])
  );
  return {
    ...metadata,
    eventsFunctions: composeOwnerFunctions(files, functionDocuments, options),
    eventsFunctionsFolderStructure: buildLegacyFunctionsFolderStructure(
      functionDocuments
    ),
  };
};

export const composeLegacyProjectFromFiles = (filesInput, options = {}) => {
  const files = { ...filesInput };
  const seenUris = new Set();
  const seenResolvedUris = new Set();
  const registerUri = uri => {
    const resolvedKey = validateGameUri(uri)
      .normalize('NFC')
      .toLowerCase();
    if (seenUris.has(uri)) {
      fail('MULTIFILE_DUPLICATE_PATH', 'Managed URI is referenced twice.', uri);
    }
    if (seenResolvedUris.has(resolvedKey)) {
      fail(
        'MULTIFILE_DUPLICATE_PATH',
        'Managed URIs collide after case/Unicode normalization.',
        uri
      );
    }
    seenUris.add(uri);
    seenResolvedUris.add(resolvedKey);
    return uri;
  };
  const entryDocument = parseSettings(files, MULTI_FILE_ENTRY_URI);
  const gdevelop = asObject(
    entryDocument.gdevelop,
    'gdevelop',
    MULTI_FILE_ENTRY_URI
  );
  const formatVersion = gdevelop.combinedSettingsFormatVersion;
  if (
    formatVersion !== MULTI_FILE_FORMAT_VERSION ||
    gdevelop.eventsDslVersion !== IFDO_EVENTS_DSL_COVERAGE.formatVersion ||
    (gdevelop.entry !== undefined && gdevelop.entry !== MULTI_FILE_ENTRY_URI)
  ) {
    fail(
      'MULTIFILE_UNSUPPORTED_VERSION',
      'Unsupported project.gdevelop format marker.',
      MULTI_FILE_ENTRY_URI
    );
  }
  const projectNamespace = restoreTomlPayload(
    asObject(entryDocument.project, 'project', MULTI_FILE_ENTRY_URI),
    MULTI_FILE_ENTRY_URI
  );
  if (
    projectNamespace.kind !== 'project' ||
    projectNamespace.settingsFormatVersion !== formatVersion
  ) {
    fail(
      'MULTIFILE_UNSUPPORTED_VERSION',
      'Invalid project namespace marker.',
      MULTI_FILE_ENTRY_URI
    );
  }
  if (files[MULTI_FILE_RETIRED_EXTERNAL_SETTINGS_URI] !== undefined) {
    fail(
      'MULTIFILE_RETIRED_EXTERNAL_SETTINGS',
      'external.settings is retired; store External Events and external layouts in independent owner settings below the associated scene.',
      MULTI_FILE_RETIRED_EXTERNAL_SETTINGS_URI
    );
  }
  [
    'sceneFiles',
    'extensionFiles',
    'externalSettings',
    'resources',
    'constants',
  ].forEach(retiredField => {
    if (projectNamespace[retiredField] !== undefined) {
      fail(
        'MULTIFILE_INVALID_LOCAL_SETTINGS',
        `project.gdevelop must not contain retired ${retiredField} ownership.`,
        MULTI_FILE_ENTRY_URI
      );
    }
  });

  const settingsUris = [MULTI_FILE_ENTRY_URI];
  const readObjectDocuments = ({ baseSegments, namespacePath, label }) => {
    const documents = Object.keys(files)
      .filter(candidateUri => {
        const segments = rawGameUriSegments(candidateUri);
        return (
          segments.length === baseSegments.length + 1 &&
          baseSegments.every((segment, index) => segments[index] === segment) &&
          segments[segments.length - 1].endsWith('.settings')
        );
      })
      .map(objectUri => {
        registerUri(objectUri);
        settingsUris.push(objectUri);
        const segments = rawGameUriSegments(objectUri);
        const document = parseSettings(files, objectUri);
        const objectsNamespace = requireNamespace(
          document,
          namespacePath,
          objectUri
        );
        const name = onlyNamespaceName(
          objectsNamespace,
          `${label}.objects`,
          objectUri
        );
        const payload = restoreTomlPayload(objectsNamespace[name], objectUri);
        if (
          payload.kind !== 'object' ||
          payload.settingsFormatVersion !== formatVersion
        ) {
          fail(
            'MULTIFILE_UNSUPPORTED_VERSION',
            'Invalid object namespace marker.',
            objectUri
          );
        }
        const encodedName = encodeManagedName(name);
        const expectedFilenames = [
          `${decodeURIComponent(encodedName)}.settings`,
          `${decodeURIComponent(encodedName)}~${stableHash8(name)}.settings`,
        ];
        if (!expectedFilenames.includes(segments[segments.length - 1])) {
          fail(
            'MULTIFILE_IDENTITY_MISMATCH',
            `Object ${name} must use its canonical managed filename.`,
            objectUri
          );
        }
        const entry = {
          name,
          order: readSettingsOrder(
            payload,
            `${label}.objects.${name}`,
            objectUri
          ),
        };
        validateManifestIdentity(entry, payload, objectUri);
        validateAttachedBehaviorProperties(
          payload.behaviors,
          options.behaviorPropertySchemasByType,
          objectUri,
          name
        );
        return {
          entry,
          uri: objectUri,
          document,
          folder: readFolderValue(
            payload,
            `${label}.objects.${name}`,
            objectUri
          ),
          object: omitFields(
            removeFormatFields(payload),
            new Set(['order', 'folder'])
          ),
        };
      })
      .sort((left, right) => left.entry.order - right.entry.order);
    assertUniqueManifestNames(
      documents.map(({ entry }) => entry),
      `${label} object settings`,
      MULTI_FILE_ENTRY_URI
    );
    assertContiguousSettingsOrder(documents, `${label} object`);
    return documents;
  };
  const readOwnerFunctionDocuments = ({
    baseSegments,
    namespacePath,
    label,
  }) => {
    const documents = Object.keys(files)
      .filter(candidateUri => {
        const segments = rawGameUriSegments(candidateUri);
        return (
          segments.length === baseSegments.length + 1 &&
          baseSegments.every((segment, index) => segments[index] === segment) &&
          segments[segments.length - 1].endsWith('.settings')
        );
      })
      .map(functionUri => {
        registerUri(functionUri);
        settingsUris.push(functionUri);
        const segments = rawGameUriSegments(functionUri);
        const document = parseSettings(files, functionUri);
        const functionsNamespace = requireNamespace(
          document,
          namespacePath,
          functionUri
        );
        const name = onlyNamespaceName(
          functionsNamespace,
          `${label}.functions`,
          functionUri
        );
        const payload = restoreTomlPayload(
          functionsNamespace[name],
          functionUri
        );
        if (
          payload.kind !== 'function' ||
          payload.settingsFormatVersion !== formatVersion
        ) {
          fail(
            'MULTIFILE_UNSUPPORTED_VERSION',
            'Invalid owner function namespace marker.',
            functionUri
          );
        }
        const encodedName = decodeURIComponent(encodeManagedName(name));
        const expectedFilenames = [
          `${encodedName}.settings`,
          `${encodedName}~${stableHash8(name)}.settings`,
        ];
        if (!expectedFilenames.includes(segments[segments.length - 1])) {
          fail(
            'MULTIFILE_IDENTITY_MISMATCH',
            `Function ${name} must use a matching physical settings filename.`,
            functionUri
          );
        }
        const eventsUri = functionUri.replace(/\.settings$/, '.events');
        if (payload.events !== undefined) {
          fail(
            'MULTIFILE_RETIRED_FUNCTION_SOURCE',
            `Function ${name} must derive its same-stem events body and must not store an events URI.`,
            functionUri
          );
        }
        registerUri(eventsUri);
        const entry = {
          name,
          order: readSettingsOrder(
            payload,
            `${label}.functions.${name}`,
            functionUri
          ),
        };
        validateManifestIdentity(entry, payload, functionUri);
        return {
          entry,
          uri: functionUri,
          document,
          eventsUri,
          folder: readFolderValue(
            payload,
            `${label}.functions.${name}`,
            functionUri
          ),
          function: omitFields(
            removeFormatFields(payload),
            new Set(['order', 'folder'])
          ),
        };
      })
      .sort((left, right) => left.entry.order - right.entry.order);
    assertUniqueManifestNames(
      documents.map(({ entry }) => entry),
      `${label} function settings`,
      MULTI_FILE_ENTRY_URI
    );
    assertContiguousSettingsOrder(documents, `${label} function`);
    return documents;
  };
  const readSceneLifecycleFunctionDocuments = ({
    baseSegments,
    namespacePath,
    label,
  }) => {
    if (formatVersion !== MULTI_FILE_FORMAT_VERSION) return new Map();

    const documentsByName = new Map();
    Object.keys(files)
      .filter(candidateUri => {
        const segments = rawGameUriSegments(candidateUri);
        return (
          segments.length === baseSegments.length + 2 &&
          baseSegments.every((segment, index) => segments[index] === segment) &&
          segments[baseSegments.length] === 'functions' &&
          segments[segments.length - 1].endsWith('.settings')
        );
      })
      .forEach(functionUri => {
        registerUri(functionUri);
        settingsUris.push(functionUri);
        const segments = rawGameUriSegments(functionUri);
        const physicalName = segments[segments.length - 1].slice(
          0,
          -'.settings'.length
        );
        const document = parseSettings(files, functionUri);
        const functionsNamespace = requireNamespace(
          document,
          namespacePath,
          functionUri
        );
        const name = onlyNamespaceName(
          functionsNamespace,
          `${label}.functions`,
          functionUri
        );
        if (
          !SCENE_LIFECYCLE_FUNCTION_NAMES.has(name) ||
          physicalName !== name
        ) {
          fail(
            'MULTIFILE_IDENTITY_MISMATCH',
            `Lifecycle function ${name} must use one of the four reserved same-stem settings files.`,
            functionUri
          );
        }
        if (documentsByName.has(name)) {
          fail(
            'MULTIFILE_DUPLICATE_IDENTITY',
            `Lifecycle function ${name} is declared more than once.`,
            functionUri
          );
        }

        const payload = restoreTomlPayload(
          functionsNamespace[name],
          functionUri
        );
        const definition = SCENE_LIFECYCLE_FUNCTION_DEFINITIONS.find(
          candidate => candidate.name === name
        );
        if (!definition) {
          fail(
            'MULTIFILE_INVALID_SCHEMA',
            `Unknown lifecycle function ${name}.`,
            functionUri
          );
        }
        const eventsUri = functionUri.replace(/\.settings$/, '.events');
        const expectedMetadata = lifecycleFunctionSettingsPayload(definition);
        if (payload.events !== undefined) {
          fail(
            'MULTIFILE_RETIRED_FUNCTION_SOURCE',
            `Lifecycle function ${name} must not store an events URI.`,
            functionUri
          );
        }
        if (
          JSON.stringify(canonicalValue(payload)) !==
          JSON.stringify(canonicalValue(expectedMetadata))
        ) {
          fail(
            'MULTIFILE_IDENTITY_MISMATCH',
            `Lifecycle function ${name} metadata or source path does not match its fixed registry definition.`,
            functionUri
          );
        }
        registerUri(eventsUri);
        documentsByName.set(name, {
          name,
          definition,
          uri: functionUri,
          eventsUri,
          document,
        });
      });

    if (!documentsByName.has('sceneUpdate')) {
      fail(
        'MULTIFILE_MISSING_FILE',
        `${label} must contain the required sceneUpdate lifecycle function.`,
        encodeUriPath([...baseSegments, 'functions', 'sceneUpdate.settings'])
      );
    }
    return documentsByName;
  };
  const compileSceneLifecycleBodies = (documentsByName, label) => {
    const legacyBodies = {};
    SCENE_LIFECYCLE_FUNCTION_DEFINITIONS.forEach(definition => {
      const document = documentsByName.get(definition.name);
      if (!document) return;
      const events = compileEvents(files, document.eventsUri, options);
      if (
        definition.name !== 'sceneUpdate' &&
        !options.skipEventsCompilation &&
        events.length === 0
      ) {
        fail(
          'MULTIFILE_INVALID_LOCAL_SETTINGS',
          `${label} must omit an empty optional ${
            definition.name
          } lifecycle function pair.`,
          document.uri
        );
      }
      legacyBodies[definition.legacyField] = events;
    });
    if (legacyBodies.events === undefined) {
      fail(
        'MULTIFILE_MISSING_FILE',
        `${label} has no sceneUpdate events body.`
      );
    }
    return legacyBodies;
  };
  const projectObjectDocuments = readObjectDocuments({
    baseSegments: ['objects'],
    namespacePath: ['project', 'objects'],
    label: 'project',
  });
  let resourcesPayload = null;
  if (files[MULTI_FILE_RESOURCES_URI] !== undefined) {
    if (projectNamespace.resources !== undefined) {
      fail(
        'MULTIFILE_OWNERSHIP_CONFLICT',
        'Resources cannot be stored in both project.gdevelop and resources.settings.',
        MULTI_FILE_RESOURCES_URI
      );
    }
    const uri = registerUri(MULTI_FILE_RESOURCES_URI);
    settingsUris.push(uri);
    resourcesPayload = restoreTomlPayload(
      requireNamespace(
        parseSettings(files, uri),
        ['project', 'resources'],
        uri
      ),
      uri
    );
    if (
      resourcesPayload.kind !== 'resources' ||
      resourcesPayload.settingsFormatVersion !== formatVersion
    ) {
      fail(
        'MULTIFILE_UNSUPPORTED_VERSION',
        'Invalid resources namespace marker.',
        uri
      );
    }
  }
  if (files[MULTI_FILE_CONSTANTS_URI] === undefined) {
    fail(
      'MULTIFILE_MISSING_FILE',
      'The project must contain constants.toml.',
      MULTI_FILE_CONSTANTS_URI
    );
  }
  const constantsUri = registerUri(MULTI_FILE_CONSTANTS_URI);
  const constantsPayload = parseConstantsFromToml(files[constantsUri]);
  let sceneDocuments = Object.keys(files)
    .filter(uri => /^game:\/\/scenes\/[^/]+\/scene\.settings$/.test(uri))
    .map(uri => {
      registerUri(uri);
      settingsUris.push(uri);
      const document = parseSettings(files, uri);
      const scenes = asObject(document.scenes, 'scenes', uri);
      const sceneNames = Object.keys(scenes);
      if (sceneNames.length !== 1) {
        fail(
          'MULTIFILE_INVALID_SCHEMA',
          'scene.settings must contain exactly one scenes.<name> namespace.',
          uri
        );
      }
      const name = sceneNames[0];
      const namespace = restoreTomlPayload(
        requireNamespace(document, ['scenes', name], uri),
        uri
      );
      if (
        namespace.kind !== 'scene' ||
        namespace.settingsFormatVersion !== formatVersion
      ) {
        fail(
          'MULTIFILE_UNSUPPORTED_VERSION',
          'Invalid scene namespace marker.',
          uri
        );
      }
      const entry = {
        name,
        order: readSettingsOrder(namespace, `scenes.${name}`, uri),
      };
      if (
        !namespace.layout ||
        typeof namespace.layout !== 'object' ||
        Array.isArray(namespace.layout) ||
        namespace.events !== undefined ||
        namespace.externalEventFiles !== undefined ||
        namespace.externalLayoutFiles !== undefined
      ) {
        fail(
          'MULTIFILE_INVALID_LOCAL_SETTINGS',
          'Version 5 scene settings must embed layout and must not own retired layout/events/external manifest fields.',
          uri
        );
      }
      validateOwnedV5ScenePath(uri, entry);
      return { entry, uri, document };
    })
    .sort((left, right) => left.entry.order - right.entry.order);
  assertUniqueManifestNames(
    sceneDocuments.map(({ entry }) => entry),
    'scene settings',
    MULTI_FILE_ENTRY_URI
  );
  assertContiguousSettingsOrder(sceneDocuments, 'Scene');
  const externalEventDocuments = [];
  const externalLayoutDocuments = [];
  Object.keys(files)
    .filter(uri =>
      /^game:\/\/scenes\/[^/]+\/external-events\/[^/]+\/external-events\.settings$/.test(
        uri
      )
    )
    .forEach(uri => {
      registerUri(uri);
      settingsUris.push(uri);
      const segments = rawGameUriSegments(uri);
      const owningSceneDocument = sceneDocuments.find(
        sceneDocument =>
          rawGameUriSegments(sceneDocument.uri)[1] === segments[1]
      );
      if (!owningSceneDocument) {
        fail(
          'MULTIFILE_EXTERNAL_SCENE_REQUIRED',
          'External Events settings must be stored below an existing scene.',
          uri
        );
      }
      const sceneName = owningSceneDocument.entry.name;
      const document = parseSettings(files, uri);
      const externalEventsNamespace = requireNamespace(
        document,
        ['scenes', segments[1], 'externalEvents'],
        uri
      );
      const name = onlyNamespaceName(
        externalEventsNamespace,
        `scenes.${sceneName}.externalEvents`,
        uri
      );
      const payload = restoreTomlPayload(externalEventsNamespace[name], uri);
      if (
        payload.kind !== 'externalEvents' ||
        payload.settingsFormatVersion !== formatVersion
      ) {
        fail(
          'MULTIFILE_UNSUPPORTED_VERSION',
          'Invalid External Events namespace marker.',
          uri
        );
      }
      const forbiddenFields = [
        'associatedLayout',
        'linkedScene',
        'unresolvedScene',
        'events',
        'externalEventFiles',
        'functionFiles',
      ];
      if (forbiddenFields.some(field => payload[field] !== undefined)) {
        fail(
          'MULTIFILE_INVALID_LOCAL_SETTINGS',
          'External Events owner settings must derive association and function ownership from its physical path.',
          uri
        );
      }
      const expectedDirectoryNames = [
        decodeURIComponent(encodeManagedName(name)),
        `${decodeURIComponent(encodeManagedName(name))}~${stableHash8(name)}`,
      ];
      if (!expectedDirectoryNames.includes(segments[3])) {
        fail(
          'MULTIFILE_IDENTITY_MISMATCH',
          `External Events ${name} must use its canonical managed owner directory.`,
          uri
        );
      }
      const entry = {
        ...payload,
        name,
        order: readSettingsOrder(
          payload,
          `scenes.${sceneName}.externalEvents.${name}`,
          uri
        ),
      };
      validateManifestIdentity(entry, payload, uri);
      externalEventDocuments.push({
        entry,
        uri,
        sceneName,
        lifecycleFunctionDocuments: readSceneLifecycleFunctionDocuments({
          baseSegments: segments.slice(0, -1),
          namespacePath: [
            'scenes',
            segments[1],
            'externalEvents',
            segments[3],
            'functions',
          ],
          label: `scenes.${sceneName}.externalEvents.${name}`,
        }),
      });
    });

  Object.keys(files)
    .filter(uri =>
      /^game:\/\/scenes\/[^/]+\/external-layout\/[^/]+\.settings$/.test(uri)
    )
    .forEach(uri => {
      registerUri(uri);
      settingsUris.push(uri);
      const segments = rawGameUriSegments(uri);
      const owningSceneDocument = sceneDocuments.find(
        sceneDocument =>
          rawGameUriSegments(sceneDocument.uri)[1] === segments[1]
      );
      if (!owningSceneDocument) {
        fail(
          'MULTIFILE_EXTERNAL_SCENE_REQUIRED',
          'External layout settings must be stored below an existing scene.',
          uri
        );
      }
      const sceneName = owningSceneDocument.entry.name;
      const document = parseSettings(files, uri);
      const externalLayoutsNamespace = requireNamespace(
        document,
        ['scenes', segments[1], 'externalLayouts'],
        uri
      );
      const name = onlyNamespaceName(
        externalLayoutsNamespace,
        `scenes.${sceneName}.externalLayouts`,
        uri
      );
      const payload = restoreTomlPayload(externalLayoutsNamespace[name], uri);
      if (
        payload.kind !== 'externalLayout' ||
        payload.settingsFormatVersion !== formatVersion
      ) {
        fail(
          'MULTIFILE_UNSUPPORTED_VERSION',
          'Invalid external layout namespace marker.',
          uri
        );
      }
      if (
        !payload.layout ||
        typeof payload.layout !== 'object' ||
        Array.isArray(payload.layout) ||
        ['associatedLayout', 'linkedScene', 'unresolvedScene'].some(
          field => payload[field] !== undefined
        )
      ) {
        fail(
          'MULTIFILE_INVALID_LOCAL_SETTINGS',
          'External layout settings must embed layout data and derive scene association from the physical path.',
          uri
        );
      }
      const expectedFileNames = [
        decodeURIComponent(encodeManagedName(name)),
        `${decodeURIComponent(encodeManagedName(name))}~${stableHash8(name)}`,
      ].map(fileName => `${fileName}.settings`);
      if (!expectedFileNames.includes(segments[3])) {
        fail(
          'MULTIFILE_IDENTITY_MISMATCH',
          `External layout ${name} must use its canonical managed settings filename.`,
          uri
        );
      }
      const entry = {
        ...payload,
        name,
        order: readSettingsOrder(
          payload,
          `scenes.${sceneName}.externalLayouts.${name}`,
          uri
        ),
      };
      validateManifestIdentity(entry, payload, uri);
      externalLayoutDocuments.push({ entry, uri, sceneName, document });
    });
  externalEventDocuments.sort(
    (left, right) => left.entry.order - right.entry.order
  );
  externalLayoutDocuments.sort(
    (left, right) => left.entry.order - right.entry.order
  );
  assertUniqueManifestNames(
    externalEventDocuments.map(({ entry }) => entry),
    'external event settings',
    MULTI_FILE_ENTRY_URI
  );
  assertUniqueManifestNames(
    externalLayoutDocuments.map(({ entry }) => entry),
    'external layout settings',
    MULTI_FILE_ENTRY_URI
  );
  assertContiguousSettingsOrder(externalEventDocuments, 'External event');
  assertContiguousSettingsOrder(externalLayoutDocuments, 'External layout');
  sceneDocuments = sceneDocuments.map(sceneDocument => {
    const sceneSegments = rawGameUriSegments(sceneDocument.uri);
    return {
      ...sceneDocument,
      objectDocuments: readObjectDocuments({
        baseSegments: [sceneSegments[0], sceneSegments[1], 'objects'],
        namespacePath: ['scenes', sceneDocument.entry.name, 'objects'],
        label: `scenes.${sceneDocument.entry.name}`,
      }),
      lifecycleFunctionDocuments: readSceneLifecycleFunctionDocuments({
        baseSegments: [sceneSegments[0], sceneSegments[1]],
        namespacePath: ['scenes', sceneSegments[1], 'functions'],
        label: `scenes.${sceneDocument.entry.name}`,
      }),
    };
  });
  const readChildDocuments = ({ entry, uri, namespace }) => {
    const childDocuments = [];
    [
      {
        manifestName: 'functionFiles',
        namespaceName: 'functions',
        folderName: 'functions',
        settingsFilename: null,
        kind: 'function',
      },
      {
        manifestName: 'prefabFiles',
        namespaceName: 'prefabs',
        folderName: 'prefabs',
        settingsFilename: 'prefab.settings',
        kind: 'prefab',
      },
      {
        manifestName: 'behaviorFiles',
        namespaceName: 'behaviors',
        folderName: 'behaviors',
        settingsFilename: 'behavior.settings',
        kind: 'behavior',
      },
    ].forEach(childKind => {
      const legacyChildEntries = asArray(
        namespace[childKind.manifestName],
        childKind.manifestName,
        uri
      );
      if (legacyChildEntries.length) {
        fail(
          'MULTIFILE_INVALID_LOCAL_SETTINGS',
          `${childKind.manifestName} settings indexes are not supported.`,
          uri
        );
      }
      const ownerSegments = validateGameUri(uri).split('/');
      const ownedDocuments = Object.keys(files)
        .filter(candidateUri => {
          const segments = validateGameUri(candidateUri).split('/');
          if (childKind.manifestName === 'functionFiles') {
            return (
              segments.length === 4 &&
              segments[0] === 'extensions' &&
              segments[1] === ownerSegments[1] &&
              segments[2] === childKind.folderName &&
              segments[3].endsWith('.settings')
            );
          }
          return (
            segments.length === 5 &&
            segments[0] === 'extensions' &&
            segments[1] === ownerSegments[1] &&
            segments[2] === childKind.folderName &&
            segments[4] === childKind.settingsFilename
          );
        })
        .map(childUri => {
          registerUri(childUri);
          validateChildSettingsPath(uri, childUri, childKind.manifestName);
          settingsUris.push(childUri);
          const document = parseSettings(files, childUri);
          const ownerNamespace = requireNamespace(
            document,
            ['extensions', entry.name],
            childUri
          );
          const componentNamespace = asObject(
            ownerNamespace[childKind.namespaceName],
            `extensions.${entry.name}.${childKind.namespaceName}`,
            childUri
          );
          const name = onlyNamespaceName(
            componentNamespace,
            `extensions.${entry.name}.${childKind.namespaceName}`,
            childUri
          );
          const payload = restoreTomlPayload(
            componentNamespace[name],
            childUri
          );
          if (
            payload.kind !== childKind.kind ||
            payload.settingsFormatVersion !== formatVersion
          ) {
            fail(
              'MULTIFILE_UNSUPPORTED_VERSION',
              `Invalid ${childKind.kind} namespace marker.`,
              childUri
            );
          }
          return {
            manifestName: childKind.manifestName,
            entry: {
              name,
              order: readSettingsOrder(
                payload,
                `extensions.${entry.name}.${childKind.namespaceName}.${name}`,
                childUri
              ),
            },
            uri: childUri,
            document,
          };
        })
        .sort((left, right) => left.entry.order - right.entry.order);
      assertUniqueManifestNames(
        ownedDocuments.map(({ entry: childEntry }) => childEntry),
        `${entry.name} ${childKind.namespaceName} settings`,
        uri
      );
      assertContiguousSettingsOrder(
        ownedDocuments,
        `${entry.name} ${childKind.namespaceName}`
      );
      childDocuments.push(...ownedDocuments);
    });
    return childDocuments;
  };

  const extensionDocuments = Object.keys(files)
    .filter(uri =>
      /^game:\/\/extensions\/[^/]+\/extension\.settings$/.test(uri)
    )
    .map(uri => {
      registerUri(uri);
      settingsUris.push(uri);
      const document = parseSettings(files, uri);
      const extensions = asObject(document.extensions, 'extensions', uri);
      const name = onlyNamespaceName(extensions, 'extensions', uri);
      const namespace = requireNamespace(document, ['extensions', name], uri);
      const payload = restoreTomlPayload(namespace, uri);
      if (
        payload.kind !== 'extension' ||
        payload.settingsFormatVersion !== formatVersion
      ) {
        fail(
          'MULTIFILE_UNSUPPORTED_VERSION',
          'Invalid extension namespace marker.',
          uri
        );
      }
      const entry = {
        name,
        order: readSettingsOrder(payload, `extensions.${name}`, uri),
      };
      validateExtensionSettingsPath({ ...entry, settings: uri });
      return {
        entry,
        uri,
        document,
        namespace,
        childDocuments: readChildDocuments({ entry, uri, namespace }),
      };
    })
    .sort((left, right) => left.entry.order - right.entry.order);
  assertUniqueManifestNames(
    extensionDocuments.map(({ entry }) => entry),
    'extension settings',
    MULTI_FILE_ENTRY_URI
  );
  assertContiguousSettingsOrder(extensionDocuments, 'Extension');

  extensionDocuments.forEach(extensionDocument => {
    extensionDocument.childDocuments.forEach(childDocument => {
      if (
        childDocument.manifestName !== 'prefabFiles' &&
        childDocument.manifestName !== 'behaviorFiles'
      )
        return;
      const componentSegments = rawGameUriSegments(childDocument.uri).slice(
        0,
        -1
      );
      const componentName = childDocument.entry.name;
      const componentNamespaceName =
        childDocument.manifestName === 'prefabFiles' ? 'prefabs' : 'behaviors';
      const componentLabel = `extensions.${
        extensionDocument.entry.name
      }.${componentNamespaceName}.${componentName}`;
      const readComponentFunctions = () =>
        readOwnerFunctionDocuments({
          baseSegments: [...componentSegments, 'functions'],
          namespacePath: [
            'extensions',
            extensionDocument.entry.name,
            componentNamespaceName,
            componentName,
            'functions',
          ],
          label: componentLabel,
        });
      if (childDocument.manifestName !== 'prefabFiles') {
        childDocument.functionDocuments = readComponentFunctions();
        return;
      }
      childDocument.objectDocuments = readObjectDocuments({
        baseSegments: [...componentSegments, 'objects'],
        namespacePath: [
          'extensions',
          extensionDocument.entry.name,
          'prefabs',
          componentName,
          'objects',
        ],
        label: componentLabel,
      });
      const prefabNamespace = requireNamespace(
        childDocument.document,
        ['extensions', extensionDocument.entry.name, 'prefabs', componentName],
        childDocument.uri
      );
      const prefabPayload = restoreTomlPayload(
        prefabNamespace,
        childDocument.uri
      );
      if (prefabPayload.variants !== undefined) {
        fail(
          'MULTIFILE_MIXED_FORMAT_VERSION',
          'Version 5 prefab settings must not contain a nested variants array.',
          childDocument.uri
        );
      }
      childDocument.variantDocuments = Object.keys(files)
        .filter(candidateUri => {
          const segments = rawGameUriSegments(candidateUri);
          return (
            segments.length === componentSegments.length + 3 &&
            componentSegments.every(
              (segment, index) => segments[index] === segment
            ) &&
            segments[componentSegments.length] === 'variants' &&
            segments[segments.length - 1] === 'variant.settings'
          );
        })
        .map(variantUri => {
          registerUri(variantUri);
          settingsUris.push(variantUri);
          const variantSegments = rawGameUriSegments(variantUri);
          const document = parseSettings(files, variantUri);
          const variantsNamespace = requireNamespace(
            document,
            [
              'extensions',
              componentSegments[1],
              'prefabs',
              componentSegments[3],
              'variants',
            ],
            variantUri
          );
          const name = onlyNamespaceName(
            variantsNamespace,
            `${componentLabel}.variants`,
            variantUri
          );
          const payload = restoreTomlPayload(
            variantsNamespace[name],
            variantUri
          );
          if (
            payload.kind !== 'prefabVariant' ||
            payload.settingsFormatVersion !== formatVersion
          ) {
            fail(
              'MULTIFILE_UNSUPPORTED_VERSION',
              'Invalid prefab variant namespace marker.',
              variantUri
            );
          }
          if (
            !payload.layout ||
            typeof payload.layout !== 'object' ||
            Array.isArray(payload.layout) ||
            payload.objects !== undefined
          ) {
            fail(
              'MULTIFILE_INVALID_LOCAL_SETTINGS',
              'Prefab variant settings must embed layout data and keep object definitions in objects/*.settings.',
              variantUri
            );
          }
          const expectedDirectoryNames = [
            decodeURIComponent(encodeManagedName(name)),
            `${decodeURIComponent(encodeManagedName(name))}~${stableHash8(
              name
            )}`,
          ];
          if (!expectedDirectoryNames.includes(variantSegments[5])) {
            fail(
              'MULTIFILE_IDENTITY_MISMATCH',
              `Prefab variant ${name} must use its canonical managed owner directory.`,
              variantUri
            );
          }
          const entry = {
            name,
            order: readSettingsOrder(
              payload,
              `${componentLabel}.variants.${name}`,
              variantUri
            ),
          };
          validateManifestIdentity(entry, payload, variantUri);
          return {
            entry,
            payload,
            uri: variantUri,
            document,
            objectDocuments: readObjectDocuments({
              baseSegments: variantSegments.slice(0, -1).concat('objects'),
              namespacePath: [
                'extensions',
                componentSegments[1],
                'prefabs',
                componentSegments[3],
                'variants',
                variantSegments[5],
                'objects',
              ],
              label: `${componentLabel}.variants.${name}`,
            }),
          };
        })
        .sort((left, right) => left.entry.order - right.entry.order);
      assertUniqueManifestNames(
        childDocument.variantDocuments.map(({ entry }) => entry),
        `${componentLabel} variant settings`,
        childDocument.uri
      );
      assertContiguousSettingsOrder(
        childDocument.variantDocuments,
        `${componentLabel} variant`
      );
      childDocument.functionDocuments = readComponentFunctions();
    });
  });

  const retiredLayoutUri = Object.keys(files).find(uri =>
    uri.endsWith('.layout')
  );
  if (retiredLayoutUri) {
    fail(
      'MULTIFILE_RETIRED_LAYOUT_SOURCE',
      'Version 5 projects must embed layout data in the owning settings file.',
      retiredLayoutUri
    );
  }
  const retiredFunctionUri = Object.keys(files).find(uri =>
    /\/functions\/(?:[^/]+\/)+function\.settings$/.test(uri)
  );
  if (retiredFunctionUri) {
    fail(
      'MULTIFILE_RETIRED_FUNCTION_SOURCE',
      'Version 5 functions must use a flat same-stem settings/events pair.',
      retiredFunctionUri
    );
  }

  const managedSettingsUriPattern = /^(?:game:\/\/(?:project|resources)\.settings|game:\/\/objects\/(?:[^/]+\/)*[^/]+\.settings|game:\/\/scenes\/[^/]+\/(?:scene\.settings|objects\/(?:[^/]+\/)*[^/]+\.settings|functions\/[^/]+\.settings|external-events\/[^/]+\/(?:external-events\.settings|functions\/[^/]+\.settings)|external-layout\/[^/]+\.settings)|game:\/\/extensions\/[^/]+\/(?:extension\.settings|functions\/[^/]+\.settings|prefabs\/[^/]+\/(?:prefab\.settings|objects\/(?:[^/]+\/)*[^/]+\.settings|functions\/[^/]+\.settings|variants\/[^/]+\/(?:variant\.settings|objects\/(?:[^/]+\/)*[^/]+\.settings))|behaviors\/[^/]+\/(?:behavior\.settings|functions\/[^/]+\.settings)))$/;
  Object.keys(files)
    .filter(uri => managedSettingsUriPattern.test(uri))
    .forEach(uri => {
      if (!settingsUris.includes(uri)) {
        fail(
          'MULTIFILE_ORPHAN_SETTINGS',
          'A discovered settings fragment has no valid owning component.',
          uri
        );
      }
    });
  const orphanFunctionEventsUri = Object.keys(files).find(
    uri =>
      /\/functions\/[^/]+\.events$/.test(uri) &&
      files[uri.replace(/\.events$/, '.settings')] === undefined
  );
  if (orphanFunctionEventsUri) {
    fail(
      'MULTIFILE_ORPHAN_EVENTS',
      'Every managed events body must have a same-stem function settings file.',
      orphanFunctionEventsUri
    );
  }
  const retiredOwnedEventsUri = Object.keys(files).find(
    uri =>
      /^game:\/\/scenes\/[^/]+\/[^/]+\.events$/.test(uri) ||
      /^game:\/\/scenes\/[^/]+\/externals\/[^/]+\.events$/.test(uri)
  );
  if (retiredOwnedEventsUri) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Version 5 projects must not contain retired scene-owned flat events sources outside a functions directory.',
      retiredOwnedEventsUri
    );
  }
  const retiredExternalOwnerUri = Object.keys(files).find(uri =>
    /^game:\/\/scenes\/[^/]+\/externals\/[^/]+\/(?:external-events\.settings|external-layout\.settings|functions\/[^/]+\.(?:settings|events))$/.test(
      uri
    )
  );
  if (retiredExternalOwnerUri) {
    fail(
      'MULTIFILE_RETIRED_EXTERNAL_SOURCE',
      'Version 5 External Events and External Layout sources must use the external-events and external-layout directories.',
      retiredExternalOwnerUri
    );
  }

  // Local documents are mounted by physical path, then merged strictly.
  // Duplicate scalar/array ownership is always an error.
  const combinedSettings = {};
  settingsUris.forEach(uri =>
    mergeMountedSettings(combinedSettings, parseSettings(files, uri), uri)
  );

  const project = omitFields(
    removeFormatFields(projectNamespace),
    new Set(['sceneFiles', 'extensionFiles', 'externalSettings', 'migration'])
  );
  if (project.objects !== undefined) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Global objects must be stored in physical objects/**/*.settings files.',
      MULTI_FILE_ENTRY_URI
    );
  }
  project.objects = projectObjectDocuments.map(document => document.object);
  project.objectsFolderStructure = buildLegacyObjectsFolderStructure(
    projectObjectDocuments
  );
  if (resourcesPayload) {
    project.resources = removeFormatFields(resourcesPayload);
  }
  project.constants = constantsPayload;
  project.layouts = sceneDocuments.map(
    ({ entry, uri, document, objectDocuments, lifecycleFunctionDocuments }) => {
      const namespace = restoreTomlPayload(
        requireNamespace(document, ['scenes', entry.name], uri),
        uri
      );
      validateManifestIdentity(entry, namespace, uri);
      const settings = omitFields(
        removeFormatFields(namespace),
        new Set([
          'order',
          'layout',
          'events',
          'externalEventFiles',
          'externalLayoutFiles',
        ])
      );
      if (settings.objects !== undefined) {
        fail(
          'MULTIFILE_OWNERSHIP_CONFLICT',
          'Scene objects must be stored in physical objects/**/*.settings files.',
          uri
        );
      }
      const objects = objectDocuments.map(
        objectDocument => objectDocument.object
      );
      const layout = readEmbeddedLayout(files, uri, 'gdevelop-scene-layout', {
        ...layoutObjectContext(
          objects,
          project.objects || [],
          options.behaviorPropertySchemasByType
        ),
      });
      Object.keys(layout).forEach(field => {
        if (settings[field] !== undefined) {
          fail(
            'MULTIFILE_OWNERSHIP_CONFLICT',
            `Scene settings duplicate layout field ${field}.`,
            uri
          );
        }
      });
      const lifecycleBodies =
        formatVersion === MULTI_FILE_FORMAT_VERSION
          ? compileSceneLifecycleBodies(
              lifecycleFunctionDocuments,
              `Scene ${entry.name}`
            )
          : {
              events: compileEvents(
                files,
                registerUri(expectString(entry.events, 'scene.events', uri)),
                options
              ),
            };
      return {
        ...settings,
        objects,
        objectsFolderStructure: buildLegacyObjectsFolderStructure(
          objectDocuments
        ),
        ...layout,
        ...lifecycleBodies,
      };
    }
  );

  project.externalEvents = externalEventDocuments.map(
    ({ entry, uri, sourceUri, sceneName, lifecycleFunctionDocuments }) => {
      const metadata =
        formatVersion === MULTI_FILE_FORMAT_VERSION
          ? removeFormatFields(entry)
          : entry;
      const lifecycleBodies =
        formatVersion === MULTI_FILE_FORMAT_VERSION
          ? compileSceneLifecycleBodies(
              lifecycleFunctionDocuments,
              `External Events ${entry.name}`
            )
          : {
              events: compileEvents(
                files,
                registerUri(
                  expectString(sourceUri, 'external events URI', uri)
                ),
                options
              ),
            };
      return {
        ...omitFields(
          metadata,
          new Set(['name', 'order', 'events', 'functions'])
        ),
        name: entry.name,
        associatedLayout: sceneName,
        ...lifecycleBodies,
      };
    }
  );
  project.externalLayouts = externalLayoutDocuments.map(
    ({ entry, uri, sceneName }) => {
      const linkedScene = project.layouts.find(
        layout => layout.name === sceneName
      );
      if (!linkedScene) {
        fail(
          'MULTIFILE_EXTERNAL_SCENE_REQUIRED',
          `External layout ${JSON.stringify(
            entry.name
          )} must be owned by an existing scene.`,
          uri
        );
      }
      return {
        ...omitFields(
          removeFormatFields(entry),
          new Set(['name', 'order', 'layout'])
        ),
        name: entry.name,
        associatedLayout: sceneName,
        ...readEmbeddedLayout(files, uri, 'gdevelop-external-layout', {
          ...layoutObjectContext(
            linkedScene.objects || [],
            project.objects || [],
            options.behaviorPropertySchemasByType
          ),
          layerNames: (linkedScene.layers || []).map(layer =>
            String(layer.name || '')
          ),
        }),
      };
    }
  );

  project.eventsFunctionsExtensions = extensionDocuments.map(extensionInfo => {
    const { entry, uri, namespace, childDocuments } = extensionInfo;
    const extensionPayload = restoreTomlPayload(namespace, uri);
    validateManifestIdentity(entry, extensionPayload, uri);
    const extension = omitFields(
      removeFormatFields(extensionPayload),
      new Set(['order', 'functionFiles', 'prefabFiles', 'behaviorFiles'])
    );
    extension.eventsFunctions = [];
    extension.eventsBasedObjects = [];
    extension.eventsBasedBehaviors = [];
    childDocuments.forEach(child => {
      const childName = child.entry.name;
      if (child.manifestName === 'functionFiles') {
        const payload = restoreTomlPayload(
          requireNamespace(
            child.document,
            ['extensions', entry.name, 'functions', childName],
            child.uri
          ),
          child.uri
        );
        validateManifestIdentity(child.entry, payload, child.uri);
        if (payload.extension !== entry.name) {
          fail(
            'MULTIFILE_IDENTITY_MISMATCH',
            'Function extension owner mismatch.',
            child.uri
          );
        }
        const metadata = omitFields(
          removeFormatFields(payload),
          new Set(['order', 'extension'])
        );
        if (payload.events !== undefined) {
          fail(
            'MULTIFILE_RETIRED_FUNCTION_SOURCE',
            'Function settings must not store an events URI.',
            child.uri
          );
        }
        extension.eventsFunctions.push({
          ...metadata,
          events: compileEvents(
            files,
            registerUri(child.uri.replace(/\.settings$/, '.events')),
            options
          ),
        });
      } else if (child.manifestName === 'prefabFiles') {
        const payload = requireNamespace(
          child.document,
          ['extensions', entry.name, 'prefabs', childName],
          child.uri
        );
        extension.eventsBasedObjects.push(
          composePrefab(
            files,
            payload,
            options,
            child.uri,
            child.objectDocuments,
            child.variantDocuments,
            child.functionDocuments
          )
        );
      } else {
        const payload = requireNamespace(
          child.document,
          ['extensions', entry.name, 'behaviors', childName],
          child.uri
        );
        extension.eventsBasedBehaviors.push(
          composeBehavior(
            files,
            payload,
            options,
            child.uri,
            child.functionDocuments
          )
        );
      }
    });
    return extension;
  });
  return project;
};

const normalizeFunctionEvents = functions =>
  (functions || []).forEach(functionObject => {
    functionObject.events = parseLegacyEventsJson(
      JSON.stringify(functionObject.events || [])
    );
  });

const normalizeLayoutFragment = (layout, editorField, hasLayers = true) => {
  // libGD can serialize an untouched custom-object variant editor settings
  // value as an empty array. Layout TOML has a structured editor settings
  // table and therefore reconstructs the same empty value as an object. Both
  // representations mean that no editor settings are configured.
  if (
    !layout[editorField] ||
    (Array.isArray(layout[editorField]) && !layout[editorField].length)
  ) {
    layout[editorField] = {};
  }
  const editor = layout[editorField];
  if (
    editor.gridR !== undefined ||
    editor.gridG !== undefined ||
    editor.gridB !== undefined
  ) {
    if (editor.gridColor === undefined) {
      const gridR = editor.gridR === undefined ? 158 : editor.gridR;
      const gridG = editor.gridG === undefined ? 180 : editor.gridG;
      const gridB = editor.gridB === undefined ? 255 : editor.gridB;
      editor.gridColor = gridR * 65536 + gridG * 256 + gridB;
    }
    delete editor.gridR;
    delete editor.gridG;
    delete editor.gridB;
  }
  if (
    editor.gridWidth !== undefined ||
    editor.gridHeight !== undefined ||
    editor.gridDepth !== undefined
  ) {
    editor.gridWidth = editor.gridWidth === undefined ? 32 : editor.gridWidth;
    editor.gridHeight =
      editor.gridHeight === undefined ? 32 : editor.gridHeight;
    editor.gridDepth = editor.gridDepth === undefined ? 32 : editor.gridDepth;
  }
  if (
    editor.gridOffsetX !== undefined ||
    editor.gridOffsetY !== undefined ||
    editor.gridOffsetZ !== undefined
  ) {
    editor.gridOffsetX =
      editor.gridOffsetX === undefined ? 0 : editor.gridOffsetX;
    editor.gridOffsetY =
      editor.gridOffsetY === undefined ? 0 : editor.gridOffsetY;
    editor.gridOffsetZ =
      editor.gridOffsetZ === undefined ? 0 : editor.gridOffsetZ;
  }
  layout.instances = (layout.instances || []).map(instance => {
    const normalized = {
      angle: 0,
      zOrder: 0,
      layer: '',
      customSize: false,
      width: 0,
      height: 0,
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
      ...instance,
    };
    if (normalized.z === 0) delete normalized.z;
    if (normalized.rotationX === 0) delete normalized.rotationX;
    if (normalized.rotationY === 0) delete normalized.rotationY;
    if (normalized.opacity === 255) delete normalized.opacity;
    if (normalized.flippedX === false) delete normalized.flippedX;
    if (normalized.flippedY === false) delete normalized.flippedY;
    if (normalized.flippedZ === false) delete normalized.flippedZ;
    if (normalized.locked === false) delete normalized.locked;
    if (normalized.sealed === false) delete normalized.sealed;
    if (normalized.hidden === false) delete normalized.hidden;
    if (normalized.behaviorOverridings) {
      normalized.behaviorOverridings = normalized.behaviorOverridings.map(
        behavior => {
          const normalizedBehavior = { ...behavior };
          if (normalizedBehavior.isFolded === false)
            delete normalizedBehavior.isFolded;
          if (normalizedBehavior.isMuted === false)
            delete normalizedBehavior.isMuted;
          if (normalizedBehavior.isInheritedFromObjectType === false)
            delete normalizedBehavior.isInheritedFromObjectType;
          if (normalizedBehavior.quickCustomizationVisibility === 'default')
            delete normalizedBehavior.quickCustomizationVisibility;
          if (
            normalizedBehavior.propertiesQuickCustomizationVisibilities &&
            !Object.keys(
              normalizedBehavior.propertiesQuickCustomizationVisibilities
            ).length
          )
            delete normalizedBehavior.propertiesQuickCustomizationVisibilities;
          return normalizedBehavior;
        }
      );
    }
    return normalized;
  });
  if (hasLayers) {
    layout.layers = (layout.layers || []).map(layer => {
      const normalizedLayer = {
        renderingType: '',
        cameraType: '',
        defaultCameraBehavior: 'top-left-anchored-if-never-moved',
        visibility: true,
        isLocked: false,
        isLightingLayer: false,
        followBaseLayerCamera: false,
        ambientLightColorR: 200,
        ambientLightColorG: 200,
        ambientLightColorB: 200,
        camera3DNearPlaneDistance: 3,
        camera3DFarPlaneDistance: 10000,
        camera3DFieldOfView: 45,
        camera2DPlaneMaxDrawingDistance: 5000,
        ...layer,
      };
      normalizedLayer.cameras = (layer.cameras || []).map(camera => ({
        defaultSize: true,
        width: 0,
        height: 0,
        defaultViewport: true,
        viewportLeft: 0,
        viewportTop: 0,
        viewportRight: 1,
        viewportBottom: 1,
        ...camera,
      }));
      normalizedLayer.effects = (layer.effects || []).map(effect => ({
        folded: false,
        disabled: false,
        doubleParameters: {},
        stringParameters: {},
        booleanParameters: {},
        ...effect,
      }));
      return normalizedLayer;
    });
  }
};

export const normalizeLegacyProjectForMultiFile = (
  legacyProject,
  options = {}
) => {
  const project = removeLegacyFolderStructuresFromProject(legacyProject);
  project.layouts = (project.layouts || []).map(removeEmptyBehaviorSharedData);
  project.externalEvents = project.externalEvents || [];
  project.externalLayouts = project.externalLayouts || [];
  project.eventsFunctionsExtensions = project.eventsFunctionsExtensions || [];
  project.layouts.forEach(layout => {
    layout.events = parseLegacyEventsJson(JSON.stringify(layout.events || []));
    ['sceneLoadEvents', 'sceneSignalEvents', 'sceneUnloadEvents'].forEach(
      field => {
        if (layout[field] !== undefined) {
          layout[field] = parseLegacyEventsJson(
            JSON.stringify(layout[field] || [])
          );
          if (!layout[field].length) delete layout[field];
        }
      }
    );
    normalizeLayoutFragment(layout, 'uiSettings');
  });
  project.externalLayouts.forEach(external =>
    normalizeLayoutFragment(external, 'editionSettings', false)
  );
  project.externalEvents.forEach(external => {
    external.events = parseLegacyEventsJson(
      JSON.stringify(external.events || [])
    );
    ['sceneLoadEvents', 'sceneSignalEvents', 'sceneUnloadEvents'].forEach(
      field => {
        if (external[field] !== undefined) {
          external[field] = parseLegacyEventsJson(
            JSON.stringify(external[field] || [])
          );
          if (!external[field].length) delete external[field];
        }
      }
    );
  });
  project.eventsFunctionsExtensions.forEach(extension => {
    extension.eventsFunctions = extension.eventsFunctions || [];
    extension.eventsBasedObjects = extension.eventsBasedObjects || [];
    extension.eventsBasedBehaviors = extension.eventsBasedBehaviors || [];
    normalizeFunctionEvents(extension.eventsFunctions);
    extension.eventsBasedObjects.forEach(prefab => {
      prefab.eventsFunctions = prefab.eventsFunctions || [];
      prefab.variants = prefab.variants || [];
      normalizeFunctionEvents(prefab.eventsFunctions);
      normalizeLayoutFragment(prefab, 'editionSettings');
      prefab.variants.forEach(variant =>
        normalizeLayoutFragment(variant, 'editionSettings')
      );
    });
    extension.eventsBasedBehaviors.forEach(behavior => {
      behavior.eventsFunctions = behavior.eventsFunctions || [];
      normalizeFunctionEvents(behavior.eventsFunctions);
    });
  });
  return project;
};

const canonicalValue = value => {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = canonicalValue(value[key]);
        return result;
      }, {});
  }
  return value;
};

const normalizeInstructionParametersForComparison = (
  value,
  ignoredIndices = []
) => {
  value = value.map((parameter, index) =>
    ignoredIndices.includes(index) ? '' : parameter
  );
  let length = value.length;
  while (length > 0 && value[length - 1] === '') length--;
  return length === value.length ? value : value.slice(0, length);
};

const isLegacyInstructionForComparison = value =>
  !!(
    value &&
    typeof value === 'object' &&
    value.type &&
    typeof value.type === 'object' &&
    typeof value.type.value === 'string' &&
    Array.isArray(value.parameters)
  );

const findFirstValueDifference = (
  left,
  right,
  path = '$',
  instructionType = null,
  instructionParameterIndicesToIgnoreByType = {}
) => {
  if (Object.is(left, right)) return null;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return { path, left, right };
    }
    if (instructionType) {
      const ignoredIndices =
        instructionParameterIndicesToIgnoreByType[instructionType] || [];
      left = normalizeInstructionParametersForComparison(left, ignoredIndices);
      right = normalizeInstructionParametersForComparison(
        right,
        ignoredIndices
      );
    }
    if (left.length !== right.length) {
      return {
        path: `${path}.length`,
        left: left.length,
        right: right.length,
      };
    }
    for (let index = 0; index < left.length; index++) {
      const difference = findFirstValueDifference(
        left[index],
        right[index],
        `${path}[${index}]`,
        null,
        instructionParameterIndicesToIgnoreByType
      );
      if (difference) return difference;
    }
    return null;
  }
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const keys = Array.from(
      new Set([...Object.keys(left), ...Object.keys(right)])
    ).sort();
    for (const key of keys) {
      const pathSegment = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
        ? `.${key}`
        : `[${JSON.stringify(key)}]`;
      const difference = findFirstValueDifference(
        left[key],
        right[key],
        `${path}${pathSegment}`,
        key === 'parameters' &&
          isLegacyInstructionForComparison(left) &&
          isLegacyInstructionForComparison(right)
          ? left.type.value
          : null,
        instructionParameterIndicesToIgnoreByType
      );
      if (difference) return difference;
    }
    return null;
  }
  return { path, left, right };
};

const summarizeDifferenceValue = value => {
  if (value === undefined) return 'missing';
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return String(value);
  return serialized.length > 160
    ? `${serialized.slice(0, 157)}...`
    : serialized;
};

export const getLegacyProjectFirstDifferenceDescription = (
  left,
  right,
  options = {}
) => {
  const difference = findFirstValueDifference(
    canonicalValue(normalizeLegacyProjectForMultiFile(left, options)),
    canonicalValue(normalizeLegacyProjectForMultiFile(right, options)),
    '$',
    null,
    options.instructionParameterIndicesToIgnoreByType || {}
  );
  if (!difference) return null;
  if (
    typeof difference.left === 'string' &&
    typeof difference.right === 'string'
  ) {
    let character = 0;
    while (
      character < difference.left.length &&
      character < difference.right.length &&
      difference.left[character] === difference.right[character]
    )
      character++;
    return `${
      difference.path
    }: strings differ at character ${character} (original length ${
      difference.left.length
    }, reconstructed length ${difference.right.length}).`;
  }
  return `${difference.path}: original ${summarizeDifferenceValue(
    difference.left
  )}, reconstructed ${summarizeDifferenceValue(difference.right)}.`;
};

export const areLegacyProjectsEquivalent = (left, right, options = {}) =>
  !getLegacyProjectFirstDifferenceDescription(left, right, options);
