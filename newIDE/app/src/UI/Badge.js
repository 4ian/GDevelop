// @flow
import * as React from 'react';
import MuiBadge from '@material-ui/core/Badge';

type Props = {|
  children: React.Node,
  badgeContent: React.Node,
  color: 'error' | 'primary' | 'secondary' | 'default',
|};

export default function Badge(props: Props): React.Node {
  return <MuiBadge {...props} />;
}
