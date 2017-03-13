const gd = global.gd;

export const getHistoryInitialState = instances => {
  const serializedElement = new gd.SerializerElement();
  instances.serializeTo(serializedElement);
  const savedInstances = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return {
    undoHistory: [],
    current: savedInstances,
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
  const serializedElement = new gd.SerializerElement();
  instances.serializeTo(serializedElement);
  const savedInstances = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return {
    undoHistory: [...history.undoHistory, history.current],
    current: savedInstances,
    redoHistory: [],
  };
};

export const undo = (history, instances) => {
  if (!history.undoHistory.length) {
    return history;
  }

  const newCurrent = history.undoHistory[history.undoHistory.length - 1];

  const serializedNewElement = gd.Serializer.fromJSObject(newCurrent);
  instances.unserializeFrom(serializedNewElement);
  serializedNewElement.delete();

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

  const serializedNewElement = gd.Serializer.fromJSObject(newCurrent);
  instances.unserializeFrom(serializedNewElement);
  serializedNewElement.delete();

  return {
    undoHistory: [...history.undoHistory, history.current],
    current: newCurrent,
    redoHistory: history.redoHistory.slice(0, -1),
  };
};
