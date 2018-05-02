// @flow
import * as React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Add from 'material-ui/svg-icons/content/add';
import { fuzzyOrEmptyFilter } from '../Utils/FuzzyOrEmptyFilter';
import {
  type ResourceSource,
  type ChooseResourceFunction,
  type ResourceKind,
} from '../ResourcesList/ResourceSource.flow';
import { defaultAutocompleteProps } from '../UI/AutocompleteProps';

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceKind: ResourceKind,
  fullWidth?: boolean,
  initialResourceName: string,
  onChange: string => void,
  floatingLabelText?: string,
|};

type State = {|
  notExistingError: boolean,
  resourceName: string,
|};

type AutoCompleteItem =
  | {|
      text: string,
      value: React.Node,
      onClick?: () => void,
    |}
  | string;

const styles = {
  autoComplete: { minWidth: 300 },
};

export default class ResourceSelector extends React.Component<Props, State> {
  constructor(props: Props) {
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

  allResourcesNames: Array<string>;
  defaultItems: Array<AutoCompleteItem>;
  autoCompleteData: ?Array<AutoCompleteItem>;

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.initialResourceName !== this.props.initialResourceName) {
      this.setState({
        resourceName: nextProps.initialResourceName || '',
      });
    }
  }

  _getDefaultItems(): Array<AutoCompleteItem> {
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

  _loadFrom(resourcesManager: gdResourcesManager) {
    this.allResourcesNames = resourcesManager.getAllResourceNames().toJSArray();
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

  _addFrom = (source: ResourceSource) => {
    if (!source) return;

    const { project, onChooseResource } = this.props;
    onChooseResource(source.name, false)
      .then(resources => {
        if (!resources.length) return;
        const resource = resources[0];

        // addResource will check if a resource with the same name exists, and if it is
        // the case, no new resource will be added.
        project.getResourcesManager().addResource(resource);

        this._loadFrom(project.getResourcesManager());
        this._onUpdate(resource.getName());
      })
      .catch(err => {
        // TODO: Display an error message
        console.error('Unable to choose a resource', err);
      });
  };

  _onUpdate = (searchText: string) => {
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

    // We're now sure that onClick is defined
    // $FlowFixMe
    const onClick = this.defaultItems[index].onClick;
    if (onClick) onClick();
  };

  render() {
    const errorText = this.state.notExistingError
      ? 'This resource does not exist in the game'
      : null;

    return (
      <AutoComplete
        {...defaultAutocompleteProps}
        floatingLabelText={this.props.floatingLabelText || 'Select an image'}
        filter={fuzzyOrEmptyFilter}
        openOnFocus
        dataSource={this.autoCompleteData || []}
        onUpdateInput={this._onUpdate}
        onNewRequest={this._onItemChosen}
        errorText={errorText}
        searchText={this.state.resourceName}
        fullWidth={this.props.fullWidth}
        style={styles.autoComplete}
      />
    );
  }
}
