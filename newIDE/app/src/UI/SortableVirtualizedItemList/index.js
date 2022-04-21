// @flow
import * as React from 'react';
import { List } from 'react-virtualized';
import ItemRow from './ItemRow';
import { AddListItem } from '../ListCommonItem';
import { listItemWith32PxIconHeight, listItemWithoutIconHeight } from '../List';
import { makeDragSourceAndDropTarget } from '../DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from './DropIndicator';
import { ResponsiveWindowMeasurer } from '../Reponsive/ResponsiveWindowMeasurer';
import { ScreenTypeMeasurer } from '../Reponsive/ScreenTypeMeasurer';
import type { WidthType } from '../Reponsive/ResponsiveWindowMeasurer';

type Props<Item> = {|
  height: number,
  width: number,
  fullList: Array<Item>,
  selectedItems: Array<Item>,
  onAddNewItem?: () => void,
  addNewItemLabel?: React.Node | string,
  addNewItemId?: string,
  onRename: (Item, string) => void,
  renderItemLabel?: Item => React.Node,
  getItemName: Item => string,
  getItemThumbnail?: Item => string,
  getItemId?: (Item, index: number) => string,
  isItemBold?: Item => boolean,
  onItemSelected: (?Item) => void,
  onEditItem?: Item => void,
  renamedItem: ?Item,
  erroredItems?: { [string]: '' | 'error' | 'warning' },
  buildMenuTemplate: (Item, index: number) => any,
  onMoveSelectionToItem: (destinationItem: Item) => void,
  canMoveSelectionToItem?: ?(destinationItem: Item) => boolean,
  scaleUpItemIconWhenSelected?: boolean,
  reactDndType: string,
|};

export default class SortableVirtualizedItemList<Item> extends React.Component<
  Props<Item>
> {
  _list: ?List;
  DragSourceAndDropTarget = makeDragSourceAndDropTarget<Item>(
    this.props.reactDndType
  );

  forceUpdateGrid() {
    if (this._list) this._list.forceUpdateGrid();
  }

  _renderItemRow(
    item: Item,
    index: number,
    windowWidth: WidthType,
    connectIconDragSource?: ?(React.Element<any>) => ?React.Node
  ) {
    const {
      selectedItems,
      getItemThumbnail,
      erroredItems,
      isItemBold,
      onEditItem,
      renamedItem,
      getItemName,
      getItemId,
      renderItemLabel,
      scaleUpItemIconWhenSelected,
    } = this.props;

    const nameBeingEdited = renamedItem === item;
    const itemName = getItemName(item);

    return (
      <ItemRow
        item={item}
        itemName={itemName}
        id={getItemId ? getItemId(item, index) : undefined}
        renderItemLabel={
          renderItemLabel ? () => renderItemLabel(item) : undefined
        }
        isBold={isItemBold ? isItemBold(item) : false}
        onRename={newName => this.props.onRename(item, newName)}
        editingName={nameBeingEdited}
        getThumbnail={
          getItemThumbnail ? () => getItemThumbnail(item) : undefined
        }
        selected={selectedItems.indexOf(item) !== -1}
        onItemSelected={this.props.onItemSelected}
        errorStatus={erroredItems ? erroredItems[itemName] || '' : ''}
        buildMenuTemplate={() => this.props.buildMenuTemplate(item, index)}
        onEdit={onEditItem}
        hideMenuButton={windowWidth === 'small'}
        scaleUpItemIconWhenSelected={scaleUpItemIconWhenSelected}
        connectIconDragSource={connectIconDragSource || null}
      />
    );
  }

  render() {
    const {
      height,
      width,
      fullList,
      addNewItemLabel,
      addNewItemId,
      renamedItem,
      getItemThumbnail,
      onAddNewItem,
      onMoveSelectionToItem,
      canMoveSelectionToItem,
      selectedItems,
    } = this.props;
    const { DragSourceAndDropTarget } = this;

    return (
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <ScreenTypeMeasurer>
            {screenType => (
              <List
                ref={list => (this._list = list)}
                height={height}
                rowCount={fullList.length + (onAddNewItem ? 1 : 0)}
                rowHeight={
                  getItemThumbnail
                    ? listItemWith32PxIconHeight
                    : listItemWithoutIconHeight
                }
                rowRenderer={({
                  index,
                  key,
                  style,
                }: {|
                  index: number,
                  key: string,
                  style: Object,
                |}) => {
                  if (index >= fullList.length) {
                    return (
                      <div style={style} key={key}>
                        <AddListItem
                          onClick={onAddNewItem}
                          primaryText={addNewItemLabel}
                          id={addNewItemId}
                        />
                      </div>
                    );
                  }

                  const item = fullList[index];
                  const nameBeingEdited = renamedItem === item;
                  const isSelected = selectedItems.indexOf(item) !== -1;

                  return (
                    <div style={style} key={key}>
                      <DragSourceAndDropTarget
                        beginDrag={() => {
                          if (!isSelected) this.props.onItemSelected(item);

                          // $FlowFixMe
                          return {};
                        }}
                        canDrag={() => !nameBeingEdited}
                        canDrop={() =>
                          canMoveSelectionToItem
                            ? canMoveSelectionToItem(item)
                            : true
                        }
                        drop={() => {
                          onMoveSelectionToItem(item);
                        }}
                      >
                        {({
                          connectDragSource,
                          connectDropTarget,
                          isOver,
                          canDrop,
                        }) => {
                          // If on a touch screen, setting the whole item to be
                          // draggable would prevent scroll. Set the icon only to be
                          // draggable if the item is not selected. When selected,
                          // set the whole item to be draggable.
                          const canDragOnlyIcon =
                            screenType === 'touch' && !isSelected;

                          // Add an extra div because connectDropTarget/connectDragSource can
                          // only be used on native elements
                          const dropTarget = connectDropTarget(
                            <div>
                              {isOver && <DropIndicator canDrop={canDrop} />}
                              {this._renderItemRow(
                                item,
                                index,
                                windowWidth,
                                // Only mark the icon as draggable if needed
                                // (touchscreens).
                                canDragOnlyIcon ? connectDragSource : null
                              )}
                            </div>
                          );

                          if (!dropTarget) return null;

                          return canDragOnlyIcon
                            ? dropTarget
                            : connectDragSource(dropTarget);
                        }}
                      </DragSourceAndDropTarget>
                    </div>
                  );
                }}
                width={width}
              />
            )}
          </ScreenTypeMeasurer>
        )}
      </ResponsiveWindowMeasurer>
    );
  }
}
