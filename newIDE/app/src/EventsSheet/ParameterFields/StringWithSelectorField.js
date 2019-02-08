// @flow
import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';
import { defaultAutocompleteProps } from '../../UI/AutocompleteProps';

type State = {|
  focused: boolean,
  text: ?string,
|};

export default class StringWithSelectorField extends Component<
  ParameterFieldProps,
  State
> {
  state = { focused: false, text: null };

  _description: ?string;
  _field: ?any;
  _choices: Array<string> = [];

  constructor(props: ParameterFieldProps) {
    super(props);

    const { parameterMetadata } = this.props;
    this._choices = [];

    if (!parameterMetadata) {
      return;
    }

    try {
      this._description = parameterMetadata.getDescription();
      this._choices = JSON.parse(parameterMetadata.getExtraInfo());
    } catch (exception) {
      console.error(
        'The parameter seems misconfigured, as an array of choices could not be extracted - verify that your properly wrote a list of choices in JSON format. Full exception is:',
        exception
      );
    }
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
        dataSource={this._choices.map(choice => ({
          text: choice,
          value: '"' + choice + '"',
        }))}
        openOnFocus={!this.props.isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
