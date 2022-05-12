// @flow
import * as React from 'react';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import Text from '../UI/Text';
import { type AssetPacks } from '../Utils/GDevelopServices/Asset';
import { GridListTile, GridList, Paper } from '@material-ui/core';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import { Line, Column } from '../UI/Grid';
import ScrollView from '../UI/ScrollView';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';

const columns = 3;
const cellSpacing = 2;

const styles = {
  grid: { marginLeft: 10, marginRight: 10 },
  previewImage: {
    width: '100%',
  },
  cardContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  paper: {
    margin: 4,
  },
  packTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
};

type Props = {|
  assetPacks: AssetPacks,
  onPackSelection: string => void,
|};

export const AssetsHome = ({
  assetPacks: { starterPacks },
  onPackSelection,
}: Props) => {
  return (
    <ThemeConsumer>
      {muiTheme => (
        <ScrollView>
          <GridList
            cols={columns}
            style={styles.grid}
            cellHeight="auto"
            spacing={cellSpacing}
          >
            {starterPacks.map((pack, index) => (
              <GridListTile
                key={pack.tag}
                tabIndex={0}
                onKeyPress={(
                  event: SyntheticKeyboardEvent<HTMLLIElement>
                ): void => {
                  if (shouldValidate(event)) {
                    onPackSelection(pack.tag);
                  }
                }}
                onClick={() => onPackSelection(pack.tag)}
              >
                <Paper
                  elevation={2}
                  style={{
                    ...styles.paper,
                    backgroundColor: muiTheme.list.itemsBackgroundColor,
                  }}
                >
                  <CorsAwareImage
                    key={pack.name}
                    style={styles.previewImage}
                    src={pack.thumbnailUrl}
                    alt={pack.name}
                  />
                  <Column>
                    <Line justifyContent="space-between" noMargin>
                      <Text style={styles.packTitle} size="body2">
                        {pack.name}
                      </Text>
                      <Text
                        style={styles.packTitle}
                        color="primary"
                        size="body2"
                      >
                        {pack.assetsCount} Assets
                      </Text>
                    </Line>
                  </Column>
                </Paper>
              </GridListTile>
            ))}
          </GridList>
        </ScrollView>
      )}
    </ThemeConsumer>
  );
};
