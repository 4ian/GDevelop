import React from 'react';
import { ToolbarSeparator } from 'material-ui/Toolbar';

export default props => {
  return (
    <ToolbarSeparator
      style={{
        marginLeft: 0,
      }}
      {...props}
    />
  );
};
