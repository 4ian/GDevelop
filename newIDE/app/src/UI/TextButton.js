// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Spacer } from './Grid';
import { Tooltip } from '@material-ui/core';
import { tooltipEnterDelay } from './Tooltip';
import { type ButtonInterface } from './Button';

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
  // Tooltips aren't really suited for TextButtons UX-wise, but we can use them for
  // accessibility purpose for the Toolbar.
  exceptionalTooltipForToolbar?: React.Node,
|};

/**
 * A "text" button based on Material-UI button.
 */
const TextButton = React.forwardRef<Props, ButtonInterface>(
  (
    {
      label,
      primary,
      icon,
      keyboardFocused,
      exceptionalTooltipForToolbar,
      disabled,
      id,
      ...otherProps
    },
    ref
  ) => {
    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    const button = (
      <Button
        variant="text"
        size="small"
        color={primary ? 'secondary' : 'default'}
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

    return exceptionalTooltipForToolbar && !disabled ? (
      <Tooltip
        title={exceptionalTooltipForToolbar}
        placement="bottom"
        enterDelay={tooltipEnterDelay}
      >
        {button}
      </Tooltip>
    ) : (
      button
    );
  }
);

export default TextButton;
