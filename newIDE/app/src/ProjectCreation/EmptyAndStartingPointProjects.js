// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
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

const getStyles = (theme: GDevelopTheme) => ({
  grid: {
    margin: 0,
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
  cellSpacing: 2,
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

export const getStartingPointExampleShortHeaderTitle = (
  exampleShortHeader: ExampleShortHeader
): string => {
  return exampleShortHeader.name
    .toLowerCase()
    .replace('starting', '')
    .trim()
    .replace(/^./, str => str.toUpperCase());
};

export const isStartingPointExampleShortHeader = (
  exampleShortHeader: ExampleShortHeader
): boolean => {
  return exampleShortHeader.tags.includes('Starting point');
};

type Props = {|
  onSelectEmptyProject: () => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  disabled?: boolean,
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
|};

const EmptyAndStartingPointProjects = ({
  onSelectExampleShortHeader,
  onSelectEmptyProject,
  disabled,
  storageProvider,
  saveAsLocation,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const styles = getStyles(gdevelopTheme);
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const baseExampleShortHeaders = React.useMemo(
    () => {
      return exampleShortHeaders
        ? exampleShortHeaders.filter(isStartingPointExampleShortHeader)
        : [];
    },
    [exampleShortHeaders]
  );
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  const columnsCount = getItemsColumns(windowSize, isLandscape);

  return (
    <I18n>
      {({ i18n }) => (
        <GridList
          cols={columnsCount}
          style={styles.grid}
          cellHeight="auto"
          spacing={styles.cellSpacing}
        >
          <EmptyProjectTile
            onSelectEmptyProject={onSelectEmptyProject}
            disabled={disabled}
          />
          {baseExampleShortHeaders.map(exampleShortHeader => (
            <ExampleTile
              exampleShortHeader={exampleShortHeader}
              onSelect={() => onSelectExampleShortHeader(exampleShortHeader)}
              key={exampleShortHeader.name}
              disabled={disabled}
              customTitle={getStartingPointExampleShortHeaderTitle(
                exampleShortHeader
              )}
              centerTitle
            />
          ))}
        </GridList>
      )}
    </I18n>
  );
};

export default EmptyAndStartingPointProjects;
