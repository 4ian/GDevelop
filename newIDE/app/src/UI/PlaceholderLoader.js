import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const styles = {
  containerStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 10,
  },
};

export default props => (
  <div style={{ ...styles.containerStyle, ...props.style }}>
    <CircularProgress size={40} />
  </div>
);
