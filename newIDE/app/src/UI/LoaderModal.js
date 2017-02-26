import React from 'react';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';

export default (props) => {
  return (
    <Dialog
      actions={[]}
      modal={true}
      open={props.show}
      style={{textAlign: 'center'}}
    >
      <CircularProgress
        style={{flex: 1}}
        size={80}
        thickness={5}
      />
    </Dialog>
  );
}
