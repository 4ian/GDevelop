// @flow

import * as React from 'react';
import CompactTextField from '../CompactTextField';
import classes from './CompactSemiControlledTextField.module.css';

type Props = {|
  id?: string,
  value: string,
  onChange: string => void,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,

  errorText?: React.Node,
|};

const CompactSemiControlledTextField = ({
  value,
  onChange,
  errorText,
  ...otherProps
}: Props) => {
  const [temporaryValue, setTemporaryValue] = React.useState<string>(
    value.toString()
  );
  const onBlur = () => {
    onChange(temporaryValue);
  };

  return (
    <div className={classes.container}>
      <CompactTextField
        type="text"
        value={temporaryValue}
        onChange={setTemporaryValue}
        onBlur={onBlur}
        {...otherProps}
      />
      {errorText && <div className={classes.error}>{errorText}</div>}
    </div>
  );
};

export default CompactSemiControlledTextField;
