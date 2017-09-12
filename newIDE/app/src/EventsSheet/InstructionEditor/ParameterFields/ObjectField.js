import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import {
  enumerateObjectsAndGroups,
} from '../../../ObjectsList/EnumerateObjects';

const styles = {
  autoCompleteTextField: {
    minWidth: 300,
  },
};

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

export default class ObjectField extends Component {
  constructor(props) {
    super(props);

    this.state = { errorText: null };

    const { project, layout, parameterMetadata } = this.props;

    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._objectTypeAllowed = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;

    const list = enumerateObjectsAndGroups(
      project,
      layout,
      this._objectTypeAllowed
    );
    const objects = list.allObjectsList.map(({
      object,
    }) => {
      return {
        text: object.getName(),
        value: object.getName(),
      };
    });
    const groups = list.allGroupsList.map(({
      group,
    }) => {
      return {
        text: group.getName(),
        value: group.getName(),
      };
    });

    this.fullList = [...objects, { text: '', value: <Divider /> }, ...groups];
  }

  focus() {
    if (this._field) this._field.focus();
  }

  getError = () => {
    const isValidChoice = this.fullList.filter(
      choice => this.props.value === choice.text
    ).length !== 0;

    if (!isValidChoice)
      return "The object does not exist or can't be used here";

    return null;
  };

  doValidation = () => {
    this.setState({ errorText: this.getError() });
  };

  render() {
    return (
      <AutoComplete
        floatingLabelText={this._description}
        fullWidth
        textFieldStyle={styles.autoCompleteTextField}
        menuProps={{
          maxHeight: 250,
        }}
        errorText={this.state.errorText}
        searchText={this.props.value}
        onUpdateInput={value => {
          this.setState({ errorText: null });
          this.props.onChange(value);
        }}
        onBlur={this.doValidation}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            this.props.onChange(data);
          } else if (typeof data.value === 'string') {
            this.props.onChange(data.value);
          }
        }}
        dataSource={this.fullList}
        filter={fuzzyFilterOrEmpty}
        openOnFocus={!this.props.isInline}
        ref={field => this._field = field}
      />
    );
  }
}
