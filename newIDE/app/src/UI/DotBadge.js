// @flow
import * as React from 'react';
import ClassNameMap from '@material-ui/styles';
import MuiBadge from '@material-ui/core/Badge';

type Props = {|
  children: React.Node,
  invisible?: boolean,
  overlap?: 'circle',
  anchor?: 'topLeft',
  classes?: ClassNameMap,
|};

const DotBadge = ({ anchor, ...otherProps }: Props) => (
  <MuiBadge
    color="primary"
    variant="dot"
    anchorOrigin={
      anchor === 'topLeft'
        ? { horizontal: 'left', vertical: 'top' }
        : { horizontal: 'right', vertical: 'top' }
    }
    {...otherProps}
  />
);

export default DotBadge;
