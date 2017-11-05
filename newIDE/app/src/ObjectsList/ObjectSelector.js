import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import { enumerateObjectsAndGroups } from './EnumerateObjects';
import { fuzzyOrEmptyFilter } from '../Utils/FuzzyOrEmptyFilter';

const styles = {
  autoCompleteTextField: {
    minWidth: 300,
  },
};

export default class ObjectSelector extends Component {
  constructor(props) {
    super(props);

    const { project, layout } = this.props;
    const list = enumerateObjectsAndGroups(
      project,
      layout,
      this.props.allowedObjectType || undefined
    );
    const objects = list.allObjectsList.map(({ object }) => {
      return {
        text: object.getName(),
        value: object.getName(),
      };
    });
    const groups = props.noGroups
      ? []
      : list.allGroupsList.map(({ group }) => {
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

  hasAValidObject = () => {
    return (
      this.fullList.filter(choice => this.props.value === choice.text)
        .length !== 0
    );
  };

  render() {
    const {
      value,
      onChange,
      onChoose,
      project,
      layout,
      allowedObjectType,
      noGroups,
      ...rest
    } = this.props;

    return (
      <AutoComplete
        fullWidth
        textFieldStyle={styles.autoCompleteTextField}
        menuProps={{
          maxHeight: 250,
        }}
        searchText={value}
        onUpdateInput={value => {
          onChange(value);
        }}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            onChoose(data);
          } else if (typeof data.value === 'string') {
            onChoose(data.value);
          }
        }}
        dataSource={this.fullList}
        filter={fuzzyOrEmptyFilter}
        ref={field => (this._field = field)}
        {...rest}
      />
    );
  }
}
