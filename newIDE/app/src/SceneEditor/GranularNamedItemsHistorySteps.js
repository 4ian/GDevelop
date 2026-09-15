// @flow

/**
 * Split a change made to an array of named items (variables, behaviors,
 * effects... anything serialized as `[{name, ...}, ...]` and matched by
 * name) into the sequence of intermediate states of the array, one per item
 * that was actually added, removed or changed - so a full "apply everything
 * at once" dialog session can be recorded as one undoable step per item
 * instead of a single step for the whole session.
 *
 * The last returned state is always exactly `after` (so redoing every step
 * reaches the exact final state, whatever the order items were added in the
 * dialog) - only the intermediate states (used to compute what a single step
 * changed) can have a slightly different order for newly added items, which
 * doesn't matter since they're never shown, only diffed.
 */
export const getIntermediateNamedItemsStates = (
  before: Array<Object>,
  after: Array<Object>
): Array<Array<Object>> => {
  const beforeByName = new Map(before.map(item => [item.name, item]));
  const afterByName = new Map(after.map(item => [item.name, item]));

  const changedNames: Array<string> = [];
  after.forEach(item => {
    const beforeItem = beforeByName.get(item.name);
    if (!beforeItem || JSON.stringify(beforeItem) !== JSON.stringify(item)) {
      changedNames.push(item.name);
    }
  });
  before.forEach(item => {
    if (!afterByName.has(item.name)) changedNames.push(item.name);
  });

  const states: Array<Array<Object>> = [];
  let current = before;
  changedNames.forEach((name, index) => {
    const isLastChange = index === changedNames.length - 1;
    if (isLastChange) {
      // Guarantee perfect fidelity of the final state (exact order included),
      // whatever the incremental reconstruction above did.
      current = after;
    } else {
      const afterItem = afterByName.get(name);
      if (afterItem) {
        const currentIndex = current.findIndex(item => item.name === name);
        current =
          currentIndex >= 0
            ? current.map(item => (item.name === name ? afterItem : item))
            : [...current, afterItem];
      } else {
        current = current.filter(item => item.name !== name);
      }
    }
    states.push(current);
  });
  return states;
};
