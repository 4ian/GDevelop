// @flow
import { buildInstruction } from './McpEventKnowledge';

export const EVENT_DSL_VERSION = '1';

const OPERATION_ALIASES: { [string]: string } = {
  append: 'insert_at_end',
  insert_at_end: 'insert_at_end',
  insert_before: 'insert_before_event',
  insert_before_event: 'insert_before_event',
  insert_after: 'insert_after_event',
  insert_after_event: 'insert_after_event',
  insert_child: 'insert_as_sub_event',
  insert_as_sub_event: 'insert_as_sub_event',
  replace: 'replace_entire_event_and_sub_events',
  replace_event: 'replace_entire_event_and_sub_events',
  replace_entire_event_and_sub_events: 'replace_entire_event_and_sub_events',
  replace_keep_children: 'replace_event_but_keep_existing_sub_events',
  replace_event_but_keep_existing_sub_events:
    'replace_event_but_keep_existing_sub_events',
  append_instructions: 'insert_actions_conditions_at_end',
  insert_actions_conditions_at_end: 'insert_actions_conditions_at_end',
  prepend_instructions: 'insert_actions_conditions_at_start',
  insert_actions_conditions_at_start: 'insert_actions_conditions_at_start',
  replace_actions: 'replace_all_actions',
  replace_all_actions: 'replace_all_actions',
  replace_conditions: 'replace_all_conditions',
  replace_all_conditions: 'replace_all_conditions',
  delete: 'delete_event',
  delete_event: 'delete_event',
};

const GROUP_COLORS = [
  [90, 160, 110],
  [188, 116, 70],
  [134, 102, 184],
  [54, 146, 158],
  [184, 92, 112],
  [142, 132, 54],
  [78, 122, 184],
  [166, 92, 150],
];

const EVENT_TYPES: { [string]: string } = {
  standard: 'BuiltinCommonInstructions::Standard',
  else: 'BuiltinCommonInstructions::Else',
  group: 'BuiltinCommonInstructions::Group',
  comment: 'BuiltinCommonInstructions::Comment',
  repeat: 'BuiltinCommonInstructions::Repeat',
  while: 'BuiltinCommonInstructions::While',
  for_each: 'BuiltinCommonInstructions::ForEach',
  for_each_child_variable: 'BuiltinCommonInstructions::ForEachChildVariable',
  link: 'BuiltinCommonInstructions::Link',
  javascript: 'BuiltinCommonInstructions::JsCode',
};

const normalizeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const makeIdPart = (value: string): string => {
  const part = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return part || 'event';
};

const makeDefaultIdPrefix = (): string =>
  `mcp-dsl-${Date.now().toString(36)}-${Math.floor(
    Math.random() * 0xffffff
  ).toString(36)}`;

const toFiniteColorChannel = (value: any, path: string): number => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${path} must be a number from 0 to 255.`);
  }
  return Math.max(0, Math.min(255, Math.round(number)));
};

const parseColor = (
  value: any,
  fallbackIndex: number,
  path: string
): {| r: number, g: number, b: number |} => {
  if (typeof value === 'string') {
    const match = /^#?([0-9a-f]{6})$/i.exec(value.trim());
    if (!match) throw new Error(`${path} must be a #RRGGBB color.`);
    const number = parseInt(match[1], 16);
    return {
      r: (number >> 16) & 255,
      g: (number >> 8) & 255,
      b: number & 255,
    };
  }
  if (value && typeof value === 'object') {
    return {
      r: toFiniteColorChannel(value.r, `${path}.r`),
      g: toFiniteColorChannel(value.g, `${path}.g`),
      b: toFiniteColorChannel(value.b, `${path}.b`),
    };
  }
  const color = GROUP_COLORS[fallbackIndex % GROUP_COLORS.length];
  return { r: color[0], g: color[1], b: color[2] };
};

const inferVariableType = (value: any): string => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  return 'string';
};

const compileVariables = (value: any, path: string): Array<Object> => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.map((variable, index) => {
      if (!variable || typeof variable !== 'object') {
        throw new Error(`${path}[${index}] must be a variable object.`);
      }
      if (typeof variable.name !== 'string' || !variable.name.trim()) {
        throw new Error(`${path}[${index}].name is required.`);
      }
      return { ...variable };
    });
  }
  if (!value || typeof value !== 'object') {
    throw new Error(`${path} must be an object map or variable array.`);
  }
  return Object.keys(value).map(name => {
    const variableValue: any = value[name];
    if (variableValue !== null && typeof variableValue === 'object') {
      throw new Error(
        `${path}.${name} must be a number, string, boolean, or a full serialized variable in the array form.`
      );
    }
    return {
      name,
      type: inferVariableType(variableValue),
      value: variableValue,
    };
  });
};

const isSerializedInstruction = (value: any): boolean =>
  !!(
    value &&
    typeof value === 'object' &&
    value.type &&
    typeof value.type === 'object' &&
    typeof value.type.value === 'string'
  );

const getLogicalCondition = (
  instruction: Object
): ?{| type: string, children: any |} => {
  if (instruction.any !== undefined) {
    return {
      type: 'BuiltinCommonInstructions::Or',
      children: instruction.any,
    };
  }
  if (instruction.all !== undefined) {
    return {
      type: 'BuiltinCommonInstructions::And',
      children: instruction.all,
    };
  }
  if (instruction.not !== undefined) {
    return {
      type: 'BuiltinCommonInstructions::Not',
      children: Array.isArray(instruction.not)
        ? instruction.not
        : [instruction.not],
    };
  }
  return null;
};

const compileInstruction = ({
  project,
  i18n,
  instruction,
  kind,
  path,
  warnings,
}: {
  project: gdProject,
  i18n?: any,
  instruction: any,
  kind: 'action' | 'condition',
  path: string,
  warnings: Array<Object>,
}): Object => {
  if (!instruction || typeof instruction !== 'object') {
    throw new Error(`${path} must be an instruction object.`);
  }
  if (isSerializedInstruction(instruction)) {
    return JSON.parse(JSON.stringify(instruction));
  }

  const logical =
    kind === 'condition' ? getLogicalCondition(instruction) : null;
  const type = logical
    ? logical.type
    : typeof instruction.type === 'string'
    ? instruction.type
    : '';
  if (!type) {
    throw new Error(
      `${path}.type is required. Conditions may alternatively use { any: [...] }, { all: [...] }, or { not: {...} }.`
    );
  }

  const parameters =
    instruction.parameters !== undefined
      ? instruction.parameters
      : instruction.args !== undefined
      ? instruction.args
      : {};
  let serializedInstruction: Object;
  if (Array.isArray(parameters)) {
    serializedInstruction = ({
      type: { value: type },
      parameters: parameters.map(value =>
        value === null || value === undefined ? '' : String(value)
      ),
    }: Object);
  } else {
    const built = buildInstruction({
      project,
      i18n,
      type,
      kind,
      parameters:
        parameters && typeof parameters === 'object' ? parameters : {},
    });
    serializedInstruction = built.instruction;
    (built.warnings || []).forEach(message =>
      warnings.push({ path, type: 'instruction-parameter', message })
    );
  }

  if (kind === 'condition' && instruction.inverted === true) {
    serializedInstruction.inverted = true;
  }
  const childInstructions = logical
    ? logical.children
    : instruction.children !== undefined
    ? instruction.children
    : instruction.subconditions;
  if (childInstructions !== undefined) {
    if (!Array.isArray(childInstructions)) {
      throw new Error(`${path}.children must be an array.`);
    }
    serializedInstruction.subInstructions = childInstructions.map(
      (child, index) =>
        compileInstruction({
          project,
          i18n,
          instruction: child,
          kind: 'condition',
          path: `${path}.children[${index}]`,
          warnings,
        })
    );
  }
  return serializedInstruction;
};

const normalizeEventKind = (event: Object): string => {
  const rawKind =
    typeof event.kind === 'string'
      ? event.kind
      : typeof event.event_kind === 'string'
      ? event.event_kind
      : '';
  const kind = normalizeKey(rawKind || 'standard');
  if (kind === 'foreach') return 'for_each';
  if (kind === 'foreach_child_variable') return 'for_each_child_variable';
  if (kind === 'js' || kind === 'javascript_code') return 'javascript';
  return kind;
};

const isSerializedEvent = (value: any): boolean =>
  !!(
    value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    value.type.indexOf('::') !== -1
  );

export const isEventsDsl = (value: any): boolean => {
  if (Array.isArray(value))
    return value.some(event => !isSerializedEvent(event));
  if (!value || typeof value !== 'object') return false;
  if (typeof value.kind === 'string' || typeof value.event_kind === 'string') {
    return true;
  }
  if (value.dsl_version || value.dslVersion) return true;
  return Array.isArray(value.events)
    ? value.events.some((event: any) => !isSerializedEvent(event))
    : false;
};

const normalizeEventsInput = (value: any): Array<any> => {
  if (typeof value === 'string') {
    return normalizeEventsInput(JSON.parse(value));
  }
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    if (
      typeof value.kind === 'string' ||
      typeof value.event_kind === 'string' ||
      isSerializedEvent(value)
    ) {
      return [value];
    }
    if (Array.isArray(value.events)) return value.events;
  }
  throw new Error(
    'Events DSL must be an event object, an event array, or { events: [...] }.'
  );
};

const compileEvents = ({
  project,
  i18n,
  events,
  path,
  idPrefix,
  nextId,
  eventIds,
  warnings,
}: {
  project: gdProject,
  i18n?: any,
  events: Array<any>,
  path: string,
  idPrefix: string,
  nextId: () => number,
  eventIds: Array<string>,
  warnings: Array<Object>,
}): Array<Object> =>
  events.map((event, index) => {
    const eventPath = `${path}[${index}]`;
    if (!event || typeof event !== 'object') {
      throw new Error(`${eventPath} must be an event object.`);
    }
    if (isSerializedEvent(event)) {
      return JSON.parse(JSON.stringify(event));
    }

    const kind = normalizeEventKind(event);
    const type = EVENT_TYPES[kind];
    if (!type) {
      throw new Error(
        `${eventPath}.kind "${kind}" is not supported. Use standard, group, comment, repeat, while, for_each, for_each_child_variable, else, link, or javascript.`
      );
    }
    const id =
      (typeof event.id === 'string' && event.id.trim()) ||
      (typeof event.event_id === 'string' && event.event_id.trim()) ||
      `${idPrefix}-${makeIdPart(
        kind === 'group' && typeof event.name === 'string' ? event.name : kind
      )}-${nextId()}`;
    if (eventIds.indexOf(id) !== -1) {
      throw new Error(`${eventPath}.id "${id}" is duplicated in this payload.`);
    }
    eventIds.push(id);

    const compileInstructionList = (
      values: any,
      instructionKind: 'action' | 'condition',
      listPath: string
    ): Array<Object> => {
      if (values === undefined || values === null) return [];
      if (!Array.isArray(values))
        throw new Error(`${listPath} must be an array.`);
      return values.map((instruction, instructionIndex) =>
        compileInstruction({
          project,
          i18n,
          instruction,
          kind: instructionKind,
          path: `${listPath}[${instructionIndex}]`,
          warnings,
        })
      );
    };
    const compileChildren = (childrenValue: any): Array<Object> =>
      compileEvents({
        project,
        i18n,
        events:
          childrenValue === undefined || childrenValue === null
            ? []
            : normalizeEventsInput(childrenValue),
        path: `${eventPath}.children`,
        idPrefix,
        nextId,
        eventIds,
        warnings,
      });

    if (kind === 'group') {
      if (typeof event.name !== 'string' || !event.name.trim()) {
        throw new Error(`${eventPath}.name is required for a group.`);
      }
      const color = parseColor(event.color, nextId(), `${eventPath}.color`);
      return {
        type,
        name: event.name.trim(),
        folded: event.folded === true,
        colorR: color.r,
        colorG: color.g,
        colorB: color.b,
        events: compileChildren(
          event.children !== undefined ? event.children : event.events
        ),
        aiGeneratedEventId: id,
      };
    }

    if (kind === 'comment') {
      const color = parseColor(
        event.color || '#ffe66d',
        nextId(),
        `${eventPath}.color`
      );
      return {
        type,
        comment: String(
          event.text !== undefined ? event.text : event.comment || ''
        ),
        color: {
          r: color.r,
          g: color.g,
          b: color.b,
          textR: 0,
          textG: 0,
          textB: 0,
        },
        aiGeneratedEventId: id,
      };
    }

    if (kind === 'link') {
      const target = event.target || event.scene || event.external_events;
      if (typeof target !== 'string' || !target.trim()) {
        throw new Error(`${eventPath}.target is required for a link.`);
      }
      return {
        type,
        target: target.trim(),
        include: { includeConfig: 0 },
        aiGeneratedEventId: id,
      };
    }

    if (kind === 'javascript') {
      if (typeof event.code !== 'string') {
        throw new Error(
          `${eventPath}.code is required for a javascript event.`
        );
      }
      return {
        type,
        inlineCode: event.code,
        parameterObjects: String(event.parameter_objects || ''),
        useStrict: event.use_strict !== false,
        eventsSheetExpanded: event.expanded === true,
        aiGeneratedEventId: id,
      };
    }

    const conditions = compileInstructionList(
      event.conditions,
      'condition',
      `${eventPath}.conditions`
    );
    const actions = compileInstructionList(
      event.actions,
      'action',
      `${eventPath}.actions`
    );
    const serializedEvent: Object = {
      type,
      conditions,
      actions,
      events: compileChildren(
        event.children !== undefined ? event.children : event.events
      ),
      variables: compileVariables(event.variables, `${eventPath}.variables`),
      aiGeneratedEventId: id,
    };

    if (kind === 'repeat') {
      const expression: any =
        event.times !== undefined
          ? event.times
          : event.repeat !== undefined
          ? event.repeat
          : event.repeat_expression;
      if (
        expression === undefined ||
        expression === null ||
        expression === ''
      ) {
        throw new Error(`${eventPath}.times is required for a repeat event.`);
      }
      serializedEvent.repeatExpression = String(expression);
    } else if (kind === 'while') {
      const whileConditionsSource =
        event.while_conditions !== undefined
          ? event.while_conditions
          : event.conditions;
      serializedEvent.whileConditions = compileInstructionList(
        whileConditionsSource,
        'condition',
        `${eventPath}.while_conditions`
      );
      if (event.while_conditions === undefined) serializedEvent.conditions = [];
      serializedEvent.infiniteLoopWarning =
        event.infinite_loop_warning !== false;
    } else if (kind === 'for_each') {
      const objectName = event.object || event.object_name;
      if (typeof objectName !== 'string' || !objectName.trim()) {
        throw new Error(
          `${eventPath}.object is required for a for_each event.`
        );
      }
      serializedEvent.object = objectName.trim();
    } else if (kind === 'for_each_child_variable') {
      const iterable = event.iterable || event.iterable_variable;
      if (typeof iterable !== 'string' || !iterable.trim()) {
        throw new Error(
          `${eventPath}.iterable is required for a for_each_child_variable event.`
        );
      }
      serializedEvent.iterableVariableName = iterable.trim();
      serializedEvent.valueIteratorVariableName = String(
        event.value_iterator || 'child'
      );
      serializedEvent.keyIteratorVariableName = String(
        event.key_iterator || ''
      );
    }

    return serializedEvent;
  });

export const compileEventsDsl = ({
  project,
  i18n,
  eventsDsl,
  eventIdPrefix,
}: {
  project: gdProject,
  i18n?: any,
  eventsDsl: any,
  eventIdPrefix?: ?string,
}): Object => {
  const events = normalizeEventsInput(eventsDsl);
  const eventIds: Array<string> = [];
  const warnings: Array<Object> = [];
  let idCounter = 0;
  const idPrefix = makeIdPart(eventIdPrefix || makeDefaultIdPrefix());
  const serializedEvents = compileEvents({
    project,
    i18n,
    events,
    path: 'events',
    idPrefix,
    nextId: () => idCounter++,
    eventIds,
    warnings,
  });
  return {
    dslVersion: EVENT_DSL_VERSION,
    serializedEvents,
    eventIds,
    warnings,
    summary: {
      rootEventCount: serializedEvents.length,
      totalEventCount: eventIds.length,
    },
  };
};

const getTargetString = (target: any, path: string): ?string => {
  if (target === undefined || target === null || target === '') return null;
  if (typeof target === 'string') return target;
  if (Array.isArray(target)) {
    return target
      .map((item, index) => getTargetString(item, `${path}[${index}]`))
      .filter(Boolean)
      .join(',');
  }
  if (typeof target !== 'object') {
    throw new Error(
      `${path} must be an event id, event path, or target object.`
    );
  }
  const value =
    target.event_id ||
    target.id ||
    target.ai_generated_event_id ||
    target.event_path ||
    target.path;
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${path} must contain event_id or event_path.`);
  }
  return value.trim();
};

export const normalizeEventDslArguments = ({
  project,
  i18n,
  args,
}: {
  project: gdProject,
  i18n?: any,
  args: Object,
}): {| args: Object, compilations: Array<Object> |} => {
  const nextArgs = { ...(args || {}) };
  const compilations = [];
  const eventIdPrefix =
    nextArgs.event_id_prefix ||
    nextArgs.eventIdPrefix ||
    nextArgs.generated_event_id;
  const topLevelDsl =
    nextArgs.events_dsl !== undefined
      ? nextArgs.events_dsl
      : nextArgs.eventsDsl !== undefined
      ? nextArgs.eventsDsl
      : nextArgs.events !== undefined && isEventsDsl(nextArgs.events)
      ? nextArgs.events
      : undefined;
  if (topLevelDsl !== undefined) {
    const compilation = compileEventsDsl({
      project,
      i18n,
      eventsDsl: topLevelDsl,
      eventIdPrefix,
    });
    compilations.push(compilation);
    nextArgs.events_json = compilation.serializedEvents;
    nextArgs.generated_event_id = eventIdPrefix || compilation.eventIds[0];
    delete nextArgs.events;
    delete nextArgs.events_dsl;
    delete nextArgs.eventsDsl;
  }

  const operations = Array.isArray(nextArgs.operations)
    ? nextArgs.operations
    : Array.isArray(nextArgs.event_patch)
    ? nextArgs.event_patch
    : Array.isArray(nextArgs.event_changes)
    ? nextArgs.event_changes
    : null;
  if (operations) {
    nextArgs.event_changes = operations.map((operation, index) => {
      if (!operation || typeof operation !== 'object') {
        throw new Error(`operations[${index}] must be an object.`);
      }
      const rawOperation =
        operation.op || operation.operation || operation.operation_name;
      if (typeof rawOperation !== 'string' || !rawOperation.trim()) {
        throw new Error(`operations[${index}].op is required.`);
      }
      const normalizedOperation = normalizeKey(rawOperation);
      const operationName =
        OPERATION_ALIASES[normalizedOperation] || rawOperation;
      const target = getTargetString(
        operation.target !== undefined
          ? operation.target
          : operation.targets !== undefined
          ? operation.targets
          : operation.operation_target_event,
        `operations[${index}].target`
      );
      const generatedDsl =
        operation.events_dsl !== undefined
          ? operation.events_dsl
          : operation.events !== undefined && isEventsDsl(operation.events)
          ? operation.events
          : operation.generated_events_dsl;
      const nextOperation = {
        ...operation,
        operation_name: operationName,
        operation_target_event: target,
      };
      if (generatedDsl !== undefined) {
        const compilation = compileEventsDsl({
          project,
          i18n,
          eventsDsl: generatedDsl,
          eventIdPrefix,
        });
        compilations.push(compilation);
        nextOperation.generated_events = compilation.serializedEvents;
      } else if (
        operation.generated_events === undefined &&
        operation.events !== undefined
      ) {
        nextOperation.generated_events = operation.events;
      }
      delete nextOperation.op;
      delete nextOperation.operation;
      delete nextOperation.target;
      delete nextOperation.targets;
      delete nextOperation.events;
      delete nextOperation.events_dsl;
      delete nextOperation.generated_events_dsl;
      return nextOperation;
    });
    delete nextArgs.operations;
    delete nextArgs.event_patch;
  }

  return { args: nextArgs, compilations };
};

export const getSerializedEventsRevision = (serializedEvents: any): string => {
  const text = JSON.stringify(serializedEvents || []);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

export const getEventDslReference = (): Object => ({
  dslVersion: EVENT_DSL_VERSION,
  eventKinds: Object.keys(EVENT_TYPES),
  operationAliases: Object.keys(OPERATION_ALIASES),
  rules: [
    'Use kind instead of GDevelop serializer event type names.',
    'Use parameters or args as an object keyed by metadata parameter name. Names are matched case-insensitively and ignore spaces, underscores, and hyphens.',
    'Use { any: [...] }, { all: [...] }, or { not: {...} } for logical conditions.',
    'Use children for sub-events. Group colors and stable event ids are generated when omitted.',
    'Use gdevelop_search_instruction_metadata when an instruction type is unknown; raw serialized events remain accepted as an advanced escape hatch.',
  ],
  example: {
    scene_name: 'Level1',
    events: [
      {
        kind: 'group',
        name: 'Initialization',
        children: [
          {
            kind: 'standard',
            conditions: [{ type: 'SceneJustBegins' }],
            actions: [
              {
                type: 'SetNumberVariable',
                parameters: {
                  Variable: 'Score',
                  'Modification sign': '=',
                  Value: 0,
                },
              },
            ],
          },
        ],
      },
    ],
    dry_run: true,
  },
});
