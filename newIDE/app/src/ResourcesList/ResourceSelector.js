import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Add from 'material-ui/svg-icons/content/add';
import { fuzzyOrEmptyFilter } from '../Utils/FuzzyOrEmptyFilter';

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
    const sources = this.props.resourceSources || [];
    return [
      ...sources
        .filter(source => source.kind === this.props.resourceKind)
        .map(source => ({
          text: '',
          value: (
            <MenuItem primaryText={source.displayName} rightIcon={<Add />} />
          ),
          onClick: () => this._addFrom(source),
        })),
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
        return (
          resourcesManager.getResource(resourceName).getKind() ===
          this.props.resourceKind
        );
      });
    }
    this.defaultItems = this._getDefaultItems();
    this.autoCompleteData = [...this.defaultItems, ...this.allResourcesNames];
  }

  _addFrom = source => {
    if (!source) return;

    const { project, onChooseResource } = this.props;
    onChooseResource(source.name, false)
      .then(resources => {
        if (!resources.length) return;
        const resource = resources[0];

        project.getResourcesManager().addResource(resource);

        this._loadFrom(project.getResourcesManager());
        this._onUpdate(resource.getName());
      })
      .catch(err => {
        // TODO: Display an error message
        console.error('Unable to choose a resource', err);
      });
  };

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
  };

  render() {
    const errorText = this.state.notExistingError
      ? 'This resource does not exist in the game'
      : null;

    return (
      <AutoComplete
        floatingLabelText={this.props.floatingLabelText || 'Select an image'}
        filter={fuzzyOrEmptyFilter}
        openOnFocus
        dataSource={this.autoCompleteData || []}
        onUpdateInput={this._onUpdate}
        onNewRequest={this._onItemChosen}
        errorText={errorText}
        searchText={this.state.resourceName}
        fullWidth={this.props.fullWidth}
        menuProps={{
          maxHeight: 250,
        }}
      />
    );
  }
}
