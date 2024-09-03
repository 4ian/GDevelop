// @flow

import * as React from 'react';
import CompactTextField, {
  type CompactTextFieldInterface,
} from '../CompactTextField';
import classes from './CompactSemiControlledNumberField.module.css';
import {
  shouldCloseOrCancel,
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
  const cancelEditionRef = React.useRef<boolean>(false);
  const [focused, setFocused] = React.useState<boolean>(false);
  const [temporaryValue, setTemporaryValue] = React.useState<string>(
    value.toString()
  );

  const onChangeValue = React.useCallback(
    (
      newValueAsString: string,
      reason: 'keyInput' | 'iconControl' | 'blur' | 'userValidation'
    ) => {
      const newValueAsFloat = parseFloat(newValueAsString);
      if (reason === 'iconControl') {
        const isNewValueAsFloatValid = !Number.isNaN(newValueAsFloat);

        if (isNewValueAsFloatValid) {
          onChange(newValueAsFloat);
        }
        setTemporaryValue(newValueAsString);
        return;
      }

      if (
        reason === 'keyInput' ||
        reason === 'blur' ||
        reason === 'userValidation'
      ) {
        const isValueWithLeadingSign = /[+-]\s*\d+/.test(newValueAsString);
        // parseFloat correctly parses '12+' as '12' so we need to check
        // for math characters ourselves.
        const containsMathCharacters = /[+-/*^()%]/.test(newValueAsString);
        const isNewValueAsFloatValid =
          !Number.isNaN(newValueAsFloat) &&
          (!containsMathCharacters ||
            (containsMathCharacters && isValueWithLeadingSign));
        let updateTemporaryValueWithCalculatedValue = false;
        let newValue: number | null = null;
        if (reason === 'userValidation' || reason === 'blur') {
          // Do not try to parse input at each input change.
          try {
            newValue = calculate(newValueAsString.toLowerCase());
            updateTemporaryValueWithCalculatedValue = true;
          } catch (error) {
            console.warn(`Error computing ${newValueAsString}:`, error);
          }
        }
        if (newValue === null && isNewValueAsFloatValid) {
          newValue = newValueAsFloat;
        }

        if (newValue && (reason === 'blur' || !commitOnBlur)) {
          onChange(newValue);
        }
        setTemporaryValue(
          updateTemporaryValueWithCalculatedValue && newValue
            ? newValue.toString()
            : newValueAsString
        );
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
          if (shouldValidate(event)) {
            onChangeValue(temporaryValue.toLowerCase(), 'userValidation');
          }
        }}
        onKeyUp={event => {
          const { current: textField } = textFieldRef;
          if (shouldCloseOrCancel(event) && textField) {
            cancelEditionRef.current = true;
            textField.blur();
          }
        }}
        onBlur={event => {
          if (!cancelEditionRef.current) onChangeValue(temporaryValue, 'blur');
          setFocused(false);
          setTemporaryValue('');
          cancelEditionRef.current = false;
        }}
        {...otherProps}
      />
      {errorText && <div className={classes.error}>{errorText}</div>}
    </div>
  );
};

export default CompactSemiControlledNumberField;
