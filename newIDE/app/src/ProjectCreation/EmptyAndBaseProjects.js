// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
import Add from '../UI/CustomSvgIcons/Add';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../UI/Grid';
import { type GDevelopTheme } from '../UI/Theme';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { ExampleTile } from '../AssetStore/ShopTiles';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { GridList, GridListTile } from '@material-ui/core';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import classes from './EmptyAndBaseProjects.module.css';
import classNames from 'classnames';
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

const EmptyProjectTile = ({
  onSelectEmptyProject,
  disabled,
  style,
}: EmptyProjectTileProps) => {
  return (
    <GridListTile style={style}>
      <div
        className={classNames({
          [classes.container]: true,
        })}
      >
        <div
          className={classNames({
            [classes.emptyProject]: true,
          })}
          // onClick on the div instead of the tile, to avoid being able to click outside the button.
          onClick={disabled ? undefined : onSelectEmptyProject}
          tabIndex={0}
          onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
            if (shouldValidate(event) && !disabled) {
              onSelectEmptyProject();
            }
          }}
        >
          <Column alignItems="center" justifyContent="center" expand>
            <Add />
            <Text align="center" noMargin>
              <Trans>Empty project</Trans>
            </Text>
          </Column>
        </div>
        <Column>
          <Line justifyContent="flex-start" noMargin>
            <Text size="body2">&nbsp;</Text>
          </Line>
        </Column>
      </div>
    </GridListTile>
  );
};

type Props = {|
  onSelectEmptyProject: () => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  disabled?: boolean,
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
|};

const EmptyAndBaseProjects = ({
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
      // todo proper filter on base tag
      return exampleShortHeaders ? exampleShortHeaders.slice(0, 3) : [];
    },
    [exampleShortHeaders]
  );
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  // To avoid layout shift while the items are loading.
  const columnsCount = baseExampleShortHeaders
    ? getItemsColumns(windowSize, isLandscape)
    : 1;

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
            />
          ))}
        </GridList>
      )}
    </I18n>
  );
};

export default EmptyAndBaseProjects;
