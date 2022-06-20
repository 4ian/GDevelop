// @flow
import * as React from 'react';
import MUICardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { marginsSize } from '../Grid';

const useStyles = makeStyles({
  root: {
    padding: marginsSize * 4,
    paddingTop: marginsSize,
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
