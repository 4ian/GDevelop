import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';

export const getHistoryInitialState = instances => {
  return {
    undoHistory: [],
    current: serializeToJSObject(instances),
    redoHistory: [],
  };
};

export const canRedo = history => {
  return history.redoHistory.length;
};

export const canUndo = history => {
  return history.undoHistory.length;
};

export const saveToHistory = (history, instances) => {
  return {
    undoHistory: [...history.undoHistory, history.current],
    current: serializeToJSObject(instances),
    redoHistory: [],
  };
};

export const undo = (history, instances) => {
  if (!history.undoHistory.length) {
    return history;
  }

  const newCurrent = history.undoHistory[history.undoHistory.length - 1];
  unserializeFromJSObject(instances, newCurrent);

  return {
    undoHistory: history.undoHistory.slice(0, -1),
    current: newCurrent,
    redoHistory: [...history.redoHistory, history.current],
  };
};

export const redo = (history, instances) => {
  if (!history.redoHistory.length) {
    return history;
  }

  const newCurrent = history.redoHistory[history.redoHistory.length - 1];
  unserializeFromJSObject(instances, newCurrent);

  return {
    undoHistory: [...history.undoHistory, history.current],
    current: newCurrent,
    redoHistory: history.redoHistory.slice(0, -1),
  };
};
