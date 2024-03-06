// @flow
import * as React from 'react';
import MuiBadge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core/styles';

type Props = {|
  children: React.Node,
  badgeContent?: React.Node,
  color?: 'error' | 'primary' | 'secondary' | 'default',
  variant?: 'dot',
  forcedColor?: string,
  invisible?: boolean,
  overlap?: 'circle',
|};

const Badge = ({ forcedColor, ...otherProps }: Props) => {
  const stylesForBadge = React.useMemo(
    () =>
      forcedColor
        ? makeStyles({
            badge: { backgroundColor: forcedColor },
          })
        : () => {},
    [forcedColor]
  );
  const classes = stylesForBadge();
  return <MuiBadge {...otherProps} classes={classes} />;
};

export default Badge;
