// @flow
import * as React from 'react';
import classNames from 'classnames';
import GraphsIcon from '../UI/CustomSvgIcons/Graphs';
import RefreshIcon from '../UI/CustomSvgIcons/Refresh';
import {
  buildEventsGraphPreviewItems,
  filterEventsGraphPreviewItemsBySearch,
  type EventsGraphPreviewEventItem,
  type EventsGraphPreviewGroupItem,
  type EventsGraphPreviewItem,
} from './EventsGraphPreviewData';
import { getCollapsedGroupPathsAfterGroupPathChange } from './EventsGraphPreviewPanelState';
import {
  type EventContext,
  type SelectionState,
  isEventSelected,
} from './SelectionHandler';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

import './EventsGraphPreviewPanel.css';

type Props = {|
  events: gdEventsList,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  selection: SelectionState,
  onSelectEvent: EventContext => void,
  width: number,
|};

const getItemsCount = (items: Array<EventsGraphPreviewItem>): number =>
  items.reduce((count, item) => count + 1 + getItemsCount(item.children), 0);

const getChildItemsCount = (item: EventsGraphPreviewItem): number =>
  getItemsCount(item.children);

const getGroupPathStrings = (
  items: Array<EventsGraphPreviewItem>
): Array<string> =>
  items.reduce((groupPathStrings, item) => {
    if (item.itemType === 'group') {
      groupPathStrings.push(item.pathString);
    }

    groupPathStrings.push(...getGroupPathStrings(item.children));
    return groupPathStrings;
  }, []);

const findSelectedItem = (
  items: Array<EventsGraphPreviewItem>,
  selection: SelectionState
): ?EventsGraphPreviewItem => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (isEventSelected(selection, item.eventContext.event)) {
      return item;
    }

    const selectedChild = findSelectedItem(item.children, selection);
    if (selectedChild) return selectedChild;
  }

  return null;
};

const getBadges = (
  item: EventsGraphPreviewEventItem | EventsGraphPreviewGroupItem
) => {
  const badges = [];
  if (item.disabled) badges.push('disabled');
  if (item.disabledBecauseOfAncestor) badges.push('ancestor disabled');
  if (item.itemType === 'event' && item.isInvalidElse) {
    badges.push('invalid else');
  }
  return badges;
};

const EventRow = ({
  item,
  selection,
  onSelectEvent,
}: {|
  item: EventsGraphPreviewEventItem,
  selection: SelectionState,
  onSelectEvent: EventContext => void,
|}) => {
  const selected = isEventSelected(selection, item.eventContext.event);
  const badges = getBadges(item);

  return (
    <button
      type="button"
      className={classNames('events-graph-preview-map-row', {
        selected,
        disabled: item.disabled || item.disabledBecauseOfAncestor,
        invalid: item.isInvalidElse,
      })}
      onClick={() => onSelectEvent(item.eventContext)}
      data-event-path={item.pathString}
      data-graph-item-type="event"
      title={`${item.displayPath} ${item.summaryTitle}`}
    >
      <span className="events-graph-preview-path">{item.displayPath}</span>
      <span className="events-graph-preview-kind">E</span>
      <span className="events-graph-preview-summary-title">
        {item.summaryTitle}
      </span>
      {badges.length > 0 && (
        <span className="events-graph-preview-badges">
          {badges.map(badge => (
            <span className="events-graph-preview-badge" key={badge}>
              {badge}
            </span>
          ))}
        </span>
      )}
    </button>
  );
};

const GroupRow = ({
  item,
  selection,
  onSelectEvent,
  isExpanded,
  onToggleExpanded,
}: {|
  item: EventsGraphPreviewGroupItem,
  selection: SelectionState,
  onSelectEvent: EventContext => void,
  isExpanded: boolean,
  onToggleExpanded: () => void,
|}) => {
  const selected = isEventSelected(selection, item.eventContext.event);
  const badges = getBadges(item);

  return (
    <div
      className={classNames('events-graph-preview-map-group-row', {
        selected,
        disabled: item.disabled || item.disabledBecauseOfAncestor,
      })}
      data-event-path={item.pathString}
      data-graph-item-type="group"
    >
      <button
        type="button"
        className={classNames('events-graph-preview-disclosure', {
          expanded: isExpanded,
          collapsed: !isExpanded,
        })}
        onClick={onToggleExpanded}
        aria-label={isExpanded ? 'Collapse group' : 'Expand group'}
      />
      <button
        type="button"
        className="events-graph-preview-map-row events-graph-preview-map-row-group"
        onClick={() => onSelectEvent(item.eventContext)}
        title={`${item.displayPath} ${item.title}`}
      >
        <span className="events-graph-preview-path">{item.displayPath}</span>
        <span className="events-graph-preview-kind">G</span>
        <span className="events-graph-preview-summary-title">{item.title}</span>
        <span className="events-graph-preview-child-count">
          {getChildItemsCount(item)}
        </span>
        {badges.length > 0 && (
          <span className="events-graph-preview-badges">
            {badges.map(badge => (
              <span className="events-graph-preview-badge" key={badge}>
                {badge}
              </span>
            ))}
          </span>
        )}
      </button>
    </div>
  );
};

const RelatedComments = ({
  item,
  onSelectEvent,
}: {|
  item: EventsGraphPreviewItem,
  onSelectEvent: EventContext => void,
|}) => {
  if (item.relatedCommentLines.length === 0) {
    return null;
  }

  return (
    <div className="events-graph-preview-related-comments">
      {item.relatedCommentLines.map((commentLine, index) => (
        <button
          type="button"
          className="events-graph-preview-related-comment"
          key={`${item.id}-comment-${index}`}
          onClick={() => onSelectEvent(item.eventContext)}
          title={commentLine}
        >
          <span className="events-graph-preview-details-label">Comment</span>
          <span className="events-graph-preview-related-comment-text">
            {commentLine}
          </span>
        </button>
      ))}
    </div>
  );
};

type TreeItemProps = {|
  item: EventsGraphPreviewItem,
  selection: SelectionState,
  onSelectEvent: EventContext => void,
  collapsedGroupPaths: Set<string>,
  onToggleGroup: string => void,
  showRelatedComments: boolean,
|};

const TreeItem: React.ComponentType<TreeItemProps> = ({
  item,
  selection,
  onSelectEvent,
  collapsedGroupPaths,
  onToggleGroup,
  showRelatedComments,
}: TreeItemProps) => {
  if (item.itemType === 'group') {
    const isExpanded = !collapsedGroupPaths.has(item.pathString);
    return (
      <li
        className={classNames(
          'events-graph-preview-map-item',
          'events-graph-preview-map-item-group'
        )}
        style={
          ({
            '--events-graph-preview-group-border': item.backgroundColor,
          }: any)
        }
      >
        <GroupRow
          item={item}
          selection={selection}
          onSelectEvent={onSelectEvent}
          isExpanded={isExpanded}
          onToggleExpanded={() => onToggleGroup(item.pathString)}
        />
        {showRelatedComments && (
          <RelatedComments item={item} onSelectEvent={onSelectEvent} />
        )}
        {isExpanded && item.children.length > 0 && (
          <ol className="events-graph-preview-map-children">
            {item.children.map(child => (
              <TreeItem
                key={child.id}
                item={child}
                selection={selection}
                onSelectEvent={onSelectEvent}
                collapsedGroupPaths={collapsedGroupPaths}
                onToggleGroup={onToggleGroup}
                showRelatedComments={showRelatedComments}
              />
            ))}
          </ol>
        )}
      </li>
    );
  }

  return (
    <li className="events-graph-preview-map-item">
      <EventRow
        item={item}
        selection={selection}
        onSelectEvent={onSelectEvent}
      />
      {showRelatedComments && (
        <RelatedComments item={item} onSelectEvent={onSelectEvent} />
      )}
      {item.children.length > 0 && (
        <ol className="events-graph-preview-map-children">
          {item.children.map(child => (
            <TreeItem
              key={child.id}
              item={child}
              selection={selection}
              onSelectEvent={onSelectEvent}
              collapsedGroupPaths={collapsedGroupPaths}
              onToggleGroup={onToggleGroup}
              showRelatedComments={showRelatedComments}
            />
          ))}
        </ol>
      )}
    </li>
  );
};

const DetailsPane = ({ item }: {| item: ?EventsGraphPreviewItem |}) => {
  if (!item) {
    return (
      <div className="events-graph-preview-details empty">
        Select an item to see details
      </div>
    );
  }

  if (item.itemType === 'group') {
    return (
      <div className="events-graph-preview-details">
        <div className="events-graph-preview-details-header">
          <span className="events-graph-preview-path">{item.displayPath}</span>
          <span className="events-graph-preview-details-title">
            {item.title}
          </span>
        </div>
        <div className="events-graph-preview-details-line">
          Group with {getChildItemsCount(item)} item
          {getChildItemsCount(item) === 1 ? '' : 's'}
        </div>
      </div>
    );
  }

  return (
    <div className="events-graph-preview-details">
      <div className="events-graph-preview-details-header">
        <span className="events-graph-preview-path">{item.displayPath}</span>
        <span className="events-graph-preview-details-title">
          {item.summaryTitle}
        </span>
      </div>
      {item.elseOfPathString && (
        <div className="events-graph-preview-details-line link">
          else of {item.elseOfPathString}
        </div>
      )}
      {item.conditionLines.length > 0 ? (
        item.conditionLines.map((line, index) => (
          <div className="events-graph-preview-details-line" key={index}>
            <span className="events-graph-preview-details-label">
              Condition
            </span>
            <span>{line}</span>
          </div>
        ))
      ) : (
        <div className="events-graph-preview-details-line muted">
          No conditions
        </div>
      )}
    </div>
  );
};

export default function EventsGraphPreviewPanel({
  events,
  projectScopedContainersAccessor,
  selection,
  onSelectEvent,
  width,
}: Props): React.Node {
  const [, setCatalogRefreshNonce] = React.useState<number>(0);
  const items = buildEventsGraphPreviewItems({
    eventsList: events,
    projectScopedContainersAccessor,
  });
  const allGroupPathStrings = getGroupPathStrings(items);
  const allGroupPathStringsKey = allGroupPathStrings.join('\n');
  const previousGroupPathStringsRef = React.useRef<Array<string>>(
    allGroupPathStrings
  );
  const [searchText, setSearchText] = React.useState<string>('');
  const [collapsedGroupPaths, setCollapsedGroupPaths] = React.useState<
    Set<string>
  >(() => new Set(allGroupPathStrings));
  const filteredItems = filterEventsGraphPreviewItemsBySearch(
    items,
    searchText
  );
  const selectedItem = findSelectedItem(items, selection);
  const itemsCount = getItemsCount(items);
  const filteredItemsCount = getItemsCount(filteredItems);
  const isSearching = searchText.trim().length > 0;
  const visibleGroupPathStrings = getGroupPathStrings(filteredItems);
  const areAllVisibleGroupsCollapsed =
    visibleGroupPathStrings.length > 0 &&
    visibleGroupPathStrings.every(pathString =>
      collapsedGroupPaths.has(pathString)
    );
  const toggleAllVisibleGroupsLabel = areAllVisibleGroupsCollapsed
    ? 'Expand all'
    : 'Collapse all';
  const refreshCatalog = React.useCallback(() => {
    setCatalogRefreshNonce(
      previousCatalogRefreshNonce => previousCatalogRefreshNonce + 1
    );
  }, []);

  React.useEffect(
    () => {
      const currentGroupPathStrings = allGroupPathStringsKey
        ? allGroupPathStringsKey.split('\n')
        : [];
      const previousGroupPathStrings = previousGroupPathStringsRef.current;

      setCollapsedGroupPaths(previousCollapsedGroupPaths =>
        getCollapsedGroupPathsAfterGroupPathChange({
          previousCollapsedGroupPaths,
          previousGroupPathStrings,
          currentGroupPathStrings,
        })
      );
      previousGroupPathStringsRef.current = currentGroupPathStrings;
    },
    [allGroupPathStringsKey]
  );

  const toggleGroup = React.useCallback((pathString: string) => {
    setCollapsedGroupPaths(previousCollapsedGroupPaths => {
      const nextCollapsedGroupPaths = new Set(previousCollapsedGroupPaths);
      if (nextCollapsedGroupPaths.has(pathString)) {
        nextCollapsedGroupPaths.delete(pathString);
      } else {
        nextCollapsedGroupPaths.add(pathString);
      }
      return nextCollapsedGroupPaths;
    });
  }, []);

  const toggleAllVisibleGroups = () => {
    setCollapsedGroupPaths(previousCollapsedGroupPaths => {
      if (visibleGroupPathStrings.length === 0) {
        return previousCollapsedGroupPaths;
      }

      const shouldExpandAll = visibleGroupPathStrings.every(pathString =>
        previousCollapsedGroupPaths.has(pathString)
      );
      const nextCollapsedGroupPaths = new Set(previousCollapsedGroupPaths);
      visibleGroupPathStrings.forEach(pathString => {
        if (shouldExpandAll) {
          nextCollapsedGroupPaths.delete(pathString);
        } else {
          nextCollapsedGroupPaths.add(pathString);
        }
      });
      return nextCollapsedGroupPaths;
    });
  };

  return (
    <aside
      className="events-graph-preview-panel"
      style={{ width }}
      aria-label="Events catalog preview"
    >
      <div className="events-graph-preview-header">
        <GraphsIcon fontSize="small" />
        <span>Catalog</span>
        <button
          type="button"
          className="events-graph-preview-refresh"
          onClick={refreshCatalog}
          title="Refresh catalog"
          aria-label="Refresh catalog"
        >
          <RefreshIcon fontSize="small" />
        </button>
        <button
          type="button"
          className="events-graph-preview-toggle-all"
          onClick={toggleAllVisibleGroups}
          disabled={visibleGroupPathStrings.length === 0}
          title={toggleAllVisibleGroupsLabel}
          aria-label={toggleAllVisibleGroupsLabel}
        >
          {toggleAllVisibleGroupsLabel}
        </button>
        <span className="events-graph-preview-count">
          {isSearching ? `${filteredItemsCount}/${itemsCount}` : itemsCount}
        </span>
      </div>
      <div className="events-graph-preview-search">
        <input
          type="search"
          className="events-graph-preview-search-input"
          value={searchText}
          onChange={event => setSearchText(event.currentTarget.value)}
          placeholder="Search catalog"
          aria-label="Search catalog"
        />
      </div>
      <div className="events-graph-preview-scroll">
        {filteredItems.length > 0 ? (
          <ol className="events-graph-preview-map">
            {filteredItems.map(item => (
              <TreeItem
                key={item.id}
                item={item}
                selection={selection}
                onSelectEvent={onSelectEvent}
                collapsedGroupPaths={collapsedGroupPaths}
                onToggleGroup={toggleGroup}
                showRelatedComments={isSearching}
              />
            ))}
          </ol>
        ) : (
          <div className="events-graph-preview-empty">No matching events</div>
        )}
      </div>
      <DetailsPane item={selectedItem} />
    </aside>
  );
}
