import { serializeToJSObject, unserializeFromJSObject } from './Serializer';

// Tools function to keep track of the history of changes made
// on a serializable object from libGD.js

/**
 * Return the initial state of the history
 * @param {*} serializableObject
 */
export const getHistoryInitialState = (serializableObject, {historyMaxSize}) => {
  return {
    undoHistory: [],
    current: serializeToJSObject(serializableObject),
    redoHistory: [],
    maxSize: historyMaxSize,
  };
};

/**
 * Return true if redo can be applied for the given history
 * @param {*} history
 */
export const canRedo = history => {
  return !!history.redoHistory.length;
};

/**
 * Return true if undo can be applied for the given history
 * @param {*} history
 */
export const canUndo = history => {
  return !!history.undoHistory.length;
};

/**
 * Save a new state of the given serializableObject to the history
 * @param {*} history
 * @param {*} serializableObject
 */
export const saveToHistory = (history, serializableObject) => {
  const newUndoHistory = [...history.undoHistory, history.current];
  if (newUndoHistory.length > history.maxSize) {
    newUndoHistory.splice(0, newUndoHistory.length - history.maxSize)
  }

  return {
    ...history,
    undoHistory: newUndoHistory,
    current: serializeToJSObject(serializableObject),
    redoHistory: [],
  };
};

/**
 * Update the serializableObject to undo the last changes.
 * /!\ This mutates the serializableObject and there could be objects owned by it
 * deleted or becoming invalid. Be sure to drop/refresh any reference to them.
 *
 * @param {*} history
 * @param {*} serializableObject
 */
export const undo = (history, serializableObject, project = undefined) => {
  if (!history.undoHistory.length) {
    return history;
  }

  const newCurrent = history.undoHistory[history.undoHistory.length - 1];
  unserializeFromJSObject(
    serializableObject,
    newCurrent,
    'unserializeFrom',
    project
  );

  return {
    ...history,
    undoHistory: history.undoHistory.slice(0, -1),
    current: newCurrent,
    redoHistory: [...history.redoHistory, history.current],
  };
};

/**
 * Update the serializableObject to undo the last changes.
 * /!\ This mutates the serializableObject and there could be objects owned by it
 * deleted or becoming invalid. Be sure to drop/refresh any reference to them.
 *
 * @param {*} history
 * @param {*} serializableObject
 */
export const redo = (history, serializableObject, project = undefined) => {
  if (!history.redoHistory.length) {
    return history;
  }

  const newCurrent = history.redoHistory[history.redoHistory.length - 1];
  unserializeFromJSObject(
    serializableObject,
    newCurrent,
    'unserializeFrom',
    project
  );

  return {
    ...history,
    undoHistory: [...history.undoHistory, history.current],
    current: newCurrent,
    redoHistory: history.redoHistory.slice(0, -1),
  };
};
