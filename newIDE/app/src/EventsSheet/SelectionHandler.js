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

export type SelectionState = {
  selectedInstructions: { [number]: InstructionContext },
  selectedInstructionsLists: { [number]: InstructionsListContext },
  selectedEvents: { [number]: EventContext },
};

export const getInitialSelection = () => {
  return {
    selectedInstructions: {},
    selectedEvents: {},
    selectedInstructionsLists: {},
  };
};

export const getSelectedEvents = (
  selection: SelectionState
): Array<gdBaseEvent> => {
  return values(selection.selectedEvents).map(
    (eventContext: EventContext) => eventContext.event
  );
};

export const getSelectedEventContexts = (
  selection: SelectionState
): Array<EventContext> => {
  return values(selection.selectedEvents);
};

export const getSelectedInstructions = (
  selection: SelectionState
): Array<gdInstruction> => {
  return values(selection.selectedInstructions).map(
    (instructionContext: InstructionContext) => instructionContext.instruction
  );
};

export const getSelectedInstructionsContexts = (
  selection: SelectionState
): Array<InstructionContext> => {
  return values(selection.selectedInstructions);
};

export const getSelectedInstructionsListsContexts = (
  selection: SelectionState
): Array<InstructionContext> => {
  return values(selection.selectedInstructionsLists);
};

export const isEventSelected = (
  selection: SelectionState,
  event: Object
): boolean => {
  return !!selection.selectedEvents[event.ptr];
};

export const isInstructionSelected = (
  selection: SelectionState,
  instruction: gdInstruction
): boolean => {
  return !!selection.selectedInstructions[instruction.ptr];
};

export const isInstructionsListSelected = (
  selection: SelectionState,
  instructionsList: gdInstructionsList
): boolean => {
  return !!selection.selectedInstructionsLists[instructionsList.ptr];
};

export const hasEventSelected = (selection: SelectionState): boolean => {
  return !!Object.keys(selection.selectedEvents).length;
};

export const hasInstructionSelected = (selection: SelectionState): boolean => {
  return !!Object.keys(selection.selectedInstructions).length;
};

export const hasSelectedAtLeastOneCondition = (
  selection: SelectionState
): boolean => {
  for (let instructionContext of getSelectedInstructionsContexts(selection)) {
    if (instructionContext.isCondition) {
      return true;
    }
  }
  return false;
};

export const hasInstructionsListSelected = (
  selection: SelectionState
): boolean => {
  return !!Object.keys(selection.selectedInstructionsLists).length;
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
    selectedEvents: {
      ...existingSelection.selectedEvents,
      [event.ptr]: eventContext,
    },
  };
};

export const selectInstruction = (
  selection: SelectionState,
  instructionContext: InstructionContext,
  multiSelection: boolean = false
): SelectionState => {
  const instruction: gdInstruction = instructionContext.instruction;
  if (isInstructionSelected(selection, instruction)) return selection;

  const existingSelection = multiSelection ? selection : clearSelection();
  return {
    ...existingSelection,
    selectedInstructions: {
      ...existingSelection.selectedInstructions,
      [instruction.ptr]: instructionContext,
    },
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
    selectedInstructionsLists: {
      ...existingSelection.selectedInstructionsLists,
      [instructionsList.ptr]: instructionsListContext,
    },
  };
};
