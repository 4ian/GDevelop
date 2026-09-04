// @flow
import {
  saveValueToHistory,
  areSerializedValuesEqual,
  canUndo,
  canRedo,
  type HistoryState,
} from './History';

describe('saveValueToHistory', () => {
  const getInitialHistory = (): HistoryState => ({
    previousActions: [],
    currentValue: { instances: [{ persistentUuid: 'a', x: 0 }], color: 'red' },
    futureActions: [],
    maxSize: 50,
  });

  it('saves a changed value as an undoable step', () => {
    const history = saveValueToHistory(
      getInitialHistory(),
      { instances: [{ persistentUuid: 'a', x: 10 }], color: 'red' },
      'EDIT',
      { source: 'panel' }
    );
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(false);
    expect(history.previousActions[0].changeContext).toEqual({
      source: 'panel',
    });
  });

  it('does not save a step when the value is unchanged', () => {
    const initialHistory = getInitialHistory();
    const history = saveValueToHistory(initialHistory, {
      instances: [{ persistentUuid: 'a', x: 0 }],
      color: 'red',
    });
    expect(history).toBe(initialHistory);
    expect(canUndo(history)).toBe(false);
  });
});

describe('areSerializedValuesEqual', () => {
  it('compares nested values', () => {
    expect(
      areSerializedValuesEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })
    ).toBe(true);
    expect(
      areSerializedValuesEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })
    ).toBe(false);
    expect(areSerializedValuesEqual({ a: 1 }, { a: 1, b: undefined })).toBe(
      false
    );
    expect(areSerializedValuesEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(areSerializedValuesEqual(null, {})).toBe(false);
    expect(areSerializedValuesEqual('x', 'x')).toBe(true);
  });
});
