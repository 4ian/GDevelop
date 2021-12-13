// @flow
import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';

type Props = {|
  label?: ?React.Node,
  checked: boolean,
  onCheck?: (e: {||}, checked: boolean) => void,
  checkedIcon?: React.Node,
  uncheckedIcon?: React.Node,
  disabled?: boolean,
  tooltip?: React.Node,
|};

/**
 * A checkbox based on Material-UI Checkbox, but that can be displayed
 * without having it taking the full width of its container.
 */
export default ({
  onCheck,
  disabled,
  checked,
  label,
  uncheckedIcon,
  checkedIcon,
  tooltip,
}: Props) => {
  const input = (
    <Checkbox
      disabled={disabled}
      checked={checked}
      onChange={
        onCheck ? event => onCheck(event, event.target.checked) : undefined
      }
      icon={uncheckedIcon}
      checkedIcon={checkedIcon}
      color="primary"
    />
  );
  const checkbox = label ? (
    <FormControlLabel control={input} label={label} />
  ) : (
    input
  );

  return tooltip && !disabled ? (
    <Tooltip title={tooltip}>{checkbox}</Tooltip>
  ) : (
    checkbox
  );
};
