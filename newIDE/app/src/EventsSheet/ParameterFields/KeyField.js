// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';
import { defaultAutocompleteProps } from '../../UI/AutocompleteProps';

type State = {|
  focused: boolean,
  text: ?string,
|};

export default class KeyField extends Component<ParameterFieldProps, State> {
  state = { focused: false, text: null };

  _description: ?string;
  _field: ?any;
  _keyNames: Array<string> = [];

  constructor(props: ParameterFieldProps) {
    super(props);

    const { parameterMetadata } = this.props;
    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._keyNames = [
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
  }

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <AutoComplete
        {...defaultAutocompleteProps}
        floatingLabelText={this._description}
        searchText={this.state.focused ? this.state.text : this.props.value}
        onFocus={() => {
          this.setState({
            focused: true,
            text: this.props.value,
          });
        }}
        onUpdateInput={value => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onBlur={event => {
          this.props.onChange(event.target.value);
          this.setState({
            focused: false,
            text: null,
          });
        }}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            this.props.onChange(data);
          } else if (typeof data.value === 'string') {
            this.props.onChange(data.value);
          }
          this.focus(); // Keep the focus after choosing an item
        }}
        dataSource={this._keyNames.map(keyName => ({
          text: keyName,
          value: keyName,
        }))}
        openOnFocus={!this.props.isInline}
        ref={field => (this._field = field)}
        errorText={
          this.props.value ? undefined : <Trans>You must select a key</Trans>
        }
      />
    );
  }
}
