// @flow

import * as React from 'react';
import Text from '../Text';
import { makeDragSourceAndDropTarget } from '../DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from '../SortableVirtualizedItemList/DropIndicator';
import { FixedSizeList as List, areEqual } from 'react-window';
import { AutoSizer } from 'react-virtualized';
import memoizeOne from 'memoize-one';
import IconButton from '../IconButton';
import ArrowHeadBottom from '../CustomSvgIcons/ArrowHeadBottom';
import ArrowHeadTop from '../CustomSvgIcons/ArrowHeadTop';
import Folder from '../CustomSvgIcons/Folder';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

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
|};

type Props = {| nodes: Node[], searchText?: string |};

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
                          {node.hasChildren && (
                            <>
                              <IconButton
                                size="small"
                                onClick={e => {
                                  e.stopPropagation();
                                  onOpen(node);
                                }}
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
                          )}
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

const SpeedTree = ({ nodes, searchText }: Props) => {
  const [openedNodeIds, setOpenedNodeIds] = React.useState<string[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = React.useState<string[]>([]);
  const theme = React.useContext(GDevelopThemeContext);

  const flattenOpened = (treeData): FlattenedNode[] => {
    const result = [];
    for (let node of nodes) {
      flattenNode(node, 1, result);
    }
    return result;
  };

  const flattenNode = (node, depth, result) => {
    const { id, name, children } = node;
    const collapsed = !openedNodeIds.includes(id);
    const selected = selectedNodeIds.includes(id);
    result.push({
      id,
      name,
      hasChildren: !!children && children.length > 0,
      depth,
      collapsed,
      selected,
    });

    if (!collapsed && children) {
      for (let child of children) {
        flattenNode(child, depth + 1, result);
      }
    }
  };

  const onOpen = (node: FlattenedNode) => {
    node.collapsed
      ? setOpenedNodeIds([...openedNodeIds, node.id])
      : setOpenedNodeIds(openedNodeIds.filter(id => id !== node.id));
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

  let flattenedData = flattenOpened(nodes);
  if (searchText) {
    const searchTextLowerCase = searchText.toLowerCase();
    flattenedData = flattenedData.filter(node =>
      node.name.toLowerCase().includes(searchTextLowerCase)
    );
  }

  const styling = {
    selectedBackgroundColor: theme.listItem.selectedBackgroundColor,
  };

  const itemData = getItemData(flattenedData, onOpen, onSelect, styling);

  return (
    <AutoSizer>
      {({ height, width }) => (
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
      )}
    </AutoSizer>
  );
};

export default SpeedTree;
