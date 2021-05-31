// @flow
import * as React from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';
import BackgroundText from './BackgroundText';
// No i18n in this file

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
  style?: Object,
  messageStyle?: Object,
  children: ?React.Node,
|};

const EmptyMessage = (props: Props): React.Node => (
  <ThemeConsumer>
    {muiTheme => (
      <div style={{ ...styles.containerStyle, ...props.style }}>
        <BackgroundText style={props.messageStyle}>
          {props.children}
        </BackgroundText>
      </div>
    )}
  </ThemeConsumer>
);

export default EmptyMessage;
