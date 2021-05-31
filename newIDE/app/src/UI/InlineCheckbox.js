// @flow
import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

type Props = {|
  label?: ?React.Node,
  checked: boolean,
  onCheck?: (e: {||}, checked: boolean) => void,
  checkedIcon?: React.Node,
  uncheckedIcon?: React.Node,
  disabled?: boolean,
|};

/**
 * A checkbox based on Material-UI Checkbox, but that can be displayed
 * without having it taking the full width of its container.
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
    />
  );
  return props.label ? (
    <FormControlLabel control={checkbox} label={props.label} />
  ) : (
    checkbox
  );
};
