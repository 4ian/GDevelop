// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { type ButtonInterface } from './Button';
import { Spacer } from './Grid';
import GDevelopThemeContext from './Theme/ThemeContext';

// We support a subset of the props supported by Material-UI v0.x FlatButton
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label: React.Node,
  onClick: ?(ev: any) => void | Promise<void>,
  primary?: boolean,
  disabled?: boolean,
  keyboardFocused?: boolean,
  fullWidth?: boolean,
  icon?: React.Node,
  style?: {|
    marginTop?: number,
    marginBottom?: number,
    marginLeft?: number,
    marginRight?: number,
    margin?: number,
    flexShrink?: 0,
  |},
  target?: '_blank',
  id?: ?string,
|};

/**
 * A "outlined" button based on Material-UI button.
 */
const FlatButton = React.forwardRef<Props, ButtonInterface>(
  (
    {
      label,
      primary,
      icon,
      keyboardFocused,
      disabled,
      id,
      ...otherProps
    }: Props,
    ref
  ) => {
    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    return (
      <Button
        variant={gdevelopTheme.isModern ? 'outlined' : 'text'}
        size="small"
        color={primary ? 'primary' : 'default'}
        autoFocus={keyboardFocused}
        focusRipple={focusRipple}
        disabled={disabled}
        id={id}
        {...otherProps}
        ref={ref}
      >
        {icon}
        {icon && <Spacer />}
        {label}
      </Button>
    );
  }
);

export default FlatButton;
