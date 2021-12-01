// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Spacer } from './Grid';

// We support a subset of the props supported by Material-UI v0.x FlatButton
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label: React.Node,
  onClick: ?(ev: any) => void,
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
|};

/**
 * A "flat" button based on Material-UI button.
 */
export default class FlatButton extends React.Component<Props, {||}> {
  render() {
    const { label, primary, icon, keyboardFocused, ...otherProps } = this.props;

    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    return (
      <Button
        size="small"
        color={primary ? 'primary' : 'default'}
        autoFocus={keyboardFocused}
        focusRipple={focusRipple}
        {...otherProps}
      >
        {icon}
        {icon && <Spacer />}
        {label}
      </Button>
    );
  }
}
