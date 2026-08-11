// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { AutoSizer } from 'react-virtualized';

import Background from '../UI/Background';
import CompactSearchBar from '../UI/CompactSearchBar';
import TreeView, {
  type MenuButton,
  type TreeViewInterface,
} from '../UI/TreeView';
import { Column, Line } from '../UI/Grid';
import { LineStackLayout } from '../UI/Layout';
import { type HTMLDataset } from '../Utils/HTMLDataset';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

type Props<Item> = {|
  listKey: string,
  treeViewRef: {| current: ?TreeViewInterface<Item> |},
  items: Array<Item>,
  selectedItems: $ReadOnlyArray<Item>,
  getItemName: (Item) => string | React.Node,
  getItemSearchText?: (Item) => string,
  getItemThumbnail?: (Item) => ?string,
  getItemChildren: (Item) => ?Array<Item>,
  getItemId: (Item) => string,
  getItemHtmlId?: (Item, number) => ?string,
  getItemDataset?: (Item) => ?HTMLDataset,
  onEditItem?: (Item) => void,
  onCollapseItem?: (Item) => void,
  onSelectItems: (Array<Item>) => void,
  onClickItem?: (Item) => void,
  onRenameItem: (Item, string) => void,
  buildMenuTemplate: (Item, number) => any,
  getItemRightButton?: (Item) => ?MenuButton | Array<MenuButton>,
  renderRightComponent?: (Item) => ?React.Node,
  onMoveSelectionToItem: (
    Item,
    'before' | 'inside' | 'after'
  ) => void | Promise<void>,
  canMoveSelectionToItem?: ?(Item, 'before' | 'inside' | 'after') => boolean,
  reactDndType: string,
  initiallyOpenedNodeIds?: Array<string>,
  forceAllOpened?: boolean,
  headerControls?: React.Node,
  onKeyDown?: (KeyboardEvent) => void,
  onKeyUp?: (KeyboardEvent) => void,
|};

/**
 * The owner-agnostic visual shell for event function lists.
 *
 * Extension, Behavior, Prefab/Object, Scene and External Events owners supply
 * their own tree data and mutation policy, while this component keeps search,
 * row rendering, selection, keyboard navigation and responsive sizing
 * identical for every owner.
 */
const EventsFunctionsTreeView = <Item>({
  listKey,
  treeViewRef,
  items,
  selectedItems,
  getItemName,
  getItemSearchText,
  getItemThumbnail,
  getItemChildren,
  getItemId,
  getItemHtmlId,
  getItemDataset,
  onEditItem,
  onCollapseItem,
  onSelectItems,
  onClickItem,
  onRenameItem,
  buildMenuTemplate,
  getItemRightButton,
  renderRightComponent,
  onMoveSelectionToItem,
  canMoveSelectionToItem,
  reactDndType,
  initiallyOpenedNodeIds,
  forceAllOpened,
  headerControls,
  onKeyDown,
  onKeyUp,
}: Props<Item>): React.Node => {
  const [searchText, setSearchText] = React.useState('');

  return (
    <Background maxWidth>
      <Column>
        <LineStackLayout>
          <Column expand noMargin>
            <CompactSearchBar
              value={searchText}
              onChange={(text) => setSearchText(text)}
              placeholder={t`Search functions`}
            />
          </Column>
        </LineStackLayout>
        {headerControls && (
          <Line noMargin justifyContent="flex-end" alignItems="center">
            {headerControls}
          </Line>
        )}
      </Column>
      <div
        style={styles.listContainer}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        id="events-function-list"
      >
        <div style={styles.autoSizerContainer}>
          <AutoSizer style={styles.autoSizer} disableWidth>
            {({ height }) => (
              // $FlowFixMe[incompatible-type]
              // $FlowFixMe[incompatible-exact]
              <TreeView
                enableStickyAncestors
                key={listKey}
                ref={treeViewRef}
                items={items}
                height={height}
                forceAllOpened={forceAllOpened}
                searchText={searchText}
                getItemName={getItemName}
                getItemSearchText={getItemSearchText}
                getItemThumbnail={getItemThumbnail}
                getItemChildren={getItemChildren}
                multiSelect={false}
                getItemId={getItemId}
                getItemHtmlId={getItemHtmlId}
                getItemDataset={getItemDataset}
                onEditItem={onEditItem}
                onCollapseItem={onCollapseItem}
                selectedItems={selectedItems}
                onSelectItems={onSelectItems}
                onClickItem={onClickItem}
                onRenameItem={onRenameItem}
                buildMenuTemplate={buildMenuTemplate}
                getItemRightButton={getItemRightButton}
                renderRightComponent={renderRightComponent}
                onMoveSelectionToItem={onMoveSelectionToItem}
                canMoveSelectionToItem={canMoveSelectionToItem}
                reactDndType={reactDndType}
                initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                forceDefaultDraggingPreview
                shouldHideMenuIcon={() => true}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </Background>
  );
};

export default EventsFunctionsTreeView;
