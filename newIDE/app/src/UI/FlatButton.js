// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { type ButtonInterface } from './Button';
import { Spacer } from './Grid';

// We support a subset of the props supported by Material-UI v0.x FlatButton
// They should be self descriptive - refer to Material UI docs otherwise.
export type FlatButtonProps = {|
  label: React.Node,
  onClick: ?(ev: any) => void | Promise<void>,
  primary?: boolean,
  disabled?: boolean,
  keyboardFocused?: boolean,
  fullWidth?: boolean,
  leftIcon?: React.Node,
  rightIcon?: React.Node,
  style?: {|
    marginTop?: number,
    marginBottom?: number,
    marginLeft?: number,
    marginRight?: number,
    margin?: number,
    flexShrink?: 0,

    // Allow in special cases to set color and border color
    // (when the button is above a background with a fixed color that
    // does not depend on the theme).
    +color?: string,
    +borderColor?: string,
  |},
  target?: '_blank',
  id?: ?string,
|};

/**
 * A "outlined" button based on Material-UI button.
 */
const FlatButton = React.forwardRef<FlatButtonProps, ButtonInterface>(
  (
    {
      label,
      primary,
      leftIcon,
      rightIcon,
      keyboardFocused,
      disabled,
      id,
      ...otherProps
    }: FlatButtonProps,
    ref
  ) => {
    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    return (
      <Button
        variant="outlined"
        size="small"
        color={primary ? 'secondary' : 'default'}
        autoFocus={keyboardFocused}
        focusRipple={focusRipple}
        disabled={disabled}
        id={id}
        {...otherProps}
        ref={ref}
      >
        {leftIcon}
        {leftIcon && label && <Spacer />}
        {/* span element is required to prevent browser auto translators to crash the app - See https://github.com/4ian/GDevelop/issues/3453 */}
        {label ? <span>{label}</span> : null}
        {rightIcon && label && <Spacer />}
        {rightIcon}
      </Button>
    );
  }
);

export default FlatButton;
