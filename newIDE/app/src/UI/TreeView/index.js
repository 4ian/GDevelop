// @flow

import * as React from 'react';
import Text from '../Text';
import { makeDragSourceAndDropTarget } from '../DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from '../SortableVirtualizedItemList/DropIndicator';
import { FixedSizeList as List, areEqual } from 'react-window';
import memoizeOne from 'memoize-one';
import IconButton from '../IconButton';
import ArrowHeadBottom from '../CustomSvgIcons/ArrowHeadBottom';
import ArrowHeadTop from '../CustomSvgIcons/ArrowHeadTop';
import Folder from '../CustomSvgIcons/Folder';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import ListIcon from '../ListIcon';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget('tree-view', {
  vibrate: 100,
});

type Node = {| name: string, id: string, children?: Node[] |};
type FlattenedNode = {|
  id: string,
  name: string,
  hasChildren: boolean,
  depth: number,
  collapsed: boolean,
  selected: boolean,
  disableCollapse: boolean,
  thumbnailSrc?: ?string,
|};

const Row = React.memo(props => {
  const { data, index, style } = props;
  const { flattenedData, onOpen, onSelect, styling } = data;
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
            <div style={{ paddingLeft: left, display: 'flex' }}>
              {connectDropTarget(
                <div
                  onClick={onClick}
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    flex: 1,
                    borderRadius: 6,
                    backgroundColor: node.selected
                      ? styling.selectedBackgroundColor
                      : undefined,
                  }}
                >
                  {connectDragPreview(
                    <div style={{ flex: 1 }}>
                      {isOver && <DropIndicator canDrop={canDrop} />}
                      {connectDragSource(
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
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
                          <Text>{node.name}</Text>
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

const getItemData = memoizeOne((flattenedData, onOpen, onSelect, styling) => ({
  onOpen,
  onSelect,
  flattenedData,
  styling,
}));

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
  const [
    openedDuringSearchNodeIds,
    setOpenedDuringSearchNodeIds,
  ] = React.useState<string[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = React.useState<string[]>([]);
  const theme = React.useContext(GDevelopThemeContext);

  const flattenOpened = (treeData, searchText: ?string): FlattenedNode[] => {
    return items.map(item => flattenNode(item, 1, searchText, false)).flat();
  };

  const flattenNode = (
    item: Item,
    depth: number,
    searchText: ?string,
    forceOpen: boolean
  ): FlattenedNode[] => {
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
          /*
           * If the user is searching, the node should be opened if either:
           * - it has children that should be displayed
           * - the user opened it
           */
          collapsed: !!searchText
            ? flattenedChildren.length === 0 || !openedDuringSearch
            : collapsed,
          selected,
          thumbnailSrc,
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

  const onOpen = (node: FlattenedNode) => {
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
  }: {
    node: FlattenedNode,
    exclusive?: boolean,
  }) => {
    if (node.selected) {
      if (exclusive) setSelectedNodeIds([]);
      else setSelectedNodeIds(selectedNodeIds.filter(id => id !== node.id));
    } else {
      if (exclusive) setSelectedNodeIds([node.id]);
      else setSelectedNodeIds([...selectedNodeIds, node.id]);
    }
  };

  let flattenedData = flattenOpened(
    items,
    searchText ? searchText.toLowerCase() : null
  );

  const styling = {
    selectedBackgroundColor: theme.listItem.selectedBackgroundColor,
  };

  const itemData = getItemData(flattenedData, onOpen, onSelect, styling);

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
    <List
      height={height}
      itemCount={flattenedData.length}
      itemSize={32}
      width={width}
      itemKey={index => flattenedData[index].id}
      itemData={itemData}
    >
      {Row}
    </List>
  );
};

export default TreeView;
