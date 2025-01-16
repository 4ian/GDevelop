// @flow

import * as React from 'react';
import { VariableSizeList } from 'react-window';
import memoizeOne from 'memoize-one';
import classes from './TreeView.module.css';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import ReadOnlyTreeViewRow from './ReadOnlyTreeViewRow';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import useForceUpdate from '../../Utils/UseForceUpdate';

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
  }: Props<Item>,
  ref: ReadOnlyTreeViewInterface<Item>
) => {
  const selectedNodeIds = selectedItems.map(getItemId);
  const [isRendered, setIsRendered] = React.useState<boolean>(false);
  const bufferedScrollingCommandRef = React.useRef<?() => void>(null);
  const [openedNodeIds, setOpenedNodeIds] = React.useState<string[]>(
    initiallyOpenedNodeIds || []
  );
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const listRef = React.useRef<?VariableSizeList>(null);
  const [
    openedDuringSearchNodeIds,
    setOpenedDuringSearchNodeIds,
  ] = React.useState<string[]>([]);
  const { isMobile } = useResponsiveWindowSize();
  const forceUpdate = useForceUpdate();
  const [animatedItemId, setAnimatedItemId] = React.useState<string>('');

  const isSearching = !!searchText;
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
      let flattenedChildren = [];
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

  const scrollToItemFromId = React.useCallback(
    (itemId: string, placement?: 'smart' | 'start' = 'smart') => {
      const list = listRef.current;
      if (list) {
        const index = flattenedData.findIndex(node => node.id === itemId);
        if (index >= 0) {
          if (isRendered) {
            list.scrollToItem(index, placement);
          } else {
            bufferedScrollingCommandRef.current = () => {
              list.scrollToItem(index, placement);
            };
          }
        }
      }
    },
    [flattenedData, isRendered]
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
    // $FlowFixMe
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
        // $FlowFixMe
        itemData={itemData}
        ref={listRef}
        // Keep overscanCount relatively high so that:
        // - during in-app tutorials we make sure the tooltip displayer finds
        //   the elements to highlight
        overscanCount={20}
        onItemsRendered={() => setIsRendered(true)}
      >
        {ReadOnlyTreeViewRow}
      </VariableSizeList>
    </div>
  );
};

// $FlowFixMe
export default React.forwardRef(ReadOnlyTreeView);
