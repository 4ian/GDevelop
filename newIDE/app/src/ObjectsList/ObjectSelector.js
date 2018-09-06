import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Divider from 'material-ui/Divider';
import { enumerateObjectsAndGroups } from './EnumerateObjects';
import { defaultAutocompleteProps } from '../UI/AutocompleteProps';

export default class ObjectSelector extends Component {
  state = {
    focused: false,
    text: null,
  }

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

  componentWillUnmount() {
    if (this.state.focused) {
      this.props.onChange(this.state.text);
    }
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
      onBlur,
      ...rest
    } = this.props;

    return (
      <AutoComplete
        {...defaultAutocompleteProps}
        searchText={this.state.focused ? this.state.text : value}
        onFocus={() => {
          this.setState({
            focused: true,
            text: value,
          });
        }}
        onUpdateInput={value => {
          this.setState({
            text: value,
          });
        }}
        onBlur={event => {
          onChange(event.target.value);
          this.setState({
            focused: false,
            text: null,
          });

          if (onBlur) onBlur(event);
        }}
        onNewRequest={data => {
          // Note that data may be a string or a {text, value} object.
          if (typeof data === 'string') {
            onChoose(data);
          } else if (typeof data.value === 'string') {
            onChoose(data.value);
          }
          this.focus(); // Keep the focus after choosing an item
        }}
        dataSource={this.fullList}
        ref={field => (this._field = field)}
        {...rest}
      />
    );
  }
}
