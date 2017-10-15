import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import { mapFor } from '../../../Utils/MapFor';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'baseline',
  },
  moreButton: {
    marginLeft: 10,
  },
  autoCompleteTextField: {
    minWidth: 300,
  },
};

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

export default class VariableField extends Component {
  constructor(props) {
    super(props);

    this.state = { errorText: null };

    const { parameterMetadata } = this.props;
    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._loadNamesFrom(props);
  }

  focus() {
    if (this._field) this._field.focus();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.variablesContainer !== this.props.variablesContainer) {
      this._loadNamesFrom(newProps);
    }
  }

  _loadNamesFrom(props) {
    if (!props.variablesContainer) {
      this._variableNames = [];
      return;
    }

    this._variableNames = mapFor(0, props.variablesContainer.count(), i => {
      const variableAndName = props.variablesContainer.getAt(i);
      return variableAndName.getName();
    });
  }

  render() {
    return (
      <div style={styles.container}>
        <AutoComplete
          floatingLabelText={this._description}
          fullWidth
          textFieldStyle={styles.autoCompleteTextField}
          menuProps={{
            maxHeight: 250,
          }}
          searchText={this.props.value}
          onUpdateInput={value => {
            this.setState({ errorText: null });
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
          dataSource={this._variableNames.map(variableName => ({
            text: variableName,
            value: variableName,
          }))}
          filter={fuzzyFilterOrEmpty}
          openOnFocus={!this.props.isInline}
          ref={field => (this._field = field)}
        />
        {this.props.onOpenDialog &&
          !this.props.isInline && (
            <RaisedButton
              label="..."
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
