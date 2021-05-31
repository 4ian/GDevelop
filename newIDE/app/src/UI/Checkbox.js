// @flow
import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

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
    marginRight?: number,
  |},
|};

/**
 * A text field based on Material-UI text field.
 */
export default (props: Props): React.Node => {
  const { onCheck } = props;
  const checkbox = (
    <Checkbox
      disabled={props.disabled}
      checked={props.checked}
      onChange={
        onCheck ? event => onCheck(event, event.target.checked) : undefined
      }
      icon={props.uncheckedIcon}
      checkedIcon={props.checkedIcon}
      color="primary"
      style={props.label ? undefined : props.style}
    />
  );
  return props.label ? (
    <FormControlLabel
      control={checkbox}
      label={props.label}
      style={props.style}
    />
  ) : (
    checkbox
  );
};
