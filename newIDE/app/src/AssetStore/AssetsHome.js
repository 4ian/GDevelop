// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import Text from '../UI/Text';
import { type AssetPacks } from '../Utils/GDevelopServices/Asset';
import {
  GridListTile,
  GridList,
  Paper,
  makeStyles,
  createStyles,
} from '@material-ui/core';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import { Line, Column } from '../UI/Grid';
import ScrollView from '../UI/ScrollView';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ThemeContext from '../UI/Theme/ThemeContext';

const columns = 3;
const columnsForSmallWindow = 2;
const cellSpacing = 2;

const styles = {
  grid: { margin: '0 10px' },
  previewImage: {
    width: '100%',
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    objectFit: 'cover',
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

const useStylesForGridListItem = makeStyles(theme =>
  createStyles({
    root: {
      '&:focus': {
        border: `2px solid ${theme.palette.primary.main}`,
        outline: 'none',
      },
      '&:focus-visible': { outline: 'unset' },
    },
  })
);

type Props = {|
  assetPacks: AssetPacks,
  onPackSelection: string => void,
|};

export const AssetsHome = ({
  assetPacks: { starterPacks },
  onPackSelection,
}: Props) => {
  const classesForGridListItem = useStylesForGridListItem();
  const windowWidth = useResponsiveWindowWidth();
  const gdevelopTheme = React.useContext(ThemeContext);

  return (
    <ScrollView>
      <GridList
        cols={windowWidth === 'small' ? columnsForSmallWindow : columns}
        style={styles.grid}
        cellHeight="auto"
        spacing={cellSpacing}
      >
        {starterPacks.map((pack, index) => (
          <GridListTile
            classes={classesForGridListItem}
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
                backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
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
                  <Text style={styles.packTitle} color="primary" size="body2">
                    <Trans>{pack.assetsCount} Assets</Trans>
                    {pack.userFriendlyPrice
                      ? ' - ' + pack.userFriendlyPrice
                      : null}
                  </Text>
                </Line>
              </Column>
            </Paper>
          </GridListTile>
        ))}
      </GridList>
    </ScrollView>
  );
};
