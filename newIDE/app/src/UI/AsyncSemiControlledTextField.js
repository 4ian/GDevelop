// @flow

import * as React from 'react';
import TextField, { type TextFieldStyleProps } from './TextField';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from './KeyboardShortcuts/InteractionKeys';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import IconButton from './IconButton';
import CheckIcon from './CustomSvgIcons/Check';
import CrossIcon from './CustomSvgIcons/Cross';

type Props = {|
  value: string,
  callback: (newValue: string) => Promise<void>,
  callbackErrorText: React.Node,
  errorText?: React.Node,
  emptyErrorText?: React.Node,
  onCancel: () => void,

  // TextField props
  autoFocus?: 'desktop' | 'desktopAndMobileDevices',
  maxLength?: number,
  margin?: 'none' | 'dense',
  translatableHintText?: MessageDescriptor,
  style?: TextFieldStyleProps,
|};

const AsyncSemiControlledTextField = ({
  value,
  callback,
  callbackErrorText,
  errorText,
  emptyErrorText,
  onCancel,
  ...textFieldProps
}: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [internalErrorText, setInternalErrorText] = React.useState<?React.Node>(
    null
  );
  const [newValue, setNewValue] = React.useState<string>(value);

  const onFinishEditingValue = async () => {
    const cleanedNewValue = newValue.trim();
    if (emptyErrorText && !cleanedNewValue) {
      setInternalErrorText(emptyErrorText);
      return;
    }
    if (cleanedNewValue === value) {
      onCancel();
      return;
    }
    setIsLoading(true);
    try {
      await callback(cleanedNewValue);
    } catch (error) {
      console.error(error);
      setInternalErrorText(callbackErrorText);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeValue = React.useCallback(
    (e, _value) => {
      if (errorText) {
        setInternalErrorText(null);
      }
      setNewValue(_value);
    },
    [errorText]
  );

  const cancel = React.useCallback(
    () => {
      setNewValue(value);
      onCancel();
    },
    [value, onCancel]
  );

  const errorTextToDisplay = errorText || internalErrorText;

  return (
    <TextField
      value={newValue}
      disabled={isLoading}
      onChange={onChangeValue}
      errorText={errorTextToDisplay}
      onKeyUp={event => {
        if (shouldValidate(event)) {
          onFinishEditingValue();
        } else if (shouldCloseOrCancel(event)) {
          event.stopPropagation();
          cancel();
        }
      }}
      onKeyDown={event => {
        if (shouldCloseOrCancel(event)) {
          event.stopPropagation();
        }
      }}
      endAdornment={
        <>
          <IconButton
            edge="end"
            onClick={cancel}
            disabled={isLoading}
            size="small"
          >
            <CrossIcon />
          </IconButton>
          <IconButton
            edge="end"
            onClick={onFinishEditingValue}
            disabled={isLoading}
            size="small"
          >
            <CheckIcon />
          </IconButton>
        </>
      }
      type="text"
      {...textFieldProps}
    />
  );
};

export default AsyncSemiControlledTextField;
