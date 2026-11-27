// @flow
import * as React from 'react';
import Add from '../UI/CustomSvgIcons/Add';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line, Spacer } from '../UI/Grid';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import GridListTile from '@material-ui/core/GridListTile';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import classes from './EmptyProjectTile.module.css';

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
}: EmptyProjectTileProps): React.Node => {
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

export default EmptyProjectTile;
