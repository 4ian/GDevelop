// @flow
import * as React from 'react';
import MuiBadge from '@material-ui/core/Badge';

type Props = {|
  children: React.Node,
  badgeContent?: React.Node,
  color: 'error' | 'primary' | 'secondary' | 'default',
  variant?: 'dot',
  invisible?: boolean,
  overlap?: 'circle',
|};

const Badge = (props: Props) => <MuiBadge {...props} />;

export default Badge;
