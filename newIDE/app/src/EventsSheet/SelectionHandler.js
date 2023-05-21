// @flow

import values from 'lodash/values';

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

export type EventContext = {|
  eventsList: gdEventsList,
  event: gdBaseEvent,
  indexInList: number,
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

export const getInitialSelection = () => {
  return {
    selectedInstructions: [],
    selectedEvents: [],
    selectedInstructionsLists: [],
  };
};

export const getSelectedEvents = (
  selection: SelectionState
): Array<gdBaseEvent> => {
  return selection.selectedEvents.map(
    (eventContext: EventContext) => eventContext.event
  );
};

export const getLastSelectedEvent = (
  selection: SelectionState
): Event | null => {
  if (!selection.selectedEvents.length) return null;

  return selection.selectedEvents[selection.selectedEvents.length - 1].event;
};

export const getSelectedEventContexts = (
  selection: SelectionState
): Array<EventContext> => {
  return selection.selectedEvents;
};

export const getLastSelectedEventContext = (
  selection: SelectionState
): EventContext | null => {
  if (!selection.selectedEvents.length) return null;

  return selection.selectedEvents[selection.selectedEvents.length - 1];
};

export const getLastSelectedEventContextWhichCanHaveSubEvents = (
  selection: SelectionState
): EventContext | null => {
  const candidates = selection.selectedEvents.filter(({ event }) =>
    event.canHaveSubEvents()
  );
  if (!candidates.length) return null;

  return candidates[candidates.length - 1];
};

export const getSelectedTopMostOnlyEventContexts = (
  selection: SelectionState
): Array<EventContext> => {
  const selectedEventContexts: Array<EventContext> = values(
    selection.selectedEvents
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
  return selection.selectedInstructions.map(
    (instructionContext: InstructionContextWithEventContext) =>
      instructionContext.instruction
  );
};

export const getSelectedInstructionsLocatingEvents = (
  selection: SelectionState
): Array<gdBaseEvent> => {
  return selection.selectedInstructions.map(
    (instructionContext: InstructionContextWithEventContext) =>
      instructionContext.eventContext.event
  );
};

export const getSelectedInstructionsContexts = (
  selection: SelectionState
): Array<InstructionContextWithEventContext> => {
  return selection.selectedInstructions;
};

export const getSelectedInstructionsListsContexts = (
  selection: SelectionState
): Array<InstructionsListContext> => {
  return selection.selectedInstructionsLists;
};

export const getLastSelectedInstructionContext = (
  selection: SelectionState
): InstructionContextWithEventContext | null => {
  return (
    selection.selectedInstructions[selection.selectedInstructions.length - 1] ||
    null
  );
};

export const getLastSelectedInstructionEventContextWhichCanHaveSubEvents = (
  selection: SelectionState
): EventContext | null => {
  const candidates = selection.selectedInstructions.filter(({ eventContext }) =>
    eventContext.event.canHaveSubEvents()
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
  return getInitialSelection();
};

export const selectEvent = (
  selection: SelectionState,
  eventContext: EventContext,
  multiSelection: boolean = false
): SelectionState => {
  const event = eventContext.event;
  if (isEventSelected(selection, event)) return selection;

  const existingSelection = multiSelection ? selection : clearSelection();
  return {
    ...existingSelection,
    selectedEvents: [...existingSelection.selectedEvents, eventContext],
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
) => {
  let newSelection = getInitialSelection();

  eventContexts.forEach(eventContext => {
    newSelection.selectedEvents.push(eventContext);
  });

  return newSelection;
};
