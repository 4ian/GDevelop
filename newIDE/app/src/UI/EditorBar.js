import React from 'react';
import AppBar from 'material-ui/AppBar';

export default props => {
  return (
    <AppBar
      style={{
        paddingLeft: 8,
        paddingRight: 8,
        flexShrink: 0,
      }}
      titleStyle={{
        height: 32,
        fontSize: '15px',
        lineHeight: '31px',
      }}
      iconStyleLeft={{
        marginTop: -8,
        marginBottom: -16,
        marginRight: 4,
        marginLeft: -16,
      }}
      iconStyleRight={{
        marginTop: -8,
        marginBottom: -16,
      }}
      {...props}
    />
  );
};
