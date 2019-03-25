// @flow
import OpenInNew from 'material-ui/svg-icons/action/open-in-new';

import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import { enumerateVariables } from './EnumerateVariables';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';
import { defaultAutocompleteProps } from '../../UI/AutocompleteProps';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'baseline',
  },
  moreButton: {
    marginLeft: 10,
  },
};

type Props = {
  ...ParameterFieldProps,
  variablesContainer: ?gdVariablesContainer,
  onOpenDialog: ?() => void,
};

type State = {|
  focused: boolean,
  text: ?string,
|};

export default class VariableField extends Component<Props, State> {
  state = { focused: false, text: null };

  _description: ?string;
  _field: ?AutoComplete;
  _variableNames: Array<string> = [];

  constructor(props: Props) {
    super(props);

    const { parameterMetadata } = this.props;
    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._loadNamesFrom(props);
  }

  forceUpdateVariables() {
    this._loadNamesFrom(this.props);
  }

  focus() {
    if (this._field) this._field.focus();
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.variablesContainer !== this.props.variablesContainer) {
      this._loadNamesFrom(newProps);
    }
  }

  _loadNamesFrom(props: Props) {
    this._variableNames = enumerateVariables(props.variablesContainer);
  }

  render() {
    return (
      <div style={styles.container}>
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
          dataSource={this._variableNames.map(variableName => ({
            text: variableName,
            value: variableName,
          }))}
          openOnFocus={!this.props.isInline}
          ref={field => (this._field = field)}
        />
        {this.props.onOpenDialog && !this.props.isInline && (
          <RaisedButton
            icon={<OpenInNew />}
            disabled={!this.props.variablesContainer}
            primary
            style={styles.moreButton}
            onClick={this.props.onOpenDialog}
          />
        )}
      </div>
    );
  }
}
