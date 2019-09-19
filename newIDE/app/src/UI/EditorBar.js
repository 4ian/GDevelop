// @flow
import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';

export const editorBarHeight = 32;

type Props = {|
  title: React.Node,
  displayLeftCloseButton?: boolean,
  displayRightCloseButton?: boolean,
  onClose: () => void,
|};

const styles = {
  appBar: {
    height: editorBarHeight,
    minHeight: editorBarHeight,
  },
  toolbar: {
    height: editorBarHeight,
    minHeight: editorBarHeight,
    paddingLeft: 15,
    paddingRight: 15,
  },
  title: { fontSize: '15px', flexGrow: 1 },
};

export default (props: Props) => {
  return (
    <AppBar position="static" style={styles.appBar} color="primary">
      <Toolbar style={styles.toolbar}>
        {props.displayLeftCloseButton && (
          <IconButton onClick={props.onClose} edge="start" color="inherit">
            <Close />
          </IconButton>
        )}
        <Typography variant="h6" style={styles.title}>
          {props.title}
        </Typography>

        {props.displayRightCloseButton && (
          <IconButton onClick={props.onClose} edge="end" color="inherit">
            <Close />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};
