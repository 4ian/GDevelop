// @flow
import Clipboard from '../Utils/Clipboard';
import {
  type SelectionState,
  getSelectedEvents,
  hasEventSelected,
  getSelectedEventContexts,
  hasInstructionSelected,
  hasInstructionsListSelected,
  getSelectedInstructionsContexts,
  getSelectedInstructionsListsContexts,
  type InstructionsListContext,
} from './SelectionHandler';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
const gd = global.gd;

export const CLIPBOARD_KIND = 'EventsAndInstructions';

export const hasClipboardEvents = () => {
  return (
    Clipboard.has(CLIPBOARD_KIND) &&
    Clipboard.get(CLIPBOARD_KIND).eventsCount > 0
  );
};

export const hasClipboardConditions = () => {
  return (
    Clipboard.has(CLIPBOARD_KIND) &&
    Clipboard.get(CLIPBOARD_KIND).conditionsCount > 0
  );
};

export const hasClipboardActions = () => {
  return (
    Clipboard.has(CLIPBOARD_KIND) &&
    Clipboard.get(CLIPBOARD_KIND).actionsCount > 0
  );
};

export const copySelectionToClipboard = (selection: SelectionState) => {
  const eventsList = new gd.EventsList();
  const actionsList = new gd.InstructionsList();
  const conditionsList = new gd.InstructionsList();

  getSelectedEvents(selection).forEach(event =>
    eventsList.insertEvent(event, eventsList.getEventsCount())
  );
  getSelectedInstructionsContexts(selection).forEach(instructionContext => {
    if (instructionContext.isCondition) {
      conditionsList.insert(
        instructionContext.instruction,
        conditionsList.size()
      );
    } else {
      actionsList.insert(instructionContext.instruction, actionsList.size());
    }
  });

  Clipboard.set(CLIPBOARD_KIND, {
    eventsList: serializeToJSObject(eventsList),
    eventsCount: eventsList.getEventsCount(),
    actionsList: serializeToJSObject(actionsList),
    actionsCount: actionsList.size(),
    conditionsList: serializeToJSObject(conditionsList),
    conditionsCount: conditionsList.size(),
  });

  eventsList.delete();
  actionsList.delete();
  conditionsList.delete();
};

export const pasteEventsFromClipboardInSelection = (
  project: gdProject,
  selection: SelectionState
): boolean => {
  if (!hasEventSelected(selection) || !hasClipboardEvents()) return false;

  const eventsList = new gd.EventsList();
  unserializeFromJSObject(
    eventsList,
    Clipboard.get(CLIPBOARD_KIND).eventsList,
    'unserializeFrom',
    project
  );
  getSelectedEventContexts(selection).forEach(eventContext => {
    eventContext.eventsList.insertEvents(
      eventsList,
      0,
      eventsList.getEventsCount(),
      eventContext.indexInList
    );
  });
  eventsList.delete();

  return true;
};

export const pasteInstructionsFromClipboardInSelection = (
  project: gdProject,
  selection: SelectionState
): boolean => {
  if (
    (!hasInstructionSelected(selection) &&
      !hasInstructionsListSelected(selection)) ||
    (!hasClipboardConditions() && !hasClipboardActions())
  )
    return false;

  const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
  const actionsList = new gd.InstructionsList();
  const conditionsList = new gd.InstructionsList();
  unserializeFromJSObject(
    actionsList,
    clipboardContent.actionsList,
    'unserializeFrom',
    project
  );
  unserializeFromJSObject(
    conditionsList,
    clipboardContent.conditionsList,
    'unserializeFrom',
    project
  );
  getSelectedInstructionsContexts(selection).forEach(instructionContext => {
    if (instructionContext.isCondition) {
      instructionContext.instrsList.insertInstructions(
        conditionsList,
        0,
        conditionsList.size(),
        instructionContext.indexInList
      );
    } else {
      instructionContext.instrsList.insertInstructions(
        actionsList,
        0,
        actionsList.size(),
        instructionContext.indexInList
      );
    }
  });
  getSelectedInstructionsListsContexts(selection).forEach(
    instructionsListContext => {
      if (instructionsListContext.isCondition) {
        instructionsListContext.instrsList.insertInstructions(
          conditionsList,
          0,
          conditionsList.size(),
          instructionsListContext.instrsList.size()
        );
      } else {
        instructionsListContext.instrsList.insertInstructions(
          actionsList,
          0,
          actionsList.size(),
          instructionsListContext.instrsList.size()
        );
      }
    }
  );
  conditionsList.delete();
  actionsList.delete();

  return true;
};

export const pasteInstructionsFromClipboardInInstructionsList = (
  project: gdProject,
  instructionsListContext: InstructionsListContext
) => {
  if (!hasClipboardConditions() && !hasClipboardActions()) return false;

  const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
  const actionsList = new gd.InstructionsList();
  const conditionsList = new gd.InstructionsList();
  unserializeFromJSObject(
    actionsList,
    clipboardContent.actionsList,
    'unserializeFrom',
    project
  );
  unserializeFromJSObject(
    conditionsList,
    clipboardContent.conditionsList,
    'unserializeFrom',
    project
  );

  if (instructionsListContext.isCondition) {
    instructionsListContext.instrsList.insertInstructions(
      conditionsList,
      0,
      conditionsList.size(),
      instructionsListContext.instrsList.size()
    );
  } else {
    instructionsListContext.instrsList.insertInstructions(
      actionsList,
      0,
      actionsList.size(),
      instructionsListContext.instrsList.size()
    );
  }
  conditionsList.delete();
  actionsList.delete();

  return true;
};
