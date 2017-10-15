import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';

const styles = {
  autoCompleteTextField: {
    minWidth: 300,
  },
};

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

export default class KeyField extends Component {
  constructor(props) {
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
        floatingLabelText={this._description}
        fullWidth
        textFieldStyle={styles.autoCompleteTextField}
        menuProps={{
          maxHeight: 250,
        }}
        searchText={this.props.value}
        onUpdateInput={value => {
          this.props.onChange(value);
        }}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            this.props.onChange(data);
          } else if (typeof data.value === 'string') {
            this.props.onChange(data.value);
          }
        }}
        dataSource={this._keyNames.map(keyName => ({
          text: keyName,
          value: keyName,
        }))}
        filter={fuzzyFilterOrEmpty}
        openOnFocus={!this.props.isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
