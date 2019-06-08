// @flow
import * as React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import { defaultAutocompleteProps } from './AutocompleteProps';

type State = {|
  focused: boolean,
  text: ?string,
|};

type Props = {|
  value: string,
  onChange: string => void,
  onChoose?: string => void, // Optionally called when Enter pressed or item clicked.
  dataSource: Array<{|
    text: string,
    value: React.Node,
  |}>,

  // Some AutoComplete props that can be reused:
  id?: string,
  onBlur?: (event: {|
    currentTarget: {|
      value: string,
    |},
  |}) => void,
  errorText?: React.Node,
  disabled?: boolean,
  floatingLabelText?: ?React.Node,
  hintText?: React.Node,
  fullWidth?: boolean,
  textFieldStyle?: Object,
  menuProps?: {|
    maxHeight?: number,
  |},
  popoverProps?: {
    canAutoPosition?: boolean,
  },
  filter?: (string, string) => boolean,
  openOnFocus?: boolean,
|};

/**
 * This component works like a material-ui AutoComplete, except that
 * the value passed as props is not forced into the text field when the user
 * is typing. This is useful if the parent component can do modifications on the value:
 * the user won't be interrupted or have the value changed until he blurs the field.
 */
export default class SemiControlledAutoComplete extends React.Component<
  Props,
  State
> {
  state = { focused: false, text: null };
  _field: ?AutoComplete;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const {
      floatingLabelText,
      value,
      onChange,
      onChoose,
      dataSource,
      onBlur,
      ...otherProps
    } = this.props;

    return (
      <AutoComplete
        {...defaultAutocompleteProps}
        {...otherProps}
        floatingLabelText={floatingLabelText}
        searchText={this.state.focused ? this.state.text : value}
        onFocus={() => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onUpdateInput={value => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onBlur={event => {
          onChange(event.currentTarget.value);
          this.setState({
            focused: false,
            text: null,
          });

          if (onBlur) onBlur(event);
        }}
        onNewRequest={data => {
          const callback = onChoose || onChange;
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            callback(data);
          } else if (typeof data.value === 'string') {
            callback(data.value);
          }
          this.focus(); // Keep the focus after choosing an item
        }}
        dataSource={dataSource}
        ref={field => (this._field = field)}
      />
    );
  }
}
