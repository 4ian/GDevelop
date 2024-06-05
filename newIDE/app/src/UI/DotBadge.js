// @flow
import * as React from 'react';
import MuiBadge from '@material-ui/core/Badge';
import { createStyles, makeStyles } from '@material-ui/core';

type BadgeColor = 'secondary' | 'primary' | 'error' | 'success' | 'neutral';

const useStyles = (color: BadgeColor) =>
  makeStyles(theme => {
    const dotStyle =
      color === 'success' || color === 'neutral'
        ? {
            dot: {
              backgroundColor:
                color === 'success'
                  ? theme.palette.success.main
                  : theme.palette.text.primary,
            },
          }
        : {};
    return createStyles({
      root: { flexDirection: 'column' },
      anchorOriginTopRightCircle: {
        top: '8%',
        right: '8%',
      },
      ...dotStyle,
    });
  })();

type Props = {|
  children: React.Node,
  invisible?: boolean,
  overlap?: 'circle',
  /**
   * MuiBadge only allows 'secondary' | 'primary' | 'error' | 'default' as color.
   * In order to use 'success' as color, we use undefined for the color, and
   * override the dot style to use the success color.
   * If you need to use another color, you can do the same.
   */
  color?: BadgeColor,
|};

const DotBadge = ({
  children,
  invisible,
  overlap,
  color = 'secondary',
}: Props) => {
  const classes = useStyles(color);
  const colorForBadge =
    color === 'success' || color === 'neutral' ? undefined : color;
  return (
    <MuiBadge
      color={colorForBadge}
      variant="dot"
      classes={classes}
      invisible={invisible}
      overlap={overlap}
      children={children}
    />
  );
};

export default DotBadge;
