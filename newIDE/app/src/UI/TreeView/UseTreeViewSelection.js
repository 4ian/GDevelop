// @flow
import * as React from 'react';
// `import type` is erased at compile time — no runtime circular dependency.
import {
  type ItemBaseAttributes,
  type FlattenedNode,
  type SelectArgs,
} from '.';

// Inexact (+ rest) so tests can pass items with extra fields (e.g. `id`) and
// TreeView can pass exact FlattenedNode rows without invariance errors.
type SelectableTreeItem = { +isRoot?: boolean, +isPlaceholder?: boolean, ... };
type SelectableFlattenedNode<Item> = {
  +id: string,
  +selected: boolean,
  +item: Item,
  ...
};

type ComputeArgs<Item: SelectableTreeItem> = {|
  multiSelect: boolean,
  selectedItems: $ReadOnlyArray<Item>,
  flattenedData: $ReadOnlyArray<SelectableFlattenedNode<Item>>,
  getItemId: (item: Item) => string,
  selectionAnchorId: ?string,
  shiftSelectionBase: $ReadOnlyArray<Item>,
  node: SelectableFlattenedNode<Item>,
  exclusive?: boolean,
  extendFromAnchor?: boolean,
|};

export type ComputeTreeViewSelectionResult<Item: SelectableTreeItem> = {|
  newSelection: Array<Item> | null,
  // Items explicitly deselected by this gesture (Ctrl/Cmd+click toggle-off).
  // Callers can use this to also drop related items (e.g. the descendants of
  // a deselected folder) - which cannot be inferred from the selections alone.
  removedItems: Array<Item>,
  selectionAnchorId: ?string,
  shiftSelectionBase: Array<Item>,
  navigationFocusId: string,
|};

/**
 * Pure selection transition used by `useTreeViewSelection`. Exported so the
 * VS-Code-style range / toggle rules can be unit-tested without rendering.
 */
export function computeTreeViewSelection<Item: SelectableTreeItem>({
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
        removedItems: [],
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
      removedItems: [],
      selectionAnchorId,
      shiftSelectionBase: [...shiftSelectionBase],
      navigationFocusId: node.id,
    };
  }

  let newSelection;
  let removedItems: Array<Item> = [];
  if (multiSelect) {
    const selectedItemIds = selectedItems.map(getItemId);
    if (node.selected) {
      if (exclusive) {
        // Also when the node is already the only selected item: the parent
        // is notified again so it can, for instance, bring the selection
        // back to the front of a properties panel.
        newSelection = [node.item];
      } else {
        newSelection = selectedItems.filter(
          (item, index) => selectedItemIds[index] !== node.id
        );
        removedItems = [node.item];
      }
    } else {
      if (exclusive) newSelection = [node.item];
      else newSelection = [...selectedItems, node.item];
    }
  } else {
    if (node.selected && selectedItems.length === 1) {
      return {
        newSelection: null,
        removedItems: [],
        selectionAnchorId,
        shiftSelectionBase: [...shiftSelectionBase],
        navigationFocusId: node.id,
      };
    }
    newSelection = [node.item];
  }

  return {
    newSelection,
    removedItems,
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
  onSelectItems: (items: Array<Item>, removedItems?: Array<Item>) => void,
  getItemId: (item: Item) => string,
|}): {|
  onSelect: (SelectArgs<Item>) => void,
  navigationFocusIdRef: {| current: ?string |},
|} {
  const selectionAnchorIdRef = React.useRef<?string>(null);
  const shiftSelectionBaseRef = React.useRef<Array<Item>>([]);
  const navigationFocusIdRef = React.useRef<?string>(null);
  // Set right before `onSelect` notifies the parent, and consumed by the
  // effect below to tell user gestures apart from programmatic selection
  // changes (paste, duplicate, "move to folder"...).
  const selectionComesFromUserGestureRef = React.useRef<boolean>(false);

  React.useEffect(
    () => {
      const comesFromUserGesture = selectionComesFromUserGestureRef.current;
      selectionComesFromUserGestureRef.current = false;
      if (selectedItems.length === 0) {
        // When the selection is cleared (e.g. Deselect All), stale
        // range-select refs must be reset so a later Shift+click doesn't
        // extend from a ghost anchor. Keyboard focus is kept so arrows
        // continue from the last interacted row.
        selectionAnchorIdRef.current = null;
        shiftSelectionBaseRef.current = [];
        return;
      }
      if (comesFromUserGesture) return;
      // The selection was changed programmatically (paste, duplicate, "move
      // to folder"...) and no longer contains the last interacted row:
      // keyboard navigation and Shift ranges must restart from the new
      // selection, not from that now unrelated row.
      const selectedIds = new Set(selectedItems.map(getItemId));
      if (
        navigationFocusIdRef.current &&
        !selectedIds.has(navigationFocusIdRef.current)
      ) {
        navigationFocusIdRef.current = null;
        selectionAnchorIdRef.current = null;
        shiftSelectionBaseRef.current = [];
      }
    },
    [selectedItems, getItemId]
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
      if (result.newSelection !== null) {
        selectionComesFromUserGestureRef.current = true;
        onSelectItems(result.newSelection, result.removedItems);
      }
    },
    [multiSelect, selectedItems, flattenedData, onSelectItems, getItemId]
  );

  return { onSelect, navigationFocusIdRef };
}

export { useTreeViewSelection };
