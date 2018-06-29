// @flow

import values from 'lodash/values';

type Event = {
  ptr: number,
};
type EventsList = {
  ptr: number,
};
type Instruction = {
  ptr: number,
};
type InstructionsList = {
  ptr: number,
};

type InstructionContext = {|
  isCondition: boolean,
  instrsList: InstructionsList,
  instruction: Instruction,
  indexInList: number,
|};

type InstructionsListContext = {|
  isCondition: boolean,
  instrsList: InstructionsList,
|};

type EventContext = {|
  isCondition: boolean,
  eventsList: EventsList,
  event: Event,
  indexInList: number,
|};

type SelectionState = {
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

export const getSelectedEvents = (selection: SelectionState): Array<Object> => {
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
): Array<Instruction> => {
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
  instruction: Instruction
): boolean => {
  return !!selection.selectedInstructions[instruction.ptr];
};

export const isInstructionsListSelected = (
  selection: SelectionState,
  instructionsList: InstructionsList
): boolean => {
  return !!selection.selectedInstructionsLists[instructionsList.ptr];
};

export const hasEventSelected = (selection: SelectionState): boolean => {
  return !!Object.keys(selection.selectedEvents).length;
};

export const hasInstructionSelected = (selection: SelectionState): boolean => {
  return !!Object.keys(selection.selectedInstructions).length;
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
  const instruction: Instruction = instructionContext.instruction;
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
  const instructionsList: InstructionsList = instructionsListContext.instrsList;
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
