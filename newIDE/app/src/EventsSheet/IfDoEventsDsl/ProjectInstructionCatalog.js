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
}) => ?string;
type CatalogParameter = {
  index?: number,
  dslName: string,
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
    const match = /^([^@\s][^\s]*)(?:\s+(.*))?$/.exec(source);
    if (match) return { type: match[1], argumentsSource: match[2] || '' };
  }
  throw new ProjectInstructionCatalogError(
    'IFDO_CATALOG_INSTRUCTION_REQUIRED',
    `Line ${line}: expected InstructionType with named arguments.`
  );
};

const entriesForKind = (
  catalog: Catalog,
  kind: CatalogKind
): Array<CatalogEntry> =>
  kind === 'condition' ? catalog.conditions : catalog.actions;

const validateCatalogEntry = (entry: any, kind: CatalogKind) => {
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
    names.add(parameter.dslName);
  });
};

export const validateProjectInstructionCatalog = (catalog: any): Catalog => {
  if (
    !catalog ||
    typeof catalog !== 'object' ||
    catalog.format !== 'gdevelop-ifdo-instruction-catalog' ||
    catalog.formatVersion !== 1 ||
    !Array.isArray(catalog.actions) ||
    !Array.isArray(catalog.conditions) ||
    !Array.isArray(catalog.expressions)
  )
    fail('IFDO_CATALOG_INVALID', 'Unsupported instruction catalog format.');
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
      if (typeof argumentsByName[name] !== 'string')
        fail(
          'IFDO_CATALOG_PARAMETER_STRING_REQUIRED',
          `Line ${line}: ${kind} ${type}.${name} must be a JSON string containing the serialized operand.`
        );
    });
    const parameters: Array<string> = entry.parameters.map(parameter => {
      const argument = argumentsByName[parameter.dslName];
      if (argument !== undefined) {
        if (typeof argument !== 'string')
          throw new ProjectInstructionCatalogError(
            'IFDO_CATALOG_PARAMETER_STRING_REQUIRED',
            `Line ${line}: ${kind} ${type}.${
              parameter.dslName
            } must be a JSON string containing the serialized operand.`
          );
        return argument;
      }
      if (parameter.isCodeOnly) return '';
      if (parameter.isOptional)
        return parameter.defaultValue === undefined
          ? ''
          : String(parameter.defaultValue);
      throw new ProjectInstructionCatalogError(
        'IFDO_CATALOG_MISSING_PARAMETER',
        `Line ${line}: ${kind} ${type} requires ${parameter.dslName}.`
      );
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
  }): ?string => {
    const entry = lookup[kind].get(instruction.type.value);
    const instructionParameters = instruction.parameters || [];
    if (!entry || entry.parameters.length !== instructionParameters.length)
      return null;
    const operands = entry.parameters
      .map((parameter, index) => ({
        parameter,
        value: instructionParameters[index],
      }))
      .filter(({ parameter, value }) => !(parameter.isCodeOnly && value === ''))
      .map(
        ({ parameter, value }) =>
          `${parameter.dslName}=${JSON.stringify(value)}`
      );
    const formattedType = UNQUOTED_INSTRUCTION_TYPE.test(entry.type)
      ? entry.type
      : JSON.stringify(entry.type);
    return `${formattedType}${operands.length ? ` ${operands.join(' ')}` : ''}`;
  };
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
    authoring: {
      ...completeCatalog.authoring,
      preferredSyntax:
        'Compatibility metadata for reading and minimally editing existing deprecated instructions only.',
      rules: [
        'Never use this catalog to construct new events.',
        'Use .gdevelop/instructions-catalog.json for all newly authored instructions.',
        'Entries here may only preserve or minimally edit deprecated instructions already present in legacy project event code.',
      ],
    },
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
    const entriesByKey = new Map();
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
