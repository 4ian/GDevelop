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

const useSmallPaddingCheckboxStyles = makeStyles({
  root: {
    padding: 3,
  },
});

type Props = {|
  id?: string,
  label?: ?React.Node,
  checked: boolean,
  onCheck?: (e: {||}, checked: boolean) => void | Promise<void>,
  checkedIcon?: React.Node,
  uncheckedIcon?: React.Node,
  disabled?: boolean,
  paddingSize?: 'small',
  tooltipOrHelperText?: React.Node,
|};

/**
 * A checkbox based on Material-UI Checkbox, but that can be displayed
 * without having it taking the full width of its container.
 */
const InlineCheckbox = ({
  id,
  onCheck,
  disabled,
  checked,
  label,
  uncheckedIcon,
  checkedIcon,
  tooltipOrHelperText,
  paddingSize,
}: Props) => {
  const labelClasses = useLabelStyles();
  const formGroupClasses = useFormGroupStyles();
  const smallPaddingClasses = useSmallPaddingCheckboxStyles();
  const checkbox = (
    <Checkbox
      id={id}
      disabled={disabled}
      checked={checked}
      onChange={
        onCheck ? event => onCheck(event, event.target.checked) : undefined
      }
      classes={paddingSize === 'small' ? smallPaddingClasses : null}
      icon={uncheckedIcon}
      checkedIcon={checkedIcon}
      color="secondary"
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
