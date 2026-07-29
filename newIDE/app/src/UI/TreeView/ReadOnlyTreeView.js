// @flow

import * as React from 'react';
import { VariableSizeList } from 'react-window';
import memoizeOne from 'memoize-one';
import classes from './TreeView.module.css';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import ReadOnlyTreeViewRow from './ReadOnlyTreeViewRow';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import useForceUpdate from '../../Utils/UseForceUpdate';
import {
  type StickyRow,
  STICKY_ROWS_DEFAULT_MAX_COUNT,
  computeParentIndexes,
  computeStickyRows,
  areStickyRowsEqual,
  getStickyAncestorsHeight,
  findSurfaceBackgroundColor,
} from './StickyRows';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

export const navigationKeys = [
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Enter',
];

const doesMatchSearch = (name: string | React.Node, searchText: string) =>
  typeof name === 'string' && name.toLowerCase().includes(searchText);

const browseTree = <Item>(
  items: Item[],
  getItemChildren: Item => ?(Item[]),
  callback: Item => void
) => {
  items.forEach(item => {
    callback(item);
    const children = getItemChildren(item);
    if (children) {
      browseTree(children, getItemChildren, callback);
    }
  });
};

export type ItemBaseAttributes = {
  +isRoot?: boolean,
  +isPlaceholder?: boolean,
  +displayAsPrimaryButton?: boolean,
  +openIfSearchMatches?: boolean,
  +openWithSingleClick?: boolean,
};

type FlattenedNode<Item> = {|
  id: string,
  name: string | React.Node,
  description?: string,
  hasChildren: boolean,
  canHaveChildren: boolean,
  extraClass: string,
  depth: number,
  dataset?: ?HTMLDataset,
  collapsed: boolean,
  selected: boolean,
  disableCollapse: boolean,
  thumbnailSrc?: ?string,
  item: Item,
|};

export type ItemData<Item> = {|
  onOpen: (FlattenedNode<Item>, index: number) => void,
  onClick: (FlattenedNode<Item>) => void,
  onSelect: ({| node: FlattenedNode<Item>, exclusive?: boolean |}) => void,
  flattenedData: FlattenedNode<Item>[],
  isMobile: boolean,
  getItemHtmlId?: (Item, index: number) => ?string,
|};

const getItemProps = memoizeOne(
  <Item>(
    flattenedData: FlattenedNode<Item>[],
    onOpen: (FlattenedNode<Item>, index: number) => void,
    onClick: (FlattenedNode<Item>) => void,
    onSelect: ({| node: FlattenedNode<Item>, exclusive?: boolean |}) => void,
    isMobile: boolean,
    getItemHtmlId?: (Item, index: number) => ?string
  ): ItemData<Item> => ({
    onOpen,
    onClick,
    onSelect,
    flattenedData,
    isMobile,
    getItemHtmlId,
  })
);

export type ReadOnlyTreeViewInterface<Item> = {|
  forceUpdateList: () => void,
  scrollTo: (offset: number) => void,
  scrollToItem: (Item, placement?: 'smart' | 'start') => void,
  scrollToItemFromId: (itemId: string, placement?: 'smart' | 'start') => void,
  openItems: (string[]) => void,
  closeItems: (string[]) => void,
  animateItem: Item => void,
  animateItemFromId: (itemId: string) => void,
  areItemsOpen: (Array<Item>) => boolean[],
  areItemsOpenFromId: (Array<string>) => boolean[],
  updateRowHeights: () => void,
  // TODO: Port this logic to the TreeView component.
  getDisplayedItemsIterator: () => Iterable<Item>,
  // TODO: Port this logic to the TreeView component.
  getDisplayedItemsCount: () => number,
|};

type Props<Item> = {|
  height: number,
  width?: number,
  items: Item[],
  estimatedItemSize: number,
  getItemHeight: Item => number,
  /**
   * Return false if the item should be displayed even if a search text is given
   * and the item name does not match it. This allows for more complex search
   * in the parent.
   * TODO: Port this logic to the TreeView component.
   */
  shouldApplySearchToItem: Item => boolean,
  getItemName: Item => string | React.Node,
  getItemDescription?: Item => string,
  getItemId: Item => string,
  getItemHtmlId?: (Item, index: number) => ?string,
  getItemChildren: Item => ?(Item[]),
  getItemThumbnail?: Item => ?string,
  getItemDataset?: Item => ?HTMLDataset,
  /**
   * Callback called when a folder is collapsed (folded).
   */
  onCollapseItem?: (Item: Item) => void,
  searchText?: string,
  selectedItems: $ReadOnlyArray<Item>,
  onClickItem?: Item => void,
  onSelectItems: (Item[]) => void,
  multiSelect: boolean,
  forceAllOpened?: boolean,
  initiallyOpenedNodeIds?: string[],
  arrowKeyNavigationProps?: {|
    onGetItemInside: (item: Item) => ?Item,
    onGetItemOutside: (item: Item) => ?Item,
  |},
  /**
   * If true, the ancestors (folders, root sections) of the first visible item
   * are kept displayed as sticky rows at the top of the list when scrolling.
   */
  enableStickyAncestors?: boolean,
|};

const ReadOnlyTreeView = <Item: ItemBaseAttributes>(
  {
    height,
    width,
    items,
    searchText,
    estimatedItemSize,
    getItemHeight,
    shouldApplySearchToItem,
    getItemName,
    getItemDescription,
    getItemId,
    getItemHtmlId,
    getItemChildren,
    getItemThumbnail,
    getItemDataset,
    selectedItems,
    onClickItem,
    onSelectItems,
    multiSelect,
    onCollapseItem,
    forceAllOpened,
    initiallyOpenedNodeIds,
    arrowKeyNavigationProps,
    enableStickyAncestors,
  }: Props<Item>,
  ref: ReadOnlyTreeViewInterface<Item>
  // $FlowFixMe[missing-local-annot]
) => {
  const selectedNodeIds = selectedItems.map(getItemId);
  const [isRendered, setIsRendered] = React.useState<boolean>(false);
  const bufferedScrollingCommandRef = React.useRef<?() => void>(null);
  const [openedNodeIds, setOpenedNodeIds] = React.useState<string[]>(
    initiallyOpenedNodeIds || []
  );
  const containerRef = React.useRef<?HTMLDivElement>(null);
  // $FlowFixMe[value-as-type]
  const listRef = React.useRef<?VariableSizeList>(null);
  const [
    openedDuringSearchNodeIds,
    setOpenedDuringSearchNodeIds,
  ] = React.useState<string[]>([]);
  const { isMobile } = useResponsiveWindowSize();
  const forceUpdate = useForceUpdate();
  const [animatedItemId, setAnimatedItemId] = React.useState<string>('');

  const isSearching = !!searchText;
  // $FlowFixMe[recursive-definition]
  // $FlowFixMe[definition-cycle]
  const flattenNode = React.useCallback(
    (
      item: Item,
      depth: number,
      searchText: ?string,
      forceOpen: boolean
    ): FlattenedNode<Item>[] => {
      const id = getItemId(item);
      const children = getItemChildren(item);
      const canHaveChildren = Array.isArray(children);
      const collapsed = !forceAllOpened && !openedNodeIds.includes(id);
      const openedDuringSearch = openedDuringSearchNodeIds.includes(id);
      let flattenedChildren: Array<FlattenedNode<Item>> = [];
      /*
       * Compute children nodes flattening if:
       * - node has children;
       * and if either one of these conditions are true:
       * - the nodes are force-opened (props)
       * - the node is opened (not collapsed)
       * - the user is searching
       * - the user opened the node during the search
       */
      if (
        children &&
        (forceAllOpened || !collapsed || !!searchText || openedDuringSearch)
      ) {
        flattenedChildren = children
          .map(child =>
            flattenNode(child, depth + 1, searchText, openedDuringSearch)
          )
          .flat();
      }

      const name = getItemName(item);
      const description = getItemDescription
        ? getItemDescription(item)
        : undefined;
      const dataset = getItemDataset ? getItemDataset(item) : undefined;
      const extraClass =
        animatedItemId && id === animatedItemId ? classes.animate : '';
      const applySearch = shouldApplySearchToItem(item);

      /*
       * Append node to result if either:
       * - the user is not searching
       * - the nodes are force-opened (props)
       * - the node is force-opened (if user opened the node during the search)
       * - the node name matches the search
       * - the node contains children that should be displayed
       */
      if (
        !searchText ||
        forceAllOpened ||
        forceOpen ||
        (!applySearch || doesMatchSearch(name, searchText)) ||
        flattenedChildren.length > 0
      ) {
        const thumbnailSrc = getItemThumbnail ? getItemThumbnail(item) : null;
        const selected = selectedNodeIds.includes(id);
        return [
          {
            id,
            name,
            description,
            hasChildren: !!children && children.length > 0,
            canHaveChildren,
            depth,
            selected,
            thumbnailSrc,
            dataset,
            item,
            extraClass,
            /*
             * If the user is searching, the node should be opened if either:
             * - it has children that should be displayed
             * - the user opened it
             */
            collapsed: !!searchText
              ? flattenedChildren.length === 0 || !openedDuringSearch
              : collapsed,
            /*
             * Disable opening of the node if:
             * - the user is searching
             * - the node has children to be displayed but it's not because the user opened it
             */
            disableCollapse:
              !!searchText &&
              flattenedChildren.length > 0 &&
              !openedDuringSearch,
          },
          ...flattenedChildren,
        ];
      }
      return [];
    },
    [
      getItemId,
      getItemChildren,
      shouldApplySearchToItem,
      forceAllOpened,
      openedNodeIds,
      openedDuringSearchNodeIds,
      getItemName,
      getItemDescription,
      getItemDataset,
      animatedItemId,
      getItemThumbnail,
      selectedNodeIds,
    ]
  );

  const flattenOpened = React.useCallback(
    (items: Item[], searchText: ?string): FlattenedNode<Item>[] => {
      return items.map(item => flattenNode(item, 0, searchText, false)).flat();
    },
    [flattenNode]
  );

  const onOpen = React.useCallback(
    (node: FlattenedNode<Item>, index: number) => {
      if (isSearching) {
        if (node.collapsed) {
          setOpenedDuringSearchNodeIds([...openedDuringSearchNodeIds, node.id]);
        } else {
          if (!forceAllOpened)
            setOpenedDuringSearchNodeIds(
              openedDuringSearchNodeIds.filter(id => id !== node.id)
            );
        }
      } else {
        if (node.collapsed) {
          setOpenedNodeIds([...openedNodeIds, node.id]);
        } else {
          if (!forceAllOpened) {
            if (onCollapseItem) onCollapseItem(node.item);
            setOpenedNodeIds(openedNodeIds.filter(id => id !== node.id));
          }
        }
      }
      if (listRef.current) listRef.current.resetAfterIndex(index);
    },
    [
      openedDuringSearchNodeIds,
      openedNodeIds,
      isSearching,
      forceAllOpened,
      onCollapseItem,
    ]
  );

  const onSelect = React.useCallback(
    ({
      node,
      exclusive,
    }: {|
      node: FlattenedNode<Item>,
      exclusive?: boolean,
    |}) => {
      if (multiSelect) {
        if (node.selected) {
          if (exclusive) {
            if (selectedItems.length === 1) return;
            onSelectItems([node.item]);
          } else
            onSelectItems(selectedItems.filter(item => item !== node.item));
        } else {
          if (exclusive) onSelectItems([node.item]);
          else onSelectItems([...selectedItems, node.item]);
        }
      } else {
        if (node.selected && selectedItems.length === 1) return;
        onSelectItems([node.item]);
      }
    },
    [multiSelect, onSelectItems, selectedItems]
  );

  const onClick = React.useCallback(
    (node: FlattenedNode<Item>) => {
      if (onClickItem) {
        onClickItem(node.item);
      }
    },
    [onClickItem]
  );

  const flattenedData = React.useMemo(
    () => flattenOpened(items, searchText ? searchText.toLowerCase() : null),
    [flattenOpened, items, searchText]
  );

  const getRowHeight = React.useCallback(
    (index: number) => getItemHeight(flattenedData[index].item),
    [getItemHeight, flattenedData]
  );

  // Top offset of each row (rows have variable heights).
  const rowTops: Array<number> = React.useMemo(
    () => {
      if (!enableStickyAncestors) return [];
      const rowTops: Array<number> = new Array(flattenedData.length);
      let top = 0;
      for (let index = 0; index < flattenedData.length; index++) {
        rowTops[index] = top;
        top += getRowHeight(index);
      }
      return rowTops;
    },
    [enableStickyAncestors, flattenedData, getRowHeight]
  );

  const getRowIndexAt = React.useCallback(
    (offset: number) => {
      // Binary search of the last row starting at or before the offset.
      let low = 0;
      let high = rowTops.length - 1;
      let result = -1;
      while (low <= high) {
        const middle = (low + high) >> 1;
        if (rowTops[middle] <= offset) {
          result = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      return result;
    },
    [rowTops]
  );

  const parentIndexes = React.useMemo(
    () => (enableStickyAncestors ? computeParentIndexes(flattenedData) : []),
    [enableStickyAncestors, flattenedData]
  );
  const [stickyRows, setStickyRows] = React.useState<StickyRow[]>([]);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [surfaceBackgroundColor, setSurfaceBackgroundColor] = React.useState<
    string | null
  >(null);
  const hasStickyRows = stickyRows.length > 0;
  // The sticky rows must be opaque, matching the surface (panel, dialog...)
  // the tree view is displayed on: measure it when they appear (and re-measure
  // if the theme changes).
  React.useLayoutEffect(
    () => {
      if (!enableStickyAncestors || !hasStickyRows) return;
      const backgroundColor = findSurfaceBackgroundColor(containerRef.current);
      setSurfaceBackgroundColor(existingBackgroundColor =>
        existingBackgroundColor === backgroundColor
          ? existingBackgroundColor
          : backgroundColor
      );
    },
    [enableStickyAncestors, hasStickyRows, gdevelopTheme]
  );
  const scrollOffsetRef = React.useRef<number>(0);
  const listOuterRef = React.useRef<?HTMLDivElement>(null);

  const updateStickyRows = React.useCallback(
    () => {
      if (!enableStickyAncestors) return;
      const newStickyRows = computeStickyRows({
        flattenedData,
        parentIndexes,
        scrollOffset: scrollOffsetRef.current,
        listHeight: height,
        maxCount: STICKY_ROWS_DEFAULT_MAX_COUNT,
        getRowTop: index => rowTops[index],
        getRowHeight,
        getRowIndexAt,
      });
      setStickyRows(stickyRows =>
        areStickyRowsEqual(stickyRows, newStickyRows)
          ? stickyRows
          : newStickyRows
      );
    },
    [
      enableStickyAncestors,
      flattenedData,
      parentIndexes,
      height,
      rowTops,
      getRowHeight,
      getRowIndexAt,
    ]
  );

  // useLayoutEffect so that, when the tree changes (folder collapsed,
  // search...), the sticky rows are recomputed before the browser paints:
  // they hold indexes in flattenedData that could be stale.
  React.useLayoutEffect(
    () => {
      updateStickyRows();
    },
    [updateStickyRows]
  );

  const onScroll = React.useCallback(
    ({ scrollOffset }: {| scrollOffset: number |}) => {
      scrollOffsetRef.current = scrollOffset;
      updateStickyRows();
    },
    [updateStickyRows]
  );

  const onClickStickyRow = React.useCallback(
    (rowRank: number, flattenedDataIndex: number) => {
      const list = listRef.current;
      if (!list) return;
      // Reveal the item: scroll so that the actual row lands exactly below
      // its own sticky ancestors (at which point it is no longer sticky itself).
      const stickyAncestorsHeight = stickyRows
        .slice(0, rowRank)
        .reduce((total, row) => total + row.height, 0);
      list.scrollTo(
        Math.max(0, rowTops[flattenedDataIndex] - stickyAncestorsHeight)
      );
    },
    [stickyRows, rowTops]
  );

  const scrollToItemFromId = React.useCallback(
    (itemId: string, placement?: 'smart' | 'start' = 'smart') => {
      const list = listRef.current;
      if (list) {
        const index = flattenedData.findIndex(node => node.id === itemId);
        if (index >= 0) {
          const scrollCommand = !enableStickyAncestors
            ? () => list.scrollToItem(index, placement)
            : () => {
                // Scroll so that the item is not covered by its sticky ancestors.
                const stickyRowsHeight = getStickyAncestorsHeight({
                  parentIndexes,
                  index,
                  maxCount: STICKY_ROWS_DEFAULT_MAX_COUNT,
                  listHeight: height,
                  getRowHeight,
                });
                const itemTop = rowTops[index];
                const itemBottom = itemTop + getRowHeight(index);
                const scrollOffset = scrollOffsetRef.current;
                if (
                  placement === 'start' ||
                  itemTop < scrollOffset + stickyRowsHeight
                ) {
                  list.scrollTo(Math.max(0, itemTop - stickyRowsHeight));
                } else if (itemBottom > scrollOffset + height) {
                  list.scrollTo(itemBottom - height);
                }
                // Otherwise, the item is already entirely visible below the
                // sticky rows: don't scroll.
              };
          if (isRendered) {
            scrollCommand();
          } else {
            bufferedScrollingCommandRef.current = scrollCommand;
          }
        }
      }
    },
    [
      flattenedData,
      isRendered,
      enableStickyAncestors,
      parentIndexes,
      height,
      rowTops,
      getRowHeight,
    ]
  );

  const scrollToItem = React.useCallback(
    (item: Item, placement?: 'smart' | 'start' = 'smart') =>
      scrollToItemFromId(getItemId(item), placement),
    [getItemId, scrollToItemFromId]
  );

  const scrollTo = React.useCallback(
    (offset: number) => {
      const list = listRef.current;
      if (list) {
        if (isRendered) {
          list.scrollTo(offset);
        } else {
          bufferedScrollingCommandRef.current = () => {
            list.scrollTo(offset);
          };
        }
      }
    },
    [isRendered]
  );

  React.useEffect(
    () => {
      if (isRendered && bufferedScrollingCommandRef.current) {
        bufferedScrollingCommandRef.current();
        bufferedScrollingCommandRef.current = null;
      }
    },
    // Scroll commands do not work before the tree is rendered so the last scroll
    // command is buffered and run when the tree view rendered for the first time.
    // TODO: Port this logic to the TreeView component.
    [isRendered]
  );

  const openItems = React.useCallback(
    (itemIds: string[]) => {
      const notAlreadyOpenedNodeIds = itemIds.filter(
        itemId => !openedNodeIds.includes(itemId)
      );
      if (notAlreadyOpenedNodeIds.length > 0)
        setOpenedNodeIds([...openedNodeIds, ...notAlreadyOpenedNodeIds]);
    },
    [openedNodeIds]
  );

  const closeItems = React.useCallback(
    (itemIds: string[]) => {
      const newOpenedNodesIds = openedNodeIds.filter(
        openedNodeId => !itemIds.includes(openedNodeId)
      );
      setOpenedNodeIds(newOpenedNodesIds);
    },
    [openedNodeIds]
  );

  const updateRowHeights = React.useCallback(() => {
    if (listRef.current) listRef.current.resetAfterIndex(0);
  }, []);

  const animateItem = React.useCallback(
    (item: Item) => {
      setAnimatedItemId(getItemId(item));
    },
    [getItemId]
  );

  const animateItemFromId = React.useCallback((itemId: string) => {
    setAnimatedItemId(itemId);
  }, []);

  const areItemsOpen = React.useCallback(
    (items: Item[]) => {
      const itemIds = items.map(getItemId);
      const openedNodeIdsSet = new Set(openedNodeIds);
      return itemIds.map(id => openedNodeIdsSet.has(id));
    },
    [openedNodeIds, getItemId]
  );

  const areItemsOpenFromId = React.useCallback(
    (itemIds: Array<string>) => {
      const openedNodeIdsSet = new Set(openedNodeIds);
      return itemIds.map(id => openedNodeIdsSet.has(id));
    },
    [openedNodeIds]
  );

  React.useEffect(
    () => {
      if (animatedItemId) {
        const timeoutId = setTimeout(
          // Animated item must be reset to remove the extra class to the node.
          // Otherwise, if it has to be animated once again, the class is already here
          // and the animation won't play.
          () => setAnimatedItemId(''),
          // Corresponds to the duration of the CSS animation.
          400
        );
        return () => clearTimeout(timeoutId);
      }
    },
    [animatedItemId]
  );

  const getDisplayedItemsIterator = React.useCallback(
    function*() {
      for (let i = 0; i < flattenedData.length; i++) {
        yield flattenedData[i].item;
      }
    },
    [flattenedData]
  );
  const getDisplayedItemsCount = React.useCallback(
    () => {
      return flattenedData.length;
    },
    [flattenedData]
  );

  React.useImperativeHandle(
    // $FlowFixMe[incompatible-type]
    ref,
    () => ({
      forceUpdateList: forceUpdate,
      scrollTo,
      scrollToItem,
      scrollToItemFromId,
      openItems,
      closeItems,
      animateItem,
      animateItemFromId,
      areItemsOpen,
      areItemsOpenFromId,
      updateRowHeights,
      getDisplayedItemsIterator,
      getDisplayedItemsCount,
    })
  );

  const itemData: ItemData<Item> = getItemProps<Item>(
    flattenedData,
    onOpen,
    onClick,
    onSelect,
    isMobile,
    getItemHtmlId
  );

  React.useEffect(
    () => {
      if (!searchText) {
        setOpenedDuringSearchNodeIds([]);
      } else {
        const openedNodes = [];
        browseTree(items, getItemChildren, item => {
          const itemName = getItemName(item);
          if (
            doesMatchSearch(itemName, searchText) &&
            item.openIfSearchMatches
          ) {
            openedNodes.push(getItemId(item));
          }
        });
        setOpenedDuringSearchNodeIds(openedNodes);
      }
    },
    // When the search changes, recompute the nodes that should be opened
    // by default.
    [searchText, items, getItemName, getItemId, getItemChildren]
  );

  const onKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (!navigationKeys.includes(event.key)) return;
      let newFocusedItem;
      const item = selectedItems[0];
      let itemIndexInFlattenedData = -1;
      if (item) {
        itemIndexInFlattenedData = flattenedData.findIndex(
          node => node.id === getItemId(item)
        );
      }

      if (itemIndexInFlattenedData === -1) {
        // If no row is selected, start from the first row that is selectable.
        let i = 0;
        let newFocusedNode = flattenedData[i];
        while (
          newFocusedNode &&
          (newFocusedNode.item.isRoot || newFocusedNode.item.isPlaceholder)
        ) {
          i += 1;
          if (i > flattenedData.length - 1) {
            // $FlowFixMe[incompatible-type]
            newFocusedNode = null;
          }
          newFocusedNode = flattenedData[i];
        }
        if (newFocusedNode) {
          newFocusedItem = newFocusedNode.item;
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (itemIndexInFlattenedData < flattenedData.length - 1) {
          let delta = 1;
          let newFocusedNode = flattenedData[itemIndexInFlattenedData + delta];
          while (
            newFocusedNode &&
            (newFocusedNode.item.isRoot || newFocusedNode.item.isPlaceholder)
          ) {
            if (itemIndexInFlattenedData + delta > flattenedData.length - 1) {
              // $FlowFixMe[incompatible-type]
              newFocusedNode = null;
            }
            delta += 1;
            newFocusedNode = flattenedData[itemIndexInFlattenedData + delta];
          }
          if (newFocusedNode) {
            newFocusedItem = newFocusedNode.item;
          }
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (itemIndexInFlattenedData > 0) {
          let delta = -1;
          let newFocusedNode = flattenedData[itemIndexInFlattenedData + delta];
          while (
            newFocusedNode &&
            (newFocusedNode.item.isRoot || newFocusedNode.item.isPlaceholder)
          ) {
            if (itemIndexInFlattenedData + delta < 0) {
              // $FlowFixMe[incompatible-type]
              newFocusedNode = null;
            }
            delta -= 1;
            newFocusedNode = flattenedData[itemIndexInFlattenedData + delta];
          }
          if (newFocusedNode) {
            newFocusedItem = newFocusedNode.item;
          }
        }
      } else if (event.key === 'ArrowRight' && arrowKeyNavigationProps) {
        event.preventDefault();
        const node = flattenedData[itemIndexInFlattenedData];
        if (node.canHaveChildren && node.collapsed) {
          openItems([node.id]);
        } else {
          newFocusedItem = arrowKeyNavigationProps.onGetItemInside(item);
        }
      } else if (event.key === 'ArrowLeft' && arrowKeyNavigationProps) {
        event.preventDefault();
        const node = flattenedData[itemIndexInFlattenedData];
        if (node.canHaveChildren && !node.collapsed) {
          closeItems([node.id]);
        } else {
          newFocusedItem = arrowKeyNavigationProps.onGetItemOutside(item);
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const focusedNode = flattenedData[itemIndexInFlattenedData];
        if (onClickItem) {
          onClickItem(focusedNode.item);
        }
      }
      if (newFocusedItem) {
        scrollToItem(newFocusedItem);
        onSelectItems([newFocusedItem]);
      }
    },
    [
      selectedItems,
      arrowKeyNavigationProps,
      flattenedData,
      getItemId,
      openItems,
      closeItems,
      onClickItem,
      scrollToItem,
      onSelectItems,
    ]
  );

  return (
    <div
      tabIndex={0}
      className={classes.treeView}
      onKeyDown={onKeyDown}
      ref={containerRef}
    >
      <VariableSizeList
        height={height}
        itemCount={flattenedData.length}
        estimatedItemSize={estimatedItemSize}
        itemSize={index => getItemHeight(flattenedData[index].item)}
        width={typeof width === 'number' ? width : '100%'}
        itemKey={index => flattenedData[index].id}
        // Flow does not seem to accept the generic used in VariableSizeList
        // can itself use a generic.
        // $FlowFixMe[incompatible-type]
        itemData={itemData}
        ref={listRef}
        outerRef={listOuterRef}
        onScroll={enableStickyAncestors ? onScroll : undefined}
        // Keep overscanCount relatively high so that:
        // - during in-app tutorials we make sure the tooltip displayer finds
        //   the elements to highlight
        overscanCount={20}
        onItemsRendered={() => setIsRendered(true)}
      >
        {ReadOnlyTreeViewRow}
      </VariableSizeList>
      {enableStickyAncestors && stickyRows.length > 0 && (
        <div
          className={classes.stickyRowsContainer}
          style={{
            height:
              stickyRows[stickyRows.length - 1].top +
              stickyRows[stickyRows.length - 1].height,
            // Do not cover the scrollbar of the list, if any.
            right: listOuterRef.current
              ? listOuterRef.current.offsetWidth -
                listOuterRef.current.clientWidth
              : 0,
          }}
        >
          {stickyRows
            .map((stickyRow, rowRank) => {
              const node = flattenedData[stickyRow.index];
              // The sticky rows can reference rows that no longer exist
              // during the render following a change of the tree - they
              // are recomputed in a layout effect, before painting.
              if (!node) return null;
              return (
                <div
                  key={node.id}
                  className={classes.stickyRow}
                  style={{
                    top: stickyRow.top,
                    height: stickyRow.height,
                    backgroundColor: surfaceBackgroundColor || undefined,
                  }}
                  onClick={() => onClickStickyRow(rowRank, stickyRow.index)}
                >
                  <ReadOnlyTreeViewRow
                    index={stickyRow.index}
                    style={{ height: stickyRow.height }}
                    data={{
                      ...itemData,
                      // When collapsing from a sticky row, also reveal the
                      // actual row so the user does not lose their position.
                      onOpen: (node, index) => {
                        onOpen(node, index);
                        onClickStickyRow(rowRank, stickyRow.index);
                      },
                    }}
                    isSticky
                  />
                </div>
              );
            })
            // Render in reverse DOM order so that, during the "push"
            // transition, the deepest row slides under its ancestors.
            .reverse()}
        </div>
      )}
    </div>
  );
};

// $FlowFixMe[incompatible-type]
// $FlowFixMe[incompatible-exact]
export default (React.forwardRef(ReadOnlyTreeView): React.ComponentType<{
  ...Props<any>,
  +ref?: React.RefSetter<any>,
}>);
