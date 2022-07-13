import React from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import CircularProgress from './CircularProgress';

const loaderSize = 50;

const styles = {
  dialogContent: {
    padding: 10,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
  },
};

const transitionDuration = { enter: 0, exit: 150 };

const LoaderModal = props => {
  return (
    <Dialog open={props.show} transitionDuration={transitionDuration}>
      <DialogContent style={styles.dialogContent}>
        <CircularProgress
          style={styles.circularProgress}
          size={loaderSize}
          disableShrink
        />
      </DialogContent>
    </Dialog>
  );
};

export default LoaderModal;
