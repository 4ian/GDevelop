// @flow
import { unserializeFromJSObject } from '../Utils/Serializer';
import {
  type AiGeneratedEventChange,
  type AiGeneratedEventUndeclaredVariable,
  type AiGeneratedEventMissingObjectBehavior,
} from '../Utils/GDevelopServices/Generation';
import { mapFor } from '../Utils/MapFor';
import { isBehaviorDefaultCapability } from '../BehaviorsEditor/EnumerateBehaviorsMetadata';

const gd: libGDevelop = global.gd;

/**
 * Recursively searches for an event with the given aiGeneratedEventId in the events list.
 * Returns the path to the event as an array of indices, or null if not found.
 */
const findEventPathByAiGeneratedEventId = (
  eventsList: gdEventsList,
  targetId: string,
  currentPath: Array<number> = []
): Array<number> | null => {
  for (let i = 0; i < eventsList.getEventsCount(); i++) {
    const event = eventsList.getEventAt(i);
    const eventPath = [...currentPath, i];

    if (event.getAiGeneratedEventId() === targetId) {
      return eventPath;
    }

    if (event.canHaveSubEvents()) {
      const subEvents = event.getSubEvents();
      const foundPath = findEventPathByAiGeneratedEventId(
        subEvents,
        targetId,
        eventPath
      );
      if (foundPath) {
        return foundPath;
      }
    }
  }
  return null;
};

/**
 * Parses an event path string (e.g., "event-0.1.2") into an array of 0-based indices (e.g., [0, 1, 2]).
 * Throws an error for invalid formats or non-positive indices.
 */
const parseEventPath = (pathString: string): Array<number> => {
  const originalPathString = pathString;
  if (!pathString.startsWith('event-')) {
    // Fallback for paths that might not have the "event-" prefix, like "1.2.3"
    // This is a lenient parsing, primary expectation is "event-" prefix.
    const partsNoPrefix = pathString.split('.');
    if (
      partsNoPrefix.length > 0 &&
      partsNoPrefix.every(s => s !== '' && !isNaN(parseInt(s, 10)))
    ) {
      console.warn(
        `Event path string "${originalPathString}" does not start with "event-". Parsed as direct indices.`
      );
    } else {
      throw new Error(
        `Invalid event path string format: "${originalPathString}". Expected "event-X.Y.Z" or "X.Y.Z".`
      );
    }
  } else {
    pathString = pathString.substring('event-'.length);
  }

  const parts = pathString.split('.');
  if (
    parts.length === 0 ||
    parts.some(s => s === '' || isNaN(parseInt(s, 10)))
  ) {
    throw new Error(
      `Invalid event path string content: "${originalPathString}". Ensure numbers are separated by dots.`
    );
  }
  return parts.map(s => {
    const num = parseInt(s, 10);
    if (num < 0) {
      throw new Error(
        `Event path indices must be positive in string "${originalPathString}", but found ${num}.`
      );
    }
    return num;
  });
};

/**
 * Navigates an event tree to find the parent EventsList and the 0-based index
 * for an event targeted by the given path.
 */
const getParentListAndIndex = (
  rootEventsList: gdEventsList,
  path: Array<number>,
  operationTypeForErrorMessage: 'access' | 'insertion'
): { parentList: gdEventsList, eventIndexInParentList: number } => {
  if (path.length === 0) {
    throw new Error('Path cannot be empty for getParentListAndIndex.');
  }

  let currentList = rootEventsList;
  const pathForErrorMessage = path.join('.');

  for (let i = 0; i < path.length - 1; i++) {
    const eventIndex = path[i];
    if (eventIndex < 0 || eventIndex >= currentList.getEventsCount()) {
      throw new Error(
        `Invalid event path: index ${eventIndex} out of bounds at depth ${i +
          1} (max: ${currentList.getEventsCount() -
          1}). Path: ${pathForErrorMessage}`
      );
    }
    const event = currentList.getEventAt(eventIndex);
    if (!event.canHaveSubEvents()) {
      throw new Error(
        `Event at path segment ${i +
          1} (index ${eventIndex}) cannot have sub-events. Path: ${pathForErrorMessage}`
      );
    }
    currentList = event.getSubEvents();
  }

  const finalIndex = path[path.length - 1];
  if (finalIndex < 0) {
    throw new Error(
      `Invalid event path: final index ${finalIndex} is negative. Path: ${pathForErrorMessage}.`
    );
  }

  // For insertion, index can be equal to count (to append). For access, it must be less than count.
  if (
    operationTypeForErrorMessage === 'insertion' &&
    finalIndex > currentList.getEventsCount()
  ) {
    throw new Error(
      `Invalid event path for insertion: final index ${finalIndex} is out of bounds. Max allowed for insertion: ${currentList.getEventsCount()}. Path: ${pathForErrorMessage}`
    );
  } else if (
    operationTypeForErrorMessage === 'access' &&
    finalIndex >= currentList.getEventsCount()
  ) {
    throw new Error(
      `Invalid event path for access: final index ${finalIndex} is out of bounds. Max allowed for access: ${currentList.getEventsCount() -
        1}. Path: ${pathForErrorMessage}`
    );
  }

  return { parentList: currentList, eventIndexInParentList: finalIndex };
};

/**
 * Retrieves an event at a specific path from a root EventsList.
 */
const getEventByPath = (
  rootEventsList: gdEventsList,
  path: Array<number>
): gdBaseEvent => {
  const { parentList, eventIndexInParentList } = getParentListAndIndex(
    rootEventsList,
    path,
    'access'
  );
  // Bounds check already done by getParentListAndIndex for 'access'
  return parentList.getEventAt(eventIndexInParentList);
};

type EventOperationType =
  | 'delete'
  | 'insert'
  | 'insertAsSub'
  | 'replaceKeepSubEvents'
  | 'insertActionsConditionsAtEnd'
  | 'insertActionsConditionsAtStart'
  | 'replaceAllActions'
  | 'replaceAllConditions';
type EventOperation = {|
  type: EventOperationType,
  path: Array<number>,
  eventsToInsert?: gdEventsList,
|};

/**
 * Copy instructions from source list to target list at the specified position.
 */
const copyInstructions = (
  source: gdInstructionsList,
  target: gdInstructionsList,
  position: number
): void => {
  target.insertInstructions(source, 0, source.size(), position);
};

/**
 * Helper to get conditions from an event if it supports them.
 */
const getEventConditions = (event: gdBaseEvent): gdInstructionsList | null => {
  const eventType = event.getType();
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    return gd.asStandardEvent(event).getConditions();
  } else if (eventType === 'BuiltinCommonInstructions::While') {
    return gd.asWhileEvent(event).getConditions();
  } else if (eventType === 'BuiltinCommonInstructions::Repeat') {
    return gd.asRepeatEvent(event).getConditions();
  } else if (eventType === 'BuiltinCommonInstructions::ForEach') {
    return gd.asForEachEvent(event).getConditions();
  } else if (eventType === 'BuiltinCommonInstructions::ForEachChildVariable') {
    return gd.asForEachChildVariableEvent(event).getConditions();
  }
  return null;
};

/**
 * Helper to get actions from an event if it supports them.
 */
const getEventActions = (event: gdBaseEvent): gdInstructionsList | null => {
  const eventType = event.getType();
  if (eventType === 'BuiltinCommonInstructions::Standard') {
    return gd.asStandardEvent(event).getActions();
  } else if (eventType === 'BuiltinCommonInstructions::While') {
    return gd.asWhileEvent(event).getActions();
  } else if (eventType === 'BuiltinCommonInstructions::Repeat') {
    return gd.asRepeatEvent(event).getActions();
  } else if (eventType === 'BuiltinCommonInstructions::ForEach') {
    return gd.asForEachEvent(event).getActions();
  } else if (eventType === 'BuiltinCommonInstructions::ForEachChildVariable') {
    return gd.asForEachChildVariableEvent(event).getActions();
  }
  return null;
};

/**
 * Helper to get while conditions from a While event.
 */
const getEventWhileConditions = (
  event: gdBaseEvent
): gdInstructionsList | null => {
  if (event.getType() === 'BuiltinCommonInstructions::While') {
    return gd.asWhileEvent(event).getWhileConditions();
  }
  return null;
};

const comparePathsReverseLexicographically = (
  p1: Array<number>,
  p2: Array<number>
): number => {
  const maxLength = Math.max(p1.length, p2.length);
  for (let i = 0; i < maxLength; i++) {
    const val1 = i < p1.length ? p1[i] : -1;
    const val2 = i < p2.length ? p2[i] : -1;
    if (val1 > val2) return -1;
    if (val1 < val2) return 1;
  }
  return 0;
};

export const applyEventsChanges = (
  project: gdProject,
  sceneEvents: gdEventsList,
  eventOperationsInput: Array<AiGeneratedEventChange>,
  aiGeneratedEventId: string
): void => {
  const operations: Array<EventOperation> = [];

  eventOperationsInput.forEach(change => {
    const { operationName, operationTargetEvent, generatedEvents } = change;
    let parsedPath: Array<number> | null = null;
    let localEventsToInsert: gdEventsList | null = null;

    try {
      if (operationTargetEvent) {
        // First, try to parse as a path string (e.g., "event-0.1.2" or "0.1.2")
        try {
          parsedPath = parseEventPath(operationTargetEvent);
        } catch (pathParseError) {
          // If parsing as path fails, treat it as an aiGeneratedEventId
          parsedPath = findEventPathByAiGeneratedEventId(
            sceneEvents,
            operationTargetEvent
          );
          if (!parsedPath) {
            console.warn(
              `Could not find event with aiGeneratedEventId "${operationTargetEvent}" and could not parse as path. Skipping operation "${operationName}".`
            );
            return;
          }
        }
      } else if (operationName !== 'insert_at_end') {
        // Path is generally required, except for 'insert_at_end'.
        console.warn(
          `Skipping operation "${operationName}" due to missing operationTargetEvent path.`
        );
        return;
      }

      if (generatedEvents && operationName !== 'delete_event') {
        const eventsListContent = JSON.parse(generatedEvents);
        localEventsToInsert = new gd.EventsList();
        unserializeFromJSObject(
          localEventsToInsert,
          eventsListContent,
          'unserializeFrom',
          project
        );
        if (localEventsToInsert.isEmpty()) {
          console.warn(
            `Generated events for operation "${operationName}" (path: ${operationTargetEvent ||
              'N/A'}) are empty. Insertion might not add any events.`
          );
        }
        mapFor(0, localEventsToInsert.getEventsCount(), i => {
          if (!localEventsToInsert) return;

          const event = localEventsToInsert.getEventAt(i);
          event.setAiGeneratedEventId(aiGeneratedEventId);
        });
      }

      switch (operationName) {
        case 'insert_and_replace_event':
        case 'replace_entire_event_and_sub_events':
          if (!parsedPath) {
            console.warn(
              `Skipping "${operationName}" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({ type: 'delete', path: parsedPath });
          operations.push({
            type: 'insert',
            path: parsedPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          // localEventsToInsert is now "owned" by the 'insert' operation,
          // it should not be deleted here in the switch case.
          break;
        case 'replace_event_but_keep_existing_sub_events':
          if (!parsedPath) {
            console.warn(
              `Skipping "replace_event_but_keep_existing_sub_events" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({
            type: 'replaceKeepSubEvents',
            path: parsedPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'insert_before_event':
          if (!parsedPath) {
            console.warn(
              `Skipping "insert_before_event" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({
            type: 'insert',
            path: parsedPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'insert_after_event':
          if (!parsedPath) {
            console.warn(
              `Skipping "insert_after_event" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          // Insert after means we insert at path[last] + 1
          const insertAfterPath = [...parsedPath];
          insertAfterPath[insertAfterPath.length - 1] += 1;
          operations.push({
            type: 'insert',
            path: insertAfterPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'insert_as_sub_event':
          if (!parsedPath) {
            console.warn(
              `Skipping "insert_as_sub_event" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({
            type: 'insertAsSub',
            path: parsedPath, // This path is to the parent event
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'insert_actions_conditions_at_end':
          if (!parsedPath) {
            console.warn(
              `Skipping "insert_actions_conditions_at_end" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({
            type: 'insertActionsConditionsAtEnd',
            path: parsedPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'insert_actions_conditions_at_start':
          if (!parsedPath) {
            console.warn(
              `Skipping "insert_actions_conditions_at_start" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({
            type: 'insertActionsConditionsAtStart',
            path: parsedPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'replace_all_actions':
          if (!parsedPath) {
            console.warn(
              `Skipping "replace_all_actions" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({
            type: 'replaceAllActions',
            path: parsedPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'replace_all_conditions':
          if (!parsedPath) {
            console.warn(
              `Skipping "replace_all_conditions" due to missing or invalid path.`
            );
            if (localEventsToInsert) localEventsToInsert.delete();
            return;
          }
          operations.push({
            type: 'replaceAllConditions',
            path: parsedPath,
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        case 'delete_event':
          if (!parsedPath) {
            console.warn(
              `Skipping "delete_event" due to missing or invalid path.`
            );
            // No localEventsToInsert expected or created for delete_event.
            return;
          }
          // Ensure no events were accidentally parsed for delete.
          if (localEventsToInsert) {
            console.warn(
              'Internal warning: localEventsToInsert was populated for a "delete_event". Cleaning up.'
            );
            localEventsToInsert.delete();
          }
          operations.push({ type: 'delete', path: parsedPath });
          break;
        case 'insert_at_end':
          // Path for insert_at_end is synthetic, representing the end of the root list.
          operations.push({
            type: 'insert',
            path: [sceneEvents.getEventsCount()],
            eventsToInsert: localEventsToInsert || undefined,
          });
          break;
        default:
          console.warn(
            `Unknown operationName: "${operationName}". Skipping operation.`
          );
          // Clean up localEventsToInsert if it was created for an unknown operation
          if (localEventsToInsert) localEventsToInsert.delete();
      }
    } catch (e) {
      console.warn(
        `Error processing event change (operation: "${operationName}", path: "${operationTargetEvent ||
          'N/A'}"): ${e.message}. Skipping this change.`
      );
      // Ensure cleanup if parsing/unserialization failed mid-way
      if (localEventsToInsert) {
        localEventsToInsert.delete();
      }
    }
  });

  operations.sort((opA, opB) => {
    const pathComparison = comparePathsReverseLexicographically(
      opA.path,
      opB.path
    );
    if (pathComparison !== 0) return pathComparison;
    if (opA.type === 'delete' && opB.type !== 'delete') return -1;
    if (opA.type !== 'delete' && opB.type === 'delete') return 1;
    return 0;
  });

  operations.forEach(op => {
    const pathForLog = op.path.join('.');
    try {
      if (op.type === 'delete') {
        const { parentList, eventIndexInParentList } = getParentListAndIndex(
          sceneEvents,
          op.path,
          'access' // Deleting an existing event, so 'access'
        );
        // Check already done by getParentListAndIndex for 'access'
        parentList.removeEventAt(eventIndexInParentList);
      } else if (op.type === 'insert') {
        const {
          parentList,
          eventIndexInParentList: insertionIndex,
        } = getParentListAndIndex(
          sceneEvents,
          op.path,
          'insertion' // Path is for insertion point
        );
        // Check already done by getParentListAndIndex for 'insertion'
        if (op.eventsToInsert && !op.eventsToInsert.isEmpty()) {
          parentList.insertEvents(
            op.eventsToInsert,
            0,
            op.eventsToInsert.getEventsCount(),
            insertionIndex
          );
        } else {
          console.warn(
            `Insert operation for path [${pathForLog}] skipped: no events to insert or events list is empty.`
          );
        }
      } else if (op.type === 'insertAsSub') {
        // op.path is the path to the PARENT event
        const parentEvent = getEventByPath(sceneEvents, op.path);
        if (!parentEvent.canHaveSubEvents()) {
          console.warn(
            `Cannot insert sub-events: Event at path [${pathForLog}] does not support sub-events. Skipping.`
          );
          return;
        }
        const subEventsList = parentEvent.getSubEvents();
        if (op.eventsToInsert && !op.eventsToInsert.isEmpty()) {
          subEventsList.insertEvents(
            op.eventsToInsert,
            0,
            op.eventsToInsert.getEventsCount(),
            subEventsList.getEventsCount() // Insert at the end of sub-events
          );
        } else {
          console.warn(
            `InsertAsSub operation for parent path [${pathForLog}] skipped: no events to insert or events list is empty.`
          );
        }
      } else if (op.type === 'replaceKeepSubEvents') {
        // Replace the event but keep existing sub-events
        const { parentList, eventIndexInParentList } = getParentListAndIndex(
          sceneEvents,
          op.path,
          'access'
        );
        const targetEvent = parentList.getEventAt(eventIndexInParentList);

        // Get existing sub-events from target event before replacement
        let existingSubEvents: gdEventsList | null = null;
        if (targetEvent.canHaveSubEvents()) {
          existingSubEvents = new gd.EventsList();
          const targetSubEvents = targetEvent.getSubEvents();
          existingSubEvents.insertEvents(
            targetSubEvents,
            0,
            targetSubEvents.getEventsCount(),
            0
          );
        }

        // Delete the target event
        parentList.removeEventAt(eventIndexInParentList);

        // Insert new events from generated events
        if (op.eventsToInsert && !op.eventsToInsert.isEmpty()) {
          parentList.insertEvents(
            op.eventsToInsert,
            0,
            op.eventsToInsert.getEventsCount(),
            eventIndexInParentList
          );

          // If there were existing sub-events, add them to the first new event
          if (existingSubEvents && existingSubEvents.getEventsCount() > 0) {
            const firstNewEvent = parentList.getEventAt(eventIndexInParentList);
            if (firstNewEvent.canHaveSubEvents()) {
              const newSubEvents = firstNewEvent.getSubEvents();
              // Insert existing sub-events at the beginning
              newSubEvents.insertEvents(
                existingSubEvents,
                0,
                existingSubEvents.getEventsCount(),
                0
              );
            }
          }
        }

        if (existingSubEvents) {
          existingSubEvents.delete();
        }
      } else if (op.type === 'insertActionsConditionsAtEnd') {
        // Copy actions/conditions from generated event(s) to target event at end
        const targetEvent = getEventByPath(sceneEvents, op.path);
        const eventsToInsert = op.eventsToInsert;
        if (eventsToInsert && !eventsToInsert.isEmpty()) {
          for (let i = 0; i < eventsToInsert.getEventsCount(); i++) {
            const sourceEvent = eventsToInsert.getEventAt(i);

            // Copy conditions
            const sourceConditions = getEventConditions(sourceEvent);
            const targetConditions = getEventConditions(targetEvent);
            if (sourceConditions && targetConditions) {
              copyInstructions(
                sourceConditions,
                targetConditions,
                targetConditions.size()
              );
            }

            // Copy actions
            const sourceActions = getEventActions(sourceEvent);
            const targetActions = getEventActions(targetEvent);
            if (sourceActions && targetActions) {
              copyInstructions(
                sourceActions,
                targetActions,
                targetActions.size()
              );
            }

            // Copy while conditions if both are While events
            const sourceWhileConditions = getEventWhileConditions(sourceEvent);
            const targetWhileConditions = getEventWhileConditions(targetEvent);
            if (sourceWhileConditions && targetWhileConditions) {
              copyInstructions(
                sourceWhileConditions,
                targetWhileConditions,
                targetWhileConditions.size()
              );
            }
          }
        }
      } else if (op.type === 'insertActionsConditionsAtStart') {
        // Copy actions/conditions from generated event(s) to target event at start
        const targetEvent = getEventByPath(sceneEvents, op.path);
        const eventsToInsert = op.eventsToInsert;
        if (eventsToInsert && !eventsToInsert.isEmpty()) {
          // Process in reverse order so that insertion at start maintains order
          for (let i = eventsToInsert.getEventsCount() - 1; i >= 0; i--) {
            const sourceEvent = eventsToInsert.getEventAt(i);

            // Copy conditions at start
            const sourceConditions = getEventConditions(sourceEvent);
            const targetConditions = getEventConditions(targetEvent);
            if (sourceConditions && targetConditions) {
              copyInstructions(sourceConditions, targetConditions, 0);
            }

            // Copy actions at start
            const sourceActions = getEventActions(sourceEvent);
            const targetActions = getEventActions(targetEvent);
            if (sourceActions && targetActions) {
              copyInstructions(sourceActions, targetActions, 0);
            }

            // Copy while conditions at start if both are While events
            const sourceWhileConditions = getEventWhileConditions(sourceEvent);
            const targetWhileConditions = getEventWhileConditions(targetEvent);
            if (sourceWhileConditions && targetWhileConditions) {
              copyInstructions(sourceWhileConditions, targetWhileConditions, 0);
            }
          }
        }
      } else if (op.type === 'replaceAllActions') {
        // Clear target event actions and replace with generated event(s) actions
        const targetEvent = getEventByPath(sceneEvents, op.path);
        const targetActions = getEventActions(targetEvent);
        if (targetActions) {
          targetActions.clear();
          const eventsToInsert = op.eventsToInsert;
          if (eventsToInsert && !eventsToInsert.isEmpty()) {
            for (let i = 0; i < eventsToInsert.getEventsCount(); i++) {
              const sourceEvent = eventsToInsert.getEventAt(i);
              const sourceActions = getEventActions(sourceEvent);
              if (sourceActions) {
                copyInstructions(
                  sourceActions,
                  targetActions,
                  targetActions.size()
                );
              }
            }
          }
        }
      } else if (op.type === 'replaceAllConditions') {
        // Clear target event conditions and replace with generated event(s) conditions
        const targetEvent = getEventByPath(sceneEvents, op.path);
        const eventsToInsert = op.eventsToInsert;
        const targetConditions = getEventConditions(targetEvent);
        if (targetConditions) {
          targetConditions.clear();
          if (eventsToInsert && !eventsToInsert.isEmpty()) {
            for (let i = 0; i < eventsToInsert.getEventsCount(); i++) {
              const sourceEvent = eventsToInsert.getEventAt(i);
              const sourceConditions = getEventConditions(sourceEvent);
              if (sourceConditions) {
                copyInstructions(
                  sourceConditions,
                  targetConditions,
                  targetConditions.size()
                );
              }
            }
          }
        }

        // Also replace while conditions if both are While events
        const targetWhileConditions = getEventWhileConditions(targetEvent);
        if (targetWhileConditions) {
          targetWhileConditions.clear();
          if (eventsToInsert && !eventsToInsert.isEmpty()) {
            for (let i = 0; i < eventsToInsert.getEventsCount(); i++) {
              const sourceEvent = eventsToInsert.getEventAt(i);
              const sourceWhileConditions = getEventWhileConditions(
                sourceEvent
              );
              if (sourceWhileConditions) {
                copyInstructions(
                  sourceWhileConditions,
                  targetWhileConditions,
                  targetWhileConditions.size()
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(
        `Error applying event operation type ${
          op.type
        } for path [${pathForLog}]:`,
        error
      );
    } finally {
      // Clean up the gd.EventsList associated with this operation, if any.
      if (op.eventsToInsert) {
        op.eventsToInsert.delete();
      }
    }
  });
};

export const addUndeclaredVariables = ({
  project,
  scene,
  undeclaredVariables,
}: {|
  project: gdProject,
  scene: gdLayout,
  undeclaredVariables: Array<AiGeneratedEventUndeclaredVariable>,
|}) => {
  undeclaredVariables.forEach(variable => {
    const { name, type, requiredScope } = variable;
    let newVariable = null;
    if (requiredScope === 'global') {
      if (!project.getVariables().has(name)) {
        newVariable = project.getVariables().insertNew(name, 0);
      }
    } else if (requiredScope === 'scene' || requiredScope === 'none') {
      if (!scene.getVariables().has(name)) {
        newVariable = scene.getVariables().insertNew(name, 0);
      }
    } else {
      console.warn(
        `Unknown requiredScope for undeclared variable: ${name}. Skipping.`
      );
    }

    if (newVariable && type) {
      const lowerCaseType = type.toLowerCase();
      newVariable.castTo(
        lowerCaseType === 'string'
          ? 'String'
          : lowerCaseType === 'boolean'
          ? 'Boolean'
          : lowerCaseType === 'array'
          ? 'Array'
          : lowerCaseType === 'structure'
          ? 'Structure'
          : 'Number'
      );
    }
  });
};

export const addObjectUndeclaredVariables = ({
  project,
  scene,
  objectName,
  undeclaredVariables,
}: {|
  project: gdProject,
  scene: gdLayout,
  objectName: string,
  undeclaredVariables: Array<AiGeneratedEventUndeclaredVariable>,
|}) => {
  const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
    project,
    scene
  );

  const setupVariable = (variable: gdVariable, type: string | null) => {
    if (!type) {
      return;
    }
    const lowerCaseType = type.toLowerCase();
    variable.castTo(
      lowerCaseType === 'string'
        ? 'String'
        : lowerCaseType === 'boolean'
        ? 'Boolean'
        : lowerCaseType === 'array'
        ? 'Array'
        : lowerCaseType === 'structure'
        ? 'Structure'
        : 'Number'
    );
  };

  const addVariableForObjectsOfGroup = (
    group: gdObjectGroup,
    undeclaredVariable: AiGeneratedEventUndeclaredVariable
  ) => {
    const groupVariablesContainer = gd.ObjectVariableHelper.mergeVariableContainers(
      projectScopedContainers.getObjectsContainersList(),
      group
    );
    const originalSerializedVariables = new gd.SerializerElement();
    groupVariablesContainer.serializeTo(originalSerializedVariables);

    const variable = groupVariablesContainer.insertNew(
      undeclaredVariable.name,
      0
    );
    setupVariable(variable, undeclaredVariable.type);

    const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
      originalSerializedVariables,
      groupVariablesContainer
    );
    originalSerializedVariables.delete();

    gd.WholeProjectRefactorer.applyRefactoringForGroupVariablesContainer(
      project,
      project.getObjects(),
      scene.getObjects(),
      scene.getInitialInstances(),
      groupVariablesContainer,
      group,
      changeset,
      originalSerializedVariables
    );
  };

  undeclaredVariables.forEach(undeclaredVariable => {
    if (
      projectScopedContainers
        .getObjectsContainersList()
        .hasObjectOrGroupWithVariableNamed(objectName, undeclaredVariable.name)
    ) {
      // Variable already exists, no need to add it.
      return;
    }

    if (scene.getObjects().hasObjectNamed(objectName)) {
      const object = scene.getObjects().getObject(objectName);
      const variable = object
        .getVariables()
        .insertNew(undeclaredVariable.name, 0);
      setupVariable(variable, undeclaredVariable.type);
    } else if (
      scene
        .getObjects()
        .getObjectGroups()
        .has(objectName)
    ) {
      const group = scene
        .getObjects()
        .getObjectGroups()
        .get(objectName);

      addVariableForObjectsOfGroup(group, undeclaredVariable);
    } else if (project.getObjects().hasObjectNamed(objectName)) {
      const object = project.getObjects().getObject(objectName);
      const variable = object
        .getVariables()
        .insertNew(undeclaredVariable.name, 0);
      setupVariable(variable, undeclaredVariable.type);
    } else if (
      project
        .getObjects()
        .getObjectGroups()
        .has(objectName)
    ) {
      const group = project
        .getObjects()
        .getObjectGroups()
        .get(objectName);

      addVariableForObjectsOfGroup(group, undeclaredVariable);
    }
  });
};

export const addMissingObjectBehaviors = ({
  project,
  scene,
  objectName,
  missingBehaviors,
}: {|
  project: gdProject,
  scene: gdLayout,
  objectName: string,
  missingBehaviors: Array<AiGeneratedEventMissingObjectBehavior>,
|}) => {
  const projectScopedContainers = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
    project,
    scene
  );

  const objectOrGroupBehaviorNames = projectScopedContainers
    .getObjectsContainersList()
    .getBehaviorsOfObject(objectName, true)
    .toJSArray();

  const addBehaviorToObject = (
    object: gdObject,
    behaviorName: string,
    behaviorType: string
  ) => {
    if (object.hasBehaviorNamed(behaviorName)) {
      return;
    }

    gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors(
      project,
      object,
      behaviorType,
      behaviorName
    );
  };

  const addBehaviorToObjectGroup = (
    group: gdObjectGroup,
    behaviorName: string,
    behaviorType: string
  ) => {
    const objectNames = group.getAllObjectsNames().toJSArray();
    objectNames.forEach(objectName => {
      if (scene.getObjects().hasObjectNamed(objectName)) {
        const object = scene.getObjects().getObject(objectName);
        addBehaviorToObject(object, behaviorName, behaviorType);
      } else if (project.getObjects().hasObjectNamed(objectName)) {
        const object = project.getObjects().getObject(objectName);
        addBehaviorToObject(object, behaviorName, behaviorType);
      }
    });
  };

  missingBehaviors.forEach(missingBehavior => {
    if (objectOrGroupBehaviorNames.includes(missingBehavior.name)) {
      // This behavior is already present, no need to add it.
      return;
    }

    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      project.getCurrentPlatform(),
      missingBehavior.type
    );

    if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
      console.warn(
        `Unknown behavior type: "${missingBehavior.type}". Skipping.`
      );
      return;
    }

    if (isBehaviorDefaultCapability(behaviorMetadata)) {
      console.warn(
        `Behavior "${missingBehavior.name}" of type "${
          missingBehavior.type
        }" is a default capability and cannot be added to object "${objectName}".`
      );
      return;
    }

    if (scene.getObjects().hasObjectNamed(objectName)) {
      const object = scene.getObjects().getObject(objectName);
      addBehaviorToObject(object, missingBehavior.name, missingBehavior.type);
    } else if (
      scene
        .getObjects()
        .getObjectGroups()
        .has(objectName)
    ) {
      const group = scene
        .getObjects()
        .getObjectGroups()
        .get(objectName);

      addBehaviorToObjectGroup(
        group,
        missingBehavior.name,
        missingBehavior.type
      );
    } else if (project.getObjects().hasObjectNamed(objectName)) {
      const object = project.getObjects().getObject(objectName);
      addBehaviorToObject(object, missingBehavior.name, missingBehavior.type);
    } else if (
      project
        .getObjects()
        .getObjectGroups()
        .has(objectName)
    ) {
      const group = project
        .getObjects()
        .getObjectGroups()
        .get(objectName);

      addBehaviorToObjectGroup(
        group,
        missingBehavior.name,
        missingBehavior.type
      );
    }
  });

  scene.updateBehaviorsSharedData(project);
};
