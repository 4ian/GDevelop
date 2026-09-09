// @flow
import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import get from 'lodash/get';
import ReadOnlyTreeView, {
  type ReadOnlyTreeViewInterface,
} from '../UI/TreeView/ReadOnlyTreeView';
import {
  type InspectorDescription,
  type InspectorDescriptionsGetter,
  type GameData,
} from './GDJSInspectorDescriptions';

type Props = {|
  gameData: GameData,
  getInspectorDescriptions: InspectorDescriptionsGetter,
  selectedInspectorFullPath: Array<string>,
  onChooseInspector: (
    InspectorDescription,
    fullInspectorPath: Array<string>
  ) => void,
|};

/** A node of the tree: an inspector, with its data path in the game dump. */
type InspectorTreeItem = {|
  +isRoot?: boolean,
  +isPlaceholder?: boolean,
  id: string,
  label: string,
  description: InspectorDescription,
  fullPath: Array<string>,
  /** The data this inspector describes (used to compute its children). */
  data: any,
|};

const ITEM_HEIGHT = 32;
const getItemId = (item: InspectorTreeItem) => item.id;
const getItemName = (item: InspectorTreeItem) => item.label;
const getItemHeight = () => ITEM_HEIGHT;
const shouldApplySearchToItem = () => true;

const buildItems = (
  data: GameData,
  getInspectorDescriptions: InspectorDescriptionsGetter,
  parentPath: Array<string>
): Array<InspectorTreeItem> =>
  getInspectorDescriptions(data)
    .filter(Boolean)
    .map(description => {
      const fullPath = parentPath.concat(description.key);
      return {
        id: fullPath.join('.'),
        label: description.label,
        description,
        fullPath,
        data: get(data, description.key, null),
      };
    });

/**
 * The content of the running game (scenes, objects, variables, layers...) as
 * a tree, like the lists of the editors. Choosing an item shows its inspector.
 */
const InspectorsList = ({
  gameData,
  getInspectorDescriptions,
  selectedInspectorFullPath,
  onChooseInspector,
}: Props): React.Node => {
  const items = React.useMemo(
    () => (gameData ? buildItems(gameData, getInspectorDescriptions, []) : []),
    [gameData, getInspectorDescriptions]
  );
  // Children are computed once per item, for the whole dump (the cache is
  // renewed with the items, when the dump changes).
  const childrenCache = React.useMemo<Map<string, Array<InspectorTreeItem>>>(
    () => new Map(),
    [items] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const getItemChildren = React.useCallback(
    (item: InspectorTreeItem): ?Array<InspectorTreeItem> => {
      const getSubInspectors = item.description.getSubInspectors;
      if (!getSubInspectors) return null;
      let children = childrenCache.get(item.id);
      if (!children) {
        children = buildItems(item.data, getSubInspectors, item.fullPath);
        childrenCache.set(item.id, children);
      }
      return children;
    },
    [childrenCache]
  );

  const initiallyOpenedNodeIds = React.useMemo(
    () =>
      items.filter(item => item.description.initiallyOpen).map(item => item.id),
    [items]
  );
  const selectedId = selectedInspectorFullPath.join('.');
  const selectedItems = React.useMemo(
    () => {
      const findItem = (
        candidates: Array<InspectorTreeItem>
      ): InspectorTreeItem | null => {
        for (const candidate of candidates) {
          if (candidate.id === selectedId) return candidate;
          if (selectedId.startsWith(candidate.id + '.')) {
            const children = getItemChildren(candidate);
            const found: InspectorTreeItem | null = children
              ? findItem(children)
              : null;
            if (found) return found;
          }
        }
        return null;
      };
      const selectedItem = selectedId ? findItem(items) : null;
      return selectedItem ? [selectedItem] : [];
    },
    [items, selectedId, getItemChildren]
  );

  const treeViewRef = React.useRef<?ReadOnlyTreeViewInterface<InspectorTreeItem>>(
    null
  );
  // Clicking the row of a folder opens or closes it (not only its arrow).
  const onClickItem = React.useCallback(
    (item: InspectorTreeItem) => {
      const treeView = treeViewRef.current;
      if (!treeView || !getItemChildren(item)) return;
      const [isOpen] = treeView.areItemsOpenFromId([item.id]);
      if (isOpen) treeView.closeItems([item.id]);
      else treeView.openItems([item.id]);
    },
    [getItemChildren]
  );

  if (!gameData) return null;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <AutoSizer>
        {({ height, width }) => (
          <ReadOnlyTreeView
            ref={treeViewRef}
            height={height}
            width={width}
            items={items}
            estimatedItemSize={ITEM_HEIGHT}
            getItemHeight={getItemHeight}
            shouldApplySearchToItem={shouldApplySearchToItem}
            getItemName={getItemName}
            getItemId={getItemId}
            getItemChildren={getItemChildren}
            selectedItems={selectedItems}
            onClickItem={onClickItem}
            initiallyOpenedNodeIds={initiallyOpenedNodeIds}
            enableStickyAncestors
            onSelectItems={(selectedTreeItems: Array<InspectorTreeItem>) => {
              const item = selectedTreeItems[0];
              if (item) onChooseInspector(item.description, item.fullPath);
            }}
            multiSelect={false}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default InspectorsList;
