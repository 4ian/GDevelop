// @flow
import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Cross from './CustomSvgIcons/Cross';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from './Tooltip';
import { DialogTitleBar } from '../UI/Dialog';
import { LineStackLayout } from './Layout';

const appBarHeight = 32;

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

type Props = {|
  icon?: React.Node,
  title: string,
  onClose: () => void,
  id: string,
|};

const DrawerTopBar = (props: Props) => {
  return (
    <>
      <DialogTitleBar backgroundColor="transparent" />
      <AppBar
        position="static"
        style={styles.appBar}
        className="safe-area-aware-top-margin"
        color="primary"
        elevation={0}
      >
        <Toolbar style={styles.toolbar}>
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
