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
  columnCount?: number,
  columnWidth?: number,
|};

const styles = {
  container: { flex: 1 },
  grid: {
    overflowX: 'hidden',
  },
  cell: {
    padding: 4,
    boxSizing: 'border-box',
  },
};

const ESTIMATED_CELL_HEIGHT = 250;
const DEFAULT_COLUMN_COUNT = 3;
const OVERSCAN_CELLS_COUNT = 25;

/** A virtualized grid of search results, caching the searched item heights. */
export const GridSearchResults = <SearchItem>({
  disableAutoTranslate,
  searchItems,
  getSearchItemUniqueId,
  renderSearchItem,
  error,
  onRetry,
  columnCount = DEFAULT_COLUMN_COUNT,
}: Props<SearchItem>): any => {
  // $FlowFixMe[value-as-type]
  const grid = React.useRef<?Grid>(null);

  // Height of each item is initially unknown. When rendered, the items
  // are reporting their heights and we cache these values.
  const cachedHeightsForWidth = React.useRef(0);
  const cachedHeights = React.useRef({});
  const onItemHeightComputed = React.useCallback(
    // $FlowFixMe[missing-local-annot]
    (searchItem, height) => {
      const uniqueId = getSearchItemUniqueId(searchItem);
      // $FlowFixMe[invalid-computed-prop]
      if (cachedHeights.current[uniqueId] === height) return false;

      // $FlowFixMe[prop-missing]
      cachedHeights.current[uniqueId] = height;
      return true;
    },
    [getSearchItemUniqueId]
  );

  const getRowHeight = React.useCallback(
    // $FlowFixMe[missing-local-annot]
    ({ index }) => {
      if (!searchItems) return ESTIMATED_CELL_HEIGHT;

      // Calculate the maximum height for all items in this row
      let maxHeight = ESTIMATED_CELL_HEIGHT;
      for (let col = 0; col < columnCount; col++) {
        const itemIndex = index * columnCount + col;
        if (itemIndex >= searchItems.length) break;

        const searchItem = searchItems[itemIndex];
        const height =
          // $FlowFixMe[invalid-computed-prop]
          cachedHeights.current[getSearchItemUniqueId(searchItem)] ||
          ESTIMATED_CELL_HEIGHT;
        maxHeight = Math.max(maxHeight, height);
      }
      return maxHeight;
    },
    [searchItems, getSearchItemUniqueId, columnCount]
  );

  // Render a cell in the grid
  const renderCell = React.useCallback(
    // $FlowFixMe[missing-local-annot]
    ({ columnIndex, key, rowIndex, style }) => {
      if (!searchItems) return null;

      const itemIndex = rowIndex * columnCount + columnIndex;
      if (itemIndex >= searchItems.length) return null;

      const searchItem = searchItems[itemIndex];
      if (!searchItem) return null;

      return (
        <div key={key} style={{ ...style, ...styles.cell }}>
          {renderSearchItem(searchItem, height => {
            const heightWasUpdated = onItemHeightComputed(searchItem, height);
            if (heightWasUpdated && grid.current) {
              grid.current.recomputeGridSize({ rowIndex });
            }
          })}
        </div>
      );
    },
    [searchItems, onItemHeightComputed, renderSearchItem, columnCount]
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

  const rowCount = Math.ceil(searchItems.length / columnCount);

  return (
    <ErrorBoundary
      componentTitle={<Trans>Search results</Trans>}
      scope="grid-search-result"
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

            const columnWidth = Math.floor(width / columnCount);

            return (
              <Grid
                ref={el => {
                  if (el) {
                    // Ensure the grid is recomputed for heights once it is rendered.
                    el.recomputeGridSize();
                  }
                  grid.current = el;
                }}
                width={width}
                height={height}
                columnCount={columnCount}
                columnWidth={columnWidth}
                rowHeight={getRowHeight}
                rowCount={rowCount}
                cellRenderer={renderCell}
                style={styles.grid}
                overscanIndicesGetter={({
                  cellCount,
                  overscanCellsCount,
                  startIndex,
                  stopIndex,
                }) => ({
                  overscanStartIndex: Math.max(
                    0,
                    startIndex - OVERSCAN_CELLS_COUNT
                  ),
                  overscanStopIndex: Math.min(
                    cellCount - 1,
                    stopIndex + OVERSCAN_CELLS_COUNT
                  ),
                })}
              />
            );
          }}
        </AutoSizer>
      </div>
    </ErrorBoundary>
  );
};
