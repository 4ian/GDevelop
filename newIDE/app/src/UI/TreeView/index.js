// @flow

import * as React from 'react';
import { FixedSizeList } from 'react-window';
import memoizeOne from 'memoize-one';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import { treeView } from '../../EventsSheet/EventsTree/ClassNames';
import './TreeView.css';
import ContextMenu, { type ContextMenuInterface } from '../Menu/ContextMenu';
import TreeViewRow from './TreeViewRow';

type FlattenedNode<Item> = {|
  id: string,
  name: string,
  hasChildren: boolean,
  depth: number,
  collapsed: boolean,
  selected: boolean,
  disableCollapse: boolean,
  thumbnailSrc?: ?string,
  item: Item,
|};

export type ItemData<Item> = {|
  onOpen: (FlattenedNode<Item>) => void,
  onSelect: ({| node: FlattenedNode<Item>, exclusive?: boolean |}) => void,
  flattenedData: FlattenedNode<Item>[],
  onStartRenaming: (nodeId: string) => void,
  onEndRenaming: (nodeId: string, newName: string) => void,
  onContextMenu: ({|
    item: Item,
    index: number,
    x: number,
    y: number,
  |}) => void,
  renamedItemId: ?string,
  canDrop?: ?(Item) => boolean,
  onDrop: Item => void,
  onEditItem?: Item => void,
|};

const getItemData = memoizeOne(
  <Item>(
    flattenedData: FlattenedNode<Item>[],
    onOpen: (FlattenedNode<Item>) => void,
    onSelect: ({| node: FlattenedNode<Item>, exclusive?: boolean |}) => void,
    onStartRenaming: (nodeId: string) => void,
    onEndRenaming: (nodeId: string, newName: string) => void,
    renamedItemId: ?string,
    onContextMenu: ({|
      item: Item,
      index: number,
      x: number,
      y: number,
    |}) => void,
    canDrop?: ?(Item) => boolean,
    onDrop: Item => void,
    onEditItem?: Item => void
  ): ItemData<Item> => ({
    onOpen,
    onSelect,
    flattenedData,
    onStartRenaming,
    onEndRenaming,
    renamedItemId,
    onContextMenu,
    canDrop,
    onDrop,
    onEditItem,
  })
);

type Props<Item> = {|
  height: number,
  width: number,
  items: Item[],
  getItemName: Item => string,
  getItemId: Item => string,
  getItemChildren: Item => ?(Item[]),
  getItemThumbnail: Item => ?string,
  onEditItem?: Item => void,
  buildMenuTemplate: (Item, index: number) => any,
  searchText?: string,
  selectedItems: Item[],
  onSelectItems: (Item[]) => void,
  multiSelect: boolean,
  onMoveSelectionToItem: (destinationItem: Item) => void,
  canMoveSelectionToItem?: ?(destinationItem: Item) => boolean,
|};

const TreeView = <Item>({
  height,
  width,
  items,
  searchText,
  getItemName,
  getItemId,
  getItemChildren,
  getItemThumbnail,
  onEditItem,
  buildMenuTemplate,
  selectedItems,
  onSelectItems,
  multiSelect,
  onMoveSelectionToItem,
  canMoveSelectionToItem,
}: Props<Item>) => {
  const selectedNodeIds = selectedItems.map(item => getItemId(item));
  const [openedNodeIds, setOpenedNodeIds] = React.useState<string[]>([]);
  const [renamedItemId, setRenamedItemId] = React.useState<?string>(null);
  const contextMenuRef = React.useRef<?ContextMenuInterface>(null);
  const [
    contextMenuOpeningOptions,
    setContextMenuOpeningOptions,
  ] = React.useState<?{|
    item: Item,
    index: number,
    x: number,
    y: number,
  |}>(null);
  const [
    openedDuringSearchNodeIds,
    setOpenedDuringSearchNodeIds,
  ] = React.useState<string[]>([]);
  const theme = React.useContext(GDevelopThemeContext);

  const flattenOpened = (
    treeData,
    searchText: ?string
  ): FlattenedNode<Item>[] => {
    return items.map(item => flattenNode(item, 1, searchText, false)).flat();
  };

  const flattenNode = (
    item: Item,
    depth: number,
    searchText: ?string,
    forceOpen: boolean
  ): FlattenedNode<Item>[] => {
    const id = getItemId(item);
    const name = getItemName(item);
    const children = getItemChildren(item);
    const collapsed = !openedNodeIds.includes(id);
    const openedDuringSearch = openedDuringSearchNodeIds.includes(id);
    let flattenedChildren = [];
    /*
     * Compute children nodes flattening if:
     * - node has children;
     * and if either one of these conditions are true:
     * - the node is opened (not collapsed)
     * - the user is searching
     * - the user opened the node during the search
     */
    if (children && (!collapsed || !!searchText || openedDuringSearch)) {
      flattenedChildren = children
        .map(child =>
          flattenNode(child, depth + 1, searchText, openedDuringSearch)
        )
        .flat();
    }

    /*
     * Append node to result if either:
     * - the user is not searching
     * - the node is force-opened (if user opened the node during the search)
     * - the node name matches the search
     * - the node contains children that should be displayed
     */
    if (
      !searchText ||
      forceOpen ||
      name.toLowerCase().includes(searchText) ||
      flattenedChildren.length > 0
    ) {
      const thumbnailSrc = getItemThumbnail(item);
      const selected = selectedNodeIds.includes(id);
      return [
        {
          id,
          name,
          hasChildren: !!children && children.length > 0,
          depth,
          selected,
          thumbnailSrc,
          item,
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
            !!searchText && flattenedChildren.length > 0 && !openedDuringSearch,
        },
        ...flattenedChildren,
      ];
    }
    return [];
  };

  const onOpen = (node: FlattenedNode<Item>) => {
    if (!!searchText) {
      node.collapsed
        ? setOpenedDuringSearchNodeIds([...openedDuringSearchNodeIds, node.id])
        : setOpenedDuringSearchNodeIds(
            openedDuringSearchNodeIds.filter(id => id !== node.id)
          );
    } else {
      node.collapsed
        ? setOpenedNodeIds([...openedNodeIds, node.id])
        : setOpenedNodeIds(openedNodeIds.filter(id => id !== node.id));
    }
  };

  const onSelect = ({
    node,
    exclusive,
  }: {|
    node: FlattenedNode<Item>,
    exclusive?: boolean,
  |}) => {
    if (multiSelect) {
      if (node.selected) {
        if (exclusive) {
          if (selectedNodeIds.length === 1) return;
          onSelectItems([node.item]);
        } else onSelectItems(selectedItems.filter(item => item !== node.item));
      } else {
        if (exclusive) onSelectItems([node.item]);
        else onSelectItems([...selectedItems, node.item]);
      }
    } else {
      if (node.selected && selectedNodeIds.length === 1) return;
      onSelectItems([node.item]);
    }
  };

  const onEndRenaming = (nodeId: string, newName: string) => {
    console.log(newName);
    setRenamedItemId(null);
  };

  let flattenedData = flattenOpened(
    items,
    searchText ? searchText.toLowerCase() : null
  );

  const itemData: ItemData<Item> = getItemData<Item>(
    flattenedData,
    onOpen,
    onSelect,
    setRenamedItemId,
    onEndRenaming,
    renamedItemId,
    setContextMenuOpeningOptions,
    canMoveSelectionToItem,
    onMoveSelectionToItem,
    onEditItem
  );

  // Reset opened nodes during search when user stops searching
  // or when the search text changes.
  React.useEffect(
    () => {
      if (!searchText || searchText.length > 0) {
        setOpenedDuringSearchNodeIds([]);
      }
    },
    [searchText]
  );

  // Open context menu when the opening options change.
  React.useEffect(
    () => {
      if (contextMenuRef.current && contextMenuOpeningOptions) {
        const { x, y, item, index } = contextMenuOpeningOptions;
        contextMenuRef.current.open(x, y, { item, index });
      }
    },
    [contextMenuOpeningOptions]
  );

  return (
    <>
      <FixedSizeList
        height={height}
        itemCount={flattenedData.length}
        itemSize={32}
        width={width}
        itemKey={index => flattenedData[index].id}
        // Flow does not seem to accept the generic used in FixedSizeList
        // can itself use a generic.
        // $FlowFixMe
        itemData={itemData}
        className={`${treeView} ${theme.treeViewRootClassName}`}
      >
        {TreeViewRow}
      </FixedSizeList>
      <ContextMenu
        ref={contextMenuRef}
        buildMenuTemplate={(i18n, options) =>
          buildMenuTemplate(options.item, options.index)
        }
      />
    </>
  );
};

export default TreeView;
