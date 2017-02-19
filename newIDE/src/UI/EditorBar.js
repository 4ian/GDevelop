import React from 'react';
import AppBar from 'material-ui/AppBar';

export default (props) => {
  return (
    <AppBar
      style={{
        paddingLeft: 16,
        paddingRight: 16,
      }}
      titleStyle={{
        height: 48,
        fontSize: '20px',
        lineHeight: '55px',
      }}
      iconStyleLeft={{
        marginTop: 3,
        marginRight: 4,
        marginLeft: -16,
      }}
      iconStyleRight={{
        marginTop: 3,
      }}
      {...props}
    />
  );
}
