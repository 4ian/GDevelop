// @flow
import * as React from 'react';
import { List } from 'react-virtualized';
import ItemRow from './ItemRow';
import { AddListItem } from '../ListCommonItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { listItemWith32PxIconHeight, listItemWithoutIconHeight } from '../List';

const SortableItemRow = SortableElement(props => {
  const { style, ...otherProps } = props;
  return (
    <div style={style}>
      <ItemRow {...otherProps} />
    </div>
  );
});

const SortableAddItemRow = SortableElement(props => {
  const { style, ...otherProps } = props;
  return (
    <div style={style}>
      <AddListItem {...otherProps} />
    </div>
  );
});

export type Item = {
  key: string | number,
};

type ItemsListProps = {
  height: number,
  width: number,
  fullList: Array<Item>,
  selectedItem: ?Item, // TODO
  selectedItems: ?Array<Item>,
  onAddNewItem?: () => void,
  onRename: (Item, string) => void,
  getItemName: Item => string,
  getItemThumbnail?: Item => string,
  isItemBold?: Item => boolean,
  onItemSelected: (?Item) => void,
  onEditItem?: Item => void,
  renamedItem: ?Item,
  addNewItemLabel: React.Node | string,
  erroredItems?: { [string]: '' | 'error' | 'warning' },
  buildMenuTemplate: (Item, index: number) => any,
};

class ItemsList extends React.Component<ItemsListProps, *> {
  _list: ?List;

  forceUpdateGrid() {
    if (this._list) this._list.forceUpdateGrid();
  }

  render() {
    const {
      height,
      width,
      fullList,
      selectedItem,
      selectedItems,
      addNewItemLabel,
      renamedItem,
      getItemThumbnail,
      getItemName,
      erroredItems,
      onAddNewItem,
      isItemBold,
      onEditItem,
    } = this.props;

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
              <SortableAddItemRow
                index={fullList.length}
                key={key}
                style={style}
                disabled
                onClick={onAddNewItem}
                primaryText={addNewItemLabel}
              />
            );
          }

          const item = fullList[index];
          const nameBeingEdited = renamedItem === item;
          const itemName = getItemName(item);

          return (
            <SortableItemRow
              index={index}
              key={key}
              item={item}
              itemName={itemName}
              isBold={isItemBold ? isItemBold(item) : false}
              style={style}
              onRename={newName => this.props.onRename(item, newName)}
              editingName={nameBeingEdited}
              getThumbnail={
                getItemThumbnail ? () => getItemThumbnail(item) : undefined
              }
              selected={
                selectedItems && selectedItems.indexOf(item) !== -1
                  ? true
                  : item === selectedItem
              }
              onItemSelected={this.props.onItemSelected}
              errorStatus={erroredItems ? erroredItems[itemName] || '' : ''}
              buildMenuTemplate={() =>
                this.props.buildMenuTemplate(item, index)
              }
              onEdit={onEditItem}
            />
          );
        }}
        width={width}
      />
    );
  }
}

const SortableItemsList = SortableContainer(ItemsList, { withRef: true });
export default SortableItemsList;
