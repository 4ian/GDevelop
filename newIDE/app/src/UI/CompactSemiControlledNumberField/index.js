// @flow

import * as React from 'react';
import CompactTextField from '../CompactTextField';
import classes from './CompactSemiControlledNumberField.module.css';

type Props = {|
  id?: string,
  value: number,
  onChange: number => void,
  commitOnBlur?: boolean,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,
  useLeftIconAsNumberControl?: boolean,
  renderEndAdornmentOnHover?: (className: string) => React.Node,
  onClickEndAdornment?: () => void,

  errorText?: React.Node,
|};

const CompactSemiControlledNumberField = ({
  value,
  onChange,
  errorText,
  commitOnBlur,
  ...otherProps
}: Props) => {
  const [focused, setFocused] = React.useState<boolean>(false);
  const [temporaryValue, setTemporaryValue] = React.useState<?number>(null);

  return (
    <div className={classes.container}>
      <CompactTextField
        type="number"
        value={focused ? temporaryValue : value}
        onChange={(valueAsString, reason) => {
          const newValue = parseFloat(valueAsString);
          const isNewValueValid = !Number.isNaN(newValue);
          if (isNewValueValid) {
            setTemporaryValue(newValue);
            if (reason === 'keyInput') {
              if (!commitOnBlur) onChange(newValue);
            } else {
              onChange(newValue);
            }
          } else {
            setTemporaryValue(null);
          }
        }}
        onFocus={event => {
          setFocused(true);
          setTemporaryValue(value);
        }}
        onBlur={event => {
          const newValue = parseFloat(event.currentTarget.value);
          const isNewValueValid = !Number.isNaN(newValue);
          if (isNewValueValid) {
            onChange(newValue);
          }
          setFocused(false);
          setTemporaryValue(null);
        }}
        {...otherProps}
      />
      {errorText && <div className={classes.error}>{errorText}</div>}
    </div>
  );
};

export default CompactSemiControlledNumberField;
