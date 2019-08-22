// @flow
import * as React from 'react';
import MUICheckbox from 'material-ui/Checkbox';

// We support a subset of the props supported by Material-UI v0.x Checkbox
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  label?: ?React.Node,
  checked: boolean,
  onCheck?: (e: {||}, checked: boolean) => void,
  checkedIcon?: React.Node,
  uncheckedIcon?: React.Node,
  disabled?: boolean,

  style?: {|
    display?: 'inline-block',
    width?: number | 'auto',
    marginRight?: number,
  |},
  labelStyle?: {|
    width?: 'auto',
    whiteSpace?: 'nowrap',
  |},
|};

/**
 * A text field based on Material-UI text field.
 */
export default class Checkbox extends React.Component<Props, {||}> {
  render() {
    return <MUICheckbox {...this.props} />;
  }
}
