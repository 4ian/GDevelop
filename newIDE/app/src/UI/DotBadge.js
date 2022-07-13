// @flow
import * as React from 'react';
import ClassNameMap from '@material-ui/styles';
import MuiBadge from '@material-ui/core/Badge';

type Props = {|
  children: React.Node,
  invisible?: boolean,
  overlap?: 'circle',
  classes?: ClassNameMap,
|};

const DotBadge = (props: Props) => (
  <MuiBadge color="secondary" variant="dot" {...props} />
);

export default DotBadge;
