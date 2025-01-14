// @flow
import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Cross from './CustomSvgIcons/Cross';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from './Tooltip';
import { LineStackLayout } from './Layout';
import { TitleBarLeftSafeMargins } from './TitleBarSafeMargins';

const appBarHeight = 38;

const styles = {
  appBar: {
    height: appBarHeight,
    minHeight: appBarHeight,
  },
  toolbar: {
    height: appBarHeight,
    minHeight: appBarHeight,
    paddingLeft: 8,
    paddingRight: 8,
    // Ensure this part can be interacted with on macOS, when used as PWA.
    // Otherwise, the buttons are not clickable.
    WebkitAppRegion: 'no-drag',
  },
  title: {
    fontSize: '15px',
    flexGrow: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
};

type Props = {|
  icon?: React.Node,
  title: string,
  onClose: () => void,
  id: string,
|};

const DrawerTopBar = (props: Props) => {
  return (
    <>
      <AppBar
        position="static"
        style={styles.appBar}
        className="safe-area-aware-top-margin"
        color="primary"
        elevation={0}
      >
        <Toolbar style={styles.toolbar}>
          <TitleBarLeftSafeMargins />
          <LineStackLayout noMargin expand alignItems="center">
            {props.icon && (
              <IconButton
                onClick={props.onClose}
                edge="start"
                color="inherit"
                size="small"
                id={`${props.id}-icon`}
              >
                {props.icon}
              </IconButton>
            )}
            {props.title.length > 30 ? (
              <Tooltip
                title={props.title}
                placement="bottom"
                enterDelay={tooltipEnterDelay}
              >
                <Typography variant="h6" style={styles.title}>
                  {props.title}
                </Typography>
              </Tooltip>
            ) : (
              <Typography variant="h6" style={styles.title}>
                {props.title}
              </Typography>
            )}
          </LineStackLayout>
          <IconButton
            onClick={props.onClose}
            edge="end"
            color="inherit"
            size="small"
            id={`${props.id}-close`}
          >
            <Cross />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default DrawerTopBar;
