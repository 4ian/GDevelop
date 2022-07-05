// @flow
import * as React from 'react';
import { createStyles, makeStyles, Paper } from '@material-ui/core';
import { shouldValidate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  paper: {
    borderRadius: 8,
    cursor: 'default',
    height: '95%', // Take as much space as possible, without hiding the bottom border.
  },
};

// Styles to give the impression of pressing an element.
const useStylesForWidget = makeStyles(theme =>
  createStyles({
    root: {
      border: `1px solid ${theme.palette.text.primary}`,
      borderBottom: `6px solid ${theme.palette.text.primary}`,
      '&:focus': {
        border: `1px solid ${theme.palette.secondary.main}`,
        borderBottom: `6px solid ${theme.palette.secondary.main}`,
      },
      '&:hover': {
        border: `1px solid ${theme.palette.secondary.main}`,
        borderBottom: `6px solid ${theme.palette.secondary.main}`,
      },
    },
  })
);

export const LARGE_WIDGET_SIZE = 275;
export const SMALL_WIDGET_SIZE = 180;

type Props = {|
  children: React.Node,
  onClick: () => void,
  size?: 'small' | 'large',
|};

export const CardWidget = ({ children, onClick, size }: Props) => {
  const classes = useStylesForWidget();
  const windowWidth = useResponsiveWindowWidth();

  const widgetWidth =
    size === 'large' && windowWidth !== 'small'
      ? LARGE_WIDGET_SIZE
      : SMALL_WIDGET_SIZE;

  return (
    <Paper
      elevation={2}
      style={{
        ...styles.paper,
        width: widgetWidth,
      }}
      onClick={onClick}
      classes={classes}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onClick();
        }
      }}
    >
      {children}
    </Paper>
  );
};
