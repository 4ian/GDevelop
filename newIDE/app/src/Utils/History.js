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
  // For a change that can't be captured by a snapshot (see
  // `saveCommandToHistory`): the caller is responsible for reverting it.
  command?: any,
|};

export type RedoAction = {|
  type?: RevertableActionType,
  valueAfterChange: Object,
  changeContext: any,
  command?: any,
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
  const newPreviousActions: Array<UndoAction> = [
    ...history.previousActions,
    {
      type: actionType,
      valueBeforeChange: history.currentValue,
      changeContext,
    },
  ];
  const newFutureActions: Array<RedoAction> = []; // Empty the future actions on save.
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
  const newFutureActions: Array<RedoAction> = [
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

  const newPreviousActions: Array<UndoAction> = [
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

// Composite history: track several pieces of state ("targets") as a single
// history. Each undoable step only stores the targets it changed (so a step
// is cheap to save even if some targets are large, and an undo only touches
// what the step changed). `currentValue` is a cache of the last known
// serialized value of every target.

export type CompositeTarget = {
  serializableObject?: gdSerializable,
  serializationMethodName?: string,
  unserializationMethodName?: string,
  // The unserialization method of some gd.* classes requires the project as
  // first argument - and others break if it is given.
  unserializationNeedsProject?: boolean,
  // For state without its own serializer (like a few scene properties):
  getValue?: () => Object,
  setValue?: (value: Object) => void,
};

export type CompositeTargets = { [key: string]: CompositeTarget };

/**
 * Deep equality of two serialized (JSON-like) values.
 */
export const areSerializedValuesEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!areSerializedValuesEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysOfA = Object.keys(a);
  if (keysOfA.length !== Object.keys(b).length) return false;
  for (const key of keysOfA) {
    if (!b.hasOwnProperty(key) || !areSerializedValuesEqual(a[key], b[key]))
      return false;
  }
  return true;
};

const pushUndoAction = (
  history: HistoryState,
  undoAction: UndoAction,
  newCurrentValue: Object
): HistoryState => {
  const newPreviousActions: Array<UndoAction> = [
    ...history.previousActions,
    undoAction,
  ];
  if (newPreviousActions.length > history.maxSize) {
    newPreviousActions.splice(0, newPreviousActions.length - history.maxSize);
  }
  return {
    ...history,
    currentValue: newCurrentValue,
    previousActions: newPreviousActions,
    futureActions: [], // Empty the future actions on save.
  };
};

/**
 * Save an already serialized value to the history. Nothing is saved if the
 * value is the same as the current one: an undo step doing nothing would
 * make the undo feel broken.
 */
export const saveValueToHistory = (
  history: HistoryState,
  newCurrentValue: Object,
  actionType?: RevertableActionType,
  changeContext?: any
): HistoryState => {
  if (areSerializedValuesEqual(history.currentValue, newCurrentValue)) {
    return history;
  }
  return pushUndoAction(
    history,
    {
      type: actionType,
      valueBeforeChange: history.currentValue,
      changeContext,
    },
    newCurrentValue
  );
};

const pickValues = (value: Object, keys: Array<string>): Object => {
  const pickedValue: { [string]: Object } = {};
  keys.forEach(key => {
    if (value[key] !== undefined) pickedValue[key] = value[key];
  });
  return pickedValue;
};

/**
 * Serialize the given targets (all of them by default).
 */
export const serializeCompositeTargets = (
  targets: CompositeTargets,
  keys?: Array<string>
): Object => {
  const value: { [key: string]: Object } = {};
  for (const key of keys || Object.keys(targets)) {
    const target = targets[key];
    if (!target) continue;
    if (target.serializableObject) {
      value[key] = serializeToJSObject(
        target.serializableObject,
        target.serializationMethodName || 'serializeTo'
      );
    } else if (target.getValue) {
      value[key] = target.getValue();
    }
  }
  return value;
};

/**
 * Apply the given (partial) value to the targets it contains, in the order
 * of the targets (which can matter: a target can reference another one).
 */
const unserializeCompositeTargets = (
  targets: CompositeTargets,
  value: Object,
  project: ?gdProject
): void => {
  for (const key of Object.keys(targets)) {
    const target = targets[key];
    if (value[key] === undefined) continue;

    if (target.serializableObject) {
      unserializeFromJSObject(
        target.serializableObject,
        value[key],
        target.unserializationMethodName || 'unserializeFrom',
        target.unserializationNeedsProject ? project : undefined
      );
    } else if (target.setValue) {
      target.setValue(value[key]);
    }
  }
};

/**
 * Return the initial state of a history tracking several pieces of state.
 */
export const getCompositeHistoryInitialState = (
  targets: CompositeTargets,
  {
    historyMaxSize,
  }: {
    historyMaxSize: number,
  }
): HistoryState => {
  return {
    previousActions: [],
    currentValue: serializeCompositeTargets(targets),
    futureActions: [],
    maxSize: historyMaxSize,
  };
};

/**
 * Update the cached value of the given targets, without saving a step. To
 * be used for targets that can be changed outside of this history (like
 * global objects, edited from another scene) so that the next step saved
 * for them is based on their actual value.
 */
export const refreshCompositeHistoryValue = (
  history: HistoryState,
  targets: CompositeTargets,
  keys: Array<string>
): HistoryState => ({
  ...history,
  currentValue: {
    ...history.currentValue,
    ...serializeCompositeTargets(targets, keys),
  },
});

/**
 * Save a new step made of the given (partial, already serialized) value of
 * some targets. Nothing is saved if none of them changed.
 */
export const savePartialValueToHistory = (
  history: HistoryState,
  partialValue: Object,
  actionType?: RevertableActionType,
  changeContext?: any
): HistoryState => {
  const keys = Object.keys(partialValue);
  const valueBeforeChange = pickValues(history.currentValue, keys);
  if (areSerializedValuesEqual(valueBeforeChange, partialValue)) {
    return history;
  }
  return pushUndoAction(
    history,
    { type: actionType, valueBeforeChange, changeContext },
    { ...history.currentValue, ...partialValue }
  );
};

/**
 * Save a new step capturing the current state of the given targets.
 */
export const saveCompositeToHistory = (
  history: HistoryState,
  targets: CompositeTargets,
  keys: Array<string>,
  actionType?: RevertableActionType,
  changeContext?: any
): HistoryState =>
  savePartialValueToHistory(
    history,
    serializeCompositeTargets(targets, keys),
    actionType,
    changeContext
  );

/**
 * Save a step for a change that can't be captured by a snapshot of the
 * targets (like a rename refactoring the whole project). The caller must
 * revert/re-apply it itself when the step is undone/redone (see the
 * `command` of the action returned by `getLastUndoableAction`).
 */
export const saveCommandToHistory = (
  history: HistoryState,
  command: any,
  changeContext?: any
): HistoryState =>
  pushUndoAction(
    history,
    { valueBeforeChange: {}, changeContext, command },
    history.currentValue
  );

export const getLastUndoableAction = (history: HistoryState): ?UndoAction =>
  history.previousActions[history.previousActions.length - 1];

export const getLastRedoableAction = (history: HistoryState): ?RedoAction =>
  history.futureActions[history.futureActions.length - 1];

/**
 * Update the targets to undo the last changes.
 * /!\ This mutates the objects of the targets and there could be objects
 * owned by them deleted or becoming invalid. Be sure to drop/refresh any
 * reference to them.
 */
export const undoComposite = (
  history: HistoryState,
  targets: CompositeTargets,
  project: ?gdProject = undefined
): HistoryState => {
  const previousAction = getLastUndoableAction(history);
  if (!previousAction) return history;

  const { valueBeforeChange } = previousAction;
  const keys = Object.keys(valueBeforeChange);
  unserializeCompositeTargets(targets, valueBeforeChange, project);

  return {
    ...history,
    previousActions: history.previousActions.slice(0, -1),
    futureActions: [
      ...history.futureActions,
      {
        type: previousAction.type,
        changeContext: previousAction.changeContext,
        command: previousAction.command,
        valueAfterChange: pickValues(history.currentValue, keys),
      },
    ],
    currentValue: { ...history.currentValue, ...valueBeforeChange },
  };
};

/**
 * Update the targets to redo the last undone changes.
 * /!\ This mutates the objects of the targets and there could be objects
 * owned by them deleted or becoming invalid. Be sure to drop/refresh any
 * reference to them.
 */
export const redoComposite = (
  history: HistoryState,
  targets: CompositeTargets,
  project: ?gdProject = undefined
): HistoryState => {
  const futureAction = getLastRedoableAction(history);
  if (!futureAction) return history;

  const { valueAfterChange } = futureAction;
  const keys = Object.keys(valueAfterChange);
  unserializeCompositeTargets(targets, valueAfterChange, project);

  return {
    ...history,
    previousActions: [
      ...history.previousActions,
      {
        type: futureAction.type,
        changeContext: futureAction.changeContext,
        command: futureAction.command,
        valueBeforeChange: pickValues(history.currentValue, keys),
      },
    ],
    futureActions: history.futureActions.slice(0, -1),
    currentValue: { ...history.currentValue, ...valueAfterChange },
  };
};
