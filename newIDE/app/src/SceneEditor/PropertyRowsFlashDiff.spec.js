// @flow
import {
  getChangedTopLevelKeys,
  findSerializedItemByName,
  getChangedVariableNodeIds,
  hasRemovedVariables,
} from './PropertyRowsFlashDiff';

describe('getChangedTopLevelKeys', () => {
  it('returns keys whose value differs', () => {
    expect(getChangedTopLevelKeys({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual([
      'b',
    ]);
  });

  it('includes a key present in only one side', () => {
    expect(getChangedTopLevelKeys({ a: 1 }, { a: 1, b: 2 })).toEqual(['b']);
  });

  it('excludes the given keys', () => {
    expect(
      getChangedTopLevelKeys({ a: 1, b: 2 }, { a: 5, b: 3 }, ['a'])
    ).toEqual(['b']);
  });

  it('returns an empty array when nothing changed', () => {
    expect(getChangedTopLevelKeys({ a: 1 }, { a: 1 })).toEqual([]);
  });
});

describe('findSerializedItemByName', () => {
  it('finds an item by its name', () => {
    const items = [{ name: 'A' }, { name: 'B' }];
    expect(findSerializedItemByName(items, 'B')).toBe(items[1]);
  });

  it('returns undefined when not found', () => {
    expect(findSerializedItemByName([{ name: 'A' }], 'B')).toBe(undefined);
  });
});

describe('hasRemovedVariables', () => {
  it('detects removed variables at the top level and in structures/arrays', () => {
    const variables = [
      { name: 'Score', type: 'number', value: 0 },
      {
        name: 'Player',
        type: 'structure',
        children: [{ name: 'Life', type: 'number', value: 3 }],
      },
      {
        name: 'Enemies',
        type: 'array',
        children: [{ type: 'number', value: 1 }],
      },
    ];
    expect(hasRemovedVariables(variables, variables)).toBe(false);
    expect(hasRemovedVariables(variables, variables.slice(1))).toBe(true);
    expect(
      hasRemovedVariables(variables, [
        variables[0],
        { name: 'Player', type: 'structure', children: [] },
        variables[2],
      ])
    ).toBe(true);
    expect(
      hasRemovedVariables(variables, [
        variables[0],
        variables[1],
        { name: 'Enemies', type: 'array', children: [] },
      ])
    ).toBe(true);
    // Added ones are not removals.
    expect(hasRemovedVariables(variables.slice(1), variables)).toBe(false);
  });
});

describe('getChangedVariableNodeIds', () => {
  it('returns the node id of a top-level variable whose value changed', () => {
    const before = [{ name: 'Score', type: 'number', value: 0 }];
    const after = [{ name: 'Score', type: 'number', value: 10 }];
    expect(getChangedVariableNodeIds(before, after)).toEqual(['Score']);
  });

  it('flags an added variable (but not a removed one, which has no row)', () => {
    const before = [{ name: 'Score', type: 'number', value: 0 }];
    const after = [
      { name: 'Score', type: 'number', value: 0 },
      { name: 'Lives', type: 'number', value: 3 },
    ];
    expect(getChangedVariableNodeIds(before, after)).toEqual(['Lives']);
    expect(getChangedVariableNodeIds(after, before)).toEqual([]);
  });

  it('flags an added child of a structure and an added item of an array', () => {
    const before = [
      { name: 'Player', type: 'structure', children: [] },
      { name: 'Enemies', type: 'array', children: [] },
    ];
    const after = [
      {
        name: 'Player',
        type: 'structure',
        children: [{ name: 'Life', type: 'number', value: 3 }],
      },
      {
        name: 'Enemies',
        type: 'array',
        children: [{ type: 'number', value: 1 }],
      },
    ];
    expect(getChangedVariableNodeIds(before, after)).toEqual([
      'Player$.$Life',
      'Enemies$.$0',
    ]);
  });

  it('returns the nested node id of a changed structure child', () => {
    const before = [
      {
        name: 'Player',
        type: 'structure',
        children: [{ name: 'Health', type: 'number', value: 10 }],
      },
    ];
    const after = [
      {
        name: 'Player',
        type: 'structure',
        children: [{ name: 'Health', type: 'number', value: 5 }],
      },
    ];
    expect(getChangedVariableNodeIds(before, after)).toEqual([
      'Player$.$Health',
    ]);
  });

  it('returns the nested node id of a changed array item, by index', () => {
    const before = [
      {
        name: 'Enemies',
        type: 'array',
        children: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }],
      },
    ];
    const after = [
      {
        name: 'Enemies',
        type: 'array',
        children: [{ type: 'number', value: 1 }, { type: 'number', value: 9 }],
      },
    ];
    expect(getChangedVariableNodeIds(before, after)).toEqual(['Enemies$.$1']);
  });

  it('flags the variable itself when its type changed, without recursing', () => {
    const before = [{ name: 'X', type: 'number', value: 0 }];
    const after = [
      {
        name: 'X',
        type: 'structure',
        children: [{ name: 'Y', type: 'number', value: 1 }],
      },
    ];
    expect(getChangedVariableNodeIds(before, after)).toEqual(['X']);
  });

  it('flags the item added to an array (and nothing on a removal)', () => {
    const before = [
      { name: 'List', type: 'array', children: [{ type: 'number', value: 1 }] },
    ];
    const after = [
      {
        name: 'List',
        type: 'array',
        children: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }],
      },
    ];
    expect(getChangedVariableNodeIds(before, after)).toEqual(['List$.$1']);
    expect(getChangedVariableNodeIds(after, before)).toEqual([]);
  });
});
