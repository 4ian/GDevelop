// @flow
import * as React from 'react';
import MuiPaper from '@material-ui/core/Paper';
import GDevelopThemeContext from './Theme/ThemeContext';

type Props = {|
  children: React.Node,
  elevation?: number,
  variant?: 'outlined',
  background: 'light' | 'medium' | 'dark',
  style?: Object,
  square?: boolean,
|};

const Paper = ({
  children,
  background,
  elevation,
  variant,
  style,
  square,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backgroundColor =
    background === 'dark'
      ? gdevelopTheme.paper.backgroundColor.dark
      : background === 'medium'
      ? gdevelopTheme.paper.backgroundColor.medium
      : gdevelopTheme.paper.backgroundColor.light;
  return (
    <MuiPaper
      variant={variant}
      elevation={elevation || 0}
      style={{
        backgroundColor,
        ...style,
      }}
      square={!!square}
    >
      {children}
    </MuiPaper>
  );
};

export default Paper;
