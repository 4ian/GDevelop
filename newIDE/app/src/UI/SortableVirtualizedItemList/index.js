// @flow
import * as React from 'react';
import { List } from 'react-virtualized';
import ItemRow from './ItemRow';
import { AddListItem } from '../ListCommonItem';
import { listItemWith32PxIconHeight, listItemWithoutIconHeight } from '../List';
import { makeDragSourceAndDropTarget } from '../DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from './DropIndicator';

type Props<Item> = {|
  height: number,
  width: number,
  fullList: Array<Item>,
  selectedItems: Array<Item>,
  onAddNewItem?: () => void,
  addNewItemLabel?: React.Node | string,
  onRename: (Item, string) => void,
  getItemName: Item => string,
  getItemThumbnail?: Item => string,
  isItemBold?: Item => boolean,
  onItemSelected: (?Item) => void,
  onEditItem?: Item => void,
  renamedItem: ?Item,
  erroredItems?: { [string]: '' | 'error' | 'warning' },
  buildMenuTemplate: (Item, index: number) => any,
  onMoveSelectionToItem: (destinationItem: Item) => void,
  canMoveSelectionToItem?: ?(destinationItem: Item) => boolean,
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

  render() {
    const {
      height,
      width,
      fullList,
      selectedItems,
      addNewItemLabel,
      renamedItem,
      getItemThumbnail,
      getItemName,
      erroredItems,
      onAddNewItem,
      isItemBold,
      onEditItem,
      onMoveSelectionToItem,
      canMoveSelectionToItem,
    } = this.props;
    const { DragSourceAndDropTarget } = this;

    return (
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
                  disabled
                  onClick={onAddNewItem}
                  primaryText={addNewItemLabel}
                />
              </div>
            );
          }

          const item = fullList[index];
          const nameBeingEdited = renamedItem === item;
          const itemName = getItemName(item);

          return (
            <div style={style} key={key}>
              <DragSourceAndDropTarget
                beginDrag={() => {
                  this.props.onItemSelected(item);
                  return {};
                }}
                canDrop={() =>
                  canMoveSelectionToItem ? canMoveSelectionToItem(item) : true
                }
                drop={() => {
                  onMoveSelectionToItem(item);
                }}
              >
                {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
                  // Add an extra div because connectDropTarget/connectDragSource can
                  // only be used on native elements
                  connectDropTarget(
                    connectDragSource(
                      <div>
                        {isOver && <DropIndicator canDrop={canDrop} />}
                        <ItemRow
                          item={item}
                          itemName={itemName}
                          isBold={isItemBold ? isItemBold(item) : false}
                          onRename={newName =>
                            this.props.onRename(item, newName)
                          }
                          editingName={nameBeingEdited}
                          getThumbnail={
                            getItemThumbnail
                              ? () => getItemThumbnail(item)
                              : undefined
                          }
                          selected={selectedItems.indexOf(item) !== -1}
                          onItemSelected={this.props.onItemSelected}
                          errorStatus={
                            erroredItems ? erroredItems[itemName] || '' : ''
                          }
                          buildMenuTemplate={() =>
                            this.props.buildMenuTemplate(item, index)
                          }
                          onEdit={onEditItem}
                        />
                      </div>
                    )
                  )
                }
              </DragSourceAndDropTarget>
            </div>
          );
        }}
        width={width}
      />
    );
  }
}
