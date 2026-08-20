// @flow
import * as React from 'react';
// `import type` is erased at compile time — no runtime circular dependency.
import {
  type ItemBaseAttributes,
  type FlattenedNode,
  type SelectArgs,
} from '.';

type ComputeArgs<Item: ItemBaseAttributes> = {|
  multiSelect: boolean,
  selectedItems: $ReadOnlyArray<Item>,
  flattenedData: $ReadOnlyArray<FlattenedNode<Item>>,
  getItemId: (item: Item) => string,
  selectionAnchorId: ?string,
  shiftSelectionBase: $ReadOnlyArray<Item>,
  node: FlattenedNode<Item>,
  exclusive?: boolean,
  extendFromAnchor?: boolean,
|};

export type ComputeTreeViewSelectionResult<Item: ItemBaseAttributes> = {|
  newSelection: Array<Item> | null,
  selectionAnchorId: ?string,
  shiftSelectionBase: Array<Item>,
  navigationFocusId: string,
|};

/**
 * Pure selection transition used by `useTreeViewSelection`. Exported so the
 * VS-Code-style range / toggle rules can be unit-tested without rendering.
 */
export function computeTreeViewSelection<Item: ItemBaseAttributes>({
  multiSelect,
  selectedItems,
  flattenedData,
  getItemId,
  selectionAnchorId,
  shiftSelectionBase,
  node,
  exclusive,
  extendFromAnchor,
}: ComputeArgs<Item>): ComputeTreeViewSelectionResult<Item> {
  if (multiSelect && extendFromAnchor) {
    const anchorIndex = selectionAnchorId
      ? flattenedData.findIndex(n => n.id === selectionAnchorId)
      : -1;
    const targetIndex = flattenedData.findIndex(n => n.id === node.id);

    if (anchorIndex === -1 || targetIndex === -1) {
      const newSelection = [node.item];
      return {
        newSelection,
        selectionAnchorId: node.id,
        shiftSelectionBase: newSelection,
        navigationFocusId: node.id,
      };
    }

    const startIndex = Math.min(anchorIndex, targetIndex);
    const endIndex = Math.max(anchorIndex, targetIndex);
    const rangeItemIds = new Set<string>();
    const rangeItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const rangeNode = flattenedData[i];
      if (rangeNode.item.isRoot || rangeNode.item.isPlaceholder) continue;
      rangeItemIds.add(rangeNode.id);
      rangeItems.push(rangeNode.item);
    }
    const baseItemsOutsideRange = shiftSelectionBase.filter(
      item => !rangeItemIds.has(getItemId(item))
    );
    return {
      newSelection: [...baseItemsOutsideRange, ...rangeItems],
      selectionAnchorId,
      shiftSelectionBase: [...shiftSelectionBase],
      navigationFocusId: node.id,
    };
  }

  let newSelection;
  if (multiSelect) {
    const selectedItemIds = selectedItems.map(getItemId);
    if (node.selected) {
      if (exclusive) {
        if (selectedItems.length === 1) {
          return {
            newSelection: null,
            selectionAnchorId,
            shiftSelectionBase: [...shiftSelectionBase],
            navigationFocusId: node.id,
          };
        }
        newSelection = [node.item];
      } else {
        newSelection = selectedItems.filter(
          (item, index) => selectedItemIds[index] !== node.id
        );
      }
    } else {
      if (exclusive) newSelection = [node.item];
      else newSelection = [...selectedItems, node.item];
    }
  } else {
    if (node.selected && selectedItems.length === 1) {
      return {
        newSelection: null,
        selectionAnchorId,
        shiftSelectionBase: [...shiftSelectionBase],
        navigationFocusId: node.id,
      };
    }
    newSelection = [node.item];
  }

  return {
    newSelection,
    selectionAnchorId: node.id,
    shiftSelectionBase: newSelection,
    navigationFocusId: node.id,
  };
}

/**
 * Manages anchor-based Shift+click / Shift+arrow range selection with
 * VS-Code-style "multi-range" behaviour:
 *
 *   Ctrl+10, Ctrl+8  →  [10, 8]        (anchor = 8, base = [10, 8])
 *   Shift+4          →  [10, 4..8]     (range merged with base outside range)
 *   Shift+6          →  [10, 6..8]
 *
 * The hook owns the refs and the cleanup effect so that the caller
 * (`TreeView`) keeps no selection-state knowledge beyond the controlled
 * `selectedItems` prop. `navigationFocusIdRef` is the last row the user
 * interacted with and is what keyboard arrows should move from.
 */
function useTreeViewSelection<Item: ItemBaseAttributes>({
  multiSelect,
  selectedItems,
  flattenedData,
  onSelectItems,
  getItemId,
}: {|
  multiSelect: boolean,
  selectedItems: $ReadOnlyArray<Item>,
  flattenedData: $ReadOnlyArray<FlattenedNode<Item>>,
  onSelectItems: (items: Array<Item>) => void,
  getItemId: (item: Item) => string,
|}): {|
  onSelect: (SelectArgs<Item>) => void,
  navigationFocusIdRef: {| current: ?string |},
|} {
  const selectionAnchorIdRef = React.useRef<?string>(null);
  const shiftSelectionBaseRef = React.useRef<Array<Item>>([]);
  const navigationFocusIdRef = React.useRef<?string>(null);

  // When the selection is cleared externally (e.g. Deselect All), stale
  // range-select refs must be reset so a later Shift+click doesn't extend
  // from a ghost anchor. Keyboard focus is kept so arrows continue from the
  // last interacted row.
  React.useEffect(
    () => {
      if (selectedItems.length === 0) {
        selectionAnchorIdRef.current = null;
        shiftSelectionBaseRef.current = [];
      }
    },
    [selectedItems]
  );

  const onSelect = React.useCallback(
    ({ node, exclusive, extendFromAnchor }: SelectArgs<Item>) => {
      const result = computeTreeViewSelection({
        multiSelect,
        selectedItems,
        flattenedData,
        getItemId,
        selectionAnchorId: selectionAnchorIdRef.current,
        shiftSelectionBase: shiftSelectionBaseRef.current,
        node,
        exclusive,
        extendFromAnchor,
      });
      navigationFocusIdRef.current = result.navigationFocusId;
      selectionAnchorIdRef.current = result.selectionAnchorId;
      shiftSelectionBaseRef.current = result.shiftSelectionBase;
      if (result.newSelection !== null) onSelectItems(result.newSelection);
    },
    [multiSelect, selectedItems, flattenedData, onSelectItems, getItemId]
  );

  return { onSelect, navigationFocusIdRef };
}

export { useTreeViewSelection };
