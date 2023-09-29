// @flow

import * as React from 'react';
import TextField from './TextField';
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
  emptyErrorText?: React.Node,
  onCancel: () => void,

  // TextField props
  autoFocus?: 'desktop' | 'desktopAndMobileDevices',
  maxLength?: number,
  margin?: 'none' | 'dense',
  translatableHintText?: MessageDescriptor,
|};

const AsyncSemiControlledTextField = ({
  value,
  callback,
  callbackErrorText,
  emptyErrorText,
  onCancel,
  ...textFieldProps
}: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const [newValue, setNewValue] = React.useState<string>(value);

  const onFinishEditingValue = async () => {
    const cleanedNewValue = newValue.trim();
    if (emptyErrorText && !cleanedNewValue) {
      setErrorText(emptyErrorText);
      return;
    }
    if (cleanedNewValue === value) {
      return;
    }
    setIsLoading(true);
    try {
      await callback(cleanedNewValue);
    } catch (error) {
      console.error(error);
      setErrorText(callbackErrorText);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeValue = React.useCallback(
    (e, _value) => {
      if (errorText) {
        setErrorText(null);
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

  return (
    <TextField
      value={newValue}
      disabled={isLoading}
      onChange={onChangeValue}
      errorText={errorText}
      onKeyUp={event => {
        if (shouldValidate(event)) {
          onFinishEditingValue();
        } else if (shouldCloseOrCancel(event)) {
          event.stopPropagation();
          cancel();
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
