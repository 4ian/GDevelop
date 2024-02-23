// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PlaceholderLoader from '../PlaceholderLoader';
import PlaceholderError from '../PlaceholderError';
import ErrorBoundary from '../ErrorBoundary';
import { AutoSizer, Grid } from 'react-virtualized';
import EmptyMessage from '../EmptyMessage';

type Props<SearchItem> = {|
  disableAutoTranslate?: boolean,
  searchItems: ?Array<SearchItem>,
  getSearchItemUniqueId: (item: SearchItem) => string,
  renderSearchItem: (
    item: SearchItem,
    onHeightComputed: (number) => void
  ) => React.Node,
  error: ?Error,
  onRetry: () => void,
|};

const styles = {
  container: { flex: 1 },
  grid: {
    overflowX: 'hidden',
  },
};

const ESTIMATED_ROW_HEIGHT = 90;

/** A virtualized list of search results, caching the searched item heights. */
export const ListSearchResults = <SearchItem>({
  disableAutoTranslate,
  searchItems,
  getSearchItemUniqueId,
  renderSearchItem,
  error,
  onRetry,
}: Props<SearchItem>) => {
  const grid = React.useRef<?Grid>(null);

  // Height of each item is initially unknown. When rendered, the items
  // are reporting their heights and we cache these values.
  const cachedHeightsForWidth = React.useRef(0);
  const cachedHeights = React.useRef({});
  const onItemHeightComputed = React.useCallback(
    (searchItem, height) => {
      const uniqueId = getSearchItemUniqueId(searchItem);
      if (cachedHeights.current[uniqueId] === height) return false;

      cachedHeights.current[uniqueId] = height;
      return true;
    },
    [getSearchItemUniqueId]
  );
  const getRowHeight = React.useCallback(
    ({ index }) => {
      if (!searchItems || !searchItems[index]) return ESTIMATED_ROW_HEIGHT;

      const searchItem = searchItems[index];
      return (
        cachedHeights.current[getSearchItemUniqueId(searchItem)] ||
        ESTIMATED_ROW_HEIGHT
      );
    },
    [searchItems, getSearchItemUniqueId]
  );

  // Render an item, and update the cached height when it's reported
  const renderRow = React.useCallback(
    ({ key, rowIndex, style }) => {
      if (!searchItems) return null;

      const searchItem = searchItems[rowIndex];
      if (!searchItem) return null;

      return (
        <div key={key} style={style}>
          {renderSearchItem(searchItem, height => {
            const heightWasUpdated = onItemHeightComputed(searchItem, height);
            if (heightWasUpdated && grid.current) {
              grid.current.recomputeGridSize(0, rowIndex);
            }
          })}
        </div>
      );
    },
    [searchItems, onItemHeightComputed, renderSearchItem]
  );

  if (!searchItems) {
    if (!error) return <PlaceholderLoader />;
    else {
      return (
        <PlaceholderError onRetry={onRetry}>
          <Trans>
            Can't load the results. Verify your internet connection or retry
            later.
          </Trans>
        </PlaceholderError>
      );
    }
  } else if (searchItems.length === 0) {
    return (
      <EmptyMessage>
        <Trans>
          No results returned for your search. Try something else or typing at
          least 2 characters.
        </Trans>
      </EmptyMessage>
    );
  }

  return (
    <ErrorBoundary
      componentTitle={<Trans>Search results</Trans>}
      scope="list-search-result"
    >
      <div
        style={styles.container}
        className={disableAutoTranslate ? 'notranslate' : ''}
      >
        <AutoSizer>
          {({ width, height }) => {
            // Reset the cached heights in case the width changed.
            if (cachedHeightsForWidth.current !== width) {
              cachedHeights.current = {};
              cachedHeightsForWidth.current = width;
            }

            return (
              <Grid
                ref={el => {
                  if (el) {
                    // Ensure the grid is recomputed for heights once it is rendered.
                    el.recomputeGridSize(0, 0);
                  }
                  grid.current = el;
                }}
                width={width}
                height={height}
                columnCount={1}
                columnWidth={width}
                rowHeight={getRowHeight}
                rowCount={searchItems.length}
                cellRenderer={renderRow}
                style={styles.grid}
              />
            );
          }}
        </AutoSizer>
      </div>
    </ErrorBoundary>
  );
};
