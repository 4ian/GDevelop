// @flow
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  type SelectionState,
  getSelectedEvents,
  hasInstructionSelected,
  hasInstructionsListSelected,
  getSelectedInstructionsContexts,
  type InstructionsListContext,
  getLastSelectedEventContext,
  getLastSelectedInstructionContext,
  getLastSelectedInstructionsListsContext,
} from './SelectionHandler';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
const gd: libGDevelop = global.gd;

export const CLIPBOARD_KIND = 'EventsAndInstructions';

export const hasClipboardEvents = () => {
  if (!Clipboard.has(CLIPBOARD_KIND)) return false;
  const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
  const eventsCount = SafeExtractor.extractNumberProperty(
    clipboardContent,
    'eventsCount'
  );
  if (eventsCount === null) return false;

  return eventsCount > 0;
};

export const hasClipboardConditions = () => {
  if (!Clipboard.has(CLIPBOARD_KIND)) return false;
  const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
  const conditionsCount = SafeExtractor.extractNumberProperty(
    clipboardContent,
    'conditionsCount'
  );
  if (conditionsCount === null) return false;

  return conditionsCount > 0;
};

export const hasClipboardActions = () => {
  if (!Clipboard.has(CLIPBOARD_KIND)) return false;
  const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
  const actionsCount = SafeExtractor.extractNumberProperty(
    clipboardContent,
    'actionsCount'
  );
  if (actionsCount === null) return false;

  return actionsCount > 0;
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
  const lastSelectEventContext = getLastSelectedEventContext(selection);
  if (!lastSelectEventContext || !hasClipboardEvents()) return false;

  const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
  const eventsListContent = SafeExtractor.extractArrayProperty(
    clipboardContent,
    'eventsList'
  );
  if (!eventsListContent) return false;

  const eventsList = new gd.EventsList();
  unserializeFromJSObject(
    eventsList,
    eventsListContent,
    'unserializeFrom',
    project
  );

  lastSelectEventContext.eventsList.insertEvents(
    eventsList,
    0,
    eventsList.getEventsCount(),
    lastSelectEventContext.indexInList
  );
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
  const actionsListContent = SafeExtractor.extractArrayProperty(
    clipboardContent,
    'actionsList'
  );
  const conditionsListContent = SafeExtractor.extractArrayProperty(
    clipboardContent,
    'conditionsList'
  );
  if (!actionsListContent || !conditionsListContent) return false;

  const actionsList = new gd.InstructionsList();
  const conditionsList = new gd.InstructionsList();
  unserializeFromJSObject(
    actionsList,
    actionsListContent,
    'unserializeFrom',
    project
  );
  unserializeFromJSObject(
    conditionsList,
    conditionsListContent,
    'unserializeFrom',
    project
  );

  const lastSelectedInstructionContext = getLastSelectedInstructionContext(
    selection
  );
  if (lastSelectedInstructionContext) {
    if (lastSelectedInstructionContext.isCondition) {
      lastSelectedInstructionContext.instrsList.insertInstructions(
        conditionsList,
        0,
        conditionsList.size(),
        lastSelectedInstructionContext.indexInList
      );
    } else {
      lastSelectedInstructionContext.instrsList.insertInstructions(
        actionsList,
        0,
        actionsList.size(),
        lastSelectedInstructionContext.indexInList
      );
    }
  }
  const lastSelectedInstructionsListsContext = getLastSelectedInstructionsListsContext(
    selection
  );
  if (lastSelectedInstructionsListsContext) {
    if (lastSelectedInstructionsListsContext.isCondition) {
      lastSelectedInstructionsListsContext.instrsList.insertInstructions(
        conditionsList,
        0,
        conditionsList.size(),
        lastSelectedInstructionsListsContext.instrsList.size()
      );
    } else {
      lastSelectedInstructionsListsContext.instrsList.insertInstructions(
        actionsList,
        0,
        actionsList.size(),
        lastSelectedInstructionsListsContext.instrsList.size()
      );
    }
  }
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
  const actionsListContent = SafeExtractor.extractArrayProperty(
    clipboardContent,
    'actionsList'
  );
  const conditionsListContent = SafeExtractor.extractArrayProperty(
    clipboardContent,
    'conditionsList'
  );
  if (!actionsListContent || !conditionsListContent) return;

  const actionsList = new gd.InstructionsList();
  const conditionsList = new gd.InstructionsList();
  unserializeFromJSObject(
    actionsList,
    actionsListContent,
    'unserializeFrom',
    project
  );
  unserializeFromJSObject(
    conditionsList,
    conditionsListContent,
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
