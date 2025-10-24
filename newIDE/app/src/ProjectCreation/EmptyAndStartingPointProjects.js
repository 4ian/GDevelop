// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Add from '../UI/CustomSvgIcons/Add';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line, Spacer } from '../UI/Grid';
import { type GDevelopTheme } from '../UI/Theme';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { ExampleTile } from '../AssetStore/ShopTiles';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import classes from './EmptyAndStartingPointProjects.module.css';
import { getItemsColumns } from './NewProjectSetupDialog';
import FlatButton from '../UI/FlatButton';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';

const ITEMS_SPACING = 5;
const getStyles = (theme: GDevelopTheme) => ({
  grid: {
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
});

type EmptyProjectTileProps = {|
  onSelectEmptyProject: () => void,
  disabled?: boolean,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
|};

// The design of this tile copies the ones in ShopTiles.js
const EmptyProjectTile = ({
  onSelectEmptyProject,
  disabled,
  style,
}: EmptyProjectTileProps) => {
  const { isMobile } = useResponsiveWindowSize();
  return (
    <GridListTile style={style}>
      <div className={classes.container}>
        <div
          className={classes.emptyProject}
          onClick={disabled ? undefined : onSelectEmptyProject}
          tabIndex={0}
          onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
            if (shouldValidate(event) && !disabled) {
              onSelectEmptyProject();
            }
          }}
          id="empty-project-tile"
        >
          <Column alignItems="center" justifyContent="center" expand>
            <Add />
            <Text align="center" noMargin>
              <Trans>Empty project</Trans>
            </Text>
          </Column>
        </div>
        <Column>
          {isMobile && <Spacer />}
          <Line justifyContent="flex-start" noMargin>
            {/* Add a hidden text to match the height of the other tiles on the row */}
            <Text size="body2" hidden noMargin={isMobile}>
              <Trans>Empty project</Trans>
            </Text>
          </Line>
        </Column>
      </div>
    </GridListTile>
  );
};

export const isStartingPointExampleShortHeader = (
  exampleShortHeader: ExampleShortHeader
): boolean => {
  return exampleShortHeader.tags.includes('Starting point');
};

export const isLinkedToStartingPointExampleShortHeader = (
  allExampleShortHeaders: Array<ExampleShortHeader>,
  exampleShortHeader: ExampleShortHeader
): boolean => {
  const startingPoints = allExampleShortHeaders.filter(
    isStartingPointExampleShortHeader
  );
  return startingPoints.some(startingPoint =>
    startingPoint.linkedExampleShortHeaders
      ? startingPoint.linkedExampleShortHeaders.some(
          linkedExampleShortHeader =>
            linkedExampleShortHeader.slug === exampleShortHeader.slug
        )
      : false
  );
};

type Props = {|
  onSelectEmptyProject: () => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  disabled?: boolean,
  onSeeAll?: () => void,
|};

const EmptyAndStartingPointProjects = ({
  onSelectExampleShortHeader,
  onSelectEmptyProject,
  disabled,
  onSeeAll,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const styles = getStyles(gdevelopTheme);
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  const columnsCount = getItemsColumns(windowSize, isLandscape);

  const startingPointExampleShortHeaders = React.useMemo(
    () => {
      const allStarterShortHeaders = exampleShortHeaders
        ? exampleShortHeaders.filter(isStartingPointExampleShortHeader)
        : [];

      if (onSeeAll) {
        // only return 2 rows of items.
        const maxItemsToShow = columnsCount * 2 - 1; // -1 for the empty project tile
        return allStarterShortHeaders.slice(0, maxItemsToShow);
      }

      return allStarterShortHeaders;
    },
    [exampleShortHeaders, onSeeAll, columnsCount]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin>
          {onSeeAll ? (
            <Line justifyContent="space-between" alignItems="center">
              <Text size="block-title">
                <Trans>Continue with Human Intelligence</Trans>
              </Text>
              <FlatButton
                label={<Trans>See all</Trans>}
                rightIcon={<ArrowRight fontSize="small" />}
                onClick={onSeeAll}
                primary
                disabled={disabled}
              />
            </Line>
          ) : null}
          <GridList
            cols={columnsCount}
            style={styles.grid}
            cellHeight="auto"
            spacing={ITEMS_SPACING * 2}
          >
            <EmptyProjectTile
              onSelectEmptyProject={onSelectEmptyProject}
              disabled={disabled}
            />
            {startingPointExampleShortHeaders.map(exampleShortHeader => (
              <ExampleTile
                exampleShortHeader={exampleShortHeader}
                onSelect={() => onSelectExampleShortHeader(exampleShortHeader)}
                key={exampleShortHeader.name}
                disabled={disabled}
                centerTitle
              />
            ))}
          </GridList>
        </Column>
      )}
    </I18n>
  );
};

export default EmptyAndStartingPointProjects;
