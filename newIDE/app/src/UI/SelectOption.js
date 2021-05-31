// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

// We support a subset of the props supported by Material-UI v0.x MenuItem
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  value: string | number | boolean,
  primaryText: MessageDescriptor,
  disabled?: boolean,
|};

/**
 * A native select option to be used with `SelectField`.
 */
export default class SelectOption extends React.Component<Props, {||}> {
  render(): React.Node {
    return (
      <I18n>
        {({ i18n }) => (
          <option value={this.props.value} disabled={this.props.disabled}>
            {i18n._(this.props.primaryText)}
          </option>
        )}
      </I18n>
    );
  }
}
