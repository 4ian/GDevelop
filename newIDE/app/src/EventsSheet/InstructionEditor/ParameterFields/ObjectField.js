import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import {
  enumerateObjectsAndGroups,
} from '../../../ObjectsList/EnumerateObjects';

const fuzzyFilterOrEmpty = (searchText, key) => {
  return !key || AutoComplete.fuzzyFilter(searchText, key);
};

export default class ObjectField extends Component {
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
        searchText={this.props.value}
        onUpdateInput={value => this.props.onChange(value)}
        onNewRequest={data => this.props.onChange(data.value)}
        dataSource={fullList}
        filter={fuzzyFilterOrEmpty}
        openOnFocus={true}
      />
    );
  }
}
