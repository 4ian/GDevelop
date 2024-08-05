// @flow
import * as React from 'react';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { ExampleTile } from '../AssetStore/ShopTiles';
import { GridList } from '@material-ui/core';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';

type Props = {|
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
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

export const QuickCustomizationGameTiles = ({
  onSelectExampleShortHeader,
  maxCount,
}: Props) => {
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);

  return (
    <GridList
      cols={3}
      style={styles.grid}
      cellHeight="auto"
      spacing={styles.cellSpacing}
    >
      {exampleShortHeaders // TODO: display skeletons using "maxCount"
        ? exampleShortHeaders // TODO: read order from backend
            .slice(0, maxCount)
            .map(exampleShortHeader => (
              <ExampleTile
                exampleShortHeader={exampleShortHeader}
                onSelect={() => onSelectExampleShortHeader(exampleShortHeader)}
                key={exampleShortHeader.name}
              />
            ))
        : null}
    </GridList>
  );
};
