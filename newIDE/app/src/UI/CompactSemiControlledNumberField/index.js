// @flow

import * as React from 'react';
import CompactTextField from '../CompactTextField';
import classes from './CompactSemiControlledNumberField.module.css';

type Props = {|
  id?: string,
  value: number,
  onChange: number => void,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,
  useLeftIconAsNumberControl?: boolean,

  errorText?: React.Node,
|};

const CompactSemiControlledNumberField = ({
  value,
  onChange,
  errorText,
  ...otherProps
}: Props) => {
  const [temporaryValue, setTemporaryValue] = React.useState<number>(value);
  const onBlur = () => {
    onChange(temporaryValue);
  };
  React.useEffect(() => setTemporaryValue(value), [value]);

  return (
    <div className={classes.container}>
      <CompactTextField
        type="number"
        value={temporaryValue}
        onChange={valueAsString => {
          if (!valueAsString) setTemporaryValue(valueAsString);
          else setTemporaryValue(parseInt(valueAsString, 10) || 0);
        }}
        onBlur={onBlur}
        {...otherProps}
      />
      {errorText && <div className={classes.error}>{errorText}</div>}
    </div>
  );
};

export default CompactSemiControlledNumberField;
