// @flow
import * as React from 'react';
import MuiBadge from '@material-ui/core/Badge';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme =>
  createStyles({
    root: { flexDirection: 'column' },
    anchorOriginTopRightCircle: {
      top: '8%',
      right: '8%',
    },
    colorSuccess: {
      backgroundColor: theme.palette.success.main,
    },
  })
);

type Props = {|
  children: React.Node,
  invisible?: boolean,
  overlap?: 'circle',
  color?: 'secondary' | 'primary' | 'error' | 'success',
|};

const DotBadge = ({
  children,
  invisible,
  overlap,
  color = 'secondary',
}: Props) => {
  const classes = useStyles();
  return (
    <MuiBadge
      color={color}
      variant="dot"
      classes={classes}
      invisible={invisible}
      overlap={overlap}
      children={children}
    />
  );
};

export default DotBadge;
