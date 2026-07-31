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
  compileLayoutToml,
  decompileLayoutToml,
} from '../LayoutToml';

export const MULTI_FILE_FORMAT_VERSION = 2;
export const MULTI_FILE_ENTRY_NAME = 'project.gdevelop';
export const MULTI_FILE_ENTRY_URI = 'game://project.gdevelop';
export const MULTI_FILE_RESOURCES_URI = 'game://resources.settings';
export const MULTI_FILE_CONSTANTS_URI = 'game://constants.toml';

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
  if (uri === 'game://externals/external.settings') return ['externals'];
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
    segments.length === 3 &&
    segments[0] === 'extensions' &&
    segments[2] === 'extension.settings'
  )
    return ['extensions', name];
  if (
    segments.length === 5 &&
    segments[0] === 'extensions' &&
    segments[2] === 'functions'
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
      'variantObjects',
      segments[5],
      name,
    ];
  if (
    segments.length === 7 &&
    segments[0] === 'extensions' &&
    (segments[2] === 'prefabs' || segments[2] === 'behaviors') &&
    segments[4] === 'functions' &&
    segments[6] === 'function.settings'
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

const putSettingsFile = (files, uri, namespace) => {
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
  files[uri] = serializeToml(payload);
};

const putLayoutFile = (files, uri, format, layout, semanticContext = {}) => {
  validateGameUri(uri);
  const kind = LAYOUT_TOML_KIND_BY_FORMAT[format];
  if (!kind)
    fail('MULTIFILE_INVALID_LAYOUT', `Unknown layout format ${format}.`, uri);
  try {
    files[uri] = decompileLayoutToml(layout, {
      kind,
      fileUri: uri,
      ...semanticContext,
      usedInstanceUuids: new Set(),
    });
  } catch (error) {
    if (error instanceof LayoutTomlError) {
      rethrowLayoutTomlError(error, uri);
    }
    throw error;
  }
};

const putEventsFile = (files, uri, events, eventsDslOptions) => {
  validateGameUri(uri);
  files[uri] = convertLegacyEventsJsonToIfDo(
    JSON.stringify(events || []),
    eventsDslOptions || {}
  );
};

const functionSettingsPayload = (
  extensionName,
  functionObject,
  eventsUri,
  order
) => ({
  kind: 'function',
  settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
  order,
  ...omitFields(functionObject, new Set(['events'])),
  extension: extensionName,
  events: eventsUri,
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
    const functionSegments = [...baseSegments, functionFileName];
    const settingsUri = encodeUriPath([
      ...functionSegments,
      'function.settings',
    ]);
    const eventsUri = encodeUriPath([
      ...functionSegments,
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
        events: eventsUri,
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
  const layoutUri = encodeUriPath([
    ...baseSegments,
    `${baseSegments[baseSegments.length - 1]}.layout`,
  ]);
  putLayoutFile(
    files,
    layoutUri,
    'gdevelop-prefab-layout',
    takeFields(prefab, PREFAB_LAYOUT_FIELDS),
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
  const variants = (prefab.variants || []).map(variant => {
    const variantName = String(variant.name || '');
    const variantFileName = uniqueManagedName(variantName, variantNames);
    const variantLayoutUri = encodeUriPath([
      ...baseSegments,
      'variants',
      `${variantFileName}.layout`,
    ]);
    putLayoutFile(
      files,
      variantLayoutUri,
      'gdevelop-prefab-variant-layout',
      takeFields(variant, PREFAB_LAYOUT_FIELDS),
      layoutObjectContext(
        variant.objects !== undefined ? variant.objects : prefab.objects || []
      )
    );
    splitObjectDefinitions({
      objects: variant.objects,
      folderStructure: variant.objectsFolderStructure,
      baseSegments: [...baseSegments, 'variants', variantFileName, 'objects'],
      files,
      namespaceForObject: (objectName, payload) => ({
        extensions: {
          [extensionName]: {
            prefabs: {
              [prefabName]: {
                variantObjects: {
                  [variantName]: {
                    [objectName]: payload,
                  },
                },
              },
            },
          },
        },
      }),
    });
    return {
      ...omitFields(variant, new Set([...PREFAB_LAYOUT_FIELDS, 'objects'])),
      layout: variantLayoutUri,
    };
  });
  const metadata = omitFields(
    prefab,
    new Set([...PREFAB_LAYOUT_FIELDS, 'objects', 'eventsFunctions', 'variants'])
  );
  return {
    kind: 'prefab',
    settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
    order,
    ...metadata,
    name: prefabName,
    layout: layoutUri,
    variants,
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

  (project.layouts || []).forEach((layout, order) => {
    const layoutWithoutEmptyBehaviorSharedData = removeEmptyBehaviorSharedData(
      layout
    );
    const name = String(layout.name || '');
    const folderName = uniqueManagedName(name, sceneNames);
    const settingsUri = encodeUriPath(['scenes', folderName, 'scene.settings']);
    const layoutUri = encodeUriPath([
      'scenes',
      folderName,
      `${folderName}.layout`,
    ]);
    const eventsUri = encodeUriPath([
      'scenes',
      folderName,
      `${folderName}.events`,
    ]);
    const settingsPayload = omitFields(
      layoutWithoutEmptyBehaviorSharedData,
      new Set([...SCENE_LAYOUT_FIELDS, 'events', 'objects'])
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
    putSettingsFile(files, settingsUri, {
      scenes: {
        [name]: {
          kind: 'scene',
          settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
          order,
          layout: layoutUri,
          events: eventsUri,
          ...settingsPayload,
        },
      },
    });
    putLayoutFile(
      files,
      layoutUri,
      'gdevelop-scene-layout',
      takeFields(layout, SCENE_LAYOUT_FIELDS),
      layoutObjectContext(layout.objects || [], project.objects || [])
    );
    putEventsFile(
      files,
      eventsUri,
      layout.events || [],
      options.eventsDslOptions
    );
  });

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
      const base = [...extensionBase, 'functions', folder];
      const functionSettingsUri = encodeUriPath([...base, 'function.settings']);
      const eventsUri = encodeUriPath([...base, `${folder}.events`]);
      putSettingsFile(files, functionSettingsUri, {
        extensions: {
          [extensionName]: {
            functions: {
              [name]: functionSettingsPayload(
                extensionName,
                functionObject,
                eventsUri,
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
      putSettingsFile(files, prefabSettingsUri, {
        extensions: {
          [extensionName]: {
            prefabs: {
              [name]: splitPrefab({
                extensionName,
                prefab,
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

  if (
    (project.externalEvents || []).length ||
    (project.externalLayouts || []).length
  ) {
    const externalSettings = 'game://externals/external.settings';
    const eventFiles = [];
    const layoutFiles = [];
    const eventNames = new Set();
    const layoutNames = new Set();
    (project.externalEvents || []).forEach(external => {
      const name = String(external.name || '');
      const fileName = uniqueManagedName(name, eventNames);
      const eventsUri = encodeUriPath(['externals', `${fileName}.events`]);
      eventFiles.push({
        ...omitFields(
          external,
          new Set(['name', 'associatedLayout', 'events'])
        ),
        name,
        linkedScene: String(external.associatedLayout || ''),
        events: eventsUri,
      });
      putEventsFile(
        files,
        eventsUri,
        external.events || [],
        options.eventsDslOptions
      );
    });
    (project.externalLayouts || []).forEach(external => {
      const name = String(external.name || '');
      const fileName = uniqueManagedName(name, layoutNames);
      const layoutUri = encodeUriPath(['externals', `${fileName}.layout`]);
      const linkedScene = (project.layouts || []).find(
        layout =>
          String(layout.name || '') === String(external.associatedLayout || '')
      );
      layoutFiles.push({
        ...omitFields(
          external,
          new Set(['name', 'associatedLayout', ...EXTERNAL_LAYOUT_FIELDS])
        ),
        name,
        linkedScene: String(external.associatedLayout || ''),
        ...(!linkedScene ? { unresolvedScene: true } : {}),
        layout: layoutUri,
      });
      putLayoutFile(
        files,
        layoutUri,
        'gdevelop-external-layout',
        takeFields(external, EXTERNAL_LAYOUT_FIELDS),
        linkedScene
          ? {
              ...layoutObjectContext(
                linkedScene.objects || [],
                project.objects || []
              ),
              layerNames: (linkedScene.layers || []).map(layer =>
                String(layer.name || '')
              ),
            }
          : {}
      );
    });
    putSettingsFile(files, externalSettings, {
      externals: {
        kind: 'externals',
        settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
        eventFiles,
        layoutFiles,
      },
    });
  }

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

const readLayout = (files, uri, expectedFormat, semanticContext = {}) => {
  validateGameUri(uri);
  const source = files[uri];
  if (source === undefined)
    fail('MULTIFILE_MISSING_FILE', 'Referenced layout file is missing.', uri);
  const kind = LAYOUT_TOML_KIND_BY_FORMAT[expectedFormat];
  if (!kind)
    fail(
      'MULTIFILE_INVALID_LAYOUT',
      `Unknown layout format ${expectedFormat}.`,
      uri
    );
  try {
    return compileLayoutToml(source, {
      kind,
      fileUri: uri,
      ...semanticContext,
      usedInstanceUuids: new Set(),
    });
  } catch (error) {
    if (error instanceof LayoutTomlError) {
      rethrowLayoutTomlError(error, uri);
    }
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

const validateSceneManifestPaths = entry => {
  const settingsPath = validateGameUri(entry.settings);
  const layoutPath = validateGameUri(entry.layout);
  const eventsPath = validateGameUri(entry.events);
  const settingsSegments = settingsPath.split('/');
  const folder = settingsSegments[1];
  if (
    settingsSegments.length !== 3 ||
    settingsSegments[0] !== 'scenes' ||
    settingsSegments[2] !== 'scene.settings' ||
    layoutPath !== `scenes/${folder}/${folder}.layout` ||
    eventsPath !== `scenes/${folder}/${folder}.events`
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Scene ${
        entry.name
      } must reference one settings/layout/events trio in its scene folder.`
    );
  }
};

const validateOwnedScenePaths = (settingsUri, entry) => {
  const settingsPath = validateGameUri(settingsUri);
  const layoutPath = validateGameUri(entry.layout);
  const eventsPath = validateGameUri(entry.events);
  const settingsSegments = settingsPath.split('/');
  const folder = settingsSegments[1];
  if (
    settingsSegments.length !== 3 ||
    settingsSegments[0] !== 'scenes' ||
    settingsSegments[2] !== 'scene.settings' ||
    layoutPath !== `scenes/${folder}/${folder}.layout` ||
    eventsPath !== `scenes/${folder}/${folder}.events`
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Scene ${
        entry.name
      } must own one layout/events pair in its scene folder.`,
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
    childKind === 'functionFiles'
      ? 'function.settings'
      : childKind === 'prefabFiles'
      ? 'prefab.settings'
      : 'behavior.settings';
  if (
    childSegments.length !== 5 ||
    childSegments[0] !== 'extensions' ||
    childSegments[1] !== ownerSegments[1] ||
    childSegments[2] !== expectedFolder ||
    childSegments[4] !== expectedSettings
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Child settings must be stored below the owning extension ${expectedFolder} folder.`,
      childUri
    );
  }
};

const validateExternalSourceUri = (uri, extension) => {
  const segments = validateGameUri(uri).split('/');
  if (
    segments.length !== 2 ||
    segments[0] !== 'externals' ||
    !segments[1].endsWith(extension)
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `External ${extension} source must be stored directly in externals/.`,
      uri
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
  variantObjectDocuments = {},
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
      'Prefab functions must be stored in physical functions/**/<Function>/function.settings files.',
      uri
    );
  }
  const objects = objectDocuments.map(document => document.object);
  const layoutUri = expectString(payload.layout, 'prefab.layout', uri);
  const objectContext = layoutObjectContext(
    objects,
    [],
    options.behaviorPropertySchemasByType
  );
  const layout = readLayout(files, layoutUri, 'gdevelop-prefab-layout', {
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
  const variants = asArray(payload.variants, 'prefab.variants', uri).map(
    entry => {
      if (entry.objects !== undefined) {
        fail(
          'MULTIFILE_OWNERSHIP_CONFLICT',
          'Prefab variant objects must be stored in physical objects/**/*.settings files.',
          uri
        );
      }
      const ownedObjectDocuments = variantObjectDocuments[entry.name] || [];
      const variantObjects = ownedObjectDocuments.map(
        document => document.object
      );
      const variantLayout = readLayout(
        files,
        expectString(entry.layout, 'variant.layout', uri),
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
        ...omitFields(entry, new Set(['layout'])),
        objects: variantObjects,
        objectsFolderStructure: buildLegacyObjectsFolderStructure(
          ownedObjectDocuments
        ),
        ...variantLayout,
      };
    }
  );
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
      'Behavior functions must be stored in physical functions/**/<Function>/function.settings files.',
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
  if (
    gdevelop.combinedSettingsFormatVersion !== MULTI_FILE_FORMAT_VERSION ||
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
    projectNamespace.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
  ) {
    fail(
      'MULTIFILE_UNSUPPORTED_VERSION',
      'Invalid project namespace marker.',
      MULTI_FILE_ENTRY_URI
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
          payload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
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
          segments.length === baseSegments.length + 2 &&
          baseSegments.every((segment, index) => segments[index] === segment) &&
          segments[segments.length - 1] === 'function.settings'
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
          payload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
        ) {
          fail(
            'MULTIFILE_UNSUPPORTED_VERSION',
            'Invalid owner function namespace marker.',
            functionUri
          );
        }
        const expectedFolderName = decodeURIComponent(encodeManagedName(name));
        if (segments[segments.length - 2] !== expectedFolderName) {
          fail(
            'MULTIFILE_IDENTITY_MISMATCH',
            `Function ${name} must use a matching physical function folder.`,
            functionUri
          );
        }
        const expectedEventsUri = `${functionUri.slice(
          0,
          -'function.settings'.length
        )}${encodeManagedName(name)}.events`;
        const eventsUri = expectString(
          payload.events,
          `${label}.functions.${name}.events`,
          functionUri
        );
        if (eventsUri !== expectedEventsUri) {
          fail(
            'MULTIFILE_INVALID_MANIFEST_PATH',
            `Function ${name} events must be its sibling ${encodeManagedName(
              name
            )}.events file.`,
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
            new Set(['order', 'events', 'folder'])
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
      resourcesPayload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
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
  let externalDocument = null;
  const externalSettingsUri = 'game://externals/external.settings';
  if (
    projectNamespace.externalSettings !== undefined &&
    projectNamespace.externalSettings !== externalSettingsUri
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      'externalSettings must be game://externals/external.settings.'
    );
  }
  if (files[externalSettingsUri] !== undefined) {
    const uri = registerUri(externalSettingsUri);
    settingsUris.push(uri);
    externalDocument = parseSettings(files, uri);
  } else if (projectNamespace.externalSettings !== undefined) {
    parseSettings(files, externalSettingsUri);
  }
  const legacySceneEntries = asArray(
    projectNamespace.sceneFiles,
    'project.sceneFiles'
  );
  let sceneDocuments;
  if (legacySceneEntries.length) {
    assertUniqueManifestNames(
      legacySceneEntries,
      'project.sceneFiles',
      MULTI_FILE_ENTRY_URI
    );
    sceneDocuments = legacySceneEntries.map((entry, order) => {
      validateSceneManifestPaths(entry);
      const uri = registerUri(expectString(entry.settings, 'scene.settings'));
      settingsUris.push(uri);
      return {
        entry: { ...entry, order },
        uri,
        document: parseSettings(files, uri),
      };
    });
  } else {
    sceneDocuments = Object.keys(files)
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
          namespace.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
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
          layout: expectString(namespace.layout, 'scene.layout', uri),
          events: expectString(namespace.events, 'scene.events', uri),
        };
        validateOwnedScenePaths(uri, entry);
        return { entry, uri, document };
      })
      .sort((left, right) => left.entry.order - right.entry.order);
    assertUniqueManifestNames(
      sceneDocuments.map(({ entry }) => entry),
      'scene settings',
      MULTI_FILE_ENTRY_URI
    );
    assertContiguousSettingsOrder(sceneDocuments, 'Scene');
  }
  sceneDocuments = sceneDocuments.map(sceneDocument => {
    const sceneSegments = rawGameUriSegments(sceneDocument.uri);
    return {
      ...sceneDocument,
      objectDocuments: readObjectDocuments({
        baseSegments: [sceneSegments[0], sceneSegments[1], 'objects'],
        namespacePath: ['scenes', sceneDocument.entry.name, 'objects'],
        label: `scenes.${sceneDocument.entry.name}`,
      }),
    };
  });
  const legacyExtensionEntries = asArray(
    projectNamespace.extensionFiles,
    'project.extensionFiles'
  );
  const readChildDocuments = ({ entry, uri, namespace }) => {
    const childDocuments = [];
    [
      {
        manifestName: 'functionFiles',
        namespaceName: 'functions',
        folderName: 'functions',
        settingsFilename: 'function.settings',
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
      let ownedDocuments;
      if (legacyChildEntries.length) {
        assertUniqueManifestNames(
          legacyChildEntries,
          childKind.manifestName,
          uri
        );
        ownedDocuments = legacyChildEntries.map((childEntry, order) => {
          const childUri = registerUri(
            expectString(
              childEntry.settings,
              `${childKind.manifestName}.settings`
            )
          );
          validateChildSettingsPath(uri, childUri, childKind.manifestName);
          settingsUris.push(childUri);
          return {
            manifestName: childKind.manifestName,
            entry: { ...childEntry, order },
            uri: childUri,
            document: parseSettings(files, childUri),
          };
        });
      } else {
        const ownerSegments = validateGameUri(uri).split('/');
        ownedDocuments = Object.keys(files)
          .filter(candidateUri => {
            const segments = validateGameUri(candidateUri).split('/');
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
              payload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
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
      }
      childDocuments.push(...ownedDocuments);
    });
    return childDocuments;
  };

  let extensionDocuments;
  if (legacyExtensionEntries.length) {
    assertUniqueManifestNames(
      legacyExtensionEntries,
      'project.extensionFiles',
      MULTI_FILE_ENTRY_URI
    );
    extensionDocuments = legacyExtensionEntries.map((entry, order) => {
      validateExtensionSettingsPath(entry);
      const uri = registerUri(
        expectString(entry.settings, 'extension.settings')
      );
      settingsUris.push(uri);
      const document = parseSettings(files, uri);
      const namespace = requireNamespace(
        document,
        ['extensions', entry.name],
        uri
      );
      return {
        entry: { ...entry, order },
        uri,
        document,
        namespace,
        childDocuments: readChildDocuments({ entry, uri, namespace }),
      };
    });
  } else {
    extensionDocuments = Object.keys(files)
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
          payload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
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
  }

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
      childDocument.variantObjectDocuments = {};
      asArray(
        prefabPayload.variants,
        'prefab.variants',
        childDocument.uri
      ).forEach(variant => {
        const variantName = expectString(
          variant.name,
          'prefab variant name',
          childDocument.uri
        );
        const layoutSegments = rawGameUriSegments(
          expectString(
            variant.layout,
            'prefab variant layout',
            childDocument.uri
          )
        );
        const layoutFilename = layoutSegments[layoutSegments.length - 1];
        if (!layoutFilename.endsWith('.layout')) {
          fail(
            'MULTIFILE_INVALID_MANIFEST_PATH',
            'Prefab variant layout must use a .layout file.',
            childDocument.uri
          );
        }
        const variantFolder = layoutFilename.slice(0, -'.layout'.length);
        childDocument.variantObjectDocuments[variantName] = readObjectDocuments(
          {
            baseSegments: [
              ...componentSegments,
              'variants',
              variantFolder,
              'objects',
            ],
            namespacePath: [
              'extensions',
              extensionDocument.entry.name,
              'prefabs',
              componentName,
              'variantObjects',
              variantName,
            ],
            label: `extensions.${
              extensionDocument.entry.name
            }.prefabs.${componentName}.variantObjects.${variantName}`,
          }
        );
      });
      childDocument.functionDocuments = readComponentFunctions();
    });
  });

  const managedSettingsUriPattern = /^(?:game:\/\/(?:project|resources)\.settings|game:\/\/objects\/(?:[^/]+\/)*[^/]+\.settings|game:\/\/externals\/external\.settings|game:\/\/scenes\/[^/]+\/(?:scene\.settings|objects\/(?:[^/]+\/)*[^/]+\.settings)|game:\/\/extensions\/[^/]+\/(?:extension\.settings|functions\/[^/]+\/function\.settings|prefabs\/[^/]+\/(?:prefab\.settings|objects\/(?:[^/]+\/)*[^/]+\.settings|functions\/(?:[^/]+\/)*[^/]+\/function\.settings|variants\/[^/]+\/objects\/(?:[^/]+\/)*[^/]+\.settings)|behaviors\/[^/]+\/(?:behavior\.settings|functions\/(?:[^/]+\/)*[^/]+\/function\.settings)))$/;
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
    ({ entry, uri, document, objectDocuments }) => {
      const namespace = restoreTomlPayload(
        requireNamespace(document, ['scenes', entry.name], uri),
        uri
      );
      validateManifestIdentity(entry, namespace, uri);
      const settings = omitFields(
        removeFormatFields(namespace),
        new Set(['order', 'layout', 'events'])
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
      const layoutUri = registerUri(
        expectString(entry.layout, 'scene.layout', uri)
      );
      const eventsUri = registerUri(
        expectString(entry.events, 'scene.events', uri)
      );
      const layout = readLayout(files, layoutUri, 'gdevelop-scene-layout', {
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
      return {
        ...settings,
        objects,
        objectsFolderStructure: buildLegacyObjectsFolderStructure(
          objectDocuments
        ),
        ...layout,
        events: compileEvents(files, eventsUri, options),
      };
    }
  );

  project.externalEvents = [];
  project.externalLayouts = [];
  if (externalDocument) {
    const uri = externalSettingsUri;
    const namespace = restoreTomlPayload(
      asObject(externalDocument.externals, 'externals', uri),
      uri
    );
    if (
      namespace.kind !== 'externals' ||
      namespace.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
    ) {
      fail('MULTIFILE_UNSUPPORTED_VERSION', 'Invalid externals marker.', uri);
    }
    project.externalEvents = asArray(
      namespace.eventFiles,
      'externals.eventFiles',
      uri
    );
    assertUniqueManifestNames(
      project.externalEvents,
      'externals.eventFiles',
      uri
    );
    project.externalEvents = project.externalEvents.map(entry => {
      validateExternalSourceUri(entry.events, '.events');
      return {
        ...omitFields(entry, new Set(['linkedScene', 'events'])),
        name: expectString(entry.name, 'external event name', uri),
        associatedLayout: String(entry.linkedScene || ''),
        events: compileEvents(
          files,
          registerUri(expectString(entry.events, 'external events URI', uri)),
          options
        ),
      };
    });
    project.externalLayouts = asArray(
      namespace.layoutFiles,
      'externals.layoutFiles',
      uri
    );
    assertUniqueManifestNames(
      project.externalLayouts,
      'externals.layoutFiles',
      uri
    );
    project.externalLayouts = project.externalLayouts.map(entry => {
      validateExternalSourceUri(entry.layout, '.layout');
      const linkedSceneName = String(entry.linkedScene || '');
      const linkedScene = project.layouts.find(
        layout => layout.name === linkedSceneName
      );
      const unresolvedScene = entry.unresolvedScene === true;
      if (!linkedScene && !unresolvedScene) {
        fail(
          'LAYOUT_UNKNOWN_SCENE',
          `External layout ${String(
            entry.name || ''
          )} references missing scene ${linkedSceneName}.`,
          uri
        );
      }
      if (linkedScene && unresolvedScene) {
        fail(
          'MULTIFILE_INVALID_MANIFEST',
          `External layout ${String(
            entry.name || ''
          )} resolves to scene ${linkedSceneName} and must not be marked unresolved.`,
          uri
        );
      }
      return {
        ...omitFields(
          entry,
          new Set(['linkedScene', 'unresolvedScene', 'layout'])
        ),
        name: expectString(entry.name, 'external layout name', uri),
        associatedLayout: linkedSceneName,
        ...readLayout(
          files,
          registerUri(expectString(entry.layout, 'external layout URI', uri)),
          'gdevelop-external-layout',
          linkedScene
            ? {
                ...layoutObjectContext(
                  linkedScene.objects || [],
                  project.objects || [],
                  options.behaviorPropertySchemasByType
                ),
                layerNames: (linkedScene.layers || []).map(layer =>
                  String(layer.name || '')
                ),
              }
            : {}
        ),
      };
    });
  }

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
          new Set(['order', 'extension', 'events'])
        );
        extension.eventsFunctions.push({
          ...metadata,
          events: compileEvents(
            files,
            registerUri(
              expectString(payload.events, 'function events URI', child.uri)
            ),
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
            child.variantObjectDocuments,
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
    normalizeLayoutFragment(layout, 'uiSettings');
  });
  project.externalLayouts.forEach(external =>
    normalizeLayoutFragment(external, 'editionSettings', false)
  );
  project.externalEvents.forEach(external => {
    external.events = parseLegacyEventsJson(
      JSON.stringify(external.events || [])
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
