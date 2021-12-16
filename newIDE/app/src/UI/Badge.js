// @flow
import * as React from 'react';
import ClassNameMap from '@material-ui/styles';
import MuiBadge from '@material-ui/core/Badge';

type Props = {|
  children: React.Node,
  badgeContent?: React.Node,
  invisible?: boolean,
  color: 'error' | 'primary' | 'secondary' | 'default',
  variant?: 'dot',
  overlap?: 'circle',
  anchor?: 'topLeft',
  classes?: ClassNameMap,
|};

const Badge = ({ anchor, ...otherProps }: Props) => (
  <MuiBadge
    anchorOrigin={
      anchor === 'topLeft'
        ? { horizontal: 'left', vertical: 'top' }
        : { horizontal: 'right', vertical: 'top' }
    }
    {...otherProps}
  />
);

export default Badge;
