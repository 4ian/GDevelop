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

type Props = {|
  style?: any,
  size?: number,
|};

const PlaceholderLoader = (props: Props) => (
  <div style={{ ...styles.containerStyle, ...props.style }}>
    <CircularProgress size={props.size || 40} />
  </div>
);

export default PlaceholderLoader;
