// @flow
import * as React from 'react';
import ThemeConsumer from '../../../UI/Theme/ThemeConsumer';

const styles = {
  scrollContainer: {
    flex: 1,
    display: 'flex',
    overflowY: 'scroll',
  },
};

type Props = {|
  children: React.Node,
|};

const ScrollBackground = ({ children }: Props): React.Node => (
  <ThemeConsumer>
    {muiTheme => (
      <div
        style={{
          ...styles.scrollContainer,
          backgroundColor: muiTheme.palette.canvasColor,
        }}
      >
        {children}
      </div>
    )}
  </ThemeConsumer>
);

export default ScrollBackground;
