// @flow
import * as React from 'react';
import { ButtonBase, createStyles, makeStyles } from '@material-ui/core';
import { shouldValidate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  buttonBase: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
    cursor: 'default',
    overflow: 'hidden',
  },
  contentWrapper: {
    height: '100%',
    width: '100%',
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

export const LARGE_WIDGET_SIZE = 320;
export const SMALL_WIDGET_SIZE = 200;

type Props = {|
  children: React.Node,
  onClick: () => void,
  size: 'small' | 'large',
|};

export const CardWidget = ({ children, onClick, size }: Props) => {
  const classes = useStylesForWidget();
  const windowWidth = useResponsiveWindowWidth();

  const widgetMaxWidth =
    size === 'small'
      ? SMALL_WIDGET_SIZE
      : windowWidth !== 'small'
      ? LARGE_WIDGET_SIZE
      : undefined;

  return (
    <ButtonBase
      onClick={onClick}
      focusRipple
      elevation={2}
      style={{
        ...styles.buttonBase,
        maxWidth: widgetMaxWidth,
      }}
      classes={classes}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onClick();
        }
      }}
    >
      <div style={styles.contentWrapper}>{children}</div>
    </ButtonBase>
  );
};
