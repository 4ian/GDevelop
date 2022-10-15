// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { type ButtonInterface } from './Button';
import { Spacer } from './Grid';

// We support a subset of the props supported by Material-UI v0.x RaisedButton
// They should be self descriptive - refer to Material UI docs otherwise.
export type RaisedButtonPropsWithoutOnClick = {|
  label?: React.Node,
  primary?: boolean,
  disabled?: boolean,
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
  id?: string,
|};

type Props = {|
  ...RaisedButtonPropsWithoutOnClick,
  onClick: ?() => void | Promise<void>,
|};

/**
 * A raised button based on Material-UI button.
 */
const RaisedButton = React.forwardRef<Props, ButtonInterface>(
  ({ label, primary, icon, ...otherProps }: Props, ref) => {
    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    return (
      <Button
        variant="contained"
        size="small"
        disableElevation
        color={primary ? 'primary' : 'default'}
        focusRipple={focusRipple}
        {...otherProps}
        ref={ref}
      >
        {icon}
        {!!icon && !!label && <Spacer />}
        {label}
      </Button>
    );
  }
);

export default RaisedButton;
