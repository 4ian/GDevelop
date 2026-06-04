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

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const nodePath = optionalRequire('path');

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

export const lintSceneEvents = (project: gdProject, args: Object): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
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
  const issues = [];
  // Track each Group's color to flag default/unset colors and color collisions
  // between distinct Groups (different Groups must use different colors).
  const groupColorsByKey = {};
  // Default GroupEvent color in GDevelop core (GroupEvent.cpp): rgb(74,176,228).
  const DEFAULT_GROUP_COLOR = '74;176;228';

  const references = collectEventReferences(scene.getEvents());
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
      if (
        hasCreateAction &&
        conditionPicksObject &&
        !disabledRules.has('create-without-for-each')
      ) {
        issues.push({
          severity: 'warning',
          type: 'create-without-for-each',
          eventPath,
          suggestion:
            'This Standard event creates an object while picking instances in its conditions, but Create runs only once (for a single picked instance). If you want each picked instance to create one (e.g. each enemy fires a bullet), wrap this in a ForEach event over that object. If a single Create is intentional, suppress this with disabled_rules: ["create-without-for-each"].',
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

  return {
    success: true,
    valid: !issues.some(issue => issue.severity === 'error'),
    sceneName,
    eventsCount: references.length,
    issues,
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

  const scene = getScene(project, sceneName);
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
      layout: scene,
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
        sceneName,
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
  const writtenSubInstructionsCount = countSubInstructionsInList(
    scene.getEvents()
  );
  const result = {
    success: true,
    sceneName,
    eventsCount: scene.getEvents().getEventsCount(),
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
