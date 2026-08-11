// @flow
import {
  enumerateAllExpressions,
  enumerateAllExpressionsForExtension,
} from '../InstructionOrExpression/EnumerateExpressions';
import {
  enumerateAllInstructions,
  enumerateAllInstructionsForExtension,
} from '../InstructionOrExpression/EnumerateInstructions';
import {
  type EnumeratedExpressionMetadata,
  type EnumeratedInstructionMetadata,
} from '../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import {
  renderInstructionSentenceAsPlainText,
  renderNonTranslatedEventsAsText,
} from '../EventsSheet/EventsTree/TextRenderer';
import { serializeToJSON, unserializeFromJSObject } from '../Utils/Serializer';
import { mapFor } from '../Utils/MapFor';
import { scanEventsListForValidationErrors } from '../Utils/EventsValidationScanner';
import { keyNames, keyAliases } from '../Utils/KeyboardKeyNames';
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
// terms that actually appear in GDevelop instruction metadata (including
// compatibility fragments so searches can still find current replacements). When
// any alias key token is present in the query, its values are added to the set
// of acceptable match terms so a single query token can be satisfied by any of
// them. This fixes "play sound effect", "delete object", "change position",
// "scene variable", etc. returning nothing.
const SEARCH_ALIASES: { [string]: Array<string> } = {
  play: ['playsound', 'sound', 'play'],
  sound: ['playsound', 'sound', 'audio', 'music'],
  effect: ['sound', 'playsound'],
  music: ['playmusic', 'music', 'sound', 'bgm', 'soundonchannel'],
  bgm: ['playmusic', 'music', 'sound', 'bgm'],
  background: ['playmusic', 'music', 'bgm'],
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
  variable: [
    'var',
    'variable',
    'varscene',
    'varglobal',
    'modvarobjet',
    'varobjet',
    'setnumbervariable',
    'setstringvariable',
  ],
  scene: ['scene', 'layout'],
  restart: ['scene', 'restart', 'changescene', 'replacescene'],
  switch: ['scene', 'changescene', 'replacescene'],
  compare: ['compare', 'egal', 'comparison', 'condition'],
  comparison: ['compare', 'comparison', 'egal'],
  number: ['number', 'numbervariable', 'value', 'setnumbervariable'],
  boolean: ['boolean', 'booleanvariable', 'setbooleanvariable', 'yesorno'],
  true: ['true', 'booleanvariable', 'istrue'],
  opacity: [
    'opacity',
    'opacite',
    'setvalue',
    'opacitycapability',
    'transparency',
  ],
  transparency: ['opacity', 'opacite', 'transparency', 'setvalue'],
  looping: ['loop', 'looping', 'channel', 'playmusic', 'playsound'],
  loop: ['loop', 'looping', 'repeat'],
  channel: ['channel', 'playmusic', 'playsound', 'sound', 'music'],
  random: ['random', 'randominrange'],
  rotate: ['angle', 'rotate', 'mettreangle'],
  rotation: ['angle', 'rotate'],
  hide: ['cache', 'hide', 'visible', 'visibility', 'montre'],
  show: ['montre', 'show', 'visible', 'visibility', 'cache'],
  visible: ['visible', 'cache', 'montre', 'visibility'],
  timer: ['timer', 'time'],
  collision: ['collision', 'collisionnp', 'iscolliding'],
  animation: ['animation', 'anim'],
  health: ['variable', 'var'],
  score: ['variable', 'var'],
};

// Curated "common task → exact instruction" cheat-sheet. These are the actions
// that are notoriously hard to discover by search because they now live on
// hidden capability behaviors with non-obvious internal types and operator+value
// parameter shapes (e.g. setting a Text object's text is
// TextContainerCapability::TextContainerBehavior::SetValue, which no search term
// obviously yields). When a query overlaps a hint's keywords, we surface the
// exact type + a ready parameter template so the caller never has to guess.
const COMMON_TASK_HINTS: Array<{|
  keywords: Array<string>,
  kind: 'action' | 'condition',
  type: string,
  title: string,
  parametersTemplate: Array<string>,
  note: string,
|}> = [
  {
    keywords: ['text', 'string', 'settext', 'setvalue', 'label', 'caption'],
    kind: 'action',
    type: 'TextContainerCapability::TextContainerBehavior::SetValue',
    title: 'Set the text/string shown by a Text object',
    parametersTemplate: ['MyTextObject', 'Text', '=', '"Hello world"'],
    note:
      'Capability-behavior action. Params: [objectName, behaviorName="Text", operator="=", quotedString]. The behavior NAME is "Text". Use "=" to replace; the value is a quoted string expression.',
  },
  {
    keywords: ['opacity', 'transparency', 'alpha', 'fade'],
    kind: 'action',
    type: 'OpacityCapability::OpacityBehavior::SetValue',
    title: 'Set an object opacity (0-255)',
    parametersTemplate: ['MyObject', 'Opacity', '=', '128'],
    note:
      'Capability-behavior action. Params: [objectName, behaviorName="Opacity", operator, numberExpression 0-255].',
  },
  {
    keywords: ['animation', 'anim', 'setanimation', 'changeanimation'],
    kind: 'action',
    type: 'AnimatableCapability::AnimatableBehavior::SetAnimationName',
    title: 'Set a Sprite animation by name',
    parametersTemplate: ['MySprite', 'Animation', '=', '"Walk"'],
    note:
      'Capability-behavior action. Params: [objectName, behaviorName="Animation", operator="=", quotedAnimationName]. There is also SetIndex for setting by number.',
  },
  {
    keywords: ['music', 'bgm', 'background', 'loop', 'looping'],
    kind: 'action',
    type: 'PlayMusicOnChannel',
    title: 'Play looping background music on a channel',
    parametersTemplate: ['', 'bgm', '0', 'yes', '100', '1'],
    note:
      'Params: [hidden, musicResourceName (BARE, no quotes), channelNumber, repeat ("yes"/"no"), volume 0-100, pitch]. Use a CHANNEL-based music action (not PlaySound) for BGM so it is tracked as music and can be stopped/looped per channel.',
  },
  {
    keywords: ['sound', 'sfx', 'playsound', 'effect', 'shoot', 'explosion'],
    kind: 'action',
    type: 'PlaySound',
    title: 'Play a one-shot sound effect',
    parametersTemplate: ['', 'shoot', '', '100', '1'],
    note:
      'Params: [hidden, soundResourceName (BARE, no quotes — e.g. shoot, NOT "shoot"), loop, volume 0-100, pitch].',
  },
  {
    keywords: ['hide', 'invisible', 'visible', 'visibility'],
    kind: 'action',
    type: 'Hide',
    title: 'Hide an object',
    parametersTemplate: ['MyObject'],
    note:
      'Hide takes just [objectName]. The twin action Show has an extra hidden code-only 2nd parameter — pass "" for it.',
  },
  {
    keywords: [
      'boolean',
      'bool',
      'flag',
      'true',
      'false',
      'toggle',
      'gameover',
    ],
    kind: 'action',
    type: 'SetBooleanVariable',
    title: 'Set a scene/global BOOLEAN variable (true/false/toggle)',
    parametersTemplate: ['GameOver', 'True', ''],
    note:
      'Params: [variableName, operator, ""(code-only)]. The operator is one of "True" / "False" / "Toggle" (capitalized!) — NOT yes/no, NOT 1/0, NOT "set". The 3rd param is a hidden code-only slot, pass "". The matching condition is BooleanVariable.',
  },
];

// Find common-task hints whose keywords overlap the query tokens.
const findCommonTaskHints = (query: string): Array<Object> => {
  const tokens = new Set(tokenizeQuery(query));
  if (!tokens.size) return [];
  const matches = [];
  for (const hint of COMMON_TASK_HINTS) {
    const overlap = hint.keywords.filter(keyword => tokens.has(keyword)).length;
    if (overlap > 0) {
      matches.push({
        overlap,
        hint: {
          type: hint.type,
          kind: hint.kind,
          title: hint.title,
          parametersTemplate: hint.parametersTemplate,
          note: hint.note,
        },
      });
    }
  }
  matches.sort((a, b) => b.overlap - a.overlap);
  return matches.slice(0, 4).map(m => m.hint);
};

// Tokenize a search string into lowercase word tokens.
const tokenizeQuery = (query: string): Array<string> =>
  normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// Filler/stopword tokens that should not, by themselves, decide a match. They
// appear in natural phrasings ("change the text of an object") but carry no
// discriminating signal, so requiring them to match would drop good results.
const SEARCH_STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'of',
  'to',
  'in',
  'on',
  'for',
  'with',
  'and',
  'or',
  'is',
  'be',
  'this',
  'that',
  'object',
  'objects',
  'value',
  'content',
  'contents',
  'gdevelop',
  'game',
  'how',
  'do',
  'i',
  'my',
  'its',
  'it',
]);

// Score how well candidate field values match the query. Returns 0 for no match.
// Higher is better. Instead of strict AND-over-all-tokens (which dropped good
// results when a natural-language query contained filler like "content"/"of"),
// this drops stopwords, then ranks by the FRACTION of meaningful tokens matched.
// A result must match at least one meaningful token (and, for multi-token
// queries, a majority) — so "modify text string content" still finds the text
// setter even though "modify"/"content" do not appear in the metadata. A bonus
// is added for exact/prefix matches and for hits in the most identifying fields.
const scoreMatch = (values: Array<?string>, query: string): number => {
  const allTokens = tokenizeQuery(query);
  if (!allTokens.length) return 0;
  // Prefer meaningful tokens; fall back to all tokens if the query was all
  // stopwords (so a query like "show" still works).
  const meaningfulTokens = allTokens.filter(t => !SEARCH_STOPWORDS.has(t));
  const tokens = meaningfulTokens.length ? meaningfulTokens : allTokens;

  const normalizedValues = values
    .filter(Boolean)
    .map(value => normalizeText((value: any)));
  if (!normalizedValues.length) return 0;
  const haystack = normalizedValues.join(' ');
  // Compact haystack with separators removed, so a token like "playsound"
  // matches the type "PlaySound" and "setnumbervariable" matches the type even
  // though fields contain spaces or camelCase.
  const compactHaystack = haystack.replace(/[^a-z0-9]+/g, '');

  let matchedTokens = 0;
  let score = 0;
  for (const token of tokens) {
    const aliasTerms = SEARCH_ALIASES[token] || [];
    const candidates = [token, ...aliasTerms];
    const directHit =
      haystack.includes(token) || compactHaystack.includes(token);
    const aliasHit =
      !directHit &&
      candidates.some(
        term => haystack.includes(term) || compactHaystack.includes(term)
      );
    if (directHit || aliasHit) {
      matchedTokens++;
      // Direct (non-alias) token hits are worth more than alias-only hits.
      score += directHit ? 2 : 1;
    }
  }

  if (matchedTokens === 0) return 0;
  // For multi-token queries, require a majority of meaningful tokens to match,
  // so unrelated single-word coincidences don't flood the results. Single-token
  // queries pass on any hit.
  if (tokens.length > 1 && matchedTokens / tokens.length < 0.5) return 0;

  // Reward higher coverage so the most complete matches rank first.
  score += matchedTokens;

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
  'signalName',
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

// Resource parameter types. Their VALUE is a BARE resource name with NO quotes
// (a resource picker, not a string expression) — the code generator adds the
// quotes. This is the opposite of string parameters and a common mistake: e.g.
// a soundfile/musicfile parameter takes Shoot (no quotes), not "Shoot".
// Mirrors gd::ValueTypeMetadata::IsTypeExpression("resource", ...).
const RESOURCE_PARAMETER_TYPES = new Set([
  'fontResource',
  'audioResource',
  'videoResource',
  'bitmapFontResource',
  'imageResource',
  'jsonResource',
  'tilemapResource',
  'tilesetResource',
  'model3DResource',
  'atlasResource',
  'spineResource',
  // Deprecated/legacy but still widely used:
  'soundfile',
  'musicfile',
]);

// Default behavior NAMES for built-in capability behaviors, so a `behavior`
// parameter whose extraInfo names one of these types can hint what to fill.
const CAPABILITY_BEHAVIOR_DEFAULT_NAMES = {
  'TextContainerCapability::TextContainerBehavior': 'Text',
  'AnimatableCapability::AnimatableBehavior': 'Animation',
  'EffectCapability::EffectBehavior': 'Effect',
  'OpacityCapability::OpacityBehavior': 'Opacity',
  'ResizableCapability::ResizableBehavior': 'Resizable',
  'ScalableCapability::ScalableBehavior': 'Scale',
  'FlippableCapability::FlippableBehavior': 'Flippable',
};

// For a `behavior` parameter, build a hint about which behavior NAME to fill.
// `extraInfo` on a behavior parameter is the required behavior TYPE.
const describeBehaviorParameterHint = (behaviorType: ?string): string => {
  if (behaviorType && CAPABILITY_BEHAVIOR_DEFAULT_NAMES[behaviorType]) {
    return `behavior NAME on the object — for the required type "${behaviorType}" the default name is "${
      CAPABILITY_BEHAVIOR_DEFAULT_NAMES[behaviorType]
    }". Fill the behavior NAME (not the type), no quotes.`;
  }
  if (behaviorType) {
    return `behavior NAME on the object for type "${behaviorType}" (not the type itself), no quotes. Read the object's project source and the generated settings catalog to find its behavior names.`;
  }
  return `behavior NAME on the object (not the behavior type), no quotes. Read the object's project source and the generated settings catalog to find the names.`;
};

// Enumerated parameter types whose legal literal values are a FIXED small set
// not exposed by gd metadata (the editor hardcodes them per field). Return the
// accepted values so callers don't guess. For operator/relationalOperator the
// set depends on the instruction's manipulated type, carried in the parameter's
// extraInfo ("number"/"string"/"boolean"/"color"/"time"). Mirrors the editor's
// OperatorField / RelationalOperatorField / YesNoField / TrueFalseField.
const OPERATOR_VALUES_BY_TYPE = {
  number: ['=', '+', '-', '*', '/'],
  string: ['=', '+'],
  color: ['=', '+'],
  boolean: ['True', 'False', 'Toggle'],
};
const RELATIONAL_OPERATOR_VALUES_BY_TYPE = {
  number: ['=', '<', '>', '<=', '>=', '!='],
  time: ['<', '>', '<=', '>='],
  string: ['=', '!=', 'startsWith', 'endsWith', 'contains'],
  color: ['=', '!='],
};
const acceptedValuesForParameter = (
  parameterType: string,
  extraInfo: ?string
): ?Array<string> => {
  const manipulated = extraInfo || 'number';
  if (parameterType === 'operator') {
    return (
      OPERATOR_VALUES_BY_TYPE[manipulated] || OPERATOR_VALUES_BY_TYPE.number
    );
  }
  if (parameterType === 'relationalOperator') {
    return (
      RELATIONAL_OPERATOR_VALUES_BY_TYPE[manipulated] ||
      RELATIONAL_OPERATOR_VALUES_BY_TYPE.number
    );
  }
  if (parameterType === 'yesorno') return ['yes', 'no'];
  if (parameterType === 'trueorfalse') return ['True', 'False'];
  if (parameterType === 'keyboardKey') {
    return [...keyNames, ...keyAliases];
  }
  return null;
};

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
    return `variable reference — bare variable name, no quotes (type "${parameterType}"). In string/number EXPRESSIONS, reference an object variable with the canonical Object.Variable(Name) form (unambiguous); the legacy Object.Name shorthand is tolerated but discouraged.`;
  }
  if (RESOURCE_PARAMETER_TYPES.has(parameterType)) {
    return `resource name — BARE resource name, NO quotes (e.g. Shoot, not "Shoot"); the resource must already exist in the project (type "${parameterType}")`;
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
  if (RESOURCE_PARAMETER_TYPES.has(parameterType)) return 'resource';
  if (parameterType === 'yesorno' || parameterType === 'trueorfalse')
    return 'boolean';
  return 'other';
};

const summarizeParameter = (
  parameterMetadata: gdParameterMetadata,
  index: number,
  options?: {| compact?: boolean, parameterName?: string |}
): Object => {
  const valueTypeMetadata = parameterMetadata.getValueTypeMetadata();
  const type = parameterMetadata.getType();
  const extraInfo = parameterMetadata.getExtraInfo() || undefined;
  // For behavior parameters, hint the behavior NAME to fill (extraInfo is the
  // required behavior TYPE). For object variables, clarify that when the object
  // is a separate parameter the value is the bare variable name.
  const behaviorNameHint =
    type === 'behavior' ? describeBehaviorParameterHint(extraInfo) : undefined;
  const objectVarHint =
    type === 'objectvar'
      ? 'object variable — bare variable name (e.g. HP). The object is a separate parameter on this instruction, so do NOT write Object.HP here, just HP.'
      : undefined;
  // Legal literal values for enumerated parameter types (operator,
  // relationalOperator, yesorno, trueorfalse). E.g. a boolean SetBooleanVariable
  // operator accepts ["True","False","Toggle"] — not yes/no/true/1.
  const acceptedValues = acceptedValuesForParameter(type, extraInfo);
  const parameterName =
    (options && options.parameterName) ||
    getInstructionParameterBaseName(parameterMetadata, index);
  if (options && options.compact) {
    // Compact form drops the verbose valueType discriminator object and keeps
    // only what a caller needs to fill the parameter correctly.
    return {
      index,
      type,
      name: parameterMetadata.getName() || undefined,
      parameterName,
      description: parameterMetadata.getDescription() || undefined,
      isOptional: parameterMetadata.isOptional(),
      defaultValue: parameterMetadata.getDefaultValue() || undefined,
      // How to write a literal value for this parameter in event JSON.
      literalSyntax: objectVarHint || describeParameterLiteralSyntax(type),
      behaviorNameHint,
      acceptedValues: acceptedValues || undefined,
    };
  }
  const parameter = {
    index,
    type,
    name: parameterMetadata.getName() || undefined,
    parameterName,
    description: parameterMetadata.getDescription() || undefined,
    longDescription: parameterMetadata.getLongDescription() || undefined,
    hint: parameterMetadata.getHint() || undefined,
    extraInfo,
    defaultValue: parameterMetadata.getDefaultValue() || undefined,
    isOptional: parameterMetadata.isOptional(),
    isCodeOnly: parameterMetadata.isCodeOnly(),
    literalSyntax: objectVarHint || describeParameterLiteralSyntax(type),
    behaviorNameHint,
    // Legal literal values for enumerated parameter types.
    acceptedValues: acceptedValues || undefined,
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

const isDeprecatedOrHiddenInstructionMetadata = (
  metadata: gdInstructionMetadata
): boolean => metadata.isHidden() || !!metadata.getDeprecationMessage();

const isDeprecatedExpressionMetadata = (
  metadata: gdExpressionMetadata
): boolean =>
  !metadata.isShown() ||
  metadata.isDeprecated() ||
  !!metadata.getDeprecationMessage();

const getRawInstructionMetadata = (
  project: gdProject,
  type: string,
  kind: 'action' | 'condition'
): ?gdInstructionMetadata => {
  const metadata =
    kind === 'condition'
      ? gd.MetadataProvider.getConditionMetadata(
          project.getCurrentPlatform(),
          type
        )
      : gd.MetadataProvider.getActionMetadata(
          project.getCurrentPlatform(),
          type
        );
  return gd.MetadataProvider.isBadInstructionMetadata(metadata)
    ? null
    : metadata;
};

const findReplacementInstructionTypes = ({
  project,
  i18n,
  type,
  kind,
  metadata,
}: {|
  project: gdProject,
  i18n?: any,
  type: string,
  kind: 'action' | 'condition',
  metadata: gdInstructionMetadata,
|}): Array<string> => {
  let visibleInstructions = [];
  try {
    visibleInstructions = enumerateAllInstructions(
      kind === 'condition',
      project,
      i18n
    );
  } catch (error) {
    return [];
  }

  const fullName = metadata.getFullName();
  const description = metadata.getDescription();
  const sentence = metadata.getSentence();
  const scored = [];
  visibleInstructions.forEach(instruction => {
    if (instruction.type === type) return;
    if (isDeprecatedOrHiddenInstructionMetadata(instruction.metadata)) return;

    let score = 0;
    if (instruction.metadata.getFullName() === fullName) score += 4;
    if (instruction.metadata.getSentence() === sentence) score += 3;
    if (instruction.metadata.getDescription() === description) score += 2;
    if (score > 0) {
      scored.push({ type: instruction.type, score });
    }
  });

  scored.sort((left, right) =>
    right.score !== left.score
      ? right.score - left.score
      : left.type.localeCompare(right.type)
  );

  const replacementTypes = [];
  scored.forEach(entry => {
    if (replacementTypes.indexOf(entry.type) === -1) {
      replacementTypes.push(entry.type);
    }
  });
  return replacementTypes.slice(0, 3);
};

const getDeprecatedInstructionDiagnostic = ({
  project,
  i18n,
  type,
  kind,
  metadata,
}: {|
  project: gdProject,
  i18n?: any,
  type: string,
  kind: 'action' | 'condition',
  metadata: gdInstructionMetadata,
|}): Object => {
  const deprecationMessage = metadata.getDeprecationMessage() || undefined;
  const replacementTypes = findReplacementInstructionTypes({
    project,
    i18n,
    type,
    kind,
    metadata,
  });
  const replacementSuggestion = replacementTypes.length
    ? replacementTypes.length === 1
      ? `Use ${kind} type "${replacementTypes[0]}" instead.`
      : `Use one of these ${kind} types instead: ${replacementTypes
          .map(replacementType => `"${replacementType}"`)
          .join(', ')}.`
    : null;
  const suggestion =
    [deprecationMessage, replacementSuggestion].filter(Boolean).join(' ') ||
    `Search .gdevelop/instructions-catalog.json for kind "${kind}" and "${metadata.getFullName() ||
      type}" to find a current replacement.`;

  return {
    deprecated: true,
    error: `The ${kind} type "${type}" is deprecated or hidden and cannot be used by MCP.`,
    suggestion,
    replacementTypes: replacementTypes.length ? replacementTypes : undefined,
    deprecationMessage,
  };
};

const formatDeprecatedInstructionDiagnostic = (diagnostic: Object): string =>
  `${diagnostic.error} Suggestion: ${diagnostic.suggestion}`;

const normalizeTargetScope = (targetScope?: ?string): ?string => {
  if (!targetScope) return null;
  const normalized = String(targetScope)
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_');
  if (normalized === 'scene' || normalized === 'layout') return 'scene';
  if (
    normalized === 'function' ||
    normalized === 'extension_function' ||
    normalized === 'free_function'
  ) {
    return 'extension_function';
  }
  if (normalized === 'behavior' || normalized === 'behavior_function') {
    return 'behavior_function';
  }
  if (
    normalized === 'object' ||
    normalized === 'custom_object' ||
    normalized === 'object_function'
  ) {
    return 'object_function';
  }
  if (normalized === 'async' || normalized === 'async_function') {
    return 'async_function';
  }
  return null;
};

const buildEventScopeCompatibility = (metadata: any): Object => {
  const scene = metadata.isRelevantForLayoutEvents();
  const functionEvents = metadata.isRelevantForFunctionEvents();
  const asyncFunctionEvents = metadata.isRelevantForAsynchronousFunctionEvents();
  const customObjectEvents = metadata.isRelevantForCustomObjectEvents();
  return {
    scene: {
      valid: scene,
      label: 'Scene/external events',
    },
    extensionFunction: {
      valid: functionEvents,
      label: 'Free extension function events',
    },
    behaviorFunction: {
      valid: functionEvents,
      label: 'Events-based behavior function events',
    },
    objectFunction: {
      valid: functionEvents || customObjectEvents,
      label: 'Events-based object function events',
    },
    asyncFunction: {
      valid: functionEvents || asyncFunctionEvents,
      label: 'Asynchronous function events',
    },
    customObjectInternal: {
      valid: customObjectEvents,
      label: 'Custom object internal events',
    },
    note:
      'Use the valid flags for the event sheet you are editing. A type can be valid in scene events but rejected in behavior/object/free extension function events.',
  };
};

const getTargetScopeCompatibility = (
  eventScopes: Object,
  targetScope?: ?string
): ?Object => {
  const normalizedTargetScope = normalizeTargetScope(targetScope);
  if (!normalizedTargetScope) return null;
  const keyByScope: { [string]: string } = {
    scene: 'scene',
    extension_function: 'extensionFunction',
    behavior_function: 'behaviorFunction',
    object_function: 'objectFunction',
    async_function: 'asyncFunction',
  };
  const key = keyByScope[normalizedTargetScope];
  if (!key || !eventScopes[key]) return null;
  return {
    targetScope: normalizedTargetScope,
    valid: !!eventScopes[key].valid,
    label: eventScopes[key].label,
  };
};

export const summarizeInstructionMetadata = ({
  type,
  kind,
  metadata,
  fullGroupName,
  compact,
  targetScope,
}: {|
  type: string,
  kind: 'action' | 'condition',
  metadata: gdInstructionMetadata,
  fullGroupName?: ?string,
  compact?: boolean,
  targetScope?: ?string,
|}): Object => {
  // Parameter-shape summary: GDevelop instructions mix user-fillable parameters
  // with hidden "code-only" ones (e.g. an inlineCode slot) that must still get a
  // placeholder ("") in the serialized parameters array. Twin actions can even
  // differ (Show has a hidden 2nd param, Hide does not), which makes the count
  // impossible to guess. Expose it explicitly so callers stop trial-and-erroring.
  const totalParameterCount = metadata.getParametersCount();
  const codeOnlyParameterIndexes = [];
  // A ready-to-edit parameters array: code-only slots pre-filled with "" so the
  // caller only replaces the <user:...> placeholders and keeps the array length
  // correct without manually aligning indexes.
  const parameterTemplate = [];
  for (let index = 0; index < totalParameterCount; index++) {
    const param = metadata.getParameter(index);
    if (param.isCodeOnly()) {
      codeOnlyParameterIndexes.push(index);
      parameterTemplate.push('');
    } else {
      parameterTemplate.push(`<${param.getType()}>`);
    }
  }
  const parameterShape = {
    totalParameterCount,
    userParameterCount: totalParameterCount - codeOnlyParameterIndexes.length,
    codeOnlyParameterIndexes,
    // Code-only slots already filled with ""; replace each <type> placeholder.
    parameterTemplate,
    note: codeOnlyParameterIndexes.length
      ? `This instruction has ${
          codeOnlyParameterIndexes.length
        } hidden code-only parameter(s) at index ${codeOnlyParameterIndexes.join(
          ', '
        )} — pass "" (empty string) for each in the serialized parameters array. The serialized array length must equal totalParameterCount (${totalParameterCount}). Use parameterTemplate as a starting point: code-only slots are already "", replace the <type> placeholders.`
      : undefined,
  };
  const eventScopes = buildEventScopeCompatibility(metadata);
  const targetScopeCompatibility = getTargetScopeCompatibility(
    eventScopes,
    targetScope
  );
  const parameterNames = getUniqueInstructionParameterNames(metadata);
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
      eventScopes,
      targetScopeCompatibility: targetScopeCompatibility || undefined,
      parameterShape,
      parameters: mapFor(0, metadata.getParametersCount(), index =>
        summarizeParameter(metadata.getParameter(index), index, {
          compact: true,
          parameterName: parameterNames[index],
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
    eventScopes,
    targetScopeCompatibility: targetScopeCompatibility || undefined,
    usageComplexity: metadata.getUsageComplexity(),
    deprecationMessage: metadata.getDeprecationMessage() || undefined,
    parameterShape,
    parameters: mapFor(0, metadata.getParametersCount(), index =>
      summarizeParameter(metadata.getParameter(index), index, {
        parameterName: parameterNames[index],
      })
    ),
  };
};

export const summarizeExpressionMetadata = ({
  type,
  metadata,
  fullGroupName,
  compact,
  targetScope,
}: {|
  type: string,
  metadata: gdExpressionMetadata,
  fullGroupName?: ?string,
  compact?: boolean,
  targetScope?: ?string,
|}): Object => {
  const eventScopes = buildEventScopeCompatibility(metadata);
  const targetScopeCompatibility = getTargetScopeCompatibility(
    eventScopes,
    targetScope
  );
  const parameterNames = getUniqueInstructionParameterNames(metadata);
  if (compact) {
    return {
      kind: 'expression',
      type,
      fullName: metadata.getFullName(),
      description: metadata.getDescription(),
      group: fullGroupName || metadata.getGroup(),
      returnType: metadata.getReturnType(),
      eventScopes,
      targetScopeCompatibility: targetScopeCompatibility || undefined,
      parameters: mapFor(0, metadata.getParametersCount(), index =>
        summarizeParameter(metadata.getParameter(index), index, {
          compact: true,
          parameterName: parameterNames[index],
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
    eventScopes,
    targetScopeCompatibility: targetScopeCompatibility || undefined,
    deprecationMessage: metadata.getDeprecationMessage() || undefined,
    parameters: mapFor(0, metadata.getParametersCount(), index =>
      summarizeParameter(metadata.getParameter(index), index, {
        parameterName: parameterNames[index],
      })
    ),
  };
};

export const getEventOperationReference = (): Object => ({
  targetPathFormat:
    'Use event-0 for the first root event, event-0.1 for the second sub-event of the first root event, or an aiGeneratedEventId previously assigned by GDevelop.',
  generatedEventsFormat:
    'generated_events can be a JSON string, a serialized events array, a single serialized event object, or { events: [...] }. A Group event object with type and events is treated as one event; { events: [...] } is only a wrapper when there is no type.',
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

const localVariableEventExample = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    variables: [
      {
        name: 'DamageThisTick',
        type: 'number',
        value: 0,
      },
    ],
    conditions: [
      {
        type: { value: 'SceneJustBegins' },
        parameters: [''],
      },
    ],
    actions: [
      {
        type: { value: 'SetNumberVariable' },
        parameters: ['DamageThisTick', '=', '25'],
      },
      {
        type: { value: 'SetNumberVariable' },
        parameters: ['Score', '+', 'Variable(DamageThisTick)'],
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

// Capability-behavior actions are the most error-prone to author by hand: the
// internal types are non-obvious and the parameters use a [object, behaviorName,
// operator, value] shape (operator + value, even for strings). This worked
// example shows setting a Text object's text, an opacity, and a Sprite animation.
const capabilityActionsEventExample = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [{ type: { value: 'SceneJustBegins' }, parameters: [''] }],
    actions: [
      {
        // Set the displayed text of a Text object. behaviorName is "Text".
        type: {
          value: 'TextContainerCapability::TextContainerBehavior::SetValue',
        },
        parameters: ['Title', 'Text', '=', '"Game Over"'],
      },
      {
        // Set opacity (0-255). behaviorName is "Opacity".
        type: { value: 'OpacityCapability::OpacityBehavior::SetValue' },
        parameters: ['Title', 'Opacity', '=', '180'],
      },
      {
        // Set a Sprite animation by name. behaviorName is "Animation".
        type: {
          value: 'AnimatableCapability::AnimatableBehavior::SetAnimationName',
        },
        parameters: ['Player', 'Animation', '=', '"Idle"'],
      },
    ],
  },
];

const groupEventExample = [
  {
    type: 'BuiltinCommonInstructions::Group',
    name: 'Initialization',
    folded: true,
    // Use an explicit, NON-default color. The default GDevelop group blue is
    // (74,176,228); the lint rule treats it as "unset", so examples deliberately
    // pick a distinct color (here a green). Give each group its OWN distinct
    // color for readability.
    colorR: 90,
    colorG: 160,
    colorB: 110,
    events: standardEventWithInstructionExample,
  },
];

// Create-with-initial-values pattern (#11): GDevelop's Create action only takes
// object + x/y/layer — it cannot set variables/animation. To create an object
// AND initialize it, Create it first, then act on it IN THE SAME event (the
// just-created instance is the picked one). Here: spawn an Enemy, give it a
// random speed variable, and set its animation.
const createWithInitEventExample = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [],
    actions: [
      {
        type: { value: 'Create' },
        parameters: ['', 'Enemy', '320', '0', ''],
      },
      {
        type: { value: 'SetNumberObjectVariable' },
        parameters: ['Enemy', 'speed', '=', 'RandomInRange(80, 160)'],
      },
      {
        type: {
          value: 'AnimatableCapability::AnimatableBehavior::SetAnimationName',
        },
        parameters: ['Enemy', 'Animation', '=', '"fly"'],
      },
    ],
  },
];

// For-each-object event: gives each instance an isolated picking context.
// Normal object actions in a Standard event already affect all picked objects,
// but standalone actions like Create/PlaySound run once per event and scalar
// object expressions use one instance. Use ForEach when those operations must
// run separately for every picked object.
const forEachEventExample = [
  {
    type: 'BuiltinCommonInstructions::ForEach',
    object: 'Enemy',
    conditions: [],
    actions: [
      {
        type: { value: 'Create' },
        // currentScene, objectToCreate, x, y, layer (note the trailing
        // code-only/layer params kept as "").
        parameters: ['', 'Bullet', 'Enemy.X()', 'Enemy.Y()', ''],
      },
    ],
    events: [],
  },
];

// Repeat N times.
const repeatEventExample = [
  {
    type: 'BuiltinCommonInstructions::Repeat',
    repeatExpression: '5',
    conditions: [],
    actions: [],
    events: [],
  },
];

// While loop: runs while whileConditions hold.
const whileEventExample = [
  {
    type: 'BuiltinCommonInstructions::While',
    whileConditions: [
      {
        type: { value: 'VarScene' },
        parameters: ['Lives', '>', '0'],
      },
    ],
    conditions: [],
    actions: [],
    events: [],
  },
];

// OR sub-conditions: the parent condition is true if ANY child is true. Child
// conditions go inside the OR condition's "subInstructions" array (NOT a
// "conditions" key — that is dropped). Use this instead of duplicating an event
// for each alternative input.
const orConditionEventExample = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [
      {
        type: { value: 'BuiltinCommonInstructions::Or' },
        parameters: [],
        // IMPORTANT: child conditions of Or/And/Not go in "subInstructions",
        // NOT "conditions". A "conditions" key here is silently dropped by the
        // GDevelop serializer, leaving the Or empty (matches nothing).
        subInstructions: [
          {
            type: { value: 'KeyPressed' },
            parameters: ['', 'Left'],
          },
          {
            type: { value: 'KeyPressed' },
            parameters: ['', 'q'],
          },
        ],
      },
    ],
    actions: [
      {
        type: { value: 'SetX' },
        parameters: ['Player', '-', '5'],
      },
    ],
  },
];

// AND / NOT follow the same nested shape as Or, with children in
// "subInstructions":
//   AND → type "BuiltinCommonInstructions::And" (true when ALL children true).
//   NOT → type "BuiltinCommonInstructions::Not" (true when ALL children false).
const andConditionEventExample = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [
      {
        type: { value: 'BuiltinCommonInstructions::And' },
        parameters: [],
        subInstructions: [
          { type: { value: 'KeyPressed' }, parameters: ['', 'Space'] },
          { type: { value: 'VarScene' }, parameters: ['CanFire', '=', '1'] },
        ],
      },
    ],
    actions: [],
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
      name: 'Standard event with a local variable',
      purpose:
        'Declare variables on the event itself with a variables array. They are local to that event and its sub-events; reference them by bare name in variable parameters and with Variable(Name) in expressions. Do not add them as scene variables.',
      events_json: JSON.stringify(localVariableEventExample, null, 2),
      event_changes: [
        {
          operation_name: 'insert_at_end',
          generated_events: JSON.stringify(localVariableEventExample, null, 2),
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
    {
      name: 'For-each-object event',
      purpose:
        'Give every picked instance its own event context. Normal object actions already affect all picked instances; use ForEach when standalone actions or scalar object expressions must run separately per instance (for example, each enemy fires its own bullet).',
      events_json: JSON.stringify(forEachEventExample, null, 2),
    },
    {
      name: 'Capability-behavior actions (set text / opacity / animation)',
      purpose:
        'How to write the hidden capability-behavior actions that are hard to discover by search. Parameters are [objectName, behaviorName, operator, value]: the behaviorName is "Text"/"Opacity"/"Animation", the operator is usually "=", and string values are quoted (e.g. "Game Over"), numbers are bare (e.g. 180). See the generated instructions catalog for current parameter metadata.',
      events_json: JSON.stringify(capabilityActionsEventExample, null, 2),
    },
    {
      name: 'Create an object WITH initial values',
      purpose:
        "GDevelop's Create action cannot set variables/animation. To create AND initialize, Create the object, then act on it in the SAME event (the just-created instance is the picked one): set object variables (SetNumberObjectVariable/SetStringObjectVariable) and animation. This is the standard 2-step — there is no single create-with-values action.",
      events_json: JSON.stringify(createWithInitEventExample, null, 2),
    },
    {
      name: 'Repeat N times',
      purpose: 'Loop a fixed number of times via repeatExpression.',
      events_json: JSON.stringify(repeatEventExample, null, 2),
    },
    {
      name: 'While loop',
      purpose:
        'Loop while whileConditions hold. Conditions go in the whileConditions array.',
      events_json: JSON.stringify(whileEventExample, null, 2),
    },
    {
      name: 'OR sub-conditions',
      purpose:
        'Match if ANY child condition is true (e.g. Left arrow OR Q). Child conditions go in the OR condition\'s "subInstructions" array — NOT a "conditions" key, which the serializer silently drops. Use instead of duplicating the event per input. AND/NOT use the same nested shape (BuiltinCommonInstructions::And / ::Not).',
      events_json: JSON.stringify(orConditionEventExample, null, 2),
    },
    {
      name: 'AND sub-conditions',
      purpose:
        'Match only if ALL child conditions are true. Child conditions go in the "subInstructions" array (not "conditions").',
      events_json: JSON.stringify(andConditionEventExample, null, 2),
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
    projectFileEventsShape:
      'Author scene events in the canonical project .events source files, following the generated instructions catalog and existing event serialization shape.',
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
      localVariable:
        'Declare event-local variables in the event variables array. Reference a local variable by bare name in variable parameters, or Variable(Name) inside number/string expressions. Local variables shadow scene/global variables with the same name and are only available in that event and its sub-events.',
      objectVariable:
        'Reference an object variable as Object.VariableName, e.g. Player.Life or Enemy.Health (in expressions). For a variable PARAMETER, the object variable instructions take the object name and a bare variable name. Do NOT write VarObjet(Player, Life).',
      childVariable:
        'Access a structure child with Variable(Inventory.gold) or Object.Stats.level.',
    },
    commonInstructionTypes: {
      summary:
        'Common current GDevelop internal instruction types (verify parameter order with .gdevelop/instructions-catalog.json):',
      setObjectPositionX: 'SetX (action)',
      setObjectPositionY: 'SetY (action)',
      setObjectPosition: 'SetXY (action)',
      objectPositionXCondition: 'PosX (condition)',
      objectPositionYCondition: 'PosY (condition)',
      setObjectAngle: 'SetAngle (action)',
      setObjectVariable:
        'SetNumberObjectVariable/SetStringObjectVariable/SetBooleanObjectVariable (actions), NumberObjectVariable/StringObjectVariable/BooleanObjectVariable (conditions)',
      setSceneVariableNumber: 'SetNumberVariable (action)',
      setSceneVariableString: 'SetStringVariable (action)',
      setSceneVariableBoolean:
        'SetBooleanVariable (action), BooleanVariable (condition) — use these for scene/global boolean flags; the value is yes/no (not a quoted string and not 0/1). These are the unified-variable instructions, NOT the object/dialogue same-named ones.',
      compareSceneVariableNumber: 'NumberVariable (condition)',
      compareSceneVariableString: 'StringVariable (condition)',
      deleteObject: 'Delete (action)',
      changeOrRestartScene:
        'Scene (action — its scene name parameter is quoted)',
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
  compact?: boolean,
  targetScope?: ?string
): ?Object => {
  if (kind === 'condition') {
    const metadata = getRawInstructionMetadata(project, type, 'condition');
    return !metadata
      ? null
      : summarizeInstructionMetadata({
          type,
          kind: 'condition',
          metadata,
          compact: !!compact,
          targetScope,
        });
  }

  if (kind === 'action') {
    const metadata = getRawInstructionMetadata(project, type, 'action');
    return !metadata
      ? null
      : summarizeInstructionMetadata({
          type,
          kind: 'action',
          metadata,
          compact: !!compact,
          targetScope,
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
        targetScope,
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
        targetScope,
      });
    }
  }

  return null;
};

export const getExactInstructionMetadata = ({
  project,
  i18n,
  type,
  kind,
  compact,
  targetScope,
}: {|
  project: gdProject,
  i18n?: any,
  type?: ?string,
  kind?: ?string,
  compact?: boolean,
  targetScope?: ?string,
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

  if (kind === 'action' || kind === 'condition') {
    const rawMetadata = getRawInstructionMetadata(project, type, kind);
    if (!rawMetadata) {
      return {
        error: `No ${kind} metadata found for "${type}". Search .gdevelop/instructions-catalog.json for the exact type.`,
      };
    }
    if (isDeprecatedOrHiddenInstructionMetadata(rawMetadata)) {
      return getDeprecatedInstructionDiagnostic({
        project,
        i18n,
        type,
        kind,
        metadata: rawMetadata,
      });
    }
  }

  const metadata = getInstructionMetadata(
    project,
    type,
    kind,
    compact,
    targetScope
  );
  if (!metadata) {
    return {
      error: `No ${kind} metadata found for "${type}". Search .gdevelop/instructions-catalog.json for the exact type.`,
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
        "Maps to GDevelop core isRelevantForLayoutEvents(). false does NOT mean the instruction cannot be used in scene events (e.g. object-variable instructions report false yet work in scenes); it reflects the instruction's declared primary context.",
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
  targetScope,
}: {|
  project: gdProject,
  i18n: any,
  query?: ?string,
  kind?: ?string,
  limit?: ?number,
  compact?: boolean,
  targetScope?: ?string,
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
    if (isDeprecatedOrHiddenInstructionMetadata(instruction.metadata)) return;
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
          targetScope,
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
            targetScope,
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

  // Surface curated hints for hard-to-discover capability actions (set text,
  // opacity, animation, BGM, etc.) whenever the query overlaps them — even if
  // the ranked results already include them, the template + note removes the
  // operator/quoting/behavior-name guesswork.
  const commonTaskHints = findCommonTaskHints(searchQuery);

  return {
    query: searchQuery,
    kind: normalizedKind,
    limit: resultLimit,
    totalMatches: scored.length,
    truncated: scored.length > resultLimit,
    results,
    commonTaskHints: commonTaskHints.length ? commonTaskHints : undefined,
  };
};

const getInstructionMetadataForValidation = (
  project: gdProject,
  instructionType: string,
  isCondition: boolean
): ?gdInstructionMetadata => {
  return getRawInstructionMetadata(
    project,
    instructionType,
    isCondition ? 'condition' : 'action'
  );
};

const normalizeInstructionParameterKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]s\b/g, '')
    .replace(/[^a-z0-9]+/g, '');

const getInstructionParameterName = (
  parameterMetadata: gdParameterMetadata
): string => {
  const typeKey = normalizeInstructionParameterKey(
    parameterMetadata.getType() || ''
  );
  const nameKey = normalizeInstructionParameterKey(
    parameterMetadata.getName() || ''
  );
  const descriptionKey = normalizeInstructionParameterKey(
    parameterMetadata.getDescription() || ''
  );
  if (typeKey === 'relationaloperator' || nameKey === 'relationaloperator') {
    return 'comparison_sign';
  }
  if (typeKey === 'operator' || nameKey === 'operator') {
    return 'modification_sign';
  }
  if (descriptionKey === 'value' || descriptionKey === 'valuetocompare') {
    return 'value';
  }
  return '';
};

const getInstructionParameterBaseName = (
  parameterMetadata: gdParameterMetadata,
  index: number
): string => {
  const displayName =
    parameterMetadata.getName() ||
    parameterMetadata.getDescription() ||
    `Parameter ${index}`;
  return (
    getInstructionParameterName(parameterMetadata) ||
    displayName
      .trim()
      .toLowerCase()
      .replace(/['’]s\b/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') ||
    `parameter_${index}`
  );
};

export const normalizeInstructionParameterDslName = (
  suggestedName: string,
  index: number
): string => {
  const sanitizedName = String(suggestedName)
    .trim()
    .replace(/[^A-Za-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const nonEmptyName = sanitizedName || `parameter_${index}`;
  return /^[A-Za-z_]/.test(nonEmptyName)
    ? nonEmptyName
    : `parameter_${nonEmptyName}`;
};

const getUniqueInstructionParameterNames = (metadata: any): Array<string> => {
  const baseNames = mapFor(0, metadata.getParametersCount(), index =>
    normalizeInstructionParameterDslName(
      getInstructionParameterBaseName(metadata.getParameter(index), index),
      index
    )
  );
  const counts = {};
  baseNames.forEach(baseName => {
    counts[baseName] = (counts[baseName] || 0) + 1;
  });
  const seen = {};
  const used = new Set<string>();
  const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];
  return baseNames.map((baseName, index) => {
    seen[baseName] = (seen[baseName] || 0) + 1;
    let uniqueName =
      counts[baseName] > 1
        ? `${ordinals[seen[baseName] - 1] || seen[baseName]}_${baseName}`
        : baseName;
    if (used.has(uniqueName)) uniqueName = `${uniqueName}_${index}`;
    used.add(uniqueName);
    return uniqueName;
  });
};

const getCatalogParameterValueKind = (parameter: Object): string => {
  if (parameter.type === 'yesorno' || parameter.type === 'trueorfalse') {
    return 'boolean';
  }
  const valueType = parameter.valueType || {};
  if (valueType.isObject) return 'object';
  if (valueType.isBehavior) return 'behavior';
  if (valueType.isVariable) return 'variable';
  if (valueType.isResource) return 'resource';
  if (valueType.isNumber) return 'number';
  if (valueType.isString) return 'text';
  return 'name';
};

const getSemanticCatalogDefaultValue = (
  defaultValue: any,
  valueKind: string,
  parameterType: string
): any => {
  if (defaultValue === undefined) return undefined;
  const source = String(defaultValue);
  if (valueKind === 'text') {
    try {
      const value = JSON.parse(source);
      if (typeof value === 'string') return value;
    } catch (error) {
      // Selector metadata often stores its literal default without expression
      // quotes. Catalog version 2 normalizes it to the semantic string value.
    }
    return source;
  }
  if (valueKind === 'number') {
    const value = Number(source);
    if (Number.isFinite(value)) return value;
    throw new Error(
      `Cannot convert default value for number parameter type ${parameterType}.`
    );
  }
  if (valueKind === 'boolean') {
    if (['yes', 'true', 'True'].includes(source)) return true;
    if (['no', 'false', 'False'].includes(source)) return false;
    throw new Error(
      `Cannot convert default value for boolean parameter type ${parameterType}.`
    );
  }
  return source;
};

const catalogParameters = (parameters: Array<Object>): Array<Object> =>
  parameters.map(parameter => {
    const catalogParameter: Object = {
      dslName: parameter.parameterName,
      type: parameter.type,
    };
    const description = parameter.description || parameter.longDescription;
    if (description) catalogParameter.description = description;
    if (parameter.isOptional) catalogParameter.isOptional = true;
    if (parameter.isCodeOnly) catalogParameter.isCodeOnly = true;
    if (!parameter.isCodeOnly) {
      const valueKind = getCatalogParameterValueKind(parameter);
      catalogParameter.valueKind = valueKind;
      if (parameter.defaultValue !== undefined) {
        catalogParameter.defaultValue = getSemanticCatalogDefaultValue(
          parameter.defaultValue,
          valueKind,
          parameter.type
        );
      }
    }
    if (parameter.acceptedValues && catalogParameter.valueKind !== 'boolean')
      catalogParameter.acceptedValues = parameter.acceptedValues;
    if (parameter.extraInfo) catalogParameter.extraInfo = parameter.extraInfo;
    if (parameter.hint) catalogParameter.hint = parameter.hint;
    return catalogParameter;
  });

const catalogEventScopes = (eventScopes: Object): Array<string> =>
  [
    'scene',
    'extensionFunction',
    'behaviorFunction',
    'objectFunction',
    'asyncFunction',
    'customObjectInternal',
  ].filter(scopeName => eventScopes[scopeName].valid);

const catalogOwner = (scope: Object): ?Object => {
  const owner: Object = {};
  if (scope.extension && scope.extension.name)
    owner.extension = scope.extension.name;
  if (scope.objectMetadata && scope.objectMetadata.name)
    owner.objectType = scope.objectMetadata.name;
  if (scope.behaviorMetadata && scope.behaviorMetadata.name)
    owner.behaviorType = scope.behaviorMetadata.name;
  return Object.keys(owner).length ? owner : undefined;
};

const catalogInstruction = (summary: Object, scope: Object): Object => {
  const instruction: Object = {
    type: summary.type,
    name: summary.fullName,
    description: summary.description,
    sentence: summary.sentence,
    group: summary.group,
    eventScopes: catalogEventScopes(summary.eventScopes),
    parameters: catalogParameters(summary.parameters || []),
  };
  if (summary.canHaveSubInstructions) instruction.canHaveSubInstructions = true;
  if (summary.isAsync) instruction.isAsync = true;
  if (summary.isOptionallyAsync) instruction.isOptionallyAsync = true;
  if (summary.deprecationMessage)
    instruction.deprecationMessage = summary.deprecationMessage;
  const owner = catalogOwner(scope);
  if (owner) instruction.owner = owner;
  return instruction;
};

const catalogExpression = (summary: Object, scope: Object): Object => {
  const expression: Object = {
    type: summary.type,
    name: summary.fullName,
    description: summary.description,
    group: summary.group,
    returnType: summary.returnType,
    eventScopes: catalogEventScopes(summary.eventScopes),
    parameters: catalogParameters(summary.parameters || []),
  };
  if (summary.deprecationMessage)
    expression.deprecationMessage = summary.deprecationMessage;
  const owner = catalogOwner(scope);
  if (owner) expression.owner = owner;
  return expression;
};

export const buildCompleteProjectInstructionCatalog = ({
  project,
  i18n,
  includeDeprecatedAndHidden = false,
  additionalExtensions = [],
}: {|
  project: gdProject,
  i18n?: any,
  includeDeprecatedAndHidden?: boolean,
  additionalExtensions?: Array<gdPlatformExtension>,
|}): Object => {
  const collectInstructions = (isCondition: boolean) => {
    const entriesByType: Map<string, Object> = new Map();
    const instructions: Array<EnumeratedInstructionMetadata> = [];
    additionalExtensions.forEach(extension => {
      instructions.push(
        ...enumerateAllInstructionsForExtension(
          isCondition,
          extension,
          project,
          (i18n || null: any),
          {
            includeHiddenAndCompatibility: true,
          }
        )
      );
    });
    instructions.push(
      ...enumerateAllInstructions(isCondition, project, (i18n || null: any), {
        includeHiddenAndCompatibility: true,
      })
    );
    instructions.forEach(instruction => {
      // The events editor treats every hidden instruction as deprecated and
      // renders it with the [DEPRECATED] warning, including older APIs such as
      // TextObject::String that do not carry a deprecation message.
      if (
        !includeDeprecatedAndHidden &&
        isDeprecatedOrHiddenInstructionMetadata(instruction.metadata)
      )
        return;
      if (entriesByType.has(instruction.type)) return;
      const summary = summarizeInstructionMetadata({
        type: instruction.type,
        kind: isCondition ? 'condition' : 'action',
        metadata: instruction.metadata,
        fullGroupName: instruction.fullGroupName,
      });
      entriesByType.set(
        instruction.type,
        catalogInstruction(summary, instruction.scope)
      );
    });
    return Array.from(entriesByType.values()).sort((left, right) =>
      left.type.localeCompare(right.type)
    );
  };

  const expressionsByKey: Map<string, Object> = new Map();
  const allExpressions: Array<EnumeratedExpressionMetadata> = [];
  additionalExtensions.forEach(extension => {
    allExpressions.push(
      ...enumerateAllExpressionsForExtension(
        '',
        extension,
        project,
        (i18n || null: any)
      )
    );
  });
  allExpressions.push(
    ...enumerateAllExpressions('', project, (i18n || null: any))
  );
  allExpressions.forEach(expression => {
    if (
      !includeDeprecatedAndHidden &&
      isDeprecatedExpressionMetadata(expression.metadata)
    )
      return;
    const key = `${
      expression.type
    }\u0000${expression.metadata.getReturnType()}`;
    if (expressionsByKey.has(key)) return;
    const summary = summarizeExpressionMetadata({
      type: expression.type,
      metadata: expression.metadata,
      fullGroupName: expression.fullGroupName,
    });
    expressionsByKey.set(key, catalogExpression(summary, expression.scope));
  });
  const expressions = Array.from(expressionsByKey.values()).sort(
    (left, right) =>
      left.type.localeCompare(right.type) ||
      String(left.returnType).localeCompare(String(right.returnType))
  );
  const actions = collectInstructions(false);
  const conditions = collectInstructions(true);

  return {
    format: 'gdevelop-ifdo-instruction-catalog',
    formatVersion: 2,
    project: {
      name: project.getName(),
      uuid: project.getProjectUuid(),
    },
    counts: {
      actions: actions.length,
      conditions: conditions.length,
      expressions: expressions.length,
    },
    actions,
    conditions,
    expressions,
  };
};

// High-level instruction builder (#8): given an instruction type + a map of
// named parameter values (keyed by parameter name OR index), produce a
// correctly-ORDERED, fully-populated `parameters` array — code-only slots filled
// with "", string/identifier/resource values quoted/bare per their type — so
// callers don't hand-align indexes, hidden params, and quoting. Returns
// { instruction: { type:{value}, parameters }, filled, warnings } or throws on
// unknown type / unfillable required parameter.
export const buildInstruction = ({
  project,
  i18n,
  type,
  kind,
  parameters,
}: {|
  project: gdProject,
  i18n?: any,
  type: string,
  kind: 'action' | 'condition',
  parameters: Object,
|}): Object => {
  const isCondition = kind === 'condition';
  const metadata = getInstructionMetadataForValidation(
    project,
    type,
    isCondition
  );
  if (!metadata) {
    throw new Error(
      `Unknown ${kind} type "${type}". Search .gdevelop/instructions-catalog.json for the exact type.`
    );
  }
  if (isDeprecatedOrHiddenInstructionMetadata(metadata)) {
    throw new Error(
      formatDeprecatedInstructionDiagnostic(
        getDeprecatedInstructionDiagnostic({
          project,
          i18n,
          type,
          kind,
          metadata,
        })
      )
    );
  }
  const named: { [string]: any } =
    parameters && typeof parameters === 'object' ? (parameters: any) : {};
  const normalizedNamedParameters: {
    [string]: ?{| key: string, value: any |},
  } = {};
  Object.keys(named).forEach(key => {
    normalizedNamedParameters[normalizeInstructionParameterKey(key)] = {
      key,
      value: named[key],
    };
  });
  const consumedParameterKeys: Set<string> = new Set();
  const count = metadata.getParametersCount();
  const uniqueParameterNames = getUniqueInstructionParameterNames(metadata);
  const aliasCounts: { [string]: number } = {};
  const rawAliasesByIndex = mapFor(0, count, index => {
    const param = metadata.getParameter(index);
    const aliases = [
      param.getName(),
      param.getDescription(),
      getInstructionParameterName(param),
    ].filter(Boolean);
    aliases.forEach(alias => {
      const normalized = normalizeInstructionParameterKey(alias);
      aliasCounts[normalized] = (aliasCounts[normalized] || 0) + 1;
    });
    return aliases;
  });
  const out: Array<string> = [];
  const warnings: Array<string> = [];
  const filled: Array<Object> = [];
  for (let index = 0; index < count; index++) {
    const param = metadata.getParameter(index);
    const paramType = param.getType();
    // Many built-in instructions expose a user-facing description but no
    // machine name. Include both plus stable AI-friendly aliases.
    const paramName = param.getName() || param.getDescription();
    const parameterAliases = [
      uniqueParameterNames[index],
      ...rawAliasesByIndex[index].filter(
        alias => aliasCounts[normalizeInstructionParameterKey(alias)] === 1
      ),
    ];
    const parameterTypeKey = normalizeInstructionParameterKey(
      param.getType() || ''
    );
    if (parameterTypeKey === 'relationaloperator') {
      parameterAliases.push('comparison', 'comparison_operator', 'operator');
    } else if (parameterTypeKey === 'operator') {
      parameterAliases.push('operation', 'sign');
    }
    let normalizedParameterMatch: ?{| key: string, value: any |} = null;
    for (const alias of parameterAliases) {
      const match = alias
        ? normalizedNamedParameters[normalizeInstructionParameterKey(alias)]
        : null;
      if (match) {
        normalizedParameterMatch = match;
        break;
      }
    }
    if (param.isCodeOnly()) {
      out.push('');
      continue;
    }
    // Look up the provided value by name, then by positional index.
    let value;
    if (
      paramName &&
      aliasCounts[normalizeInstructionParameterKey(paramName)] === 1 &&
      named[paramName] !== undefined
    ) {
      value = named[paramName];
      consumedParameterKeys.add(paramName);
    } else if (normalizedParameterMatch) {
      value = normalizedParameterMatch.value;
      consumedParameterKeys.add(normalizedParameterMatch.key);
    } else if (named[String(index)] !== undefined) {
      value = named[String(index)];
      consumedParameterKeys.add(String(index));
    } else {
      const def = param.getDefaultValue();
      if (def) {
        out.push(def);
        filled.push({ index, name: paramName, value: def, source: 'default' });
        continue;
      }
      if (!param.isOptional()) {
        warnings.push(
          `Required parameter "${paramName ||
            index}" (type ${paramType}) was not provided and has no default.`
        );
      }
      out.push('');
      continue;
    }
    // Type-aware serialization: numbers/operators/objects/variables/resources go
    // in bare; string-expression types get wrapped in quotes if a plain literal.
    let serialized;
    if (typeof value === 'number' || typeof value === 'boolean') {
      serialized = String(value);
    } else {
      serialized = String(value);
      const needsQuotes =
        QUOTED_STRING_PARAMETER_TYPES.has(paramType) &&
        !/^".*"$/.test(serialized.trim()) &&
        // Don't quote an expression that already looks composed (concatenation,
        // function call) — only bare single literals.
        !/[+()]/.test(serialized);
      if (needsQuotes) serialized = JSON.stringify(serialized);
    }
    out.push(serialized);
    filled.push({
      index,
      name: paramName,
      parameterName: uniqueParameterNames[index],
      value: serialized,
    });
  }
  Object.keys(named).forEach(key => {
    if (consumedParameterKeys.has(key)) return;
    warnings.push(
      `Unknown parameter "${key}" for ${kind} "${type}". Use one of the unique parameterName values (${uniqueParameterNames.join(
        ', '
      )}) or a numeric index.`
    );
  });
  return {
    instruction: { type: { value: type }, parameters: out },
    parameters: out,
    filled,
    warnings: warnings.length ? warnings : undefined,
  };
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
  if (/["'()+\-*/.,[\]]/.test(trimmed)) return false;
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
              instruction.parameters[index] = `"${
                instruction.parameters[index]
              }"`;
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
  if (
    issue.type !== 'invalid-parameter' &&
    issue.type !== 'missing-parameter'
  ) {
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
      suggestion: `The object parameter (index ${
        issue.parameterIndex
      }) is reported invalid because behavior parameter at index ${
        issue.relatedBehaviorParameterIndex
      } contains "${
        issue.relatedBehaviorParameterValue
      }", which looks like a behavior TYPE. Behavior parameters take the behavior NAME on the object (e.g. "PlatformerObject"), not the type. Read the object source and generated settings catalog for the configured behavior name.`,
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
        suggestion: `Parameter ${
          issue.parameterIndex
        } is a string expression (${parameterType}) but contains a newline. Use a single-line expression such as "Game Over" + NewLine() + "Press Space".`,
      };
    }
    if (!startsQuoted && value) {
      return {
        ...issue,
        suggestion: `Parameter ${
          issue.parameterIndex
        } is a string expression (${parameterType}); wrap the literal in double quotes. Try ${JSON.stringify(
          value
        )}.`,
      };
    }
    return {
      ...issue,
      suggestion: `Parameter ${
        issue.parameterIndex
      } is a string expression (${parameterType}). ${describeParameterLiteralSyntax(
        parameterType
      )}.`,
    };
  }

  if (shape === 'number') {
    return {
      ...issue,
      suggestion: `Parameter ${
        issue.parameterIndex
      } is a number expression (${parameterType}); pass a bare number or numeric expression WITHOUT quotes, e.g. 100 or Variable(Score). Do not wrap it in quotes.`,
    };
  }

  if (shape === 'object') {
    return {
      ...issue,
      suggestion: `Parameter ${
        issue.parameterIndex
      } expects a bare object NAME (no quotes). Check the object exists in this scene or globally.`,
    };
  }

  if (shape === 'behavior') {
    return {
      ...issue,
      suggestion: `Parameter ${
        issue.parameterIndex
      } expects a behavior NAME (the instance name on the object, e.g. "PlatformerObject"), not the behavior type, and without quotes. Read the object source and generated settings catalog to see the names.`,
    };
  }

  if (shape === 'variable') {
    // The scanner sets undeclaredVariable when a bare variable name is not
    // declared in scope (the definitive cause). Fall back to a heuristic only
    // when that flag is absent.
    const looksLikeBareName =
      value && /^[A-Za-z_][A-Za-z0-9_.]*$/.test(value.trim());
    if (issue.undeclaredVariable || looksLikeBareName) {
      return {
        ...issue,
        suggestion: `Variable "${value}" is ${
          issue.undeclaredVariable ? 'not declared' : 'likely not declared'
        } in this scope. Declare it in the appropriate project source (scene/global/object) before referencing it. The value format (bare name) is already correct.`,
      };
    }
    return {
      ...issue,
      suggestion: `Parameter ${
        issue.parameterIndex
      } expects a bare variable reference (no quotes). Scene/global variables are referenced by name (e.g. Score); object variables as Object.VariableName. If the name is correct, declare the variable in the appropriate project source first.`,
    };
  }

  if (shape === 'resource') {
    const resourceParameterType = parameterType || 'resource';
    if (startsQuoted && value) {
      const bare = value.trim().replace(/^"+|"+$/g, '');
      return {
        ...issue,
        suggestion: `Parameter ${
          issue.parameterIndex
        } is a resource name (${resourceParameterType}) and must be BARE with NO quotes — this is the OPPOSITE of string parameters. You wrote ${JSON.stringify(
          value
        )}; use ${bare} instead. The resource must already exist in resources.settings.`,
      };
    }
    return {
      ...issue,
      suggestion: `Parameter ${
        issue.parameterIndex
      } is a resource name (${resourceParameterType}): pass the BARE resource name with NO quotes (e.g. Shoot, not "Shoot"). The resource must already exist in resources.settings.`,
    };
  }

  if (parameterType) {
    return {
      ...issue,
      suggestion: `Parameter ${
        issue.parameterIndex
      } (${parameterType}): ${describeParameterLiteralSyntax(parameterType)}.`,
    };
  }

  // Fallback when parameterType is unavailable: keep the legacy guidance but
  // hedge it so it does not assert that quoting is the fix.
  if (value && !startsQuoted) {
    return {
      ...issue,
      suggestion: `If this parameter expects a text/string expression, wrap the literal in quotes (e.g. ${JSON.stringify(
        value
      )}). If it expects an object/behavior/variable name or a number, leave it unquoted. Confirm with .gdevelop/instructions-catalog.json.`,
    };
  }
  return {
    ...issue,
    suggestion:
      'Check the exact parameter type/order in .gdevelop/instructions-catalog.json, then rewrite this parameter for that type.',
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

// Instruction types whose children are nested sub-instructions (Or/And/Not).
const SUBINSTRUCTION_LOGICAL_TYPES = new Set([
  'BuiltinCommonInstructions::Or',
  'BuiltinCommonInstructions::And',
  'BuiltinCommonInstructions::Not',
]);

const LEGACY_LAYOUT_EVENT_INSTRUCTION_REPLACEMENTS = {
  ObjectVariableAsBoolean: {
    replacementType: 'BooleanObjectVariable',
    replacementKind: 'condition',
    suggestion:
      'Use condition type "BooleanObjectVariable" for scene/layout events. Keep the same user parameters [objectName, variableName, true/false]. "ObjectVariableAsBoolean" is a legacy/function-events-only form and will render with a warning/deprecated background in scene events.',
  },
  SetObjectVariableAsBoolean: {
    replacementType: 'SetBooleanObjectVariable',
    replacementKind: 'action',
    suggestion:
      'Use action type "SetBooleanObjectVariable" for scene/layout events. Parameters are [objectName, variableName, "True" or "False"] (or "Toggle" when toggling). "SetObjectVariableAsBoolean" is a legacy/function-events-only form and will render with a warning/deprecated background in scene events.',
  },
  ToggleObjectVariableAsBoolean: {
    replacementType: 'SetBooleanObjectVariable',
    replacementKind: 'action',
    suggestion:
      'Use action type "SetBooleanObjectVariable" with parameters [objectName, variableName, "Toggle"] for scene/layout events. "ToggleObjectVariableAsBoolean" is a legacy/function-events-only form and will render with a warning/deprecated background in scene events.',
  },
};

// Walk the PARSED events JSON (before unserialization, which silently drops
// unknown keys) and flag structural mistakes that the gd serializer would
// otherwise swallow — most importantly Or/And/Not whose child conditions were
// put under the wrong key ("conditions"/"actions") instead of "subInstructions",
// or that have no children at all. Returns an array of issue objects.
export const collectSerializedEventJsonIssues = (
  parsedEvents: Array<any>
): Array<Object> => {
  const issues = [];

  const checkInstruction = (
    instruction,
    isCondition,
    path,
    instructionPath
  ) => {
    if (!instruction || typeof instruction !== 'object') return;
    const type = getSerializedInstructionTypeValue(instruction);
    const legacyReplacement =
      LEGACY_LAYOUT_EVENT_INSTRUCTION_REPLACEMENTS[type];
    if (legacyReplacement) {
      issues.push({
        severity: 'error',
        type: 'legacy-function-only-instruction-in-scene-events',
        instructionType: type,
        isCondition,
        eventPath: path,
        instructionPath,
        replacementType: legacyReplacement.replacementType,
        replacementKind: legacyReplacement.replacementKind,
        suggestion: legacyReplacement.suggestion,
      });
    }
    if (SUBINSTRUCTION_LOGICAL_TYPES.has(type)) {
      const sub = instruction.subInstructions;
      const hasSub = Array.isArray(sub) && sub.length > 0;
      // The classic mistake: children placed under "conditions"/"actions".
      const misplaced =
        (Array.isArray(instruction.conditions) &&
          instruction.conditions.length > 0) ||
        (Array.isArray(instruction.actions) && instruction.actions.length > 0);
      if (!hasSub) {
        issues.push({
          severity: 'error',
          type: 'empty-or-misplaced-sub-instructions',
          instructionType: type,
          eventPath: path,
          suggestion: misplaced
            ? `${type} has child conditions under the wrong key ("conditions"/"actions"); they will be SILENTLY DROPPED. Put the child conditions in a "subInstructions" array on this ${type} instruction instead.`
            : `${type} has no "subInstructions" — it will match nothing. Add the child conditions in a "subInstructions" array (an empty Or/And/Not is almost never intended).`,
        });
      }
      // Recurse into the (correct) sub-instructions.
      if (Array.isArray(sub)) {
        sub.forEach((child, childIndex) =>
          checkInstruction(
            child,
            isCondition,
            path,
            `${instructionPath}.subInstructions.${childIndex}`
          )
        );
      }
    }
    // Recurse into any nested subInstructions for non-logical instructions too.
    if (
      !SUBINSTRUCTION_LOGICAL_TYPES.has(type) &&
      Array.isArray(instruction.subInstructions)
    ) {
      instruction.subInstructions.forEach((child, childIndex) =>
        checkInstruction(
          child,
          isCondition,
          path,
          `${instructionPath}.subInstructions.${childIndex}`
        )
      );
    }
  };

  const checkEvents = (events, path) => {
    if (!Array.isArray(events)) return;
    events.forEach((event, index) => {
      if (!event || typeof event !== 'object') return;
      const eventPath = path ? `${path}.${index}` : `event-${index}`;
      if (Array.isArray(event.conditions))
        event.conditions.forEach((condition, conditionIndex) =>
          checkInstruction(
            condition,
            true,
            eventPath,
            `${eventPath}.conditions.${conditionIndex}`
          )
        );
      if (Array.isArray(event.actions))
        event.actions.forEach((action, actionIndex) =>
          checkInstruction(
            action,
            false,
            eventPath,
            `${eventPath}.actions.${actionIndex}`
          )
        );
      // While events keep conditions in whileConditions.
      if (Array.isArray(event.whileConditions))
        event.whileConditions.forEach((condition, conditionIndex) =>
          checkInstruction(
            condition,
            true,
            eventPath,
            `${eventPath}.whileConditions.${conditionIndex}`
          )
        );
      if (Array.isArray(event.events)) checkEvents(event.events, eventPath);
    });
  };

  checkEvents(parsedEvents, '');
  return issues;
};

export const validateEventsJson = ({
  project,
  sceneName,
  eventsJson,
  allowJavaScriptEvents,
  summaryOnly,
  dedupeErrors,
  errorsOnly,
  includeRenderedEvents,
  includeNormalizedJson,
}: {|
  project: gdProject,
  sceneName?: ?string,
  eventsJson?: ?string,
  allowJavaScriptEvents?: boolean,
  summaryOnly?: boolean,
  dedupeErrors?: boolean,
  errorsOnly?: boolean,
  includeRenderedEvents?: boolean,
  includeNormalizedJson?: boolean,
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
    // Structural checks on the raw JSON (catches Or/And/Not children placed under
    // the wrong key, which the unserializer would silently drop).
    issues.push(...collectSerializedEventJsonIssues(parsedEvents));
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
    if (errorsOnly) {
      return {
        valid: errors.length === 0,
        eventsCount: eventsList.getEventsCount(),
        errors: dedupeErrors
          ? issueSummary.rootCauses.filter(
              cause => cause.type !== 'extra-parameters'
            )
          : errors,
      };
    }

    const shouldIncludeRenderedEvents =
      includeRenderedEvents === true || summaryOnly === false;
    const shouldIncludeNormalizedJson =
      includeNormalizedJson === true || summaryOnly === false;

    return {
      ...result,
      eventsAsText: shouldIncludeRenderedEvents
        ? renderNonTranslatedEventsAsText({ eventsList })
        : undefined,
      normalizedEventsJson: shouldIncludeNormalizedJson
        ? serializeToJSON(eventsList)
        : undefined,
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
  errorsOnly,
  includeRenderedEvents,
  includeNormalizedJson,
}: {|
  project: gdProject,
  sceneName?: ?string,
  eventsJsonFile?: ?string,
  allowJavaScriptEvents?: boolean,
  summaryOnly?: boolean,
  dedupeErrors?: boolean,
  errorsOnly?: boolean,
  includeRenderedEvents?: boolean,
  includeNormalizedJson?: boolean,
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
    errorsOnly,
    includeRenderedEvents,
    includeNormalizedJson,
  });

  return {
    ...result,
    eventsJsonFile,
  };
};
