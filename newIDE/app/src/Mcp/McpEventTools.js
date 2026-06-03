// @flow
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';
import { scanEventsListForValidationErrors } from '../Utils/EventsValidationScanner';
import optionalRequire from '../Utils/OptionalRequire';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');

type EventToolCallbacks = {|
  onSceneEventsModifiedOutsideEditor?: Function,
|};

type EventReference = {|
  event: gdBaseEvent,
  parentList: gdEventsList,
  index: number,
  path: Array<number>,
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
  parentPath: Array<number> = []
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
    });
    if (event.canHaveSubEvents()) {
      references.push(...collectEventReferences(event.getSubEvents(), path));
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
    });
  }
  return instructions;
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

const summarizeEventReference = (reference: EventReference): Object => {
  const { event, path } = reference;
  const eventType = event.getType();
  const instructions = getEventInstructions(event);
  const summary = {
    eventPath: formatEventPath(path),
    path,
    type: eventType,
    aiGeneratedEventId: event.getAiGeneratedEventId() || null,
    conditions: instructions.conditions,
    actions: instructions.actions,
    serializedEvent: serializeToJSObject(event),
  };

  if (eventType === 'BuiltinCommonInstructions::Group') {
    summary.groupName = gd.asGroupEvent(event).getName();
    summary.subEventsCount = event.getSubEvents().getEventsCount();
  }
  if (eventType === 'BuiltinCommonInstructions::Comment') {
    summary.comment = summary.serializedEvent.comment || '';
  }

  return summary;
};

const serializeEventPreservingStableId = (event: gdBaseEvent): Object => {
  const serializedEvent = serializeToJSObject(event);
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
  const serializedEventText = JSON.stringify(serializeToJSObject(event));
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
  scene: gdLayout,
  callbacks: EventToolCallbacks
) => {
  if (callbacks.onSceneEventsModifiedOutsideEditor) {
    callbacks.onSceneEventsModifiedOutsideEditor({
      scene,
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
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const limit =
    typeof args.limit === 'number' && Number.isFinite(args.limit)
      ? Math.max(1, Math.min(100, Math.floor(args.limit)))
      : 50;
  const matches = findEventReferences(scene.getEvents(), args)
    .slice(0, limit)
    .map(summarizeEventReference);

  return {
    success: true,
    sceneName,
    count: matches.length,
    matches,
  };
};

export const createGroup = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const rootEventsList = scene.getEvents();
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
  notifyEventsChanged(scene, callbacks);

  return {
    success: true,
    sceneName,
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
  const sceneName = getRequiredString(args, 'scene_name');
  const newGroupName = getRequiredString(args, 'new_group_name');
  const scene = getScene(project, sceneName);
  const groupReference = getGroupReference(scene.getEvents(), args);
  gd.asGroupEvent(groupReference.event).setName(newGroupName);
  applyGroupProperties(groupReference.event, args);
  notifyEventsChanged(scene, callbacks);

  return {
    success: true,
    sceneName,
    group: summarizeEventReference(groupReference),
  };
};

export const wrapEventsInGroup = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const rootEventsList = scene.getEvents();
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
  const groupSubEvents = gd.asGroupEvent(groupEvent).getSubEvents();
  insertSerializedEvents(project, groupSubEvents, serializedEvents, 0);
  notifyEventsChanged(scene, callbacks);

  const groupPath = [...references[0].path.slice(0, -1), insertionIndex];
  return {
    success: true,
    sceneName,
    wrappedCount: serializedEvents.length,
    group: summarizeEventReference({
      event: groupEvent,
      parentList,
      index: insertionIndex,
      path: groupPath,
    }),
    serializedEvents: serializeToJSObject(scene.getEvents()),
  };
};

export const moveEventsToGroup = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const rootEventsList = scene.getEvents();
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
  notifyEventsChanged(scene, callbacks);

  return {
    success: true,
    sceneName,
    movedCount: serializedEvents.length,
    group: summarizeEventReference(groupReference),
    serializedEvents: serializeToJSObject(scene.getEvents()),
  };
};

export const ensureSceneEventIds = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const prefix =
    getOptionalString(args, 'id_prefix') ||
    getOptionalString(args, 'idPrefix') ||
    `mcp-${sceneName}`;
  const references = collectEventReferences(scene.getEvents());
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

  if (assigned.length) notifyEventsChanged(scene, callbacks);
  return {
    success: true,
    sceneName,
    assignedCount: assigned.length,
    assigned,
  };
};

export const replaceSceneEventsFromFile = (
  project: gdProject,
  args: Object,
  callbacks: EventToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const eventsJsonFile = getRequiredString(args, 'events_json_file');
  if (!fs) {
    throw new Error('Filesystem access is not available.');
  }
  if (!fs.existsSync(eventsJsonFile)) {
    throw new Error(`Events JSON file not found: "${eventsJsonFile}".`);
  }

  const eventsJson = fs.readFileSync(eventsJsonFile, 'utf8');
  let parsedEvents;
  try {
    parsedEvents = JSON.parse(eventsJson);
  } catch (error) {
    throw new Error(`Invalid events JSON file: ${error.message}`);
  }
  if (!Array.isArray(parsedEvents)) {
    throw new Error('events_json_file must contain a JSON array of events.');
  }

  const scene = getScene(project, sceneName);
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
      layout: scene,
    });
    if (validationErrors.length) {
      throw new Error(
        `Events JSON file failed validation: ${JSON.stringify(
          validationErrors
        )}`
      );
    }

    scene.getEvents().clear();
    scene
      .getEvents()
      .insertEvents(
        validationEventsList,
        0,
        validationEventsList.getEventsCount(),
        0
      );
  } finally {
    validationEventsList.delete();
  }

  notifyEventsChanged(scene, callbacks);
  const result = {
    success: true,
    sceneName,
    eventsCount: scene.getEvents().getEventsCount(),
  };

  if (args && (args.summary_only === true || args.summaryOnly === true)) {
    return result;
  }

  return {
    ...result,
    eventsAsText: renderNonTranslatedEventsAsText({
      eventsList: scene.getEvents(),
    }),
    serializedEvents: serializeToJSObject(scene.getEvents()),
    serializedEventsJson: serializeToJSON(scene.getEvents()),
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
