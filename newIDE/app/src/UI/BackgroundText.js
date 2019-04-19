import * as React from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';
// No i18n in this file

const styles = {
  messageStyle: {
    opacity: 0.4,
    textAlign: 'center',
    fontSize: '13px',
  },
};

type Props = {|
  tooltipText?: string,
  style?: Object,
  children: React.Node,
|};

const BackgroundText = (props: Props) => (
  <ThemeConsumer>
    {muiTheme => (
      <span
        style={{
          ...styles.messageStyle,
          textShadow: `1px 1px 0px ${muiTheme.emptyMessage.shadowColor}`,
          ...props.style,
        }}
        title={props.tooltipText}
      >
        {props.children}
      </span>
    )}
  </ThemeConsumer>
);

export default BackgroundText;
