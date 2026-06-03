// @flow
import { enumerateAllExpressions } from '../InstructionOrExpression/EnumerateExpressions';
import { enumerateAllInstructions } from '../InstructionOrExpression/EnumerateInstructions';
import {
  renderInstructionSentenceAsPlainText,
  renderNonTranslatedEventsAsText,
} from '../EventsSheet/EventsTree/TextRenderer';
import { serializeToJSON, unserializeFromJSObject } from '../Utils/Serializer';
import { mapFor } from '../Utils/MapFor';
import { scanEventsListForValidationErrors } from '../Utils/EventsValidationScanner';
import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

// Resolve a possibly-relative file path against the opened project's folder, so
// file-based tools accept the same relative paths (e.g. "assets/level.json")
// that resource tools accept, instead of requiring absolute paths.
const resolveProjectRelativeFile = (
  project: gdProject,
  file: string
): string => {
  if (!file || !path) return file;
  if (path.isAbsolute(file)) return file;
  const projectFile = project.getProjectFile && project.getProjectFile();
  if (!projectFile) return file;
  return path.resolve(path.dirname(projectFile), file);
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const normalizeLimit = (limit: any): number => {
  if (typeof limit !== 'number' || !Number.isFinite(limit))
    return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
};

const normalizeText = (text: string): string => text.toLowerCase();

// Alias map: free-text intent terms a model is likely to type, mapped to extra
// terms that actually appear in GDevelop instruction metadata (including the
// French/legacy internal type fragments like MettreX, ModVarObjet, Scene). When
// any alias key token is present in the query, its values are added to the set
// of acceptable match terms so a single query token can be satisfied by any of
// them. This fixes "play sound effect", "delete object", "change position",
// "scene variable", etc. returning nothing.
const SEARCH_ALIASES: { [string]: Array<string> } = {
  play: ['playsound', 'sound', 'play'],
  sound: ['playsound', 'sound', 'audio', 'music'],
  effect: ['sound', 'playsound'],
  music: ['playmusic', 'music', 'sound'],
  key: ['key', 'keyboard', 'keypressed', 'keydown'],
  keyboard: ['key', 'keyboard', 'keypressed'],
  pressed: ['pressed', 'keypressed', 'mousebutton'],
  position: ['mettrex', 'mettrey', 'mettrexy', 'posx', 'posy', 'position'],
  move: ['mettrex', 'mettrey', 'mettrexy', 'position', 'move', 'forces'],
  coordinate: ['mettrex', 'mettrey', 'posx', 'posy'],
  delete: ['delete', 'destroy', 'remove'],
  destroy: ['delete', 'destroy', 'remove'],
  remove: ['delete', 'destroy', 'remove'],
  text: [
    'string',
    'text',
    'settext',
    'texte',
    'textcontainer',
    'textcontainercapability',
    'setvalue',
  ],
  string: ['string', 'text', 'settext', 'setvalue', 'textcontainer'],
  modify: ['mod', 'set', 'change'],
  set: ['set', 'mod', 'change', 'mettre', 'setvalue'],
  change: ['mod', 'set', 'change'],
  variable: ['var', 'variable', 'varscene', 'varglobal', 'modvarobjet', 'varobjet', 'setnumbervariable', 'setstringvariable'],
  scene: ['scene', 'layout'],
  restart: ['scene', 'restart', 'changescene'],
  switch: ['scene', 'changescene'],
  random: ['random', 'randominrange'],
  opacity: ['opacity', 'opacite'],
  rotate: ['angle', 'rotate', 'mettreangle'],
  rotation: ['angle', 'rotate'],
  hide: ['cache', 'hide', 'visible'],
  show: ['montre', 'show', 'visible'],
  timer: ['timer', 'time'],
  collision: ['collision', 'collisionnnp', 'iscolliding'],
  animation: ['animation', 'anim'],
  health: ['variable', 'var'],
  score: ['variable', 'var'],
};

// Tokenize a search string into lowercase word tokens.
const tokenizeQuery = (query: string): Array<string> =>
  normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// Score how well candidate field values match the query. Returns 0 for no match.
// Higher is better. The match requires that EVERY query token is satisfied by
// some candidate value (directly or via an alias term), which is what makes
// multi-word queries work as an AND search instead of a single contiguous
// substring test. A small bonus is added for exact/prefix matches and for
// matches in the most identifying fields (type, displayed name).
const scoreMatch = (values: Array<?string>, query: string): number => {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return 0;

  const normalizedValues = values
    .filter(Boolean)
    .map(value => normalizeText((value: any)));
  if (!normalizedValues.length) return 0;
  const haystack = normalizedValues.join(' ');
  // Compact haystack with separators removed, so a token like "playsound"
  // matches the type "PlaySound" and "setnumbervariable" matches the type even
  // though fields contain spaces or camelCase.
  const compactHaystack = haystack.replace(/[^a-z0-9]+/g, '');

  let score = 0;
  for (const token of tokens) {
    const aliasTerms = SEARCH_ALIASES[token] || [];
    const candidates = [token, ...aliasTerms];
    const matched = candidates.some(
      term => haystack.includes(term) || compactHaystack.includes(term)
    );
    if (!matched) return 0; // AND semantics: every token must match something.
    // Direct (non-alias) token hits are worth more than alias-only hits.
    score += haystack.includes(token) || compactHaystack.includes(token) ? 2 : 1;
  }

  // Bonuses: whole-query contiguous hit, and hits in the first value (type) /
  // second value (displayed name), which are the most identifying.
  const fullQuery = normalizeText(query).trim();
  if (fullQuery && haystack.includes(fullQuery)) score += 3;
  if (normalizedValues[0] && tokens.some(t => normalizedValues[0].includes(t)))
    score += 2;
  if (normalizedValues[1] && tokens.some(t => normalizedValues[1].includes(t)))
    score += 1;

  return score;
};

const includesQuery = (values: Array<?string>, query: string): boolean =>
  scoreMatch(values, query) > 0;

// GDevelop parameter types whose VALUE in event JSON is a string EXPRESSION:
// a literal must be wrapped in double quotes (e.g. "Space", "220;30;55",
// "Game Over"). Mirrors gd::ValueTypeMetadata::IsTypeExpression("string", ...).
const QUOTED_STRING_PARAMETER_TYPES = new Set([
  'string',
  'layer',
  'color',
  'file',
  'stringWithSelector',
  'sceneName',
  'layerEffectName',
  'layerEffectParameterName',
  'objectAnimationName',
  'functionParameterName',
  'externalLayoutName',
  'leaderboardId',
  'identifier',
  'keyboardKey',
  'mouseButton',
]);

// Types whose value is a NUMBER expression (bare number or numeric expression).
const NUMBER_PARAMETER_TYPES = new Set(['number', 'expression', 'camera']);

// Types whose value is a bare object NAME (no quotes).
const OBJECT_PARAMETER_TYPES = new Set(['object', 'objectPtr', 'objectList']);

// Types whose value is a bare VARIABLE reference (no quotes). For object
// variables, reference them in expressions as Object.VariableName.
const VARIABLE_PARAMETER_TYPES = new Set([
  'variable',
  'objectvar',
  'scenevar',
  'globalvar',
  'variableOrProperty',
]);

// Describe, in one line, how to write a literal value for a parameter type in
// event JSON. Used in metadata output and validation suggestions so callers stop
// guessing which parameters need embedded quotes.
const describeParameterLiteralSyntax = (parameterType: string): string => {
  if (QUOTED_STRING_PARAMETER_TYPES.has(parameterType)) {
    return `string expression — wrap literals in double quotes, e.g. "value" (type "${parameterType}")`;
  }
  if (NUMBER_PARAMETER_TYPES.has(parameterType)) {
    return `number expression — bare number or numeric expression, no quotes, e.g. 100 or Variable(Score) (type "${parameterType}")`;
  }
  if (OBJECT_PARAMETER_TYPES.has(parameterType)) {
    return `object name — bare object name, no quotes (type "${parameterType}")`;
  }
  if (parameterType === 'behavior') {
    return `behavior NAME — bare behavior instance name (NOT the behavior type), no quotes (type "behavior")`;
  }
  if (VARIABLE_PARAMETER_TYPES.has(parameterType)) {
    return `variable reference — bare variable name, no quotes; object variables are Object.VariableName (type "${parameterType}")`;
  }
  if (parameterType === 'yesorno' || parameterType === 'trueorfalse') {
    return `boolean — yes/no (no quotes) (type "${parameterType}")`;
  }
  if (parameterType === 'key' || parameterType === 'mouse') {
    return `bare keyword, no quotes (type "${parameterType}")`;
  }
  return `type "${parameterType}" — check parameter description; bare identifier unless it expects a string/number expression`;
};

// Classify how a parameter value should be written, for type-aware validation
// suggestions. Returns 'quoted-string' | 'number' | 'object' | 'behavior' |
// 'variable' | 'boolean' | 'other'.
const classifyParameterValueShape = (parameterType: string): string => {
  if (QUOTED_STRING_PARAMETER_TYPES.has(parameterType)) return 'quoted-string';
  if (NUMBER_PARAMETER_TYPES.has(parameterType)) return 'number';
  if (OBJECT_PARAMETER_TYPES.has(parameterType)) return 'object';
  if (parameterType === 'behavior') return 'behavior';
  if (VARIABLE_PARAMETER_TYPES.has(parameterType)) return 'variable';
  if (parameterType === 'yesorno' || parameterType === 'trueorfalse')
    return 'boolean';
  return 'other';
};

const summarizeParameter = (
  parameterMetadata: gdParameterMetadata,
  index: number,
  options?: {| compact?: boolean |}
): Object => {
  const valueTypeMetadata = parameterMetadata.getValueTypeMetadata();
  const type = parameterMetadata.getType();
  if (options && options.compact) {
    // Compact form drops the verbose valueType discriminator object and keeps
    // only what a caller needs to fill the parameter correctly.
    return {
      index,
      type,
      name: parameterMetadata.getName() || undefined,
      description: parameterMetadata.getDescription() || undefined,
      isOptional: parameterMetadata.isOptional(),
      defaultValue: parameterMetadata.getDefaultValue() || undefined,
      // How to write a literal value for this parameter in event JSON.
      literalSyntax: describeParameterLiteralSyntax(type),
    };
  }
  const parameter = {
    index,
    type,
    name: parameterMetadata.getName() || undefined,
    description: parameterMetadata.getDescription() || undefined,
    longDescription: parameterMetadata.getLongDescription() || undefined,
    hint: parameterMetadata.getHint() || undefined,
    extraInfo: parameterMetadata.getExtraInfo() || undefined,
    defaultValue: parameterMetadata.getDefaultValue() || undefined,
    isOptional: parameterMetadata.isOptional(),
    isCodeOnly: parameterMetadata.isCodeOnly(),
    literalSyntax: describeParameterLiteralSyntax(type),
    valueType: valueTypeMetadata
      ? {
          name: valueTypeMetadata.getName(),
          extraInfo: valueTypeMetadata.getExtraInfo() || undefined,
          isOptional: valueTypeMetadata.isOptional(),
          defaultValue: valueTypeMetadata.getDefaultValue() || undefined,
          isObject: valueTypeMetadata.isObject(),
          isBehavior: valueTypeMetadata.isBehavior(),
          isNumber: valueTypeMetadata.isNumber(),
          isString: valueTypeMetadata.isString(),
          isVariable: valueTypeMetadata.isVariable(),
          isResource: valueTypeMetadata.isResource(),
        }
      : undefined,
  };
  return parameter;
};

const summarizeInstructionMetadata = ({
  type,
  kind,
  metadata,
  fullGroupName,
  compact,
}: {|
  type: string,
  kind: 'action' | 'condition',
  metadata: gdInstructionMetadata,
  fullGroupName?: ?string,
  compact?: boolean,
|}): Object => {
  if (compact) {
    return {
      kind,
      type,
      fullName: metadata.getFullName(),
      description: metadata.getDescription(),
      sentence: metadata.getSentence(),
      group: fullGroupName || metadata.getGroup(),
      // True when usable in a scene (layout) or external events sheet.
      isRelevantForSceneEvents: metadata.isRelevantForLayoutEvents(),
      parameters: mapFor(0, metadata.getParametersCount(), index =>
        summarizeParameter(metadata.getParameter(index), index, {
          compact: true,
        })
      ),
    };
  }
  return {
    kind,
    type,
    fullName: metadata.getFullName(),
    description: metadata.getDescription(),
    sentence: metadata.getSentence(),
    group: fullGroupName || metadata.getGroup(),
    helpPath: metadata.getHelpPath(),
    iconFilename: metadata.getIconFilename(),
    smallIconFilename: metadata.getSmallIconFilename(),
    canHaveSubInstructions: metadata.canHaveSubInstructions(),
    isHidden: metadata.isHidden(),
    isPrivate: metadata.isPrivate(),
    isAsync: metadata.isAsync(),
    isOptionallyAsync: metadata.isOptionallyAsync(),
    // Maps to GDevelop core isRelevantForLayoutEvents(): true when the
    // instruction can be used in a scene's event sheet or in external events
    // (as opposed to being restricted to events-function/custom-object bodies).
    // It does NOT mean the instruction is unusable in scenes when false for
    // object-variable instructions — see the note in get_instruction_metadata.
    isRelevantForSceneEvents: metadata.isRelevantForLayoutEvents(),
    isRelevantForFunctionEvents: metadata.isRelevantForFunctionEvents(),
    isRelevantForAsynchronousFunctionEvents: metadata.isRelevantForAsynchronousFunctionEvents(),
    isRelevantForCustomObjectEvents: metadata.isRelevantForCustomObjectEvents(),
    usageComplexity: metadata.getUsageComplexity(),
    deprecationMessage: metadata.getDeprecationMessage() || undefined,
    parameters: mapFor(0, metadata.getParametersCount(), index =>
      summarizeParameter(metadata.getParameter(index), index)
    ),
  };
};

const summarizeExpressionMetadata = ({
  type,
  metadata,
  fullGroupName,
  compact,
}: {|
  type: string,
  metadata: gdExpressionMetadata,
  fullGroupName?: ?string,
  compact?: boolean,
|}): Object => {
  if (compact) {
    return {
      kind: 'expression',
      type,
      fullName: metadata.getFullName(),
      description: metadata.getDescription(),
      group: fullGroupName || metadata.getGroup(),
      returnType: metadata.getReturnType(),
      parameters: mapFor(0, metadata.getParametersCount(), index =>
        summarizeParameter(metadata.getParameter(index), index, {
          compact: true,
        })
      ),
    };
  }
  return {
    kind: 'expression',
    type,
    fullName: metadata.getFullName(),
    description: metadata.getDescription(),
    group: fullGroupName || metadata.getGroup(),
    returnType: metadata.getReturnType(),
    helpPath: metadata.getHelpPath(),
    smallIconFilename: metadata.getSmallIconFilename(),
    isShown: metadata.isShown(),
    isPrivate: metadata.isPrivate(),
    isDeprecated: metadata.isDeprecated(),
    isRelevantForSceneEvents: metadata.isRelevantForLayoutEvents(),
    isRelevantForFunctionEvents: metadata.isRelevantForFunctionEvents(),
    isRelevantForAsynchronousFunctionEvents: metadata.isRelevantForAsynchronousFunctionEvents(),
    isRelevantForCustomObjectEvents: metadata.isRelevantForCustomObjectEvents(),
    deprecationMessage: metadata.getDeprecationMessage() || undefined,
    parameters: mapFor(0, metadata.getParametersCount(), index =>
      summarizeParameter(metadata.getParameter(index), index)
    ),
  };
};

export const getEventOperationReference = (): Object => ({
  targetPathFormat:
    'Use event-0 for the first root event, event-0.1 for the second sub-event of the first root event, or an aiGeneratedEventId previously assigned by GDevelop.',
  generatedEventsFormat:
    'generated_events must be a JSON string containing an array of serialized GDevelop events. The same array string can also be passed as events_json when using add_scene_events.',
  operations: [
    {
      name: 'insert_at_end',
      requiresTarget: false,
      requiresGeneratedEvents: true,
      description:
        'Append generated events at the end of the scene event sheet.',
    },
    {
      name: 'insert_before_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Insert generated events immediately before the target event.',
    },
    {
      name: 'insert_after_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Insert generated events immediately after the target event.',
    },
    {
      name: 'insert_as_sub_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description: 'Insert generated events as sub-events of the target event.',
    },
    {
      name: 'insert_and_replace_event',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Delete the target event and insert generated events at the same position.',
    },
    {
      name: 'replace_entire_event_and_sub_events',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Alias of insert_and_replace_event. Replace the target event and its sub-events.',
    },
    {
      name: 'replace_event_but_keep_existing_sub_events',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Replace the target event body while keeping its existing sub-events.',
    },
    {
      name: 'insert_actions_conditions_at_end',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Append the generated standard event actions and conditions to the target standard event.',
    },
    {
      name: 'insert_actions_conditions_at_start',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Prepend the generated standard event actions and conditions to the target standard event.',
    },
    {
      name: 'replace_all_actions',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Replace all actions of the target standard event with actions from the generated standard event.',
    },
    {
      name: 'replace_all_conditions',
      requiresTarget: true,
      requiresGeneratedEvents: true,
      description:
        'Replace all conditions of the target standard event with conditions from the generated standard event.',
    },
    {
      name: 'delete_event',
      requiresTarget: true,
      requiresGeneratedEvents: false,
      description:
        'Delete the target event. Multiple comma-separated targets are supported for this operation only.',
    },
  ],
});

const standardEventWithInstructionExample = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [
      {
        type: { value: 'SceneJustBegins' },
        parameters: [''],
      },
    ],
    actions: [
      {
        type: { value: 'SetNumberVariable' },
        parameters: ['Score', '=', '0'],
      },
    ],
  },
];

const commentEventExample = [
  {
    type: 'BuiltinCommonInstructions::Comment',
    comment: 'Initialize the score when the scene starts.',
    color: {
      r: 255,
      g: 230,
      b: 109,
      textR: 0,
      textG: 0,
      textB: 0,
    },
  },
];

const groupEventExample = [
  {
    type: 'BuiltinCommonInstructions::Group',
    name: 'Initialization',
    folded: true,
    colorR: 74,
    colorG: 176,
    colorB: 228,
    events: standardEventWithInstructionExample,
  },
];

export const getEventsJsonExamples = ({
  project,
  sceneName,
  includeExistingSceneEvents,
}: {|
  project: gdProject,
  sceneName?: ?string,
  includeExistingSceneEvents?: ?boolean,
|}): Object => {
  const standardEventsJson = JSON.stringify(
    standardEventWithInstructionExample,
    null,
    2
  );
  const commentEventsJson = JSON.stringify(commentEventExample, null, 2);
  const groupEventsJson = JSON.stringify(groupEventExample, null, 2);
  const examples: Array<Object> = [
    {
      name: 'Append one standard event',
      purpose:
        'Use this shape for most game logic: a standard event with conditions and actions.',
      events_json: standardEventsJson,
      event_changes: [
        {
          operation_name: 'insert_at_end',
          generated_events: standardEventsJson,
        },
      ],
    },
    {
      name: 'Append a comment event',
      purpose: 'Use comments to explain or separate generated event blocks.',
      events_json: commentEventsJson,
      event_changes: [
        {
          operation_name: 'insert_at_end',
          generated_events: commentEventsJson,
        },
      ],
    },
    {
      name: 'Append a group event with one sub-event',
      purpose:
        'Use groups as visual/organizational wrappers. Put executable logic in the group events array.',
      events_json: groupEventsJson,
      event_changes: [
        {
          operation_name: 'insert_at_end',
          generated_events: groupEventsJson,
        },
      ],
    },
  ];

  if (
    includeExistingSceneEvents &&
    sceneName &&
    project.hasLayoutNamed(sceneName)
  ) {
    const currentEvents = project.getLayout(sceneName).getEvents();
    if (!currentEvents.isEmpty()) {
      const sceneEventsJson = serializeToJSON(currentEvents);
      examples.push({
        name: `Current events from scene "${sceneName}"`,
        purpose:
          'A real serialized event sheet from the currently opened project. Use as a project-specific reference only.',
        events_json: sceneEventsJson,
        event_changes: [
          {
            operation_name: 'insert_at_end',
            generated_events: sceneEventsJson,
          },
        ],
      });
    }
  }

  return {
    eventJsonShape:
      'Serialized scene events are a JSON array. A standard event uses type "BuiltinCommonInstructions::Standard", conditions: [{ type: { value: "<condition type>" }, parameters: [...] }], actions: [{ type: { value: "<action type>" }, parameters: [...] }], and optional nested events: [...].',
    addSceneEventsShape:
      'For add_scene_events, pass { scene_name, events_json } for append-at-end, or { scene_name, event_changes: [{ operation_name, operation_target_event, generated_events }] } for precise edits.',
    // Quoting and expression-syntax rules. These are the most common cause of
    // parameter validation failures.
    parameterSyntaxRules: {
      summary:
        'String-expression parameters take a value WITH embedded double quotes; object/behavior/variable names and numbers are bare (no quotes).',
      quotedStringTypes: [
        'string (text)',
        'keyboardKey (e.g. "Space")',
        'color (e.g. "220;30;55")',
        'sceneName (e.g. "Game") — yes, the Scene action\'s scene name parameter is quoted',
        'layer (e.g. "" for base layer, or "HUD")',
        'file, identifier, stringWithSelector',
      ],
      bareTypes: [
        'object — bare object name (e.g. Player)',
        'behavior — bare behavior NAME on the object (e.g. PlatformerObject), NOT the behavior type',
        'number/expression — bare number or numeric expression (e.g. 100, Variable(Score))',
        'variable/scenevar/globalvar/objectvar — bare variable reference',
      ],
    },
    variableExpressionSyntax: {
      summary:
        'How to reference variables inside expressions and string parameters.',
      sceneVariable:
        'Reference a scene variable by its bare name: Variable(Score) in a number/string expression, or just Score where a variable parameter is expected. Do NOT write SceneVariable(Score).',
      globalVariable:
        'Reference a global variable with GlobalVariable(MyGlobal). Do NOT write Variable(...) for globals.',
      objectVariable:
        'Reference an object variable as Object.VariableName, e.g. Player.Life or Enemy.Health (in expressions). For a variable PARAMETER, the object variable instructions take the object name and a bare variable name. Do NOT write VarObjet(Player, Life).',
      childVariable:
        'Access a structure child with Variable(Inventory.gold) or Object.Stats.level.',
    },
    commonInstructionTypes: {
      summary:
        'GDevelop internal types are sometimes French/legacy and hard to guess. Common ones (verify with gdevelop_get_instruction_metadata):',
      setObjectPositionX: 'MettreX (action)',
      setObjectPositionY: 'MettreY (action)',
      setObjectPosition: 'MettreXY (action)',
      objectPositionXCondition: 'PosX (condition)',
      objectPositionYCondition: 'PosY (condition)',
      setObjectAngle: 'MettreAngle (action)',
      setObjectVariable: 'ModVarObjet (action), VarObjet (condition)',
      setSceneVariableNumber: 'SetNumberVariable (action)',
      setSceneVariableString: 'SetStringVariable (action)',
      deleteObject: 'Delete (action)',
      changeOrRestartScene: 'Scene (action — its scene name parameter is quoted)',
      playSound: 'PlaySound (action)',
      keyPressed: 'KeyPressed (condition)',
      sceneJustBegins: 'SceneJustBegins (condition)',
    },
    sources: [
      {
        name: 'GDevelop events documentation',
        url: 'https://wiki.gdevelop.io/gdevelop5/events/',
      },
      {
        name: 'GDevelop events editor documentation',
        url: 'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/',
      },
      {
        name: 'GDevelop official examples repository',
        url: 'https://github.com/GDevelopApp/GDevelop-examples',
      },
    ],
    examples,
  };
};

const getInstructionMetadata = (
  project: gdProject,
  type: string,
  kind: string,
  compact?: boolean
): ?Object => {
  if (kind === 'condition') {
    const metadata = gd.MetadataProvider.getConditionMetadata(
      project.getCurrentPlatform(),
      type
    );
    return gd.MetadataProvider.isBadInstructionMetadata(metadata)
      ? null
      : summarizeInstructionMetadata({
          type,
          kind: 'condition',
          metadata,
          compact: !!compact,
        });
  }

  if (kind === 'action') {
    const metadata = gd.MetadataProvider.getActionMetadata(
      project.getCurrentPlatform(),
      type
    );
    return gd.MetadataProvider.isBadInstructionMetadata(metadata)
      ? null
      : summarizeInstructionMetadata({
          type,
          kind: 'action',
          metadata,
          compact: !!compact,
        });
  }

  if (kind === 'expression') {
    const numberExpressionMetadata = gd.MetadataProvider.getExpressionMetadata(
      project.getCurrentPlatform(),
      type
    );
    if (
      !gd.MetadataProvider.isBadExpressionMetadata(numberExpressionMetadata)
    ) {
      return summarizeExpressionMetadata({
        type,
        metadata: numberExpressionMetadata,
        compact: !!compact,
      });
    }

    const stringExpressionMetadata = gd.MetadataProvider.getStrExpressionMetadata(
      project.getCurrentPlatform(),
      type
    );
    if (
      !gd.MetadataProvider.isBadExpressionMetadata(stringExpressionMetadata)
    ) {
      return summarizeExpressionMetadata({
        type,
        metadata: stringExpressionMetadata,
        compact: !!compact,
      });
    }
  }

  return null;
};

export const getExactInstructionMetadata = ({
  project,
  type,
  kind,
  compact,
}: {|
  project: gdProject,
  type?: ?string,
  kind?: ?string,
  compact?: boolean,
|}): Object => {
  if (!type) {
    return {
      error: 'Missing type.',
    };
  }
  if (!kind) {
    return {
      error: 'Missing kind. Use action, condition, or expression.',
    };
  }

  const metadata = getInstructionMetadata(project, type, kind, compact);
  if (!metadata) {
    return {
      error: `No ${kind} metadata found for "${type}". Use gdevelop_search_instruction_metadata first to find exact types.`,
    };
  }
  return {
    ...metadata,
    // Clarify a confusing field: object-variable instructions (ModVarObjet /
    // VarObjet) report isRelevantForSceneEvents:false, but they DO work in scene
    // events. The flag only marks the instruction's declared "primary" context;
    // it does not forbid scene usage.
    fieldNotes: {
      isRelevantForSceneEvents:
        'Maps to GDevelop core isRelevantForLayoutEvents(). false does NOT mean the instruction cannot be used in scene events (e.g. object-variable instructions report false yet work in scenes); it reflects the instruction\'s declared primary context.',
    },
  };
};

export const searchInstructionMetadata = ({
  project,
  i18n,
  query,
  kind,
  limit,
  compact,
}: {|
  project: gdProject,
  i18n: any,
  query?: ?string,
  kind?: ?string,
  limit?: ?number,
  compact?: boolean,
|}): Object => {
  const normalizedKind = kind || 'all';
  const resultLimit = normalizeLimit(limit);
  const searchQuery = query || '';

  if (!searchQuery) {
    return {
      query: searchQuery,
      kind: normalizedKind,
      limit: resultLimit,
      results: [],
      note:
        'Provide a query such as an internal type, displayed name, description, group, object name, or behavior name. Multi-word queries are tokenized (all words must match) and common intents like "play sound", "key pressed", "change position", "delete object", "scene variable" are aliased to GDevelop internal types.',
    };
  }

  // Collect ALL matches with a score across every requested kind, then sort by
  // score and truncate. This replaces the previous per-kind early-break, which
  // could let actions consume the whole limit and starve conditions/expressions,
  // and returned matches in arbitrary enumeration order.
  const scored: Array<{| score: number, order: number, summary: Object |}> = [];
  let order = 0;

  const considerInstruction = (instruction, instructionKind) => {
    const score = scoreMatch(
      [
        instruction.type,
        instruction.displayedName,
        instruction.description,
        instruction.fullGroupName,
        instruction.scope.extension.name,
        instruction.scope.objectMetadata &&
          instruction.scope.objectMetadata.name,
        instruction.scope.behaviorMetadata &&
          instruction.scope.behaviorMetadata.name,
      ],
      searchQuery
    );
    if (score > 0) {
      scored.push({
        score,
        order: order++,
        summary: summarizeInstructionMetadata({
          type: instruction.type,
          kind: instructionKind,
          metadata: instruction.metadata,
          fullGroupName: instruction.fullGroupName,
          compact: !!compact,
        }),
      });
    }
  };

  if (normalizedKind === 'all' || normalizedKind === 'action') {
    for (const instruction of enumerateAllInstructions(false, project, i18n)) {
      considerInstruction(instruction, 'action');
    }
  }

  if (normalizedKind === 'all' || normalizedKind === 'condition') {
    for (const instruction of enumerateAllInstructions(true, project, i18n)) {
      considerInstruction(instruction, 'condition');
    }
  }

  if (normalizedKind === 'all' || normalizedKind === 'expression') {
    for (const expression of enumerateAllExpressions('', project, i18n)) {
      const score = scoreMatch(
        [
          expression.type,
          expression.displayedName,
          expression.fullGroupName,
          expression.scope.extension.name,
          expression.scope.objectMetadata &&
            expression.scope.objectMetadata.name,
          expression.scope.behaviorMetadata &&
            expression.scope.behaviorMetadata.name,
        ],
        searchQuery
      );
      if (score > 0) {
        scored.push({
          score,
          order: order++,
          summary: summarizeExpressionMetadata({
            type: expression.type,
            metadata: expression.metadata,
            fullGroupName: expression.fullGroupName,
            compact: !!compact,
          }),
        });
      }
    }
  }

  scored.sort((left, right) =>
    right.score !== left.score
      ? right.score - left.score
      : left.order - right.order
  );

  const results = scored.slice(0, resultLimit).map(entry => entry.summary);

  return {
    query: searchQuery,
    kind: normalizedKind,
    limit: resultLimit,
    totalMatches: scored.length,
    truncated: scored.length > resultLimit,
    results,
  };
};

const getInstructionMetadataForValidation = (
  project: gdProject,
  instructionType: string,
  isCondition: boolean
): ?gdInstructionMetadata => {
  const metadata = isCondition
    ? gd.MetadataProvider.getConditionMetadata(
        project.getCurrentPlatform(),
        instructionType
      )
    : gd.MetadataProvider.getActionMetadata(
        project.getCurrentPlatform(),
        instructionType
      );
  return gd.MetadataProvider.isBadInstructionMetadata(metadata)
    ? null
    : metadata;
};

// Parameter types where a bare literal is almost never a valid expression, so
// auto-wrapping it in quotes is safe and fixes the most common quoting mistake
// (e.g. layer "HUD", a timer identifier, a key name, a color, a scene name).
// NOTE: plain `string`/`text` are intentionally EXCLUDED — those frequently use
// concatenation expressions (e.g. "Score: " + ToString(Score)), so wrapping
// would corrupt valid input.
const AUTO_QUOTE_PARAMETER_TYPES = new Set([
  'keyboardKey',
  'color',
  'sceneName',
  'layer',
  'identifier',
  'stringWithSelector',
  'objectAnimationName',
  'layerEffectName',
  'layerEffectParameterName',
]);

// Decide whether a raw parameter value is a bare literal we can safely wrap in
// double quotes. We refuse anything that already looks like an expression.
const shouldAutoQuoteValue = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false; // empty = default (e.g. base layer), leave as-is
  if (trimmed.startsWith('"')) return false; // already quoted
  // Looks like an expression / number / structured value → do not touch.
  if (/["'()+\-*/.,\[\]]/.test(trimmed)) return false;
  if (/^[0-9]/.test(trimmed)) return false;
  return true;
};

const getSerializedInstructionTypeValue = (instruction: any): string => {
  if (!instruction || typeof instruction !== 'object') return '';
  const type = instruction.type;
  if (type && typeof type === 'object' && typeof type.value === 'string')
    return type.value;
  if (typeof type === 'string') return type;
  return '';
};

// Walk a parsed events array (the plain JSON shape used in events_json) and wrap
// bare literals for safe quoted-string parameter types, in place. Returns the
// number of parameters changed. Used by the write path so callers do not have to
// remember to escape "HUD" as "\"HUD\"".
export const autoQuoteEventParameters = (
  project: gdProject,
  events: Array<any>
): number => {
  let changedCount = 0;

  const normalizeInstructions = (instructions: any, isCondition: boolean) => {
    if (!Array.isArray(instructions)) return;
    instructions.forEach(instruction => {
      const type = getSerializedInstructionTypeValue(instruction);
      if (type) {
        const metadata = getInstructionMetadataForValidation(
          project,
          type,
          isCondition
        );
        if (metadata && Array.isArray(instruction.parameters)) {
          const parametersCount = metadata.getParametersCount();
          for (
            let index = 0;
            index < parametersCount && index < instruction.parameters.length;
            index++
          ) {
            const parameterType = metadata.getParameter(index).getType();
            if (
              AUTO_QUOTE_PARAMETER_TYPES.has(parameterType) &&
              shouldAutoQuoteValue(instruction.parameters[index])
            ) {
              instruction.parameters[index] = `"${instruction.parameters[index]}"`;
              changedCount++;
            }
          }
        }
      }
      // Recurse into sub-instructions.
      if (Array.isArray(instruction.subInstructions)) {
        normalizeInstructions(instruction.subInstructions, isCondition);
      }
    });
  };

  const normalizeEvents = (eventsList: any) => {
    if (!Array.isArray(eventsList)) return;
    eventsList.forEach(event => {
      if (!event || typeof event !== 'object') return;
      normalizeInstructions(event.conditions, true);
      normalizeInstructions(event.actions, false);
      if (Array.isArray(event.events)) normalizeEvents(event.events);
    });
  };

  normalizeEvents(events);
  return changedCount;
};

const isUrlResourceFile = (file: string): boolean =>
  file.startsWith('http://') ||
  file.startsWith('https://') ||
  file.startsWith('ftp://') ||
  file.startsWith('blob:') ||
  file.startsWith('data:');

const resolveLocalResourceFile = (
  project: gdProject,
  file: string
): string | null => {
  if (!file || !path || isUrlResourceFile(file)) return null;
  if (path.isAbsolute(file)) return file;

  const projectFile = project.getProjectFile();
  if (!projectFile) return null;
  return path.resolve(path.dirname(projectFile), file);
};

const getExpectedResourceKind = (parameterType: string): string | null => {
  if (
    parameterType === 'soundfile' ||
    parameterType === 'musicfile' ||
    parameterType === 'audioResource'
  ) {
    return 'audio';
  }
  if (parameterType === 'imageResource') return 'image';
  if (parameterType === 'fontResource') return 'font';
  if (parameterType === 'videoResource') return 'video';
  if (parameterType === 'jsonResource') return 'json';
  if (parameterType === 'bitmapFontResource') return 'bitmapFont';
  if (parameterType === 'tilemapResource') return 'tilemap';
  if (parameterType === 'tilesetResource') return 'tileset';
  if (parameterType === 'model3DResource') return 'model3D';
  if (parameterType === 'atlasResource') return 'atlas';
  if (parameterType === 'spineResource') return 'spine';
  return null;
};

const isResourceParameter = (
  parameterMetadata: gdParameterMetadata
): boolean => {
  const valueTypeMetadata = parameterMetadata.getValueTypeMetadata();
  return !!(
    valueTypeMetadata &&
    valueTypeMetadata.isResource &&
    valueTypeMetadata.isResource()
  );
};

const validateReferencedResource = ({
  project,
  instructionType,
  instructionSentence,
  isCondition,
  eventPath,
  instructionIndex,
  parameterIndex,
  parameterMetadata,
  resourceName,
  issues,
}: {|
  project: gdProject,
  instructionType: string,
  instructionSentence: string,
  isCondition: boolean,
  eventPath: Array<number>,
  instructionIndex: number,
  parameterIndex: number,
  parameterMetadata: gdParameterMetadata,
  resourceName: string,
  issues: Array<Object>,
|}) => {
  if (!resourceName) return;
  const resourcesManager = project.getResourcesManager();
  if (!resourcesManager.hasResource(resourceName)) {
    // GDevelop's InstructionValidator already reports the invalid parameter.
    return;
  }

  const resource = resourcesManager.getResource(resourceName);
  const expectedKind = getExpectedResourceKind(parameterMetadata.getType());
  if (expectedKind && resource.getKind() !== expectedKind) {
    issues.push({
      severity: 'error',
      type: 'resource-kind-mismatch',
      isCondition,
      instructionType,
      instructionSentence,
      eventPath,
      instructionIndex,
      parameterIndex,
      resourceName,
      resourceKind: resource.getKind(),
      expectedResourceKind: expectedKind,
    });
  }

  const resourceFile = resource.getFile();
  if (!resourceFile) {
    issues.push({
      severity: 'error',
      type: 'resource-empty-file',
      isCondition,
      instructionType,
      instructionSentence,
      eventPath,
      instructionIndex,
      parameterIndex,
      resourceName,
      resourceKind: resource.getKind(),
    });
    return;
  }

  const resolvedFile = resolveLocalResourceFile(project, resourceFile);
  if (resolvedFile && fs && !fs.existsSync(resolvedFile)) {
    issues.push({
      severity: 'error',
      type: 'resource-missing-file',
      isCondition,
      instructionType,
      instructionSentence,
      eventPath,
      instructionIndex,
      parameterIndex,
      resourceName,
      resourceKind: resource.getKind(),
      resourceFile,
      resolvedFile,
    });
  }
};

const validateInstructionsList = ({
  project,
  instructionsList,
  isCondition,
  path,
  issues,
}: {|
  project: gdProject,
  instructionsList: gdInstructionsList,
  isCondition: boolean,
  path: Array<number>,
  issues: Array<Object>,
|}) => {
  mapFor(0, instructionsList.size(), instructionIndex => {
    const instruction = instructionsList.get(instructionIndex);
    const instructionType = instruction.getType();
    if (!instructionType) {
      issues.push({
        severity: 'error',
        type: 'missing-instruction-type',
        isCondition,
        eventPath: path,
        instructionIndex,
      });
      return;
    }

    const metadata = getInstructionMetadataForValidation(
      project,
      instructionType,
      isCondition
    );
    if (!metadata) {
      issues.push({
        severity: 'error',
        type: 'unknown-instruction',
        isCondition,
        instructionType,
        eventPath: path,
        instructionIndex,
      });
      return;
    }

    mapFor(0, metadata.getParametersCount(), parameterIndex => {
      const parameterMetadata = metadata.getParameter(parameterIndex);
      if (parameterMetadata.isCodeOnly()) return;

      const value =
        parameterIndex < instruction.getParametersCount()
          ? instruction.getParameter(parameterIndex).getPlainString()
          : '';
      const hasDefaultValue = parameterMetadata.getDefaultValue() !== '';
      const canBeEmpty =
        parameterMetadata.isOptional() ||
        hasDefaultValue ||
        parameterMetadata.getType() === 'yesorno' ||
        parameterMetadata.getType() === 'layer';

      if (!value && !canBeEmpty) {
        issues.push({
          severity: 'error',
          type: 'missing-required-parameter',
          isCondition,
          instructionType,
          instructionSentence: renderInstructionSentenceAsPlainText(
            instruction,
            metadata
          ),
          eventPath: path,
          instructionIndex,
          parameter: summarizeParameter(parameterMetadata, parameterIndex),
        });
      }

      if (isResourceParameter(parameterMetadata)) {
        validateReferencedResource({
          project,
          instructionType,
          instructionSentence: renderInstructionSentenceAsPlainText(
            instruction,
            metadata
          ),
          isCondition,
          eventPath: path,
          instructionIndex,
          parameterIndex,
          parameterMetadata,
          resourceName: value,
          issues,
        });
      }
    });

    if (instruction.getParametersCount() > metadata.getParametersCount()) {
      issues.push({
        severity: 'warning',
        type: 'extra-parameters',
        isCondition,
        instructionType,
        eventPath: path,
        instructionIndex,
        expectedParametersCount: metadata.getParametersCount(),
        actualParametersCount: instruction.getParametersCount(),
      });
    }

    if (metadata.canHaveSubInstructions()) {
      validateInstructionsList({
        project,
        instructionsList: instruction.getSubInstructions(),
        isCondition,
        path,
        issues,
      });
    }
  });
};

const validateEventsList = ({
  project,
  eventsList,
  path,
  issues,
  allowJavaScriptEvents,
}: {|
  project: gdProject,
  eventsList: gdEventsList,
  path?: Array<number>,
  issues: Array<Object>,
  allowJavaScriptEvents?: boolean,
|}) => {
  const currentPath = path || [];
  mapFor(0, eventsList.getEventsCount(), eventIndex => {
    const eventPath = [...currentPath, eventIndex];
    const event = eventsList.getEventAt(eventIndex);
    const eventType = event.getType();

    if (!eventType) {
      issues.push({
        severity: 'error',
        type: 'missing-event-type',
        eventPath,
      });
      return;
    }

    if (
      eventType === 'BuiltinCommonInstructions::JsCode' &&
      !allowJavaScriptEvents
    ) {
      issues.push({
        severity: 'error',
        type: 'javascript-event-not-allowed',
        eventPath,
        eventType,
        suggestion:
          'Use standard GDevelop events, conditions, actions, expressions, behaviors, or extensions. Only pass allow_javascript_events: true when the user explicitly requested JavaScript.',
      });
    }

    if (eventType === 'BuiltinCommonInstructions::Standard') {
      const standardEvent = gd.asStandardEvent(event);
      validateInstructionsList({
        project,
        instructionsList: standardEvent.getConditions(),
        isCondition: true,
        path: eventPath,
        issues,
      });
      validateInstructionsList({
        project,
        instructionsList: standardEvent.getActions(),
        isCondition: false,
        path: eventPath,
        issues,
      });
    } else if (eventType === 'BuiltinCommonInstructions::While') {
      validateInstructionsList({
        project,
        instructionsList: gd.asWhileEvent(event).getWhileConditions(),
        isCondition: true,
        path: eventPath,
        issues,
      });
    }

    if (event.canHaveSubEvents()) {
      validateEventsList({
        project,
        eventsList: event.getSubEvents(),
        path: eventPath,
        issues,
        allowJavaScriptEvents,
      });
    }
  });
};

const withActionableSuggestion = (issue: Object): Object => {
  if (issue.suggestion) return issue;
  if (issue.type !== 'invalid-parameter' && issue.type !== 'missing-parameter') {
    return issue;
  }

  // Highest priority: the object parameter was flagged but the real cause is a
  // behavior parameter holding a behavior TYPE instead of a behavior NAME.
  if (
    typeof issue.relatedBehaviorParameterIndex === 'number' &&
    issue.relatedBehaviorParameterValue
  ) {
    return {
      ...issue,
      suggestion: `The object parameter (index ${issue.parameterIndex}) is reported invalid because behavior parameter at index ${issue.relatedBehaviorParameterIndex} contains "${issue.relatedBehaviorParameterValue}", which looks like a behavior TYPE. Behavior parameters take the behavior NAME on the object (e.g. "PlatformerObject"), not the type. Use inspect_object_properties to see the object's behavior names, or list_available_behaviors for the default name.`,
    };
  }

  const parameterType =
    typeof issue.parameterType === 'string' ? issue.parameterType : null;
  const shape = parameterType
    ? classifyParameterValueShape(parameterType)
    : null;
  const value =
    typeof issue.parameterValue === 'string' ? issue.parameterValue : '';
  const startsQuoted = value.trim().startsWith('"');

  // Type-aware suggestions: only recommend quoting for string-expression types,
  // and recommend a bare identifier/number for object/behavior/variable/number
  // types. This stops the old "wrap in quotes" misfire on object names, variable
  // names, and already-valid color literals.
  if (shape === 'quoted-string') {
    if (value.includes('\n') || value.includes('\\n')) {
      return {
        ...issue,
        suggestion: `Parameter ${issue.parameterIndex} is a string expression (${parameterType}) but contains a newline. Use a single-line expression such as "Game Over" + NewLine() + "Press Space".`,
      };
    }
    if (!startsQuoted && value) {
      return {
        ...issue,
        suggestion: `Parameter ${issue.parameterIndex} is a string expression (${parameterType}); wrap the literal in double quotes. Try ${JSON.stringify(
          value
        )}.`,
      };
    }
    return {
      ...issue,
      suggestion: `Parameter ${issue.parameterIndex} is a string expression (${parameterType}). ${describeParameterLiteralSyntax(
        parameterType
      )}.`,
    };
  }

  if (shape === 'number') {
    return {
      ...issue,
      suggestion: `Parameter ${issue.parameterIndex} is a number expression (${parameterType}); pass a bare number or numeric expression WITHOUT quotes, e.g. 100 or Variable(Score). Do not wrap it in quotes.`,
    };
  }

  if (shape === 'object') {
    return {
      ...issue,
      suggestion: `Parameter ${issue.parameterIndex} expects a bare object NAME (no quotes). Check the object exists in this scene or globally.`,
    };
  }

  if (shape === 'behavior') {
    return {
      ...issue,
      suggestion: `Parameter ${issue.parameterIndex} expects a behavior NAME (the instance name on the object, e.g. "PlatformerObject"), not the behavior type, and without quotes. Use inspect_object_properties to see the names.`,
    };
  }

  if (shape === 'variable') {
    return {
      ...issue,
      suggestion: `Parameter ${issue.parameterIndex} expects a bare variable reference (no quotes). Scene/global variables are referenced by name (e.g. Score); object variables as Object.VariableName.`,
    };
  }

  if (parameterType) {
    return {
      ...issue,
      suggestion: `Parameter ${issue.parameterIndex} (${parameterType}): ${describeParameterLiteralSyntax(
        parameterType
      )}.`,
    };
  }

  // Fallback when parameterType is unavailable: keep the legacy guidance but
  // hedge it so it does not assert that quoting is the fix.
  if (value && !startsQuoted) {
    return {
      ...issue,
      suggestion: `If this parameter expects a text/string expression, wrap the literal in quotes (e.g. ${JSON.stringify(
        value
      )}). If it expects an object/behavior/variable name or a number, leave it unquoted. Confirm with gdevelop_get_instruction_metadata.`,
    };
  }
  return {
    ...issue,
    suggestion:
      'Check the exact parameter type/order with gdevelop_get_instruction_metadata, then rewrite this parameter for that type.',
  };
};

const summarizeIssues = (issues: Array<Object>): Object => {
  const byType = {};
  const rootCausesByKey = {};

  issues.forEach(issue => {
    const type = issue.type || 'unknown';
    byType[type] = (byType[type] || 0) + 1;

    const key = [
      issue.type || '',
      issue.instructionType || '',
      typeof issue.parameterIndex === 'number' ? issue.parameterIndex : '',
      issue.parameterValue || '',
      issue.suggestion || '',
    ].join('|');
    if (!rootCausesByKey[key]) {
      rootCausesByKey[key] = {
        type,
        count: 0,
        instructionType: issue.instructionType,
        parameterIndex: issue.parameterIndex,
        parameterType: issue.parameterType,
        parameterValue: issue.parameterValue,
        resourceName: issue.resourceName,
        suggestion: issue.suggestion,
        firstEventPath: issue.eventPath,
      };
    }
    rootCausesByKey[key].count++;
  });

  return {
    totalIssues: issues.length,
    totalErrors: issues.filter(issue => issue.severity === 'error').length,
    byType,
    rootCauses: Object.keys(rootCausesByKey)
      .map(key => rootCausesByKey[key])
      .sort((left, right) => right.count - left.count),
  };
};

export const validateEventsJson = ({
  project,
  sceneName,
  eventsJson,
  allowJavaScriptEvents,
  summaryOnly,
  dedupeErrors,
}: {|
  project: gdProject,
  sceneName?: ?string,
  eventsJson?: ?string,
  allowJavaScriptEvents?: boolean,
  summaryOnly?: boolean,
  dedupeErrors?: boolean,
|}): Object => {
  if (!eventsJson) {
    return {
      valid: false,
      errors: ['Missing events_json.'],
    };
  }

  let parsedEvents;
  try {
    parsedEvents = JSON.parse(eventsJson);
  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON: ${error.message}`],
    };
  }

  if (!Array.isArray(parsedEvents)) {
    return {
      valid: false,
      errors: ['events_json must be a JSON array of serialized events.'],
    };
  }

  const eventsList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      eventsList,
      parsedEvents,
      'unserializeFrom',
      project
    );
    const issues: Array<Object> = [];
    validateEventsList({
      project,
      eventsList,
      issues,
      allowJavaScriptEvents,
    });
    const layout =
      sceneName && project.hasLayoutNamed(sceneName)
        ? project.getLayout(sceneName)
        : null;
    const parameterValidationIssues = scanEventsListForValidationErrors({
      project,
      eventsList,
      layout,
    }).map(error => ({
      severity: 'error',
      ...error,
    }));
    issues.push(...parameterValidationIssues);
    const issuesWithSuggestions = issues.map(withActionableSuggestion);
    const errors = issuesWithSuggestions.filter(
      issue => issue.severity === 'error'
    );

    const issueSummary = summarizeIssues(issuesWithSuggestions);

    // When dedupeErrors is set, return only the deduped rootCauses instead of one
    // entry per occurrence. The same 15 raw errors that boil down to 3 causes are
    // returned as 3 grouped entries (each with a count), drastically shrinking the
    // payload while keeping every distinct, actionable problem.
    const result = dedupeErrors
      ? {
          valid: errors.length === 0,
          eventsCount: eventsList.getEventsCount(),
          deduped: true,
          errors: issueSummary.rootCauses.filter(
            cause => cause.type !== 'extra-parameters'
          ),
          issueSummary,
        }
      : {
          valid: errors.length === 0,
          eventsCount: eventsList.getEventsCount(),
          errors,
          issues: issuesWithSuggestions,
          issueSummary,
        };
    if (summaryOnly) return result;

    return {
      ...result,
      eventsAsText: renderNonTranslatedEventsAsText({ eventsList }),
      normalizedEventsJson: serializeToJSON(eventsList),
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Could not unserialize events_json: ${error.message}`],
    };
  } finally {
    eventsList.delete();
  }
};

export const validateEventsJsonFile = ({
  project,
  sceneName,
  eventsJsonFile,
  allowJavaScriptEvents,
  summaryOnly,
  dedupeErrors,
}: {|
  project: gdProject,
  sceneName?: ?string,
  eventsJsonFile?: ?string,
  allowJavaScriptEvents?: boolean,
  summaryOnly?: boolean,
  dedupeErrors?: boolean,
|}): Object => {
  if (!eventsJsonFile) {
    return {
      valid: false,
      errors: ['Missing events_json_file.'],
    };
  }
  if (!fs) {
    return {
      valid: false,
      errors: ['Filesystem access is not available.'],
    };
  }
  const resolvedFile = resolveProjectRelativeFile(project, eventsJsonFile);
  if (!fs.existsSync(resolvedFile)) {
    return {
      valid: false,
      errors: [
        `Events JSON file not found: "${eventsJsonFile}"${
          resolvedFile !== eventsJsonFile
            ? ` (resolved to "${resolvedFile}")`
            : ''
        }.`,
      ],
    };
  }

  const eventsJson = fs.readFileSync(resolvedFile, 'utf8');
  const result = validateEventsJson({
    project,
    sceneName,
    eventsJson,
    allowJavaScriptEvents,
    summaryOnly,
    dedupeErrors,
  });

  return {
    ...result,
    eventsJsonFile,
  };
};
