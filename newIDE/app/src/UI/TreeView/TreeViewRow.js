// @flow

import * as React from 'react';
import DropIndicator from '../SortableVirtualizedItemList/DropIndicator';
import memoizeOne from 'memoize-one';
import { areEqual } from 'react-window';
import IconButton from '../IconButton';
import ArrowHeadBottom from '../CustomSvgIcons/ArrowHeadBottom';
import ArrowHeadRight from '../CustomSvgIcons/ArrowHeadRight';
import Folder from '../CustomSvgIcons/Folder';
import ListIcon from '../ListIcon';
import './TreeView.css';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../KeyboardShortcuts/InteractionKeys';
import ThreeDotsMenu from '../CustomSvgIcons/ThreeDotsMenu';
import { type ItemData, type ItemBaseAttributes } from '.';
import { useLongTouch } from '../../Utils/UseLongTouch';
import { dataObjectToProps } from '../../Utils/HTMLDataset';

const stopPropagation = e => e.stopPropagation();

const SemiControlledRowInput = ({
  initialValue,
  onEndRenaming,
}: {
  initialValue: string,
  onEndRenaming: (newName: string) => void,
}) => {
  const [value, setValue] = React.useState<string>(initialValue);

  return (
    <div className="item-name-input-container">
      <input
        autoFocus
        type="text"
        className="item-name-input"
        value={value}
        onChange={e => {
          setValue(e.currentTarget.value);
        }}
        onClick={stopPropagation}
        onDoubleClick={stopPropagation}
        onBlur={() => {
          onEndRenaming(value);
        }}
        onKeyDown={e => {
          if (shouldCloseOrCancel(e)) {
            e.stopPropagation(); // Prevent closing dialog if TreeView is displayed in dialog.
          }
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
    </div>
  );
};

const memoized = memoizeOne((initialValue, getContainerYPosition) =>
  getContainerYPosition()
);

type Props<Item> = {|
  index: number,
  style: any,
  data: ItemData<Item>,
  /** Used by react-window. */
  isScrolling?: boolean,
|};

const TreeViewRow = <Item: ItemBaseAttributes>(props: Props<Item>) => {
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
    isMobileScreen,
    DragSourceAndDropTarget,
    getItemHtmlId,
  } = data;
  const node = flattenedData[index];
  const left = node.depth * 15;
  const [isStayingOver, setIsStayingOver] = React.useState<boolean>(false);
  const openWhenOverTimeoutId = React.useRef<?TimeoutID>(null);
  const [whereToDrop, setWhereToDrop] = React.useState<
    'before' | 'afterOrInside'
  >('before');
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const openContextMenu = React.useCallback(
    ({ clientX, clientY }) => {
      onContextMenu({
        index: index,
        item: node.item,
        x: clientX,
        y: clientY,
      });
    },
    [onContextMenu, index, node.item]
  );

  const longTouchForContextMenuProps = useLongTouch(openContextMenu, {
    delay: 1000,
  });

  const onClick = React.useCallback(
    event => {
      if (!node || node.item.isPlaceholder) return;
      if (node.item.isRoot) {
        onOpen(node);
        return;
      }
      onSelect({ node, exclusive: !(event.metaKey || event.ctrlKey) });
    },
    [onSelect, node, onOpen]
  );

  const selectAndOpenContextMenu = React.useCallback(
    (event: MouseEvent) => {
      onClick(event);
      openContextMenu(event);
    },
    [onClick, openContextMenu]
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

  const getContainerYPosition = React.useCallback(() => {
    if (containerRef.current) {
      return containerRef.current.getBoundingClientRect().top;
    }
  }, []);

  const displayAsFolder = node.hasChildren || node.thumbnailSrc === 'FOLDER';

  return (
    <div style={style} ref={containerRef}>
      <DragSourceAndDropTarget
        beginDrag={() => {
          if (!node.selected) onSelect({ node, exclusive: !node.selected });
          return {};
        }}
        canDrag={() =>
          // Prevent dragging of root folder.
          !node.item.isRoot &&
          // Prevent dragging of item whose name is edited, allowing to select text with click and drag on text.
          renamedItemId !== node.id
        }
        canDrop={canDrop ? () => canDrop(node.item) : () => true}
        drop={() => {
          onDrop(node.item, whereToDrop);
        }}
        hover={monitor => {
          const { y } = monitor.getClientOffset();
          // Use a cached version of container position to avoid recomputing bounding rectangle.
          // Doing this, the position is computed every second the user hovers the target.
          const containerYPosition = memoized(
            Math.floor(Date.now() / 1000),
            getContainerYPosition
          );
          if (containerYPosition) {
            setWhereToDrop(
              y - containerYPosition <= 16 ? 'before' : 'afterOrInside'
            );
          }
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
              className={`full-height-flex-container${
                node.item.isRoot && index > 0 ? ' with-divider' : ''
              }`}
            >
              {connectDropTarget(
                <div
                  id={
                    getItemHtmlId ? getItemHtmlId(node.item, index) : undefined
                  }
                  onClick={onClick}
                  tabIndex={0}
                  className={
                    'row-container' +
                    (node.selected ? ' selected' : '') +
                    (isOver &&
                    whereToDrop === 'afterOrInside' &&
                    displayAsFolder
                      ? canDrop
                        ? ' with-can-drop-inside-indicator'
                        : ' with-cannot-drop-inside-indicator'
                      : '')
                  }
                  aria-selected={node.selected}
                  aria-expanded={displayAsFolder ? !node.collapsed : false}
                  {...dataObjectToProps(node.dataset)}
                >
                  {connectDragSource(
                    <div className="full-space-container">
                      {isOver && whereToDrop === 'before' && (
                        <DropIndicator canDrop={canDrop} />
                      )}
                      <div
                        className="row-content"
                        onDoubleClick={
                          onEditItem ? () => onEditItem(node.item) : undefined
                        }
                        onContextMenu={selectAndOpenContextMenu}
                        {...longTouchForContextMenuProps}
                      >
                        {connectDragPreview(
                          <div
                            className={`row-content-side${
                              node.item.isRoot ? '' : ' row-content-side-left'
                            }${
                              displayAsFolder
                                ? ''
                                : ' row-content-extra-padding'
                            }`}
                          >
                            {displayAsFolder ? (
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
                                    <ArrowHeadRight fontSize="small" />
                                  ) : (
                                    <ArrowHeadBottom fontSize="small" />
                                  )}
                                </IconButton>
                                {!node.item.isRoot && (
                                  <Folder
                                    fontSize="small"
                                    style={{ marginRight: 4 }}
                                  />
                                )}
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
                                  onEndRenaming(node.item, value)
                                }
                              />
                            ) : (
                              <span
                                className={`item-name${
                                  node.item.isRoot
                                    ? ' root-folder'
                                    : node.item.isPlaceholder
                                    ? ' placeholder'
                                    : ''
                                }`}
                                onClick={
                                  node.item.isRoot ||
                                  node.item.isPlaceholder ||
                                  isMobileScreen
                                    ? null
                                    : e => {
                                        if (!e.metaKey && !e.shiftKey) {
                                          e.stopPropagation();
                                          onStartRenaming(node.id);
                                        }
                                      }
                                }
                              >
                                {node.name}
                              </span>
                            )}
                          </div>
                        )}
                        {!isMobileScreen &&
                          !node.item.isRoot &&
                          !node.item.isPlaceholder && (
                            <div className="row-content-side row-content-side-right">
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
                      {isOver &&
                        whereToDrop === 'afterOrInside' &&
                        !displayAsFolder && <DropIndicator canDrop={canDrop} />}
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
