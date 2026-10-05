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
/**
 * JSON of a value with its keys sorted: libGD can reorder the keys of a
 * serialized item (like a behavior) after a change, which is not a change.
 */
export const stableStringify = (value: any): string =>
  JSON.stringify(value, (key, nestedValue) =>
    nestedValue &&
    typeof nestedValue === 'object' &&
    !Array.isArray(nestedValue)
      ? Object.keys(nestedValue)
          .sort()
          .reduce((sorted, key) => {
            sorted[key] = nestedValue[key];
            return sorted;
          }, {})
      : nestedValue
  );

export const getIntermediateNamedItemsStates = (
  before: Array<Object>,
  after: Array<Object>
): Array<Array<Object>> => {
  const beforeByName = new Map(before.map(item => [item.name, item]));
  const afterByName = new Map(after.map(item => [item.name, item]));

  const changedNames: Array<string> = [];
  after.forEach(item => {
    const beforeItem = beforeByName.get(item.name);
    if (!beforeItem || stableStringify(beforeItem) !== stableStringify(item)) {
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

const namedItemsKeys = ['behaviors', 'effects', 'variables'];

/**
 * What differs between two serialized states of an object: one key per
 * named item (`behaviors:Physics`, `variables:Life`...) that was added,
 * removed or changed, and the name of every other top-level key that
 * changed (`animations`, `width`...). Two edits with different keys are
 * different undoable steps.
 */
export const getSerializedObjectChangeKeys = (
  before: Object,
  after: Object
): Array<string> => {
  const keys: Array<string> = [];
  new Set([...Object.keys(before), ...Object.keys(after)]).forEach(key => {
    if (stableStringify(before[key]) === stableStringify(after[key])) return;
    if (!namedItemsKeys.includes(key)) {
      keys.push(key);
      return;
    }
    const beforeByName = new Map(
      (before[key] || []).map(item => [item.name, item])
    );
    const afterByName = new Map(
      (after[key] || []).map(item => [item.name, item])
    );
    new Set([...beforeByName.keys(), ...afterByName.keys()]).forEach(name => {
      if (
        stableStringify(beforeByName.get(name)) !==
        stableStringify(afterByName.get(name))
      )
        keys.push(`${key}:${name}`);
    });
  });
  return keys;
};

/**
 * The state of an array of named items where only the items whose name is
 * in `appliedNames` are as in `after` (added, changed or removed), the
 * others being as in `before` - so a change made to several arrays at once
 * (the variables of every object of a group) can be split into one step
 * per item name. With every name applied, the result is exactly `after`.
 */
export const getNamedItemsStateWithChangesApplied = (
  before: Array<Object>,
  after: Array<Object>,
  appliedNames: Set<string>
): Array<Object> => {
  const beforeByName = new Map(before.map(item => [item.name, item]));
  const afterNames = new Set(after.map(item => item.name));
  const state = after
    .map(item =>
      appliedNames.has(item.name) ? item : beforeByName.get(item.name) || null
    )
    .filter(Boolean);
  // Removed items whose removal is not applied yet.
  before.forEach(item => {
    if (!afterNames.has(item.name) && !appliedNames.has(item.name))
      state.push(item);
  });
  return state;
};
