// @flow
import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import SearchBar from '../UI/SearchBar';
import classes from './InspectorsList.module.css';
import { getAtInspectorPath } from './inspectorPath';
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
const getItemHeight = () => ITEM_HEIGHT;

/** The row: the icon of what it is, then its label. */
const getItemName = (item: InspectorTreeItem) => (
  <span className={classes.row}>
    {item.description.icon && (
      <span className={classes.rowIcon}>{item.description.icon}</span>
    )}
    <span className={classes.rowLabel} title={item.label}>
      {item.label}
    </span>
  </span>
);

/**
 * What a row shows: a name coming from the game, or a wording of the editor
 * translated here, so that the label is searched and sorted as it is read.
 */
const getDescriptionLabel = (
  i18n: I18nType,
  description: InspectorDescription
): string =>
  description.translatableLabel
    ? i18n._(description.translatableLabel)
    : description.label || '';

const buildItems = (
  i18n: I18nType,
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
        label: getDescriptionLabel(i18n, description),
        description,
        fullPath,
        data: getAtInspectorPath(data, description.key),
      };
    });

/**
 * The content of the running game (scenes, objects, variables, layers...) as
 * a tree, like the lists of the editors. Choosing an item shows its inspector.
 */
const InspectorsListContent = ({
  i18n,
  gameData,
  getInspectorDescriptions,
  selectedInspectorFullPath,
  onChooseInspector,
}: {|
  ...Props,
  i18n: I18nType,
|}): React.Node => {
  const items = React.useMemo(
    () =>
      gameData ? buildItems(i18n, gameData, getInspectorDescriptions, []) : [],
    [i18n, gameData, getInspectorDescriptions]
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
        children = buildItems(i18n, item.data, getSubInspectors, item.fullPath);
        childrenCache.set(item.id, children);
      }
      // An object without instance, a scene without variable: nothing to
      // open, so the row is shown as a leaf rather than an empty folder.
      return children.length ? children : null;
    },
    [i18n, childrenCache]
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

  const [searchText, setSearchText] = React.useState<string>('');
  const lowerCaseSearchText = searchText.trim().toLowerCase();
  // The rows are rendered nodes, not texts: the match is done here on the
  // label, and the tree is told to keep the matching rows (`false`).
  const shouldApplySearchToItem = React.useCallback(
    (item: InspectorTreeItem) =>
      !lowerCaseSearchText ||
      !item.label.toLowerCase().includes(lowerCaseSearchText),
    [lowerCaseSearchText]
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

  // Never unmounted when the game data goes away: the tree would lose
  // everything the user had opened, and get it back folded.
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className={classes.searchBar}>
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          onRequestSearch={() => {}}
          placeholder={t`Search an object, an instance...`}
        />
      </div>
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
              searchText={lowerCaseSearchText}
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
    </div>
  );
};

/**
 * The tree needs the translations to build its rows: the labels are searched
 * and shown as strings, not as React nodes.
 */
const InspectorsList = (props: Props): React.Node => (
  <I18n>{({ i18n }) => <InspectorsListContent {...props} i18n={i18n} />}</I18n>
);

export default InspectorsList;
