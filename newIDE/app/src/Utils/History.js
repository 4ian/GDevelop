// @flow
import { serializeToJSObject, unserializeFromJSObject } from './Serializer';

// Tools function to keep track of the history of changes made
// on a serializable object from libGD.js

// There are 3 main types of changes:
// - ADD: the object didn't exist before, and is now created
// - DELETE: the object existed before, and is now removed
// - EDIT: the object exists before and after (moved, disabled, changed, rotated, ...)
export type RevertableActionType = 'ADD' | 'DELETE' | 'EDIT';

export type UndoAction = {|
  type?: RevertableActionType,
  valueBeforeChange: Object,
  changeContext: any,
|};

export type RedoAction = {|
  type?: RevertableActionType,
  valueAfterChange: Object,
  changeContext: any,
|};

export type HistoryState = {|
  previousActions: Array<UndoAction>,
  currentValue: Object,
  futureActions: Array<RedoAction>,
  maxSize: number,
|};

/**
 * Return the initial state of the history.
 * We store the current value so we can easily save a new history
 * without sending the previous value.
 */
export const getHistoryInitialState = (
  serializableObject: gdSerializable,
  {
    historyMaxSize,
  }: {
    historyMaxSize: number,
  }
): HistoryState => {
  return {
    previousActions: [],
    currentValue: serializeToJSObject(serializableObject),
    futureActions: [],
    maxSize: historyMaxSize,
  };
};

/**
 * Return true if redo can be applied for the given history
 */
export const canRedo = (history: HistoryState): boolean => {
  return !!history.futureActions.length;
};

/**
 * Return true if undo can be applied for the given history
 */
export const canUndo = (history: HistoryState): boolean => {
  return !!history.previousActions.length;
};

/**
 * Save a new state of the given serializableObject to the history
 */
export const saveToHistory = (
  history: HistoryState,
  newCurrentSerializableValue: gdSerializable,
  actionType?: RevertableActionType,
  changeContext?: any
): HistoryState => {
  const newCurrentValue = serializeToJSObject(newCurrentSerializableValue);
  // Add the current state to the previous actions.
  const newPreviousActions = [
    ...history.previousActions,
    {
      type: actionType,
      valueBeforeChange: history.currentValue,
      changeContext,
    },
  ];
  const newFutureActions = []; // Empty the future actions on save.
  // If we reach the max size, remove the oldest action.
  if (newPreviousActions.length > history.maxSize) {
    newPreviousActions.splice(0, newPreviousActions.length - history.maxSize);
  }

  return {
    ...history,
    currentValue: newCurrentValue,
    previousActions: newPreviousActions,
    futureActions: newFutureActions,
  };
};

/**
 * Update the serializableObject to undo the last changes.
 * /!\ This mutates the serializableObject and there could be objects owned by it
 * deleted or becoming invalid. Be sure to drop/refresh any reference to them.
 */
export const undo = (
  history: HistoryState,
  serializableObject: gdSerializable,
  project: ?gdProject = undefined
): HistoryState => {
  if (!history.previousActions.length) {
    return history;
  }

  // Unserialize the object(s) of the previous action and
  // move the current value to the future actions to allow redo.
  const previousAction =
    history.previousActions[history.previousActions.length - 1];
  const newCurrentValue = previousAction.valueBeforeChange;
  unserializeFromJSObject(
    serializableObject,
    newCurrentValue,
    'unserializeFrom',
    project
  );

  const newPreviousActions = history.previousActions.slice(0, -1);
  const newFutureActions = [
    ...history.futureActions,
    {
      type: previousAction.type,
      changeContext: previousAction.changeContext,
      valueAfterChange: history.currentValue,
    },
  ];

  return {
    ...history,
    previousActions: newPreviousActions,
    futureActions: newFutureActions,
    currentValue: newCurrentValue,
  };
};

/**
 * Update the serializableObject to undo the last changes.
 * /!\ This mutates the serializableObject and there could be objects owned by it
 * deleted or becoming invalid. Be sure to drop/refresh any reference to them.
 */
export const redo = (
  history: HistoryState,
  serializableObject: gdSerializable,
  project: ?gdProject = undefined
): HistoryState => {
  if (!history.futureActions.length) {
    return history;
  }

  // Unserialize the object(s) of the future action and
  // move the future action to the previous actions to allow undo.
  const futureAction = history.futureActions[history.futureActions.length - 1];
  const newCurrentValue = futureAction.valueAfterChange;
  unserializeFromJSObject(
    serializableObject,
    newCurrentValue,
    'unserializeFrom',
    project
  );

  const newPreviousActions = [
    ...history.previousActions,
    {
      type: futureAction.type,
      changeContext: futureAction.changeContext,
      valueBeforeChange: history.currentValue,
    },
  ];
  const newFutureActions = history.futureActions.slice(0, -1);

  return {
    ...history,
    previousActions: newPreviousActions,
    futureActions: newFutureActions,
    currentValue: newCurrentValue,
  };
};
