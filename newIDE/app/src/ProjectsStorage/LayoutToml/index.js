// @noflow

import { parse as parseToml } from 'smol-toml';

export type LayoutTomlKind = 'scene' | 'prefab' | 'prefab-variant' | 'external';

type Location = { line: number, column: number };

export type LayoutTomlContext = {
  kind: LayoutTomlKind,
  fileUri?: string,
  objectNames?: Array<string>,
  layerNames?: Array<string>,
  behaviorTypesByObject?: { [string]: { [string]: string } },
  behaviorPropertySchemasByType?: {
    [string]: {
      keySpace: 'serialized',
      unknownPropertyPolicy: 'error' | 'preserve',
      properties: Array<{
        authoringKey: string,
        serializedKey: string,
        type: string,
      }>,
    },
  },
  instancePropertyTypesByObject?: {
    [string]: { [string]: 'number' | 'string' },
  },
  effectTypes?: Array<string>,
  effectParameterTypesByType?: {
    [string]: { [string]: 'number' | 'string' | 'boolean' },
  },
  usedInstanceUuids?: Set<string>,
};

export const LAYOUT_TOML_VERSION = 1;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const COLOR = /^#[0-9A-F]{6}$/;
const LAYER_ID = /^[a-z0-9][a-z0-9-]*$/;
const ROOT_FIELDS = [
  'layout',
  'editor',
  'layers',
  'effects',
  'instances',
  'variables',
  'behaviors',
];
const RECORD_HEADERS = new Set([
  'layout',
  'editor',
  'layers',
  'effects',
  'instances',
  'variables',
  'behaviors',
]);
const EFFECT_STRUCTURAL_FIELDS = Object.freeze([
  'layer',
  'name',
  'type',
  'folded',
  'enabled',
]);
const RETIRED_EFFECT_FIELDS = new Set(['params']);

export class LayoutTomlError extends Error {
  code: string;
  fileUri: ?string;
  line: number;
  column: number;

  constructor(
    code: string,
    message: string,
    location?: Location,
    fileUri?: string
  ) {
    const line = location ? location.line : 1;
    const column = location ? location.column : 1;
    super(
      `${message}${
        fileUri ? ` (${fileUri}:${line}:${column})` : ` (${line}:${column})`
      }`
    );
    this.name = 'LayoutTomlError';
    this.code = code;
    this.fileUri = fileUri || null;
    this.line = line;
    this.column = column;
  }
}

type CompileState = {
  fileUri: ?string,
  locations: WeakMap<Object, Location>,
};

const locationOf = (state: CompileState, record?: mixed): Location =>
  record && typeof record === 'object' && state.locations.has((record: any))
    ? state.locations.get((record: any)) || { line: 1, column: 1 }
    : { line: 1, column: 1 };

const fail = (
  state: CompileState,
  code: string,
  message: string,
  record?: mixed
): empty => {
  throw new LayoutTomlError(
    code,
    message,
    locationOf(state, record),
    state.fileUri || undefined
  );
};

const isPlainObject = value =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.prototype.toString.call(value) === '[object Object]';

const clone = value => JSON.parse(JSON.stringify(value));
const sortedObject = value =>
  Object.keys(value || {})
    .sort()
    .reduce((result, key) => {
      result[key] = value[key];
      return result;
    }, {});

const parserLocation = error => ({
  line:
    Number(error && (error.line || error.lineNumber)) ||
    Number(error && error.location && error.location.line) ||
    1,
  column:
    Number(error && (error.col || error.column || error.columnNumber)) ||
    Number(error && error.location && error.location.column) ||
    1,
});

const indexRecordLocations = (source, document): WeakMap<Object, Location> => {
  const locations = new WeakMap();
  const indexes = {};
  source.split(/\r?\n/).forEach((line, lineIndex) => {
    const match = line.match(/^\s*(\[\[?)([A-Za-z0-9_-]+)\]\]?\s*(?:#.*)?$/);
    if (!match || !RECORD_HEADERS.has(match[2])) return;
    const name = match[2];
    const value = document[name];
    const record =
      match[1] === '[['
        ? Array.isArray(value)
          ? value[indexes[name] || 0]
          : null
        : value;
    indexes[name] = (indexes[name] || 0) + (match[1] === '[[' ? 1 : 0);
    if (record && typeof record === 'object') {
      locations.set(record, {
        line: lineIndex + 1,
        column: line.indexOf('[') + 1,
      });
    }
  });
  return locations;
};

const parseLayoutTomlDocument = (source, fileUri) => {
  if (typeof source !== 'string') {
    throw new LayoutTomlError(
      'LAYOUT_INVALID_SOURCE',
      'Layout source must be a string.',
      undefined,
      fileUri
    );
  }
  let document;
  try {
    document = parseToml(source.replace(/^\uFEFF/, ''));
  } catch (error) {
    throw new LayoutTomlError(
      'LAYOUT_INVALID_TOML',
      `Invalid layout TOML: ${String(
        error && error.message ? error.message : error
      )}`,
      parserLocation(error),
      fileUri
    );
  }
  return {
    document,
    state: {
      fileUri: fileUri || null,
      locations: indexRecordLocations(source, document),
    },
  };
};

export const parseLayoutToml = (source: string, fileUri?: string): Object =>
  parseLayoutTomlDocument(source, fileUri).document;

const validateRecord = (record, allowed, required, label, state) => {
  if (!isPlainObject(record))
    fail(
      state,
      'LAYOUT_INVALID_RECORD',
      `${label} must be a TOML table.`,
      record
    );
  required.forEach(name => {
    if (!Object.prototype.hasOwnProperty.call(record, name))
      fail(state, 'LAYOUT_MISSING_FIELD', `${label} requires ${name}.`, record);
  });
  Object.keys(record).forEach(name => {
    if (!allowed.includes(name))
      fail(
        state,
        'LAYOUT_UNKNOWN_FIELD',
        `Unknown ${label} field ${name}.`,
        record
      );
  });
  return record;
};

const records = (document, name, state) => {
  const value = document[name];
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(item => !isPlainObject(item)))
    fail(
      state,
      'LAYOUT_INVALID_RECORD',
      `${name} must use [[${name}]] array-of-table records.`,
      document
    );
  return value;
};

const expectBoolean = (value, label, record, state) => {
  if (typeof value !== 'boolean')
    fail(
      state,
      'LAYOUT_INVALID_BOOLEAN',
      `${label} must be true or false.`,
      record
    );
  return value;
};

const expectNumber = (value, label, record, state) => {
  if (typeof value !== 'number' || !Number.isFinite(value))
    fail(
      state,
      'LAYOUT_INVALID_NUMBER',
      `${label} must be a finite number.`,
      record
    );
  return Object.is(value, -0) ? 0 : value;
};

const expectInteger = (value, label, record, state) => {
  const number = expectNumber(value, label, record, state);
  if (!Number.isInteger(number))
    fail(
      state,
      'LAYOUT_INVALID_INTEGER',
      `${label} must be an integer.`,
      record
    );
  return number;
};

const expectString = (value, label, record, state) => {
  if (typeof value !== 'string')
    fail(state, 'LAYOUT_INVALID_STRING', `${label} must be a string.`, record);
  if (value !== value.normalize('NFC'))
    fail(
      state,
      'LAYOUT_INVALID_STRING',
      `${label} must use Unicode NFC.`,
      record
    );
  return value;
};

const expectEnum = (value, allowed, label, record, state) => {
  if (!allowed.includes(value))
    fail(
      state,
      'LAYOUT_INVALID_ENUM',
      `${label} must be one of ${allowed.map(String).join(', ')}.`,
      record
    );
  return value;
};

const expectTuple = (value, lengths, label, record, state) => {
  if (!Array.isArray(value) || !lengths.includes(value.length))
    fail(
      state,
      'LAYOUT_INVALID_TUPLE',
      `${label} must be a numeric array with ${lengths.join(' or ')} values.`,
      record
    );
  return value.map(item => expectNumber(item, label, record, state));
};

const colorParts = value =>
  [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16));

const expectColor = (value, label, record, state) => {
  if (typeof value !== 'string' || !COLOR.test(value.toUpperCase()))
    fail(state, 'LAYOUT_INVALID_COLOR', `${label} must be #RRGGBB.`, record);
  return value.toUpperCase();
};

const serializedColorParts = (value, label, record, state) => {
  if (typeof value === 'string' && COLOR.test(value.toUpperCase()))
    return colorParts(value.toUpperCase());
  if (typeof value === 'string' && /^rgb\(.+\)$/.test(value))
    return expectTuple(
      value
        .slice(4, -1)
        .split(',')
        .map(Number),
      [3],
      label,
      record,
      state
    );
  fail(
    state,
    'LAYOUT_INVALID_COLOR',
    `${label} must be #RRGGBB or rgb(r,g,b).`,
    record
  );
};

const colorFromParts = (r, g, b) => {
  const parts = [r, g, b];
  if (parts.some(value => typeof value !== 'number' || !Number.isFinite(value)))
    throw new LayoutTomlError(
      'LAYOUT_INVALID_COLOR',
      'Serialized color components must be finite numbers.'
    );
  if (parts.some(value => !Number.isInteger(value) || value < 0 || value > 255))
    return `rgb(${parts.join(',')})`;
  return `#${parts
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
};

const validateLiteral = (value, label, record, state) => {
  if (value === null || value === undefined || typeof value === 'bigint')
    fail(
      state,
      'LAYOUT_INVALID_LITERAL',
      `${label} contains a value that layout TOML cannot represent.`,
      record
    );
  if (typeof value === 'string') {
    expectString(value, label, record, state);
    return;
  }
  if (typeof value === 'number') {
    expectNumber(value, label, record, state);
    return;
  }
  if (typeof value === 'boolean') return;
  if (Array.isArray(value)) {
    value.forEach(item => validateLiteral(item, label, record, state));
    return;
  }
  if (!isPlainObject(value))
    fail(
      state,
      'LAYOUT_INVALID_LITERAL',
      `${label} must contain only TOML strings, numbers, booleans, arrays, and tables.`,
      record
    );
  Object.keys(value).forEach(key => {
    expectString(key, `${label} key`, record, state);
    validateLiteral(value[key], label, record, state);
  });
};

const expectTable = (value, label, record, state) => {
  if (!isPlainObject(value))
    fail(
      state,
      'LAYOUT_INVALID_LITERAL',
      `${label} must be an inline TOML table.`,
      record
    );
  validateLiteral(value, label, record, state);
  return value;
};

const compileEditor = (record, state) => {
  if (record === undefined) return {};
  const editor = validateRecord(
    record,
    [
      'grid',
      'grid_type',
      'grid_size',
      'grid_offset',
      'grid_color',
      'grid_alpha',
      'snap',
      'zoom',
      'window_mask',
      'selected_layer',
      'selected_layer_unresolved',
      'mode',
    ],
    [],
    'editor',
    state
  );
  const output = {};
  if (editor.grid !== undefined)
    output.grid = expectBoolean(editor.grid, 'editor grid', record, state);
  if (editor.grid_type !== undefined)
    output.gridType = expectEnum(
      editor.grid_type,
      ['rectangular', 'isometric'],
      'grid_type',
      record,
      state
    );
  if (editor.grid_size !== undefined) {
    const values = expectTuple(
      editor.grid_size,
      [3],
      'grid_size',
      record,
      state
    );
    if (values.some(value => value < 0))
      fail(
        state,
        'LAYOUT_INVALID_EDITOR',
        'grid_size components cannot be negative.',
        record
      );
    [output.gridWidth, output.gridHeight, output.gridDepth] = values;
  }
  if (editor.grid_offset !== undefined)
    [output.gridOffsetX, output.gridOffsetY, output.gridOffsetZ] = expectTuple(
      editor.grid_offset,
      [3],
      'grid_offset',
      record,
      state
    );
  if (editor.grid_color !== undefined) {
    const [r, g, b] = colorParts(
      expectColor(editor.grid_color, 'grid_color', record, state)
    );
    output.gridColor = r * 65536 + g * 256 + b;
  }
  if (editor.grid_alpha !== undefined) {
    output.gridAlpha = expectNumber(
      editor.grid_alpha,
      'grid_alpha',
      record,
      state
    );
    if (output.gridAlpha < 0 || output.gridAlpha > 1)
      fail(
        state,
        'LAYOUT_INVALID_EDITOR',
        'grid_alpha must be in [0,1].',
        record
      );
  }
  if (editor.snap !== undefined)
    output.snap = expectBoolean(editor.snap, 'snap', record, state);
  if (editor.zoom !== undefined) {
    output.zoomFactor = expectNumber(editor.zoom, 'zoom', record, state);
    if (output.zoomFactor < 0.01)
      fail(
        state,
        'LAYOUT_INVALID_EDITOR',
        'zoom must be at least 0.01.',
        record
      );
  }
  if (editor.window_mask !== undefined)
    output.windowMask = expectBoolean(
      editor.window_mask,
      'window_mask',
      record,
      state
    );
  if (editor.selected_layer !== undefined)
    output.selectedLayer = expectString(
      editor.selected_layer,
      'selected_layer',
      record,
      state
    );
  if (
    editor.selected_layer_unresolved !== undefined &&
    expectBoolean(
      editor.selected_layer_unresolved,
      'selected_layer_unresolved',
      record,
      state
    )
  )
    output.__selectedLayerUnresolved = true;
  if (editor.mode !== undefined)
    output.gameEditorMode = expectEnum(
      editor.mode,
      ['instances-editor', 'embedded-game'],
      'mode',
      record,
      state
    );
  return output;
};

const compileDefaultableTuple = (
  value,
  length,
  defaults,
  label,
  record,
  state
) => {
  if (value === 'default') return { isDefault: true, values: defaults };
  if (Array.isArray(value))
    return {
      isDefault: false,
      values: expectTuple(value, [length], label, record, state),
    };
  if (isPlainObject(value)) {
    validateRecord(value, ['default'], ['default'], label, state);
    return {
      isDefault: true,
      values: expectTuple(value.default, [length], label, record, state),
    };
  }
  fail(
    state,
    'LAYOUT_INVALID_CAMERA',
    `${label} must be "default", a numeric array, or { default = [...] }.`,
    record
  );
};

const compileCamera = (record, state) => {
  const camera = validateRecord(
    record,
    ['size', 'viewport'],
    ['size', 'viewport'],
    'camera',
    state
  );
  const size = compileDefaultableTuple(
    camera.size,
    2,
    [0, 0],
    'camera size',
    record,
    state
  );
  const viewport = compileDefaultableTuple(
    camera.viewport,
    4,
    [0, 0, 1, 1],
    'camera viewport',
    record,
    state
  );
  if (
    viewport.values.some(value => value < 0 || value > 1) ||
    viewport.values[0] > viewport.values[2] ||
    viewport.values[1] > viewport.values[3]
  )
    fail(
      state,
      'LAYOUT_INVALID_CAMERA',
      'Viewport must be normalized and ordered.',
      record
    );
  return {
    defaultSize: size.isDefault,
    width: size.values[0],
    height: size.values[1],
    defaultViewport: viewport.isDefault,
    viewportLeft: viewport.values[0],
    viewportTop: viewport.values[1],
    viewportRight: viewport.values[2],
    viewportBottom: viewport.values[3],
  };
};

const compileEffect = (record, context, state) => {
  const effect = validateRecord(
    record,
    Object.keys(record || {}),
    ['layer', 'name', 'type'],
    'effect',
    state
  );
  const effectType = expectString(effect.type, 'effect type', record, state);
  if (context.effectTypes && !context.effectTypes.includes(effectType))
    fail(
      state,
      'LAYOUT_UNKNOWN_EFFECT_TYPE',
      `Effect type ${effectType} is not registered.`,
      record
    );
  const knownParameters =
    context.effectParameterTypesByType &&
    context.effectParameterTypesByType[effectType];
  if (knownParameters) {
    Object.keys(knownParameters).forEach(name => {
      if (
        EFFECT_STRUCTURAL_FIELDS.includes(name) ||
        RETIRED_EFFECT_FIELDS.has(name)
      )
        fail(
          state,
          'LAYOUT_EFFECT_PARAMETER_COLLISION',
          `Effect parameter ${name} on ${effectType} collides with a reserved effect field.`,
          record
        );
    });
  }
  const parameterNames = Object.keys(effect).filter(
    name => !EFFECT_STRUCTURAL_FIELDS.includes(name)
  );
  parameterNames.forEach(name => {
    if (RETIRED_EFFECT_FIELDS.has(name))
      fail(
        state,
        'LAYOUT_UNKNOWN_FIELD',
        `Unknown effect field ${name}. Effect parameters must be direct fields on [[effects]].`,
        record
      );
  });
  const numbers = {};
  const strings = {};
  const booleans = {};
  parameterNames.forEach(name => {
    const value = effect[name];
    if (typeof value === 'number')
      numbers[name] = expectNumber(
        value,
        `effect parameter ${name}`,
        record,
        state
      );
    else if (typeof value === 'string')
      strings[name] = expectString(
        value,
        `effect parameter ${name}`,
        record,
        state
      );
    else if (typeof value === 'boolean') booleans[name] = value;
    else
      fail(
        state,
        'LAYOUT_INVALID_EFFECT_PARAMETER',
        `Effect parameter ${name} must be a number, string, or boolean.`,
        record
      );
  });
  if (knownParameters) {
    parameterNames.forEach(name => {
      const actualType = typeof effect[name];
      if (knownParameters[name] !== actualType)
        fail(
          state,
          'LAYOUT_INVALID_EFFECT_PARAMETER',
          `Effect parameter ${name} is not a ${actualType} parameter of ${effectType}.`,
          record
        );
    });
  }
  const output = {
    name: expectString(effect.name, 'effect name', record, state),
    effectType,
    doubleParameters: sortedObject(numbers),
    stringParameters: sortedObject(strings),
    booleanParameters: sortedObject(booleans),
  };
  if (
    effect.folded !== undefined &&
    expectBoolean(effect.folded, 'effect folded', record, state)
  )
    output.folded = true;
  if (
    effect.enabled !== undefined &&
    !expectBoolean(effect.enabled, 'effect enabled', record, state)
  )
    output.disabled = true;
  return output;
};

const compileProperties = (properties, objectName, context, record, state) => {
  const values = expectTable(properties, 'instance properties', record, state);
  const knownProperties =
    context.instancePropertyTypesByObject &&
    context.instancePropertyTypesByObject[objectName];
  const numbers = [];
  const strings = [];
  Object.keys(values)
    .sort()
    .forEach(name => {
      const value = values[name];
      const type = typeof value;
      if (type !== 'number' && type !== 'string')
        fail(
          state,
          'LAYOUT_INVALID_INSTANCE_PROPERTY',
          `Property ${name} must be a number or string.`,
          record
        );
      if (knownProperties && knownProperties[name] !== type)
        fail(
          state,
          'LAYOUT_INVALID_INSTANCE_PROPERTY',
          `Property ${name} is not a ${type} property of ${objectName}.`,
          record
        );
      if (type === 'number') {
        expectNumber(value, `property ${name}`, record, state);
        numbers.push({ name, value });
      } else {
        expectString(value, `property ${name}`, record, state);
        strings.push({ name, value });
      }
    });
  return { numberProperties: numbers, stringProperties: strings };
};

const compileVariable = (record, parentType, state) => {
  const variable = validateRecord(
    record,
    ['name', 'type', 'value', 'values', 'folded', 'id', 'children'],
    ['type'],
    'variable',
    state
  );
  const type = expectEnum(
    variable.type,
    ['string', 'enum', 'number', 'boolean', 'structure', 'array'],
    'variable type',
    record,
    state
  );
  if (parentType === 'array' && variable.name !== undefined)
    fail(
      state,
      'LAYOUT_INVALID_VARIABLE',
      'Array children cannot have names.',
      record
    );
  if (parentType !== 'array' && variable.name === undefined)
    fail(
      state,
      'LAYOUT_INVALID_VARIABLE',
      'Named variable requires name.',
      record
    );
  const output = { type };
  if (
    variable.folded !== undefined &&
    expectBoolean(variable.folded, 'variable folded', record, state)
  )
    output.folded = true;
  if (variable.id !== undefined) {
    output.persistentUuid = expectString(
      variable.id,
      'variable id',
      record,
      state
    );
    if (!UUID_V4.test(output.persistentUuid))
      fail(
        state,
        'LAYOUT_INVALID_UUID',
        'Variable id must be canonical UUIDv4.',
        record
      );
  }
  if (type === 'structure' || type === 'array') {
    if (variable.value !== undefined || variable.values !== undefined)
      fail(
        state,
        'LAYOUT_INVALID_VARIABLE',
        `${type} variables cannot have value or values.`,
        record
      );
    const children = variable.children === undefined ? [] : variable.children;
    if (
      !Array.isArray(children) ||
      children.some(child => !isPlainObject(child))
    )
      fail(
        state,
        'LAYOUT_INVALID_VARIABLE',
        `${type} children must be an array of inline tables.`,
        record
      );
    if (type === 'structure') {
      const names = new Set();
      output.children = children
        .map(child => {
          const name = expectString(
            child.name,
            'structure child name',
            record,
            state
          );
          if (names.has(name))
            fail(
              state,
              'LAYOUT_DUPLICATE_VARIABLE',
              `Duplicate structure child ${name}.`,
              record
            );
          names.add(name);
          return { name, ...compileVariable(child, 'structure', state) };
        })
        .sort((left, right) =>
          left.name < right.name ? -1 : left.name > right.name ? 1 : 0
        );
    } else {
      output.children = children.map(child =>
        compileVariable(child, 'array', state)
      );
    }
  } else {
    if (variable.children !== undefined)
      fail(
        state,
        'LAYOUT_INVALID_VARIABLE',
        'Primitive variables cannot have children.',
        record
      );
    if (variable.value === undefined)
      fail(
        state,
        'LAYOUT_MISSING_FIELD',
        `Variable type ${type} requires value.`,
        record
      );
    if (type === 'number')
      output.value = expectNumber(
        variable.value,
        'variable value',
        record,
        state
      );
    else if (type === 'boolean')
      output.value = expectBoolean(
        variable.value,
        'variable value',
        record,
        state
      );
    else
      output.value = expectString(
        variable.value,
        'variable value',
        record,
        state
      );
    if (type === 'enum') {
      if (
        variable.values !== undefined &&
        (!Array.isArray(variable.values) ||
          variable.values.some(value => typeof value !== 'string') ||
          new Set(variable.values).size !== variable.values.length)
      )
        fail(
          state,
          'LAYOUT_INVALID_VARIABLE',
          'Enum values must be a unique string array.',
          record
        );
      const values = variable.values === undefined ? [] : variable.values;
      values.forEach(value => expectString(value, 'enum value', record, state));
      if (values.length) output.values = values;
      if (values.length && !values.includes(output.value))
        fail(
          state,
          'LAYOUT_INVALID_VARIABLE',
          'Enum value must occur in values.',
          record
        );
    } else if (variable.values !== undefined)
      fail(
        state,
        'LAYOUT_INVALID_VARIABLE',
        'values is allowed only for enum.',
        record
      );
  }
  return output;
};

const compileBehavior = (record, objectName, context, state) => {
  const behavior = validateRecord(
    record,
    [
      'instance',
      'name',
      'properties',
      'folded',
      'muted',
      'inherited',
      'quick',
      'property_visibility',
    ],
    ['instance', 'name'],
    'behavior',
    state
  );
  const behaviorName = expectString(
    behavior.name,
    'behavior name',
    record,
    state
  );
  const behaviorTypes =
    context.behaviorTypesByObject && context.behaviorTypesByObject[objectName];
  const type = behaviorTypes && behaviorTypes[behaviorName];
  if (!type)
    fail(
      state,
      'LAYOUT_UNKNOWN_BEHAVIOR',
      `Behavior ${behaviorName} is not attached to ${objectName}.`,
      record
    );
  const properties = expectTable(
    behavior.properties === undefined ? {} : behavior.properties,
    'behavior properties',
    record,
    state
  );
  const propertySchema =
    context.behaviorPropertySchemasByType &&
    context.behaviorPropertySchemasByType[type];
  if (propertySchema) {
    const bySerializedKey = (propertySchema.properties || []).reduce(
      (result, property) => {
        result[property.serializedKey] = property;
        return result;
      },
      {}
    );
    const byAuthoringKey = (propertySchema.properties || []).reduce(
      (result, property) => {
        result[property.authoringKey] = property;
        return result;
      },
      {}
    );
    Object.keys(properties).forEach(key => {
      const property = bySerializedKey[key];
      if (property) {
        const normalizedType = String(property.type || '').toLowerCase();
        const valid = ['number', 'float'].includes(normalizedType)
          ? typeof properties[key] === 'number' &&
            Number.isFinite(properties[key])
          : normalizedType === 'integer'
          ? Number.isInteger(properties[key])
          : normalizedType === 'boolean'
          ? typeof properties[key] === 'boolean'
          : typeof properties[key] === 'string';
        if (!valid)
          fail(
            state,
            'LAYOUT_INVALID_BEHAVIOR_PROPERTY',
            `Behavior ${behaviorName} property ${key} must be ${
              property.type
            }.`,
            record
          );
        return;
      }
      const authoringProperty = byAuthoringKey[key];
      if (
        authoringProperty &&
        authoringProperty.serializedKey !== authoringProperty.authoringKey
      )
        fail(
          state,
          'BEHAVIOR_PROPERTY_KEY_MISMATCH',
          `Behavior ${behaviorName} uses editor-facing key ${key}; use serialized key ${
            authoringProperty.serializedKey
          }.`,
          record
        );
      if (propertySchema.unknownPropertyPolicy === 'error')
        fail(
          state,
          'LAYOUT_UNKNOWN_BEHAVIOR_PROPERTY',
          `Behavior ${behaviorName} has unknown serialized property ${key}.`,
          record
        );
    });
  }
  const visibility = expectTable(
    behavior.property_visibility === undefined
      ? {}
      : behavior.property_visibility,
    'property_visibility',
    record,
    state
  );
  Object.keys(visibility).forEach(key =>
    expectEnum(
      visibility[key],
      ['default', 'visible', 'hidden'],
      `property visibility ${key}`,
      record,
      state
    )
  );
  const output = { ...clone(properties), type: type || '', name: behaviorName };
  if (
    behavior.folded !== undefined &&
    expectBoolean(behavior.folded, 'behavior folded', record, state)
  )
    output.isFolded = true;
  if (
    behavior.muted !== undefined &&
    expectBoolean(behavior.muted, 'behavior muted', record, state)
  )
    output.isMuted = true;
  if (
    behavior.inherited !== undefined &&
    expectBoolean(behavior.inherited, 'behavior inherited', record, state)
  )
    output.isInheritedFromObjectType = true;
  if (behavior.quick !== undefined) {
    const quick = expectEnum(
      behavior.quick,
      ['default', 'visible', 'hidden'],
      'behavior quick',
      record,
      state
    );
    if (quick !== 'default') output.quickCustomizationVisibility = quick;
  }
  if (Object.keys(visibility).length)
    output.propertiesQuickCustomizationVisibilities = sortedObject(visibility);
  return output;
};

const compileInstance = (record, layerName, context, state) => {
  const instance = validateRecord(
    record,
    [
      'id',
      'object',
      'layer',
      'unresolved',
      'at',
      'rotation',
      'z_order',
      'size',
      'auto_size',
      'depth',
      'opacity',
      'flip',
      'locked',
      'sealed',
      'hidden',
      'keep_ratio',
      'properties',
    ],
    ['id', 'object', 'layer', 'at'],
    'instance',
    state
  );
  const name = expectString(instance.object, 'object name', record, state);
  const unresolved =
    instance.unresolved !== undefined &&
    expectBoolean(instance.unresolved, 'unresolved', record, state);
  if (context.objectNames) {
    const resolves = context.objectNames.includes(name);
    if (!resolves && !unresolved)
      fail(
        state,
        'LAYOUT_UNKNOWN_OBJECT',
        `Object ${name} does not resolve in this layout.`,
        record
      );
    if (resolves && unresolved)
      fail(
        state,
        'LAYOUT_INVALID_INSTANCE',
        `Object ${name} resolves and must not be marked unresolved.`,
        record
      );
  }
  const uuid = expectString(instance.id, 'instance id', record, state);
  if (!UUID_V4.test(uuid))
    fail(
      state,
      'LAYOUT_INVALID_UUID',
      'Instance id must be a lowercase canonical UUIDv4.',
      record
    );
  if (context.usedInstanceUuids && context.usedInstanceUuids.has(uuid))
    fail(
      state,
      'LAYOUT_DUPLICATE_UUID',
      `Duplicate instance UUID ${uuid}.`,
      record
    );
  if (context.usedInstanceUuids) context.usedInstanceUuids.add(uuid);
  const position = expectTuple(
    instance.at,
    [2, 3],
    'instance at',
    record,
    state
  );
  let rotation = [0];
  if (instance.rotation !== undefined) {
    rotation = Array.isArray(instance.rotation)
      ? expectTuple(instance.rotation, [3], 'instance rotation', record, state)
      : [expectNumber(instance.rotation, 'instance rotation', record, state)];
  }
  const output = {
    name,
    x: position[0],
    y: position[1],
    angle: rotation.length === 1 ? rotation[0] : rotation[2],
    zOrder:
      instance.z_order === undefined
        ? 0
        : expectInteger(instance.z_order, 'z_order', record, state),
    layer: layerName,
    customSize: false,
    width: 0,
    height: 0,
    persistentUuid: uuid,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  };
  if (position.length === 3) output.z = position[2];
  if (rotation.length === 3) {
    output.rotationX = rotation[0];
    output.rotationY = rotation[1];
  }
  if (instance.size !== undefined && instance.auto_size !== undefined)
    fail(
      state,
      'LAYOUT_INVALID_INSTANCE',
      'Instance size and auto_size are mutually exclusive.',
      record
    );
  if (instance.size !== undefined) {
    output.customSize = true;
    [output.width, output.height] = expectTuple(
      instance.size,
      [2],
      'instance size',
      record,
      state
    );
  } else if (instance.auto_size !== undefined) {
    [output.width, output.height] = expectTuple(
      instance.auto_size,
      [2],
      'instance auto_size',
      record,
      state
    );
  }
  if (instance.opacity !== undefined) {
    const opacity = expectInteger(instance.opacity, 'opacity', record, state);
    if (opacity < 0 || opacity > 255)
      fail(
        state,
        'LAYOUT_INVALID_INSTANCE',
        'opacity must be in [0,255].',
        record
      );
    if (opacity !== 255) output.opacity = opacity;
  }
  if (instance.depth !== undefined)
    output.depth = expectNumber(instance.depth, 'depth', record, state);
  const flips = instance.flip === undefined ? [] : instance.flip;
  if (
    !Array.isArray(flips) ||
    flips.some(axis => !['x', 'y', 'z'].includes(axis)) ||
    new Set(flips).size !== flips.length
  )
    fail(
      state,
      'LAYOUT_INVALID_INSTANCE',
      'flip must contain unique x, y, z strings.',
      record
    );
  if (flips.includes('x')) output.flippedX = true;
  if (flips.includes('y')) output.flippedY = true;
  if (flips.includes('z')) output.flippedZ = true;
  if (
    instance.locked !== undefined &&
    expectBoolean(instance.locked, 'locked', record, state)
  )
    output.locked = true;
  if (
    instance.sealed !== undefined &&
    expectBoolean(instance.sealed, 'sealed', record, state)
  )
    output.sealed = true;
  if (
    instance.hidden !== undefined &&
    expectBoolean(instance.hidden, 'hidden', record, state)
  )
    output.hidden = true;
  if (instance.keep_ratio === undefined) output.keepRatio = true;
  else if (expectBoolean(instance.keep_ratio, 'keep_ratio', record, state))
    output.keepRatio = true;
  if (instance.properties !== undefined)
    Object.assign(
      output,
      compileProperties(instance.properties, name, context, record, state)
    );
  return output;
};

const compileLayer = (record, context, state) => {
  const external = context.kind === 'external';
  const allowed = external
    ? ['id', 'name']
    : [
        'id',
        'name',
        'rendering',
        'camera_type',
        'camera_behavior',
        'visible',
        'locked',
        'lighting',
        'follow_base_camera',
        'ambient',
        'near',
        'far',
        'fov',
        'max_2d_distance',
        'cameras',
      ];
  const layerRecord = validateRecord(
    record,
    allowed,
    ['id', 'name'],
    'layer',
    state
  );
  const id = expectString(layerRecord.id, 'layer id', record, state);
  if (!LAYER_ID.test(id))
    fail(
      state,
      'LAYOUT_INVALID_LAYER_ID',
      'Layer id must use lowercase letters, digits, and hyphens.',
      record
    );
  const name = expectString(layerRecord.name, 'layer name', record, state);
  if (external) return { id, name };
  const renderingType =
    layerRecord.rendering === undefined
      ? ''
      : expectEnum(
          layerRecord.rendering,
          ['', '2d', '3d', '2d+3d'],
          'layer rendering',
          record,
          state
        );
  const isLightingLayer =
    layerRecord.lighting === undefined
      ? false
      : expectBoolean(layerRecord.lighting, 'layer lighting', record, state);
  if (
    isLightingLayer &&
    (renderingType === '3d' || renderingType === '2d+3d')
  ) {
    fail(
      state,
      'LAYOUT_3D_LAYER_MARKED_AS_LIGHTING_LAYER',
      `Layer "${name}" uses rendering="${renderingType}" and lighting=true. ` +
        'The lighting flag creates a dedicated 2D Lighting Layer; it does not enable Scene3D lighting. ' +
        'Set lighting=false and add Scene3D light effects instead.',
      record
    );
  }
  const layer = {
    name,
    renderingType,
    cameraType:
      layerRecord.camera_type === undefined
        ? ''
        : expectEnum(
            layerRecord.camera_type,
            ['', 'perspective', 'orthographic'],
            'camera_type',
            record,
            state
          ),
    visibility:
      layerRecord.visible === undefined
        ? true
        : expectBoolean(layerRecord.visible, 'layer visible', record, state),
    isLocked:
      layerRecord.locked === undefined
        ? false
        : expectBoolean(layerRecord.locked, 'layer locked', record, state),
    isLightingLayer,
    followBaseLayerCamera:
      layerRecord.follow_base_camera === undefined
        ? false
        : expectBoolean(
            layerRecord.follow_base_camera,
            'follow_base_camera',
            record,
            state
          ),
    camera3DNearPlaneDistance:
      layerRecord.near === undefined
        ? 3
        : expectNumber(layerRecord.near, 'near', record, state),
    camera3DFarPlaneDistance:
      layerRecord.far === undefined
        ? 10000
        : expectNumber(layerRecord.far, 'far', record, state),
    camera3DFieldOfView:
      layerRecord.fov === undefined
        ? 45
        : expectNumber(layerRecord.fov, 'fov', record, state),
    camera2DPlaneMaxDrawingDistance:
      layerRecord.max_2d_distance === undefined
        ? 5000
        : expectNumber(
            layerRecord.max_2d_distance,
            'max_2d_distance',
            record,
            state
          ),
    cameras: [],
    effects: [],
  };
  if (layerRecord.camera_behavior !== undefined) {
    const behavior = expectEnum(
      layerRecord.camera_behavior,
      ['do-nothing', 'top-left-anchored-if-never-moved'],
      'camera_behavior',
      record,
      state
    );
    if (behavior !== 'top-left-anchored-if-never-moved')
      layer.defaultCameraBehavior = behavior;
  }
  [
    layer.ambientLightColorR,
    layer.ambientLightColorG,
    layer.ambientLightColorB,
  ] = serializedColorParts(
    layerRecord.ambient === undefined ? '#C8C8C8' : layerRecord.ambient,
    'ambient',
    record,
    state
  );
  if (layer.camera3DFarPlaneDistance <= layer.camera3DNearPlaneDistance)
    fail(
      state,
      'LAYOUT_INVALID_LAYER',
      'far must be greater than near.',
      record
    );
  if (
    layer.cameraType === 'perspective' &&
    layer.camera3DNearPlaneDistance <= 0
  )
    fail(
      state,
      'LAYOUT_INVALID_LAYER',
      'Perspective near distance must be positive.',
      record
    );
  if (layer.camera3DFieldOfView <= 0 || layer.camera3DFieldOfView > 180)
    fail(state, 'LAYOUT_INVALID_LAYER', 'fov must be in (0,180].', record);
  if (layer.camera2DPlaneMaxDrawingDistance <= 0)
    fail(
      state,
      'LAYOUT_INVALID_LAYER',
      'max_2d_distance must be positive.',
      record
    );
  const cameras = layerRecord.cameras === undefined ? [] : layerRecord.cameras;
  if (!Array.isArray(cameras) || cameras.some(camera => !isPlainObject(camera)))
    fail(
      state,
      'LAYOUT_INVALID_CAMERA',
      'Layer cameras must be an array of inline tables.',
      record
    );
  if (cameras.length > 50)
    fail(
      state,
      'LAYOUT_TOO_MANY_CAMERAS',
      'A layer cannot contain more than 50 cameras.',
      record
    );
  layer.cameras = cameras.map(camera => compileCamera(camera, state));
  return { id, name, layer };
};

export const compileLayoutToml = (
  source: string,
  initialContext: LayoutTomlContext
): Object => {
  if (
    !initialContext ||
    !['scene', 'prefab', 'prefab-variant', 'external'].includes(
      initialContext.kind
    )
  )
    throw new LayoutTomlError(
      'LAYOUT_INVALID_CONTEXT',
      'A valid layout context is required.'
    );
  const context = {
    ...initialContext,
    usedInstanceUuids: initialContext.usedInstanceUuids || new Set(),
  };
  const { document, state } = parseLayoutTomlDocument(source, context.fileUri);
  validateRecord(document, ROOT_FIELDS, ['layout'], 'layout document', state);
  const scene = context.kind === 'scene';
  const prefab = context.kind === 'prefab' || context.kind === 'prefab-variant';
  const layoutRecord = validateRecord(
    document.layout,
    ['version', 'background', 'bounds'],
    ['version'],
    'layout',
    state
  );
  if (layoutRecord.version !== LAYOUT_TOML_VERSION)
    fail(
      state,
      'LAYOUT_UNSUPPORTED_VERSION',
      `Only layout TOML version ${LAYOUT_TOML_VERSION} is supported.`,
      layoutRecord
    );
  if (scene && layoutRecord.background === undefined)
    fail(
      state,
      'LAYOUT_MISSING_FIELD',
      'Scene layout requires background.',
      layoutRecord
    );
  if (!scene && layoutRecord.background !== undefined)
    fail(
      state,
      'LAYOUT_OWNERSHIP_CONFLICT',
      'Only scene layouts may define background.',
      layoutRecord
    );
  if (prefab && layoutRecord.bounds === undefined)
    fail(
      state,
      'LAYOUT_MISSING_BOUNDS',
      'Prefab layouts require bounds.',
      layoutRecord
    );
  if (!prefab && layoutRecord.bounds !== undefined)
    fail(
      state,
      'LAYOUT_OWNERSHIP_CONFLICT',
      'Only prefab layouts may define bounds.',
      layoutRecord
    );
  const output = {};
  if (scene)
    [output.r, output.v, output.b] = serializedColorParts(
      layoutRecord.background,
      'background',
      layoutRecord,
      state
    );
  if (prefab) {
    const bounds = validateRecord(
      layoutRecord.bounds,
      ['min', 'max'],
      ['min', 'max'],
      'bounds',
      state
    );
    const min = expectTuple(
      bounds.min,
      [3],
      'bounds min',
      layoutRecord,
      state
    ).map(value => expectInteger(value, 'bound', layoutRecord, state));
    const max = expectTuple(
      bounds.max,
      [3],
      'bounds max',
      layoutRecord,
      state
    ).map(value => expectInteger(value, 'bound', layoutRecord, state));
    [output.areaMinX, output.areaMinY, output.areaMinZ] = min;
    [output.areaMaxX, output.areaMaxY, output.areaMaxZ] = max;
  }
  output[scene ? 'uiSettings' : 'editionSettings'] = compileEditor(
    document.editor,
    state
  );

  const layerRecords = records(document, 'layers', state);
  const layerIds = new Map();
  const layerNames = new Set();
  const layers = [];
  layerRecords.forEach(record => {
    const result = compileLayer(record, context, state);
    if (layerIds.has(result.id))
      fail(
        state,
        'LAYOUT_DUPLICATE_LAYER_ID',
        `Duplicate layer id ${result.id}.`,
        record
      );
    if (layerNames.has(result.name))
      fail(
        state,
        'LAYOUT_DUPLICATE_LAYER',
        `Duplicate layer ${result.name}.`,
        record
      );
    layerIds.set(result.id, result);
    layerNames.add(result.name);
    if (result.layer) layers.push(result.layer);
  });
  if (context.layerNames)
    layerNames.forEach(name => {
      if (!context.layerNames.includes(name))
        fail(
          state,
          'LAYOUT_UNKNOWN_LAYER',
          `Layer ${name} does not exist in the linked scene.`,
          document
        );
    });

  records(document, 'effects', state).forEach(record => {
    if (context.kind === 'external')
      fail(
        state,
        'LAYOUT_OWNERSHIP_CONFLICT',
        'External layouts cannot define effects.',
        record
      );
    const layerId = expectString(record.layer, 'effect layer', record, state);
    const owner = layerIds.get(layerId);
    if (!owner || !owner.layer)
      fail(
        state,
        'LAYOUT_UNKNOWN_LAYER',
        `Effect references unknown layer id ${layerId}.`,
        record
      );
    const effect = compileEffect(record, context, state);
    if (owner.layer.effects.some(existing => existing.name === effect.name))
      fail(
        state,
        'LAYOUT_DUPLICATE_EFFECT',
        `Duplicate effect ${effect.name} on layer ${owner.name}.`,
        record
      );
    owner.layer.effects.push(effect);
  });

  const instances = records(document, 'instances', state).map(record => {
    const layerId = expectString(record.layer, 'instance layer', record, state);
    const owner = layerIds.get(layerId);
    if (!owner)
      fail(
        state,
        'LAYOUT_UNKNOWN_LAYER',
        `Instance references unknown layer id ${layerId}.`,
        record
      );
    return compileInstance(record, owner.name, context, state);
  });
  if (context.kind !== 'external' && !layers.length && instances.length)
    fail(state, 'LAYOUT_INVALID_LAYER', 'Instances require a layer.', document);
  const instancesById = new Map(
    instances.map(instance => [instance.persistentUuid, instance])
  );
  const variableNamesByInstance = new Map();
  records(document, 'variables', state).forEach(record => {
    const instanceId = expectString(
      record.instance,
      'variable instance',
      record,
      state
    );
    const instance = instancesById.get(instanceId);
    if (!instance)
      fail(
        state,
        'LAYOUT_UNKNOWN_INSTANCE',
        `Variable references unknown instance ${instanceId}.`,
        record
      );
    const name = expectString(record.name, 'variable name', record, state);
    const names = variableNamesByInstance.get(instanceId) || new Set();
    if (names.has(name))
      fail(
        state,
        'LAYOUT_DUPLICATE_VARIABLE',
        `Duplicate variable ${name} on instance ${instanceId}.`,
        record
      );
    names.add(name);
    variableNamesByInstance.set(instanceId, names);
    const variableRecord = { ...record };
    delete variableRecord.instance;
    instance.initialVariables.push({
      name,
      ...compileVariable(variableRecord, 'variables', state),
    });
  });
  const behaviorNamesByInstance = new Map();
  records(document, 'behaviors', state).forEach(record => {
    const instanceId = expectString(
      record.instance,
      'behavior instance',
      record,
      state
    );
    const instance = instancesById.get(instanceId);
    if (!instance)
      fail(
        state,
        'LAYOUT_UNKNOWN_INSTANCE',
        `Behavior references unknown instance ${instanceId}.`,
        record
      );
    const behavior = compileBehavior(record, instance.name, context, state);
    const names = behaviorNamesByInstance.get(instanceId) || new Set();
    if (names.has(behavior.name))
      fail(
        state,
        'LAYOUT_DUPLICATE_BEHAVIOR',
        `Duplicate behavior ${behavior.name} on instance ${instanceId}.`,
        record
      );
    names.add(behavior.name);
    behaviorNamesByInstance.set(instanceId, names);
    if (!instance.behaviorOverridings) instance.behaviorOverridings = [];
    instance.behaviorOverridings.push(behavior);
  });

  const editor = output[scene ? 'uiSettings' : 'editionSettings'];
  const selectedLayer = editor.selectedLayer;
  const selectedLayerUnresolved = editor.__selectedLayerUnresolved === true;
  const resolvableLayers =
    context.kind === 'external' && context.layerNames
      ? new Set(context.layerNames)
      : layerNames;
  if (!selectedLayer && selectedLayerUnresolved)
    fail(
      state,
      'LAYOUT_INVALID_EDITOR',
      'selected_layer_unresolved requires selected_layer.',
      document.editor
    );
  if (
    selectedLayer &&
    !resolvableLayers.has(selectedLayer) &&
    !selectedLayerUnresolved
  )
    fail(
      state,
      'LAYOUT_UNKNOWN_LAYER',
      `Selected layer ${selectedLayer} does not exist.`,
      document.editor
    );
  if (
    selectedLayer &&
    resolvableLayers.has(selectedLayer) &&
    selectedLayerUnresolved
  )
    fail(
      state,
      'LAYOUT_INVALID_EDITOR',
      `Selected layer ${selectedLayer} exists and must not be marked unresolved.`,
      document.editor
    );
  delete editor.__selectedLayerUnresolved;
  if (context.kind !== 'external') output.layers = layers;
  output.instances = instances;
  return output;
};

const assertKnownFields = (value, allowed, label) => {
  Object.keys(value || {}).forEach(key => {
    if (!allowed.includes(key))
      throw new LayoutTomlError(
        'LAYOUT_UNSUPPORTED_FIELD',
        `${label} field ${key} is outside layout TOML version 1.`
      );
  });
};

const canonicalLiteral = value => {
  if (Array.isArray(value)) return value.map(canonicalLiteral);
  if (value && typeof value === 'object') {
    if (!isPlainObject(value))
      throw new LayoutTomlError(
        'LAYOUT_INVALID_LITERAL',
        'Layout TOML cannot serialize dates or custom objects.'
      );
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        if (key !== key.normalize('NFC'))
          throw new LayoutTomlError(
            'LAYOUT_INVALID_STRING',
            'Cannot serialize a non-NFC table key.'
          );
        result[key] = canonicalLiteral(value[key]);
        return result;
      }, {});
  }
  if (typeof value === 'string' && value !== value.normalize('NFC'))
    throw new LayoutTomlError(
      'LAYOUT_INVALID_STRING',
      'Cannot serialize a non-NFC string.'
    );
  if (typeof value === 'number' && !Number.isFinite(value))
    throw new LayoutTomlError(
      'LAYOUT_INVALID_NUMBER',
      'Cannot serialize a non-finite number.'
    );
  if (!['string', 'number', 'boolean'].includes(typeof value))
    throw new LayoutTomlError(
      'LAYOUT_INVALID_LITERAL',
      'Layout TOML values must be strings, numbers, booleans, arrays, or tables.'
    );
  return value;
};

const decompileEditor = (settings, layerNames = null) => {
  settings = { ...(settings || {}) };
  if (
    settings.gridR !== undefined ||
    settings.gridG !== undefined ||
    settings.gridB !== undefined
  ) {
    if (settings.gridColor === undefined) {
      const gridR = settings.gridR === undefined ? 158 : settings.gridR;
      const gridG = settings.gridG === undefined ? 180 : settings.gridG;
      const gridB = settings.gridB === undefined ? 255 : settings.gridB;
      colorFromParts(gridR, gridG, gridB);
      settings.gridColor = gridR * 65536 + gridG * 256 + gridB;
    }
    delete settings.gridR;
    delete settings.gridG;
    delete settings.gridB;
  }
  assertKnownFields(
    settings,
    [
      'grid',
      'gridType',
      'gridWidth',
      'gridHeight',
      'gridDepth',
      'gridOffsetX',
      'gridOffsetY',
      'gridOffsetZ',
      'gridColor',
      'gridAlpha',
      'snap',
      'zoomFactor',
      'windowMask',
      'selectedLayer',
      'gameEditorMode',
    ],
    'editor'
  );
  if (!Object.keys(settings).length) return null;
  const output = {};
  if (settings.grid !== undefined) output.grid = !!settings.grid;
  if (settings.gridType !== undefined) output.grid_type = settings.gridType;
  if (
    settings.gridWidth !== undefined ||
    settings.gridHeight !== undefined ||
    settings.gridDepth !== undefined
  )
    output.grid_size = [
      settings.gridWidth === undefined ? 32 : settings.gridWidth,
      settings.gridHeight === undefined ? 32 : settings.gridHeight,
      settings.gridDepth === undefined ? 32 : settings.gridDepth,
    ];
  if (
    settings.gridOffsetX !== undefined ||
    settings.gridOffsetY !== undefined ||
    settings.gridOffsetZ !== undefined
  )
    output.grid_offset = [
      settings.gridOffsetX === undefined ? 0 : settings.gridOffsetX,
      settings.gridOffsetY === undefined ? 0 : settings.gridOffsetY,
      settings.gridOffsetZ === undefined ? 0 : settings.gridOffsetZ,
    ];
  if (settings.gridColor !== undefined) {
    if (
      !Number.isInteger(settings.gridColor) ||
      settings.gridColor < 0 ||
      settings.gridColor > 0xffffff
    )
      throw new LayoutTomlError(
        'LAYOUT_INVALID_COLOR',
        'gridColor must be a 24-bit integer.'
      );
    output.grid_color = colorFromParts(
      (settings.gridColor >> 16) & 255,
      (settings.gridColor >> 8) & 255,
      settings.gridColor & 255
    );
  }
  if (settings.gridAlpha !== undefined) output.grid_alpha = settings.gridAlpha;
  if (settings.snap !== undefined) output.snap = !!settings.snap;
  if (settings.zoomFactor !== undefined) output.zoom = settings.zoomFactor;
  if (settings.windowMask !== undefined)
    output.window_mask = !!settings.windowMask;
  if (settings.selectedLayer !== undefined)
    output.selected_layer = String(settings.selectedLayer);
  if (
    settings.selectedLayer &&
    layerNames &&
    !layerNames.includes(String(settings.selectedLayer))
  )
    output.selected_layer_unresolved = true;
  if (settings.gameEditorMode !== undefined)
    output.mode = settings.gameEditorMode;
  return output;
};

const decompileVariable = (entry, hasName) => {
  const variable = { ...entry };
  const name = hasName ? variable.name : undefined;
  if (hasName) delete variable.name;
  assertKnownFields(
    variable,
    ['type', 'value', 'values', 'folded', 'persistentUuid', 'children'],
    'variable'
  );
  const output = {};
  if (hasName) output.name = String(name);
  output.type = variable.type;
  if (variable.value !== undefined) output.value = variable.value;
  if (variable.values && variable.values.length)
    output.values = variable.values.slice();
  if (variable.folded) output.folded = true;
  if (variable.persistentUuid) output.id = variable.persistentUuid;
  if (variable.children && variable.children.length) {
    output.children =
      variable.type === 'array'
        ? variable.children.map(child => decompileVariable(child, false))
        : variable.children
            .slice()
            .sort((left, right) =>
              left.name < right.name ? -1 : left.name > right.name ? 1 : 0
            )
            .map(child => decompileVariable(child, true));
  }
  return output;
};

const propertyArrayToMap = (properties, expectedType) => {
  const result = {};
  (properties || []).forEach(property => {
    assertKnownFields(property, ['name', 'value'], 'instance property');
    const name = String(property.name);
    if (Object.prototype.hasOwnProperty.call(result, name))
      throw new LayoutTomlError(
        'LAYOUT_INVALID_INSTANCE_PROPERTY',
        `Duplicate ${expectedType} instance property ${name}.`
      );
    if (
      expectedType === 'number' &&
      (typeof property.value !== 'number' || !Number.isFinite(property.value))
    )
      throw new LayoutTomlError(
        'LAYOUT_INVALID_INSTANCE_PROPERTY',
        `Instance property ${name} must be a finite number.`
      );
    if (expectedType === 'string' && typeof property.value !== 'string')
      throw new LayoutTomlError(
        'LAYOUT_INVALID_INSTANCE_PROPERTY',
        `Instance property ${name} must be a string.`
      );
    result[name] = property.value;
  });
  return result;
};

const mergeInstancePropertyMaps = (numberProperties, stringProperties) => {
  Object.keys(numberProperties).forEach(name => {
    if (Object.prototype.hasOwnProperty.call(stringProperties, name))
      throw new LayoutTomlError(
        'LAYOUT_DUPLICATE_INSTANCE_PROPERTY',
        `Instance property ${name} occurs in both numberProperties and stringProperties.`
      );
  });
  return { ...numberProperties, ...stringProperties };
};

const decompileInstance = (instance, layerId, context) => {
  assertKnownFields(
    instance,
    [
      'name',
      'x',
      'y',
      'z',
      'angle',
      'rotationX',
      'rotationY',
      'zOrder',
      'opacity',
      'flippedX',
      'flippedY',
      'flippedZ',
      'layer',
      'customSize',
      'width',
      'height',
      'depth',
      'locked',
      'sealed',
      'hidden',
      'keepRatio',
      'persistentUuid',
      'numberProperties',
      'stringProperties',
      'initialVariables',
      'behaviorOverridings',
    ],
    'instance'
  );
  [
    'name',
    'x',
    'y',
    'angle',
    'zOrder',
    'layer',
    'customSize',
    'width',
    'height',
    'persistentUuid',
    'numberProperties',
    'stringProperties',
    'initialVariables',
  ].forEach(field => {
    if (instance[field] === undefined)
      throw new LayoutTomlError(
        'LAYOUT_UNSUPPORTED_FIELD',
        `Serialized instance is missing required field ${field}.`
      );
  });
  if (!UUID_V4.test(instance.persistentUuid || ''))
    throw new LayoutTomlError(
      'LAYOUT_INVALID_UUID',
      `Instance ${instance.name || ''} has no canonical UUIDv4.`
    );
  const output = {
    id: instance.persistentUuid,
    object: String(instance.name),
    layer: layerId,
    at:
      instance.z !== undefined && instance.z !== 0
        ? [instance.x || 0, instance.y || 0, instance.z]
        : [instance.x || 0, instance.y || 0],
  };
  if (context.objectNames && !context.objectNames.includes(instance.name))
    output.unresolved = true;
  if ((instance.rotationX || 0) !== 0 || (instance.rotationY || 0) !== 0)
    output.rotation = [
      instance.rotationX || 0,
      instance.rotationY || 0,
      instance.angle || 0,
    ];
  else if ((instance.angle || 0) !== 0) output.rotation = instance.angle;
  if ((instance.zOrder || 0) !== 0) output.z_order = instance.zOrder;
  if (instance.customSize)
    output.size = [instance.width || 0, instance.height || 0];
  else if ((instance.width || 0) !== 0 || (instance.height || 0) !== 0)
    output.auto_size = [instance.width || 0, instance.height || 0];
  if (instance.depth !== undefined) output.depth = instance.depth;
  if (instance.opacity !== undefined && instance.opacity !== 255)
    output.opacity = instance.opacity;
  const flip = ['X', 'Y', 'Z']
    .filter(axis => instance[`flipped${axis}`])
    .map(axis => axis.toLowerCase());
  if (flip.length) output.flip = flip;
  if (instance.locked) output.locked = true;
  if (instance.sealed) output.sealed = true;
  if (instance.hidden) output.hidden = true;
  if (instance.keepRatio !== true) output.keep_ratio = false;
  const properties = mergeInstancePropertyMaps(
    propertyArrayToMap(instance.numberProperties, 'number'),
    propertyArrayToMap(instance.stringProperties, 'string')
  );
  if (Object.keys(properties).length)
    output.properties = sortedObject(properties);
  return output;
};

const decompileBehavior = (override, instance, context) => {
  const expectedBehaviorType =
    context.behaviorTypesByObject &&
    context.behaviorTypesByObject[instance.name] &&
    context.behaviorTypesByObject[instance.name][override.name];
  if (!expectedBehaviorType)
    throw new LayoutTomlError(
      'LAYOUT_UNKNOWN_BEHAVIOR',
      `Behavior ${String(override.name || '')} is not attached to ${String(
        instance.name || ''
      )}.`
    );
  if (override.type !== expectedBehaviorType)
    throw new LayoutTomlError(
      'LAYOUT_BEHAVIOR_TYPE_MISMATCH',
      `Behavior ${String(override.name || '')} has type ${String(
        override.type || ''
      )}; expected ${expectedBehaviorType}.`
    );
  const metadata = new Set([
    'type',
    'name',
    'isFolded',
    'isMuted',
    'isInheritedFromObjectType',
    'quickCustomizationVisibility',
    'propertiesQuickCustomizationVisibilities',
  ]);
  const properties = Object.keys(override)
    .filter(key => !metadata.has(key))
    .reduce((result, key) => {
      result[key] = override[key];
      return result;
    }, {});
  const output = {
    instance: instance.persistentUuid,
    name: override.name,
  };
  if (Object.keys(properties).length)
    output.properties = canonicalLiteral(properties);
  if (override.isFolded) output.folded = true;
  if (override.isMuted) output.muted = true;
  if (override.isInheritedFromObjectType) output.inherited = true;
  if (
    override.quickCustomizationVisibility &&
    override.quickCustomizationVisibility !== 'default'
  )
    output.quick = override.quickCustomizationVisibility;
  if (
    override.propertiesQuickCustomizationVisibilities &&
    Object.keys(override.propertiesQuickCustomizationVisibilities).length
  )
    output.property_visibility = sortedObject(
      override.propertiesQuickCustomizationVisibilities
    );
  return output;
};

const decompileCamera = camera => {
  assertKnownFields(
    camera,
    [
      'defaultSize',
      'width',
      'height',
      'defaultViewport',
      'viewportLeft',
      'viewportTop',
      'viewportRight',
      'viewportBottom',
    ],
    'camera'
  );
  [
    'defaultSize',
    'width',
    'height',
    'defaultViewport',
    'viewportLeft',
    'viewportTop',
    'viewportRight',
    'viewportBottom',
  ].forEach(field => {
    if (camera[field] === undefined)
      throw new LayoutTomlError(
        'LAYOUT_UNSUPPORTED_FIELD',
        `Serialized camera is missing required field ${field}.`
      );
  });
  const sizeValues = [camera.width || 0, camera.height || 0];
  const viewportValues = [
    camera.viewportLeft || 0,
    camera.viewportTop || 0,
    camera.viewportRight === undefined ? 1 : camera.viewportRight,
    camera.viewportBottom === undefined ? 1 : camera.viewportBottom,
  ];
  return {
    size: camera.defaultSize
      ? sizeValues[0] === 0 && sizeValues[1] === 0
        ? 'default'
        : { default: sizeValues }
      : sizeValues,
    viewport: camera.defaultViewport
      ? viewportValues.join(',') === '0,0,1,1'
        ? 'default'
        : { default: viewportValues }
      : viewportValues,
  };
};

const decompileEffect = (effect, layerId) => {
  assertKnownFields(
    effect,
    [
      'name',
      'effectType',
      'folded',
      'disabled',
      'doubleParameters',
      'stringParameters',
      'booleanParameters',
    ],
    'effect'
  );
  const output = {
    layer: layerId,
    name: String(effect.name),
    type: String(effect.effectType),
  };
  if (effect.folded) output.folded = true;
  if (effect.disabled) output.enabled = false;
  const parameters = {};
  [
    ['number', effect.doubleParameters || {}],
    ['string', effect.stringParameters || {}],
    ['boolean', effect.booleanParameters || {}],
  ].forEach(([type, values]) => {
    if (!isPlainObject(values))
      throw new LayoutTomlError(
        'LAYOUT_INVALID_EFFECT_PARAMETER',
        `Effect ${String(
          effect.name || ''
        )} ${type} parameters must be an object.`
      );
    Object.keys(values).forEach(name => {
      if (
        EFFECT_STRUCTURAL_FIELDS.includes(name) ||
        RETIRED_EFFECT_FIELDS.has(name)
      )
        throw new LayoutTomlError(
          'LAYOUT_EFFECT_PARAMETER_COLLISION',
          `Effect parameter ${name} collides with a reserved effect field.`
        );
      if (Object.prototype.hasOwnProperty.call(parameters, name))
        throw new LayoutTomlError(
          'LAYOUT_DUPLICATE_EFFECT_PARAMETER',
          `Effect parameter ${name} occurs in more than one typed parameter map.`
        );
      parameters[name] = values[name];
    });
  });
  Object.keys(sortedObject(parameters)).forEach(name => {
    output[name] = parameters[name];
  });
  return output;
};

const slugifyLayerId = value =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'base';

const makeLayerIds = layerRecords => {
  const used = new Set();
  const ids = new Map();
  layerRecords.forEach(layer => {
    const base = slugifyLayerId(layer.name);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    ids.set(layer.name, id);
  });
  return ids;
};

const decompileLayer = (layer, id, external) => {
  const output = { id, name: String(layer.name || '') };
  if (external) return output;
  assertKnownFields(
    layer,
    [
      'name',
      'renderingType',
      'cameraType',
      'defaultCameraBehavior',
      'visibility',
      'isLocked',
      'isLightingLayer',
      'followBaseLayerCamera',
      'ambientLightColorR',
      'ambientLightColorG',
      'ambientLightColorB',
      'camera3DNearPlaneDistance',
      'camera3DFarPlaneDistance',
      'camera3DFieldOfView',
      'camera2DPlaneMaxDrawingDistance',
      'cameras',
      'effects',
    ],
    'layer'
  );
  if (layer.renderingType) output.rendering = layer.renderingType;
  if (layer.cameraType) output.camera_type = layer.cameraType;
  if (
    layer.defaultCameraBehavior &&
    layer.defaultCameraBehavior !== 'top-left-anchored-if-never-moved'
  )
    output.camera_behavior = layer.defaultCameraBehavior;
  if (layer.visibility === false) output.visible = false;
  if (layer.isLocked) output.locked = true;
  if (layer.isLightingLayer) output.lighting = true;
  if (layer.followBaseLayerCamera) output.follow_base_camera = true;
  const ambient = colorFromParts(
    layer.ambientLightColorR === undefined ? 200 : layer.ambientLightColorR,
    layer.ambientLightColorG === undefined ? 200 : layer.ambientLightColorG,
    layer.ambientLightColorB === undefined ? 200 : layer.ambientLightColorB
  );
  if (ambient !== '#C8C8C8') output.ambient = ambient;
  if (
    layer.camera3DNearPlaneDistance !== undefined &&
    layer.camera3DNearPlaneDistance !== 3
  )
    output.near = layer.camera3DNearPlaneDistance;
  if (
    layer.camera3DFarPlaneDistance !== undefined &&
    layer.camera3DFarPlaneDistance !== 10000
  )
    output.far = layer.camera3DFarPlaneDistance;
  if (
    layer.camera3DFieldOfView !== undefined &&
    layer.camera3DFieldOfView !== 45
  )
    output.fov = layer.camera3DFieldOfView;
  if (
    layer.camera2DPlaneMaxDrawingDistance !== undefined &&
    layer.camera2DPlaneMaxDrawingDistance !== 5000
  )
    output.max_2d_distance = layer.camera2DPlaneMaxDrawingDistance;
  if (layer.cameras && layer.cameras.length)
    output.cameras = layer.cameras.map(decompileCamera);
  return output;
};

const tomlKey = key =>
  /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);

const tomlValue = value => {
  value = canonicalLiteral(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number')
    return Object.is(value, -0) ? '0' : String(value);
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map(tomlValue).join(', ')}]`;
  return `{ ${Object.entries(value)
    .map(([key, item]) => `${tomlKey(key)} = ${tomlValue(item)}`)
    .join(', ')} }`;
};

const emitTable = (lines, header, record) => {
  lines.push(header);
  Object.keys(record).forEach(key =>
    lines.push(`${tomlKey(key)} = ${tomlValue(record[key])}`)
  );
  lines.push('');
};

const serializeLayoutDocument = document => {
  const lines = [];
  emitTable(lines, '[layout]', document.layout);
  if (document.editor) emitTable(lines, '[editor]', document.editor);
  (document.layers || []).forEach(record =>
    emitTable(lines, '[[layers]]', record)
  );
  (document.effects || []).forEach(record =>
    emitTable(lines, '[[effects]]', record)
  );
  (document.instances || []).forEach(record =>
    emitTable(lines, '[[instances]]', record)
  );
  (document.variables || []).forEach(record =>
    emitTable(lines, '[[variables]]', record)
  );
  (document.behaviors || []).forEach(record =>
    emitTable(lines, '[[behaviors]]', record)
  );
  return `${lines.join('\n').trimEnd()}\n`;
};

export const compileLayoutDocument = (
  document: Object,
  context: LayoutTomlContext
): Object => compileLayoutToml(serializeLayoutDocument(document), context);

const standaloneLayoutSourceFromEmbeddedSettings = (source: string): string => {
  let insideLayout = false;
  return source
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => {
      const header = line.match(
        /^\s*(\[\[?)([A-Za-z0-9_.-]+)(\]\]?)\s*(?:#.*)?$/
      );
      if (header) {
        insideLayout =
          header[2] === 'layout' || header[2].startsWith('layout.');
        if (!insideLayout) return '';
        const standaloneName =
          header[2] === 'layout' ? 'layout' : header[2].slice('layout.'.length);
        return line.replace(header[2], standaloneName);
      }
      return insideLayout ? line : '';
    })
    .join('\n');
};

export const compileEmbeddedLayoutToml = (
  ownerSettingsSource: string,
  context: LayoutTomlContext
): Object =>
  compileLayoutToml(
    standaloneLayoutSourceFromEmbeddedSettings(ownerSettingsSource),
    context
  );

export const decompileLayoutToml = (
  layout: Object,
  context: LayoutTomlContext
): string => {
  const kind = context.kind;
  const scene = kind === 'scene';
  const prefab = kind === 'prefab' || kind === 'prefab-variant';
  const topFields = scene
    ? ['r', 'v', 'b', 'uiSettings', 'layers', 'instances']
    : prefab
    ? [
        'areaMinX',
        'areaMinY',
        'areaMinZ',
        'areaMaxX',
        'areaMaxY',
        'areaMaxZ',
        'editionSettings',
        'layers',
        'instances',
      ]
    : ['editionSettings', 'instances'];
  assertKnownFields(layout, topFields, `${kind} layout`);
  const document = { layout: { version: LAYOUT_TOML_VERSION } };
  if (scene)
    document.layout.background = colorFromParts(layout.r, layout.v, layout.b);
  if (prefab)
    document.layout.bounds = {
      min: [layout.areaMinX, layout.areaMinY, layout.areaMinZ],
      max: [layout.areaMaxX, layout.areaMaxY, layout.areaMaxZ],
    };
  const instances = layout.instances || [];
  const layerRecords =
    kind === 'external'
      ? Array.from(
          new Set(instances.map(instance => instance.layer || ''))
        ).map(name => ({ name }))
      : layout.layers || [];
  const layerIds = makeLayerIds(layerRecords);
  const editor = decompileEditor(
    layout[scene ? 'uiSettings' : 'editionSettings'],
    kind === 'external' && context.layerNames
      ? context.layerNames
      : layerRecords.map(layer => String(layer.name || ''))
  );
  if (editor) document.editor = editor;
  const usedInstanceUuids = context.usedInstanceUuids || new Set();
  instances.forEach(instance => {
    const uuid = instance.persistentUuid || '';
    if (!UUID_V4.test(uuid))
      throw new LayoutTomlError(
        'LAYOUT_INVALID_UUID',
        `Instance ${String(instance.name || '')} has no canonical UUIDv4.`
      );
    if (usedInstanceUuids.has(uuid))
      throw new LayoutTomlError(
        'LAYOUT_DUPLICATE_UUID',
        `Duplicate instance UUID ${uuid}.`
      );
    usedInstanceUuids.add(uuid);
  });
  if (kind !== 'external') {
    const names = new Set(layerRecords.map(layer => String(layer.name || '')));
    instances.forEach(instance => {
      if (!names.has(String(instance.layer || '')))
        throw new LayoutTomlError(
          'LAYOUT_UNKNOWN_LAYER',
          `Instance ${String(
            instance.name || ''
          )} references missing layer ${String(instance.layer || '')}.`
        );
    });
  }
  document.layers = layerRecords.map(layer =>
    decompileLayer(layer, layerIds.get(layer.name), kind === 'external')
  );
  document.effects = [];
  if (kind !== 'external')
    layerRecords.forEach(layer =>
      (layer.effects || []).forEach(effect =>
        document.effects.push(decompileEffect(effect, layerIds.get(layer.name)))
      )
    );
  document.instances = instances.map(instance =>
    decompileInstance(instance, layerIds.get(instance.layer || ''), context)
  );
  document.variables = [];
  document.behaviors = [];
  instances.forEach(instance => {
    (instance.initialVariables || []).forEach(variable =>
      document.variables.push({
        instance: instance.persistentUuid,
        ...decompileVariable(variable, true),
      })
    );
    (instance.behaviorOverridings || []).forEach(override =>
      document.behaviors.push(decompileBehavior(override, instance, context))
    );
  });
  const source = serializeLayoutDocument(document);
  compileLayoutToml(source, {
    ...context,
    usedInstanceUuids: new Set(),
  });
  return source;
};

export const decompileLayoutDocument = (
  layout: Object,
  context: LayoutTomlContext
): Object =>
  parseLayoutToml(decompileLayoutToml(layout, context), context.fileUri);

export const decompileEmbeddedLayoutToml = (
  layout: Object,
  context: LayoutTomlContext
): string =>
  decompileLayoutToml(layout, context)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line =>
      line.replace(
        /^(\s*\[\[?)(editor|layers|effects|instances|variables|behaviors)(\]\]?\s*(?:#.*)?)$/,
        '$1layout.$2$3'
      )
    )
    .join('\n')
    .trimEnd();

export const formatLayoutToml = (
  source: string,
  context: LayoutTomlContext
): string => {
  const isolatedContext = { ...context, usedInstanceUuids: new Set() };
  return decompileLayoutToml(compileLayoutToml(source, isolatedContext), {
    ...context,
    usedInstanceUuids: new Set(),
  });
};

export const normalizeLayoutFragmentForToml = (
  layout: Object,
  context: LayoutTomlContext
): Object =>
  compileLayoutToml(
    decompileLayoutToml(layout, {
      ...context,
      usedInstanceUuids: new Set(),
    }),
    { ...context, usedInstanceUuids: new Set() }
  );

export const areLayoutFragmentsEquivalent = (
  left: Object,
  right: Object,
  context: LayoutTomlContext
): boolean =>
  JSON.stringify(
    canonicalLiteral(normalizeLayoutFragmentForToml(left, context))
  ) ===
  JSON.stringify(
    canonicalLiteral(normalizeLayoutFragmentForToml(right, context))
  );
