// @flow
import * as React from 'react';
import { I18n } from "../Utils/i18n";

import Button from '@material-ui/core/Button';
import { Spacer } from './Grid';

// We support a subset of the props supported by Material-UI v0.x FlatButton
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label: React.Node,
  onClick: ?() => void,
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
    const { label, primary, icon, keyboardFocused, className='', ...otherProps } = this.props;

    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    return (
      <I18n>
        {({ i18n }) => (
          <Button
            size="small"
            color={primary ? 'primary' : 'default'}
            autoFocus={keyboardFocused}
            focusRipple={focusRipple}
            className={`${className} ${i18n.css}`.trim()}
            {...otherProps}
          >
            {icon}
            {icon && <Spacer />}
            {label}
          </Button>
        )}
      </I18n>
    )
  }
}
