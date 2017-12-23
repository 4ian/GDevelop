import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const styles = {
  messageStyle: {
    opacity: 0.4,
    textAlign: 'center',
    fontSize: '13px',
  },
  containerStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 10,
  },
};

const ThemableEmptyMessage = props => (
  <div style={{ ...styles.containerStyle, ...props.style }}>
    <span
      style={{
        ...styles.messageStyle,
        textShadow: `1px 1px 0px ${props.muiTheme.emptyMessage.shadowColor}`,
        ...props.messageStyle,
      }}
    >
      {props.children}
    </span>
  </div>
);

const EmptyMessage = muiThemeable()(ThemableEmptyMessage);

export default EmptyMessage;
