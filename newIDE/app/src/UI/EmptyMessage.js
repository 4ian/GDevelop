import * as React from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';

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

type Props = {|
  style?: Object,
  messageStyle?: Object,
  children: React.Node,
|};

const EmptyMessage = (props: Props) => (
  <ThemeConsumer>
    {muiTheme => (
      <div style={{ ...styles.containerStyle, ...props.style }}>
        <span
          style={{
            ...styles.messageStyle,
            textShadow: `1px 1px 0px ${muiTheme.emptyMessage
              .shadowColor}`,
            ...props.messageStyle,
          }}
        >
          {props.children}
        </span>
      </div>
    )}
  </ThemeConsumer>
);

export default EmptyMessage;
