// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

const keyNames = [
  'Num0',
  'Num1',
  'Num2',
  'Num3',
  'Num4',
  'Num5',
  'Num6',
  'Num7',
  'Num8',
  'Num9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'LBracket',
  'RBracket',
  'SemiColon',
  'Numpad0',
  'Numpad1',
  'Numpad2',
  'Numpad3',
  'Numpad4',
  'Numpad5',
  'Numpad6',
  'Numpad7',
  'Numpad8',
  'Numpad9',
  'Escape',
  'Space',
  'Return',
  'Back',
  'Tab',
  'PageUp',
  'PageDown',
  'End',
  'Home',
  'Insert',
  'Delete',
  'Add',
  'Subtract',
  'Multiply',
  'Divide',
  'Left',
  'Right',
  'Up',
  'Down',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'Pause',
  'RControl',
  'LControl',
  'RAlt',
  'LAlt',
  'RShift',
  'LShift',
];

const isKeyValid = (key: string) => keyNames.indexOf(key) !== -1;

export default class KeyField extends Component<ParameterFieldProps, {||}> {
  _field: ?any;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { value, onChange, isInline, parameterMetadata } = this.props;

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        floatingLabelText={
          parameterMetadata ? parameterMetadata.getDescription() : undefined
        }
        fullWidth
        value={value}
        onChange={onChange}
        dataSource={keyNames.map(keyName => ({
          text: keyName,
          value: keyName,
        }))}
        openOnFocus={!isInline}
        ref={field => (this._field = field)}
        errorText={
          !value ? (
            <Trans>You must select a key.</Trans>
          ) : !isKeyValid(value) ? (
            <Trans>You must select a valid key. "{value}" is not valid.</Trans>
          ) : (
            undefined
          )
        }
      />
    );
  }
}

export const renderInlineKey = ({
  value,
  InvalidParameterValue,
}: ParameterInlineRendererProps) => {
  if (!value) {
    return (
      <InvalidParameterValue isEmpty>
        <Trans>Choose a key</Trans>
      </InvalidParameterValue>
    );
  }

  return isKeyValid(value) ? (
    value
  ) : (
    <InvalidParameterValue>{value}</InvalidParameterValue>
  );
};
