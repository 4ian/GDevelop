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
  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { project, layout } = this.props;
    const list = enumerateObjectsAndGroups(project, layout);
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

    const fullList = [...objects, { text: '', value: <Divider /> }, ...groups];

    return (
      <AutoComplete
        floatingLabelText={this.props.parameterMetadata.getDescription()}
        fullWidth
        textFieldStyle={styles.autoCompleteTextField}
        searchText={this.props.value}
        onUpdateInput={value => this.props.onChange(value)}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            this.props.onChange(data);
          } else if (typeof data.value === 'string') {
            this.props.onChange(data.value);
          }
        }}
        dataSource={fullList}
        filter={fuzzyFilterOrEmpty}
        openOnFocus={!this.props.isInline}
        ref={field => this._field = field}
      />
    );
  }
}
