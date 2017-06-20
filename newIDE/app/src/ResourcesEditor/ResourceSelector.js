import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Add from 'material-ui/svg-icons/content/add';

export default class ResourceSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notExistingError: false,
      resourceName: props.initialResourceName || '',
    };

    const { project } = props;
    if (project) {
      this._loadFrom(project.getResourcesManager());
    }
  }

  _getDefaultItems() {
    return [
      {
        text: 'new-image',
        value: (
          <MenuItem primaryText="Choose a new image" rightIcon={<Add />} />
        ),
        onClick: () => console.log("TODO"),
      },
      {
        text: '',
        value: <Divider />,
      },
    ];
  }

  _loadFrom(resourcesManager) {
    this.allResourcesNames = resourcesManager.getAllResourcesList().toJSArray();
    if (this.props.resourceKind) {
      this.allResourcesNames = this.allResourcesNames.filter(resourceName => {
        return resourcesManager.getResource(resourceName).getKind() ===
          this.props.resourceKind;
      });
    }
    this.defaultItems = this._getDefaultItems();
    this.autoCompleteData = [...this.defaultItems, ...this.allResourcesNames];
  }

  _onUpdate = searchText => {
    this.setState(
      {
        resourceName: searchText,
        notExistingError: this.allResourcesNames.indexOf(searchText) === -1,
      },
      () => {
        if (!this.state.notExistingError) {
          if (this.props.onChange) this.props.onChange(searchText);
        }
      }
    );
  };

  _onItemChosen = (text: string, index: number) => {
    if (index === -1 || index >= this.defaultItems.length)
      return this._onUpdate(text);

    this.defaultItems[index].onClick();
  }

  render() {
    const errorText = this.state.notExistingError
      ? 'This resource is not existing in the game'
      : null;

    return (
      <AutoComplete
        floatingLabelText={this.props.floatingLabelText || 'Select an image'}
        filter={AutoComplete.fuzzyFilter}
        openOnFocus
        dataSource={this.autoCompleteData || []}
        onUpdateInput={this._onUpdate}
        onNewRequest={this._onItemChosen}
        errorText={errorText}
        searchText={this.state.resourceName}
      />
    );
  }
}
