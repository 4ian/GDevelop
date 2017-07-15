import React from 'react';
import Dialog from 'material-ui/Dialog';

const styles = {
  defaultBody: {
    overflowX: 'hidden',
  },
  noMarginBody: {
    padding: 0,
    overflowX: 'hidden',
  },
};

export default props => {
  return (
    <Dialog
      bodyStyle={props.noMargin ? styles.noMarginBody : styles.defaultBody}
      {...props}
    />
  );
};
