// @flow
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import { makeStyles, createStyles } from '@material-ui/styles';
import { shouldValidate } from '../../../UI/KeyboardShortcuts/InteractionKeys';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';

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
    display: 'flex',
  },
};

// Styles to give the impression of pressing an element.
const useStylesForWidget = (useDefaultDisabledStyle?: boolean) =>
  makeStyles(theme =>
    createStyles({
      root: {
        border: `1px solid ${theme.palette.text.primary}`,
        borderBottom: `6px solid ${theme.palette.text.primary}`,
        transition: 'background-color 100ms ease',
        '&:focus': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:disabled': useDefaultDisabledStyle
          ? {
              opacity: theme.palette.action.disabledOpacity,
              border: `1px solid ${theme.palette.text.secondary}`,
              borderBottom: `6px solid ${theme.palette.text.secondary}`,
            }
          : undefined,
      },
    })
  )();

export const LARGE_WIDGET_SIZE = 320;
export const SMALL_WIDGET_SIZE = 200;

type Props = {|
  children: React.Node,
  onClick: () => void,
  size: 'small' | 'large' | 'banner',
  disabled?: boolean,
  useDefaultDisabledStyle?: boolean,
|};

export const CardWidget = ({
  children,
  onClick,
  size,
  disabled,
  useDefaultDisabledStyle,
}: Props) => {
  const classes = useStylesForWidget(useDefaultDisabledStyle);
  const { isMobile } = useResponsiveWindowSize();

  const widgetMaxWidth =
    size === 'banner'
      ? undefined
      : isMobile
      ? undefined
      : size === 'small'
      ? SMALL_WIDGET_SIZE
      : LARGE_WIDGET_SIZE;

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
      disabled={disabled}
    >
      <div style={styles.contentWrapper}>{children}</div>
    </ButtonBase>
  );
};
