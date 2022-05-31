// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PlaceholderLoader from '../PlaceholderLoader';
import PlaceholderError from '../PlaceholderError';
import ErrorBoundary from '../ErrorBoundary';
import { AutoSizer, Grid } from 'react-virtualized';
import EmptyMessage from '../EmptyMessage';
import {
  GridListTile,
  GridList,
  makeStyles,
  createStyles,
} from '@material-ui/core';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import { shouldValidate } from '../../UI/KeyboardShortcuts/InteractionKeys';

const styles = {
  container: { flex: 1 },
  grid: { overflowX: 'hidden' },
};

type Props<SearchItem> = {|
  searchItems: ?Array<SearchItem>,
  renderSearchItem: (item: SearchItem, size: number) => React.Node,
  error: ?Error,
  onRetry: () => void,
  baseSize: number,
  noResultPlaceholder?: React.Node,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
|};

// The dimensions are retrieved using this solution:
// https://stackoverflow.com/a/70608516
const ResponsiveGrid = React.forwardRef(
  (
    {
      searchItems,
      renderSearchItem,
      error,
      onRetry,
      baseSize,
      noResultPlaceholder,
      onOpenDetails,
    }: Props<SearchItem>,
    ref
  ) => {
    const [width, setWidth] = React.useState(100);
    const [height, setHeight] = React.useState(100);

    React.useEffect(
      () => {
        const resizeObserver = new ResizeObserver(event => {
          // Depending on the layout, you may need to swap inlineSize with blockSize
          // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentBoxSize
          setWidth(event[0].contentBoxSize[0].inlineSize);
          setHeight(event[0].contentBoxSize[0].blockSize);
        });

        if (ref && ref.current) {
          resizeObserver.observe(ref.current);
        }
      },
      [ref]
    );

    console.log(width);

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
        noResultPlaceholder || (
          <EmptyMessage>
            <Trans>
              No results returned for your search. Try something else, browse
              the categories or create your object from scratch!
            </Trans>
          </EmptyMessage>
        )
      );
    }

    const columnCount = Math.max(Math.floor((width - 5) / baseSize), 1);
    const columnWidth = Math.max(Math.floor(width / columnCount), 30);
    const rowCount = Math.max(1, Math.ceil(searchItems.length / columnCount));

    return (
      <GridList
        style={styles.grid}
        cellHeight="auto"
        spacing={0}
        cols={columnCount}
      >
        >
        {searchItems.map((searchItem, index) => {
          return (
            <GridListTile
              key={'Similar' + index}
              cols={1}
              rows={1}
              tabIndex={0}
              onKeyPress={(
                event: SyntheticKeyboardEvent<HTMLLIElement>
              ): void => {
                if (shouldValidate(event)) {
                  onOpenDetails(searchItem);
                }
              }}
            >
              {renderSearchItem(searchItem, columnWidth)}
            </GridListTile>
          );
        })}
      </GridList>
    );
  }
);

export const BoxSearchResultsNoScroll = <SearchItem>({
  searchItems,
  renderSearchItem,
  error,
  onRetry,
  baseSize,
  noResultPlaceholder,
  onOpenDetails,
}: Props<SearchItem>) => {
  const containerRef = React.useRef();
  return (
    <div ref={containerRef}>
      <ResponsiveGrid
        ref={containerRef}
        searchItems={searchItems}
        renderSearchItem={renderSearchItem}
        error={error}
        onRetry={onRetry}
        baseSize={baseSize}
        noResultPlaceholder={noResultPlaceholder}
        onOpenDetails={onOpenDetails}
      />
    </div>
  );
};
