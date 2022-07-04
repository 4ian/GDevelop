// @flow
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';

const useLabelStyles = makeStyles({
  root: {
    cursor: 'default',
  },
});

const useFormGroupStyles = makeStyles({
  root: {
    display: 'block',
  },
});

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
const InlineCheckbox = ({
  onCheck,
  disabled,
  checked,
  label,
  uncheckedIcon,
  checkedIcon,
  tooltipOrHelperText,
}: Props) => {
  const labelClasses = useLabelStyles();
  const formGroupClasses = useFormGroupStyles();
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
    <FormGroup classes={formGroupClasses}>
      <FormControlLabel
        control={checkbox}
        label={label}
        classes={labelClasses}
      />
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

export default InlineCheckbox;
