// @flow
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';
import { scanEventsListForValidationErrors } from '../Utils/EventsValidationScanner';
import { collectSerializedEventJsonIssues } from './McpEventKnowledge';
import optionalRequire from '../Utils/OptionalRequire';
import {
  DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME,
  getSceneLifecycleEvents,
  getSceneLifecycleEventsFunction,
  isSceneLifecycleFunctionName,
  type SceneLifecycleFunctionName,
} from '../SceneContextLifecycleFunctions';
import { encodeManagedName } from '../ProjectsStorage/MultiFileProjectFormat';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const nodePath = optionalRequire('path');

export const getSerializedEventsRevision = (serializedEvents: any): string => {
  const text = JSON.stringify(serializedEvents || []);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

// Resolve a possibly-relative file path against the opened project's folder, so
// file-based tools accept the same relative paths resource tools accept.
const resolveProjectRelativeFile = (
  project: gdProject,
  file: string
): string => {
  if (!file || !nodePath) return file;
  if (nodePath.isAbsolute(file)) return file;
  const projectFile = project.getProjectFile && project.getProjectFile();
  if (!projectFile) return file;
  return nodePath.resolve(nodePath.dirname(projectFile), file);
};

type EventToolCallbacks = {|
  onSceneEventsModifiedOutsideEditor?: Function,
|};

type SceneEventsTarget = {|
  scene: gdLayout,
  owner: gdLayout | gdExternalEvents,
  eventsList: gdEventsList,
  eventsFunction: gdEventsFunction,
  lifecycleFunctionName: SceneLifecycleFunctionName,
  ownerKind: 'scene' | 'externalEvents',
  ownerName: string,
  externalEventsName: string | null,
  functionSettingsUri: string,
  eventsUri: string,
|};

type EventReference = {|
  event: gdBaseEvent,
  parentList: gdEventsList,
  index: number,
  path: Array<number>,
  inheritedForEachObjects: Set<string>,
|};

const getRequiredString = (args: Object, name: string): string => {
  const value = args && args[name];
  if (typeof value !== 'string' || !value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
};

const getOptionalString = (args: Object, name: string): string | null => {
  const value = args && args[name];
  return typeof value === 'string' ? value : null;
};

const getScene = (project: gdProject, sceneName: string): gdLayout => {
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }
  return project.getLayout(sceneName);
};

const getRequestedLifecycleFunctionName = (
  args: Object
): SceneLifecycleFunctionName => {
  const lifecycleFunctionName =
    getOptionalString(args, 'lifecycle_function_name') ||
    getOptionalString(args, 'lifecycleFunctionName') ||
    DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME;
  if (!isSceneLifecycleFunctionName(lifecycleFunctionName)) {
    throw new Error(
      `Invalid lifecycleFunctionName: "${lifecycleFunctionName}". Expected sceneLoad, sceneSignal, sceneUpdate, or sceneUnload.`
    );
  }
  return (lifecycleFunctionName: any);
};

const resolveSceneEventsTarget = (
  project: gdProject,
  args: Object
): SceneEventsTarget => {
  const requestedSceneName =
    getOptionalString(args, 'scene_name') ||
    getOptionalString(args, 'sceneName');
  const externalEventsName =
    getOptionalString(args, 'external_events_name') ||
    getOptionalString(args, 'externalEventsName');
  const lifecycleFunctionName = getRequestedLifecycleFunctionName(args);

  let sceneName = requestedSceneName;
  let owner: gdLayout | gdExternalEvents;
  let ownerKind: 'scene' | 'externalEvents';
  let ownerName: string;
  let ownerBaseUri: string;

  if (externalEventsName) {
    if (!project.hasExternalEventsNamed(externalEventsName)) {
      throw new Error(`External Events not found: "${externalEventsName}".`);
    }
    const externalEvents = project.getExternalEvents(externalEventsName);
    const associatedSceneName = externalEvents.getAssociatedLayout();
    if (!associatedSceneName) {
      throw new Error(
        `External Events "${externalEventsName}" is not associated with a scene.`
      );
    }
    if (sceneName && sceneName !== associatedSceneName) {
      throw new Error(
        `External Events "${externalEventsName}" belongs to scene "${associatedSceneName}", not "${sceneName}".`
      );
    }
    sceneName = associatedSceneName;
    owner = externalEvents;
    ownerKind = 'externalEvents';
    ownerName = externalEventsName;
    ownerBaseUri = `game://scenes/${encodeManagedName(
      sceneName
    )}/external-events/${encodeManagedName(externalEventsName)}`;
  } else {
    if (!sceneName) throw new Error('Missing scene_name.');
    owner = getScene(project, sceneName);
    ownerKind = 'scene';
    ownerName = sceneName;
    ownerBaseUri = `game://scenes/${encodeManagedName(sceneName)}`;
  }

  const scene = getScene(project, sceneName);
  const functionBaseUri = `${ownerBaseUri}/functions/${lifecycleFunctionName}`;
  return {
    scene,
    owner,
    eventsList: getSceneLifecycleEvents(owner, lifecycleFunctionName),
    eventsFunction: getSceneLifecycleEventsFunction(
      owner,
      lifecycleFunctionName
    ),
    lifecycleFunctionName,
    ownerKind,
    ownerName,
    externalEventsName: externalEventsName || null,
    functionSettingsUri: `${functionBaseUri}.settings`,
    eventsUri: `${functionBaseUri}.events`,
  };
};

const getSceneEventsTargetIdentity = (target: SceneEventsTarget): Object => ({
  sceneName: target.scene.getName(),
  lifecycleFunctionName: target.lifecycleFunctionName,
  lifecycleRole: target.lifecycleFunctionName,
  ownerKind: target.ownerKind,
  ownerName: target.ownerName,
  ...(target.externalEventsName
    ? { externalEventsName: target.externalEventsName }
    : {}),
  functionSettingsUri: target.functionSettingsUri,
  eventsUri: target.eventsUri,
});

const formatEventPath = (path: Array<number>): string =>
  `event-${path.join('.')}`;

const parseEventPath = (eventPath: string): Array<number> => {
  const pathString = eventPath.startsWith('event-')
    ? eventPath.slice('event-'.length)
    : eventPath;
  if (!pathString) {
    throw new Error(`Invalid event path: "${eventPath}".`);
  }

  const parts = pathString.split('.').map(part => Number(part));
  if (
    !parts.length ||
    parts.some(part => !Number.isInteger(part) || part < 0)
  ) {
    throw new Error(`Invalid event path: "${eventPath}".`);
  }
  return parts;
};

const comparePathsDescending = (
  left: Array<number>,
  right: Array<number>
): number => {
  const maxLength = Math.max(left.length, right.length);
  for (let index = 0; index < maxLength; index++) {
    const leftValue = index < left.length ? left[index] : -1;
    const rightValue = index < right.length ? right[index] : -1;
    if (leftValue > rightValue) return -1;
    if (leftValue < rightValue) return 1;
  }
  return 0;
};

const hasPathPrefix = (
  path: Array<number>,
  maybePrefix: Array<number>
): boolean =>
  maybePrefix.length < path.length &&
  maybePrefix.every((part, index) => path[index] === part);

const collectEventReferences = (
  eventsList: gdEventsList,
  parentPath: Array<number> = [],
  inheritedForEachObjects: Set<string> = new Set()
): Array<EventReference> => {
  const references = [];
  for (let index = 0; index < eventsList.getEventsCount(); index++) {
    const event = eventsList.getEventAt(index);
    const path = [...parentPath, index];
    references.push({
      event,
      parentList: eventsList,
      index,
      path,
      inheritedForEachObjects: new Set(inheritedForEachObjects),
    });
    if (event.canHaveSubEvents()) {
      const childForEachObjects = new Set(inheritedForEachObjects);
      if (event.getType() === 'BuiltinCommonInstructions::ForEach') {
        const objectName = gd.asForEachEvent(event).getObjectToPick();
        if (objectName) childForEachObjects.add(objectName);
      }
      references.push(
        ...collectEventReferences(
          event.getSubEvents(),
          path,
          childForEachObjects
        )
      );
    }
  }
  return references;
};

const getInstructionSummaries = (
  instructionsList: gdInstructionsList
): Array<Object> => {
  const instructions = [];
  for (let index = 0; index < instructionsList.size(); index++) {
    const instruction = instructionsList.get(index);
    const parameters = [];
    for (
      let parameterIndex = 0;
      parameterIndex < instruction.getParametersCount();
      parameterIndex++
    ) {
      parameters.push(
        instruction.getParameter(parameterIndex).getPlainString()
      );
    }
    instructions.push({
      type: instruction.getType(),
      parameters,
      subInstructionsCount: instruction.getSubInstructions
        ? instruction.getSubInstructions().size()
        : 0,
    });
  }
  return instructions;
};

// Count all sub-instructions (recursively) across an events list, for write-back
// verification that nested Or/And/Not children were not dropped.
const countSubInstructionsInList = (eventsList: gdEventsList): number => {
  let total = 0;
  const countInInstructions = instructionsList => {
    for (let i = 0; i < instructionsList.size(); i++) {
      const sub = instructionsList.get(i).getSubInstructions();
      total += sub.size();
      countInInstructions(sub);
    }
  };
  const visit = list => {
    for (let i = 0; i < list.getEventsCount(); i++) {
      const event = list.getEventAt(i);
      const type = event.getType();
      if (type === 'BuiltinCommonInstructions::Standard') {
        const standard = gd.asStandardEvent(event);
        countInInstructions(standard.getConditions());
        countInInstructions(standard.getActions());
      } else if (type === 'BuiltinCommonInstructions::While') {
        const whileEvent = gd.asWhileEvent(event);
        countInInstructions(whileEvent.getConditions());
        countInInstructions(whileEvent.getActions());
        countInInstructions(whileEvent.getWhileConditions());
      }
      if (event.canHaveSubEvents()) visit(event.getSubEvents());
    }
  };
  visit(eventsList);
  return total;
};

const getEventInstructions = (
  event: gdBaseEvent
): {| conditions: Array<Object>, actions: Array<Object> |} => {
  const eventType = event.getType();
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    const standardEvent = gd.asStandardEvent(event);
    return {
      conditions: getInstructionSummaries(standardEvent.getConditions()),
      actions: getInstructionSummaries(standardEvent.getActions()),
    };
  }
  if (eventType === 'BuiltinCommonInstructions::While') {
    const whileEvent = gd.asWhileEvent(event);
    return {
      conditions: getInstructionSummaries(whileEvent.getWhileConditions()),
      actions: [],
    };
  }
  return {
    conditions: [],
    actions: [],
  };
};

const serializeSingleEventToJSObject = (event: gdBaseEvent): Object => {
  const eventsList = new gd.EventsList();
  try {
    eventsList.insertEvent(event, 0);
    const serializedEvents = serializeToJSObject(eventsList);
    if (Array.isArray(serializedEvents) && serializedEvents[0]) {
      return serializedEvents[0];
    }
    return serializeToJSObject(event);
  } finally {
    eventsList.delete();
  }
};

const summarizeEventReference = (
  reference: EventReference,
  options?: {| includeSerialized?: boolean |}
): Object => {
  const { event, path } = reference;
  const eventType = event.getType();
  const instructions = getEventInstructions(event);
  const includeSerialized = !options || options.includeSerialized !== false;
  const summary = {
    eventPath: formatEventPath(path),
    path,
    type: eventType,
    aiGeneratedEventId: event.getAiGeneratedEventId() || null,
    conditions: instructions.conditions,
    actions: instructions.actions,
  };
  if (includeSerialized) {
    summary.serializedEvent = serializeSingleEventToJSObject(event);
  }

  if (eventType === 'BuiltinCommonInstructions::Group') {
    summary.groupName = gd.asGroupEvent(event).getName();
    summary.subEventsCount = event.getSubEvents().getEventsCount();
  }
  if (eventType === 'BuiltinCommonInstructions::Comment') {
    const serializedEvent = includeSerialized
      ? summary.serializedEvent
      : serializeSingleEventToJSObject(event);
    summary.comment = serializedEvent.comment || '';
  }

  return summary;
};

const serializeEventPreservingStableId = (event: gdBaseEvent): Object => {
  const serializedEvent = serializeSingleEventToJSObject(event);
  const aiGeneratedEventId = event.getAiGeneratedEventId();
  if (aiGeneratedEventId) {
    serializedEvent.aiGeneratedEventId = aiGeneratedEventId;
  }
  return serializedEvent;
};

const eventMatchesCriteria = (
  reference: EventReference,
  criteria: Object
): boolean => {
  const event = reference.event;
  const serializedEventText = JSON.stringify(
    serializeSingleEventToJSObject(event)
  );
  const aiGeneratedEventId =
    getOptionalString(criteria, 'ai_generated_event_id') ||
    getOptionalString(criteria, 'aiGeneratedEventId') ||
    getOptionalString(criteria, 'event_id') ||
    getOptionalString(criteria, 'id');
  if (
    aiGeneratedEventId &&
    event.getAiGeneratedEventId() !== aiGeneratedEventId
  ) {
    return false;
  }

  const eventType = getOptionalString(criteria, 'event_type');
  if (eventType && event.getType() !== eventType) return false;

  const groupName = getOptionalString(criteria, 'group_name');
  if (groupName) {
    if (event.getType() !== 'BuiltinCommonInstructions::Group') return false;
    if (gd.asGroupEvent(event).getName() !== groupName) return false;
  }

  const actionType = getOptionalString(criteria, 'action_type');
  const conditionType = getOptionalString(criteria, 'condition_type');
  const instructions = getEventInstructions(event);
  if (
    actionType &&
    !instructions.actions.some(instruction => instruction.type === actionType)
  ) {
    return false;
  }
  if (
    conditionType &&
    !instructions.conditions.some(
      instruction => instruction.type === conditionType
    )
  ) {
    return false;
  }

  const parameterContains = getOptionalString(criteria, 'parameter_contains');
  if (parameterContains && !serializedEventText.includes(parameterContains)) {
    return false;
  }

  const textContains = getOptionalString(criteria, 'text_contains');
  if (textContains && !serializedEventText.includes(textContains)) {
    return false;
  }

  return true;
};

const findEventReferences = (
  eventsList: gdEventsList,
  criteria: Object
): Array<EventReference> => {
  const eventPath = getOptionalString(criteria, 'event_path');
  const references = collectEventReferences(eventsList);
  if (eventPath) {
    const parsedPath = parseEventPath(eventPath);
    return references.filter(
      reference =>
        reference.path.length === parsedPath.length &&
        reference.path.every((part, index) => parsedPath[index] === part)
    );
  }

  return references.filter(reference =>
    eventMatchesCriteria(reference, criteria)
  );
};

export const findEventsInEventsList = ({
  eventsList,
  args,
  owner,
  defaultIncludeSerialized,
}: {|
  eventsList: gdEventsList,
  args: Object,
  owner?: Object,
  defaultIncludeSerialized?: boolean,
|}): Array<Object> => {
  const includeSerialized =
    args && args.include_serialized !== undefined
      ? !!args.include_serialized
      : args && (args.summary_only || args.compact === true)
      ? false
      : args && args.compact === false
      ? true
      : defaultIncludeSerialized !== false;
  return findEventReferences(eventsList, args).map(reference => ({
    ...(owner || {}),
    ...summarizeEventReference(reference, { includeSerialized }),
  }));
};

const getSingleEventReference = (
  eventsList: gdEventsList,
  target: any,
  purpose: string
): EventReference => {
  const criteria =
    typeof target === 'string'
      ? target.startsWith('event-')
        ? { event_path: target }
        : { ai_generated_event_id: target }
      : target && typeof target === 'object'
      ? target
      : {};
  const matches = findEventReferences(eventsList, criteria);
  if (!matches.length) {
    throw new Error(`No event found for ${purpose}.`);
  }
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous event target for ${purpose}: ${
        matches.length
      } matches. Add event_path or ai_generated_event_id.`
    );
  }
  return matches[0];
};

export const replaceJavascriptEventCode = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const code =
    getOptionalString(args, 'code_string') ||
    getOptionalString(args, 'codeString') ||
    getOptionalString(args, 'inline_code') ||
    getOptionalString(args, 'inlineCode') ||
    getOptionalString(args, 'code');
  if (code === null) {
    throw new Error('Missing code_string.');
  }

  const target = resolveSceneEventsTarget(project, args);
  const eventReference = getSingleEventReference(
    target.eventsList,
    args.event || args.event_id || args.eventId || args,
    'JavaScript event'
  );
  if (eventReference.event.getType() !== 'BuiltinCommonInstructions::JsCode') {
    throw new Error(
      `Target event is "${eventReference.event.getType()}", not a JavaScript event.`
    );
  }

  const jsCodeEvent = gd.asJsCodeEvent(eventReference.event);
  const beforeCode = jsCodeEvent.getInlineCode();
  const beforeParameterObjects = jsCodeEvent.getParameterObjects();
  jsCodeEvent.setInlineCode(code);

  const parameterObjects =
    getOptionalString(args, 'parameter_objects') ||
    getOptionalString(args, 'parameterObjects');
  if (parameterObjects !== null) {
    jsCodeEvent.setParameterObjects(parameterObjects);
  }

  notifyEventsChanged(target, callbacks);

  const result = {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    eventPath: formatEventPath(eventReference.path),
    aiGeneratedEventId: eventReference.event.getAiGeneratedEventId() || null,
    before: {
      code: beforeCode,
      parameterObjects: beforeParameterObjects,
    },
    after: {
      code: jsCodeEvent.getInlineCode(),
      parameterObjects: jsCodeEvent.getParameterObjects(),
    },
  };

  if (args && (args.summary_only === true || args.summaryOnly === true)) {
    return result;
  }

  return {
    ...result,
    serializedEvents: serializeToJSObject(target.eventsList),
    eventsAsText: renderNonTranslatedEventsAsText({
      eventsList: target.eventsList,
    }),
  };
};

const getGroupReference = (
  eventsList: gdEventsList,
  args: Object
): EventReference => {
  const groupTarget = args.group_event || args.groupEvent;
  if (groupTarget) {
    const reference = getSingleEventReference(
      eventsList,
      groupTarget,
      'group event'
    );
    if (reference.event.getType() !== 'BuiltinCommonInstructions::Group') {
      throw new Error('Target event is not a Group event.');
    }
    return reference;
  }

  const groupName =
    getOptionalString(args, 'group_name') ||
    getOptionalString(args, 'groupName');
  if (!groupName) {
    throw new Error('Missing group_name or group_event.');
  }
  return getSingleEventReference(
    eventsList,
    { group_name: groupName },
    'group event'
  );
};

// Default GroupEvent color in GDevelop core (GroupEvent.cpp): rgb(74,176,228).
// The lint treats it as "unset", so auto-coloring avoids it.
const DEFAULT_GROUP_COLOR_KEY = '74;176;228';

// A palette of visually distinct, readable group background colors. Used to
// auto-assign a DISTINCT color when a group is created/wrapped without one, so
// the caller does not need a separate recolor pass and the group-color lint
// (distinct color per group) passes by construction.
const GROUP_COLOR_PALETTE = [
  { r: 90, g: 160, b: 110 }, // green
  { r: 200, g: 130, b: 90 }, // orange
  { r: 150, g: 110, b: 200 }, // purple
  { r: 200, g: 100, b: 130 }, // pink
  { r: 110, g: 170, b: 190 }, // teal
  { r: 190, g: 180, b: 90 }, // gold
  { r: 130, g: 140, b: 160 }, // slate
  { r: 170, g: 120, b: 110 }, // brown
];

const colorKeyOf = (r: number, g: number, b: number): string =>
  `${r};${g};${b}`;

// Collect the color keys already used by Group events in the scene, so a newly
// created group can pick an unused, non-default one.
const collectUsedGroupColorKeys = (eventsList: gdEventsList): Set<string> => {
  const used = new Set<string>();
  const references = collectEventReferences(eventsList);
  references.forEach(reference => {
    if (reference.event.getType() === 'BuiltinCommonInstructions::Group') {
      const groupEvent = gd.asGroupEvent(reference.event);
      used.add(
        colorKeyOf(
          groupEvent.getBackgroundColorR(),
          groupEvent.getBackgroundColorG(),
          groupEvent.getBackgroundColorB()
        )
      );
    }
  });
  return used;
};

// If the group has no explicit color (still the default blue) and the caller did
// not pass one, assign the first palette color not already used in the scene.
const autoAssignDistinctGroupColor = (
  groupEvent: gdGroupEvent,
  eventsList: gdEventsList
) => {
  const currentKey = colorKeyOf(
    groupEvent.getBackgroundColorR(),
    groupEvent.getBackgroundColorG(),
    groupEvent.getBackgroundColorB()
  );
  // Only auto-color when the group is still the default (unset) color.
  if (currentKey !== DEFAULT_GROUP_COLOR_KEY) return;
  const used = collectUsedGroupColorKeys(eventsList);
  const choice =
    GROUP_COLOR_PALETTE.find(
      color => !used.has(colorKeyOf(color.r, color.g, color.b))
    ) || GROUP_COLOR_PALETTE[used.size % GROUP_COLOR_PALETTE.length];
  groupEvent.setBackgroundColor(choice.r, choice.g, choice.b);
};

const applyGroupProperties = (event: gdBaseEvent, args: Object) => {
  const groupEvent = gd.asGroupEvent(event);
  const groupName =
    getOptionalString(args, 'group_name') ||
    getOptionalString(args, 'groupName') ||
    getOptionalString(args, 'name');
  if (groupName) groupEvent.setName(groupName);

  const newGroupName =
    getOptionalString(args, 'new_group_name') ||
    getOptionalString(args, 'newGroupName');
  if (newGroupName) groupEvent.setName(newGroupName);

  if (typeof args.folded === 'boolean') {
    event.setFolded(args.folded);
  }

  const color = args.color;
  if (color && typeof color === 'object') {
    const r = typeof color.r === 'number' ? color.r : null;
    const g = typeof color.g === 'number' ? color.g : null;
    const b = typeof color.b === 'number' ? color.b : null;
    if (r !== null && g !== null && b !== null) {
      groupEvent.setBackgroundColor(r, g, b);
    }
  }

  const aiGeneratedEventId =
    getOptionalString(args, 'ai_generated_event_id') ||
    getOptionalString(args, 'aiGeneratedEventId');
  if (aiGeneratedEventId) {
    event.setAiGeneratedEventId(aiGeneratedEventId);
  }
};

const notifyEventsChanged = (
  target: SceneEventsTarget,
  callbacks: EventToolCallbacks
) => {
  if (callbacks.onSceneEventsModifiedOutsideEditor) {
    callbacks.onSceneEventsModifiedOutsideEditor({
      scene: target.scene,
      ...(target.ownerKind === 'externalEvents'
        ? { externalEvents: (target.owner: any) }
        : {}),
      lifecycleFunctionName: target.lifecycleFunctionName,
      newOrChangedAiGeneratedEventIds: new Set(),
    });
  }
};

const insertSerializedEvents = (
  project: gdProject,
  targetEventsList: gdEventsList,
  serializedEvents: Array<Object>,
  position: number
) => {
  const tempEventsList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      tempEventsList,
      serializedEvents,
      'unserializeFrom',
      project
    );
    targetEventsList.insertEvents(
      tempEventsList,
      0,
      tempEventsList.getEventsCount(),
      position
    );
  } finally {
    tempEventsList.delete();
  }
};

const getTargetEventReferences = (
  eventsList: gdEventsList,
  args: Object
): Array<EventReference> => {
  const targets = Array.isArray(args.target_events)
    ? args.target_events
    : Array.isArray(args.targetEvents)
    ? args.targetEvents
    : [];
  if (!targets.length) {
    throw new Error('Missing target_events.');
  }

  const references = targets.map((target, index) =>
    getSingleEventReference(eventsList, target, `target_events[${index}]`)
  );
  const seenPaths = new Set();
  references.forEach(reference => {
    const path = formatEventPath(reference.path);
    if (seenPaths.has(path)) {
      throw new Error(`Duplicate target event: ${path}.`);
    }
    seenPaths.add(path);
  });
  return references;
};

export const findSceneEvents = (project: gdProject, args: Object): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const limit =
    typeof args.limit === 'number' && Number.isFinite(args.limit)
      ? Math.max(1, Math.min(100, Math.floor(args.limit)))
      : 50;
  const matches = findEventsInEventsList({
    eventsList: target.eventsList,
    args,
    owner: {
      scope: target.ownerKind,
      sceneName: target.scene.getName(),
      lifecycleFunctionName: target.lifecycleFunctionName,
      ...(target.externalEventsName
        ? { externalEventsName: target.externalEventsName }
        : {}),
    },
    defaultIncludeSerialized: false,
  }).slice(0, limit);

  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    eventSheetRevision: getSerializedEventsRevision(
      serializeToJSObject(target.eventsList)
    ),
    count: matches.length,
    matches,
  };
};

export const lintSceneEvents = (project: gdProject, args: Object): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const scene = target.scene;
  const allowJavaScriptEvents = !!(
    args &&
    (args.allow_javascript_events || args.allowJavaScriptEvents)
  );
  const requireRootGroups =
    !args ||
    (args.require_root_groups !== false && args.requireRootGroups !== false);
  // Rules the caller wants suppressed (e.g. ['create-without-for-each'] when a
  // single-instance Create is intentional). Accepts disabled_rules / disabledRules.
  const disabledRules = new Set(
    Array.isArray(args && (args.disabled_rules || args.disabledRules))
      ? args.disabled_rules || args.disabledRules
      : []
  );
  const objectOrGroupNames = new Set<string>();
  [scene.getObjects(), project.getObjects()].forEach(container => {
    for (let index = 0; index < container.getObjectsCount(); index++) {
      objectOrGroupNames.add(container.getObjectAt(index).getName());
    }
    const groups = container.getObjectGroups();
    for (let index = 0; index < groups.count(); index++) {
      objectOrGroupNames.add(groups.getAt(index).getName());
    }
  });
  const issues = [];
  // Track each Group's color to flag default/unset colors and color collisions
  // between distinct Groups (different Groups must use different colors).
  const groupColorsByKey = {};
  // Default GroupEvent color in GDevelop core (GroupEvent.cpp): rgb(74,176,228).
  const DEFAULT_GROUP_COLOR = '74;176;228';

  const references = collectEventReferences(target.eventsList);
  references.forEach(reference => {
    const event = reference.event;
    const eventType = event.getType();
    const eventPath = formatEventPath(reference.path);

    if (
      requireRootGroups &&
      reference.path.length === 1 &&
      eventType !== 'BuiltinCommonInstructions::Group'
    ) {
      issues.push({
        severity: 'error',
        type: 'root-event-not-group',
        eventPath,
        eventType,
        suggestion:
          'Root-level gameplay events must be moved into a semantic Group with wrap_events_in_group or move_events_to_group.',
      });
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
          'Use standard GDevelop events/instructions unless the user explicitly requested JavaScript.',
      });
    }

    if (eventType === 'BuiltinCommonInstructions::Group') {
      const groupEvent = gd.asGroupEvent(event);
      const groupName = groupEvent.getName();
      if (!groupName) {
        issues.push({
          severity: 'warning',
          type: 'empty-group-name',
          eventPath,
          suggestion:
            'Rename the Group with a semantic name such as Initialization, Player input, Enemy behavior, UI, Audio, or Scoring.',
        });
      }

      // Record the Group's color and flag the default/unset color. Distinct
      // Groups must use distinct colors (checked for collisions after the loop).
      const colorKey = `${groupEvent.getBackgroundColorR()};${groupEvent.getBackgroundColorG()};${groupEvent.getBackgroundColorB()}`;
      if (colorKey === DEFAULT_GROUP_COLOR) {
        issues.push({
          severity: 'warning',
          type: 'group-default-color',
          eventPath,
          groupName: groupName || undefined,
          suggestion:
            'Set an explicit, distinct color for this Group (create_group/wrap_events_in_group accept color: { r, g, b }, or use rename_group). The default blue (74;176;228) is treated as unset.',
        });
      }
      if (!groupColorsByKey[colorKey]) groupColorsByKey[colorKey] = [];
      groupColorsByKey[colorKey].push({
        eventPath,
        groupName: groupName || undefined,
      });
    }

    // Heuristic: a Standard event that Creates an object while also picking an
    // object in its conditions usually intends "for each picked instance, create
    // one" — but a Standard event's Create runs only ONCE (for a single picked
    // instance). This is a common silent bug (e.g. only one enemy fires). Suggest
    // a ForEach wrapper. Low-noise: only fires for Standard events with a Create
    // action AND at least one condition referencing an object.
    if (eventType === 'BuiltinCommonInstructions::Standard') {
      const { conditions, actions } = getEventInstructions(event);

      // Flag Or/And/Not conditions with no sub-instructions. This is what a
      // wrong-key mistake (children under "conditions" instead of
      // "subInstructions") looks like AFTER the bad JSON was already written: an
      // empty logical condition that matches nothing.
      conditions.forEach((condition, conditionIndex) => {
        if (
          (condition.type === 'BuiltinCommonInstructions::Or' ||
            condition.type === 'BuiltinCommonInstructions::And' ||
            condition.type === 'BuiltinCommonInstructions::Not') &&
          (condition.subInstructionsCount || 0) === 0
        ) {
          issues.push({
            severity: 'error',
            type: 'empty-logical-condition',
            eventPath,
            instructionType: condition.type,
            conditionIndex,
            suggestion: `${
              condition.type
            } at condition ${conditionIndex} has no sub-conditions — it matches nothing. This usually means the child conditions were written under the wrong key; put them in a "subInstructions" array and re-write the events.`,
          });
        }
      });

      const hasCreateAction = actions.some(
        action =>
          action.type === 'Create' ||
          action.type === 'CreateByName' ||
          action.type === 'CreateObject'
      );
      const conditionPicksObject = conditions.some(
        condition =>
          condition.type === 'CollisionNP' ||
          condition.type === 'Distance' ||
          condition.type === 'PosX' ||
          condition.type === 'PosY' ||
          condition.type === 'SourisSurObjet' ||
          condition.type === 'EstTouche' ||
          /Animation|Variable.*Objet|VarObjet/i.test(condition.type)
      );
      const pickedObjectNames = new Set<string>();
      conditions.forEach(condition => {
        condition.parameters.forEach(parameter => {
          if (objectOrGroupNames.has(parameter)) {
            pickedObjectNames.add(parameter);
          }
        });
      });
      const isAlreadyScopedByParentForEach = Array.from(pickedObjectNames).some(
        objectName => reference.inheritedForEachObjects.has(objectName)
      );
      const collisionPicksObjects = conditions.some(
        condition =>
          condition.type === 'CollisionNP' ||
          condition.type === 'EstEnCollision'
      );
      if (
        hasCreateAction &&
        conditionPicksObject &&
        !isAlreadyScopedByParentForEach &&
        !disabledRules.has('create-without-for-each')
      ) {
        issues.push({
          severity: collisionPicksObjects ? 'info' : 'warning',
          type: 'create-without-for-each',
          eventPath,
          pickedObjectNames: Array.from(pickedObjectNames),
          inheritedForEachObjects: Array.from(
            reference.inheritedForEachObjects
          ),
          suggestion:
            (collisionPicksObjects
              ? 'A collision condition narrows the picked instances and a single impact Create is commonly intentional. Use a For Each only when every picked collider must create its own object. '
              : 'This Standard event creates one object after picking instances. If every picked instance must create one (for example, every enemy fires), wrap the event in a For Each. ') +
            'Suppress this advisory with disabled_rules: ["create-without-for-each"] after confirming the intended cardinality.',
          // Concrete fix the caller can apply: re-author this event as the body
          // of a ForEach over the picked object type (BuiltinCommonInstructions::
          // ForEach with `object` set), keeping the same conditions/actions.
          suggestedFix: {
            action: 'wrap-in-for-each',
            eventPath,
            note:
              'Replace this Standard event with a ForEach event (type "BuiltinCommonInstructions::ForEach", set its `object` to the picked object) whose sub-events are this event\'s conditions/actions. See the "For-each-object event" example in gdevelop_get_events_json_examples.',
          },
        });
      }
    }
  });

  // Flag colors shared by two or more distinct Groups (including the default
  // color): different Groups must use different colors for readability.
  Object.keys(groupColorsByKey).forEach(colorKey => {
    const groups = groupColorsByKey[colorKey];
    if (groups.length > 1) {
      issues.push({
        severity: 'warning',
        type: 'group-duplicate-color',
        color: colorKey,
        groups,
        suggestion: `${
          groups.length
        } Groups share the color ${colorKey}. Give each Group a distinct color with rename_group (or set color: { r, g, b } when creating them).`,
      });
    }
  });

  // Timer lint (#19): a scene timer that is compared (CompareTimer/Timer/
  // TimerPaused) but never started with ResetTimer is ALWAYS false and fails
  // silently. Scan every instruction list (conditions + actions, recursively
  // into subInstructions) across all events, collecting started vs compared
  // timer names, then flag compared-but-never-started.
  if (!disabledRules.has('timer-compared-but-never-started')) {
    const startedTimers = new Set();
    const comparedTimers = new Map(); // name -> example eventPath
    // Parameter index holding the timer NAME, per timer instruction type.
    const TIMER_NAME_PARAM_INDEX = {
      ResetTimer: 1,
      PauseTimer: 1,
      UnPauseTimer: 1,
      RemoveTimer: 1,
      CompareTimer: 1,
      TimerPaused: 1,
      Timer: 2, // deprecated condition
    };
    const recordInstruction = (instruction, eventPath) => {
      const type = instruction.getType();
      const nameIndex = TIMER_NAME_PARAM_INDEX[type];
      if (
        nameIndex !== undefined &&
        instruction.getParametersCount() > nameIndex
      ) {
        const rawName = instruction.getParameter(nameIndex).getPlainString();
        // Timer names are quoted string/identifier literals; strip quotes.
        const timerName = rawName.replace(/^"+|"+$/g, '').trim();
        if (timerName) {
          if (type === 'ResetTimer') {
            startedTimers.add(timerName);
          } else if (type === 'CompareTimer' || type === 'Timer') {
            if (!comparedTimers.has(timerName))
              comparedTimers.set(timerName, eventPath);
          }
        }
      }
    };
    const walkInstructions = (instructionsList, eventPath) => {
      for (let i = 0; i < instructionsList.size(); i++) {
        const instruction = instructionsList.get(i);
        recordInstruction(instruction, eventPath);
        const sub = instruction.getSubInstructions
          ? instruction.getSubInstructions()
          : null;
        if (sub && sub.size()) walkInstructions(sub, eventPath);
      }
    };
    references.forEach(reference => {
      const event = reference.event;
      const eventPath = formatEventPath(reference.path);
      const eventType = event.getType();
      if (eventType === 'BuiltinCommonInstructions::Standard') {
        const standardEvent = gd.asStandardEvent(event);
        walkInstructions(standardEvent.getConditions(), eventPath);
        walkInstructions(standardEvent.getActions(), eventPath);
      } else if (eventType === 'BuiltinCommonInstructions::While') {
        const whileEvent = gd.asWhileEvent(event);
        walkInstructions(whileEvent.getWhileConditions(), eventPath);
        walkInstructions(whileEvent.getConditions(), eventPath);
        walkInstructions(whileEvent.getActions(), eventPath);
      }
    });
    comparedTimers.forEach((eventPath, timerName) => {
      if (!startedTimers.has(timerName)) {
        issues.push({
          severity: 'warning',
          type: 'timer-compared-but-never-started',
          eventPath,
          timerName,
          suggestion: `The scene timer "${timerName}" is compared (CompareTimer) but never started with a ResetTimer action anywhere in this scene. CompareTimer is ALWAYS false until the timer is started, so this logic silently never fires. Add a "Start (or reset) a scene timer" (ResetTimer) action for "${timerName}" — typically once at scene start or when the timed behavior begins.`,
        });
      }
    });
  }

  // Group-as-operand warning (a known per-instance footgun): when an instruction
  // operates on an OBJECT GROUP and changes an object variable or tests a
  // collision, the picking semantics across the group's members are easy to get
  // wrong (e.g. "PlayerBullet in collision with Enemies → subtract Enemies.hp"
  // may not behave per-member as intended). Flag it so the author verifies, and
  // suggests using a ForEach over a single object type when in doubt.
  if (!disabledRules.has('group-objectvar-or-collision')) {
    // Collect object GROUP names (scene + global).
    const groupNames = new Set();
    [scene.getObjects(), project.getObjects()].forEach(container => {
      const groups = container.getObjectGroups();
      for (let i = 0; i < groups.count(); i++) {
        groupNames.add(groups.getAt(i).getName());
      }
    });
    if (groupNames.size) {
      // Instruction type → object-parameter indexes that, when a group, are
      // fragile for per-instance variable/collision semantics.
      const OBJECT_VAR_TYPES = new Set([
        'ModVarObjet',
        'SetObjectVariable',
        'ModVarObjetTxt',
        'SetObjectVariableAsString',
      ]);
      const COLLISION_TYPES = new Set(['CollisionNP', 'EstEnCollision']);
      const flagged = new Set();
      const scanForGroupOperand = (instruction, eventPath) => {
        const type = instruction.getType();
        const isVar = OBJECT_VAR_TYPES.has(type);
        const isCollision = COLLISION_TYPES.has(type);
        if (!isVar && !isCollision) return;
        // Object params are at index 0 (and index 2 for collision: object B).
        const indexes = isCollision ? [0, 2] : [0];
        indexes.forEach(idx => {
          if (instruction.getParametersCount() <= idx) return;
          const value = instruction.getParameter(idx).getPlainString();
          if (groupNames.has(value)) {
            const key = `${eventPath}:${type}:${value}`;
            if (flagged.has(key)) return;
            flagged.add(key);
            issues.push({
              severity: 'warning',
              type: 'group-objectvar-or-collision',
              eventPath,
              instructionType: type,
              groupName: value,
              suggestion: `This ${
                isCollision ? 'collision' : 'object-variable'
              } instruction operates on the object GROUP "${value}". Group operands do not always behave per-member as expected (a known footgun for things like "bullet hits Enemies → change Enemies.hp"). VERIFY this picks/affects the intended instances; if it does not, wrap the logic in a ForEach over a single object type, or split the group into concrete object types. Suppress with disabled_rules: ["group-objectvar-or-collision"] once verified.`,
            });
          }
        });
      };
      references.forEach(reference => {
        const event = reference.event;
        const eventPath = formatEventPath(reference.path);
        const eventType = event.getType();
        const walk = list => {
          for (let i = 0; i < list.size(); i++) {
            const instr = list.get(i);
            scanForGroupOperand(instr, eventPath);
            const sub = instr.getSubInstructions
              ? instr.getSubInstructions()
              : null;
            if (sub && sub.size()) walk(sub);
          }
        };
        if (eventType === 'BuiltinCommonInstructions::Standard') {
          const standardEvent = gd.asStandardEvent(event);
          walk(standardEvent.getConditions());
          walk(standardEvent.getActions());
        } else if (eventType === 'BuiltinCommonInstructions::While') {
          const whileEvent = gd.asWhileEvent(event);
          walk(whileEvent.getWhileConditions());
          walk(whileEvent.getConditions());
          walk(whileEvent.getActions());
        }
      });
    }
  }

  return {
    success: true,
    valid: !issues.some(issue => issue.severity === 'error'),
    ...getSceneEventsTargetIdentity(target),
    eventsCount: references.length,
    disabledRules: Array.from(disabledRules),
    issues,
  };
};

export const createGroup = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const rootEventsList = target.eventsList;
  const parentTarget = args.parent_event || args.parentEvent;
  let parentList = rootEventsList;
  let parentEventPath = null;
  if (parentTarget) {
    const parentReference = getSingleEventReference(
      rootEventsList,
      parentTarget,
      'parent event'
    );
    if (!parentReference.event.canHaveSubEvents()) {
      throw new Error('Parent event cannot have sub-events.');
    }
    parentList = parentReference.event.getSubEvents();
    parentEventPath = formatEventPath(parentReference.path);
  }

  const insertIndex =
    typeof args.insert_index === 'number' && Number.isFinite(args.insert_index)
      ? Math.max(0, Math.min(parentList.getEventsCount(), args.insert_index))
      : parentList.getEventsCount();
  const event = parentList.insertNewEvent(
    project,
    'BuiltinCommonInstructions::Group',
    insertIndex
  );
  applyGroupProperties(event, args);
  // Give the new group a distinct color automatically when none was provided,
  // so the caller avoids a separate recolor step and the per-group distinct-color
  // lint passes by construction.
  if (!args.color)
    autoAssignDistinctGroupColor(gd.asGroupEvent(event), rootEventsList);
  notifyEventsChanged(target, callbacks);

  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    parentEventPath,
    group: summarizeEventReference({
      event,
      parentList,
      index: insertIndex,
      path: parentEventPath
        ? [...parseEventPath(parentEventPath), insertIndex]
        : [insertIndex],
    }),
  };
};

export const renameGroup = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const newGroupName = getRequiredString(args, 'new_group_name');
  const target = resolveSceneEventsTarget(project, args);
  const groupReference = getGroupReference(target.eventsList, args);
  gd.asGroupEvent(groupReference.event).setName(newGroupName);
  applyGroupProperties(groupReference.event, args);
  notifyEventsChanged(target, callbacks);

  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    group: summarizeEventReference(groupReference),
  };
};

export const wrapEventsInGroup = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const rootEventsList = target.eventsList;
  const references = getTargetEventReferences(rootEventsList, args);
  const parentList = references[0].parentList;
  const parentPath = references[0].path.slice(0, -1).join('.');

  references.forEach(reference => {
    if (reference.parentList !== parentList) {
      throw new Error('wrap_events_in_group requires sibling target events.');
    }
    if (reference.path.slice(0, -1).join('.') !== parentPath) {
      throw new Error('wrap_events_in_group requires sibling target events.');
    }
  });

  const serializedEvents = references
    .sort((left, right) => left.index - right.index)
    .map(reference => serializeEventPreservingStableId(reference.event));
  const insertionIndex = Math.min(
    ...references.map(reference => reference.index)
  );

  references
    .slice()
    .sort((left, right) => right.index - left.index)
    .forEach(reference => reference.parentList.removeEvent(reference.event));

  const groupEvent = parentList.insertNewEvent(
    project,
    'BuiltinCommonInstructions::Group',
    insertionIndex
  );
  applyGroupProperties(groupEvent, args);
  if (!args.color)
    autoAssignDistinctGroupColor(gd.asGroupEvent(groupEvent), rootEventsList);
  const groupSubEvents = gd.asGroupEvent(groupEvent).getSubEvents();
  insertSerializedEvents(project, groupSubEvents, serializedEvents, 0);
  notifyEventsChanged(target, callbacks);

  const groupPath = [...references[0].path.slice(0, -1), insertionIndex];
  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    wrappedCount: serializedEvents.length,
    group: summarizeEventReference({
      event: groupEvent,
      parentList,
      index: insertionIndex,
      path: groupPath,
    }),
    serializedEvents: serializeToJSObject(target.eventsList),
  };
};

export const moveEventsToGroup = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const rootEventsList = target.eventsList;
  const groupReference = getGroupReference(rootEventsList, args);
  const targetReferences = getTargetEventReferences(rootEventsList, args);

  targetReferences.forEach(reference => {
    if (
      reference.path.join('.') === groupReference.path.join('.') ||
      hasPathPrefix(reference.path, groupReference.path)
    ) {
      throw new Error('Cannot move a group or its sub-events into itself.');
    }
  });

  const serializedEvents = targetReferences
    .slice()
    .sort((left, right) => {
      const leftOrder = targetReferences.indexOf(left);
      const rightOrder = targetReferences.indexOf(right);
      return leftOrder - rightOrder;
    })
    .map(reference => serializeEventPreservingStableId(reference.event));
  targetReferences
    .slice()
    .sort((left, right) => comparePathsDescending(left.path, right.path))
    .forEach(reference => reference.parentList.removeEvent(reference.event));

  const groupEvent = gd.asGroupEvent(groupReference.event);
  const subEvents = groupEvent.getSubEvents();
  const insertIndex =
    typeof args.insert_index === 'number' && Number.isFinite(args.insert_index)
      ? Math.max(0, Math.min(subEvents.getEventsCount(), args.insert_index))
      : subEvents.getEventsCount();
  insertSerializedEvents(project, subEvents, serializedEvents, insertIndex);
  notifyEventsChanged(target, callbacks);

  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    movedCount: serializedEvents.length,
    group: summarizeEventReference(groupReference),
    serializedEvents: serializeToJSObject(target.eventsList),
  };
};

export const ensureSceneEventIds = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const sceneName = target.scene.getName();
  const prefix =
    getOptionalString(args, 'id_prefix') ||
    getOptionalString(args, 'idPrefix') ||
    `mcp-${sceneName}`;
  const references = collectEventReferences(target.eventsList);
  const existingIds = new Set(
    references
      .map(reference => reference.event.getAiGeneratedEventId())
      .filter(Boolean)
  );
  const assigned = [];

  references.forEach(reference => {
    if (reference.event.getAiGeneratedEventId()) return;
    const baseId = `${prefix}-${reference.path.join('-')}`;
    let id = baseId;
    let suffix = 2;
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }
    reference.event.setAiGeneratedEventId(id);
    existingIds.add(id);
    assigned.push({
      eventPath: formatEventPath(reference.path),
      aiGeneratedEventId: id,
    });
  });

  if (assigned.length) notifyEventsChanged(target, callbacks);
  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    assignedCount: assigned.length,
    assigned,
  };
};

export const replaceSceneEventsFromFile = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const eventsJsonFile = getRequiredString(args, 'events_json_file');
  if (!fs) {
    throw new Error('Filesystem access is not available.');
  }
  const resolvedEventsJsonFile = resolveProjectRelativeFile(
    project,
    eventsJsonFile
  );
  if (!fs.existsSync(resolvedEventsJsonFile)) {
    throw new Error(
      `Events JSON file not found: "${eventsJsonFile}"${
        resolvedEventsJsonFile !== eventsJsonFile
          ? ` (resolved to "${resolvedEventsJsonFile}")`
          : ''
      }.`
    );
  }

  const eventsJson = fs.readFileSync(resolvedEventsJsonFile, 'utf8');
  let parsedEvents;
  try {
    parsedEvents = JSON.parse(eventsJson);
  } catch (error) {
    throw new Error(`Invalid events JSON file: ${error.message}`);
  }
  if (!Array.isArray(parsedEvents)) {
    throw new Error('events_json_file must contain a JSON array of events.');
  }

  // Structural check on the raw JSON (catches Or/And/Not children placed under
  // the wrong key, which unserialization would silently drop — the data-loss
  // bug). Block the write if found.
  const structuralIssues = collectSerializedEventJsonIssues(
    parsedEvents
  ).filter(issue => issue.severity === 'error');
  if (structuralIssues.length) {
    throw new Error(
      `Events JSON file has structural problems that would lose data on write: ${JSON.stringify(
        structuralIssues
      )}`
    );
  }

  // Count sub-instructions in the input so we can confirm none were dropped by
  // the round-trip through the serializer.
  const countSubInstructionsInJson = (events: Array<any>): number => {
    let total = 0;
    const visitInstruction = instruction => {
      if (!instruction || typeof instruction !== 'object') return;
      const sub = Array.isArray(instruction.subInstructions)
        ? instruction.subInstructions
        : [];
      total += sub.length;
      sub.forEach(visitInstruction);
    };
    const visitEvents = list => {
      if (!Array.isArray(list)) return;
      list.forEach(event => {
        if (!event || typeof event !== 'object') return;
        (event.conditions || []).forEach(visitInstruction);
        (event.actions || []).forEach(visitInstruction);
        (event.whileConditions || []).forEach(visitInstruction);
        if (Array.isArray(event.events)) visitEvents(event.events);
      });
    };
    visitEvents(events);
    return total;
  };
  const inputSubInstructionsCount = countSubInstructionsInJson(parsedEvents);

  const dryRun = !!(args && (args.dry_run === true || args.dryRun === true));
  const validationEventsList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      validationEventsList,
      parsedEvents,
      'unserializeFrom',
      project
    );
    const validationErrors = scanEventsListForValidationErrors({
      project,
      eventsList: validationEventsList,
      layout: target.scene,
      lifecycleFunction: target.eventsFunction,
      lifecycleFunctionName: target.lifecycleFunctionName,
      externalEventsName: target.externalEventsName,
    });
    if (validationErrors.length) {
      throw new Error(
        `Events JSON file failed validation: ${JSON.stringify(
          validationErrors
        )}`
      );
    }

    // Count sub-instructions actually present AFTER unserialization to confirm
    // the round-trip preserved them.
    const writtenSubInstructionsCount = countSubInstructionsInList(
      validationEventsList
    );

    // dry_run: validate + render the would-be result, but DO NOT write.
    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        ...getSceneEventsTargetIdentity(target),
        wouldWriteEventsCount: validationEventsList.getEventsCount(),
        inputSubInstructionsCount,
        writtenSubInstructionsCount,
        subInstructionsPreserved:
          writtenSubInstructionsCount === inputSubInstructionsCount,
        eventsAsText: renderNonTranslatedEventsAsText({
          eventsList: validationEventsList,
        }),
        note:
          writtenSubInstructionsCount === inputSubInstructionsCount
            ? 'Dry run only — nothing written. Re-run without dry_run to apply.'
            : 'Dry run: sub-instruction count changed after parsing — some nested conditions/actions would be lost. Fix the JSON before writing.',
      };
    }

    target.eventsList.clear();
    target.eventsList.insertEvents(
      validationEventsList,
      0,
      validationEventsList.getEventsCount(),
      0
    );
  } finally {
    validationEventsList.delete();
  }

  notifyEventsChanged(target, callbacks);
  const writtenSubInstructionsCount = countSubInstructionsInList(
    target.eventsList
  );
  const result = {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    eventsCount: target.eventsList.getEventsCount(),
    // Write-back verification: confirm nested sub-instructions survived the
    // write. If these differ, nested conditions/actions were lost.
    inputSubInstructionsCount,
    writtenSubInstructionsCount,
    subInstructionsPreserved:
      writtenSubInstructionsCount === inputSubInstructionsCount,
  };

  if (args && (args.summary_only === true || args.summaryOnly === true)) {
    return result;
  }

  return {
    ...result,
    eventsAsText: renderNonTranslatedEventsAsText({
      eventsList: target.eventsList,
    }),
    serializedEvents: serializeToJSObject(target.eventsList),
    serializedEventsJson: serializeToJSON(target.eventsList),
  };
};

const collectInstructionReferences = (
  instructionsList: gdInstructionsList,
  path: Array<number> = []
): Array<{| instruction: gdInstruction, path: Array<number> |}> => {
  const references = [];
  for (let index = 0; index < instructionsList.size(); index++) {
    const instruction = instructionsList.get(index);
    const instructionPath = [...path, index];
    references.push({ instruction, path: instructionPath });
    const subInstructions = instruction.getSubInstructions
      ? instruction.getSubInstructions()
      : null;
    if (subInstructions && subInstructions.size()) {
      references.push(
        ...collectInstructionReferences(subInstructions, instructionPath)
      );
    }
  }
  return references;
};

const getPatchableInstructionLists = (
  event: gdBaseEvent,
  instructionKind: string
): Array<gdInstructionsList> => {
  const eventType = event.getType();
  const wantsAction =
    instructionKind === 'action' || instructionKind === 'actions';
  const wantsCondition =
    instructionKind === 'condition' || instructionKind === 'conditions';
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    const standard = gd.asStandardEvent(event);
    if (wantsAction) return [standard.getActions()];
    if (wantsCondition) return [standard.getConditions()];
  }
  if (eventType === 'BuiltinCommonInstructions::While') {
    const whileEvent = gd.asWhileEvent(event);
    if (wantsAction) return [whileEvent.getActions()];
    if (wantsCondition)
      return [whileEvent.getWhileConditions(), whileEvent.getConditions()];
  }
  return [];
};

const instructionContainsParameter = (
  instruction: gdInstruction,
  expected: string
): boolean => {
  for (let index = 0; index < instruction.getParametersCount(); index++) {
    if (instruction.getParameter(index).getPlainString() === expected) {
      return true;
    }
  }
  return false;
};

export const patchSceneEventInstruction = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const eventsTarget = resolveSceneEventsTarget(project, args);
  const instructionKind =
    getOptionalString(args, 'instruction_kind') ||
    getOptionalString(args, 'instructionKind') ||
    'action';
  const instructionType =
    getOptionalString(args, 'instruction_type') ||
    getOptionalString(args, 'instructionType');
  if (!instructionType) {
    throw new Error('Missing instruction_type.');
  }
  const replacementParameters = Array.isArray(args.parameters)
    ? args.parameters.map(parameter => String(parameter))
    : null;
  if (!replacementParameters) {
    throw new Error('Missing parameters array.');
  }

  const eventReference = getSingleEventReference(
    eventsTarget.eventsList,
    args.event || args.event_id || args.eventId || args,
    'event'
  );
  const objectName =
    getOptionalString(args, 'object_name') ||
    getOptionalString(args, 'objectName');
  const instructionLists = getPatchableInstructionLists(
    eventReference.event,
    instructionKind
  );
  const matches = [];
  instructionLists.forEach(list => {
    collectInstructionReferences(list).forEach(reference => {
      const instruction = reference.instruction;
      if (instruction.getType() !== instructionType) return;
      if (objectName && !instructionContainsParameter(instruction, objectName))
        return;
      matches.push(reference);
    });
  });

  if (!matches.length) {
    throw new Error(
      `No ${instructionKind} instruction "${instructionType}" matched the event target.`
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous instruction target: ${
        matches.length
      } instructions matched. Add object_name or narrow the event target.`
    );
  }

  const targetInstruction = matches[0].instruction;
  const beforeParameters = [];
  for (let index = 0; index < targetInstruction.getParametersCount(); index++) {
    beforeParameters.push(
      targetInstruction.getParameter(index).getPlainString()
    );
  }
  targetInstruction.setParametersCount(replacementParameters.length);
  replacementParameters.forEach((parameter, index) => {
    targetInstruction.setParameter(index, parameter);
  });
  notifyEventsChanged(eventsTarget, callbacks);

  const result = {
    success: true,
    ...getSceneEventsTargetIdentity(eventsTarget),
    eventPath: formatEventPath(eventReference.path),
    aiGeneratedEventId: eventReference.event.getAiGeneratedEventId() || null,
    instructionKind,
    instructionType,
    instructionPath: matches[0].path,
    before: {
      type: targetInstruction.getType(),
      parameters: beforeParameters,
    },
    after: {
      type: targetInstruction.getType(),
      parameters: replacementParameters,
    },
  };

  if (args && (args.summary_only === true || args.summaryOnly === true)) {
    return result;
  }

  return {
    ...result,
    serializedEvents: serializeToJSObject(eventsTarget.eventsList),
    eventsAsText: renderNonTranslatedEventsAsText({
      eventsList: eventsTarget.eventsList,
    }),
  };
};

const formatSignedExpressionOffset = (offset: number): string => {
  if (!Number.isFinite(offset) || offset === 0) return '';
  return offset > 0 ? `+${offset}` : String(offset);
};

export const attachObjectToObjectTop = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const followerName =
    getOptionalString(args, 'follower_object_name') ||
    getOptionalString(args, 'followerObjectName') ||
    getOptionalString(args, 'ui_object_name') ||
    getOptionalString(args, 'uiObjectName');
  const targetName =
    getOptionalString(args, 'target_object_name') ||
    getOptionalString(args, 'targetObjectName');
  if (!followerName) throw new Error('Missing follower_object_name.');
  if (!targetName) throw new Error('Missing target_object_name.');
  const xOffset =
    typeof args.x_offset === 'number' && Number.isFinite(args.x_offset)
      ? args.x_offset
      : typeof args.xOffset === 'number' && Number.isFinite(args.xOffset)
      ? args.xOffset
      : 0;
  const yOffset =
    typeof args.y_offset === 'number' && Number.isFinite(args.y_offset)
      ? args.y_offset
      : typeof args.yOffset === 'number' && Number.isFinite(args.yOffset)
      ? args.yOffset
      : 0;
  const insertIndex =
    typeof args.insert_index === 'number' && Number.isFinite(args.insert_index)
      ? Math.max(
          0,
          Math.min(target.eventsList.getEventsCount(), args.insert_index)
        )
      : target.eventsList.getEventsCount();
  const eventId =
    getOptionalString(args, 'ai_generated_event_id') ||
    getOptionalString(args, 'aiGeneratedEventId') ||
    getOptionalString(args, 'event_id') ||
    `${followerName}-follow-${targetName}-top`;
  const xExpression = `${targetName}.CenterX()-${followerName}.Width()/2${formatSignedExpressionOffset(
    xOffset
  )}`;
  const yExpression = `${targetName}.Y()-${followerName}.Height()${formatSignedExpressionOffset(
    yOffset
  )}`;
  const event = gd.asStandardEvent(
    target.eventsList.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Standard',
      insertIndex
    )
  );
  event.setAiGeneratedEventId(eventId);
  const addAction = (type, parameters) => {
    const instruction = new gd.Instruction();
    instruction.setType(type);
    instruction.setParametersCount(parameters.length);
    parameters.forEach((parameter, index) => {
      instruction.setParameter(index, parameter);
    });
    event.getActions().insert(instruction, event.getActions().size());
    instruction.delete();
  };
  const actions = [
    { type: 'SetX', parameters: [followerName, '=', xExpression] },
    { type: 'SetY', parameters: [followerName, '=', yExpression] },
  ];
  actions.forEach(action => addAction(action.type, action.parameters));
  notifyEventsChanged(target, callbacks);

  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    followerObjectName: followerName,
    targetObjectName: targetName,
    eventPath: formatEventPath([insertIndex]),
    aiGeneratedEventId: eventId,
    expressions: {
      x: xExpression,
      y: yExpression,
    },
    actions,
    note:
      'Added a standard event that centers the follower object horizontally above the target top each frame.',
  };
};

export const inspectGameplayRules = (
  project: gdProject,
  args: Object
): Object => {
  const target = resolveSceneEventsTarget(project, args);
  const serializedEvents = serializeToJSObject(target.eventsList);
  const serializedText = JSON.stringify(serializedEvents);
  const issues = [];
  const checks = [];
  const topAttachments = Array.isArray(args.top_attachments)
    ? args.top_attachments
    : Array.isArray(args.topAttachments)
    ? args.topAttachments
    : [];
  topAttachments.forEach((attachment, index) => {
    const follower =
      attachment &&
      (attachment.follower_object_name ||
        attachment.followerObjectName ||
        attachment.ui_object_name ||
        attachment.uiObjectName);
    const target =
      attachment &&
      (attachment.target_object_name || attachment.targetObjectName);
    const hasX =
      follower &&
      target &&
      serializedText.includes('SetX') &&
      serializedText.includes(follower) &&
      serializedText.includes(`${target}.CenterX()`);
    const hasY =
      follower &&
      target &&
      serializedText.includes('SetY') &&
      serializedText.includes(follower) &&
      serializedText.includes(`${target}.Y()`);
    const ok = !!(hasX && hasY);
    checks.push({
      kind: 'top_attachment',
      index,
      followerObjectName: follower,
      targetObjectName: target,
      ok,
      hasX,
      hasY,
    });
    if (!ok) {
      issues.push({
        severity: 'warning',
        rule: 'top_attachment',
        index,
        message:
          'Expected X/Y follow actions were not both found. Use attach_object_to_object_top or inspect the event formulas.',
      });
    }
  });

  const stateMachines = Array.isArray(args.state_machines)
    ? args.state_machines
    : Array.isArray(args.stateMachines)
    ? args.stateMachines
    : [];
  stateMachines.forEach((machine, index) => {
    const objectName = machine && (machine.object_name || machine.objectName);
    const variableName =
      machine && (machine.variable_name || machine.variableName || 'State');
    const states = Array.isArray(machine && machine.states)
      ? machine.states.map(String)
      : [];
    const mentionedStates = states.filter(state =>
      serializedText.includes(state)
    );
    const variableMentioned =
      serializedText.includes(variableName) &&
      (!objectName || serializedText.includes(objectName));
    const ok =
      variableMentioned && (!states.length || mentionedStates.length > 0);
    checks.push({
      kind: 'state_machine',
      index,
      objectName,
      variableName,
      states,
      mentionedStates,
      ok,
    });
    if (!ok) {
      issues.push({
        severity: 'warning',
        rule: 'state_machine',
        index,
        message:
          'The requested state machine variable/states were not found in scene events. This is a semantic heuristic; inspect events before relying on the behavior.',
      });
    }
  });

  return {
    success: true,
    ...getSceneEventsTargetIdentity(target),
    checks,
    issues,
    ok: issues.length === 0,
    note:
      'Gameplay rule checks are semantic heuristics over event instructions. They catch likely missing follow/state-machine wiring, but runtime behavior still needs preview verification.',
  };
};

const normalizeEventForSemanticComparison = (event: any): Array<any> => {
  if (!event || typeof event !== 'object') return [event];
  if (event.type === 'BuiltinCommonInstructions::Group') {
    return (event.events || []).flatMap(normalizeEventForSemanticComparison);
  }

  const normalized = {};
  Object.keys(event)
    .filter(
      key =>
        key !== 'aiGeneratedEventId' &&
        key !== 'folded' &&
        key !== 'colorR' &&
        key !== 'colorG' &&
        key !== 'colorB' &&
        key !== 'name' &&
        key !== 'source' &&
        key !== 'creationTime' &&
        key !== 'parameters'
    )
    .sort()
    .forEach(key => {
      if (key === 'events' && Array.isArray(event.events)) {
        normalized.events = event.events.flatMap(
          normalizeEventForSemanticComparison
        );
      } else {
        normalized[key] = event[key];
      }
    });
  return [normalized];
};

export const compareSceneEventsSemantics = (
  project: gdProject,
  args: Object
): Object => {
  const beforeEventsJson = getRequiredString(args, 'before_events_json');
  const afterEventsJson = getRequiredString(args, 'after_events_json');
  const beforeEvents = JSON.parse(beforeEventsJson);
  const afterEvents = JSON.parse(afterEventsJson);
  if (!Array.isArray(beforeEvents) || !Array.isArray(afterEvents)) {
    throw new Error('before_events_json and after_events_json must be arrays.');
  }
  const beforeNormalized = beforeEvents.flatMap(
    normalizeEventForSemanticComparison
  );
  const afterNormalized = afterEvents.flatMap(
    normalizeEventForSemanticComparison
  );
  const beforeNormalizedJson = JSON.stringify(beforeNormalized);
  const afterNormalizedJson = JSON.stringify(afterNormalized);

  return {
    success: true,
    equivalent: beforeNormalizedJson === afterNormalizedJson,
    beforeNormalized,
    afterNormalized,
  };
};
