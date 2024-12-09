// @flow
import * as React from 'react';

import MuiLinearProgress from '@material-ui/core/LinearProgress';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import type { GDevelopTheme } from './Theme';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = (color?: 'success', gdevelopTheme: GDevelopTheme) =>
  makeStyles({
    barColorSecondary: {
      backgroundColor: gdevelopTheme.statusIndicator.success,
    },
  })();

type Props = {|
  variant?: 'indeterminate' | 'determinate',
  color?: 'success',
  value?: ?number,
  style?: {| height?: number, borderRadius?: number, width?: number |},
|};

function LinearProgress(props: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const classes = useStyles(props.color, gdevelopTheme);

  return (
    <MuiLinearProgress
      classes={classes}
      color="secondary"
      style={{ flex: 1, ...props.style }}
      variant={props.variant}
      value={props.value}
    />
  );
}

export default LinearProgress;
