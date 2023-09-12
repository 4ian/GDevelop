// @flow

import * as React from 'react';
import { makeDragSourceAndDropTarget } from '../DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from '../SortableVirtualizedItemList/DropIndicator';
import { FixedSizeList, areEqual } from 'react-window';
import memoizeOne from 'memoize-one';
import IconButton from '../IconButton';
import ArrowHeadBottom from '../CustomSvgIcons/ArrowHeadBottom';
import ArrowHeadTop from '../CustomSvgIcons/ArrowHeadTop';
import Folder from '../CustomSvgIcons/Folder';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import ListIcon from '../ListIcon';
import { treeView } from '../../EventsSheet/EventsTree/ClassNames';
import './TreeView.css';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../KeyboardShortcuts/InteractionKeys';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget('tree-view', {
  vibrate: 100,
});

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

type ItemData<Item> = {|
  onOpen: (FlattenedNode<Item>) => void,
  onSelect: ({| node: FlattenedNode<Item>, exclusive?: boolean |}) => void,
  flattenedData: FlattenedNode<Item>[],
  onStartRenaming: (nodeId: string) => void,
  onEndRenaming: (nodeId: string, newName: string) => void,
  renamedItemId: ?string,
|};

const SemiControlledRowInput = ({
  initialValue,
  onEndRenaming,
}: {
  initialValue: string,
  onEndRenaming: (newName: string) => void,
}) => {
  const [value, setValue] = React.useState<string>(initialValue);

  return (
    <input
      autoFocus
      type="text"
      className="item-name-input"
      value={value}
      onChange={e => {
        setValue(e.currentTarget.value);
      }}
      onBlur={() => {
        onEndRenaming(value);
      }}
      onKeyUp={e => {
        if (shouldCloseOrCancel(e)) {
          e.preventDefault();
          onEndRenaming(initialValue);
        } else if (shouldValidate(e)) {
          onEndRenaming(value);
        }
      }}
    />
  );
};

type RowProps<Item> = {|
  index: number,
  style: any,
  data: ItemData<Item>,
  /** Used by react-window. */
  isScrolling?: boolean,
|};

const Row = React.memo(<Item>(props: RowProps<Item>) => {
  const { data, index, style } = props;
  const {
    flattenedData,
    onOpen,
    onSelect,
    onStartRenaming,
    onEndRenaming,
    renamedItemId,
  } = data;
  const node = flattenedData[index];
  const left = (node.depth - 1) * 20;
  const [isStayingOver, setIsStayingOver] = React.useState<boolean>(false);
  const openWhenOverTimeoutId = React.useRef<?TimeoutID>(null);

  const onClick = React.useCallback(
    event => {
      if (!node) return;
      onSelect({ node, exclusive: !(event.metaKey || event.ctrlKey) });
    },
    [onSelect, node]
  );

  React.useEffect(
    () => {
      if (
        isStayingOver &&
        !openWhenOverTimeoutId.current &&
        node.hasChildren &&
        node.collapsed
      ) {
        openWhenOverTimeoutId.current = setTimeout(() => {
          onOpen(node);
        }, 500);
        return () => {
          clearTimeout(openWhenOverTimeoutId.current);
          openWhenOverTimeoutId.current = null;
        };
      }
    },
    [isStayingOver, onOpen, node]
  );

  return (
    <div style={style}>
      <DragSourceAndDropTarget
        beginDrag={() => {
          console.log(`drag ${node.name}`);
          return {};
        }}
        canDrag={() => true}
        canDrop={() => true}
        drop={() => {
          console.log(`drop on ${node.name}`);
        }}
      >
        {({
          connectDragSource,
          connectDropTarget,
          connectDragPreview,
          isOver,
          canDrop,
        }) => {
          setIsStayingOver(isOver);
          return (
            <div style={{ paddingLeft: left }} className="indented-row">
              {connectDropTarget(
                <div
                  onClick={onClick}
                  tabIndex={0}
                  className={'row-content' + (node.selected ? ' selected' : '')}
                >
                  {connectDragPreview(
                    <div style={{ flex: 1, height: '100%' }}>
                      {isOver && <DropIndicator canDrop={canDrop} />}
                      {connectDragSource(
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                          }}
                        >
                          {node.hasChildren ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={e => {
                                  e.stopPropagation();
                                  onOpen(node);
                                }}
                                disabled={node.disableCollapse}
                              >
                                {node.collapsed ? (
                                  <ArrowHeadBottom fontSize="small" />
                                ) : (
                                  <ArrowHeadTop fontSize="small" />
                                )}
                              </IconButton>
                              <Folder
                                fontSize="small"
                                style={{ marginRight: 4 }}
                              />
                            </>
                          ) : node.thumbnailSrc ? (
                            <div style={{ marginRight: 6 }}>
                              <ListIcon iconSize={16} src={node.thumbnailSrc} />
                            </div>
                          ) : null}
                          {renamedItemId === node.id ? (
                            <SemiControlledRowInput
                              initialValue={node.name}
                              onEndRenaming={value =>
                                onEndRenaming(node.id, value)
                              }
                            />
                          ) : (
                            <span
                              className="item-name"
                              onClick={e => {
                                if (!e.metaKey && !e.shiftKey) {
                                  onStartRenaming(node.id);
                                }
                              }}
                            >
                              {node.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      </DragSourceAndDropTarget>
    </div>
  );
}, areEqual);

const getItemData = memoizeOne(
  <T>(
    flattenedData: FlattenedNode<T>[],
    onOpen: (FlattenedNode<T>) => void,
    onSelect: ({| node: FlattenedNode<T>, exclusive?: boolean |}) => void,
    onStartRenaming: (nodeId: string) => void,
    onEndRenaming: (nodeId: string, newName: string) => void,
    renamedItemId: ?string
  ): ItemData<T> => ({
    onOpen,
    onSelect,
    flattenedData,
    onStartRenaming,
    onEndRenaming,
    renamedItemId,
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
  searchText?: string,
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
}: Props<Item>) => {
  const [openedNodeIds, setOpenedNodeIds] = React.useState<string[]>([]);
  const [renamedItemId, setRenamedItemId] = React.useState<?string>(null);
  const [
    openedDuringSearchNodeIds,
    setOpenedDuringSearchNodeIds,
  ] = React.useState<string[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = React.useState<string[]>([]);
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
     * - the user is searching and they opened the node during the search
     */
    if (children && (!collapsed || (!!searchText && openedDuringSearch))) {
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
    if (node.selected) {
      if (exclusive) setSelectedNodeIds([]);
      else setSelectedNodeIds(selectedNodeIds.filter(id => id !== node.id));
    } else {
      if (exclusive) setSelectedNodeIds([node.id]);
      else setSelectedNodeIds([...selectedNodeIds, node.id]);
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
    renamedItemId
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

  return (
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
      {Row}
    </FixedSizeList>
  );
};

export default TreeView;
