// @flow
import * as React from 'react';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { ExampleTile } from '../AssetStore/ShopTiles';
import { GridList } from '@material-ui/core';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { type QuickCustomizationRecommendation } from '../Utils/GDevelopServices/User';

type Props = {|
  onSelectExampleShortHeader: (
    exampleShortHeader: ExampleShortHeader
  ) => Promise<void>,
  quickCustomizationRecommendation: QuickCustomizationRecommendation,
|};

const styles = {
  grid: {
    margin: 0,
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
  cellSpacing: 2,
};

export const QuickCustomizationGameTiles = ({
  onSelectExampleShortHeader,
  quickCustomizationRecommendation,
}: Props) => {
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const { windowSize } = useResponsiveWindowSize();

  const displayedExampleShortHeaders = React.useMemo(
    () =>
      exampleShortHeaders
        ? quickCustomizationRecommendation.list
            .map(({ type, exampleSlug }) => {
              if (type !== 'example') {
                return null;
              }

              return exampleShortHeaders.find(
                exampleShortHeader => exampleShortHeader.slug === exampleSlug
              );
            })
            .filter(Boolean)
        : null,
    [exampleShortHeaders, quickCustomizationRecommendation.list]
  );

  return (
    <GridList
      cols={windowSize === 'small' ? 2 : windowSize === 'medium' ? 3 : 4}
      style={styles.grid}
      cellHeight="auto"
      spacing={styles.cellSpacing}
    >
      {displayedExampleShortHeaders
        ? displayedExampleShortHeaders.map(exampleShortHeader => (
            <ExampleTile
              exampleShortHeader={exampleShortHeader}
              onSelect={() => {
                onSelectExampleShortHeader(exampleShortHeader);
              }}
              key={exampleShortHeader.name}
            />
          ))
        : new Array(quickCustomizationRecommendation.list.length)
            .fill(0)
            .map((_, index) => (
              <ExampleTile
                exampleShortHeader={null}
                onSelect={() => {}}
                key={`skeleton-${index}`}
              />
            ))}
    </GridList>
  );
};
