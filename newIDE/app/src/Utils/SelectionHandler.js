// @flow
/**
 * Export functions to manipulate a selection of objects.
 */

import values from 'lodash/values';

type ObjectType = { ptr: number };

type SelectionState<T> = {
  [number]: ?T,
};

export const getInitialSelection = () => ({});

export const clearSelection = () => getInitialSelection();

export const getSelection = <T: ObjectType>(
  selection: SelectionState<T>
): Array<T> => values(selection).filter(value => !!value);

export const addToSelection = <T: ObjectType>(
  selection: SelectionState<T>,
  object: T,
  select: boolean = true
): SelectionState<T> => {
  return {
    ...selection,
    [object.ptr]: select ? object : null,
  };
};

export const isSelected = <T: ObjectType>(
  selection: SelectionState<T>,
  object: T
): boolean => !!selection[object.ptr];

export const hasSelection = <T: ObjectType>(
  selection: SelectionState<T>
): boolean => {
  return !!values(selection).filter(value => !!value).length;
};
