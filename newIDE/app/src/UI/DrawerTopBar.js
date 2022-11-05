// @flow
import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';
import Tooltip from '@material-ui/core/Tooltip';

import { tooltipEnterDelay } from './Tooltip';

const appBarHeight = 32;

type Props = {|
  title: React.Node,
  displayRightCloseButton?: boolean,
  onClose: () => void,
|};

const styles = {
  appBar: {
    height: appBarHeight,
    minHeight: appBarHeight,
  },
  toolbar: {
    height: appBarHeight,
    minHeight: appBarHeight,
    paddingLeft: 15,
    paddingRight: 15,
  },
  title: {
    fontSize: '15px',
    flexGrow: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
};

const DrawerTopBar = (props: Props) => {
  return (
    <AppBar
      position="static"
      style={styles.appBar}
      className="safe-area-aware-top-margin"
      color="primary"
      elevation={0}
    >
      <Toolbar style={styles.toolbar}>
        <Tooltip
          title={props.title}
          placement="bottom"
          enterDelay={tooltipEnterDelay}
        >
          <Typography variant="h6" style={styles.title}>
            {props.title}
          </Typography>
        </Tooltip>

        {props.displayRightCloseButton && (
          <IconButton
            onClick={props.onClose}
            edge="end"
            color="inherit"
            size="small"
          >
            <Close />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default DrawerTopBar;
