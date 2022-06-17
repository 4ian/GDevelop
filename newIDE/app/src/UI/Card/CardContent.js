// @flow
import * as React from 'react';
import { CardContent as MUICardContent, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    padding: 24,
    paddingTop: 8,
  },
});

type Props = {|
  children: React.Node,
|};

const CardContent = (props: Props) => {
  const classes = useStyles();
  return <MUICardContent classes={classes}>{props.children}</MUICardContent>;
};

export default CardContent;
