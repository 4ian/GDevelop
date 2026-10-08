// @flow

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import SearchBar from '../SearchBar';
import ReadOnlyTreeView, {
  type ItemBaseAttributes,
  type ReadOnlyTreeViewInterface,
} from './ReadOnlyTreeView';
import classes from './SearchableReadOnlyTreeView.module.css';

type Props<Item> = {|
  items: Item[],
  estimatedItemSize: number,
  getItemHeight: Item => number,
  getItemName: Item => string | React.Node,
  getItemId: Item => string,
  getItemChildren: Item => ?(Item[]),
  /**
   * The texts of an item compared to the search (its name, its value...): the
   * rows can be rendered nodes, that the tree cannot compare on its own.
   */
  getItemSearchedTexts: Item => $ReadOnlyArray<?string>,
  searchPlaceholder: MessageDescriptor,
  selectedItems: $ReadOnlyArray<Item>,
  onSelectItems: (Item[]) => void,
  onClickItem?: Item => void,
  multiSelect: boolean,
  initiallyOpenedNodeIds?: string[],
  fullWidthRows?: boolean,
|};

/**
 * A search bar above a read only tree taking all the space left. The rows
 * matching the search are kept, and the ancestors of the first visible row
 * stay on top of the list when scrolling.
 */
const SearchableReadOnlyTreeView = <Item: ItemBaseAttributes>(
  {
    items,
    estimatedItemSize,
    getItemHeight,
    getItemName,
    getItemId,
    getItemChildren,
    getItemSearchedTexts,
    searchPlaceholder,
    selectedItems,
    onSelectItems,
    onClickItem,
    multiSelect,
    initiallyOpenedNodeIds,
    fullWidthRows,
  }: Props<Item>,
  ref: React.RefSetter<ReadOnlyTreeViewInterface<Item>>
): React.Node => {
  // A state rather than a ref: the tree is rendered again once the container
  // of its sticky rows exists.
  const [
    stickyRowsContainer,
    setStickyRowsContainer,
  ] = React.useState<?HTMLDivElement>(null);
  const [searchText, setSearchText] = React.useState<string>('');
  const lowerCaseSearchText = searchText.trim().toLowerCase();

  // The match is done here on the texts of the item, and the tree is told to
  // keep the matching rows (`false` = do not filter).
  const shouldApplySearchToItem = React.useCallback(
    (item: Item) =>
      !lowerCaseSearchText ||
      !getItemSearchedTexts(item).some(
        text => !!text && text.toLowerCase().includes(lowerCaseSearchText)
      ),
    [lowerCaseSearchText, getItemSearchedTexts]
  );

  return (
    <div className={classes.container}>
      <div className={classes.searchBar}>
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onRequestSearch={() => {}}
          placeholder={searchPlaceholder}
        />
      </div>
      <div className={classes.tree}>
        {/* The sticky rows are rendered here: the AutoSizer gives no width
        to what it holds, so they could not take the width of the list. */}
        <div ref={setStickyRowsContainer} className={classes.stickyContainer} />
        <AutoSizer>
          {({ height, width }) => (
            <ReadOnlyTreeView
              ref={ref}
              height={height}
              width={width}
              items={items}
              estimatedItemSize={estimatedItemSize}
              getItemHeight={getItemHeight}
              searchText={lowerCaseSearchText}
              shouldApplySearchToItem={shouldApplySearchToItem}
              getItemName={getItemName}
              getItemId={getItemId}
              getItemChildren={getItemChildren}
              initiallyOpenedNodeIds={initiallyOpenedNodeIds}
              selectedItems={selectedItems}
              onSelectItems={onSelectItems}
              onClickItem={onClickItem}
              multiSelect={multiSelect}
              enableStickyAncestors
              stickyPortalTarget={stickyRowsContainer}
              fullWidthRows={fullWidthRows}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

// Search for "treeview typing issues" in the codebase.
export default ((React.forwardRef(
  SearchableReadOnlyTreeView
): any): React.ComponentType<{
  ...Props<any>,
  +ref?: React.RefSetter<ReadOnlyTreeViewInterface<any>>,
}>);
