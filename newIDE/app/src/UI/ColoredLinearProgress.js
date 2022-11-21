// @flow
import * as React from 'react';

import MuiLinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core';
import GDevelopThemeContext from './Theme/ThemeContext';

type Props = {|
  expand?: boolean,
  value?: ?number,
|};

function ColoredLinearProgress(props: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const classes = makeStyles({
    root: {
      height: 10,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: gdevelopTheme.paper.backgroundColor.medium,
    },
    bar: {
      borderRadius: 5,
      backgroundColor:
        props.value === 100
          ? '#16CF89' // Green/50
          : '#FFA929', // Yellow/50,
    },
  })();

  return (
    <MuiLinearProgress
      classes={classes}
      style={{ flex: 1 }}
      variant="determinate"
      value={props.value}
    />
  );
}

export default ColoredLinearProgress;
