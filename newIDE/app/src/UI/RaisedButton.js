// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
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
  |},
  labelPosition?: 'before',
|};

type Props = {
  ...RaisedButtonPropsWithoutOnClick,
  onClick: ?() => void,
};

/**
 * A raised button based on Material-UI button.
 */
export default class RaisedButton extends React.Component<Props, {||}> {
  render() {
    const { label, primary, labelPosition, icon, ...otherProps } = this.props;

    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    return (
      <Button
        variant="contained"
        size="small"
        color={primary ? 'primary' : 'default'}
        focusRipple={focusRipple}
        {...otherProps}
      >
        {labelPosition !== 'before' && icon}
        {labelPosition !== 'before' && icon && <Spacer />}
        {label}
        {labelPosition === 'before' && icon && <Spacer />}
        {labelPosition === 'before' && icon}
      </Button>
    );
  }
}
