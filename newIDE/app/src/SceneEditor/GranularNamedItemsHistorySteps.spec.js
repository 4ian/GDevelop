// @flow
import {
  getIntermediateNamedItemsStates,
  getNamedItemsStateWithChangesApplied,
  getSerializedObjectChangeKeys,
} from './GranularNamedItemsHistorySteps';

describe('getIntermediateNamedItemsStates', () => {
  it('returns nothing when nothing changed', () => {
    const items = [{ name: 'A', serialized: { type: 'number', value: 1 } }];
    expect(getIntermediateNamedItemsStates(items, items)).toEqual([]);
  });

  it('returns a single state for a single changed item', () => {
    const before = [{ name: 'A', serialized: { type: 'number', value: 1 } }];
    const after = [{ name: 'A', serialized: { type: 'number', value: 2 } }];
    const states = getIntermediateNamedItemsStates(before, after);
    expect(states).toEqual([after]);
  });

  it('returns a single state for an added item', () => {
    const before: Array<Object> = [];
    const after = [{ name: 'A', serialized: { type: 'number', value: 1 } }];
    const states = getIntermediateNamedItemsStates(before, after);
    expect(states).toEqual([after]);
  });

  it('returns a single state for a removed item', () => {
    const before = [{ name: 'A', serialized: { type: 'number', value: 1 } }];
    const after: Array<Object> = [];
    const states = getIntermediateNamedItemsStates(before, after);
    expect(states).toEqual([[]]);
  });

  it('splits several changes into as many intermediate states, ending exactly at "after"', () => {
    const before = [
      { name: 'A', serialized: { type: 'number', value: 1 } },
      { name: 'B', serialized: { type: 'number', value: 2 } },
      { name: 'C', serialized: { type: 'number', value: 3 } },
    ];
    const after = [
      { name: 'A', serialized: { type: 'number', value: 100 } }, // changed
      { name: 'B', serialized: { type: 'number', value: 2 } }, // unchanged
      { name: 'D', serialized: { type: 'number', value: 4 } }, // added
      // "C" removed
    ];
    const states = getIntermediateNamedItemsStates(before, after);

    // One state per changed name (A, D, C) - B never appears as its own step.
    expect(states.length).toBe(3);

    // Each intermediate state only differs from the previous one by exactly
    // the one item it represents.
    const findByName = (state: Array<Object>, name: string) =>
      state.find(v => v.name === name);
    const getByName = (state: Array<Object>, name: string): Object => {
      const item = findByName(state, name);
      if (!item) throw new Error(`Item "${name}" not found.`);
      return item;
    };
    expect(getByName(states[0], 'A').serialized.value).toBe(100); // A changed
    expect(findByName(states[0], 'C')).toBeTruthy(); // C not removed yet
    expect(findByName(states[0], 'D')).toBeFalsy(); // D not added yet

    expect(getByName(states[1], 'D').serialized.value).toBe(4); // D added
    expect(findByName(states[1], 'C')).toBeTruthy(); // C still there

    // The last state is always exactly `after`.
    expect(states[states.length - 1]).toEqual(after);
  });

  it('handles a change to a nested object (e.g. a structure variable) as one step', () => {
    const before = [
      {
        name: 'Player',
        serialized: {
          type: 'structure',
          children: [{ name: 'Health', type: 'number', value: 10 }],
        },
      },
    ];
    const after = [
      {
        name: 'Player',
        serialized: {
          type: 'structure',
          children: [{ name: 'Health', type: 'number', value: 5 }],
        },
      },
    ];
    const states = getIntermediateNamedItemsStates(before, after);
    expect(states).toEqual([after]);
  });

  it('works for flat (non-wrapped) items, like behaviors or effects', () => {
    const before = [
      {
        name: 'Platformer',
        type: 'PlatformBehavior::PlatformerObjectBehavior',
        JumpSpeed: 500,
      },
      { name: 'Sepia', effectType: 'Sepia', doubleParameters: { opacity: 1 } },
    ];
    const after = [
      {
        name: 'Platformer',
        type: 'PlatformBehavior::PlatformerObjectBehavior',
        JumpSpeed: 999,
      },
      { name: 'Sepia', effectType: 'Sepia', doubleParameters: { opacity: 1 } },
    ];
    const states = getIntermediateNamedItemsStates(before, after);
    expect(states).toEqual([after]);
  });
});

describe('getSerializedObjectChangeKeys', () => {
  const object = {
    name: 'Player',
    width: 10,
    animations: [{ name: 'Idle' }],
    behaviors: [{ name: 'Physics', gravity: 9 }],
    variables: [{ name: 'Life', value: 3 }],
    effects: [],
  };

  it('returns nothing when nothing changed', () => {
    expect(getSerializedObjectChangeKeys(object, { ...object })).toEqual([]);
  });

  it('names the changed, added and removed named items', () => {
    expect(
      getSerializedObjectChangeKeys(object, {
        ...object,
        behaviors: [{ name: 'Physics', gravity: 10 }, { name: 'Tween' }],
        variables: [],
      })
    ).toEqual(['behaviors:Physics', 'behaviors:Tween', 'variables:Life']);
  });

  it('ignores a different order of the keys', () => {
    expect(
      getSerializedObjectChangeKeys(object, {
        ...object,
        behaviors: [{ gravity: 9, name: 'Physics' }],
      })
    ).toEqual([]);
  });

  it('names the other changed top-level keys', () => {
    expect(
      getSerializedObjectChangeKeys(object, {
        ...object,
        width: 20,
        animations: [{ name: 'Idle' }, { name: 'Run' }],
      })
    ).toEqual(['width', 'animations']);
  });
});

describe('getNamedItemsStateWithChangesApplied', () => {
  const before = [{ name: 'A', value: 1 }, { name: 'B', value: 2 }];
  const after = [{ name: 'A', value: 10 }, { name: 'C', value: 3 }];

  it('applies nothing with no name', () => {
    expect(
      getNamedItemsStateWithChangesApplied(before, after, new Set())
    ).toEqual(before);
  });

  it('applies the change, the addition or the removal of the given names only', () => {
    expect(
      getNamedItemsStateWithChangesApplied(before, after, new Set(['A']))
    ).toEqual([{ name: 'A', value: 10 }, { name: 'B', value: 2 }]);
    expect(
      getNamedItemsStateWithChangesApplied(before, after, new Set(['C']))
    ).toEqual([
      { name: 'A', value: 1 },
      { name: 'C', value: 3 },
      { name: 'B', value: 2 },
    ]);
    expect(
      getNamedItemsStateWithChangesApplied(before, after, new Set(['B']))
    ).toEqual([{ name: 'A', value: 1 }]);
  });

  it('is exactly the final state with every name applied', () => {
    expect(
      getNamedItemsStateWithChangesApplied(
        before,
        after,
        new Set(['A', 'B', 'C'])
      )
    ).toEqual(after);
  });
});
