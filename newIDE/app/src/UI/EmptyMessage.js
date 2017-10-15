import React from 'react';

const styles = {
  messageStyle: {
    opacity: 0.4,
    textAlign: 'center',
    fontSize: '13px',
    textShadow: '1px 1px 0px white',
  },
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
    <span style={{ ...styles.messageStyle, ...props.messageStyle }}>
      {props.children}
    </span>
  </div>
);
