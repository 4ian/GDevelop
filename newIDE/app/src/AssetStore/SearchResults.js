// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { AssetCard } from './AssetCard';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { AutoSizer, Grid } from 'react-virtualized';
import EmptyMessage from '../UI/EmptyMessage';

type Props = {|
  assetShortHeaders: ?Array<AssetShortHeader>,
  error: ?Error,
  onRetry: () => void,
  onOpenDetails: AssetShortHeader => void,
|};

const styles = {
  container: { flex: 1 },
  grid: { overflowX: 'hidden' },
};

export const SearchResults = ({
  assetShortHeaders,
  error,
  onRetry,
  onOpenDetails,
}: Props) => {
  if (!assetShortHeaders) {
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
  } else if (assetShortHeaders.length === 0) {
    return (
      <EmptyMessage>
        <Trans>
          No results returned for your search. Try something else, browse the
          categories or create your object from scratch!
        </Trans>
      </EmptyMessage>
    );
  }

  return (
    <div style={styles.container}>
      <AutoSizer>
        {({ width, height }) => {
          if (!width || !height) return null;

          const baseSize = 128;
          const columnCount = Math.floor((width - 5) / baseSize);
          const columnWidth = Math.floor(width / columnCount);
          const rowCount = Math.max(
            1,
            Math.ceil(assetShortHeaders.length / columnCount)
          );

          function cellRenderer({ columnIndex, key, rowIndex, style }) {
            const indexInList = rowIndex * columnCount + columnIndex;
            const assetShortHeader =
              indexInList < assetShortHeaders.length
                ? assetShortHeaders[indexInList]
                : null;

            return (
              <div key={key} style={style}>
                {assetShortHeader ? (
                  <AssetCard
                    size={columnWidth}
                    onOpenDetails={() => onOpenDetails(assetShortHeader)}
                    assetShortHeader={assetShortHeader}
                  />
                ) : null}
              </div>
            );
          }

          return (
            <Grid
              width={width}
              height={height}
              columnCount={columnCount}
              columnWidth={columnWidth}
              rowHeight={columnWidth}
              rowCount={rowCount}
              cellRenderer={cellRenderer}
              style={styles.grid}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};
