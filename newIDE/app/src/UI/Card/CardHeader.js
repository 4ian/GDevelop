// @flow
import * as React from 'react';
import { CardHeader as MUICardHeader, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    padding: 0,
    flexGrow: 0,
  },
});

type Props = {|
  title: React.Node,
  subheader?: React.Node,
|};

const CardHeader = (props: Props) => {
  const classes = useStyles();
  return (
    <MUICardHeader
      classes={classes}
      title={props.title}
      subheader={props.subheader}
    />
  );
};

export default CardHeader;
