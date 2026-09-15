// @flow
import {
  getChangedTopLevelKeys,
  findSerializedItemByName,
  getChangedVariableNodeIds,
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

describe('getChangedVariableNodeIds', () => {
  it('returns the node id of a top-level variable whose value changed', () => {
    const before = [{ name: 'Score', type: 'number', value: 0 }];
    const after = [{ name: 'Score', type: 'number', value: 10 }];
    expect(getChangedVariableNodeIds(before, after)).toEqual(['Score']);
  });

  it('does not flag an added or removed variable', () => {
    const before = [{ name: 'Score', type: 'number', value: 0 }];
    const after = [
      { name: 'Score', type: 'number', value: 0 },
      { name: 'Lives', type: 'number', value: 3 },
    ];
    expect(getChangedVariableNodeIds(before, after)).toEqual([]);
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

  it('does not flag an array whose length changed (an add/remove within it)', () => {
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
    expect(getChangedVariableNodeIds(before, after)).toEqual([]);
  });
});
