// @flow
import * as React from 'react';

// The objects opened in an object editor dialog. Cancelling the dialog restores
// the object as it was when opened, which would undo a change made meanwhile
// from outside the dialog (by the AI).
const openedObjectPointers: Set<number> = new Set();

/** Marks the object as opened in an editor. Returns the function to unmark it. */
export const markObjectAsOpenedInEditor = (object: gdObject): (() => void) => {
  const pointer = object.ptr;
  openedObjectPointers.add(pointer);
  return () => {
    openedObjectPointers.delete(pointer);
  };
};

export const useMarkObjectAsOpenedInEditor = (object: gdObject) => {
  React.useEffect(() => markObjectAsOpenedInEditor(object), [object]);
};

export const isObjectOpenedInEditor = (object: gdObject): boolean =>
  openedObjectPointers.has(object.ptr);
