import React from 'react';
import Dialog from 'material-ui/Dialog';

export default props => {
  return (
    <Dialog
      bodyStyle={
        props.noMargin
          ? {
              padding: 0,
            }
          : {}
      }
      {...props}
    />
  );
};
