import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import { enumerateObjects } from '../../../ObjectsList/EnumerateObjects';

export default class ObjectField extends Component {
  render() {
    const { project, layout } = this.props;
    const objects = enumerateObjects(project, layout).allObjectsList.map(({
      object,
    }) => {
      return {
        text: object.getName(),
        value: object.getName(),
      };
    });

    return (
      <AutoComplete
        floatingLabelText={this.props.parameterMetadata.getDescription()}
        fullWidth
        searchText={this.props.value}
        onUpdateInput={value => this.props.onChange(value)}
        onNewRequest={data => this.props.onChange(data.value)}
        dataSource={objects}
        filter={AutoComplete.fuzzyFilter}
        openOnFocus={true}
      />
    );
  }
}
