// @noflow

/**
 * Bidirectional converter for the canonical IfDo event DSL.
 *
 * The JSON decompiler emits friendly, reversible forms for the built-in
 * instruction catalog and uses catalog-backed `@exact` only when no proven
 * friendly mapping exists. Project/extension-specific friendly instructions
 * are accepted when a caller supplies `resolveInstruction`.
 */

export type LegacyInstruction = {
  type: { value: string, inverted?: boolean, await?: boolean },
  disabled?: boolean,
  parameters?: Array<string>,
  subInstructions?: Array<LegacyInstruction>,
};

export type ResolveInstruction = (input: {
  kind: 'condition' | 'action',
  source: string,
  line: number,
}) => LegacyInstruction;

export type LowerWhileLimit = (input: {
  limit: string,
  event: Object,
  line: number,
}) => Object;

export type CompileOptions = {
  resolveInstruction?: ResolveInstruction,
  lowerWhileLimit?: LowerWhileLimit,
  jsCodeEventType?: string,
};

type PhysicalLine = { text: string, ending: string };

type SourceLine = {
  depth: number,
  instructionDepth: number,
  text: string,
  line: number,
  jsBody?: string,
};

type Metadata = { [string]: any };

const EVENT_TYPES = {
  standard: 'BuiltinCommonInstructions::Standard',
  else: 'BuiltinCommonInstructions::Else',
  while: 'BuiltinCommonInstructions::While',
  repeat: 'BuiltinCommonInstructions::Repeat',
  forEach: 'BuiltinCommonInstructions::ForEach',
  forEachChild: 'BuiltinCommonInstructions::ForEachChildVariable',
  group: 'BuiltinCommonInstructions::Group',
  comment: 'BuiltinCommonInstructions::Comment',
  link: 'BuiltinCommonInstructions::Link',
  js: 'BuiltinCommonInstructions::JsCode',
};

const COMMON_EVENT_KEYS = new Set([
  'type',
  'disabled',
  'folded',
  'aiGeneratedEventId',
]);

const EVENT_KEYS = {
  [EVENT_TYPES.standard]: new Set([
    ...COMMON_EVENT_KEYS,
    'conditions',
    'actions',
    'events',
    'variables',
  ]),
  [EVENT_TYPES.else]: new Set([
    ...COMMON_EVENT_KEYS,
    'conditions',
    'actions',
    'events',
    'variables',
  ]),
  [EVENT_TYPES.while]: new Set([
    ...COMMON_EVENT_KEYS,
    'infiniteLoopWarning',
    'whileConditions',
    'conditions',
    'actions',
    'events',
    'variables',
    'loopIndexVariable',
  ]),
  [EVENT_TYPES.repeat]: new Set([
    ...COMMON_EVENT_KEYS,
    'repeatExpression',
    'conditions',
    'actions',
    'events',
    'variables',
    'loopIndexVariable',
  ]),
  [EVENT_TYPES.forEach]: new Set([
    ...COMMON_EVENT_KEYS,
    'object',
    'conditions',
    'actions',
    'events',
    'variables',
    'loopIndexVariable',
    'orderBy',
    'order',
    'limit',
  ]),
  [EVENT_TYPES.forEachChild]: new Set([
    ...COMMON_EVENT_KEYS,
    'iterableVariableName',
    'valueIteratorVariableName',
    'keyIteratorVariableName',
    'conditions',
    'actions',
    'events',
    'variables',
    'loopIndexVariable',
  ]),
  [EVENT_TYPES.group]: new Set([
    ...COMMON_EVENT_KEYS,
    'name',
    'source',
    'creationTime',
    'colorR',
    'colorG',
    'colorB',
    'parameters',
    'events',
  ]),
  [EVENT_TYPES.comment]: new Set([
    ...COMMON_EVENT_KEYS,
    'color',
    'comment',
    'comment2',
  ]),
  [EVENT_TYPES.link]: new Set([...COMMON_EVENT_KEYS, 'target', 'include']),
  [EVENT_TYPES.js]: new Set([
    ...COMMON_EVENT_KEYS,
    'inlineCode',
    'parameterObjects',
    'useStrict',
    'eventsSheetExpanded',
  ]),
};

export const IFDO_EVENTS_DSL_COVERAGE = Object.freeze({
  formatVersion: '1.3',
  serializerContract: 'repository-current',
  persistedEventTypes: Object.keys(EVENT_KEYS).map(type => ({
    type,
    fields: Array.from(EVENT_KEYS[type]),
  })),
  instructionFields: ['type', 'disabled', 'parameters', 'subInstructions'],
  instructionTypeFields: ['value', 'inverted', 'await'],
  variableTypes: [
    'string',
    'enum',
    'number',
    'boolean',
    'structure',
    'array',
    'mixed',
  ],
  variableFields: [
    'name',
    'type',
    'folded',
    'persistentUuid',
    'value',
    'values',
    'children',
    'hasMixedValues',
  ],
  metadata: {
    event: ['disabled', 'folded', 'aiGeneratedEventId'],
    instruction: ['disabled', 'inverted', 'awaited'],
    comment: ['background', 'text', 'comment2'],
    group: ['source', 'creationTime', 'color', 'parameters'],
    while: ['infiniteLoopWarning'],
    js: ['objects', 'strict', 'expanded', 'delimiter'],
  },
});

export class IfDoError extends Error {
  code: string;
  line: ?number;

  constructor(code: string, message: string, line?: number) {
    super(line ? `${message} (line ${line})` : message);
    this.name = 'IfDoError';
    this.code = code;
    this.line = line || null;
  }
}

const fail = (code: string, message: string, line?: number): empty => {
  throw new IfDoError(code, message, line);
};

const asObject = (value: any, label: string): Object => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('IFDO_INVALID_JSON', `${label} must be an object.`);
  }
  return value;
};

const asArray = (value: any, label: string): Array<any> => {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    fail('IFDO_INVALID_JSON', `${label} must be an array.`);
  }
  return value;
};

const assertOnlyKeys = (
  object: Object,
  allowed: Set<string>,
  label: string
) => {
  Object.keys(object).forEach(key => {
    if (!allowed.has(key)) {
      fail(
        'IFDO_UNSUPPORTED_FIELD',
        `${label} contains unsupported field ${JSON.stringify(key)}.`
      );
    }
  });
};

const assertMetadata = (
  metadata: Metadata,
  schema: { [string]: string },
  label: string,
  line?: number
) => {
  Object.keys(metadata).forEach(key => {
    const expected = schema[key];
    if (!expected) fail('IFDO_SYNTAX', `Unknown ${label} field ${key}.`, line);
    const value = metadata[key];
    const valid =
      expected === 'boolean'
        ? typeof value === 'boolean'
        : expected === 'string'
        ? typeof value === 'string'
        : expected === 'number'
        ? typeof value === 'number' && Number.isFinite(value)
        : expected === 'rgb'
        ? Array.isArray(value) &&
          value.length === 3 &&
          value.every(
            component =>
              Number.isInteger(component) && component >= 0 && component <= 255
          )
        : expected === 'strings'
        ? Array.isArray(value) && value.every(item => typeof item === 'string')
        : false;
    if (!valid) {
      fail('IFDO_SYNTAX', `${label} field ${key} must be ${expected}.`, line);
    }
  });
};

const quote = (value: string): string => JSON.stringify(value);

const depthPrefix = (depth: number, instructionDepth: number = 0): string =>
  `${'>'.repeat(depth)}${'?'.repeat(instructionDepth)}${
    depth || instructionDepth ? ' ' : ''
  }`;

const formatMetadata = (name: string, values: Metadata): string => {
  const entries = Object.keys(values)
    .filter(key => values[key] !== undefined)
    .map(key => `${key}=${JSON.stringify(values[key])}`);
  return entries.length ? `${name} ${entries.join(' ')}` : name;
};

class ValueReader {
  source: string;
  index: number = 0;

  constructor(source: string) {
    this.source = source;
  }

  skip() {
    while (/\s/.test(this.source[this.index] || '')) this.index++;
  }

  eof(): boolean {
    this.skip();
    return this.index >= this.source.length;
  }

  readIdentifier(): string {
    this.skip();
    const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.source.slice(this.index));
    if (!match) fail('IFDO_SYNTAX', 'Expected an identifier.');
    this.index += match[0].length;
    return match[0];
  }

  expect(character: string) {
    this.skip();
    if (this.source[this.index] !== character) {
      fail('IFDO_SYNTAX', `Expected ${JSON.stringify(character)}.`);
    }
    this.index++;
  }

  readString(): string {
    this.skip();
    const start = this.index;
    if (this.source[this.index] !== '"') {
      fail('IFDO_SYNTAX', 'Expected a double-quoted string.');
    }
    this.index++;
    let escaped = false;
    while (this.index < this.source.length) {
      const char = this.source[this.index++];
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') {
        try {
          return JSON.parse(this.source.slice(start, this.index));
        } catch (error) {
          fail('IFDO_SYNTAX', 'Invalid string escape.');
        }
      }
    }
    fail('IFDO_SYNTAX', 'Unterminated string.');
  }

  readValue(): any {
    this.skip();
    const char = this.source[this.index];
    if (char === '"') return this.readString();
    if (char === '[') return this.readArray();
    if (char === '{') return this.readObject();
    if (this.source.startsWith('var(', this.index)) return this.readVariable();
    const rest = this.source.slice(this.index);
    const literal = /^(true|false|null|-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/.exec(
      rest
    );
    if (literal) {
      this.index += literal[0].length;
      return JSON.parse(literal[0]);
    }
    fail('IFDO_SYNTAX', 'Expected a typed value.');
  }

  readNamedValue(): any {
    this.skip();
    const char = this.source[this.index];
    if (
      char === '"' ||
      char === '[' ||
      char === '{' ||
      this.source.startsWith('var(', this.index) ||
      /^(?:true|false|null|-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(?:\s|$)/.test(
        this.source.slice(this.index)
      )
    ) {
      return this.readValue();
    }
    const match = /^\S+/.exec(this.source.slice(this.index));
    if (!match) fail('IFDO_SYNTAX', 'Expected a named argument value.');
    this.index += match[0].length;
    return match[0];
  }

  readArray(): Array<any> {
    const values = [];
    this.expect('[');
    this.skip();
    if (this.source[this.index] === ']') {
      this.index++;
      return values;
    }
    while (true) {
      values.push(this.readValue());
      this.skip();
      if (this.source[this.index] === ']') {
        this.index++;
        return values;
      }
      this.expect(',');
    }
  }

  readObject(): Object {
    const result = {};
    this.expect('{');
    this.skip();
    if (this.source[this.index] === '}') {
      this.index++;
      return result;
    }
    while (true) {
      this.skip();
      const key =
        this.source[this.index] === '"'
          ? this.readString()
          : this.readIdentifier();
      this.expect(':');
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        fail(
          'IFDO_SYNTAX',
          `Duplicate structure child ${JSON.stringify(key)}.`
        );
      }
      result[key] = this.readValue();
      this.skip();
      if (this.source[this.index] === '}') {
        this.index++;
        return result;
      }
      this.expect(',');
    }
  }

  readVariable(): Object {
    const name = this.readIdentifier();
    if (name !== 'var') fail('IFDO_SYNTAX', 'Expected var(...).');
    this.expect('(');
    const fields = {};
    while (true) {
      this.skip();
      if (this.source[this.index] === ')') {
        this.index++;
        break;
      }
      const key = this.readIdentifier();
      this.expect('=');
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        fail('IFDO_SYNTAX', `Duplicate var field ${key}.`);
      }
      fields[key] = this.readValue();
      this.skip();
      if (this.source[this.index] === ')') {
        this.index++;
        break;
      }
      this.expect(',');
    }
    return { __ifdoVariable: true, ...fields };
  }
}

const parseNamedArguments = (source: string): Metadata => {
  const reader = new ValueReader(source);
  const result = {};
  while (!reader.eof()) {
    const key = reader.readIdentifier();
    reader.expect('=');
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      fail('IFDO_SYNTAX', `Duplicate argument ${key}.`);
    }
    result[key] = reader.readNamedValue();
  }
  return result;
};

const SIMPLE_DSL_PATH = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$/;

const makeInstruction = (
  type: string,
  parameters: Array<string>
): LegacyInstruction => ({
  type: { value: type, inverted: false, await: false },
  disabled: false,
  parameters,
  subInstructions: [],
});

/**
 * Split catalog operands without interpreting GDevelop expression syntax.
 * Whitespace inside strings, calls, arrays and structures is preserved.
 */
const splitCatalogOperands = (source: string): Array<string> => {
  const operands = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index <= source.length; index++) {
    const character = source[index] || ' ';
    if (start === -1) {
      if (/\s/.test(character)) continue;
      start = index;
    }
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '(' || character === '[' || character === '{')
      depth++;
    else if (character === ')' || character === ']' || character === '}')
      depth--;
    else if (/\s/.test(character) && depth === 0) {
      operands.push(source.slice(start, index));
      start = -1;
    }
  }
  return operands;
};

const parseRawNamedOperands = (
  source: string,
  expectedNames: Array<string>
): ?{ [string]: string } => {
  const result = {};
  for (const operand of splitCatalogOperands(source)) {
    const equalsIndex = operand.indexOf('=');
    if (equalsIndex <= 0) return null;
    const name = operand.slice(0, equalsIndex);
    const value = operand.slice(equalsIndex + 1);
    if (
      !expectedNames.includes(name) ||
      !value ||
      Object.prototype.hasOwnProperty.call(result, name)
    )
      return null;
    result[name] = value;
  }
  return expectedNames.every(name => result[name] !== undefined)
    ? result
    : null;
};

const dslComparisonOperator = (operator: string): ?string =>
  operator === '='
    ? '=='
    : ['!=', '<', '<=', '>', '>='].includes(operator)
    ? operator
    : null;

const jsonComparisonOperator = (operator: string): ?string =>
  operator === '=='
    ? '='
    : ['!=', '<', '<=', '>', '>='].includes(operator)
    ? operator
    : null;

const dslAssignmentOperator = (operator: string): ?string =>
  operator === '='
    ? '='
    : ['+', '-', '*', '/'].includes(operator)
    ? `${operator}=`
    : null;

const jsonAssignmentOperator = (operator: string): ?string =>
  operator === '='
    ? '='
    : ['+=', '-=', '*=', '/='].includes(operator)
    ? operator.slice(0, 1)
    : null;

const formatFriendlyBuiltinInstruction = (
  instruction: LegacyInstruction,
  kind: 'condition' | 'action'
): ?string => {
  const type = instruction.type.value;
  const parameters = instruction.parameters || [];
  const path = value => (SIMPLE_DSL_PATH.test(value) ? value : null);

  if (
    kind === 'condition' &&
    type === 'SceneJustBegins' &&
    parameters.length === 1 &&
    parameters[0] === ''
  )
    return 'scene begins';

  if (
    kind === 'condition' &&
    type === 'CollisionNP' &&
    parameters.length === 5 &&
    parameters[2] === '' &&
    parameters[3] === '' &&
    parameters[4] === 'no' &&
    path(parameters[0]) &&
    path(parameters[1])
  )
    return `collision ${parameters[0]} ${parameters[1]}`;

  const keySuffixes = {
    KeyFromTextPressed: 'down',
    KeyFromTextJustPressed: 'pressed',
    KeyFromTextReleased: 'released',
  };
  if (
    kind === 'condition' &&
    keySuffixes[type] &&
    parameters.length === 2 &&
    parameters[0] === ''
  )
    return `key ${parameters[1]} ${keySuffixes[type]}`;

  if (
    kind === 'condition' &&
    type === 'CompareTimer' &&
    parameters.length === 4 &&
    parameters[0] === '' &&
    dslComparisonOperator(parameters[2])
  )
    return `timer ${parameters[1]} ${dslComparisonOperator(parameters[2]) ||
      ''} ${parameters[3]}`;

  if (
    kind === 'action' &&
    type === 'ResetTimer' &&
    parameters.length === 2 &&
    parameters[0] === ''
  )
    return `timer.reset ${parameters[1]}`;

  if (
    kind === 'action' &&
    type === 'Delete' &&
    parameters.length === 2 &&
    parameters[1] === '' &&
    path(parameters[0])
  )
    return `delete ${parameters[0]}`;

  if (
    kind === 'action' &&
    type === 'Create' &&
    parameters.length === 5 &&
    parameters[0] === '' &&
    path(parameters[1])
  )
    return `create ${parameters[1]} x=${parameters[2]} y=${
      parameters[3]
    } layer=${parameters[4]}`;

  if (
    kind === 'action' &&
    type === 'PlaySound' &&
    parameters.length === 5 &&
    parameters[0] === ''
  )
    return `sound.play resource=${parameters[1]} loop=${parameters[2]} volume=${
      parameters[3]
    } pitch=${parameters[4]}`;

  if (
    kind === 'action' &&
    type === 'Scene' &&
    parameters.length === 3 &&
    parameters[0] === ''
  )
    return `scene.change ${parameters[1]} stop_sounds=${parameters[2]}`;

  const actionOperator =
    kind === 'action' && parameters.length
      ? dslAssignmentOperator(parameters[parameters.length - 2])
      : null;
  const conditionOperator =
    kind === 'condition' && parameters.length
      ? dslComparisonOperator(parameters[parameters.length - 2])
      : null;
  const operator = actionOperator || conditionOperator;
  if (!operator) return null;
  const value = parameters[parameters.length - 1];

  const sceneVariableTypes =
    kind === 'action'
      ? new Set(['SetNumberVariable', 'SetStringVariable'])
      : new Set(['NumberVariable', 'StringVariable']);
  if (
    sceneVariableTypes.has(type) &&
    parameters.length === 3 &&
    path(parameters[0])
  )
    return `scene.${parameters[0]} ${operator} ${value}`;

  const objectVariableTypes =
    kind === 'action'
      ? new Set(['SetNumberObjectVariable', 'SetStringObjectVariable'])
      : new Set(['NumberObjectVariable', 'StringObjectVariable']);
  if (
    objectVariableTypes.has(type) &&
    parameters.length === 4 &&
    path(parameters[0]) &&
    path(parameters[1])
  )
    return `${parameters[0]}.${parameters[1]} ${operator} ${value}`;

  const objectProperty = {
    SetX: 'x',
    PosX: 'x',
    SetY: 'y',
    PosY: 'y',
    SetAngle: 'angle',
    Angle: 'angle',
  }[type];
  if (objectProperty && parameters.length === 3 && path(parameters[0]))
    return `${parameters[0]}.${objectProperty} ${operator} ${value}`;

  const capabilityProperty = {
    'OpacityCapability::OpacityBehavior::SetValue': 'opacity',
    'TextContainerCapability::TextContainerBehavior::SetValue': 'text',
  }[type];
  if (
    kind === 'action' &&
    capabilityProperty &&
    parameters.length === 4 &&
    path(parameters[0])
  )
    return `${parameters[0]}.${capabilityProperty} ${operator} ${value}`;

  return null;
};

const resolveFriendlyBuiltinInstruction = (
  source: string,
  kind: 'condition' | 'action'
): ?LegacyInstruction => {
  if (kind === 'condition' && source === 'scene begins')
    return makeInstruction('SceneJustBegins', ['']);

  let match = /^collision\s+(\S+)\s+(\S+)$/.exec(source);
  if (kind === 'condition' && match)
    return makeInstruction('CollisionNP', [match[1], match[2], '', '', 'no']);

  match = /^key\s+(.+)\s+(down|pressed|released)$/.exec(source);
  if (kind === 'condition' && match) {
    const types = {
      down: 'KeyFromTextPressed',
      pressed: 'KeyFromTextJustPressed',
      released: 'KeyFromTextReleased',
    };
    return makeInstruction(types[match[2]], ['', match[1]]);
  }

  match = /^timer\s+(.+)\s+(==|!=|<=|>=|<|>)\s+(.+)$/.exec(source);
  if (kind === 'condition' && match) {
    const operator = jsonComparisonOperator(match[2]);
    if (operator)
      return makeInstruction('CompareTimer', [
        '',
        match[1],
        operator,
        match[3],
      ]);
  }

  match = /^timer\.reset\s+(.+)$/.exec(source);
  if (kind === 'action' && match)
    return makeInstruction('ResetTimer', ['', match[1]]);

  match = /^delete\s+(\S+)$/.exec(source);
  if (kind === 'action' && match)
    return makeInstruction('Delete', [match[1], '']);

  match = /^create\s+(\S+)\s+(.+)$/.exec(source);
  if (kind === 'action' && match) {
    const operands = parseRawNamedOperands(match[2], ['x', 'y', 'layer']);
    if (operands)
      return makeInstruction('Create', [
        '',
        match[1],
        operands.x,
        operands.y,
        operands.layer,
      ]);
  }

  match = /^sound\.play\s+(.+)$/.exec(source);
  if (kind === 'action' && match) {
    const operands = parseRawNamedOperands(match[1], [
      'resource',
      'loop',
      'volume',
      'pitch',
    ]);
    if (operands)
      return makeInstruction('PlaySound', [
        '',
        operands.resource,
        operands.loop,
        operands.volume,
        operands.pitch,
      ]);
  }

  match = /^scene\.change\s+(\S+)\s+(.+)$/.exec(source);
  if (kind === 'action' && match) {
    const operands = parseRawNamedOperands(match[2], ['stop_sounds']);
    if (operands)
      return makeInstruction('Scene', ['', match[1], operands.stop_sounds]);
  }

  match = /^([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s+(==|!=|<=|>=|=|\+=|-=|\*=|\/=|<|>)\s+(.+)$/.exec(
    source
  );
  if (!match) return null;
  const target = match[1];
  const targetParts = target.split('.');
  const value = match[3];
  const operator =
    kind === 'condition'
      ? jsonComparisonOperator(match[2])
      : jsonAssignmentOperator(match[2]);
  if (!operator) return null;

  if (targetParts[0] === 'scene' && targetParts.length >= 2) {
    const variable = targetParts.slice(1).join('.');
    const isString = /^"/.test(value.trim());
    return makeInstruction(
      kind === 'action'
        ? isString
          ? 'SetStringVariable'
          : 'SetNumberVariable'
        : isString
        ? 'StringVariable'
        : 'NumberVariable',
      [variable, operator, value]
    );
  }

  if (targetParts.length !== 2) return null;
  const object = targetParts[0];
  const property = targetParts[1];
  const propertyTypes = {
    x: kind === 'action' ? 'SetX' : 'PosX',
    y: kind === 'action' ? 'SetY' : 'PosY',
    angle: kind === 'action' ? 'SetAngle' : 'Angle',
    opacity:
      kind === 'action' ? 'OpacityCapability::OpacityBehavior::SetValue' : null,
    text:
      kind === 'action'
        ? 'TextContainerCapability::TextContainerBehavior::SetValue'
        : null,
  };
  if (propertyTypes[property]) {
    const type = propertyTypes[property];
    return makeInstruction(
      type,
      property === 'opacity'
        ? [object, 'Opacity', operator, value]
        : property === 'text'
        ? [object, 'Text', operator, value]
        : [object, operator, value]
    );
  }

  const isString = /^"/.test(value.trim());
  return makeInstruction(
    kind === 'action'
      ? isString
        ? 'SetStringObjectVariable'
        : 'SetNumberObjectVariable'
      : isString
      ? 'StringObjectVariable'
      : 'NumberObjectVariable',
    [object, property, operator, value]
  );
};

const balanceDelta = (source: string): number => {
  let delta = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '(' || char === '[' || char === '{') delta++;
    else if (char === ')' || char === ']' || char === '}') delta--;
  }
  return delta;
};

const parsePrefix = (physicalLine: string, line: number): SourceLine => {
  let index = 0;
  let depth = 0;
  let instructionDepth = 0;
  while (physicalLine[index] === '>') {
    depth++;
    index++;
  }
  while (physicalLine[index] === '?') {
    instructionDepth++;
    index++;
  }
  while (physicalLine[index] === ' ' || physicalLine[index] === '\t') index++;
  return { depth, instructionDepth, text: physicalLine.slice(index), line };
};

const splitPhysicalLines = (source: string): Array<PhysicalLine> => {
  const physical = [];
  const normalizedSource = source.replace(/^\uFEFF/, '');
  const separator = /\r\n|\r|\n/g;
  let start = 0;
  let match;
  while ((match = separator.exec(normalizedSource))) {
    physical.push({
      text: normalizedSource.slice(start, match.index),
      ending: match[0],
    });
    start = match.index + match[0].length;
  }
  physical.push({ text: normalizedSource.slice(start), ending: '' });
  return physical;
};

const readJavaScriptDelimiter = (header: string, line: number): string => {
  const args = parseNamedArguments(header.slice('js'.length));
  Object.keys(args).forEach(key => {
    if (!['objects', 'strict', 'expanded', 'delimiter'].includes(key)) {
      fail('IFDO_SYNTAX', `Unknown js argument ${key}.`, line);
    }
  });
  if (args.delimiter === undefined) return '';
  if (
    typeof args.delimiter !== 'string' ||
    !/^[A-Za-z0-9_]+$/.test(args.delimiter)
  ) {
    fail(
      'IFDO_SYNTAX',
      'js delimiter must contain only letters, digits, and underscores.',
      line
    );
  }
  return args.delimiter;
};

const scanSource = (source: string): Array<SourceLine> => {
  const physical = splitPhysicalLines(source);
  const lines = [];
  for (let index = 0; index < physical.length; index++) {
    let parsed = parsePrefix(physical[index].text, index + 1);
    if (!parsed.text.trim()) continue;
    if (!parsed.text.startsWith('#')) parsed.text = parsed.text.trimEnd();
    if (/^js(?:\s|$)/.test(parsed.text)) {
      const delimiter = readJavaScriptDelimiter(parsed.text, parsed.line);
      const terminator = delimiter ? `end js ${delimiter}` : 'end js';
      const body: Array<PhysicalLine> = [];
      let foundEnd = false;
      while (++index < physical.length) {
        const candidate = parsePrefix(physical[index].text, index + 1);
        if (
          candidate.depth === parsed.depth &&
          candidate.instructionDepth === 0 &&
          candidate.text.trim() === terminator
        ) {
          foundEnd = true;
          break;
        }
        body.push(physical[index]);
      }
      if (!foundEnd) fail('IFDO_SYNTAX', 'Unterminated js block.', parsed.line);
      lines.push({
        ...parsed,
        jsBody: body
          .map((physicalLine, bodyIndex) =>
            bodyIndex + 1 < body.length
              ? physicalLine.text + physicalLine.ending
              : physicalLine.text
          )
          .join(''),
      });
      continue;
    }
    let balance = parsed.text.startsWith('#') ? 0 : balanceDelta(parsed.text);
    while (balance > 0 && index + 1 < physical.length) {
      const continuation = parsePrefix(physical[++index].text, index + 1);
      parsed.text += `\n${continuation.text.trim()}`;
      balance += balanceDelta(continuation.text);
    }
    if (balance !== 0)
      fail('IFDO_SYNTAX', 'Unbalanced delimiters.', parsed.line);
    lines.push(parsed);
  }
  return lines;
};

const commonEvent = (type: string, metadata: Metadata): Object => {
  const event = {
    type,
    disabled: !!metadata.disabled,
    folded: !!metadata.folded,
  };
  if (metadata.aiGeneratedEventId) {
    event.aiGeneratedEventId = String(metadata.aiGeneratedEventId);
  }
  return event;
};

const parseExactInstruction = (
  source: string,
  kind: 'condition' | 'action',
  metadata: Metadata,
  options: CompileOptions,
  line: number
): LegacyInstruction => {
  assertMetadata(
    metadata,
    { disabled: 'boolean', inverted: 'boolean', awaited: 'boolean' },
    '@instruction',
    line
  );
  if (!source.startsWith('@exact')) {
    if (!options.resolveInstruction) {
      const builtinInstruction = resolveFriendlyBuiltinInstruction(
        source,
        kind
      );
      if (!builtinInstruction) {
        fail(
          'IFDO_CATALOG_REQUIRED',
          `Friendly ${kind} requires a project instruction catalog: ${source}`,
          line
        );
      }
      if (metadata.disabled !== undefined)
        builtinInstruction.disabled = metadata.disabled;
      if (metadata.inverted !== undefined)
        builtinInstruction.type.inverted = metadata.inverted;
      if (metadata.awaited !== undefined)
        builtinInstruction.type.await = metadata.awaited;
      return builtinInstruction;
    }
    const resolved = normalizeInstruction(
      options.resolveInstruction({ kind, source, line }),
      `${kind} resolved at line ${line}`
    );
    if (metadata.disabled !== undefined) resolved.disabled = metadata.disabled;
    if (metadata.inverted !== undefined)
      resolved.type.inverted = metadata.inverted;
    if (metadata.awaited !== undefined) resolved.type.await = metadata.awaited;
    return resolved;
  }
  const args = parseNamedArguments(source.slice('@exact'.length));
  if (typeof args.id !== 'string' || !Array.isArray(args.parameters)) {
    fail('IFDO_SYNTAX', '@exact requires id="..." and parameters=[...].', line);
  }
  if (!args.parameters.every(parameter => typeof parameter === 'string')) {
    fail('IFDO_SYNTAX', '@exact parameters must be strings.', line);
  }
  Object.keys(args).forEach(key => {
    if (key !== 'id' && key !== 'parameters') {
      fail('IFDO_SYNTAX', `Unknown @exact argument ${key}.`, line);
    }
  });
  return {
    type: {
      value: args.id,
      inverted: !!metadata.inverted,
      await: !!metadata.awaited,
    },
    disabled: !!metadata.disabled,
    parameters: args.parameters,
    subInstructions: [],
  };
};

const normalizeInstruction = (value: any, label: string): LegacyInstruction => {
  const instruction = asObject(value, label);
  assertOnlyKeys(
    instruction,
    new Set(['type', 'disabled', 'parameters', 'subInstructions']),
    label
  );
  const type = asObject(instruction.type, `${label}.type`);
  assertOnlyKeys(
    type,
    new Set(['value', 'inverted', 'await']),
    `${label}.type`
  );
  if (typeof type.value !== 'string' || !type.value) {
    fail(
      'IFDO_INVALID_JSON',
      `${label}.type.value must be a non-empty string.`
    );
  }
  const parameters = asArray(instruction.parameters, `${label}.parameters`);
  if (!parameters.every(parameter => typeof parameter === 'string')) {
    fail('IFDO_INVALID_JSON', `${label}.parameters must contain strings.`);
  }
  return {
    type: {
      value: type.value,
      inverted: !!type.inverted,
      await: !!type.await,
    },
    disabled: !!instruction.disabled,
    parameters: [...parameters],
    subInstructions: asArray(
      instruction.subInstructions,
      `${label}.subInstructions`
    ).map((child, index) =>
      normalizeInstruction(child, `${label}.subInstructions[${index}]`)
    ),
  };
};

class IfDoParser {
  lines: Array<SourceLine>;
  index: number = 0;
  options: CompileOptions;
  pendingInstructionMetadata: { [string]: Metadata } = {};

  constructor(source: string, options: CompileOptions) {
    this.lines = scanSource(source);
    this.options = options;
  }

  instructionKey(depth: number, instructionDepth: number): string {
    return `${depth}:${instructionDepth}`;
  }

  takeInstructionMetadata(depth: number, instructionDepth: number): Metadata {
    const key = this.instructionKey(depth, instructionDepth);
    const metadata = this.pendingInstructionMetadata[key] || {};
    delete this.pendingInstructionMetadata[key];
    return metadata;
  }

  parseInstruction(
    kind: 'condition' | 'action',
    source: string,
    line: SourceLine
  ): LegacyInstruction {
    const instruction = parseExactInstruction(
      source,
      kind,
      this.takeInstructionMetadata(line.depth, line.instructionDepth),
      this.options,
      line.line
    );
    this.index++;
    while (this.index < this.lines.length) {
      const next = this.lines[this.index];
      if (
        next.depth !== line.depth ||
        next.instructionDepth !== line.instructionDepth + 1
      )
        break;
      if (next.text.startsWith('@instruction')) {
        const key = this.instructionKey(next.depth, next.instructionDepth);
        if (this.pendingInstructionMetadata[key]) {
          fail('IFDO_SYNTAX', 'Duplicate pending @instruction.', next.line);
        }
        const metadata = parseNamedArguments(
          next.text.slice('@instruction'.length)
        );
        assertMetadata(
          metadata,
          { disabled: 'boolean', inverted: 'boolean', awaited: 'boolean' },
          '@instruction',
          next.line
        );
        this.pendingInstructionMetadata[key] = metadata;
        this.index++;
        continue;
      }
      instruction.subInstructions.push(
        this.parseInstruction(kind, next.text, next)
      );
    }
    return instruction;
  }

  parseList(depth: number, stopAtGroupEnd: boolean = false): Array<Object> {
    const events = [];
    let current = null;
    let pendingEventMetadata = {};
    let hasPendingEventMetadata = false;
    let pendingVariables = [];
    let pendingSpecialMetadata = {};

    const finish = () => {
      if (current && current.__ifdoWhileLimit) {
        if (!this.options.lowerWhileLimit) {
          fail(
            'IFDO_LOWERING_REQUIRED',
            'while limit= requires a project-aware lowerWhileLimit callback.',
            current.__ifdoWhileLimit.line
          );
        }
        const marker = current.__ifdoWhileLimit;
        const event = { ...current };
        delete event.__ifdoWhileLimit;
        current = normalizeEvent(
          this.options.lowerWhileLimit({
            limit: marker.limit,
            event,
            line: marker.line,
          }),
          `while limit lowered at line ${marker.line}`
        );
      }
      if (current) events.push(current);
      current = null;
    };

    const createInstructionEvent = (type: string): Object => ({
      ...commonEvent(type, pendingEventMetadata),
      conditions: [],
      actions: [],
      events: [],
      variables: pendingVariables,
    });

    const takeSpecialMetadata = (
      owner: 'comment' | 'group' | 'while' | null,
      line: number
    ): Metadata => {
      const names = Object.keys(pendingSpecialMetadata);
      if (names.some(name => name !== owner)) {
        fail(
          'IFDO_SYNTAX',
          `@${names[0]} metadata cannot attach to ${owner || 'this event'}.`,
          line
        );
      }
      const metadata = owner ? pendingSpecialMetadata[owner] || {} : {};
      pendingSpecialMetadata = {};
      return metadata;
    };

    const rejectPendingVariables = (owner: string, line: number) => {
      if (pendingVariables.length) {
        fail('IFDO_SYNTAX', `Local variables cannot attach to ${owner}.`, line);
      }
    };

    while (this.index < this.lines.length) {
      const line = this.lines[this.index];
      if (line.depth < depth) break;
      if (line.depth > depth) {
        if (!current) {
          fail('IFDO_DEPTH', 'Sub-event has no parent event.', line.line);
        }
        if (line.depth !== depth + 1) {
          fail(
            'IFDO_DEPTH',
            'Event depth may increase by only one.',
            line.line
          );
        }
        current.events = this.parseList(depth + 1);
        continue;
      }
      if (line.instructionDepth > 0) {
        fail(
          'IFDO_DEPTH',
          'Instruction child has no parent instruction.',
          line.line
        );
      }
      const text = line.text.trim();
      if (stopAtGroupEnd && text === 'end') {
        finish();
        this.index++;
        return events;
      }
      if (text === 'end') fail('IFDO_SYNTAX', 'Unexpected end.', line.line);

      if (text.startsWith('@event')) {
        if (hasPendingEventMetadata) {
          fail('IFDO_SYNTAX', '@event has no owning event.', line.line);
        }
        finish();
        pendingEventMetadata = parseNamedArguments(text.slice('@event'.length));
        assertMetadata(
          pendingEventMetadata,
          {
            disabled: 'boolean',
            folded: 'boolean',
            aiGeneratedEventId: 'string',
          },
          '@event',
          line.line
        );
        hasPendingEventMetadata = true;
        this.index++;
        continue;
      }
      if (text.startsWith('@instruction')) {
        const key = this.instructionKey(depth, 0);
        if (this.pendingInstructionMetadata[key]) {
          fail('IFDO_SYNTAX', 'Duplicate pending @instruction.', line.line);
        }
        const metadata = parseNamedArguments(text.slice('@instruction'.length));
        assertMetadata(
          metadata,
          { disabled: 'boolean', inverted: 'boolean', awaited: 'boolean' },
          '@instruction',
          line.line
        );
        this.pendingInstructionMetadata[key] = metadata;
        this.index++;
        continue;
      }
      if (/^@(comment|group|while)(?:\s|$)/.test(text)) {
        const name = text.slice(1).split(/\s/, 1)[0];
        const metadata = parseNamedArguments(text.slice(name.length + 1));
        const schemas = {
          comment: {
            background: 'rgb',
            text: 'rgb',
            comment2: 'string',
          },
          group: {
            source: 'string',
            creationTime: 'number',
            color: 'rgb',
            parameters: 'strings',
          },
          while: { infiniteLoopWarning: 'boolean' },
        };
        assertMetadata(metadata, schemas[name], `@${name}`, line.line);
        pendingSpecialMetadata[name] = metadata;
        this.index++;
        continue;
      }
      if (text.startsWith('local ')) {
        const variable = parseLocalVariable(text, line.line);
        if (current) {
          if (
            current.type !== EVENT_TYPES.else ||
            current.actions.length ||
            current.events.length
          ) {
            fail('IFDO_SYNTAX', 'local must precede its event.', line.line);
          }
          if (current.variables.some(item => item.name === variable.name)) {
            fail(
              'IFDO_SYNTAX',
              `Duplicate local variable ${variable.name}.`,
              line.line
            );
          }
          current.variables.push(variable);
        } else {
          if (pendingVariables.some(item => item.name === variable.name)) {
            fail(
              'IFDO_SYNTAX',
              `Duplicate local variable ${variable.name}.`,
              line.line
            );
          }
          pendingVariables.push(variable);
        }
        this.index++;
        continue;
      }

      if (text.startsWith('#')) {
        finish();
        rejectPendingVariables('a comment', line.line);
        const metadata = takeSpecialMetadata('comment', line.line);
        const color = metadata.background || [255, 230, 109];
        const textColor = metadata.text || [0, 0, 0];
        current = {
          ...commonEvent(EVENT_TYPES.comment, pendingEventMetadata),
          color: {
            r: Number(color[0] || 0),
            g: Number(color[1] || 0),
            b: Number(color[2] || 0),
            textR: Number(textColor[0] || 0),
            textG: Number(textColor[1] || 0),
            textB: Number(textColor[2] || 0),
          },
          comment: unescapeComment(text.slice(1).replace(/^ /, '')),
          comment2: metadata.comment2 == null ? '' : String(metadata.comment2),
        };
        pendingEventMetadata = {};
        hasPendingEventMetadata = false;
        finish();
        this.index++;
        continue;
      }

      if (text.startsWith('group ')) {
        finish();
        rejectPendingVariables('a group', line.line);
        const metadata = takeSpecialMetadata('group', line.line);
        const nameSource = text.slice('group '.length).trim();
        current = {
          ...commonEvent(EVENT_TYPES.group, pendingEventMetadata),
          name: parseStringOrRaw(nameSource),
          source: metadata.source == null ? '' : String(metadata.source),
          creationTime: Number(metadata.creationTime || 0),
          colorR: Number((metadata.color || [74, 176, 228])[0]),
          colorG: Number((metadata.color || [74, 176, 228])[1]),
          colorB: Number((metadata.color || [74, 176, 228])[2]),
          parameters: Array.isArray(metadata.parameters)
            ? metadata.parameters.map(String)
            : [],
          events: [],
        };
        pendingEventMetadata = {};
        hasPendingEventMetadata = false;
        this.index++;
        current.events = this.parseList(depth, true);
        finish();
        continue;
      }

      if (line.jsBody !== undefined) {
        finish();
        rejectPendingVariables('JavaScript', line.line);
        takeSpecialMetadata(null, line.line);
        const args = parseNamedArguments(text.slice('js'.length));
        assertMetadata(
          args,
          {
            objects: 'string',
            strict: 'boolean',
            expanded: 'boolean',
            delimiter: 'string',
          },
          'js',
          line.line
        );
        current = {
          ...commonEvent(
            this.options.jsCodeEventType || EVENT_TYPES.js,
            pendingEventMetadata
          ),
          inlineCode: line.jsBody,
          parameterObjects: args.objects == null ? '' : String(args.objects),
          useStrict: !!args.strict,
          eventsSheetExpanded: !!args.expanded,
        };
        pendingEventMetadata = {};
        hasPendingEventMetadata = false;
        finish();
        this.index++;
        continue;
      }

      if (text.startsWith('link ')) {
        finish();
        rejectPendingVariables('a link', line.line);
        takeSpecialMetadata(null, line.line);
        const link = parseLink(text, line.line);
        current = {
          ...commonEvent(EVENT_TYPES.link, pendingEventMetadata),
          ...link,
        };
        pendingEventMetadata = {};
        hasPendingEventMetadata = false;
        finish();
        this.index++;
        continue;
      }

      if (text.startsWith('and while ')) {
        if (!current || current.type !== EVENT_TYPES.while) {
          fail('IFDO_SYNTAX', 'and while requires a while event.', line.line);
        }
        if (
          current.conditions.length ||
          current.actions.length ||
          current.events.length
        ) {
          fail(
            'IFDO_SYNTAX',
            'and while must precede ordinary conditions, actions, and child events.',
            line.line
          );
        }
        current.whileConditions.push(
          this.parseInstruction(
            'condition',
            text.slice('and while '.length),
            line
          )
        );
        continue;
      }

      const structural = parseStructuralHeader(text, line.line);
      if (structural) {
        finish();
        const specialMetadata = takeSpecialMetadata(
          structural.type === EVENT_TYPES.while ? 'while' : null,
          line.line
        );
        current = {
          ...commonEvent(structural.type, pendingEventMetadata),
          ...structural.fields,
          conditions: [],
          actions: [],
          events: [],
          variables: pendingVariables,
        };
        if (structural.type === EVENT_TYPES.while) {
          current.infiniteLoopWarning = !!specialMetadata.infiniteLoopWarning;
          current.whileConditions = [];
          if (structural.sourceOnlyLimit) {
            current.__ifdoWhileLimit = {
              limit: structural.sourceOnlyLimit,
              line: line.line,
            };
          }
          if (structural.initialCondition) {
            current.whileConditions.push(
              this.parseInstruction(
                'condition',
                structural.initialCondition,
                line
              )
            );
          } else this.index++;
        } else if (structural.initialCondition) {
          current.conditions.push(
            this.parseInstruction(
              'condition',
              structural.initialCondition,
              line
            )
          );
        } else this.index++;
        pendingEventMetadata = {};
        hasPendingEventMetadata = false;
        pendingVariables = [];
        continue;
      }

      if (text === 'event') {
        finish();
        takeSpecialMetadata(null, line.line);
        current = createInstructionEvent(EVENT_TYPES.standard);
        pendingEventMetadata = {};
        hasPendingEventMetadata = false;
        pendingVariables = [];
        this.index++;
        continue;
      }

      if (text === 'else' || text.startsWith('else if ')) {
        finish();
        takeSpecialMetadata(null, line.line);
        current = createInstructionEvent(EVENT_TYPES.else);
        pendingEventMetadata = {};
        hasPendingEventMetadata = false;
        pendingVariables = [];
        if (text.startsWith('else if ')) {
          current.conditions.push(
            this.parseInstruction(
              'condition',
              text.slice('else if '.length),
              line
            )
          );
        } else this.index++;
        continue;
      }

      if (text.startsWith('if ')) {
        if (!current || current.actions.length || current.events.length) {
          finish();
          takeSpecialMetadata(null, line.line);
          current = createInstructionEvent(EVENT_TYPES.standard);
          pendingEventMetadata = {};
          hasPendingEventMetadata = false;
          pendingVariables = [];
        }
        const destination =
          current.type === EVENT_TYPES.while && !current.conditions.length
            ? current.conditions
            : current.conditions;
        destination.push(
          this.parseInstruction('condition', text.slice('if '.length), line)
        );
        continue;
      }

      if (text.startsWith('or ')) {
        if (!current) fail('IFDO_SYNTAX', 'or has no owning event.', line.line);
        const destination =
          current.type === EVENT_TYPES.while &&
          current.whileConditions &&
          !current.conditions.length &&
          !current.actions.length
            ? current.whileConditions
            : current.conditions;
        if (
          destination === current.whileConditions &&
          current.whileConditions.length > 1
        ) {
          fail(
            'IFDO_SYNTAX',
            'while or alternatives must precede and while siblings.',
            line.line
          );
        }
        if (!destination.length) {
          fail('IFDO_SYNTAX', 'or requires a preceding condition.', line.line);
        }
        const alternative = this.parseInstruction(
          'condition',
          text.slice('or '.length),
          line
        );
        const previous = destination[destination.length - 1];
        if (previous.type.value === 'BuiltinCommonInstructions::Or') {
          previous.subInstructions.push(alternative);
        } else {
          destination[destination.length - 1] = {
            type: {
              value: 'BuiltinCommonInstructions::Or',
              inverted: false,
              await: false,
            },
            disabled: false,
            parameters: [],
            subInstructions: [previous, alternative],
          };
        }
        continue;
      }

      if (text.startsWith('do ')) {
        if (!current) {
          takeSpecialMetadata(null, line.line);
          current = createInstructionEvent(EVENT_TYPES.standard);
          pendingEventMetadata = {};
          hasPendingEventMetadata = false;
          pendingVariables = [];
        }
        if (current.events.length) {
          fail('IFDO_SYNTAX', 'Action cannot follow a sub-event.', line.line);
        }
        let action = text.slice('do '.length);
        let awaited = false;
        if (action.startsWith('await ')) {
          awaited = true;
          action = action.slice('await '.length);
        }
        const key = this.instructionKey(depth, 0);
        if (
          awaited &&
          this.pendingInstructionMetadata[key] &&
          this.pendingInstructionMetadata[key].awaited === false
        ) {
          fail(
            'IFDO_SYNTAX',
            'do await conflicts with @instruction awaited=false.',
            line.line
          );
        }
        this.pendingInstructionMetadata[key] = {
          ...(this.pendingInstructionMetadata[key] || {}),
          ...(awaited ? { awaited: true } : {}),
        };
        current.actions.push(this.parseInstruction('action', action, line));
        continue;
      }

      fail('IFDO_SYNTAX', `Unknown statement: ${text}`, line.line);
    }
    finish();
    if (hasPendingEventMetadata) {
      fail('IFDO_SYNTAX', '@event has no owning event.');
    }
    if (Object.keys(pendingSpecialMetadata).length) {
      fail('IFDO_SYNTAX', 'Typed event metadata has no compatible owner.');
    }
    if (pendingVariables.length) {
      fail('IFDO_SYNTAX', 'Local declarations have no owning event.');
    }
    if (stopAtGroupEnd) fail('IFDO_SYNTAX', 'Unterminated group.');
    return events;
  }

  parse(): Array<Object> {
    const events = this.parseList(0);
    if (this.index !== this.lines.length) {
      fail(
        'IFDO_SYNTAX',
        'Unexpected trailing source.',
        this.lines[this.index].line
      );
    }
    if (Object.keys(this.pendingInstructionMetadata).length) {
      fail('IFDO_SYNTAX', '@instruction has no owning instruction.');
    }
    return events;
  }
}

const parseStringOrRaw = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"')) {
    const reader = new ValueReader(trimmed);
    const parsed = reader.readString();
    if (!reader.eof()) fail('IFDO_SYNTAX', 'Unexpected text after string.');
    return parsed;
  }
  return trimmed;
};

const parseLocalVariable = (text: string, line: number): Object => {
  const match = /^local\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*([^=]+?))?\s*=\s*([\s\S]+)$/.exec(
    text
  );
  if (!match) fail('IFDO_SYNTAX', 'Invalid local declaration.', line);
  const suffixStart = match[3].search(/\s+(?:uuid|folded)=/);
  const initializerSource =
    suffixStart === -1 ? match[3] : match[3].slice(0, suffixStart);
  const suffix =
    suffixStart === -1 ? {} : parseNamedArguments(match[3].slice(suffixStart));
  Object.keys(suffix).forEach(key => {
    if (key !== 'uuid' && key !== 'folded') {
      fail('IFDO_SYNTAX', `Unknown local metadata ${key}.`, line);
    }
  });
  const reader = new ValueReader(initializerSource);
  const value = reader.readValue();
  if (!reader.eof())
    fail('IFDO_SYNTAX', 'Unexpected local variable text.', line);
  if (!value || value.__ifdoVariable !== true) {
    const variable = inferSimpleVariable(match[1], value);
    applyDeclaredVariableType(variable, match[2], line);
    if (suffix.uuid !== undefined)
      variable.persistentUuid = String(suffix.uuid);
    if (suffix.folded !== undefined) variable.folded = !!suffix.folded;
    return variable;
  }
  const variable = variableFromExact(match[1], value, line);
  if (match[2] && match[2].trim() !== variable.type) {
    fail('IFDO_SYNTAX', 'Declared type conflicts with var(...) type.', line);
  }
  if (suffix.uuid !== undefined) variable.persistentUuid = String(suffix.uuid);
  if (suffix.folded !== undefined) variable.folded = !!suffix.folded;
  return variable;
};

const applyDeclaredVariableType = (
  variable: Object,
  declaredType: ?string,
  line: number
) => {
  if (!declaredType) return;
  const type = declaredType.trim();
  const enumMatch = /^enum\(([\s\S]*)\)$/.exec(type);
  if (enumMatch) {
    if (variable.type !== 'string')
      fail('IFDO_SYNTAX', 'Enum initializer must be a string.', line);
    const reader = new ValueReader(`[${enumMatch[1]}]`);
    const values = reader.readArray();
    if (!reader.eof() || !values.every(value => typeof value === 'string'))
      fail('IFDO_SYNTAX', 'Enum values must be strings.', line);
    variable.type = 'enum';
    variable.values = values;
    return;
  }
  const aliases = { bool: 'boolean' };
  const expected = aliases[type] || type;
  if (
    !['string', 'number', 'boolean', 'structure', 'array', 'mixed'].includes(
      expected
    )
  )
    fail('IFDO_SYNTAX', `Unknown local type ${type}.`, line);
  if (expected !== 'mixed' && variable.type !== expected)
    fail('IFDO_SYNTAX', `Initializer does not match declared ${type}.`, line);
  variable.type = expected;
};

const inferSimpleVariable = (name: string, value: any): Object => {
  if (typeof value === 'string') return { name, type: 'string', value };
  if (typeof value === 'number') return { name, type: 'number', value };
  if (typeof value === 'boolean') return { name, type: 'boolean', value };
  if (Array.isArray(value)) {
    return {
      name,
      type: 'array',
      children: value
        .map((child, index) => inferSimpleVariable(String(index), child))
        .map(({ name: ignored, ...child }) => child),
    };
  }
  if (value && typeof value === 'object') {
    return {
      name,
      type: 'structure',
      children: Object.keys(value).map(childName =>
        inferSimpleVariable(childName, value[childName])
      ),
    };
  }
  fail('IFDO_SYNTAX', `Unsupported local value for ${name}.`);
};

const variableFromExact = (
  name: string,
  exact: Object,
  line: number
): Object => {
  const allowed = new Set([
    '__ifdoVariable',
    'type',
    'value',
    'values',
    'children',
    'persistentUuid',
    'folded',
    'hasMixedValues',
  ]);
  assertOnlyKeys(exact, allowed, `var(${name})`);
  const type = exact.type;
  if (
    ![
      'string',
      'enum',
      'number',
      'boolean',
      'structure',
      'array',
      'mixed',
    ].includes(type)
  ) {
    fail('IFDO_SYNTAX', `Invalid variable type for ${name}.`, line);
  }
  const variable = { name, type };
  if (exact.folded !== undefined && typeof exact.folded !== 'boolean')
    fail('IFDO_SYNTAX', `var(${name}).folded must be boolean.`, line);
  if (
    exact.persistentUuid !== undefined &&
    typeof exact.persistentUuid !== 'string'
  )
    fail('IFDO_SYNTAX', `var(${name}).persistentUuid must be a string.`, line);
  if (
    exact.hasMixedValues !== undefined &&
    typeof exact.hasMixedValues !== 'boolean'
  )
    fail('IFDO_SYNTAX', `var(${name}).hasMixedValues must be boolean.`, line);
  if (exact.folded !== undefined) variable.folded = exact.folded;
  if (exact.persistentUuid !== undefined)
    variable.persistentUuid = exact.persistentUuid;
  if (exact.hasMixedValues !== undefined)
    variable.hasMixedValues = exact.hasMixedValues;
  if (['string', 'enum', 'number', 'boolean'].includes(type)) {
    if (exact.value === undefined)
      fail('IFDO_SYNTAX', `var(${name}) requires value.`, line);
    const valueHasExpectedType =
      (type === 'number' &&
        typeof exact.value === 'number' &&
        Number.isFinite(exact.value)) ||
      (type === 'boolean' && typeof exact.value === 'boolean') ||
      ((type === 'string' || type === 'enum') &&
        typeof exact.value === 'string');
    if (!valueHasExpectedType)
      fail('IFDO_SYNTAX', `var(${name}).value does not match ${type}.`, line);
    if (exact.children !== undefined)
      fail(
        'IFDO_SYNTAX',
        `var(${name}).children is invalid for ${type}.`,
        line
      );
    if (type !== 'enum' && exact.values !== undefined)
      fail('IFDO_SYNTAX', `var(${name}).values is valid only for enum.`, line);
    variable.value = exact.value;
    if (type === 'enum') {
      const values = asArray(exact.values, `var(${name}).values`);
      if (!values.every(value => typeof value === 'string'))
        fail('IFDO_SYNTAX', `var(${name}).values must contain strings.`, line);
      variable.values = values;
    }
  } else if (type === 'structure') {
    if (exact.value !== undefined || exact.values !== undefined)
      fail('IFDO_SYNTAX', `var(${name}) structure cannot have value.`, line);
    if (exact.children === undefined)
      fail('IFDO_SYNTAX', `var(${name}) requires children.`, line);
    const children = asObject(exact.children, `var(${name}).children`);
    variable.children = Object.keys(children)
      .sort()
      .map(childName =>
        variableFromExact(childName, children[childName], line)
      );
  } else if (type === 'array') {
    if (exact.value !== undefined || exact.values !== undefined)
      fail('IFDO_SYNTAX', `var(${name}) array cannot have value.`, line);
    if (exact.children === undefined)
      fail('IFDO_SYNTAX', `var(${name}) requires children.`, line);
    variable.children = asArray(exact.children, `var(${name}).children`).map(
      (child, index) => {
        const parsed = variableFromExact(String(index), child, line);
        delete parsed.name;
        return parsed;
      }
    );
  } else if (
    exact.value !== undefined ||
    exact.values !== undefined ||
    exact.children !== undefined
  ) {
    fail(
      'IFDO_SYNTAX',
      `var(${name}) mixed variable cannot have a value.`,
      line
    );
  }
  return variable;
};

const parseLink = (text: string, line: number): Object => {
  const source = text.slice('link '.length).replace(/^(external|scene)\s+/, '');
  const reader = new ValueReader(source);
  const target = reader.readString();
  const remainder = source.slice(reader.index);
  const range = /^\s*range=(-?\d+)\.\.(-?\d+)\s*$/.exec(remainder);
  if (range) {
    return {
      target,
      include: {
        includeConfig: 2,
        start: Number(range[1]),
        end: Number(range[2]),
      },
    };
  }
  const args = parseNamedArguments(remainder);
  Object.keys(args).forEach(key => {
    if (key !== 'group') {
      fail('IFDO_SYNTAX', `Unknown link argument ${key}.`, line);
    }
  });
  if (args.group !== undefined && typeof args.group !== 'string') {
    fail('IFDO_SYNTAX', 'link group must be a string.', line);
  }
  if (args.group !== undefined) {
    return {
      target,
      include: { includeConfig: 1, eventsGroup: String(args.group) },
    };
  }
  return { target, include: { includeConfig: 0 } };
};

const extractTrailing = (
  source: string,
  names: Array<string>
): { head: string, values: Metadata } => {
  let head = source;
  const values = {};
  names
    .slice()
    .reverse()
    .forEach(name => {
      const pattern = new RegExp(
        `(?:^|\\s)${name}=("(?:\\\\.|[^"\\\\])*"|[^\\s]+)\\s*$`
      );
      const match = pattern.exec(head);
      if (match) {
        values[name] = parseStringOrRaw(match[1]);
        head = head.slice(0, match.index);
      }
    });
  return { head: head.trim(), values };
};

const parseStructuralHeader = (
  text: string,
  line: number
): ?{
  type: string,
  fields: Object,
  initialCondition?: string,
  sourceOnlyLimit?: string,
} => {
  if (text.startsWith('repeat ')) {
    const parsed = extractTrailing(text.slice(7), ['index']);
    return {
      type: EVENT_TYPES.repeat,
      fields: {
        repeatExpression: parseStringOrRaw(parsed.head),
        loopIndexVariable: parsed.values.index || '',
      },
    };
  }
  if (text.startsWith('for each child ')) {
    const parsed = extractTrailing(text.slice(15), ['index']);
    const valueToken = '("(?:\\\\.|[^"\\\\])*"|\\S+)';
    const match = new RegExp(
      `^${valueToken}\\s+(?:as\\s+${valueToken}|value=${valueToken}(?:\\s+key=${valueToken})?)$`
    ).exec(parsed.head);
    if (!match) fail('IFDO_SYNTAX', 'Invalid for each child header.', line);
    return {
      type: EVENT_TYPES.forEachChild,
      fields: {
        iterableVariableName: parseStringOrRaw(match[1]),
        valueIteratorVariableName: parseStringOrRaw(match[2] || match[3] || ''),
        keyIteratorVariableName: parseStringOrRaw(match[4] || ''),
        loopIndexVariable: parsed.values.index || '',
      },
    };
  }
  if (text.startsWith('for each ')) {
    const parsed = extractTrailing(text.slice(9), [
      'index',
      'order_by',
      'order',
      'limit',
    ]);
    return {
      type: EVENT_TYPES.forEach,
      fields: {
        object: parseStringOrRaw(parsed.head),
        loopIndexVariable: parsed.values.index || '',
        orderBy: parsed.values.order_by || '',
        order: parsed.values.order || 'asc',
        limit: parsed.values.limit || '',
      },
    };
  }
  if (text === 'while' || text.startsWith('while ')) {
    const parsed = extractTrailing(text.slice('while'.length).trim(), [
      'limit',
      'index',
    ]);
    return {
      type: EVENT_TYPES.while,
      fields: { loopIndexVariable: parsed.values.index || '' },
      ...(parsed.head ? { initialCondition: parsed.head } : {}),
      ...(parsed.values.limit !== undefined
        ? { sourceOnlyLimit: String(parsed.values.limit) }
        : {}),
    };
  }
  return null;
};

const escapeComment = (value: string): string => {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
  return escaped.replace(/[ ]+$/g, spaces => '\\u0020'.repeat(spaces.length));
};

const unescapeComment = (value: string): string => {
  let output = '';
  for (let index = 0; index < value.length; index++) {
    if (value[index] === '\\' && index + 1 < value.length) {
      const next = value[++index];
      if (next === 'n') output += '\n';
      else if (next === 'r') output += '\r';
      else if (next === 't') output += '\t';
      else if (next === 'u' && /^[0-9A-Fa-f]{4}/.test(value.slice(index + 1))) {
        output += String.fromCharCode(
          parseInt(value.slice(index + 1, index + 5), 16)
        );
        index += 4;
      } else output += next;
    } else output += value[index];
  }
  return output;
};

const chooseJavaScriptDelimiter = (body: string, depth: number): string => {
  const physicalLines = splitPhysicalLines(body);
  const hasTerminator = (terminator: string): boolean =>
    physicalLines.some((physicalLine, index) => {
      // The final synthetic line only exists to represent a trailing newline.
      if (!physicalLine.text && index + 1 === physicalLines.length)
        return false;
      const parsed = parsePrefix(physicalLine.text, index + 1);
      return (
        parsed.depth === depth &&
        parsed.instructionDepth === 0 &&
        parsed.text.trim() === terminator
      );
    });
  if (!hasTerminator('end js')) return '';
  let suffix = 1;
  while (hasTerminator(`end js IFDO_${suffix}`)) suffix++;
  return `IFDO_${suffix}`;
};

const normalizeVariable = (
  value: any,
  label: string,
  requireName: boolean = true
): Object => {
  const variable = asObject(value, label);
  const allowed = new Set([
    'name',
    'type',
    'folded',
    'persistentUuid',
    'value',
    'values',
    'children',
    'hasMixedValues',
  ]);
  assertOnlyKeys(variable, allowed, label);
  if (requireName && typeof variable.name !== 'string') {
    fail('IFDO_INVALID_JSON', `${label} requires a string name.`);
  }
  const type =
    variable.type === undefined
      ? variable.children !== undefined
        ? 'structure'
        : 'string'
      : variable.type;
  if (typeof type !== 'string')
    fail('IFDO_INVALID_JSON', `${label}.type must be a string.`);
  const result = {
    ...(typeof variable.name === 'string' ? { name: variable.name } : {}),
    type,
    folded: !!variable.folded,
    persistentUuid: String(variable.persistentUuid || ''),
    hasMixedValues: !!variable.hasMixedValues,
  };
  if (['string', 'enum', 'number', 'boolean'].includes(type)) {
    result.value =
      variable.value !== undefined
        ? variable.value
        : type === 'string'
        ? '0'
        : type === 'enum'
        ? ''
        : type === 'number'
        ? 0
        : false;
    if (type === 'enum')
      result.values = asArray(variable.values, `${label}.values`).map(String);
  } else if (type === 'structure' || type === 'array') {
    result.children = asArray(variable.children, `${label}.children`).map(
      (child, index) =>
        normalizeVariable(
          child,
          `${label}.children[${index}]`,
          type === 'structure'
        )
    );
  } else if (type !== 'mixed') {
    fail('IFDO_UNSUPPORTED_FIELD', `${label} has unknown type ${type}.`);
  }
  return result;
};

const normalizeCommon = (event: Object): Object => {
  const common = {
    type: event.type,
    disabled: !!event.disabled,
    folded: !!event.folded,
  };
  if (event.aiGeneratedEventId)
    common.aiGeneratedEventId = String(event.aiGeneratedEventId);
  return common;
};

const normalizeEvent = (value: any, label: string): Object => {
  const event = asObject(value, label);
  const type = event.type;
  if (typeof type !== 'string' || !EVENT_KEYS[type]) {
    fail(
      'IFDO_UNSUPPORTED_EVENT',
      `${label} has unsupported event type ${JSON.stringify(type)}.`
    );
  }
  assertOnlyKeys(event, EVENT_KEYS[type], label);
  const common = normalizeCommon(event);
  const instructions = key =>
    asArray(event[key], `${label}.${key}`).map((item, index) =>
      normalizeInstruction(item, `${label}.${key}[${index}]`)
    );
  const children = () =>
    asArray(event.events, `${label}.events`).map((item, index) =>
      normalizeEvent(item, `${label}.events[${index}]`)
    );
  const variables = () =>
    asArray(event.variables, `${label}.variables`).map((item, index) =>
      normalizeVariable(item, `${label}.variables[${index}]`)
    );
  if (type === EVENT_TYPES.standard || type === EVENT_TYPES.else) {
    return {
      ...common,
      conditions: instructions('conditions'),
      actions: instructions('actions'),
      events: children(),
      variables: variables(),
    };
  }
  if (type === EVENT_TYPES.while) {
    return {
      ...common,
      infiniteLoopWarning: !!event.infiniteLoopWarning,
      whileConditions: instructions('whileConditions'),
      conditions: instructions('conditions'),
      actions: instructions('actions'),
      events: children(),
      variables: variables(),
      loopIndexVariable: String(event.loopIndexVariable || ''),
    };
  }
  if (type === EVENT_TYPES.repeat) {
    return {
      ...common,
      repeatExpression: String(event.repeatExpression || ''),
      conditions: instructions('conditions'),
      actions: instructions('actions'),
      events: children(),
      variables: variables(),
      loopIndexVariable: String(event.loopIndexVariable || ''),
    };
  }
  if (type === EVENT_TYPES.forEach) {
    return {
      ...common,
      object: String(event.object || ''),
      conditions: instructions('conditions'),
      actions: instructions('actions'),
      events: children(),
      variables: variables(),
      loopIndexVariable: String(event.loopIndexVariable || ''),
      orderBy: String(event.orderBy || ''),
      order: String(event.order || 'asc'),
      limit: String(event.limit || ''),
    };
  }
  if (type === EVENT_TYPES.forEachChild) {
    return {
      ...common,
      iterableVariableName: String(event.iterableVariableName || ''),
      valueIteratorVariableName: String(event.valueIteratorVariableName || ''),
      keyIteratorVariableName: String(event.keyIteratorVariableName || ''),
      conditions: instructions('conditions'),
      actions: instructions('actions'),
      events: children(),
      variables: variables(),
      loopIndexVariable: String(event.loopIndexVariable || ''),
    };
  }
  if (type === EVENT_TYPES.group) {
    return {
      ...common,
      name: String(event.name || ''),
      source: String(event.source || ''),
      creationTime: Number(event.creationTime || 0),
      colorR: Number(event.colorR == null ? 74 : event.colorR),
      colorG: Number(event.colorG == null ? 176 : event.colorG),
      colorB: Number(event.colorB == null ? 228 : event.colorB),
      parameters: asArray(event.parameters, `${label}.parameters`).map(String),
      events: children(),
    };
  }
  if (type === EVENT_TYPES.comment) {
    const color = asObject(event.color || {}, `${label}.color`);
    assertOnlyKeys(
      color,
      new Set(['r', 'g', 'b', 'textR', 'textG', 'textB']),
      `${label}.color`
    );
    return {
      ...common,
      color: {
        r: Number(color.r || 0),
        g: Number(color.g || 0),
        b: Number(color.b || 0),
        textR: Number(color.textR || 0),
        textG: Number(color.textG || 0),
        textB: Number(color.textB || 0),
      },
      comment: String(event.comment || ''),
      comment2: String(event.comment2 || ''),
    };
  }
  if (type === EVENT_TYPES.link) {
    const include = asObject(
      event.include || { includeConfig: 0 },
      `${label}.include`
    );
    assertOnlyKeys(
      include,
      new Set(['includeConfig', 'eventsGroup', 'start', 'end']),
      `${label}.include`
    );
    return {
      ...common,
      target: String(event.target || ''),
      include: {
        includeConfig: Number(include.includeConfig || 0),
        ...(include.eventsGroup !== undefined
          ? { eventsGroup: String(include.eventsGroup) }
          : {}),
        ...(include.start !== undefined
          ? { start: Number(include.start) }
          : {}),
        ...(include.end !== undefined ? { end: Number(include.end) } : {}),
      },
    };
  }
  return {
    ...common,
    inlineCode: String(event.inlineCode || ''),
    parameterObjects: String(event.parameterObjects || ''),
    useStrict: !!event.useStrict,
    eventsSheetExpanded: !!event.eventsSheetExpanded,
  };
};

const variableToExact = (variable: Object): string => {
  const fields = [`type=${quote(variable.type)}`];
  if (['string', 'enum', 'number', 'boolean'].includes(variable.type)) {
    fields.push(`value=${JSON.stringify(variable.value)}`);
    if (variable.type === 'enum')
      fields.push(`values=${JSON.stringify(variable.values || [])}`);
  } else if (variable.type === 'structure') {
    const children = (variable.children || []).map(
      child => `${quote(child.name)}:${variableToExact(child)}`
    );
    fields.push(`children={${children.join(',')}}`);
  } else if (variable.type === 'array') {
    fields.push(
      `children=[${(variable.children || []).map(variableToExact).join(',')}]`
    );
  }
  if (variable.persistentUuid !== undefined)
    fields.push(`persistentUuid=${quote(variable.persistentUuid)}`);
  if (variable.folded !== undefined) fields.push(`folded=${!!variable.folded}`);
  if (variable.hasMixedValues !== undefined)
    fields.push(`hasMixedValues=${!!variable.hasMixedValues}`);
  return `var(${fields.join(',')})`;
};

const eventMetadata = (event: Object): Metadata => ({
  ...(event.disabled ? { disabled: true } : {}),
  ...(event.folded ? { folded: true } : {}),
  ...(event.aiGeneratedEventId
    ? { aiGeneratedEventId: event.aiGeneratedEventId }
    : {}),
});

const formatInstructionLines = (
  instruction: LegacyInstruction,
  kind: 'condition' | 'action',
  depth: number,
  instructionDepth: number = 0,
  options: {
    rootKeyword?: 'if' | 'or' | 'do',
    expandLogicalOr?: boolean,
  } = {}
): Array<string> => {
  if (
    instructionDepth === 0 &&
    kind === 'condition' &&
    options.expandLogicalOr !== false &&
    instruction.type.value === 'BuiltinCommonInstructions::Or' &&
    !instruction.disabled &&
    !instruction.type.inverted &&
    !instruction.type.await &&
    (instruction.parameters || []).length === 0 &&
    (instruction.subInstructions || []).length >= 2
  ) {
    return (instruction.subInstructions || []).flatMap((child, index) =>
      formatInstructionLines(child, kind, depth, 0, {
        rootKeyword: index === 0 ? options.rootKeyword || 'if' : 'or',
        expandLogicalOr: false,
      })
    );
  }
  const lines = [];
  const prefix = depthPrefix(depth, instructionDepth);
  const flags = {
    ...(instruction.disabled ? { disabled: true } : {}),
    ...(instruction.type.inverted ? { inverted: true } : {}),
    ...(instruction.type.await ? { awaited: true } : {}),
  };
  if (Object.keys(flags).length) {
    lines.push(`${prefix}${formatMetadata('@instruction', flags)}`);
  }
  const instructionText = `@exact id=${quote(
    instruction.type.value
  )} parameters=${JSON.stringify(instruction.parameters || [])}`;
  const friendlyCandidate = formatFriendlyBuiltinInstruction(instruction, kind);
  let friendlyInstructionText = null;
  if (friendlyCandidate && !(instruction.subInstructions || []).length) {
    const resolvedCandidate = resolveFriendlyBuiltinInstruction(
      friendlyCandidate,
      kind
    );
    if (
      resolvedCandidate &&
      resolvedCandidate.type.value === instruction.type.value &&
      JSON.stringify(resolvedCandidate.parameters) ===
        JSON.stringify(instruction.parameters || [])
    ) {
      friendlyInstructionText = friendlyCandidate;
    }
  }
  const rootKeyword =
    options.rootKeyword || (kind === 'condition' ? 'if' : 'do');
  lines.push(
    `${prefix}${
      instructionDepth === 0 ? `${rootKeyword} ` : ''
    }${friendlyInstructionText || instructionText}`
  );
  (instruction.subInstructions || []).forEach(child => {
    lines.push(
      ...formatInstructionLines(child, kind, depth, instructionDepth + 1)
    );
  });
  return lines;
};

const appendInstructionEventBody = (
  lines: Array<string>,
  event: Object,
  depth: number,
  options?: { skipVariables?: boolean }
) => {
  if (!(options && options.skipVariables)) {
    (event.variables || []).forEach(variable => {
      lines.push(
        `${depthPrefix(depth)}local ${variable.name} = ${variableToExact(
          variable
        )}`
      );
    });
  }
  (event.conditions || []).forEach(instruction =>
    lines.push(...formatInstructionLines(instruction, 'condition', depth))
  );
  (event.actions || []).forEach(instruction =>
    lines.push(...formatInstructionLines(instruction, 'action', depth))
  );
};

const formatEvents = (
  events: Array<Object>,
  depth: number = 0
): Array<string> => {
  const lines = [];
  events.forEach((event, eventIndex) => {
    if (eventIndex) lines.push('');
    lines.push(
      `${depthPrefix(depth)}${formatMetadata('@event', eventMetadata(event))}`
    );
    if (event.type === EVENT_TYPES.standard) {
      appendInstructionEventBody(lines, event, depth);
      if (!event.conditions.length && !event.actions.length)
        lines.push(`${depthPrefix(depth)}event`);
      lines.push(...formatEvents(event.events || [], depth + 1));
      return;
    }
    if (event.type === EVENT_TYPES.else) {
      lines.push(`${depthPrefix(depth)}else`);
      (event.variables || []).forEach(variable =>
        lines.push(
          `${depthPrefix(depth)}local ${variable.name} = ${variableToExact(
            variable
          )}`
        )
      );
      event.conditions.forEach(instruction =>
        lines.push(...formatInstructionLines(instruction, 'condition', depth))
      );
      (event.actions || []).forEach(instruction =>
        lines.push(...formatInstructionLines(instruction, 'action', depth))
      );
      lines.push(...formatEvents(event.events || [], depth + 1));
      return;
    }
    if (event.type === EVENT_TYPES.repeat) {
      (event.variables || []).forEach(variable =>
        lines.push(
          `${depthPrefix(depth)}local ${variable.name} = ${variableToExact(
            variable
          )}`
        )
      );
      lines.push(
        `${depthPrefix(depth)}repeat ${quote(event.repeatExpression)}${
          event.loopIndexVariable
            ? ` index=${quote(event.loopIndexVariable)}`
            : ''
        }`
      );
      appendInstructionEventBody(lines, event, depth, { skipVariables: true });
      lines.push(...formatEvents(event.events || [], depth + 1));
      return;
    }
    if (event.type === EVENT_TYPES.forEach) {
      (event.variables || []).forEach(variable =>
        lines.push(
          `${depthPrefix(depth)}local ${variable.name} = ${variableToExact(
            variable
          )}`
        )
      );
      lines.push(
        `${depthPrefix(depth)}for each ${quote(event.object)}${
          event.loopIndexVariable
            ? ` index=${quote(event.loopIndexVariable)}`
            : ''
        }${
          event.orderBy
            ? ` order_by=${quote(event.orderBy)} order=${quote(event.order)}`
            : ''
        }${event.limit ? ` limit=${quote(event.limit)}` : ''}`
      );
      appendInstructionEventBody(lines, event, depth, { skipVariables: true });
      lines.push(...formatEvents(event.events || [], depth + 1));
      return;
    }
    if (event.type === EVENT_TYPES.forEachChild) {
      (event.variables || []).forEach(variable =>
        lines.push(
          `${depthPrefix(depth)}local ${variable.name} = ${variableToExact(
            variable
          )}`
        )
      );
      lines.push(
        `${depthPrefix(depth)}for each child ${quote(
          event.iterableVariableName
        )} value=${quote(event.valueIteratorVariableName)}${
          event.keyIteratorVariableName
            ? ` key=${quote(event.keyIteratorVariableName)}`
            : ''
        }${
          event.loopIndexVariable
            ? ` index=${quote(event.loopIndexVariable)}`
            : ''
        }`
      );
      appendInstructionEventBody(lines, event, depth, { skipVariables: true });
      lines.push(...formatEvents(event.events || [], depth + 1));
      return;
    }
    if (event.type === EVENT_TYPES.while) {
      (event.variables || []).forEach(variable =>
        lines.push(
          `${depthPrefix(depth)}local ${variable.name} = ${variableToExact(
            variable
          )}`
        )
      );
      lines.push(
        `${depthPrefix(depth)}${formatMetadata('@while', {
          ...(event.infiniteLoopWarning ? { infiniteLoopWarning: true } : {}),
        })}`
      );
      const whileConditions = event.whileConditions || [];
      if (!whileConditions.length) {
        lines.push(
          `${depthPrefix(depth)}while${
            event.loopIndexVariable
              ? ` index=${quote(event.loopIndexVariable)}`
              : ''
          }`
        );
      } else {
        whileConditions.forEach((instruction, index) => {
          const formatted = formatInstructionLines(
            instruction,
            'condition',
            depth,
            0,
            { expandLogicalOr: false }
          );
          const instructionLine = formatted.pop();
          lines.push(...formatted);
          lines.push(
            `${depthPrefix(depth)}${
              index === 0 ? 'while' : 'and while'
            } ${instructionLine.slice(`${depthPrefix(depth)}if `.length)}${
              index === 0 && event.loopIndexVariable
                ? ` index=${quote(event.loopIndexVariable)}`
                : ''
            }`
          );
        });
      }
      (event.conditions || []).forEach(instruction =>
        lines.push(...formatInstructionLines(instruction, 'condition', depth))
      );
      (event.actions || []).forEach(instruction =>
        lines.push(...formatInstructionLines(instruction, 'action', depth))
      );
      lines.push(...formatEvents(event.events || [], depth + 1));
      return;
    }
    if (event.type === EVENT_TYPES.comment) {
      lines.push(
        `${depthPrefix(depth)}${formatMetadata('@comment', {
          background: [event.color.r, event.color.g, event.color.b],
          text: [event.color.textR, event.color.textG, event.color.textB],
          ...(event.comment2 ? { comment2: event.comment2 } : {}),
        })}`
      );
      lines.push(`${depthPrefix(depth)}# ${escapeComment(event.comment)}`);
      return;
    }
    if (event.type === EVENT_TYPES.group) {
      lines.push(
        `${depthPrefix(depth)}${formatMetadata('@group', {
          source: event.source,
          creationTime: event.creationTime,
          color: [event.colorR, event.colorG, event.colorB],
          parameters: event.parameters,
        })}`
      );
      lines.push(`${depthPrefix(depth)}group ${quote(event.name)}`);
      lines.push(...formatEvents(event.events || [], depth));
      lines.push(`${depthPrefix(depth)}end`);
      return;
    }
    if (event.type === EVENT_TYPES.link) {
      const include = event.include || { includeConfig: 0 };
      let suffix = '';
      if (include.includeConfig === 1)
        suffix = ` group=${quote(include.eventsGroup || '')}`;
      else if (include.includeConfig === 2)
        suffix = ` range=${include.start || 0}..${include.end || 0}`;
      lines.push(`${depthPrefix(depth)}link ${quote(event.target)}${suffix}`);
      return;
    }
    if (event.type === EVENT_TYPES.js) {
      const delimiter = chooseJavaScriptDelimiter(event.inlineCode, depth);
      lines.push(
        `${depthPrefix(depth)}${formatMetadata('js', {
          ...(event.parameterObjects
            ? { objects: event.parameterObjects }
            : {}),
          strict: !!event.useStrict,
          expanded: !!event.eventsSheetExpanded,
          ...(delimiter ? { delimiter } : {}),
        })}`
      );
      if (event.inlineCode) lines.push(event.inlineCode);
      lines.push(
        `${depthPrefix(depth)}end js${delimiter ? ` ${delimiter}` : ''}`
      );
      return;
    }
  });
  return lines;
};

export const parseLegacyEventsJson = (json: string): Array<Object> => {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    fail(
      'IFDO_INVALID_JSON',
      `Invalid events JSON: ${String(error.message || error)}`
    );
  }
  return asArray(parsed, 'Events JSON').map((event, index) =>
    normalizeEvent(event, `events[${index}]`)
  );
};

export const parseIfDoEvents = (
  source: string,
  options: CompileOptions = {}
): Array<Object> => new IfDoParser(source, options).parse();

export const convertLegacyEventsJsonToIfDo = (json: string): string => {
  const events = parseLegacyEventsJson(json);
  return `${formatEvents(events)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')}\n`;
};

export const compileIfDoToLegacyEventsJson = (
  source: string,
  options: CompileOptions = {}
): string => `${JSON.stringify(parseIfDoEvents(source, options), null, 2)}\n`;

export const canonicalizeLegacyEventsJson = (json: string): string =>
  `${JSON.stringify(parseLegacyEventsJson(json), null, 2)}\n`;

export const areLegacyEventsEquivalent = (
  left: string,
  right: string
): boolean =>
  canonicalizeLegacyEventsJson(left) === canonicalizeLegacyEventsJson(right);
