// @flow
import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
// No i18n in this file

type Props = {|
  tooltipText?: string,
  style?: Object,
  children: ?React.Node,
  allowSelection?: boolean,
  align?: 'center' | 'left' | 'right',
|};

const BackgroundText = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Typography
      variant="body2"
      align={props.align || 'center'}
      component="div"
      style={{
        opacity: 0.6,
        textShadow: `1px 1px 0px ${gdevelopTheme.emptyMessage.shadowColor}`,
        userSelect: props.allowSelection ? 'text' : undefined,
        cursor: props.allowSelection ? 'text' : undefined,
        ...props.style,
      }}
      title={props.tooltipText}
    >
      {props.children}
    </Typography>
  );
};

export default BackgroundText;
