import React from 'react';
import CircularProgress from './CircularProgress';

const styles = {
  containerStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 10,
  },
};

const PlaceholderLoader = props => (
  <div style={{ ...styles.containerStyle, ...props.style }}>
    <CircularProgress size={40} />
  </div>
);

export default PlaceholderLoader;
