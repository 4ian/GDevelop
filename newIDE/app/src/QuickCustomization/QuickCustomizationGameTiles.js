// @flow
import * as React from 'react';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { ExampleTile } from '../AssetStore/ShopTiles';
import { GridList } from '@material-ui/core';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';

type Props = {|
  onSelectExampleShortHeader: (
    exampleShortHeader: ExampleShortHeader
  ) => Promise<void>,
  maxCount: number,
|};

const styles = {
  grid: {
    margin: 0,
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
  cellSpacing: 2,
};

const featuredExampleSlugs = [
  '3d-car-coin-hunt',
  'tappy-plane',
  'plinko',
  'multiplayer-jump-game',
  '3d-lane-runner',
  'run-dino-run',
];

export const QuickCustomizationGameTiles = ({
  onSelectExampleShortHeader,
  maxCount,
}: Props) => {
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const { windowSize } = useResponsiveWindowSize();

  const displayedExampleShortHeaders = React.useMemo(
    () =>
      exampleShortHeaders
        ? featuredExampleSlugs
            .map(slug => {
              return exampleShortHeaders.find(
                exampleShortHeader => exampleShortHeader.slug === slug
              );
            })
            .filter(Boolean)
        : null,
    [exampleShortHeaders]
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
        : new Array(maxCount)
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
