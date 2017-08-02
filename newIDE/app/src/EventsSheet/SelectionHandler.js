import values from 'lodash/values';

export const getInitialSelection = () => {
  return {
    selectedInstructions: {},
    selectedEvents: {},
  };
};

export const getSelectedEvents = selection => {
  return values(selection.selectedEvents).map(
    eventContext => eventContext.event
  );
};

export const getSelectedEventContexts = selection => {
  return values(selection.selectedEvents);
};

export const getSelectedInstructions = selection => {
  return values(selection.selectedInstructions).map(
    instructionContext => instructionContext.instruction
  );
};

export const isEventSelected = (selection, event) => {
  return !!selection.selectedEvents[event.ptr];
};

export const isInstructionSelected = (selection, instruction) => {
  return !!selection.selectedInstructions[instruction.ptr];
};

export const hasEventSelected = selection => {
  return Object.keys(selection.selectedEvents).length;
};

export const hasInstructionSelected = selection => {
  return Object.keys(selection.selectedInstructions).length;
};

export const hasSomethingSelected = selection => {
  return hasInstructionSelected(selection) || hasEventSelected(selection);
};

export const clearSelection = () => {
  return getInitialSelection();
};

export const selectEvent = (
  selection,
  eventContext,
  multiSelection = false
) => {
  const event = eventContext.event;

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
  selection,
  instructionContext,
  multiSelection = false
) => {
  const instruction = instructionContext.instruction;

  const existingSelection = multiSelection ? selection : clearSelection();
  return {
    ...existingSelection,
    selectedInstructions: {
      ...existingSelection.selectedInstructions,
      [instruction.ptr]: instructionContext,
    },
  };
};
