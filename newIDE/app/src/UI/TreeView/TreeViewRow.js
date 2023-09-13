// @flow

import * as React from 'react';
import { makeDragSourceAndDropTarget } from '../DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from '../SortableVirtualizedItemList/DropIndicator';
import { areEqual } from 'react-window';
import IconButton from '../IconButton';
import ArrowHeadBottom from '../CustomSvgIcons/ArrowHeadBottom';
import ArrowHeadTop from '../CustomSvgIcons/ArrowHeadTop';
import Folder from '../CustomSvgIcons/Folder';
import ListIcon from '../ListIcon';
import './TreeView.css';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../KeyboardShortcuts/InteractionKeys';
import ThreeDotsMenu from '../CustomSvgIcons/ThreeDotsMenu';
import { type ItemData } from '.';
import { useLongTouch } from '../../Utils/UseLongTouch';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget('tree-view', {
  vibrate: 100,
});

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
      onClick={e => e.stopPropagation()}
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

type Props<Item> = {|
  index: number,
  style: any,
  data: ItemData<Item>,
  /** Used by react-window. */
  isScrolling?: boolean,
|};

const TreeViewRow = <Item>(props: Props<Item>) => {
  const { data, index, style } = props;
  const {
    flattenedData,
    onOpen,
    onSelect,
    onStartRenaming,
    onEndRenaming,
    renamedItemId,
    onContextMenu,
    canDrop,
    onDrop,
    onEditItem,
    hideMenuButton,
  } = data;
  const node = flattenedData[index];
  const left = (node.depth - 1) * 20;
  const [isStayingOver, setIsStayingOver] = React.useState<boolean>(false);
  const openWhenOverTimeoutId = React.useRef<?TimeoutID>(null);
  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      ({ clientX, clientY }) => {
        onContextMenu({
          index: index,
          item: node.item,
          x: clientX,
          y: clientY,
        });
      },
      [onContextMenu, index, node.item]
    )
  );

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
        }, 800);
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
          if (!node.selected) onSelect({ node, exclusive: !node.selected });
          return {};
        }}
        canDrag={() => true}
        canDrop={canDrop ? () => canDrop(node.item) : () => true}
        drop={() => {
          onDrop(node.item);
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
            <div
              style={{ paddingLeft: left }}
              className="full-height-flex-container"
            >
              {connectDropTarget(
                <div
                  onClick={onClick}
                  tabIndex={0}
                  className={
                    'row-container' + (node.selected ? ' selected' : '')
                  }
                >
                  {connectDragSource(
                    <div className="full-space-container">
                      {isOver && <DropIndicator canDrop={canDrop} />}
                      <div
                        className="row-content"
                        onDoubleClick={
                          onEditItem ? () => onEditItem(node.item) : undefined
                        }
                        {...longTouchForContextMenuProps}
                      >
                        {connectDragPreview(
                          <div className="row-content-side row-content-side-left">
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
                                <ListIcon
                                  iconSize={16}
                                  src={node.thumbnailSrc}
                                />
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
                                    e.stopPropagation();
                                    onStartRenaming(node.id);
                                  }
                                }}
                              >
                                {node.name}
                              </span>
                            )}
                          </div>
                        )}
                        {!hideMenuButton && (
                          <div className="row-content-side">
                            <IconButton
                              size="small"
                              onClick={e => {
                                e.stopPropagation();
                                onContextMenu({
                                  item: node.item,
                                  index,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                            >
                              <ThreeDotsMenu />
                            </IconButton>
                          </div>
                        )}
                      </div>
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
};

// $FlowFixMe - memo does not support having a generic in the props.
export default React.memo<Props>(TreeViewRow, areEqual);
