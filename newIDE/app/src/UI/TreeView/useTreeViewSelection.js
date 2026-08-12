// @flow
import * as React from 'react';
// `import type` is erased at compile time — no runtime circular dependency.
import { type ItemBaseAttributes, type FlattenedNode, type SelectArgs } from '.';

/**
 * Manages anchor-based Shift+click / Shift+arrow range selection with
 * VS-Code-style "multi-range" behaviour:
 *
 *   Ctrl+10, Ctrl+8  →  [10, 8]        (anchor = 8, base = [10, 8])
 *   Shift+4          →  [10, 4..8]     (range merged with base outside range)
 *   Shift+6          →  [10, 6..8]
 *
 * The hook owns the two refs and the cleanup effect so that the caller
 * (`TreeView`) keeps no selection-state knowledge beyond the controlled
 * `selectedItems` prop.
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
|}): (SelectArgs<Item>) => void {
  // Anchor for Shift+click/Shift+arrow range selection. Updated only on a
  // non-range selection so that consecutive Shift-selections extend from the
  // same starting point.
  const selectionAnchorIdRef = React.useRef<?string>(null);

  // Snapshot of the selection at the time the anchor was last set, i.e. just
  // before any Shift extension. Allows items outside the current range to
  // survive a Shift+click (VS Code / Cursor behaviour).
  const shiftSelectionBaseRef = React.useRef<Array<Item>>([]);

  // When the selection is cleared externally (e.g. Deselect All), stale refs
  // must be reset so a later Shift+click doesn't extend from a ghost anchor.
  // Note: the anchor is NOT updated when the selection changes externally for
  // reasons other than clearing (e.g. selecting an item on the canvas or after
  // paste/duplicate). In those cases the next Shift+click extends from the last
  // anchor set inside this hook, not from the externally selected item.
  React.useEffect(
    () => {
      if (selectedItems.length === 0) {
        selectionAnchorIdRef.current = null;
        shiftSelectionBaseRef.current = [];
      }
    },
    [selectedItems]
  );

  return React.useCallback(
    ({ node, exclusive, extendFromAnchor }: SelectArgs<Item>) => {
      if (multiSelect && extendFromAnchor) {
        const anchorId = selectionAnchorIdRef.current;
        const anchorIndex = anchorId
          ? flattenedData.findIndex(n => n.id === anchorId)
          : -1;
        const targetIndex = flattenedData.findIndex(n => n.id === node.id);

        if (anchorIndex === -1 || targetIndex === -1) {
          const newSelection = [node.item];
          selectionAnchorIdRef.current = node.id;
          shiftSelectionBaseRef.current = newSelection;
          onSelectItems(newSelection);
          return;
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
        // Keep Ctrl+clicked items from before the Shift extension that fall
        // outside the current anchor→target range.
        const baseItemsOutsideRange = shiftSelectionBaseRef.current.filter(
          item => !rangeItemIds.has(getItemId(item))
        );
        onSelectItems([...baseItemsOutsideRange, ...rangeItems]);
        return;
      }

      // Non-Shift path: compute the new selection explicitly so we can
      // snapshot it into shiftSelectionBaseRef before notifying the parent.
      let newSelection;
      if (multiSelect) {
        const selectedItemIds = selectedItems.map(getItemId);
        if (node.selected) {
          if (exclusive) {
            if (selectedItems.length === 1) return;
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
        if (node.selected && selectedItems.length === 1) return;
        newSelection = [node.item];
      }

      onSelectItems(newSelection);
      selectionAnchorIdRef.current = node.id;
      shiftSelectionBaseRef.current = newSelection;
    },
    [multiSelect, selectedItems, flattenedData, onSelectItems, getItemId]
  );
}

export { useTreeViewSelection };
