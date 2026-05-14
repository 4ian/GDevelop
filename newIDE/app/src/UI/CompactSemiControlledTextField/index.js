// @flow

import * as React from 'react';
import CompactTextField, {
  type CompactTextFieldInterface,
} from '../CompactTextField';
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
  onFocus?: () => void,

  errorText?: React.Node,
|};

const CompactSemiControlledTextField: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<CompactTextFieldInterface>,
}> = React.forwardRef<Props, CompactTextFieldInterface>(
  (
    { value, onChange, onFocus, errorText, commitOnBlur, ...otherProps },
    ref
  ) => {
    const [focused, setFocused] = React.useState<boolean>(false);
    const [text, setText] = React.useState<string>('');

    const inputRef = React.useRef<?CompactTextFieldInterface>(null);
    React.useImperativeHandle(ref, () => ({
      blur: () => {
        if (inputRef.current) inputRef.current.blur();
      },
      focus: () => {
        if (inputRef.current) inputRef.current.focus();
      },
      select: () => {
        if (inputRef.current) inputRef.current.select();
      },
    }));

    return (
      <div className={classes.container}>
        <CompactTextField
          ref={inputRef}
          type="text"
          value={focused ? text : value}
          onFocus={event => {
            setFocused(true);
            setText(value);
            if (onFocus) {
              onFocus();
            }
          }}
          onChange={newValue => {
            setText(newValue);
            if (!commitOnBlur) onChange(newValue);
          }}
          onBlur={event => {
            if (value !== event.currentTarget.value) {
              onChange(event.currentTarget.value);
            }
            setFocused(false);
            setText('');
          }}
          {...otherProps}
        />
        {errorText && <div className={classes.error}>{errorText}</div>}
      </div>
    );
  }
);

export default CompactSemiControlledTextField;
