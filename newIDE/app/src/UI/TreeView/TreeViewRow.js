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
import useForceUpdate from '../../Utils/UseForceUpdate';
import classes from './TreeView.module.css';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../KeyboardShortcuts/InteractionKeys';
import ThreeDotsMenu from '../CustomSvgIcons/ThreeDotsMenu';
import { type ItemData, type ItemBaseAttributes, navigationKeys } from '.';
import { useLongTouch } from '../../Utils/UseLongTouch';
import { dataObjectToProps } from '../../Utils/HTMLDataset';
import { type DraggedItem } from '../DragAndDrop/DragSourceAndDropTarget';
import classNames from 'classnames';

const stopPropagation = e => e.stopPropagation();

const DELAY_BEFORE_OPENING_FOLDER_ON_DRAG_HOVER = 800;
const DELAY_BEFORE_OPENING_CONTEXT_MENU_ON_MOBILE = 1000;

const onInputKeyDown = (event: KeyboardEvent) => {
  if (navigationKeys.includes(event.key)) {
    // Prevent navigating in the tree view when renaming an item.
    event.stopPropagation();
  } else if (shouldCloseOrCancel(event)) {
    // Prevent closing dialog if TreeView is displayed in dialog.
    event.stopPropagation();
  }
};

const SemiControlledRowInput = ({
  initialValue,
  onEndRenaming,
  onBlur,
}: {
  initialValue: string,
  onEndRenaming: (newName: string) => void,
  onBlur: () => void,
}) => {
  const [value, setValue] = React.useState<string>(initialValue);
  const inputRef = React.useRef<?HTMLInputElement>(null);

  /**
   * When mounting the component, select content.
   */
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  /**
   * When unmounting the component, call onBlur. If props.onBlur is called
   * at the end of onKeyUp, focus might before the component is mounted.
   * This would trigger the blur callback on the input, calling onEndRenaming
   * with the current value, even if the user hit Escape key and expected the
   * initialValue to be set.
   */
  React.useEffect(
    () => {
      return onBlur;
    },
    [onBlur]
  );

  return (
    <div className={classes.itemNameInputContainer}>
      <input
        autoFocus
        ref={inputRef}
        type="text"
        className={classes.itemNameInput}
        value={value}
        spellCheck={false}
        onChange={e => {
          setValue(e.currentTarget.value);
        }}
        onClick={stopPropagation}
        onDoubleClick={stopPropagation}
        onBlur={() => {
          onEndRenaming(value);
        }}
        onKeyDown={onInputKeyDown}
        onKeyUp={e => {
          if (shouldCloseOrCancel(e)) {
            // Prevent closing dialog if TreeView is displayed in dialog.
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
    onClick,
    onSelect,
    onBlurField,
    onEndRenaming,
    renamedItemId,
    onContextMenu,
    canDrop,
    onDrop,
    onEditItem,
    isMobile,
    DragSourceAndDropTarget,
    getItemHtmlId,
    forceDefaultDraggingPreview,
    shouldSelectUponContextMenuOpening,
  } = data;
  const node = flattenedData[index];
  const left = node.depth * 16;
  const forceUpdate = useForceUpdate();
  const isStayingOverRef = React.useRef<boolean>(false);
  const openWhenOverTimeoutId = React.useRef<?TimeoutID>(null);
  const [whereToDrop, setWhereToDrop] = React.useState<
    'before' | 'after' | 'inside'
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
    delay: DELAY_BEFORE_OPENING_CONTEXT_MENU_ON_MOBILE,
  });

  const onClickItem = React.useCallback(
    event => {
      if (!node || node.item.isPlaceholder) return;
      if (node.item.isRoot) {
        onOpen(node);
        return;
      }
      onSelect({ node, exclusive: !(event.metaKey || event.ctrlKey) });
      onClick(node);
    },
    [onClick, onSelect, node, onOpen]
  );

  const selectAndOpenContextMenu = React.useCallback(
    (event: MouseEvent) => {
      onClickItem(event);
      openContextMenu(event);
    },
    [onClickItem, openContextMenu]
  );

  const setIsStayingOver = React.useCallback(
    (active: boolean, canDrop: boolean) => {
      // Do not open folder if cannot drop into it. It's implied that if it
      // cannot be dropped in the folder, it cannot be dropped in any subfolders
      // of the folder.
      if (!canDrop && active) return;
      if (active !== isStayingOverRef.current) {
        isStayingOverRef.current = active;
        forceUpdate();
      }
    },
    [forceUpdate]
  );

  /**
   * Effect that opens the node if the user is dragging another node and stays
   * over the node.
   */
  React.useEffect(
    () => {
      if (
        isStayingOverRef.current &&
        !openWhenOverTimeoutId.current &&
        node.canHaveChildren &&
        node.collapsed
      ) {
        openWhenOverTimeoutId.current = setTimeout(() => {
          onOpen(node);
        }, DELAY_BEFORE_OPENING_FOLDER_ON_DRAG_HOVER);
        return () => {
          clearTimeout(openWhenOverTimeoutId.current);
          openWhenOverTimeoutId.current = null;
        };
      }
    },
    // We want to have isStayingOverRef.current as dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onOpen, node, forceUpdate, isStayingOverRef.current]
  );

  const endRenaming = React.useCallback(
    (newValue: string) => {
      onEndRenaming(node.item, newValue);
    },
    [onEndRenaming, node.item]
  );

  const getContainerYPosition = React.useCallback(() => {
    if (containerRef.current) {
      return containerRef.current.getBoundingClientRect().top;
    }
  }, []);

  const displayAsFolder = node.canHaveChildren;

  // Create an empty pixel image once to override the default drag preview of all items.
  const emptyImage = new Image();
  emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  return (
    <div style={style} ref={containerRef}>
      <DragSourceAndDropTarget
        beginDrag={() => {
          if (!node.selected) onSelect({ node, exclusive: !node.selected });

          if (forceDefaultDraggingPreview) {
            return {};
          }

          // We return the item name and thumbnail to be used by the
          // drag preview if this is not a folder.
          // We can't use the item itself because it's not serializable.
          if (typeof node.name === 'string' && !displayAsFolder) {
            const draggedItem: DraggedItem = {
              name: node.name,
              thumbnail: node.thumbnailSrc || undefined,
            };
            return draggedItem;
          }

          // Otherwise, we let the default drag preview be displayed.
          return {};
        }}
        canDrag={() =>
          // Prevent dragging of root folder or placeholder.
          !node.item.isRoot &&
          !node.item.isPlaceholder &&
          // Prevent dragging of item whose name is edited, allowing to select text with click and drag on text.
          renamedItemId !== node.id
        }
        canDrop={canDrop ? () => canDrop(node.item, whereToDrop) : () => true}
        drop={() => {
          onDrop(node.item, whereToDrop);
        }}
        hover={monitor => {
          if (node.item.isRoot) {
            if (whereToDrop !== 'inside') setWhereToDrop('inside');
            return;
          }
          const { y } = monitor.getClientOffset();
          // Use a cached version of container position to avoid recomputing bounding rectangle.
          // Doing this, the position is computed every second the user hovers the target.
          const containerYPosition = memoized(
            Math.floor(Date.now() / 1000),
            getContainerYPosition
          );
          if (containerYPosition) {
            if (displayAsFolder) {
              if (node.collapsed) {
                setWhereToDrop(
                  y - containerYPosition <= 6
                    ? 'before'
                    : y - containerYPosition <= 26
                    ? 'inside'
                    : 'after'
                );
              } else {
                // If the folder is open, do not suggest to drop after as
                // the drop indicator can be misleading (displayed under the row
                // although dropping the element after would put it below the last
                // displayed child of the folder).
                setWhereToDrop(
                  y - containerYPosition <= 6 ? 'before' : 'inside'
                );
              }
            } else {
              setWhereToDrop(y - containerYPosition <= 16 ? 'before' : 'after');
            }
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
          setIsStayingOver(isOver, canDrop);

          let itemRow = (
            <div
              className={classNames(classes.rowContentSide, {
                [classes.rowContentSideLeft]: !node.item.isRoot,
                [classes.rowContentExtraPadding]: !displayAsFolder,
              })}
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
                  {node.thumbnailSrc && node.thumbnailSrc !== 'FOLDER' ? (
                    <div className={classes.thumbnail}>
                      <ListIcon iconSize={20} src={node.thumbnailSrc} />
                    </div>
                  ) : (
                    !node.item.isRoot && (
                      <Folder className={classes.folderIcon} />
                    )
                  )}
                </>
              ) : node.thumbnailSrc ? (
                <div className={classes.thumbnail}>
                  <ListIcon iconSize={20} src={node.thumbnailSrc} />
                </div>
              ) : null}
              {renamedItemId === node.id && typeof node.name === 'string' ? (
                <SemiControlledRowInput
                  initialValue={node.name}
                  onEndRenaming={endRenaming}
                  onBlur={onBlurField}
                />
              ) : (
                <span
                  className={classNames(
                    classes.itemName,
                    {
                      [classes.rootFolder]: node.item.isRoot,
                      [classes.placeholder]: node.item.isPlaceholder,
                    },
                    node.extraClass
                  )}
                >
                  {node.name}
                </span>
              )}
            </div>
          );

          // If this is an object, connect the drag preview with an empty image
          // to override the default drag preview.
          if (typeof node.name === 'string' && !displayAsFolder) {
            connectDragPreview(emptyImage);
          } else {
            // If not (folder for instance), just use the item row as drag preview.
            itemRow = connectDragPreview(itemRow);
          }

          const rightButton = node.rightButton;

          const shouldDisplayMenu =
            !node.shouldHideMenuIcon &&
            !isMobile &&
            !node.item.isRoot &&
            !node.item.isPlaceholder;

          const dragSource = connectDragSource(
            <div className={classes.fullSpaceContainer}>
              {isOver && whereToDrop === 'before' && (
                <DropIndicator canDrop={canDrop} />
              )}
              <div
                className={classes.rowContent}
                onDoubleClick={
                  onEditItem ? () => onEditItem(node.item) : undefined
                }
                onContextMenu={
                  shouldSelectUponContextMenuOpening
                    ? selectAndOpenContextMenu
                    : openContextMenu
                }
                {...longTouchForContextMenuProps}
              >
                {itemRow}
                {(node.rightComponent || rightButton || shouldDisplayMenu) && (
                  <div
                    className={classNames(
                      classes.rowContentSide,
                      classes.rowContentSideRight
                    )}
                  >
                    {node.rightComponent}
                    {rightButton && (
                      <IconButton
                        id={rightButton.id}
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          if (rightButton.click) {
                            rightButton.click();
                          }
                        }}
                      >
                        {rightButton.icon}
                      </IconButton>
                    )}
                    {shouldDisplayMenu && (
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
                    )}
                  </div>
                )}
              </div>
              {isOver && whereToDrop === 'after' && (
                <DropIndicator canDrop={canDrop} />
              )}
            </div>
          );

          const shouldDisplayDropIndicator =
            isOver &&
            whereToDrop === 'inside' &&
            displayAsFolder &&
            !node.item.isRoot;
          const dropIndicatorClassName = shouldDisplayDropIndicator
            ? canDrop
              ? classes.withCanDropInsideIndicator
              : classes.withCannotDropInsideIndicator
            : null;

          const dropTarget = connectDropTarget(
            <div
              id={getItemHtmlId ? getItemHtmlId(node.item, index) : undefined}
              onClick={onClickItem}
              className={classNames(
                classes.rowContainer,
                dropIndicatorClassName,
                {
                  [classes.selected]: node.selected,
                }
              )}
              aria-selected={node.selected}
              aria-expanded={displayAsFolder ? !node.collapsed : false}
              {...dataObjectToProps(node.dataset)}
            >
              {dragSource}
            </div>
          );

          return (
            <div
              style={{ paddingLeft: left }}
              className={classNames(classes.fullHeightFlexContainer, {
                [classes.withDivider]: node.item.isRoot && index > 0,
              })}
            >
              {dropTarget}
            </div>
          );
        }}
      </DragSourceAndDropTarget>
    </div>
  );
};

// $FlowFixMe - memo does not support having a generic in the props.
export default React.memo<Props>(TreeViewRow, areEqual);
