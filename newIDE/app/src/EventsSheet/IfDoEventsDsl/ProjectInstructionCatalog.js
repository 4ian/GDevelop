// @flow

import { parseCatalogInstructionArguments } from './index';
import { buildCompleteProjectInstructionCatalog } from '../../Mcp/McpEventKnowledge';

export const PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH =
  '.gdevelop/instructions-catalog.json';
export const PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH =
  '.gdevelop/deprecated-instructions-catalog.json';

export class ProjectInstructionCatalogError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ProjectInstructionCatalogError';
    this.code = code;
  }
}

const fail = (code: string, message: string): empty => {
  throw new ProjectInstructionCatalogError(code, message);
};

type CatalogKind = 'action' | 'condition';
type CatalogValueKind =
  | 'text'
  | 'number'
  | 'boolean'
  | 'object'
  | 'behavior'
  | 'variable'
  | 'resource'
  | 'name';
type LegacyInstruction = {
  type: { value: string, inverted?: boolean, await?: boolean },
  disabled?: boolean,
  parameters?: Array<string>,
  subInstructions?: Array<LegacyInstruction>,
};
type ResolveInstruction = (input: {
  kind: CatalogKind,
  source: string,
  line: number,
}) => LegacyInstruction;
type FormatInstruction = (input: {
  kind: CatalogKind,
  instruction: LegacyInstruction,
}) => string;
type CatalogParameter = {
  index?: number,
  dslName: string,
  type?: string,
  valueKind?: CatalogValueKind,
  isOptional?: boolean,
  isCodeOnly?: boolean,
  defaultValue?: any,
  [string]: any,
};
type CatalogEntry = {
  kind?: CatalogKind,
  type: string,
  parameters: Array<CatalogParameter>,
  [string]: any,
};
type Catalog = {
  format: string,
  formatVersion: number,
  actions: Array<CatalogEntry>,
  conditions: Array<CatalogEntry>,
  expressions: Array<Object>,
  [string]: any,
};
type CatalogLookup = {
  action: Map<string, CatalogEntry>,
  condition: Map<string, CatalogEntry>,
};
const DSL_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const UNQUOTED_INSTRUCTION_TYPE = /^[^@\s][^\s]*$/;
const CATALOG_VALUE_KINDS: Set<string> = new Set([
  'text',
  'number',
  'boolean',
  'object',
  'behavior',
  'variable',
  'resource',
  'name',
]);

const isExpressionOperand = (value: any): boolean =>
  !!(
    value &&
    typeof value === 'object' &&
    value.__ifdoExpression === true &&
    typeof value.source === 'string'
  );

const assertSemanticValue = (
  value: any,
  parameter: CatalogParameter,
  label: string
) => {
  const valueKind = parameter.valueKind;
  if (!valueKind) {
    return fail(
      'IFDO_CATALOG_VALUE_KIND_MISSING',
      `${label} has no semantic valueKind.`
    );
  }
  if (isExpressionOperand(value)) {
    if (valueKind !== 'text' && valueKind !== 'number') {
      fail(
        'IFDO_EXPRESSION_NOT_ALLOWED',
        `${label} does not accept expr(...); expected ${valueKind}.`
      );
    }
    if (!value.source.trim()) {
      fail('IFDO_EXPRESSION_INVALID', `${label} expression cannot be empty.`);
    }
    return;
  }
  const valid =
    valueKind === 'number'
      ? typeof value === 'number' && Number.isFinite(value)
      : valueKind === 'boolean'
      ? typeof value === 'boolean'
      : typeof value === 'string';
  if (!valid) {
    fail(
      'IFDO_OPERAND_TYPE_MISMATCH',
      `${label} expects a semantic ${valueKind} value.`
    );
  }
  if (
    valueKind === 'name' &&
    parameter.acceptedValues &&
    Array.isArray(parameter.acceptedValues) &&
    !parameter.acceptedValues.includes(value)
  ) {
    fail(
      'IFDO_OPERAND_TYPE_MISMATCH',
      `${label} must be one of ${parameter.acceptedValues.join(', ')}.`
    );
  }
};

const lowerBooleanValue = (value: boolean, parameterType: ?string): string => {
  if (parameterType === 'yesorno') return value ? 'yes' : 'no';
  if (parameterType === 'trueorfalse') return value ? 'True' : 'False';
  return value ? 'true' : 'false';
};

const stringifyJsonValue = (value: any, label: string): string => {
  const source = JSON.stringify(value);
  if (typeof source !== 'string') {
    return fail(
      'IFDO_PARAMETER_UNREPRESENTABLE',
      `${label} cannot be represented as an IfDo value.`
    );
  }
  return source;
};

const lowerSemanticValue = (
  value: any,
  parameter: CatalogParameter,
  label: string
): string => {
  assertSemanticValue(value, parameter, label);
  if (isExpressionOperand(value)) return value.source.trim();
  switch (parameter.valueKind) {
    case 'text':
      return stringifyJsonValue(value, label);
    case 'number':
      return String(value);
    case 'boolean':
      return lowerBooleanValue(value, parameter.type);
    default:
      return String(value);
  }
};

const parseTextLiteralExpression = (source: string): ?string => {
  if (!source.startsWith('"')) return null;
  try {
    const value = JSON.parse(source);
    return typeof value === 'string' ? value : null;
  } catch (error) {
    return null;
  }
};

const parseBooleanParameter = (
  source: string,
  parameterType: ?string
): ?boolean => {
  if (parameterType === 'yesorno') {
    if (source === 'yes' || source === 'true') return true;
    if (source === 'no' || source === 'false') return false;
    return null;
  }
  if (parameterType === 'trueorfalse') {
    if (source === 'True' || source === 'true') return true;
    if (source === 'False' || source === 'false') return false;
    return null;
  }
  if (source === 'true') return true;
  if (source === 'false') return false;
  return null;
};

const formatSemanticValue = (
  source: string,
  parameter: CatalogParameter,
  label: string
): string => {
  switch (parameter.valueKind) {
    case 'text': {
      const literal = parseTextLiteralExpression(source);
      if (literal !== null) return stringifyJsonValue(literal, label);
      const trimmed = source.trim();
      if (!trimmed) {
        return fail(
          'IFDO_PARAMETER_UNREPRESENTABLE',
          `${label} contains an empty text expression.`
        );
      }
      return `expr(${trimmed})`;
    }
    case 'number': {
      const trimmed = source.trim();
      if (
        /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed) &&
        Number.isFinite(Number(trimmed))
      ) {
        return String(Number(trimmed));
      }
      if (!trimmed) {
        fail(
          'IFDO_PARAMETER_UNREPRESENTABLE',
          `${label} contains an empty numeric expression.`
        );
      }
      return `expr(${trimmed})`;
    }
    case 'boolean': {
      const value = parseBooleanParameter(source, parameter.type);
      if (value === null) {
        fail(
          'IFDO_PARAMETER_UNREPRESENTABLE',
          `${label} contains an invalid boolean value ${JSON.stringify(
            source
          )}.`
        );
      }
      return value ? 'true' : 'false';
    }
    case 'object':
    case 'behavior':
    case 'variable':
    case 'resource':
    case 'name':
      return JSON.stringify(source);
    default:
      return fail(
        'IFDO_CATALOG_VALUE_KIND_INVALID',
        `${label} has an unsupported semantic valueKind.`
      );
  }
};

const parseCatalogInstructionSource = (
  source: string,
  line: number
): {| type: string, argumentsSource: string |} => {
  if (source.startsWith('"')) {
    let escaped = false;
    let closingQuoteIndex = -1;
    for (let index = 1; index < source.length; index++) {
      const character = source[index];
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        closingQuoteIndex = index;
        break;
      }
    }
    if (closingQuoteIndex !== -1) {
      const typeSource = source.slice(0, closingQuoteIndex + 1);
      const remainder = source.slice(closingQuoteIndex + 1);
      if (!remainder || /^\s/.test(remainder)) {
        let type;
        try {
          type = JSON.parse(typeSource);
        } catch (error) {
          type = null;
        }
        if (typeof type === 'string' && type) {
          return { type, argumentsSource: remainder.trim() };
        }
      }
    }
  } else {
    const match = /^([^@\s][^\s]*)(?:\s+([\s\S]*))?$/.exec(source);
    if (match) return { type: match[1], argumentsSource: match[2] || '' };
  }
  throw new ProjectInstructionCatalogError(
    'IFDO_CATALOG_INSTRUCTION_REQUIRED',
    `Line ${line}: expected InstructionType with named arguments, got ${JSON.stringify(
      source
    )}.`
  );
};

const entriesForKind = (
  catalog: Catalog,
  kind: CatalogKind
): Array<CatalogEntry> =>
  kind === 'condition' ? catalog.conditions : catalog.actions;

const validateCatalogEntry = (
  entry: any,
  kind: 'action' | 'condition' | 'expression'
) => {
  if (
    !entry ||
    typeof entry !== 'object' ||
    (entry.kind !== undefined && entry.kind !== kind)
  )
    fail('IFDO_CATALOG_INVALID', `Invalid ${kind} catalog entry.`);
  if (typeof entry.type !== 'string' || !entry.type)
    fail('IFDO_CATALOG_INVALID', `A ${kind} catalog entry has no type.`);
  if (!Array.isArray(entry.parameters))
    fail(
      'IFDO_CATALOG_INVALID',
      `${kind} ${entry.type} has no parameter list.`
    );
  const names: Set<string> = new Set();
  entry.parameters.forEach((parameter, index) => {
    if (
      !parameter ||
      typeof parameter !== 'object' ||
      (parameter.index !== undefined && parameter.index !== index) ||
      typeof parameter.dslName !== 'string' ||
      !DSL_IDENTIFIER.test(parameter.dslName)
    )
      fail(
        'IFDO_CATALOG_INVALID',
        `${kind} ${entry.type} has an invalid parameter at index ${index}.`
      );
    if (names.has(parameter.dslName))
      fail(
        'IFDO_CATALOG_INVALID',
        `${kind} ${entry.type} repeats dslName ${parameter.dslName}.`
      );
    if (parameter.isCodeOnly) {
      if (parameter.valueKind !== undefined) {
        fail(
          'IFDO_CATALOG_VALUE_KIND_INVALID',
          `${kind} ${entry.type}.${
            parameter.dslName
          } is code-only and must not declare valueKind.`
        );
      }
    } else {
      if (
        typeof parameter.valueKind !== 'string' ||
        !CATALOG_VALUE_KINDS.has(parameter.valueKind)
      ) {
        fail(
          'IFDO_CATALOG_VALUE_KIND_MISSING',
          `${kind} ${entry.type}.${
            parameter.dslName
          } has no supported valueKind.`
        );
      }
      if (parameter.defaultValue !== undefined) {
        assertSemanticValue(
          parameter.defaultValue,
          parameter,
          `${kind} ${entry.type}.${parameter.dslName} default`
        );
      }
    }
    names.add(parameter.dslName);
  });
};

export const validateProjectInstructionCatalog = (catalog: any): Catalog => {
  if (
    !catalog ||
    typeof catalog !== 'object' ||
    catalog.format !== 'gdevelop-ifdo-instruction-catalog' ||
    !Array.isArray(catalog.actions) ||
    !Array.isArray(catalog.conditions) ||
    !Array.isArray(catalog.expressions)
  )
    fail('IFDO_CATALOG_INVALID', 'Unsupported instruction catalog format.');
  if (catalog.formatVersion !== 2) {
    fail(
      'IFDO_CATALOG_VERSION_UNSUPPORTED',
      'Unsupported instruction catalog version; expected version 2.'
    );
  }
  if (catalog.authoring !== undefined) {
    fail(
      'IFDO_CATALOG_INVALID',
      'Instruction catalog version 2 must not contain authoring prose.'
    );
  }
  const kinds: Array<CatalogKind> = ['action', 'condition'];
  kinds.forEach(kind => {
    const seen: Set<string> = new Set();
    entriesForKind(catalog, kind).forEach(entry => {
      validateCatalogEntry(entry, kind);
      if (seen.has(entry.type))
        fail(
          'IFDO_CATALOG_INVALID',
          `Duplicate ${kind} catalog type ${entry.type}.`
        );
      seen.add(entry.type);
    });
  });
  const expressionKeys = new Set<string>();
  catalog.expressions.forEach(entry => {
    validateCatalogEntry(entry, 'expression');
    const key = `${entry.type}\u0000${String(entry.returnType)}`;
    if (expressionKeys.has(key)) {
      fail(
        'IFDO_CATALOG_INVALID',
        `Duplicate expression catalog type ${entry.type}.`
      );
    }
    expressionKeys.add(key);
  });
  return (catalog: Catalog);
};

const createLookup = (catalog: Catalog): CatalogLookup => {
  const lookup: CatalogLookup = {
    action: new Map(),
    condition: new Map(),
  };
  const kinds: Array<CatalogKind> = ['action', 'condition'];
  kinds.forEach(kind =>
    entriesForKind(catalog, kind).forEach(entry =>
      lookup[kind].set(entry.type, entry)
    )
  );
  return lookup;
};

export const createCatalogInstructionResolver = (
  catalogInput: any
): ResolveInstruction => {
  const catalog = validateProjectInstructionCatalog(catalogInput);
  const lookup = createLookup(catalog);
  return ({
    kind,
    source,
    line,
  }: {
    kind: CatalogKind,
    source: string,
    line: number,
  }): LegacyInstruction => {
    const { type, argumentsSource } = parseCatalogInstructionSource(
      source,
      line
    );
    const entry = lookup[kind].get(type);
    if (!entry)
      throw new ProjectInstructionCatalogError(
        'IFDO_CATALOG_UNKNOWN_INSTRUCTION',
        `Line ${line}: ${kind} ${type} is not in the project instruction catalog.`
      );
    const argumentsByName = parseCatalogInstructionArguments(argumentsSource);
    const knownNames = new Set(
      entry.parameters.map(parameter => parameter.dslName)
    );
    Object.keys(argumentsByName).forEach(name => {
      if (!knownNames.has(name))
        fail(
          'IFDO_CATALOG_UNKNOWN_PARAMETER',
          `Line ${line}: ${kind} ${type} has no parameter ${name}.`
        );
      const parameter = entry.parameters.find(
        candidate => candidate.dslName === name
      );
      if (parameter && parameter.isCodeOnly) {
        fail(
          'IFDO_OPERAND_TYPE_MISMATCH',
          `Line ${line}: ${kind} ${type}.${name} is code-only and must be omitted.`
        );
      }
    });
    const parameters: Array<string> = entry.parameters.map(parameter => {
      const argument = argumentsByName[parameter.dslName];
      if (argument !== undefined) {
        return lowerSemanticValue(
          argument,
          parameter,
          `Line ${line}: ${kind} ${type}.${parameter.dslName}`
        );
      }
      return '';
    });
    return {
      type: { value: type, inverted: false, await: false },
      disabled: false,
      parameters,
      subInstructions: [],
    };
  };
};

export const createCatalogInstructionFormatter = (
  catalogInput: any
): FormatInstruction => {
  const catalog = validateProjectInstructionCatalog(catalogInput);
  const lookup = createLookup(catalog);
  return ({
    kind,
    instruction,
  }: {
    kind: CatalogKind,
    instruction: LegacyInstruction,
  }): string => {
    const entry = lookup[kind].get(instruction.type.value);
    const instructionParameters = instruction.parameters || [];
    if (!entry) {
      return fail(
        'IFDO_CATALOG_UNKNOWN_INSTRUCTION',
        `${kind} ${
          instruction.type.value
        } is not in the project instruction catalog.`
      );
    }
    if (instructionParameters.length > entry.parameters.length) {
      fail(
        'IFDO_PARAMETER_UNREPRESENTABLE',
        `${kind} ${instruction.type.value} has ${
          instructionParameters.length
        } parameters but its catalog signature has ${entry.parameters.length}.`
      );
    }
    const normalizedInstructionParameters = entry.parameters.map(
      (_parameter, index) =>
        index < instructionParameters.length ? instructionParameters[index] : ''
    );
    const operands = entry.parameters
      .map((parameter, index) => ({
        parameter,
        value: normalizedInstructionParameters[index],
      }))
      .filter(({ parameter, value }) => {
        if (parameter.isCodeOnly) {
          return false;
        }
        return value !== '';
      })
      .map(({ parameter, value }) => {
        const semanticValue = formatSemanticValue(
          value,
          parameter,
          `${kind} ${entry.type}.${parameter.dslName}`
        );
        return `${parameter.dslName}=${semanticValue}`;
      });
    const formattedType = UNQUOTED_INSTRUCTION_TYPE.test(entry.type)
      ? entry.type
      : stringifyJsonValue(entry.type, `${kind} instruction type`);
    return `${formattedType}${operands.length ? ` ${operands.join(' ')}` : ''}`;
  };
};

export const getCatalogCodeOnlyParameterIndicesByType = (
  catalogInput: any
): { [string]: Array<number> } => {
  const catalog = validateProjectInstructionCatalog(catalogInput);
  const indicesByType = {};
  [...catalog.actions, ...catalog.conditions].forEach(entry => {
    entry.parameters.forEach((parameter, index) => {
      if (!parameter.isCodeOnly) return;
      const indices = indicesByType[entry.type] || [];
      if (!indices.includes(index)) indices.push(index);
      indicesByType[entry.type] = indices;
    });
  });
  return indicesByType;
};

export const normalizeLegacyProjectInstructionParameters = (
  legacyProject: Object,
  catalogInput: any
): Object => {
  const catalog = validateProjectInstructionCatalog(catalogInput);
  const lookup = createLookup(catalog);
  const normalizeExpressionSource = (source: string): string => {
    let inString = false;
    let escaped = false;
    return source
      .trim()
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(line => {
        const normalizedLine = inString ? line : line.trimStart();
        for (let index = 0; index < normalizedLine.length; index++) {
          const character = normalizedLine[index];
          if (inString) {
            if (escaped) escaped = false;
            else if (character === '\\') escaped = true;
            else if (character === '"') inString = false;
          } else if (character === '"') {
            inString = true;
          }
        }
        return inString ? normalizedLine : normalizedLine.trimEnd();
      })
      .join('\n');
  };
  const normalizeParameterSource = (
    source: string,
    parameter: CatalogParameter
  ): string => {
    if (!source) return '';
    if (parameter.valueKind === 'text') {
      const literal = parseTextLiteralExpression(source);
      return literal !== null
        ? stringifyJsonValue(literal, parameter.dslName)
        : normalizeExpressionSource(source);
    }
    if (parameter.valueKind === 'number') {
      const normalized = normalizeExpressionSource(source);
      if (
        /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized) &&
        Number.isFinite(Number(normalized))
      ) {
        return String(Number(normalized));
      }
      return normalized;
    }
    if (parameter.valueKind === 'boolean') {
      const value = parseBooleanParameter(source, parameter.type);
      return value === null ? '' : lowerBooleanValue(value, parameter.type);
    }
    if (
      parameter.acceptedValues &&
      Array.isArray(parameter.acceptedValues) &&
      !parameter.acceptedValues.includes(source)
    ) {
      return '';
    }
    return source;
  };
  const canRepresentParameterSource = (
    source: string,
    parameter: CatalogParameter
  ): boolean => {
    if (!source) return true;
    if (parameter.valueKind === 'boolean') {
      return parseBooleanParameter(source, parameter.type) !== null;
    }
    return !(
      parameter.acceptedValues &&
      Array.isArray(parameter.acceptedValues) &&
      !parameter.acceptedValues.includes(source)
    );
  };
  const getOmittedParameterSource = (parameter: CatalogParameter): string => {
    if (parameter.defaultValue !== undefined) {
      if (parameter.valueKind === 'text') {
        return stringifyJsonValue(parameter.defaultValue, parameter.dslName);
      }
      if (parameter.valueKind === 'boolean') {
        return lowerBooleanValue(parameter.defaultValue, parameter.type);
      }
      return String(parameter.defaultValue);
    }
    if (
      parameter.acceptedValues &&
      Array.isArray(parameter.acceptedValues) &&
      parameter.acceptedValues.length
    ) {
      return String(parameter.acceptedValues[0]);
    }
    return '';
  };
  const cloneValue = (value: any, instructionKind: ?CatalogKind): any => {
    if (Array.isArray(value)) {
      return value.map(item => cloneValue(item, instructionKind));
    }
    if (!value || typeof value !== 'object') return value;
    const clone = {};
    Object.keys(value).forEach(key => {
      const childInstructionKind =
        key === 'actions'
          ? 'action'
          : key === 'conditions'
          ? 'condition'
          : key === 'whileConditions'
          ? 'condition'
          : key === 'subInstructions'
          ? instructionKind
          : null;
      clone[key] = cloneValue(value[key], childInstructionKind);
    });
    if (
      instructionKind &&
      clone.type &&
      typeof clone.type === 'object' &&
      typeof clone.type.value === 'string' &&
      Array.isArray(clone.parameters)
    ) {
      const entry = lookup[instructionKind].get(clone.type.value);
      if (entry) {
        const sourceParameters = clone.parameters;
        let sourceIndex = 0;
        clone.parameters = entry.parameters.map((parameter, index) => {
          const source =
            sourceIndex < sourceParameters.length
              ? sourceParameters[sourceIndex]
              : '';
          if (parameter.isCodeOnly) {
            if (sourceIndex < sourceParameters.length) sourceIndex++;
            return '';
          }
          const hasLaterValueParameter = entry.parameters
            .slice(index + 1)
            .some(candidate => !candidate.isCodeOnly);
          if (
            source &&
            !canRepresentParameterSource(source, parameter) &&
            hasLaterValueParameter
          ) {
            return getOmittedParameterSource(parameter);
          }
          if (sourceIndex < sourceParameters.length) sourceIndex++;
          return normalizeParameterSource(source, parameter);
        });
      }
    }
    return clone;
  };
  return cloneValue(legacyProject, null);
};

export const buildLegacyInstructionCatalogDelta = (
  catalogInput: any,
  legacyProject: Object
): Object => {
  const catalog = validateProjectInstructionCatalog(catalogInput);
  const lookup = createLookup(catalog);
  const sourcesByKindAndType: {
    action: Map<string, Array<Array<string>>>,
    condition: Map<string, Array<Array<string>>>,
  } = {
    action: new Map(),
    condition: new Map(),
  };
  const collectInstruction = (value: any, kind: CatalogKind) => {
    if (
      !value ||
      typeof value !== 'object' ||
      !value.type ||
      typeof value.type !== 'object' ||
      typeof value.type.value !== 'string' ||
      !Array.isArray(value.parameters) ||
      lookup[kind].has(value.type.value)
    ) {
      return;
    }
    const sourcesByIndex =
      sourcesByKindAndType[kind].get(value.type.value) || [];
    value.parameters.forEach((source, index) => {
      if (!sourcesByIndex[index]) sourcesByIndex[index] = [];
      sourcesByIndex[index].push(String(source));
    });
    sourcesByKindAndType[kind].set(value.type.value, sourcesByIndex);
  };
  const visit = (value: any, instructionKind: ?CatalogKind) => {
    if (Array.isArray(value)) {
      value.forEach(item => visit(item, instructionKind));
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (instructionKind) collectInstruction(value, instructionKind);
    Object.keys(value).forEach(key => {
      const childInstructionKind =
        key === 'actions'
          ? 'action'
          : key === 'conditions' || key === 'whileConditions'
          ? 'condition'
          : key === 'subInstructions'
          ? instructionKind
          : null;
      visit(value[key], childInstructionKind);
    });
  };
  visit(legacyProject, null);

  const inferParameter = (
    sources: Array<string>,
    index: number
  ): CatalogParameter => {
    const nonEmptySources = sources.filter(source => source !== '');
    let type = 'identifier';
    let valueKind: CatalogValueKind = 'name';
    if (
      nonEmptySources.length &&
      nonEmptySources.some(
        source => parseTextLiteralExpression(source) !== null
      )
    ) {
      type = 'string';
      valueKind = 'text';
    } else if (
      nonEmptySources.length &&
      nonEmptySources.every(source =>
        ['yes', 'no', 'true', 'false', 'True', 'False'].includes(source)
      )
    ) {
      type = nonEmptySources.some(source => ['True', 'False'].includes(source))
        ? 'trueorfalse'
        : 'yesorno';
      valueKind = 'boolean';
    } else if (
      nonEmptySources.some(
        source =>
          /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(source.trim()) ||
          /[()[\]{}]/.test(source)
      )
    ) {
      type = 'expression';
      valueKind = 'number';
    }
    return {
      dslName: `parameter_${index}`,
      type,
      valueKind,
    };
  };
  const buildEntries = (kind: CatalogKind): Array<CatalogEntry> =>
    Array.from(sourcesByKindAndType[kind].entries())
      .map(([type, sourcesByIndex]) => ({
        type,
        parameters: sourcesByIndex.map(inferParameter),
      }))
      .sort((left, right) => left.type.localeCompare(right.type));
  const actions = buildEntries('action');
  const conditions = buildEntries('condition');
  return validateProjectInstructionCatalog({
    ...catalog,
    counts: {
      actions: actions.length,
      conditions: conditions.length,
      expressions: 0,
    },
    actions,
    conditions,
    expressions: [],
  });
};

export const buildProjectInstructionCatalog = (
  project: gdProject,
  i18n?: any,
  additionalExtensions?: Array<gdPlatformExtension>
): Object =>
  validateProjectInstructionCatalog(
    buildCompleteProjectInstructionCatalog({
      project,
      i18n,
      additionalExtensions,
    })
  );

/**
 * Deprecated and hidden compatibility metadata omitted from the normal
 * authoring catalog. Existing projects can still contain these instructions,
 * so the editor merges this delta with the authoring catalog for lossless
 * source conversion.
 */
export const buildProjectDeprecatedInstructionCatalog = (
  project: gdProject,
  i18n?: any,
  authoringCatalogInput?: Object,
  additionalExtensions?: Array<gdPlatformExtension>
): Object => {
  const authoringCatalog = authoringCatalogInput
    ? validateProjectInstructionCatalog(authoringCatalogInput)
    : buildProjectInstructionCatalog(project, i18n, additionalExtensions);
  const completeCatalog = validateProjectInstructionCatalog(
    buildCompleteProjectInstructionCatalog({
      project,
      i18n,
      includeDeprecatedAndHidden: true,
      additionalExtensions,
    })
  );
  const authoringActionTypes = new Set(
    authoringCatalog.actions.map(entry => entry.type)
  );
  const authoringConditionTypes = new Set(
    authoringCatalog.conditions.map(entry => entry.type)
  );
  const authoringExpressionKeys = new Set(
    authoringCatalog.expressions.map(
      entry => `${entry.type}\u0000${String(entry.returnType)}`
    )
  );
  const actions = completeCatalog.actions.filter(
    entry => !authoringActionTypes.has(entry.type)
  );
  const conditions = completeCatalog.conditions.filter(
    entry => !authoringConditionTypes.has(entry.type)
  );
  const expressions = completeCatalog.expressions.filter(
    entry =>
      !authoringExpressionKeys.has(
        `${entry.type}\u0000${String(entry.returnType)}`
      )
  );
  return validateProjectInstructionCatalog({
    ...completeCatalog,
    counts: {
      actions: actions.length,
      conditions: conditions.length,
      expressions: expressions.length,
    },
    actions,
    conditions,
    expressions,
  });
};

export const mergeProjectInstructionCatalogs = (
  authoringCatalogInput: any,
  deprecatedCatalogInput: any
): Object => {
  const authoringCatalog = validateProjectInstructionCatalog(
    authoringCatalogInput
  );
  const deprecatedCatalog = validateProjectInstructionCatalog(
    deprecatedCatalogInput
  );
  const mergeEntries = (
    primaryEntries: Array<Object>,
    additionalEntries: Array<Object>,
    getKey: Object => string
  ): Array<Object> => {
    const entriesByKey: Map<string, Object> = new Map();
    [...primaryEntries, ...additionalEntries].forEach(entry => {
      const key = getKey(entry);
      if (!entriesByKey.has(key)) entriesByKey.set(key, entry);
    });
    return Array.from(entriesByKey.values()).sort((left, right) =>
      getKey(left).localeCompare(getKey(right))
    );
  };
  const actions = mergeEntries(
    authoringCatalog.actions,
    deprecatedCatalog.actions,
    entry => entry.type
  );
  const conditions = mergeEntries(
    authoringCatalog.conditions,
    deprecatedCatalog.conditions,
    entry => entry.type
  );
  const expressions = mergeEntries(
    authoringCatalog.expressions,
    deprecatedCatalog.expressions,
    entry => `${entry.type}\u0000${String(entry.returnType)}`
  );
  return validateProjectInstructionCatalog({
    ...authoringCatalog,
    counts: {
      actions: actions.length,
      conditions: conditions.length,
      expressions: expressions.length,
    },
    actions,
    conditions,
    expressions,
  });
};

export const serializeProjectInstructionCatalog = (catalog: Object): string =>
  (() => {
    const validatedCatalog = validateProjectInstructionCatalog(catalog);
    const { actions, conditions, expressions, ...metadata } = validatedCatalog;
    const serializeEntries = (
      name: string,
      entries: Array<CatalogEntry | Object>
    ): Array<string> => [
      `${JSON.stringify(name)}:[`,
      ...entries.map(
        (entry, index) =>
          `${JSON.stringify(entry)}${index === entries.length - 1 ? '' : ','}`
      ),
      ']',
    ];
    return [
      '{',
      ...Object.keys(metadata).map(
        key => `${JSON.stringify(key)}:${JSON.stringify(metadata[key])},`
      ),
      ...serializeEntries('actions', actions).map((line, index, lines) =>
        index === lines.length - 1 ? `${line},` : line
      ),
      ...serializeEntries('conditions', conditions).map((line, index, lines) =>
        index === lines.length - 1 ? `${line},` : line
      ),
      ...serializeEntries('expressions', expressions),
      '}',
      '',
    ].join('\n');
  })();
