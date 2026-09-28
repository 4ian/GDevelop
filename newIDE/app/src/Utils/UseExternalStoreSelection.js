// @flow
import * as React from 'react';

const areSame = (first: any, second: any): boolean => Object.is(first, second);

/**
 * Read a part of a store living outside of React, re-rendering only when that
 * part changes.
 *
 * `subscribe` registers a listener called on the changes of the store (and
 * returns what unregisters it), or is null when there is nothing to follow.
 * `select` reads the part of the store the component shows. Both must be
 * stable (memoized): a new one subscribes again. `isEqual` tells a new
 * selection from the previous one: the previous one is kept when they are
 * equal, so that nothing re-renders.
 */
export const useExternalStoreSelection = <Selection>(
  subscribe: ?(listener: () => void) => () => void,
  select: () => Selection,
  isEqual: (first: Selection, second: Selection) => boolean = areSame
): Selection => {
  const [selection, setSelection] = React.useState<Selection>(select);

  React.useEffect(
    () => {
      const update = () => {
        const newSelection = select();
        setSelection(previousSelection =>
          isEqual(previousSelection, newSelection)
            ? previousSelection
            : newSelection
        );
      };
      // The store may have changed between the render and this effect.
      update();
      return subscribe ? subscribe(update) : undefined;
    },
    [subscribe, select, isEqual]
  );

  return selection;
};
