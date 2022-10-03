// @flow
import * as React from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';
import Typography from '@material-ui/core/Typography';
// No i18n in this file

type Props = {|
  tooltipText?: string,
  style?: Object,
  children: ?React.Node,
|};

const BackgroundText = (props: Props) => (
  <ThemeConsumer>
    {muiTheme => (
      <Typography
        variant="body2"
        align="center"
        component="div"
        style={{
          opacity: 0.6,
          textShadow: `1px 1px 0px ${muiTheme.emptyMessage.shadowColor}`,
          ...props.style,
        }}
        title={props.tooltipText}
      >
        {props.children}
      </Typography>
    )}
  </ThemeConsumer>
);

export default BackgroundText;
