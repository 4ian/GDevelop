// @flow
import * as React from 'react';
import MUIToggle from 'material-ui/Toggle';

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
    return <MUIToggle {...this.props} />;
  }
}
