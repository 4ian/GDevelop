// @flow
import { computeTreeViewSelection } from './UseTreeViewSelection';

type Item = {
  +id: string,
  +isRoot?: boolean,
  +isPlaceholder?: boolean,
};

const node = (
  id: string,
  selected: boolean = false,
  extra?: { +isRoot?: boolean, +isPlaceholder?: boolean }
): {| id: string, selected: boolean, item: Item |} => ({
  id,
  selected,
  item: {
    id,
    isRoot: extra ? extra.isRoot : undefined,
    isPlaceholder: extra ? extra.isPlaceholder : undefined,
  },
});

const item = (id: string): Item => ({ id });
const getItemId = (item: Item): string => item.id;

describe('computeTreeViewSelection', () => {
  const flattenedData = [
    node('root', false, { isRoot: true }),
    node('a'),
    node('b'),
    node('c'),
    node('d'),
  ];

  test('exclusive click selects a single item and sets the anchor and focus', () => {
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [],
      flattenedData,
      getItemId,
      selectionAnchorId: null,
      shiftSelectionBase: [],
      node: node('b'),
      exclusive: true,
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'b',
    ]);
    expect(result.selectionAnchorId).toBe('b');
    expect(result.navigationFocusId).toBe('b');
  });

  test('ctrl+click appends to the selection and moves the anchor to the clicked item', () => {
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [item('a')],
      flattenedData,
      getItemId,
      selectionAnchorId: 'a',
      shiftSelectionBase: [item('a')],
      node: node('d'),
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'a',
      'd',
    ]);
    expect(result.selectionAnchorId).toBe('d');
    expect(result.navigationFocusId).toBe('d');
  });

  test('ctrl+click on a selected item toggles it off, reports it as removed and keeps keyboard focus on it', () => {
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [item('a'), item('d')],
      flattenedData,
      getItemId,
      selectionAnchorId: 'd',
      shiftSelectionBase: [item('a'), item('d')],
      node: { ...node('d'), selected: true },
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'a',
    ]);
    expect(result.removedItems.map(getItemId)).toEqual(['d']);
    expect(result.navigationFocusId).toBe('d');
  });

  test('shift+click extends from the anchor and keeps items outside the range', () => {
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [item('a'), item('d')],
      flattenedData,
      getItemId,
      selectionAnchorId: 'd',
      shiftSelectionBase: [item('a'), item('d')],
      node: node('b'),
      extendFromAnchor: true,
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(result.selectionAnchorId).toBe('d');
    expect(result.navigationFocusId).toBe('b');
  });

  test('consecutive shift+clicks replace the previous range from the same anchor', () => {
    const firstRange = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [item('a'), item('d')],
      flattenedData,
      getItemId,
      selectionAnchorId: 'd',
      shiftSelectionBase: [item('a'), item('d')],
      node: node('b'),
      extendFromAnchor: true,
    });
    const secondRange = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: firstRange.newSelection || [],
      flattenedData,
      getItemId,
      selectionAnchorId: firstRange.selectionAnchorId,
      shiftSelectionBase: firstRange.shiftSelectionBase,
      node: node('c'),
      extendFromAnchor: true,
    });
    expect(
      secondRange.newSelection && secondRange.newSelection.map(getItemId)
    ).toEqual(['a', 'c', 'd']);
    expect(secondRange.selectionAnchorId).toBe('d');
    expect(secondRange.navigationFocusId).toBe('c');
  });

  test('shift range skips root and placeholder rows', () => {
    const withPlaceholder = [
      node('root', false, { isRoot: true }),
      node('a'),
      node('placeholder', false, { isPlaceholder: true }),
      node('b'),
    ];
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [item('a')],
      flattenedData: withPlaceholder,
      getItemId,
      selectionAnchorId: 'a',
      shiftSelectionBase: [item('a')],
      node: node('b'),
      extendFromAnchor: true,
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'a',
      'b',
    ]);
  });

  test('exclusive click on the only selected item keeps the selection but still notifies', () => {
    // The parent must be notified again so it can, for instance, bring the
    // selection back to the front of a properties panel.
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [item('b')],
      flattenedData,
      getItemId,
      selectionAnchorId: 'b',
      shiftSelectionBase: [item('b')],
      node: { ...node('b'), selected: true },
      exclusive: true,
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'b',
    ]);
    expect(result.removedItems).toEqual([]);
    expect(result.navigationFocusId).toBe('b');
  });

  test('exclusive click collapses a multi-selection to the clicked item without reporting removals', () => {
    // Collapsing a multi-selection with a plain click is not a toggle-off
    // gesture: the other items must not be reported as removed, otherwise
    // clicking the child of a selected folder would drop the child too.
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [item('a'), item('b'), item('c')],
      flattenedData,
      getItemId,
      selectionAnchorId: 'a',
      shiftSelectionBase: [item('a'), item('b'), item('c')],
      node: { ...node('b'), selected: true },
      exclusive: true,
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'b',
    ]);
    expect(result.removedItems).toEqual([]);
  });
});
