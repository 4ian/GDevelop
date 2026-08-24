// @flow
import * as React from 'react';

import MuiLinearProgress from '@material-ui/core/LinearProgress';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import type { GDevelopTheme } from './Theme';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = (
  color?: 'success',
  barColor?: string,
  trackColor?: string,
  gdevelopTheme: GDevelopTheme
) =>
  makeStyles({
    colorSecondary: {
      backgroundColor: trackColor || gdevelopTheme.paper.backgroundColor.light,
    },
    barColorSecondary: {
      backgroundColor:
        barColor ||
        (color === 'success'
          ? gdevelopTheme.statusIndicator.success
          : gdevelopTheme.palette.secondary),
    },
  })();

type Props = {|
  variant?: 'indeterminate' | 'determinate',
  color?: 'success',
  barColor?: string,
  trackColor?: string,
  value?: ?number,
  style?: {| height?: number, borderRadius?: number, width?: number |},
|};

function LinearProgress(props: Props): React.Node {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const classes = useStyles(
    props.color,
    props.barColor,
    props.trackColor,
    gdevelopTheme
  );

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
