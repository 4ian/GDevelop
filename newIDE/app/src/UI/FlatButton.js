// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { type ButtonInterface } from './Button';
import { Spacer } from './Grid';
import classes from './FlatButton.module.css';
import classNames from 'classnames';

// We support a subset of the props supported by Material-UI v0.x FlatButton
// They should be self descriptive - refer to Material UI docs otherwise.
export type FlatButtonProps = {|
  label: React.Node,
  onClick: ?(ev: any) => void | Promise<void>,
  primary?: boolean,
  color?: 'primary' | 'success' | 'danger' | 'premium' | 'ai',
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
  |},
  noBackground?: boolean,
  size?: 'medium' | 'large',
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
      color,
      leftIcon,
      rightIcon,
      keyboardFocused,
      disabled,
      size,
      id,
      style,
      noBackground,
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
      <div
        className={classNames({
          [classes.buttonContainer]: true,
          [classes.backgroundButtonContainer]: !noBackground,
          [classes.fullWidthButtonContainer]: !!otherProps.fullWidth,
          [classes.coloredButtonContainer]: !!color,
          [classes.buttonContainerSuccess]: color === 'success',
          [classes.buttonContainerDanger]: color === 'danger',
          [classes.buttonContainerPremium]: color === 'premium',
          [classes.buttonContainerAi]: color === 'ai',
        })}
        style={style}
      >
        <Button
          variant="outlined"
          size={size || 'small'}
          color={primary || color === 'primary' ? 'secondary' : 'default'}
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
      </div>
    );
  }
);

export default FlatButton;
