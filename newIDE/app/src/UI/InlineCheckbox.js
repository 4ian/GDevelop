// @flow
import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import { FormGroup, FormHelperText } from '@material-ui/core';

type Props = {|
  label?: ?React.Node,
  checked: boolean,
  onCheck?: (e: {||}, checked: boolean) => void,
  checkedIcon?: React.Node,
  uncheckedIcon?: React.Node,
  disabled?: boolean,
  tooltipOrHelperText?: React.Node,
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
  tooltipOrHelperText,
}: Props) => {
  const checkbox = (
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
  return label ? (
    <FormGroup>
      <FormControlLabel control={checkbox} label={label} />
      {tooltipOrHelperText && (
        <FormHelperText>{tooltipOrHelperText}</FormHelperText>
      )}
    </FormGroup>
  ) : tooltipOrHelperText && !disabled ? (
    <Tooltip title={tooltipOrHelperText}>{checkbox}</Tooltip>
  ) : (
    checkbox
  );
};
