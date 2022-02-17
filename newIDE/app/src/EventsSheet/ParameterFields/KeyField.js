// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

const keyNames = [
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
  'LShift',
  'RShift',
  'LControl',
  'RControl',
  'LAlt',
  'RAlt',
  'LSystem',
  'RSystem',
  'SemiColon',
  'Comma',
  'Period',
  'Quote',
  'Slash',
  'BackSlash',
  'Tilde',
  'Equal',
  'Dash',
  'Space',
  'Back',
  'Tab',
  'Delete',
  'Insert',
  'Escape',
  'PageUp',
  'PageDown',
  'End',
  'Home',
  'Return',
  'NumpadPageUp',
  'NumpadPageDown',
  'NumpadEnd',
  'NumpadHome',
  'NumpadReturn',
  'Add',
  'Subtract',
  'Multiply',
  'Divide',
  'NumpadAdd',
  'NumpadSubtract',
  'NumpadMultiply',
  'NumpadDivide',
  'Left',
  'Up',
  'Right',
  'Down',
  'NumpadLeft',
  'NumpadUp',
  'NumpadRight',
  'NumpadDown',
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
];

const isKeyValid = (key: string) => keyNames.indexOf(key) !== -1;

export default class KeyField extends Component<ParameterFieldProps, {||}> {
  _field: ?any;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    const {
      value,
      onChange,
      isInline,
      parameterMetadata,
      onRequestClose,
      onApply,
    } = this.props;

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        floatingLabelText={
          parameterMetadata ? parameterMetadata.getDescription() : undefined
        }
        helperMarkdownText={
          parameterMetadata ? parameterMetadata.getLongDescription() : undefined
        }
        fullWidth
        value={value}
        onChange={onChange}
        dataSource={keyNames.map(keyName => ({
          text: keyName,
          value: keyName,
        }))}
        openOnFocus={!isInline}
        onRequestClose={onRequestClose}
        onApply={onApply}
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
