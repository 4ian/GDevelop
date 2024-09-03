// @flow

import * as React from 'react';
import CompactTextField, {
  type CompactTextFieldInterface,
} from '../CompactTextField';
import classes from './CompactSemiControlledNumberField.module.css';
import {
  shouldCloseOrCancel,
  shouldFocusAnotherField,
  shouldValidate,
} from '../KeyboardShortcuts/InteractionKeys';
import { calculate } from '../../Utils/MathExpressionParser';

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
  const textFieldRef = React.useRef<?CompactTextFieldInterface>(null);
  const [focused, setFocused] = React.useState<boolean>(false);
  const [temporaryValue, setTemporaryValue] = React.useState<string>(
    value.toString()
  );

  const onChangeValue = React.useCallback(
    (newValueAsString: string, reason: 'keyInput' | 'iconControl') => {
      // parseFloat correctly parses '12+' as '12' so we need to check
      // for math characters ourselves.
      const containsMathCharacters = /[+-/*^()]/.test(newValueAsString);
      const newValueAsFloat = parseFloat(newValueAsString);
      const isNewValueAsFloatValid =
        !containsMathCharacters && !Number.isNaN(newValueAsFloat);
      if (isNewValueAsFloatValid) {
        setTemporaryValue(newValueAsString);
        if (reason === 'keyInput') {
          if (!commitOnBlur) onChange(newValueAsFloat);
        } else {
          onChange(newValueAsFloat);
        }
      } else {
        setTemporaryValue(newValueAsString);
      }
    },
    [commitOnBlur, onChange]
  );

  return (
    <div className={classes.container}>
      <CompactTextField
        type="text"
        ref={textFieldRef}
        value={focused ? temporaryValue : value.toString()}
        onChange={onChangeValue}
        onFocus={event => {
          setFocused(true);
          setTemporaryValue(value.toString());
        }}
        onKeyDown={event => {
          if (shouldValidate(event) || shouldFocusAnotherField(event)) {
            try {
              const calculatedValue = calculate(temporaryValue.toLowerCase());
              onChange(calculatedValue);
              setTemporaryValue(calculatedValue.toString());
            } catch (error) {
              console.warn(`Error computing ${temporaryValue}:`, error);
              setTemporaryValue(value.toString());
            }
          }
        }}
        onKeyUp={event => {
          if (shouldCloseOrCancel(event) && textFieldRef.current) {
            textFieldRef.current.blur();
          }
        }}
        onBlur={event => {
          const newValue = parseFloat(event.currentTarget.value);
          const isNewValueValid = !Number.isNaN(newValue);
          if (isNewValueValid && newValue !== value) {
            onChange(newValue);
          }
          setFocused(false);
          setTemporaryValue('');
        }}
        {...otherProps}
      />
      {errorText && <div className={classes.error}>{errorText}</div>}
    </div>
  );
};

export default CompactSemiControlledNumberField;
