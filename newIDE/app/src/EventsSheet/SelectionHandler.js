// @flow

import values from 'lodash/values';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

export type InstructionsListContext = {|
  isCondition: boolean,
  instrsList: gdInstructionsList,
|};

export type InstructionContext = {|
  isCondition: boolean,
  instrsList: gdInstructionsList,
  instruction: gdInstruction,
  indexInList: number,
|};

export type ParameterContext = {|
  isCondition: boolean,
  instrsList: gdInstructionsList,
  instruction: gdInstruction,
  indexInList: number,
  parameterIndex: number,
  domEvent?: any,
|};

export type VariableDeclarationContext = {|
  variablesContainer: gdVariablesContainer,
  variableName: string,
|};

export type EventContext = {|
  eventsList: gdEventsList,
  event: gdBaseEvent,
  indexInList: number,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
|};

export type InstructionContextWithEventContext = {
  ...InstructionContext,
  eventContext: EventContext,
};

export type SelectionState = {|
  // Arrays are in order of selection (last selected element at the last position).
  selectedInstructions: Array<InstructionContextWithEventContext>,
  selectedInstructionsLists: Array<InstructionsListContext>,
  selectedEvents: Array<EventContext>,
|};

export const getInitialSelection = (): SelectionState => {
  return {
    selectedInstructions: [],
    selectedEvents: [],
    selectedInstructionsLists: [],
  };
};

// The selection can exceptionally contain events that were destroyed on the
// C++ side by a change that did not clear the selection (see
// `onEventsModifiedOutsideEditor`). Calling any method on such an event would
// crash the editor, so all the getters below filter them out.
const isAliveEventContext = (eventContext: EventContext): boolean =>
  !!exceptionallyGuardAgainstDeadObject(eventContext.event);

const getAliveSelectedEventContexts = (
  selection: SelectionState
): Array<EventContext> => selection.selectedEvents.filter(isAliveEventContext);

const getAliveSelectedInstructionContexts = (
  selection: SelectionState
): Array<InstructionContextWithEventContext> =>
  selection.selectedInstructions.filter(({ eventContext }) =>
    isAliveEventContext(eventContext)
  );

export const getSelectedEvents = (
  selection: SelectionState
): Array<gdBaseEvent> => {
  return getAliveSelectedEventContexts(selection).map(
    (eventContext: EventContext) => eventContext.event
  );
};

export const getLastSelectedEvent = (
  selection: SelectionState
): Event | null => {
  const eventContexts = getAliveSelectedEventContexts(selection);
  if (!eventContexts.length) return null;

  return eventContexts[eventContexts.length - 1].event;
};

export const getSelectedEventContexts = (
  selection: SelectionState
): Array<EventContext> => {
  return getAliveSelectedEventContexts(selection);
};

export const getLastSelectedEventContext = (
  selection: SelectionState
): EventContext | null => {
  const eventContexts = getAliveSelectedEventContexts(selection);
  if (!eventContexts.length) return null;

  return eventContexts[eventContexts.length - 1];
};

export const getLastSelectedEventContextWhichCanHaveSubEvents = (
  selection: SelectionState
): EventContext | null => {
  const candidates = getAliveSelectedEventContexts(selection).filter(
    ({ event }) => event.canHaveSubEvents()
  );
  if (!candidates.length) return null;

  return candidates[candidates.length - 1];
};

export const getLastSelectedEventContextWhichCanHaveVariables = (
  selection: SelectionState
): EventContext | null => {
  const candidates = getAliveSelectedEventContexts(selection).filter(
    ({ event }) => event.canHaveVariables()
  );
  if (!candidates.length) return null;

  return candidates[candidates.length - 1];
};

export const getSelectedTopMostOnlyEventContexts = (
  selection: SelectionState
): Array<EventContext> => {
  const selectedEventContexts: Array<EventContext> = values(
    getAliveSelectedEventContexts(selection)
  );

  return selectedEventContexts.filter(eventContext => {
    const isContainedInsideAnotherSelectedEvent = selectedEventContexts.some(
      otherSelectedEventContext => {
        if (otherSelectedEventContext === eventContext) return false;

        if (otherSelectedEventContext.event.canHaveSubEvents()) {
          return otherSelectedEventContext.event
            .getSubEvents()
            .contains(eventContext.event, /*recursive=*/ true);
        }

        return false;
      }
    );

    // Filter out all the selected events that are contained inside another selected event.
    return !isContainedInsideAnotherSelectedEvent;
  });
};

export const getLastSelectedTopMostOnlyEventContext = (
  selection: SelectionState
): EventContext | null => {
  const selectedTopMostOnlyEventContexts = getSelectedTopMostOnlyEventContexts(
    selection
  );
  return selectedTopMostOnlyEventContexts.length
    ? selectedTopMostOnlyEventContexts[
        selectedTopMostOnlyEventContexts.length - 1
      ]
    : null;
};

export const getSelectedInstructions = (
  selection: SelectionState
): Array<gdInstruction> => {
  return getAliveSelectedInstructionContexts(selection).map(
    (instructionContext: InstructionContextWithEventContext) =>
      instructionContext.instruction
  );
};

export const getSelectedInstructionsLocatingEvents = (
  selection: SelectionState
): Array<gdBaseEvent> => {
  return getAliveSelectedInstructionContexts(selection).map(
    (instructionContext: InstructionContextWithEventContext) =>
      instructionContext.eventContext.event
  );
};

export const getSelectedInstructionsContexts = (
  selection: SelectionState
): Array<InstructionContextWithEventContext> => {
  return getAliveSelectedInstructionContexts(selection);
};

export const getSelectedInstructionsListsContexts = (
  selection: SelectionState
): Array<InstructionsListContext> => {
  return selection.selectedInstructionsLists;
};

export const getLastSelectedInstructionContext = (
  selection: SelectionState
): InstructionContextWithEventContext | null => {
  const instructionContexts = getAliveSelectedInstructionContexts(selection);
  return instructionContexts[instructionContexts.length - 1] || null;
};

export const getLastSelectedInstructionEventContextWhichCanHaveSubEvents = (
  selection: SelectionState
): EventContext | null => {
  const candidates = getAliveSelectedInstructionContexts(selection).filter(
    ({ eventContext }) => eventContext.event.canHaveSubEvents()
  );
  if (!candidates.length) return null;

  return candidates[candidates.length - 1].eventContext;
};

export const getLastSelectedInstructionEventContextWhichCanHaveVariables = (
  selection: SelectionState
): EventContext | null => {
  const candidates = getAliveSelectedInstructionContexts(selection).filter(
    ({ eventContext }) => eventContext.event.canHaveVariables()
  );
  if (!candidates.length) return null;

  return candidates[candidates.length - 1].eventContext;
};

export const getLastSelectedInstructionsListsContext = (
  selection: SelectionState
): InstructionsListContext | null => {
  return (
    selection.selectedInstructionsLists[
      selection.selectedInstructionsLists.length - 1
    ] || null
  );
};

export const isEventSelected = (
  selection: SelectionState,
  event: Object
): boolean => {
  return selection.selectedEvents.some(
    selectedEventContext => selectedEventContext.event.ptr === event.ptr
  );
};

export const isInstructionSelected = (
  selection: SelectionState,
  instruction: gdInstruction
): boolean => {
  return selection.selectedInstructions.some(
    selectedInstructionContext =>
      selectedInstructionContext.instruction.ptr === instruction.ptr
  );
};

export const isInstructionsListSelected = (
  selection: SelectionState,
  instructionsList: gdInstructionsList
): boolean => {
  return selection.selectedInstructionsLists.some(
    selectedInstructionsList =>
      selectedInstructionsList.instrsList.ptr === instructionsList.ptr
  );
};

export const hasEventSelected = (selection: SelectionState): boolean => {
  return !!selection.selectedEvents.length;
};

export const hasInstructionSelected = (selection: SelectionState): boolean => {
  return !!selection.selectedInstructions.length;
};

export const hasSelectedAtLeastOneCondition = (
  selection: SelectionState
): boolean => {
  return getSelectedInstructionsContexts(selection).some(instructionContext => {
    return instructionContext.isCondition;
  });
};

export const hasInstructionsListSelected = (
  selection: SelectionState
): boolean => {
  return !!selection.selectedInstructionsLists.length;
};

export const hasSomethingSelected = (selection: SelectionState): boolean => {
  return (
    hasInstructionSelected(selection) ||
    hasInstructionsListSelected(selection) ||
    hasEventSelected(selection)
  );
};

export const clearSelection = (): SelectionState => {
  // $FlowFixMe[incompatible-type]
  return getInitialSelection();
};

export const selectEvent = (
  selection: SelectionState,
  eventContext: EventContext,
  multiSelection: boolean = false
): SelectionState => {
  const event = eventContext.event;
  const alreadySelected = isEventSelected(selection, event);

  if (multiSelection && alreadySelected) {
    return {
      ...selection,
      selectedEvents: selection.selectedEvents.filter(
        selectedEventContext => selectedEventContext.event.ptr !== event.ptr
      ),
    };
  }

  if (alreadySelected) return selection;

  const existingSelection = multiSelection ? selection : clearSelection();
  return {
    ...existingSelection,
    selectedEvents: [...existingSelection.selectedEvents, eventContext],
  };
};

export const selectEvents = (
  eventContexts: Array<EventContext>
): SelectionState => {
  return {
    ...clearSelection(),
    selectedEvents: eventContexts,
  };
};

export const selectInstruction = (
  eventContext: EventContext,
  selection: SelectionState,
  instructionContext: InstructionContext,
  multiSelection: boolean = false
): SelectionState => {
  const instruction: gdInstruction = instructionContext.instruction;
  if (isInstructionSelected(selection, instruction)) return selection;

  const existingSelection = multiSelection ? selection : clearSelection();
  return {
    ...existingSelection,
    selectedInstructions: [
      ...existingSelection.selectedInstructions,
      { ...instructionContext, eventContext },
    ],
  };
};

export const selectInstructionsList = (
  selection: SelectionState,
  instructionsListContext: InstructionsListContext,
  multiSelection: boolean = false
): SelectionState => {
  const instructionsList: gdInstructionsList =
    instructionsListContext.instrsList;
  if (isInstructionsListSelected(selection, instructionsList)) return selection;

  const existingSelection = multiSelection ? selection : clearSelection();
  return {
    ...existingSelection,
    selectedInstructionsLists: [
      ...existingSelection.selectedInstructionsLists,
      instructionsListContext,
    ],
  };
};

export const selectEventsAfterHistoryChange = (
  eventContexts: Array<EventContext>
): SelectionState => {
  let newSelection = getInitialSelection();

  eventContexts.forEach(eventContext => {
    // $FlowFixMe[incompatible-type]
    newSelection.selectedEvents.push(eventContext);
  });

  return newSelection;
};
