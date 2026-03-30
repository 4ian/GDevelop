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
|};

const styles = {
  container: { flex: 1 },
  grid: {
    overflowX: 'hidden',
  },
  cell: {
    boxSizing: 'border-box',
  },
};

const ESTIMATED_ROW_HEIGHT = 96;
const DEFAULT_COLUMN_COUNT = 1;

// Keep overscanCount relatively high so that:
// - during in-app tutorials we make sure the tooltip displayer finds
//   the elements to highlight
const OVERSCAN_CELLS_COUNT = 25;

/** A virtualized list of search results, caching the searched item heights. */
export const ListSearchResults = <SearchItem>({
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
      if (!searchItems) return ESTIMATED_ROW_HEIGHT;

      let maxHeight = ESTIMATED_ROW_HEIGHT;
      for (let col = 0; col < columnCount; col++) {
        const itemIndex = index * columnCount + col;
        if (itemIndex >= searchItems.length) break;

        const searchItem = searchItems[itemIndex];
        const height =
          // $FlowFixMe[invalid-computed-prop]
          cachedHeights.current[getSearchItemUniqueId(searchItem)] ||
          ESTIMATED_ROW_HEIGHT;
        maxHeight = Math.max(maxHeight, height);
      }

      return maxHeight;
    },
    [searchItems, getSearchItemUniqueId, columnCount]
  );

  // Render an item, and update the cached height when it's reported
  const renderRow = React.useCallback(
    // $FlowFixMe[missing-local-annot]
    ({ columnIndex, key, rowIndex, style }) => {
      if (!searchItems) return null;

      const itemIndex = rowIndex * columnCount + columnIndex;
      const searchItem = searchItems[itemIndex];
      if (!searchItem) return null;

      return (
        <div
          key={key}
          style={{
            ...style,
            ...styles.cell,
            paddingLeft: columnCount > 1 ? 4 : 0,
            paddingRight: columnCount > 1 ? 4 : 0,
          }}
        >
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
                    el.recomputeGridSize();
                  }
                  grid.current = el;
                }}
                width={width}
                height={height}
                columnCount={columnCount}
                columnWidth={Math.floor(width / columnCount)}
                rowHeight={getRowHeight}
                rowCount={rowCount}
                cellRenderer={renderRow}
                style={styles.grid}
                // We override this function to avoid a bug in react-virtualized
                // where the overscanCellsCount is not taken into account after a scroll
                // see https://github.com/bvaughn/react-virtualized/issues/1582#issuecomment-785073746
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
