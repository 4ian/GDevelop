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

type Props<SearchItem> = {|
  searchItems: ?Array<SearchItem>,
  renderSearchItem: (item: SearchItem, size: number) => React.Node,
  error: ?Error,
  onRetry: () => void,
  baseSize: number,
  noResultPlaceholder?: React.Node,
|};

const styles = {
  container: { flex: 1 },
  grid: { overflowX: 'hidden' },
};

export const BoxSearchResultsNoScroll = <SearchItem>({
  searchItems,
  renderSearchItem,
  error,
  onRetry,
  baseSize,
  noResultPlaceholder,
}: Props<SearchItem>) => {
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
            No results returned for your search. Try something else, browse the
            categories or create your object from scratch!
          </Trans>
        </EmptyMessage>
      )
    );
  }

  return (
        <AutoSizer>
          {({ width, height }) => {
            if (!width || !height) return null;
            console.log("Dimensions: " + width + " " + height);

            const columnCount = Math.max(Math.floor((width - 5) / baseSize), 1);
            const columnWidth = Math.max(Math.floor(width / columnCount), 30);
            const rowCount = Math.max(
              1,
              Math.ceil(searchItems.length / columnCount)
            );
            console.log("columnWidth: " + columnWidth);

            return (
              <GridList
              style={styles.grid}
              cellHeight={columnWidth}
              spacing={0}
              cols={columnCount}
              style={{
                width: width,
                height: rowCount * columnWidth,
              }}>
            >
              {searchItems.map((searchItem, index) => {
                console.log("Item: " + index);
                //return(<Text key={"Similar" + index}>{"ITEMABC"}</Text>);
                return (<GridListTile
                  //classes={classesForGridListItem}
                  key={"Similar" + index}
                  cols={1} rows={1}
                  tabIndex={0}
                  onKeyPress={(
                    event: SyntheticKeyboardEvent<HTMLLIElement>
                  ): void => {
                    // if (shouldValidate(event)) {
                    // }
                  }}
                  onClick={() => {}}
                >
                {renderSearchItem(searchItem, columnWidth)}
                </GridListTile>);
              }
              )}
            </GridList>
            );
          }}
        </AutoSizer>
  );
};
