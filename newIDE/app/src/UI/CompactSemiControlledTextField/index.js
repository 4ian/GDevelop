// @flow

import * as React from 'react';
import CompactTextField from '../CompactTextField';
import classes from './CompactSemiControlledTextField.module.css';

type Props = {|
  id?: string,
  value: string,
  onChange: string => void,
  commitOnBlur?: boolean,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,
  renderEndAdornmentOnHover?: (className: string) => React.Node,
  onClickEndAdornment?: () => void,

  errorText?: React.Node,
|};

const CompactSemiControlledTextField = ({
  value,
  onChange,
  errorText,
  commitOnBlur,
  ...otherProps
}: Props) => {
  const [focused, setFocused] = React.useState<boolean>(false);
  const [text, setText] = React.useState<string>('');

  return (
    <div className={classes.container}>
      <CompactTextField
        type="text"
        value={focused ? text : value}
        onFocus={event => {
          setFocused(true);
          setText(value);
        }}
        onChange={newValue => {
          setText(newValue);
          if (!commitOnBlur) onChange(newValue);
        }}
        onBlur={event => {
          onChange(event.currentTarget.value);
          setFocused(false);
          setText('');
        }}
        {...otherProps}
      />
      {errorText && <div className={classes.error}>{errorText}</div>}
    </div>
  );
};

export default CompactSemiControlledTextField;
