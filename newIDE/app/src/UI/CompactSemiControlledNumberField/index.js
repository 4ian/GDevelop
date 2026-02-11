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
import IconButton from '../IconButton';
import Infinite from '../CustomSvgIcons/Infinite';
import { t } from '@lingui/macro';

const getValueAsFloatIfValid = (valueAsString: string): number | null => {
  const valueAsFloat = parseFloat(valueAsString);
  const isValueAsFloatValid =
    !Number.isNaN(valueAsFloat) && isFinite(valueAsFloat);
  return isValueAsFloatValid ? valueAsFloat : null;
};

const styles = {
  icon: {
    fontSize: 18,
  },
};

const updateAndReturnValueAsFloatIfValid = (
  valueAsString: string,
  valueToAddOrSubtract: number
): number | null => {
  const validValueAsFloat = getValueAsFloatIfValid(valueAsString);
  // We round to the same number of decimal places as the input value, to avoid
  // floating point precision issues.
  const numberOfDecimalPlaces = (valueAsString.split('.')[1] || '').length;
  return validValueAsFloat !== null
    ? parseFloat(
        (validValueAsFloat + valueToAddOrSubtract).toFixed(
          numberOfDecimalPlaces
        )
      )
    : null;
};

type Props = {|
  id?: string,
  value: number,
  onChange: number => void,
  commitOnBlur?: boolean,
  disabled?: boolean,
  canBeUnlimitedUsingMinus1?: boolean,
  errored?: boolean,
  placeholder?: string,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,
  useLeftIconAsNumberControl?: boolean,
  renderEndAdornmentOnHover?: (className: string) => React.Node,
  onClickEndAdornment?: () => void,
  getValueFromDisplayedValue?: string => string,
  getDisplayedValueFromValue?: string => string,
|};

const CompactSemiControlledNumberField = ({
  value,
  onChange,
  placeholder,
  canBeUnlimitedUsingMinus1,
  commitOnBlur,
  getValueFromDisplayedValue,
  getDisplayedValueFromValue,
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
      reason: 'keyInput' | 'wheel' | 'iconControl' | 'blur' | 'userValidation'
    ) => {
      const newValueAsValidFloat = getValueAsFloatIfValid(newValueAsString);
      if (reason === 'iconControl') {
        if (newValueAsValidFloat !== null) {
          onChange(newValueAsValidFloat);
        }
        setTemporaryValue(newValueAsString);
        return;
      }

      if (
        reason === 'keyInput' ||
        reason === 'wheel' ||
        reason === 'blur' ||
        reason === 'userValidation'
      ) {
        const isValueWithLeadingSign = /[+-]\s*\d+/.test(newValueAsString);
        // parseFloat correctly parses '12+' as '12' so we need to check
        // for math characters ourselves.
        const containsMathCharacters = /[+-/*^()%]/.test(newValueAsString);
        const isNewValueAsFloatValidOrStartsWithSign =
          newValueAsValidFloat !== null &&
          (!containsMathCharacters ||
            (containsMathCharacters && isValueWithLeadingSign));
        let updateTemporaryValueWithCalculatedValue = false;
        let newValueAfterCalculation: number | null = null;
        if (reason === 'userValidation' || reason === 'blur') {
          // Do not try to parse input at each input change.
          try {
            newValueAfterCalculation = calculate(
              newValueAsString.toLowerCase()
            );
            if (
              Number.isNaN(newValueAfterCalculation) ||
              !isFinite(newValueAfterCalculation)
            ) {
              newValueAfterCalculation = null;
            }
            updateTemporaryValueWithCalculatedValue = true;
          } catch (error) {
            console.warn(`Error computing ${newValueAsString}:`, error);
          }
        }

        if (
          newValueAfterCalculation === null &&
          isNewValueAsFloatValidOrStartsWithSign
        ) {
          newValueAfterCalculation = newValueAsValidFloat;
        }

        if (
          newValueAfterCalculation !== null &&
          (reason === 'blur' || !commitOnBlur)
        ) {
          onChange(newValueAfterCalculation);
        }
        setTemporaryValue(
          updateTemporaryValueWithCalculatedValue && newValueAfterCalculation
            ? newValueAfterCalculation.toString()
            : newValueAsString
        );
      }
    },
    [commitOnBlur, onChange]
  );

  const stringValue = getDisplayedValueFromValue
    ? getDisplayedValueFromValue(value.toString())
    : value.toString();

  const isUnlimited = canBeUnlimitedUsingMinus1 && value === -1;

  return (
    <div className={classes.container}>
      <CompactTextField
        type="text"
        ref={textFieldRef}
        disabled={isUnlimited}
        placeholder={isUnlimited ? 'Unlimited' : placeholder}
        value={isUnlimited ? '' : focused ? temporaryValue : stringValue}
        onChange={onChangeValue}
        onFocus={event => {
          setFocused(true);
          const originalStringValue = getValueFromDisplayedValue
            ? getValueFromDisplayedValue(stringValue)
            : stringValue;
          setTemporaryValue(originalStringValue);
        }}
        onKeyDown={event => {
          if (shouldValidate(event)) {
            onChangeValue(temporaryValue.toLowerCase(), 'userValidation');
          }
          if (event.key === 'ArrowDown') {
            const newValueAsValidFloat = updateAndReturnValueAsFloatIfValid(
              temporaryValue,
              -1
            );
            if (newValueAsValidFloat === null) return;

            event.preventDefault();
            onChangeValue(newValueAsValidFloat.toString(), 'keyInput');
          }
          if (event.key === 'ArrowUp') {
            const newValueAsValidFloat = updateAndReturnValueAsFloatIfValid(
              temporaryValue,
              1
            );
            if (newValueAsValidFloat === null) return;

            event.preventDefault();
            onChangeValue(newValueAsValidFloat.toString(), 'keyInput');
          }
        }}
        onWheel={event => {
          // Going up is negative, going down is positive.
          if (event.deltaY < 0) {
            const newValueAsValidFloat = updateAndReturnValueAsFloatIfValid(
              temporaryValue,
              1
            );
            if (newValueAsValidFloat === null) return;

            event.preventDefault();
            onChangeValue(newValueAsValidFloat.toString(), 'wheel');
          }
          if (event.deltaY > 0) {
            const newValueAsValidFloat = updateAndReturnValueAsFloatIfValid(
              temporaryValue,
              -1
            );
            if (newValueAsValidFloat === null) return;

            event.preventDefault();
            onChangeValue(newValueAsValidFloat.toString(), 'wheel');
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
          const newValue = getDisplayedValueFromValue
            ? getDisplayedValueFromValue(temporaryValue)
            : temporaryValue;
          if (!cancelEditionRef.current) onChangeValue(newValue, 'blur');
          setFocused(false);
          setTemporaryValue('');
          cancelEditionRef.current = false;
        }}
        {...otherProps}
      />
      {canBeUnlimitedUsingMinus1 && (
        <IconButton
          size="small"
          onClick={() => {
            if (isUnlimited) {
              onChange(0);
              if (textFieldRef.current) textFieldRef.current.focus();
            } else {
              onChange(-1);
            }
          }}
          selected={isUnlimited}
          tooltip={isUnlimited ? t`Remove unlimited` : t`Set to unlimited`}
        >
          <Infinite style={styles.icon} />
        </IconButton>
      )}
    </div>
  );
};

export default CompactSemiControlledNumberField;
