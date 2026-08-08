// @flow
import { serializeToJSObject } from '../Utils/Serializer';
import { type EventsScope } from '../InstructionOrExpression/EventsScope';
import {
  type SelectionState,
  type EventContext,
  type InstructionContextWithEventContext,
  type InstructionsListContext,
  getSelectedEventContexts,
  getSelectedInstructionsContexts,
  getSelectedInstructionsListsContexts,
} from './SelectionHandler';
import { renderNonTranslatedEventsAsText } from './EventsTree/TextRenderer';

const gd: libGDevelop = global.gd;

export type EventsSheetEventPath = Array<number>;
type InstructionListKind =
  | 'conditions'
  | 'actions'
  | 'whileConditions'
  | 'unknown';

export type EventsSheetSelectedEventSnapshot = {|
  eventPath: string | null,
  eventIndexPath: EventsSheetEventPath | null,
  indexInList: number,
  eventType: string,
  aiGeneratedEventId: string,
  canHaveSubEvents: boolean,
  canHaveVariables: boolean,
  disabled: boolean,
  folded: boolean,
  serializedEvent: Object,
  eventAsText: string,
|};

export type EventsSheetSelectedInstructionSnapshot = {|
  eventPath: string | null,
  eventIndexPath: EventsSheetEventPath | null,
  eventType: string,
  isCondition: boolean,
  indexInList: number,
  instructionType: string,
  parameters: Array<string>,
  serializedInstruction: Object,
|};

export type EventsSheetSelectedInstructionListSnapshot = {|
  eventPath: string | null,
  eventIndexPath: EventsSheetEventPath | null,
  listKind: InstructionListKind,
  isCondition: boolean,
  instructionsCount: number,
|};

export type EventsSheetSelectionSnapshot = {|
  selectionProvider: 'EventsSheet',
  isActive: boolean,
  scopeKind:
    | 'scene'
    | 'externalEvents'
    | 'extensionFunction'
    | 'extension'
    | 'project',
  sceneName: string | null,
  externalEventsName: string | null,
  associatedLayoutName: string | null,
  eventsFunctionsExtensionName: string | null,
  eventsBasedBehaviorName: string | null,
  eventsBasedObjectName: string | null,
  eventsFunctionName: string | null,
  sceneLifecycleFunctionName: string | null,
  lastSelectionType: 'event' | 'instruction' | 'instructionList' | null,
  selectedEventPaths: Array<string>,
  selectedEvents: Array<EventsSheetSelectedEventSnapshot>,
  selectedInstructions: Array<EventsSheetSelectedInstructionSnapshot>,
  selectedInstructionLists: Array<EventsSheetSelectedInstructionListSnapshot>,
|};

const formatEventPath = (eventIndexPath: EventsSheetEventPath): string =>
  `event-${eventIndexPath.join('.')}`;

const getObjectName = (object: any): string | null =>
  object ? object.getName() : null;

const findEventIndexPath = (
  eventsList: gdEventsList,
  searchedEvent: gdBaseEvent,
  parentPath: EventsSheetEventPath = []
): EventsSheetEventPath | null => {
  for (let index = 0; index < eventsList.getEventsCount(); index++) {
    const event = eventsList.getEventAt(index);
    const eventIndexPath = [...parentPath, index];
    if (event.ptr === searchedEvent.ptr) {
      return eventIndexPath;
    }

    if (event.canHaveSubEvents()) {
      const foundEventIndexPath = findEventIndexPath(
        event.getSubEvents(),
        searchedEvent,
        eventIndexPath
      );
      if (foundEventIndexPath) return foundEventIndexPath;
    }
  }

  return null;
};

const getEventAsText = (event: gdBaseEvent): string => {
  const temporaryEventsList = new gd.EventsList();
  try {
    temporaryEventsList.insertEvent(event, 0);
    return renderNonTranslatedEventsAsText({
      eventsList: temporaryEventsList,
    });
  } finally {
    temporaryEventsList.delete();
  }
};

const getInstructionParameters = (
  serializedInstruction: Object
): Array<string> => {
  const parameters = ((serializedInstruction: any).parameters: any);
  return Array.isArray(parameters) ? parameters.map(String) : [];
};

const getInstructionListKind = (
  event: gdBaseEvent,
  instrsList: gdInstructionsList,
  isCondition: boolean
): InstructionListKind => {
  const candidateNames: Array<InstructionListKind> = isCondition
    ? ['conditions', 'whileConditions']
    : ['actions'];

  for (const candidateName of candidateNames) {
    try {
      const candidateInstructionsList = event.getInstructionList(candidateName);
      if (
        candidateInstructionsList &&
        candidateInstructionsList.ptr === instrsList.ptr
      ) {
        return candidateName;
      }
    } catch (error) {
      // Some event types don't expose all instruction list names.
    }
  }

  return 'unknown';
};

const findInstructionListContext = (
  eventsList: gdEventsList,
  instrsList: gdInstructionsList,
  isCondition: boolean,
  parentPath: EventsSheetEventPath = []
): {|
  event: gdBaseEvent,
  eventIndexPath: EventsSheetEventPath,
  listKind: InstructionListKind,
|} | null => {
  for (let index = 0; index < eventsList.getEventsCount(); index++) {
    const event = eventsList.getEventAt(index);
    const eventIndexPath = [...parentPath, index];
    const listKind = getInstructionListKind(event, instrsList, isCondition);
    if (listKind !== 'unknown') {
      return {
        event,
        eventIndexPath,
        listKind,
      };
    }

    if (event.canHaveSubEvents()) {
      const foundContext = findInstructionListContext(
        event.getSubEvents(),
        instrsList,
        isCondition,
        eventIndexPath
      );
      if (foundContext) return foundContext;
    }
  }

  return null;
};

const summarizeEventContext = (
  rootEventsList: gdEventsList,
  eventContext: EventContext
): EventsSheetSelectedEventSnapshot => {
  const { event } = eventContext;
  const eventIndexPath = findEventIndexPath(rootEventsList, event);

  return {
    eventPath: eventIndexPath ? formatEventPath(eventIndexPath) : null,
    eventIndexPath,
    indexInList: eventContext.indexInList,
    eventType: event.getType(),
    aiGeneratedEventId: event.getAiGeneratedEventId(),
    canHaveSubEvents: event.canHaveSubEvents(),
    canHaveVariables: event.canHaveVariables(),
    disabled: event.isDisabled(),
    folded: event.isFolded(),
    serializedEvent: serializeToJSObject(event),
    eventAsText: getEventAsText(event),
  };
};

const summarizeInstructionContext = (
  rootEventsList: gdEventsList,
  instructionContext: InstructionContextWithEventContext
): EventsSheetSelectedInstructionSnapshot => {
  const event = instructionContext.eventContext.event;
  const eventIndexPath = findEventIndexPath(rootEventsList, event);
  const serializedInstruction = serializeToJSObject(
    instructionContext.instruction
  );

  return {
    eventPath: eventIndexPath ? formatEventPath(eventIndexPath) : null,
    eventIndexPath,
    eventType: event.getType(),
    isCondition: instructionContext.isCondition,
    indexInList: instructionContext.indexInList,
    instructionType: instructionContext.instruction.getType(),
    parameters: getInstructionParameters(serializedInstruction),
    serializedInstruction,
  };
};

const summarizeInstructionListContext = (
  rootEventsList: gdEventsList,
  instructionsListContext: InstructionsListContext
): EventsSheetSelectedInstructionListSnapshot => {
  const foundContext = findInstructionListContext(
    rootEventsList,
    instructionsListContext.instrsList,
    instructionsListContext.isCondition
  );
  const eventIndexPath = foundContext ? foundContext.eventIndexPath : null;

  return {
    eventPath: eventIndexPath ? formatEventPath(eventIndexPath) : null,
    eventIndexPath,
    listKind: foundContext ? foundContext.listKind : 'unknown',
    isCondition: instructionsListContext.isCondition,
    instructionsCount: instructionsListContext.instrsList.size(),
  };
};

const getScopeKind = (
  scope: EventsScope
):
  | 'scene'
  | 'externalEvents'
  | 'extensionFunction'
  | 'extension'
  | 'project' => {
  if (scope.externalEvents) return 'externalEvents';
  if (scope.layout) return 'scene';
  if (scope.eventsFunction) return 'extensionFunction';
  if (scope.eventsFunctionsExtension) return 'extension';
  return 'project';
};

const getLastSelectionType = (
  selectedEvents: Array<EventsSheetSelectedEventSnapshot>,
  selectedInstructions: Array<EventsSheetSelectedInstructionSnapshot>,
  selectedInstructionLists: Array<EventsSheetSelectedInstructionListSnapshot>
): 'event' | 'instruction' | 'instructionList' | null => {
  if (selectedEvents.length) return 'event';
  if (selectedInstructions.length) return 'instruction';
  if (selectedInstructionLists.length) return 'instructionList';
  return null;
};

export const getEventsSheetSelectionSnapshot = ({
  events,
  selection,
  isActive,
  scope,
}: {|
  events: gdEventsList,
  selection: SelectionState,
  isActive: boolean,
  scope: EventsScope,
|}): EventsSheetSelectionSnapshot => {
  const selectedEvents = getSelectedEventContexts(selection).map(eventContext =>
    summarizeEventContext(events, eventContext)
  );
  const selectedInstructions = getSelectedInstructionsContexts(selection).map(
    instructionContext =>
      summarizeInstructionContext(events, instructionContext)
  );
  const selectedInstructionLists = getSelectedInstructionsListsContexts(
    selection
  ).map(instructionsListContext =>
    summarizeInstructionListContext(events, instructionsListContext)
  );
  const selectedEventPaths = selectedEvents
    .map(selectedEvent => selectedEvent.eventPath)
    .filter(Boolean);

  return {
    selectionProvider: 'EventsSheet',
    isActive,
    scopeKind: getScopeKind(scope),
    sceneName: getObjectName(scope.layout),
    externalEventsName: getObjectName(scope.externalEvents),
    associatedLayoutName: scope.externalEvents
      ? scope.externalEvents.getAssociatedLayout()
      : null,
    eventsFunctionsExtensionName: getObjectName(scope.eventsFunctionsExtension),
    eventsBasedBehaviorName: getObjectName(scope.eventsBasedBehavior),
    eventsBasedObjectName: getObjectName(scope.eventsBasedObject),
    eventsFunctionName: getObjectName(scope.eventsFunction),
    sceneLifecycleFunctionName: scope.sceneLifecycleFunctionName || null,
    lastSelectionType: getLastSelectionType(
      selectedEvents,
      selectedInstructions,
      selectedInstructionLists
    ),
    selectedEventPaths,
    selectedEvents,
    selectedInstructions,
    selectedInstructionLists,
  };
};
