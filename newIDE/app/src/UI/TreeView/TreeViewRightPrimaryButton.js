// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Button from '@material-ui/core/Button';
import { type ButtonInterface } from '../../UI/Button';
import { Spacer } from '../../UI/Grid';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export type TreeViewRightPrimaryButtonProps = {|
  label?: MessageDescriptor,
  disabled?: boolean,
  icon?: React.Node,
  id?: ?string,
  onClick: ?(MouseEvent) => void | Promise<void>,
|};

export const TreeViewRightPrimaryButton = React.forwardRef<
  TreeViewRightPrimaryButtonProps,
  ButtonInterface
>(
  (
    { label, icon, disabled, ...otherProps }: TreeViewRightPrimaryButtonProps,
    ref
  ) => {
    // In theory, focus ripple is only shown after a keyboard interaction
    // (see https://github.com/mui-org/material-ui/issues/12067). However, as
    // it's important to get focus right in the whole app, make the ripple
    // always visible to be sure we're getting focusing right.
    const focusRipple = true;

    return (
      <I18n>
        {({ i18n }) => (
          <Button
            variant="contained"
            size="small"
            disableElevation
            color="primary"
            focusRipple={focusRipple}
            disabled={disabled}
            style={{
              // If no label is specified, reduce the min width so that the button
              // is just around the icon.
              minWidth: !label ? 0 : undefined,
              padding: label ? '2px 8px 2px 2px' : '2px 2px 2px 2px',
              marginRight: label ? 2 : 0,
              flexShrink: 0,
            }}
            {...otherProps}
            ref={ref}
          >
            {icon}
            {!!icon && !!label && <Spacer />}
            {/* span element is required to prevent browser auto translators to crash the app - See https://github.com/4ian/GDevelop/issues/3453 */}
            {label ? <span>{i18n._(label)}</span> : null}
          </Button>
        )}
      </I18n>
    );
  }
);
