// @noflow

export type LayoutDslKind = 'scene' | 'prefab' | 'prefab-variant' | 'external';

type Location = { line: number, column: number, offset: number };
type Attribute = {
  name: string,
  value: mixed,
  bare: boolean,
  location: Location,
};
type Element = {
  name: string,
  attributes: Array<Attribute>,
  children: Array<Element>,
  selfClosing: boolean,
  location: Location,
};

export type LayoutDslContext = {
  kind: LayoutDslKind,
  fileUri?: string,
  objectNames?: Array<string>,
  layerNames?: Array<string>,
  behaviorTypesByObject?: { [string]: { [string]: string } },
  instancePropertyTypesByObject?: {
    [string]: { [string]: 'number' | 'string' },
  },
  effectTypes?: Array<string>,
  effectParameterTypesByType?: {
    [string]: { [string]: 'number' | 'string' | 'boolean' },
  },
  usedInstanceUuids?: Set<string>,
};

export const LAYOUT_DSL_VERSION = 1;

const STRUCTURAL_TAGS = new Set([
  'layout',
  'bounds',
  'editor',
  'layer',
  'camera',
  'effect',
  'object',
  'properties',
  'variables',
  'var',
  'override',
]);
const SAFE_TAG = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ATTRIBUTE_NAME = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const NUMBER = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?$/;
const COLOR = /^#[0-9A-F]{6}$/;

export class LayoutDslError extends Error {
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
    this.name = 'LayoutDslError';
    this.code = code;
    this.fileUri = fileUri || null;
    this.line = line;
    this.column = column;
  }
}

const fail = (code, message, elementOrLocation, fileUri): empty => {
  const location =
    elementOrLocation && elementOrLocation.location
      ? elementOrLocation.location
      : elementOrLocation;
  throw new LayoutDslError(code, message, location, fileUri);
};

const clone = value => JSON.parse(JSON.stringify(value));
const sortedObject = value =>
  Object.keys(value || {})
    .sort()
    .reduce((result, key) => {
      result[key] = value[key];
      return result;
    }, {});

class Parser {
  source: string;
  fileUri: ?string;
  offset: number = 0;
  line: number = 1;
  column: number = 1;

  constructor(source: string, fileUri?: string) {
    this.source = source.replace(/^\uFEFF/, '');
    this.fileUri = fileUri || null;
  }

  location(): Location {
    return { line: this.line, column: this.column, offset: this.offset };
  }

  eof() {
    return this.offset >= this.source.length;
  }

  peek(count = 1) {
    return this.source.slice(this.offset, this.offset + count);
  }

  advance() {
    const char = this.source[this.offset++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  skipWhitespace() {
    while (!this.eof() && /\s/.test(this.peek())) this.advance();
  }

  error(code, message, location) {
    fail(code, message, location || this.location(), this.fileUri);
  }

  expect(text) {
    if (this.peek(text.length) !== text) {
      this.error('LAYOUT_SYNTAX', `Expected ${JSON.stringify(text)}.`);
    }
    for (let index = 0; index < text.length; index++) this.advance();
  }

  readName(attribute = false) {
    const start = this.location();
    let value = '';
    while (!this.eof() && /[A-Za-z0-9_-]/.test(this.peek())) {
      value += this.advance();
    }
    const matcher = attribute ? ATTRIBUTE_NAME : SAFE_TAG;
    if (!matcher.test(value)) {
      this.error(
        'LAYOUT_SYNTAX',
        `Invalid ${attribute ? 'attribute' : 'tag'} name.`,
        start
      );
    }
    return value;
  }

  readQuotedString() {
    const start = this.offset;
    this.expect('"');
    let escaped = false;
    while (!this.eof()) {
      const char = this.advance();
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') {
        const raw = this.source.slice(start, this.offset);
        try {
          return JSON.parse(raw);
        } catch (error) {
          this.error('LAYOUT_INVALID_STRING', 'Invalid JSON string escape.');
        }
      } else if (char.charCodeAt(0) < 32) {
        this.error(
          'LAYOUT_INVALID_STRING',
          'Control characters must be escaped.'
        );
      }
    }
    this.error('LAYOUT_SYNTAX', 'Unterminated string.');
  }

  readBalancedLiteral() {
    const start = this.offset;
    const opening = this.peek();
    const closing = opening === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;
    while (!this.eof()) {
      const char = this.advance();
      if (inString) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') inString = false;
      } else if (char === '"') inString = true;
      else if (char === opening) depth++;
      else if (char === closing) {
        depth--;
        if (depth === 0) break;
      } else if ((char === '}' || char === ']') && char !== closing) {
        this.error(
          'LAYOUT_INVALID_LITERAL',
          'Mismatched typed-data delimiter.'
        );
      }
    }
    if (depth !== 0 || inString) {
      this.error('LAYOUT_INVALID_LITERAL', 'Unterminated typed-data literal.');
    }
    const raw = this.source.slice(start, this.offset);
    try {
      return JSON.parse(raw);
    } catch (error) {
      this.error(
        'LAYOUT_INVALID_LITERAL',
        'Typed data must be strict JSON without trailing commas.'
      );
    }
  }

  readValue() {
    if (this.peek() === '"') return this.readQuotedString();
    if (this.peek() === '{' || this.peek() === '[')
      return this.readBalancedLiteral();
    let raw = '';
    let parentheses = 0;
    while (!this.eof()) {
      const char = this.peek();
      if (char === '(') parentheses++;
      if (char === ')') parentheses--;
      if (parentheses < 0)
        this.error('LAYOUT_SYNTAX', 'Unexpected closing parenthesis.');
      if (parentheses === 0 && (/\s/.test(char) || char === '>')) break;
      if (parentheses === 0 && char === '/' && this.peek(2) === '/>') break;
      raw += this.advance();
    }
    if (!raw || parentheses !== 0)
      this.error('LAYOUT_SYNTAX', 'Invalid attribute value.');
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    if (raw === 'null') return null;
    if (NUMBER.test(raw)) return Number(raw);
    return raw;
  }

  parseElement(): Element {
    const location = this.location();
    this.expect('<');
    if (this.peek() === '/' || this.peek() === '!' || this.peek() === '?') {
      this.error('LAYOUT_SYNTAX', 'Unexpected markup construct.', location);
    }
    const name = this.readName();
    const attributes = [];
    const seenAttributes = new Set();
    while (true) {
      this.skipWhitespace();
      if (this.peek(2) === '/>') {
        this.expect('/>');
        return { name, attributes, children: [], selfClosing: true, location };
      }
      if (this.peek() === '>') {
        this.advance();
        break;
      }
      const attributeLocation = this.location();
      const attributeName = this.readName(true);
      if (seenAttributes.has(attributeName)) {
        this.error(
          'LAYOUT_DUPLICATE_ATTRIBUTE',
          `Duplicate attribute ${attributeName}.`,
          attributeLocation
        );
      }
      seenAttributes.add(attributeName);
      this.skipWhitespace();
      let value = true;
      let bare = true;
      if (this.peek() === '=') {
        this.advance();
        value = this.readValue();
        bare = false;
      }
      attributes.push({
        name: attributeName,
        value,
        bare,
        location: attributeLocation,
      });
    }
    const children = [];
    while (true) {
      this.skipWhitespace();
      if (this.peek(2) === '</') {
        this.expect('</');
        const closingName = this.readName();
        this.skipWhitespace();
        this.expect('>');
        if (closingName !== name) {
          this.error(
            'LAYOUT_MISMATCHED_TAG',
            `Expected </${name}>, got </${closingName}>.`
          );
        }
        return { name, attributes, children, selfClosing: false, location };
      }
      if (this.eof()) this.error('LAYOUT_SYNTAX', `Missing </${name}>.`);
      if (this.peek() !== '<') {
        this.error('LAYOUT_TEXT_NODE', 'Text nodes are forbidden.');
      }
      children.push(this.parseElement());
    }
  }

  parse(): Element {
    this.skipWhitespace();
    if (this.eof()) this.error('LAYOUT_EMPTY', 'Layout source is empty.');
    const root = this.parseElement();
    this.skipWhitespace();
    if (!this.eof())
      this.error(
        'LAYOUT_MULTIPLE_ROOTS',
        'A layout has exactly one root element.'
      );
    return root;
  }
}

export const parseLayoutDsl = (source: string, fileUri?: string): Element => {
  if (typeof source !== 'string') {
    throw new LayoutDslError(
      'LAYOUT_INVALID_SOURCE',
      'Layout source must be a string.',
      undefined,
      fileUri
    );
  }
  return new Parser(source, fileUri).parse();
};

const attrs = element =>
  element.attributes.reduce((result, attribute) => {
    result[attribute.name] = attribute.value;
    return result;
  }, {});

const validateAttributes = (
  element,
  allowed,
  required,
  fileUri,
  allowedBare = []
) => {
  const values = attrs(element);
  element.attributes.forEach(attribute => {
    if (attribute.bare && !allowedBare.includes(attribute.name)) {
      fail(
        'LAYOUT_INVALID_BARE_ATTRIBUTE',
        `${attribute.name} requires an explicit value.`,
        attribute.location,
        fileUri
      );
    }
  });
  Object.keys(values).forEach(name => {
    if (!allowed.includes(name))
      fail(
        'LAYOUT_UNKNOWN_ATTRIBUTE',
        `Unknown ${element.name} attribute ${name}.`,
        element,
        fileUri
      );
  });
  required.forEach(name => {
    if (!Object.prototype.hasOwnProperty.call(values, name))
      fail(
        'LAYOUT_MISSING_ATTRIBUTE',
        `<${element.name}> requires ${name}.`,
        element,
        fileUri
      );
  });
  return values;
};

const expectBoolean = (value, label, element, fileUri) => {
  if (typeof value !== 'boolean')
    fail(
      'LAYOUT_INVALID_BOOLEAN',
      `${label} must be true or false.`,
      element,
      fileUri
    );
  return value;
};
const expectNumber = (value, label, element, fileUri) => {
  if (typeof value !== 'number' || !Number.isFinite(value))
    fail(
      'LAYOUT_INVALID_NUMBER',
      `${label} must be a finite number.`,
      element,
      fileUri
    );
  return Object.is(value, -0) ? 0 : value;
};
const expectInteger = (value, label, element, fileUri) => {
  const number = expectNumber(value, label, element, fileUri);
  if (!Number.isInteger(number))
    fail(
      'LAYOUT_INVALID_INTEGER',
      `${label} must be an integer.`,
      element,
      fileUri
    );
  return number;
};
const expectString = (value, label, element, fileUri) => {
  if (typeof value !== 'string')
    fail(
      'LAYOUT_INVALID_STRING',
      `${label} must be a string.`,
      element,
      fileUri
    );
  if (value !== value.normalize('NFC'))
    fail(
      'LAYOUT_INVALID_STRING',
      `${label} must use Unicode NFC.`,
      element,
      fileUri
    );
  return value;
};
const expectEnum = (value, allowed, label, element, fileUri) => {
  if (!allowed.includes(value))
    fail(
      'LAYOUT_INVALID_ENUM',
      `${label} must be one of ${allowed.map(String).join(', ')}.`,
      element,
      fileUri
    );
  return value;
};
const tuple = (value, lengths, label, element, fileUri) => {
  if (typeof value !== 'string')
    fail(
      'LAYOUT_INVALID_TUPLE',
      `${label} must be a comma-separated tuple.`,
      element,
      fileUri
    );
  const parts = value.split(',');
  if (!lengths.includes(parts.length) || parts.some(part => !NUMBER.test(part)))
    fail(
      'LAYOUT_INVALID_TUPLE',
      `${label} has an invalid shape.`,
      element,
      fileUri
    );
  return parts.map(Number).map(number => (Object.is(number, -0) ? 0 : number));
};
const color = (value, label, element, fileUri) => {
  if (typeof value !== 'string' || !COLOR.test(value))
    fail('LAYOUT_INVALID_COLOR', `${label} must be #RRGGBB.`, element, fileUri);
  return value.toUpperCase();
};
const colorParts = value =>
  [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16));
const serializedColorParts = (value, label, element, fileUri) => {
  if (typeof value === 'string' && COLOR.test(value)) {
    return colorParts(value.toUpperCase());
  }
  if (typeof value === 'string' && /^rgb\(.+\)$/.test(value)) {
    return tuple(value.slice(4, -1), [3], label, element, fileUri);
  }
  fail(
    'LAYOUT_INVALID_COLOR',
    `${label} must be #RRGGBB or rgb(r,g,b).`,
    element,
    fileUri
  );
};
const colorFromParts = (r, g, b) => {
  const parts = [r, g, b];
  if (parts.some(value => typeof value !== 'number' || !Number.isFinite(value)))
    throw new LayoutDslError(
      'LAYOUT_INVALID_COLOR',
      'Serialized color components must be finite numbers.'
    );
  if (
    parts.some(value => !Number.isInteger(value) || value < 0 || value > 255)
  ) {
    return `rgb(${tupleText(parts)})`;
  }
  return `#${parts
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
};
const jsonObject = (value, label, element, fileUri) => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(
      'LAYOUT_INVALID_LITERAL',
      `${label} must be an object literal.`,
      element,
      fileUri
    );
  const validateLiteral = item => {
    if (typeof item === 'string' && item !== item.normalize('NFC'))
      fail(
        'LAYOUT_INVALID_STRING',
        `${label} strings must use Unicode NFC.`,
        element,
        fileUri
      );
    if (typeof item === 'number' && !Number.isFinite(item))
      fail(
        'LAYOUT_INVALID_NUMBER',
        `${label} numbers must be finite.`,
        element,
        fileUri
      );
    if (Array.isArray(item)) item.forEach(validateLiteral);
    else if (item && typeof item === 'object')
      Object.keys(item).forEach(key => {
        if (key !== key.normalize('NFC'))
          fail(
            'LAYOUT_INVALID_STRING',
            `${label} keys must use Unicode NFC.`,
            element,
            fileUri
          );
        validateLiteral(item[key]);
      });
  };
  validateLiteral(value);
  return value;
};
const requireSelfClosing = (element, fileUri) => {
  if (!element.selfClosing)
    fail(
      'LAYOUT_EXPECTED_EMPTY_ELEMENT',
      `<${element.name}> must use />.`,
      element,
      fileUri
    );
};
const requireContainer = (element, fileUri) => {
  if (element.selfClosing)
    fail(
      'LAYOUT_EXPECTED_CONTAINER',
      `<${element.name}> must use an explicit closing tag.`,
      element,
      fileUri
    );
};

const compileEditor = (element, fileUri) => {
  if (!element) return {};
  requireSelfClosing(element, fileUri);
  if (element.children.length)
    fail('LAYOUT_INVALID_CHILD', '<editor> must be empty.', element, fileUri);
  const a = validateAttributes(
    element,
    [
      'grid',
      'grid-type',
      'grid-size',
      'grid-offset',
      'grid-color',
      'grid-alpha',
      'snap',
      'zoom',
      'window-mask',
      'selected-layer',
      'selected-layer-unresolved',
      'mode',
    ],
    [],
    fileUri,
    ['selected-layer-unresolved']
  );
  const output = {};
  if (a.grid !== undefined)
    output.grid = expectBoolean(a.grid, 'editor grid', element, fileUri);
  if (a['grid-type'] !== undefined)
    output.gridType = expectEnum(
      a['grid-type'],
      ['rectangular', 'isometric'],
      'grid-type',
      element,
      fileUri
    );
  if (a['grid-size'] !== undefined) {
    const values = tuple(a['grid-size'], [3], 'grid-size', element, fileUri);
    if (values.some(value => value < 0))
      fail(
        'LAYOUT_INVALID_EDITOR',
        'grid-size components cannot be negative.',
        element,
        fileUri
      );
    [output.gridWidth, output.gridHeight, output.gridDepth] = values;
  }
  if (a['grid-offset'] !== undefined)
    [output.gridOffsetX, output.gridOffsetY, output.gridOffsetZ] = tuple(
      a['grid-offset'],
      [3],
      'grid-offset',
      element,
      fileUri
    );
  if (a['grid-color'] !== undefined) {
    const [r, g, b] = colorParts(
      color(a['grid-color'], 'grid-color', element, fileUri)
    );
    output.gridColor = r * 65536 + g * 256 + b;
  }
  if (a['grid-alpha'] !== undefined) {
    output.gridAlpha = expectNumber(
      a['grid-alpha'],
      'grid-alpha',
      element,
      fileUri
    );
    if (output.gridAlpha < 0 || output.gridAlpha > 1)
      fail(
        'LAYOUT_INVALID_EDITOR',
        'grid-alpha must be in [0,1].',
        element,
        fileUri
      );
  }
  if (a.snap !== undefined)
    output.snap = expectBoolean(a.snap, 'snap', element, fileUri);
  if (a.zoom !== undefined) {
    output.zoomFactor = expectNumber(a.zoom, 'zoom', element, fileUri);
    if (output.zoomFactor < 0.01)
      fail(
        'LAYOUT_INVALID_EDITOR',
        'zoom must be at least 0.01.',
        element,
        fileUri
      );
  }
  if (a['window-mask'] !== undefined)
    output.windowMask = expectBoolean(
      a['window-mask'],
      'window-mask',
      element,
      fileUri
    );
  if (a['selected-layer'] !== undefined)
    output.selectedLayer = expectString(
      a['selected-layer'],
      'selected-layer',
      element,
      fileUri
    );
  if (
    a['selected-layer-unresolved'] !== undefined &&
    expectBoolean(
      a['selected-layer-unresolved'],
      'selected-layer-unresolved',
      element,
      fileUri
    )
  )
    output.__selectedLayerUnresolved = true;
  if (a.mode !== undefined)
    output.gameEditorMode = expectEnum(
      a.mode,
      ['instances-editor', 'embedded-game'],
      'mode',
      element,
      fileUri
    );
  return output;
};

const compileCamera = (element, fileUri) => {
  requireSelfClosing(element, fileUri);
  if (element.children.length)
    fail('LAYOUT_INVALID_CHILD', '<camera> must be empty.', element, fileUri);
  const a = validateAttributes(
    element,
    ['size', 'viewport'],
    ['size', 'viewport'],
    fileUri
  );
  const size = String(a.size);
  let defaultSize;
  let width = 0;
  let height = 0;
  if (size === 'default') defaultSize = true;
  else if (/^default\(.+\)$/.test(size)) {
    defaultSize = true;
    [width, height] = tuple(
      size.slice(8, -1),
      [2],
      'camera size',
      element,
      fileUri
    );
  } else {
    const parts = size.split('x');
    if (parts.length !== 2 || parts.some(part => !NUMBER.test(part)))
      fail('LAYOUT_INVALID_CAMERA', 'Invalid camera size.', element, fileUri);
    defaultSize = false;
    [width, height] = parts.map(Number);
  }
  const viewport = String(a.viewport);
  let defaultViewport;
  let rectangle = [0, 0, 1, 1];
  if (viewport === 'default') defaultViewport = true;
  else if (/^default\(.+\)$/.test(viewport)) {
    defaultViewport = true;
    rectangle = tuple(
      viewport.slice(8, -1),
      [4],
      'camera viewport',
      element,
      fileUri
    );
  } else {
    defaultViewport = false;
    rectangle = tuple(viewport, [4], 'camera viewport', element, fileUri);
  }
  if (
    rectangle.some(value => value < 0 || value > 1) ||
    rectangle[0] > rectangle[2] ||
    rectangle[1] > rectangle[3]
  )
    fail(
      'LAYOUT_INVALID_CAMERA',
      'Viewport must be normalized and ordered.',
      element,
      fileUri
    );
  return {
    defaultSize,
    width,
    height,
    defaultViewport,
    viewportLeft: rectangle[0],
    viewportTop: rectangle[1],
    viewportRight: rectangle[2],
    viewportBottom: rectangle[3],
  };
};

const compileEffect = (element, fileUri, context) => {
  requireSelfClosing(element, fileUri);
  if (element.children.length)
    fail('LAYOUT_INVALID_CHILD', '<effect> must be empty.', element, fileUri);
  const a = validateAttributes(
    element,
    ['name', 'type', 'folded', 'enabled', 'numbers', 'strings', 'booleans'],
    ['name', 'type'],
    fileUri
  );
  const effectType = expectString(a.type, 'effect type', element, fileUri);
  if (context.effectTypes && !context.effectTypes.includes(effectType))
    fail(
      'LAYOUT_UNKNOWN_EFFECT_TYPE',
      `Effect type ${effectType} is not registered.`,
      element,
      fileUri
    );
  const numbers = jsonObject(
    a.numbers === undefined ? {} : a.numbers,
    'effect numbers',
    element,
    fileUri
  );
  const strings = jsonObject(
    a.strings === undefined ? {} : a.strings,
    'effect strings',
    element,
    fileUri
  );
  const booleans = jsonObject(
    a.booleans === undefined ? {} : a.booleans,
    'effect booleans',
    element,
    fileUri
  );
  Object.keys(numbers).forEach(key =>
    expectNumber(numbers[key], `effect number ${key}`, element, fileUri)
  );
  Object.keys(strings).forEach(key =>
    expectString(strings[key], `effect string ${key}`, element, fileUri)
  );
  Object.keys(booleans).forEach(key =>
    expectBoolean(booleans[key], `effect boolean ${key}`, element, fileUri)
  );
  const knownParameters =
    context.effectParameterTypesByType &&
    context.effectParameterTypesByType[effectType];
  if (knownParameters) {
    [['number', numbers], ['string', strings], ['boolean', booleans]].forEach(
      ([parameterType, values]) =>
        Object.keys(values).forEach(name => {
          if (knownParameters[name] !== parameterType)
            fail(
              'LAYOUT_INVALID_EFFECT_PARAMETER',
              `Effect parameter ${name} is not a ${parameterType} parameter of ${effectType}.`,
              element,
              fileUri
            );
        })
    );
  }
  const output = {
    name: expectString(a.name, 'effect name', element, fileUri),
    effectType,
    doubleParameters: sortedObject(numbers),
    stringParameters: sortedObject(strings),
    booleanParameters: sortedObject(booleans),
  };
  if (
    a.folded !== undefined &&
    expectBoolean(a.folded, 'effect folded', element, fileUri)
  )
    output.folded = true;
  if (
    a.enabled !== undefined &&
    !expectBoolean(a.enabled, 'effect enabled', element, fileUri)
  )
    output.disabled = true;
  return output;
};

const compileProperties = (element, objectName, context, fileUri) => {
  requireSelfClosing(element, fileUri);
  if (element.children.length)
    fail(
      'LAYOUT_INVALID_CHILD',
      '<properties> must be empty.',
      element,
      fileUri
    );
  const a = validateAttributes(element, ['numbers', 'strings'], [], fileUri);
  const numbers = jsonObject(
    a.numbers === undefined ? {} : a.numbers,
    'property numbers',
    element,
    fileUri
  );
  const strings = jsonObject(
    a.strings === undefined ? {} : a.strings,
    'property strings',
    element,
    fileUri
  );
  Object.keys(numbers).forEach(key =>
    expectNumber(numbers[key], `property ${key}`, element, fileUri)
  );
  Object.keys(strings).forEach(key =>
    expectString(strings[key], `property ${key}`, element, fileUri)
  );
  const knownProperties =
    context.instancePropertyTypesByObject &&
    context.instancePropertyTypesByObject[objectName];
  if (knownProperties) {
    Object.keys(numbers).forEach(name => {
      if (knownProperties[name] !== 'number')
        fail(
          'LAYOUT_INVALID_INSTANCE_PROPERTY',
          `Property ${name} is not a numeric property of ${objectName}.`,
          element,
          fileUri
        );
    });
    Object.keys(strings).forEach(name => {
      if (knownProperties[name] !== 'string')
        fail(
          'LAYOUT_INVALID_INSTANCE_PROPERTY',
          `Property ${name} is not a string property of ${objectName}.`,
          element,
          fileUri
        );
    });
  }
  return {
    numberProperties: Object.keys(numbers)
      .sort()
      .map(name => ({ name, value: numbers[name] })),
    stringProperties: Object.keys(strings)
      .sort()
      .map(name => ({ name, value: strings[name] })),
  };
};

const compileVariable = (element, parentType, fileUri) => {
  const a = validateAttributes(
    element,
    ['name', 'type', 'value', 'values', 'folded', 'id'],
    ['type'],
    fileUri
  );
  const type = expectEnum(
    a.type,
    ['string', 'enum', 'number', 'boolean', 'structure', 'array'],
    'variable type',
    element,
    fileUri
  );
  if (parentType === 'array' && a.name !== undefined)
    fail(
      'LAYOUT_INVALID_VARIABLE',
      'Array children cannot have names.',
      element,
      fileUri
    );
  if (parentType !== 'array' && a.name === undefined)
    fail(
      'LAYOUT_INVALID_VARIABLE',
      'Named variable requires name.',
      element,
      fileUri
    );
  const output = { type };
  if (
    a.folded !== undefined &&
    expectBoolean(a.folded, 'variable folded', element, fileUri)
  )
    output.folded = true;
  if (a.id !== undefined) {
    output.persistentUuid = expectString(a.id, 'variable id', element, fileUri);
    if (!UUID_V4.test(output.persistentUuid))
      fail(
        'LAYOUT_INVALID_UUID',
        'Variable id must be canonical UUIDv4.',
        element,
        fileUri
      );
  }
  if (type === 'structure' || type === 'array') {
    requireContainer(element, fileUri);
    if (a.value !== undefined || a.values !== undefined)
      fail(
        'LAYOUT_INVALID_VARIABLE',
        `${type} variables cannot have value or values.`,
        element,
        fileUri
      );
    if (type === 'structure') {
      const children = [];
      const childNames = new Set();
      element.children.forEach(child => {
        if (child.name !== 'var')
          fail(
            'LAYOUT_INVALID_CHILD',
            'Variable containers accept only <var>.',
            child,
            fileUri
          );
        const childAttrs = attrs(child);
        const name = expectString(
          childAttrs.name,
          'structure child name',
          child,
          fileUri
        );
        if (childNames.has(name))
          fail(
            'LAYOUT_DUPLICATE_VARIABLE',
            `Duplicate structure child ${name}.`,
            child,
            fileUri
          );
        childNames.add(name);
        children.push({
          name,
          ...compileVariable(child, 'structure', fileUri),
        });
      });
      output.children = children.sort((left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0
      );
    } else {
      output.children = element.children.map(child => {
        if (child.name !== 'var')
          fail(
            'LAYOUT_INVALID_CHILD',
            'Variable containers accept only <var>.',
            child,
            fileUri
          );
        return compileVariable(child, 'array', fileUri);
      });
    }
  } else {
    requireSelfClosing(element, fileUri);
    if (element.children.length)
      fail(
        'LAYOUT_INVALID_VARIABLE',
        'Primitive variables cannot have children.',
        element,
        fileUri
      );
    if (a.value === undefined)
      fail(
        'LAYOUT_MISSING_ATTRIBUTE',
        `Variable type ${type} requires value.`,
        element,
        fileUri
      );
    if (type === 'number')
      output.value = expectNumber(a.value, 'variable value', element, fileUri);
    else if (type === 'boolean')
      output.value = expectBoolean(a.value, 'variable value', element, fileUri);
    else
      output.value = expectString(a.value, 'variable value', element, fileUri);
    if (type === 'enum') {
      if (
        a.values !== undefined &&
        (!Array.isArray(a.values) ||
          a.values.some(value => typeof value !== 'string') ||
          new Set(a.values).size !== a.values.length)
      )
        fail(
          'LAYOUT_INVALID_VARIABLE',
          'Enum values must be a unique string array.',
          element,
          fileUri
        );
      const values = a.values === undefined ? [] : a.values;
      if (values.length) output.values = values;
      if (values.length && !values.includes(output.value))
        fail(
          'LAYOUT_INVALID_VARIABLE',
          'Enum value must occur in values.',
          element,
          fileUri
        );
    } else if (a.values !== undefined)
      fail(
        'LAYOUT_INVALID_VARIABLE',
        'values is allowed only for enum.',
        element,
        fileUri
      );
  }
  return output;
};

const compileOverride = (element, objectName, context, fileUri) => {
  requireSelfClosing(element, fileUri);
  if (element.children.length)
    fail('LAYOUT_INVALID_CHILD', '<override> must be empty.', element, fileUri);
  const a = validateAttributes(
    element,
    [
      'behavior',
      'data',
      'folded',
      'muted',
      'inherited',
      'quick',
      'property-visibility',
    ],
    ['behavior', 'data'],
    fileUri
  );
  const behaviorName = expectString(
    a.behavior,
    'behavior name',
    element,
    fileUri
  );
  const behaviorTypes =
    context.behaviorTypesByObject && context.behaviorTypesByObject[objectName];
  const type = behaviorTypes && behaviorTypes[behaviorName];
  if (!type)
    fail(
      'LAYOUT_UNKNOWN_BEHAVIOR',
      `Behavior ${behaviorName} is not attached to ${objectName}.`,
      element,
      fileUri
    );
  const data = jsonObject(a.data, 'override data', element, fileUri);
  const visibility =
    a['property-visibility'] === undefined
      ? {}
      : jsonObject(
          a['property-visibility'],
          'property-visibility',
          element,
          fileUri
        );
  Object.keys(visibility).forEach(key =>
    expectEnum(
      visibility[key],
      ['default', 'visible', 'hidden'],
      `property visibility ${key}`,
      element,
      fileUri
    )
  );
  const output = {
    ...clone(data),
    type: type || '',
    name: behaviorName,
  };
  if (
    a.folded !== undefined &&
    expectBoolean(a.folded, 'override folded', element, fileUri)
  )
    output.isFolded = true;
  if (
    a.muted !== undefined &&
    expectBoolean(a.muted, 'override muted', element, fileUri)
  )
    output.isMuted = true;
  if (
    a.inherited !== undefined &&
    expectBoolean(a.inherited, 'override inherited', element, fileUri)
  )
    output.isInheritedFromObjectType = true;
  if (a.quick !== undefined) {
    const quick = expectEnum(
      a.quick,
      ['default', 'visible', 'hidden'],
      'override quick',
      element,
      fileUri
    );
    if (quick !== 'default') output.quickCustomizationVisibility = quick;
  }
  if (Object.keys(visibility).length)
    output.propertiesQuickCustomizationVisibilities = sortedObject(visibility);
  return output;
};

const compileInstance = (element, layerName, context, fileUri) => {
  const isFallback = element.name === 'object';
  if (STRUCTURAL_TAGS.has(element.name) && !isFallback)
    fail(
      'LAYOUT_INVALID_CHILD',
      `<${element.name}> cannot be an instance here.`,
      element,
      fileUri
    );
  const allowed = [
    'id',
    'order',
    'at',
    'rotation',
    'z-order',
    'size',
    'depth',
    'opacity',
    'flip',
    'locked',
    'sealed',
    'keep-ratio',
  ];
  if (isFallback) allowed.unshift('of', 'unresolved');
  const a = validateAttributes(
    element,
    allowed,
    isFallback ? ['of', 'id', 'at'] : ['id', 'at'],
    fileUri,
    ['locked', 'sealed', 'unresolved']
  );
  const name = isFallback
    ? expectString(a.of, 'object name', element, fileUri)
    : element.name;
  const unresolved =
    a.unresolved !== undefined &&
    expectBoolean(a.unresolved, 'unresolved', element, fileUri);
  if (unresolved && !isFallback)
    fail(
      'LAYOUT_INVALID_INSTANCE',
      'unresolved is only valid on the fallback <object> tag.',
      element,
      fileUri
    );
  if (context.objectNames) {
    const resolves = context.objectNames.includes(name);
    if (!resolves && !unresolved)
      fail(
        'LAYOUT_UNKNOWN_OBJECT',
        `Object ${name} does not resolve in this layout.`,
        element,
        fileUri
      );
    if (resolves && unresolved)
      fail(
        'LAYOUT_INVALID_INSTANCE',
        `Object ${name} resolves in this layout and must not be marked unresolved.`,
        element,
        fileUri
      );
  }
  const uuid = expectString(a.id, 'instance id', element, fileUri);
  if (!UUID_V4.test(uuid))
    fail(
      'LAYOUT_INVALID_UUID',
      'Instance id must be a lowercase canonical UUIDv4.',
      element,
      fileUri
    );
  if (context.usedInstanceUuids && context.usedInstanceUuids.has(uuid))
    fail(
      'LAYOUT_DUPLICATE_UUID',
      `Duplicate instance UUID ${uuid}.`,
      element,
      fileUri
    );
  if (context.usedInstanceUuids) context.usedInstanceUuids.add(uuid);
  const position = tuple(a.at, [2, 3], 'instance at', element, fileUri);
  const rotation =
    a.rotation === undefined
      ? [0]
      : tuple(
          String(a.rotation),
          [1, 3],
          'instance rotation',
          element,
          fileUri
        );
  const output = {
    name,
    x: position[0],
    y: position[1],
    angle: rotation.length === 1 ? rotation[0] : rotation[2],
    zOrder:
      a['z-order'] === undefined
        ? 0
        : expectInteger(a['z-order'], 'z-order', element, fileUri),
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
  if (a.order !== undefined)
    output.__layoutOrder = expectInteger(a.order, 'order', element, fileUri);
  if (a.opacity !== undefined) {
    const opacity = expectInteger(a.opacity, 'opacity', element, fileUri);
    if (opacity < 0 || opacity > 255)
      fail(
        'LAYOUT_INVALID_INSTANCE',
        'opacity must be in [0,255].',
        element,
        fileUri
      );
    if (opacity !== 255) output.opacity = opacity;
  }
  if (a.depth !== undefined)
    output.depth = expectNumber(a.depth, 'depth', element, fileUri);
  if (a.size !== undefined && a.size !== 'auto') {
    const size = String(a.size);
    if (/^auto\(.+\)$/.test(size)) {
      [output.width, output.height] = tuple(
        size.slice(5, -1).replace('x', ','),
        [2],
        'instance size',
        element,
        fileUri
      );
    } else {
      const parts = size.split('x');
      if (parts.length !== 2 || parts.some(part => !NUMBER.test(part)))
        fail(
          'LAYOUT_INVALID_INSTANCE',
          'Invalid instance size.',
          element,
          fileUri
        );
      output.customSize = true;
      [output.width, output.height] = parts.map(Number);
    }
  }
  const flips =
    a.flip === undefined || a.flip === '' ? [] : String(a.flip).split(',');
  if (
    flips.some(axis => !['x', 'y', 'z'].includes(axis)) ||
    new Set(flips).size !== flips.length
  )
    fail(
      'LAYOUT_INVALID_INSTANCE',
      'flip must contain unique x, y, z axes.',
      element,
      fileUri
    );
  if (flips.includes('x')) output.flippedX = true;
  if (flips.includes('y')) output.flippedY = true;
  if (flips.includes('z')) output.flippedZ = true;
  if (
    a.locked !== undefined &&
    expectBoolean(a.locked, 'locked', element, fileUri)
  )
    output.locked = true;
  if (
    a.sealed !== undefined &&
    expectBoolean(a.sealed, 'sealed', element, fileUri)
  )
    output.sealed = true;
  if (a['keep-ratio'] === undefined) output.keepRatio = true;
  else {
    const keepRatio = expectBoolean(
      a['keep-ratio'],
      'keep-ratio',
      element,
      fileUri
    );
    if (keepRatio) output.keepRatio = true;
  }
  let propertiesSeen = false;
  let variablesSeen = false;
  const overrides = [];
  const overrideNames = new Set();
  element.children.forEach(child => {
    if (child.name === 'properties') {
      if (propertiesSeen)
        fail(
          'LAYOUT_DUPLICATE_CHILD',
          'Only one <properties> is allowed.',
          child,
          fileUri
        );
      propertiesSeen = true;
      Object.assign(output, compileProperties(child, name, context, fileUri));
    } else if (child.name === 'variables') {
      if (variablesSeen)
        fail(
          'LAYOUT_DUPLICATE_CHILD',
          'Only one <variables> is allowed.',
          child,
          fileUri
        );
      variablesSeen = true;
      requireContainer(child, fileUri);
      validateAttributes(child, [], [], fileUri);
      output.initialVariables = child.children.map(variable => {
        if (variable.name !== 'var')
          fail(
            'LAYOUT_INVALID_CHILD',
            '<variables> accepts only <var>.',
            variable,
            fileUri
          );
        const name = attrs(variable).name;
        if (overrideNames.has(`var:${name}`))
          fail(
            'LAYOUT_DUPLICATE_VARIABLE',
            `Duplicate variable ${String(name)}.`,
            variable,
            fileUri
          );
        overrideNames.add(`var:${name}`);
        return {
          name: expectString(name, 'variable name', variable, fileUri),
          ...compileVariable(variable, 'variables', fileUri),
        };
      });
    } else if (child.name === 'override') {
      const override = compileOverride(child, name, context, fileUri);
      if (overrideNames.has(override.name))
        fail(
          'LAYOUT_DUPLICATE_BEHAVIOR',
          `Duplicate override ${override.name}.`,
          child,
          fileUri
        );
      overrideNames.add(override.name);
      overrides.push(override);
    } else
      fail(
        'LAYOUT_INVALID_CHILD',
        `Invalid <${child.name}> inside instance.`,
        child,
        fileUri
      );
  });
  if (overrides.length) output.behaviorOverridings = overrides;
  return output;
};

const compileLayer = (element, context, fileUri) => {
  requireContainer(element, fileUri);
  const external = context.kind === 'external';
  const allowed = external
    ? ['name']
    : [
        'name',
        'rendering',
        'camera-type',
        'camera-behavior',
        'visible',
        'locked',
        'lighting',
        'follow-base-camera',
        'ambient',
        'near',
        'far',
        'fov',
        'max-2d-distance',
      ];
  const a = validateAttributes(element, allowed, ['name'], fileUri);
  const name = expectString(a.name, 'layer name', element, fileUri);
  const instances = [];
  if (external) {
    element.children.forEach(child => {
      if (child.name === 'camera' || child.name === 'effect')
        fail(
          'LAYOUT_INVALID_CHILD',
          'External layer references cannot contain cameras or effects.',
          child,
          fileUri
        );
      instances.push(compileInstance(child, name, context, fileUri));
    });
    return { name, instances };
  }
  const layer = {
    name,
    renderingType:
      a.rendering === undefined
        ? ''
        : expectEnum(
            a.rendering,
            ['', '2d', '3d', '2d+3d'],
            'layer rendering',
            element,
            fileUri
          ),
    cameraType:
      a['camera-type'] === undefined
        ? ''
        : expectEnum(
            a['camera-type'],
            ['', 'perspective', 'orthographic'],
            'camera-type',
            element,
            fileUri
          ),
    visibility:
      a.visible === undefined
        ? true
        : expectBoolean(a.visible, 'layer visible', element, fileUri),
    isLocked:
      a.locked === undefined
        ? false
        : expectBoolean(a.locked, 'layer locked', element, fileUri),
    isLightingLayer:
      a.lighting === undefined
        ? false
        : expectBoolean(a.lighting, 'layer lighting', element, fileUri),
    followBaseLayerCamera:
      a['follow-base-camera'] === undefined
        ? false
        : expectBoolean(
            a['follow-base-camera'],
            'follow-base-camera',
            element,
            fileUri
          ),
    camera3DNearPlaneDistance:
      a.near === undefined ? 3 : expectNumber(a.near, 'near', element, fileUri),
    camera3DFarPlaneDistance:
      a.far === undefined
        ? 10000
        : expectNumber(a.far, 'far', element, fileUri),
    camera3DFieldOfView:
      a.fov === undefined ? 45 : expectNumber(a.fov, 'fov', element, fileUri),
    camera2DPlaneMaxDrawingDistance:
      a['max-2d-distance'] === undefined
        ? 5000
        : expectNumber(
            a['max-2d-distance'],
            'max-2d-distance',
            element,
            fileUri
          ),
    cameras: [],
    effects: [],
  };
  if (a['camera-behavior'] !== undefined) {
    const cameraBehavior = expectEnum(
      a['camera-behavior'],
      ['do-nothing', 'top-left-anchored-if-never-moved'],
      'camera-behavior',
      element,
      fileUri
    );
    if (cameraBehavior !== 'top-left-anchored-if-never-moved')
      layer.defaultCameraBehavior = cameraBehavior;
  }
  [
    layer.ambientLightColorR,
    layer.ambientLightColorG,
    layer.ambientLightColorB,
  ] = serializedColorParts(
    a.ambient === undefined ? '#C8C8C8' : a.ambient,
    'ambient',
    element,
    fileUri
  );
  if (layer.camera3DFarPlaneDistance <= layer.camera3DNearPlaneDistance)
    fail(
      'LAYOUT_INVALID_LAYER',
      'far must be greater than near.',
      element,
      fileUri
    );
  if (
    layer.cameraType === 'perspective' &&
    layer.camera3DNearPlaneDistance <= 0
  )
    fail(
      'LAYOUT_INVALID_LAYER',
      'Perspective near distance must be positive.',
      element,
      fileUri
    );
  if (layer.camera3DFieldOfView <= 0 || layer.camera3DFieldOfView > 180)
    fail('LAYOUT_INVALID_LAYER', 'fov must be in (0,180].', element, fileUri);
  if (layer.camera2DPlaneMaxDrawingDistance <= 0)
    fail(
      'LAYOUT_INVALID_LAYER',
      'max-2d-distance must be positive.',
      element,
      fileUri
    );
  let phase = 0;
  const effectNames = new Set();
  element.children.forEach(child => {
    if (child.name === 'camera') {
      if (phase > 0)
        fail(
          'LAYOUT_CHILD_ORDER',
          'Cameras must precede effects and instances.',
          child,
          fileUri
        );
      layer.cameras.push(compileCamera(child, fileUri));
    } else if (child.name === 'effect') {
      if (phase > 1)
        fail(
          'LAYOUT_CHILD_ORDER',
          'Effects must precede instances.',
          child,
          fileUri
        );
      phase = 1;
      const effect = compileEffect(child, fileUri, context);
      if (effectNames.has(effect.name))
        fail(
          'LAYOUT_DUPLICATE_EFFECT',
          `Duplicate effect ${effect.name}.`,
          child,
          fileUri
        );
      effectNames.add(effect.name);
      layer.effects.push(effect);
    } else {
      phase = 2;
      instances.push(compileInstance(child, name, context, fileUri));
    }
  });
  if (layer.cameras.length > 50)
    fail(
      'LAYOUT_TOO_MANY_CAMERAS',
      'A layer cannot contain more than 50 cameras.',
      element,
      fileUri
    );
  return { name, layer, instances };
};

export const compileLayoutDsl = (source: string, context: LayoutDslContext) => {
  if (
    !context ||
    !['scene', 'prefab', 'prefab-variant', 'external'].includes(context.kind)
  )
    throw new LayoutDslError(
      'LAYOUT_INVALID_CONTEXT',
      'A valid layout context is required.'
    );
  context = {
    ...context,
    usedInstanceUuids: context.usedInstanceUuids || new Set(),
  };
  const fileUri = context.fileUri;
  const root = parseLayoutDsl(source, fileUri);
  if (root.name !== 'layout')
    fail(
      'LAYOUT_INVALID_ROOT',
      'Root element must be <layout>.',
      root,
      fileUri
    );
  if (root.selfClosing)
    fail(
      'LAYOUT_INVALID_ROOT',
      '<layout> must use an explicit closing tag.',
      root,
      fileUri
    );
  const scene = context.kind === 'scene';
  const prefab = context.kind === 'prefab' || context.kind === 'prefab-variant';
  const a = validateAttributes(
    root,
    scene ? ['version', 'background'] : ['version'],
    ['version'],
    fileUri
  );
  if (!root.attributes.length || root.attributes[0].name !== 'version')
    fail(
      'LAYOUT_ATTRIBUTE_ORDER',
      'version must be the first root attribute.',
      root,
      fileUri
    );
  if (a.version !== 1)
    fail(
      'LAYOUT_UNSUPPORTED_VERSION',
      'Only layout version 1 is supported.',
      root,
      fileUri
    );
  if (scene && a.background === undefined)
    fail(
      'LAYOUT_MISSING_ATTRIBUTE',
      '<layout> requires background.',
      root,
      fileUri
    );
  const output = {};
  if (scene)
    [output.r, output.v, output.b] = serializedColorParts(
      a.background,
      'background',
      root,
      fileUri
    );
  let boundsSeen = false;
  let editorSeen = false;
  let layerPhase = false;
  const layers = [];
  let instances = [];
  const layerNames = new Set();
  root.children.forEach(child => {
    if (child.name === 'bounds') {
      if (!prefab || boundsSeen || editorSeen || layerPhase)
        fail(
          'LAYOUT_INVALID_CHILD',
          '<bounds> is required once and first only in prefab layouts.',
          child,
          fileUri
        );
      boundsSeen = true;
      requireSelfClosing(child, fileUri);
      if (child.children.length)
        fail('LAYOUT_INVALID_CHILD', '<bounds> must be empty.', child, fileUri);
      const bounds = validateAttributes(
        child,
        ['min', 'max'],
        ['min', 'max'],
        fileUri
      );
      const min = tuple(bounds.min, [3], 'bounds min', child, fileUri).map(
        value => expectInteger(value, 'bound', child, fileUri)
      );
      const max = tuple(bounds.max, [3], 'bounds max', child, fileUri).map(
        value => expectInteger(value, 'bound', child, fileUri)
      );
      [output.areaMinX, output.areaMinY, output.areaMinZ] = min;
      [output.areaMaxX, output.areaMaxY, output.areaMaxZ] = max;
    } else if (child.name === 'editor') {
      if (editorSeen || layerPhase)
        fail(
          'LAYOUT_CHILD_ORDER',
          '<editor> must occur once before layers.',
          child,
          fileUri
        );
      editorSeen = true;
      output[scene ? 'uiSettings' : 'editionSettings'] = compileEditor(
        child,
        fileUri
      );
    } else if (child.name === 'layer') {
      layerPhase = true;
      const result = compileLayer(child, context, fileUri);
      if (layerNames.has(result.name))
        fail(
          'LAYOUT_DUPLICATE_LAYER',
          `Duplicate layer ${result.name}.`,
          child,
          fileUri
        );
      layerNames.add(result.name);
      if (result.layer) layers.push(result.layer);
      instances = instances.concat(result.instances);
    } else
      fail(
        'LAYOUT_INVALID_CHILD',
        `Invalid root child <${child.name}>.`,
        child,
        fileUri
      );
  });
  if (prefab && !boundsSeen)
    fail(
      'LAYOUT_MISSING_BOUNDS',
      'Prefab layouts require <bounds>.',
      root,
      fileUri
    );
  if (!editorSeen) output[scene ? 'uiSettings' : 'editionSettings'] = {};
  if (context.kind !== 'external') output.layers = layers;
  if (!layers.length && context.kind !== 'external' && instances.length)
    fail('LAYOUT_INVALID_LAYER', 'Instances require a layer.', root, fileUri);
  if (context.layerNames) {
    layerNames.forEach(name => {
      if (!context.layerNames.includes(name))
        fail(
          'LAYOUT_UNKNOWN_LAYER',
          `Layer ${name} does not exist in the linked scene.`,
          root,
          fileUri
        );
    });
  }
  const selectedLayer =
    output[scene ? 'uiSettings' : 'editionSettings'].selectedLayer;
  const selectedLayerUnresolved =
    output[scene ? 'uiSettings' : 'editionSettings']
      .__selectedLayerUnresolved === true;
  const resolvableLayers =
    context.kind === 'external' && context.layerNames
      ? new Set(context.layerNames)
      : layerNames;
  if (!selectedLayer && selectedLayerUnresolved)
    fail(
      'LAYOUT_INVALID_EDITOR',
      'selected-layer-unresolved requires selected-layer.',
      root,
      fileUri
    );
  if (
    selectedLayer &&
    !resolvableLayers.has(selectedLayer) &&
    !selectedLayerUnresolved
  )
    fail(
      'LAYOUT_UNKNOWN_LAYER',
      `Selected layer ${selectedLayer} does not exist.`,
      root,
      fileUri
    );
  if (
    selectedLayer &&
    resolvableLayers.has(selectedLayer) &&
    selectedLayerUnresolved
  )
    fail(
      'LAYOUT_INVALID_EDITOR',
      `Selected layer ${selectedLayer} exists and must not be marked unresolved.`,
      root,
      fileUri
    );
  delete output[scene ? 'uiSettings' : 'editionSettings']
    .__selectedLayerUnresolved;
  const ordered = instances.filter(
    instance => instance.__layoutOrder !== undefined
  );
  if (ordered.length && ordered.length !== instances.length)
    fail(
      'LAYOUT_INVALID_ORDER',
      'Instance order is all-or-none.',
      root,
      fileUri
    );
  if (ordered.length) {
    const values = ordered
      .map(instance => instance.__layoutOrder)
      .sort((x, y) => x - y);
    if (values.some((value, index) => value !== index))
      fail(
        'LAYOUT_INVALID_ORDER',
        'Instance order must be unique and contiguous from zero.',
        root,
        fileUri
      );
    instances.sort((left, right) => left.__layoutOrder - right.__layoutOrder);
  }
  instances.forEach(instance => delete instance.__layoutOrder);
  output.instances = instances;
  return output;
};

const numberText = value => {
  if (!Number.isFinite(value))
    throw new LayoutDslError(
      'LAYOUT_INVALID_NUMBER',
      'Cannot decompile a non-finite number.'
    );
  return Object.is(value, -0) ? '0' : String(value);
};
const stringText = value => {
  const string = String(value);
  if (string !== string.normalize('NFC'))
    throw new LayoutDslError(
      'LAYOUT_INVALID_STRING',
      'Cannot decompile a non-NFC string.'
    );
  return JSON.stringify(string);
};
const tupleText = values => values.map(numberText).join(',');
const canonicalLiteral = value => {
  if (Array.isArray(value)) return value.map(canonicalLiteral);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        if (key !== key.normalize('NFC'))
          throw new LayoutDslError(
            'LAYOUT_INVALID_STRING',
            'Cannot decompile a typed-data key that is not Unicode NFC.'
          );
        result[key] = canonicalLiteral(value[key]);
        return result;
      }, {});
  }
  if (typeof value === 'string' && value !== value.normalize('NFC'))
    throw new LayoutDslError(
      'LAYOUT_INVALID_STRING',
      'Cannot decompile a typed-data string that is not Unicode NFC.'
    );
  if (typeof value === 'number' && !Number.isFinite(value))
    throw new LayoutDslError(
      'LAYOUT_INVALID_NUMBER',
      'Cannot decompile a non-finite typed-data number.'
    );
  return value;
};
const literalText = value => JSON.stringify(canonicalLiteral(value));
const attrText = (name, value, bare = false) =>
  bare && value === true ? name : `${name}=${value}`;
const opening = (name, attributes, indent, selfClosing) => {
  const prefix = `${' '.repeat(indent)}<${name}`;
  const suffix = selfClosing ? ' />' : '>';
  const compact = `${prefix}${
    attributes.length ? ' ' + attributes.join(' ') : ''
  }${suffix}`;
  if (compact.length <= 100) return compact;
  return `${prefix}\n${attributes
    .map(attribute => `${' '.repeat(indent + 2)}${attribute}`)
    .join('\n')}\n${' '.repeat(indent)}${suffix.trimStart()}`;
};
const assertKnownFields = (value, allowed, label) => {
  Object.keys(value || {}).forEach(key => {
    if (!allowed.includes(key))
      throw new LayoutDslError(
        'LAYOUT_UNSUPPORTED_FIELD',
        `${label} field ${key} is outside layout DSL version 1.`
      );
  });
};

const decompileEditor = (settings, indent, layerNames = null) => {
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
  const a = [];
  if (settings.grid !== undefined)
    a.push(attrText('grid', String(!!settings.grid)));
  if (settings.gridType !== undefined)
    a.push(attrText('grid-type', settings.gridType));
  if (
    settings.gridWidth !== undefined ||
    settings.gridHeight !== undefined ||
    settings.gridDepth !== undefined
  )
    a.push(
      attrText(
        'grid-size',
        tupleText([
          settings.gridWidth === undefined ? 32 : settings.gridWidth,
          settings.gridHeight === undefined ? 32 : settings.gridHeight,
          settings.gridDepth === undefined ? 32 : settings.gridDepth,
        ])
      )
    );
  if (
    settings.gridOffsetX !== undefined ||
    settings.gridOffsetY !== undefined ||
    settings.gridOffsetZ !== undefined
  )
    a.push(
      attrText(
        'grid-offset',
        tupleText([
          settings.gridOffsetX === undefined ? 0 : settings.gridOffsetX,
          settings.gridOffsetY === undefined ? 0 : settings.gridOffsetY,
          settings.gridOffsetZ === undefined ? 0 : settings.gridOffsetZ,
        ])
      )
    );
  if (settings.gridColor !== undefined) {
    if (
      !Number.isInteger(settings.gridColor) ||
      settings.gridColor < 0 ||
      settings.gridColor > 0xffffff
    )
      throw new LayoutDslError(
        'LAYOUT_INVALID_COLOR',
        'gridColor must be a 24-bit integer.'
      );
    a.push(
      attrText(
        'grid-color',
        colorFromParts(
          (settings.gridColor >> 16) & 255,
          (settings.gridColor >> 8) & 255,
          settings.gridColor & 255
        )
      )
    );
  }
  if (settings.gridAlpha !== undefined)
    a.push(attrText('grid-alpha', numberText(settings.gridAlpha)));
  if (settings.snap !== undefined)
    a.push(attrText('snap', String(!!settings.snap)));
  if (settings.zoomFactor !== undefined)
    a.push(attrText('zoom', numberText(settings.zoomFactor)));
  if (settings.windowMask !== undefined)
    a.push(attrText('window-mask', String(!!settings.windowMask)));
  if (settings.selectedLayer !== undefined)
    a.push(attrText('selected-layer', stringText(settings.selectedLayer)));
  if (
    settings.selectedLayer &&
    layerNames &&
    !layerNames.includes(String(settings.selectedLayer))
  )
    a.push('selected-layer-unresolved');
  if (settings.gameEditorMode !== undefined)
    a.push(attrText('mode', settings.gameEditorMode));
  return opening('editor', a, indent, true);
};

const decompileVariable = (entry, indent, hasName) => {
  const variable = hasName ? { ...entry } : entry;
  const name = hasName ? variable.name : undefined;
  if (hasName) delete variable.name;
  assertKnownFields(
    variable,
    ['type', 'value', 'values', 'folded', 'persistentUuid', 'children'],
    'variable'
  );
  const a = [];
  if (hasName) a.push(attrText('name', stringText(name)));
  a.push(attrText('type', variable.type));
  if (variable.value !== undefined)
    a.push(
      attrText(
        'value',
        typeof variable.value === 'string'
          ? stringText(variable.value)
          : String(variable.value)
      )
    );
  if (variable.values !== undefined && variable.values.length)
    a.push(attrText('values', JSON.stringify(variable.values)));
  if (variable.folded) a.push(attrText('folded', 'true'));
  if (variable.persistentUuid)
    a.push(attrText('id', stringText(variable.persistentUuid)));
  const children = variable.children;
  if (
    (variable.type !== 'structure' && variable.type !== 'array') ||
    !children ||
    !children.length
  )
    return opening('var', a, indent, true);
  const lines = [opening('var', a, indent, false)];
  if (variable.type === 'array') {
    children.forEach(child =>
      lines.push(decompileVariable(child, indent + 2, false))
    );
  } else {
    children
      .slice()
      .sort((left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0
      )
      .forEach(child => lines.push(decompileVariable(child, indent + 2, true)));
  }
  lines.push(`${' '.repeat(indent)}</var>`);
  return lines.join('\n');
};

const decompileInstance = (instance, indent, order, context) => {
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
      throw new LayoutDslError(
        'LAYOUT_UNSUPPORTED_FIELD',
        `Serialized instance is missing required field ${field}.`
      );
  });
  if (!UUID_V4.test(instance.persistentUuid || ''))
    throw new LayoutDslError(
      'LAYOUT_INVALID_UUID',
      `Instance ${instance.name || ''} has no canonical UUIDv4.`
    );
  const unresolved =
    !!context.objectNames && !context.objectNames.includes(instance.name);
  const direct =
    !unresolved &&
    SAFE_TAG.test(instance.name) &&
    !STRUCTURAL_TAGS.has(instance.name);
  const tag = direct ? instance.name : 'object';
  const a = [];
  if (!direct) a.push(attrText('of', stringText(instance.name)));
  if (unresolved) a.push('unresolved');
  a.push(attrText('id', stringText(instance.persistentUuid)));
  if (order !== null) a.push(attrText('order', String(order)));
  const position =
    instance.z !== undefined && instance.z !== 0
      ? [instance.x || 0, instance.y || 0, instance.z]
      : [instance.x || 0, instance.y || 0];
  a.push(attrText('at', tupleText(position)));
  if ((instance.rotationX || 0) !== 0 || (instance.rotationY || 0) !== 0)
    a.push(
      attrText(
        'rotation',
        tupleText([
          instance.rotationX || 0,
          instance.rotationY || 0,
          instance.angle || 0,
        ])
      )
    );
  else if ((instance.angle || 0) !== 0)
    a.push(attrText('rotation', numberText(instance.angle)));
  if ((instance.zOrder || 0) !== 0)
    a.push(attrText('z-order', numberText(instance.zOrder)));
  if (instance.customSize)
    a.push(
      attrText(
        'size',
        `${numberText(instance.width || 0)}x${numberText(instance.height || 0)}`
      )
    );
  else if ((instance.width || 0) !== 0 || (instance.height || 0) !== 0)
    a.push(
      attrText(
        'size',
        `auto(${numberText(instance.width || 0)}x${numberText(
          instance.height || 0
        )})`
      )
    );
  if (instance.depth !== undefined)
    a.push(attrText('depth', numberText(instance.depth)));
  if (instance.opacity !== undefined && instance.opacity !== 255)
    a.push(attrText('opacity', numberText(instance.opacity)));
  const flips = ['X', 'Y', 'Z']
    .filter(axis => instance[`flipped${axis}`])
    .map(axis => axis.toLowerCase());
  if (flips.length) a.push(attrText('flip', flips.join(',')));
  if (instance.locked) a.push('locked');
  if (instance.sealed) a.push('sealed');
  if (instance.keepRatio !== true) a.push(attrText('keep-ratio', 'false'));
  const propertyArrayToMap = (properties, expectedType) => {
    const result = {};
    properties.forEach(property => {
      assertKnownFields(property, ['name', 'value'], 'instance property');
      const name = String(property.name);
      if (Object.prototype.hasOwnProperty.call(result, name))
        throw new LayoutDslError(
          'LAYOUT_INVALID_INSTANCE_PROPERTY',
          `Duplicate ${expectedType} instance property ${name}.`
        );
      if (
        expectedType === 'number' &&
        (typeof property.value !== 'number' || !Number.isFinite(property.value))
      )
        throw new LayoutDslError(
          'LAYOUT_INVALID_INSTANCE_PROPERTY',
          `Instance property ${name} must be a finite number.`
        );
      if (expectedType === 'string' && typeof property.value !== 'string')
        throw new LayoutDslError(
          'LAYOUT_INVALID_INSTANCE_PROPERTY',
          `Instance property ${name} must be a string.`
        );
      result[name] = property.value;
    });
    return result;
  };
  const numberProperties = propertyArrayToMap(
    instance.numberProperties || [],
    'number'
  );
  const stringProperties = propertyArrayToMap(
    instance.stringProperties || [],
    'string'
  );
  const variables = instance.initialVariables || [];
  const overrides = instance.behaviorOverridings || [];
  const hasChildren =
    Object.keys(numberProperties).length ||
    Object.keys(stringProperties).length ||
    variables.length ||
    overrides.length;
  if (!hasChildren) return opening(tag, a, indent, true);
  const lines = [opening(tag, a, indent, false)];
  if (
    Object.keys(numberProperties).length ||
    Object.keys(stringProperties).length
  ) {
    const propertyAttrs = [];
    if (Object.keys(numberProperties).length)
      propertyAttrs.push(
        attrText('numbers', literalText(sortedObject(numberProperties)))
      );
    if (Object.keys(stringProperties).length)
      propertyAttrs.push(
        attrText('strings', literalText(sortedObject(stringProperties)))
      );
    lines.push(opening('properties', propertyAttrs, indent + 2, true));
  }
  if (variables.length) {
    lines.push(`${' '.repeat(indent + 2)}<variables>`);
    variables.forEach(variable =>
      lines.push(decompileVariable(variable, indent + 4, true))
    );
    lines.push(`${' '.repeat(indent + 2)}</variables>`);
  }
  overrides.forEach(override => {
    const expectedBehaviorType =
      context.behaviorTypesByObject &&
      context.behaviorTypesByObject[instance.name] &&
      context.behaviorTypesByObject[instance.name][override.name];
    if (!expectedBehaviorType)
      throw new LayoutDslError(
        'LAYOUT_UNKNOWN_BEHAVIOR',
        `Behavior ${String(override.name || '')} is not attached to ${String(
          instance.name || ''
        )}.`
      );
    if (override.type !== expectedBehaviorType)
      throw new LayoutDslError(
        'LAYOUT_BEHAVIOR_TYPE_MISMATCH',
        `Behavior override ${String(override.name || '')} has type ${String(
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
    const data = Object.keys(override)
      .filter(key => !metadata.has(key))
      .reduce((result, key) => {
        result[key] = override[key];
        return result;
      }, {});
    const oa = [
      attrText('behavior', stringText(override.name)),
      attrText('data', literalText(sortedObject(data))),
    ];
    if (override.isFolded) oa.push(attrText('folded', 'true'));
    if (override.isMuted) oa.push(attrText('muted', 'true'));
    if (override.isInheritedFromObjectType)
      oa.push(attrText('inherited', 'true'));
    if (
      override.quickCustomizationVisibility &&
      override.quickCustomizationVisibility !== 'default'
    )
      oa.push(attrText('quick', override.quickCustomizationVisibility));
    if (
      override.propertiesQuickCustomizationVisibilities &&
      Object.keys(override.propertiesQuickCustomizationVisibilities).length
    )
      oa.push(
        attrText(
          'property-visibility',
          literalText(
            sortedObject(override.propertiesQuickCustomizationVisibilities)
          )
        )
      );
    lines.push(opening('override', oa, indent + 2, true));
  });
  lines.push(`${' '.repeat(indent)}</${tag}>`);
  return lines.join('\n');
};

const decompileCamera = (camera, indent) => {
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
      throw new LayoutDslError(
        'LAYOUT_UNSUPPORTED_FIELD',
        `Serialized camera is missing required field ${field}.`
      );
  });
  const size = camera.defaultSize
    ? (camera.width || 0) === 0 && (camera.height || 0) === 0
      ? 'default'
      : `default(${numberText(camera.width || 0)},${numberText(
          camera.height || 0
        )})`
    : `${numberText(camera.width || 0)}x${numberText(camera.height || 0)}`;
  const rect = [
    camera.viewportLeft || 0,
    camera.viewportTop || 0,
    camera.viewportRight === undefined ? 1 : camera.viewportRight,
    camera.viewportBottom === undefined ? 1 : camera.viewportBottom,
  ];
  const viewport = camera.defaultViewport
    ? rect.join(',') === '0,0,1,1'
      ? 'default'
      : `default(${tupleText(rect)})`
    : tupleText(rect);
  return opening(
    'camera',
    [attrText('size', size), attrText('viewport', viewport)],
    indent,
    true
  );
};

const decompileEffect = (effect, indent) => {
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
  const a = [
    attrText('name', stringText(effect.name)),
    attrText('type', stringText(effect.effectType)),
  ];
  if (effect.folded) a.push(attrText('folded', 'true'));
  if (effect.disabled) a.push(attrText('enabled', 'false'));
  if (effect.doubleParameters && Object.keys(effect.doubleParameters).length)
    a.push(
      attrText('numbers', literalText(sortedObject(effect.doubleParameters)))
    );
  if (effect.stringParameters && Object.keys(effect.stringParameters).length)
    a.push(
      attrText('strings', literalText(sortedObject(effect.stringParameters)))
    );
  if (effect.booleanParameters && Object.keys(effect.booleanParameters).length)
    a.push(
      attrText('booleans', literalText(sortedObject(effect.booleanParameters)))
    );
  return opening('effect', a, indent, true);
};

const decompileLayer = (layer, instances, orderByUuid, external, context) => {
  const a = [attrText('name', stringText(layer.name))];
  if (!external) {
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
    if (layer.renderingType) a.push(attrText('rendering', layer.renderingType));
    if (layer.cameraType) a.push(attrText('camera-type', layer.cameraType));
    if (
      layer.defaultCameraBehavior &&
      layer.defaultCameraBehavior !== 'top-left-anchored-if-never-moved'
    )
      a.push(attrText('camera-behavior', layer.defaultCameraBehavior));
    if (layer.visibility === false) a.push(attrText('visible', 'false'));
    if (layer.isLocked) a.push(attrText('locked', 'true'));
    if (layer.isLightingLayer) a.push(attrText('lighting', 'true'));
    if (layer.followBaseLayerCamera)
      a.push(attrText('follow-base-camera', 'true'));
    const ambient = colorFromParts(
      layer.ambientLightColorR === undefined ? 200 : layer.ambientLightColorR,
      layer.ambientLightColorG === undefined ? 200 : layer.ambientLightColorG,
      layer.ambientLightColorB === undefined ? 200 : layer.ambientLightColorB
    );
    if (ambient !== '#C8C8C8') a.push(attrText('ambient', ambient));
    if (
      layer.camera3DNearPlaneDistance !== undefined &&
      layer.camera3DNearPlaneDistance !== 3
    )
      a.push(attrText('near', numberText(layer.camera3DNearPlaneDistance)));
    if (
      layer.camera3DFarPlaneDistance !== undefined &&
      layer.camera3DFarPlaneDistance !== 10000
    )
      a.push(attrText('far', numberText(layer.camera3DFarPlaneDistance)));
    if (
      layer.camera3DFieldOfView !== undefined &&
      layer.camera3DFieldOfView !== 45
    )
      a.push(attrText('fov', numberText(layer.camera3DFieldOfView)));
    if (
      layer.camera2DPlaneMaxDrawingDistance !== undefined &&
      layer.camera2DPlaneMaxDrawingDistance !== 5000
    )
      a.push(
        attrText(
          'max-2d-distance',
          numberText(layer.camera2DPlaneMaxDrawingDistance)
        )
      );
  }
  const lines = [opening('layer', a, 2, false)];
  if (!external) {
    (layer.cameras || []).forEach(camera =>
      lines.push(decompileCamera(camera, 4))
    );
    (layer.effects || []).forEach(effect =>
      lines.push(decompileEffect(effect, 4))
    );
  }
  instances.forEach(instance =>
    lines.push(
      decompileInstance(
        instance,
        4,
        orderByUuid ? orderByUuid.get(instance.persistentUuid) : null,
        context
      )
    )
  );
  lines.push('  </layer>');
  return lines.join('\n');
};

export const decompileLayoutDsl = (
  layout: Object,
  context: LayoutDslContext
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
  const rootAttrs = [attrText('version', '1')];
  if (scene)
    rootAttrs.push(
      attrText('background', colorFromParts(layout.r, layout.v, layout.b))
    );
  const lines = [opening('layout', rootAttrs, 0, false)];
  const instances = layout.instances || [];
  const layerRecords =
    kind === 'external'
      ? Array.from(
          new Set(instances.map(instance => instance.layer || ''))
        ).map(name => ({ name }))
      : layout.layers || [];
  if (prefab)
    lines.push(
      '',
      opening(
        'bounds',
        [
          attrText(
            'min',
            tupleText([layout.areaMinX, layout.areaMinY, layout.areaMinZ])
          ),
          attrText(
            'max',
            tupleText([layout.areaMaxX, layout.areaMaxY, layout.areaMaxZ])
          ),
        ],
        2,
        true
      )
    );
  const editor = decompileEditor(
    layout[scene ? 'uiSettings' : 'editionSettings'],
    2,
    kind === 'external' && context.layerNames
      ? context.layerNames
      : layerRecords.map(layer => String(layer.name || ''))
  );
  if (editor) lines.push('', editor);
  const usedInstanceUuids = context.usedInstanceUuids || new Set();
  instances.forEach(instance => {
    const instanceUuid = instance.persistentUuid || '';
    if (!UUID_V4.test(instanceUuid))
      throw new LayoutDslError(
        'LAYOUT_INVALID_UUID',
        `Instance ${String(instance.name || '')} has no canonical UUIDv4.`
      );
    if (usedInstanceUuids.has(instanceUuid))
      throw new LayoutDslError(
        'LAYOUT_DUPLICATE_UUID',
        `Duplicate instance UUID ${instanceUuid}.`
      );
    usedInstanceUuids.add(instanceUuid);
  });
  if (kind !== 'external') {
    const serializedLayerNames = new Set(
      layerRecords.map(layer => String(layer.name || ''))
    );
    instances.forEach(instance => {
      if (!serializedLayerNames.has(String(instance.layer || '')))
        throw new LayoutDslError(
          'LAYOUT_UNKNOWN_LAYER',
          `Instance ${String(
            instance.name || ''
          )} references missing layer ${String(instance.layer || '')}.`
        );
    });
  }
  const grouped = [];
  layerRecords.forEach(layer =>
    instances
      .filter(instance => (instance.layer || '') === layer.name)
      .forEach(instance => grouped.push(instance))
  );
  const sameOrder =
    grouped.length === instances.length &&
    grouped.every((instance, index) => instance === instances[index]);
  const orderByUuid = sameOrder
    ? null
    : new Map(
        instances.map((instance, index) => [instance.persistentUuid, index])
      );
  layerRecords.forEach(layer => {
    lines.push(
      '',
      decompileLayer(
        layer,
        instances.filter(instance => (instance.layer || '') === layer.name),
        orderByUuid,
        kind === 'external',
        context
      )
    );
  });
  lines.push('</layout>');
  const source = lines.join('\n') + '\n';
  compileLayoutDsl(source, {
    ...context,
    usedInstanceUuids: new Set(),
  });
  return source;
};

export const formatLayoutDsl = (
  source: string,
  context: LayoutDslContext
): string => {
  const isolatedContext = { ...context, usedInstanceUuids: new Set() };
  return decompileLayoutDsl(compileLayoutDsl(source, isolatedContext), {
    ...context,
    usedInstanceUuids: new Set(),
  });
};

export const normalizeLayoutFragmentForDsl = (
  layout: Object,
  context: LayoutDslContext
): Object =>
  compileLayoutDsl(
    decompileLayoutDsl(layout, {
      ...context,
      usedInstanceUuids: new Set(),
    }),
    { ...context, usedInstanceUuids: new Set() }
  );

export const areLayoutFragmentsEquivalent = (
  left: Object,
  right: Object,
  context: LayoutDslContext
): boolean =>
  JSON.stringify(
    canonicalLiteral(normalizeLayoutFragmentForDsl(left, context))
  ) ===
  JSON.stringify(
    canonicalLiteral(normalizeLayoutFragmentForDsl(right, context))
  );
