// @flow
import { computeTreeViewSelection } from './UseTreeViewSelection';

type Item = {|
  id: string,
  isRoot?: boolean,
  isPlaceholder?: boolean,
|};

const node = (
  id: string,
  selected: boolean = false,
  extra?: {| isRoot?: boolean, isPlaceholder?: boolean |}
) => ({
  id,
  name: id,
  rightComponent: null,
  rightButton: null,
  shouldHideMenuIcon: null,
  hasChildren: false,
  canHaveChildren: false,
  extraClass: '',
  depth: 0,
  collapsed: false,
  selected,
  disableCollapse: false,
  item: { id, ...extra },
});

const getItemId = (item: Item) => item.id;

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
      selectedItems: [{ id: 'a' }],
      flattenedData,
      getItemId,
      selectionAnchorId: 'a',
      shiftSelectionBase: [{ id: 'a' }],
      node: node('d'),
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'a',
      'd',
    ]);
    expect(result.selectionAnchorId).toBe('d');
    expect(result.navigationFocusId).toBe('d');
  });

  test('ctrl+click on a selected item toggles it off and keeps keyboard focus on it', () => {
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [{ id: 'a' }, { id: 'd' }],
      flattenedData,
      getItemId,
      selectionAnchorId: 'd',
      shiftSelectionBase: [{ id: 'a' }, { id: 'd' }],
      node: { ...node('d'), selected: true },
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'a',
    ]);
    expect(result.navigationFocusId).toBe('d');
  });

  test('shift+click extends from the anchor and keeps items outside the range', () => {
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [{ id: 'a' }, { id: 'd' }],
      flattenedData,
      getItemId,
      selectionAnchorId: 'd',
      shiftSelectionBase: [{ id: 'a' }, { id: 'd' }],
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
      selectedItems: [{ id: 'a' }, { id: 'd' }],
      flattenedData,
      getItemId,
      selectionAnchorId: 'd',
      shiftSelectionBase: [{ id: 'a' }, { id: 'd' }],
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
      selectedItems: [{ id: 'a' }],
      flattenedData: withPlaceholder,
      getItemId,
      selectionAnchorId: 'a',
      shiftSelectionBase: [{ id: 'a' }],
      node: node('b'),
      extendFromAnchor: true,
    });
    expect(result.newSelection && result.newSelection.map(getItemId)).toEqual([
      'a',
      'b',
    ]);
  });

  test('exclusive click on the only selected item is a no-op for the selection', () => {
    const result = computeTreeViewSelection({
      multiSelect: true,
      selectedItems: [{ id: 'b' }],
      flattenedData,
      getItemId,
      selectionAnchorId: 'b',
      shiftSelectionBase: [{ id: 'b' }],
      node: { ...node('b'), selected: true },
      exclusive: true,
    });
    expect(result.newSelection).toBe(null);
    expect(result.navigationFocusId).toBe('b');
  });
});
