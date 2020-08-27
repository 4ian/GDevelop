// @flow
import * as React from 'react';
import { I18n } from "../Utils/i18n";

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

// We support a subset of the props supported by Material-UI v0.x Toggle
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label?: ?React.Node,
  toggled: boolean,
  onToggle: (e: {||}, toggled: boolean) => void,
  disabled?: boolean,
  labelPosition: 'right',

  style?: {|
    marginTop?: number,
  |},
|};

/**
 * A text field based on Material-UI text field.
 */
export default class Toggle extends React.Component<Props, {||}> {
  render() {
    const { className='' } = this.props;
    
    return (
      <I18n>
        {({ i18n }) => (
          <FormControlLabel
            control={
              <Switch
                checked={this.props.toggled}
                onChange={event => this.props.onToggle(event, event.target.checked)}
                color="primary"
              />
            }
            label={this.props.label}
            disabled={this.props.disabled}
            style={this.props.style}
            className={`${className} ${i18n.css}`.trim()}
          />
        )}
      </I18n>
    );
  }
}
