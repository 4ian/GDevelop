// @flow
import * as React from 'react';
import MUICardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';

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
