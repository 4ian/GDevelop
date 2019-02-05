// @flow
import * as React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import Add from 'material-ui/svg-icons/content/add';
import Brush from 'material-ui/svg-icons/image/brush';
import {
  type ResourceSource,
  type ChooseResourceFunction,
  type ResourceKind,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import IconMenu from '../UI/Menu/IconMenu';
import ResourcesLoader from '../ResourcesLoader';
import { defaultAutocompleteProps } from '../UI/AutocompleteProps';

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  resourcesLoader: typeof ResourcesLoader,
  resourceKind: ResourceKind,
  fullWidth?: boolean,
  initialResourceName: string,
  onChange: string => void,
  floatingLabelText?: React.Node,
  hintText?: React.Node,
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
  container: { display: 'flex', flex: 1, alignItems: 'baseline' },
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
  _autoComplete: ?AutoComplete;

  focus() {
    if (this._autoComplete) this._autoComplete.focus();
  }

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

        // Keep focusing the field after choosing something (won't do anything
        // if we're just typing text).
        this.focus();
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

  _editWith = (resourceExternalEditor: ResourceExternalEditor) => {
    const { project, resourcesLoader, resourceKind } = this.props;
    const { resourceName } = this.state;
    const resourcesManager = project.getResourcesManager();
    const initialResource = resourcesManager.getResource(resourceName);

    let initialResourceMetadata = {};
    const initialResourceMetadataRaw = initialResource.getMetadata();
    if (initialResourceMetadataRaw) {
      try {
        initialResourceMetadata = JSON.parse(initialResourceMetadataRaw);
      } catch (e) {
        console.error('Malformed metadata', e);
      }
    }

    if (resourceKind === 'image') {
      const resourceNames = [];
      if (resourcesManager.hasResource(resourceName)) {
        resourceNames.push(resourceName);
      }
      const externalEditorOptions = {
        project,
        resourcesLoader,
        singleFrame: true,
        resourceNames,
        extraOptions: {
          fps: 0,
          name: resourceName,
          isLooping: false,
          externalEditorData: initialResourceMetadata,
        },
        onChangesSaved: resources => {
          if (!resources.length) return;

          // Burst the ResourcesLoader cache to force images to be reloaded (and not cached by the browser).
          resourcesLoader.burstUrlsCacheForResources(project, [
            resources[0].name,
          ]);
          this.props.onChange(resources[0].name);
        },
      };
      resourceExternalEditor.edit(externalEditorOptions);
    } else if (resourceKind === 'audio') {
      const externalEditorOptions = {
        project,
        resourcesLoader,
        resourceNames: [resourceName],
        extraOptions: {
          initialResourceMetadata,
        },
        onChangesSaved: (newResourceData, newResourceName) => {
          // Burst the ResourcesLoader cache to force audio to be reloaded (and not cached by the browser).
          resourcesLoader.burstUrlsCacheForResources(project, [
            newResourceName,
          ]);
          this.props.onChange(newResourceName);
        },
      };
      resourceExternalEditor.edit(externalEditorOptions);
    }
  };

  render() {
    const errorText = this.state.notExistingError
      ? 'This resource does not exist in the game'
      : null;

    const externalEditors = this.props.resourceExternalEditors.filter(
      externalEditor => externalEditor.kind === this.props.resourceKind
    );

    return (
      <div style={styles.container}>
        <AutoComplete
          {...defaultAutocompleteProps}
          floatingLabelText={this.props.floatingLabelText}
          hintText={this.props.hintText}
          openOnFocus
          dataSource={this.autoCompleteData || []}
          onUpdateInput={this._onUpdate}
          onNewRequest={this._onItemChosen}
          errorText={errorText}
          searchText={this.state.resourceName}
          fullWidth={this.props.fullWidth}
          style={styles.autoComplete}
          ref={autoComplete => (this._autoComplete = autoComplete)}
        />
        {!!externalEditors.length && (
          <IconMenu
            iconButtonElement={
              <IconButton>
                <Brush />
              </IconButton>
            }
            buildMenuTemplate={() =>
              externalEditors.map(externalEditor => ({
                label: externalEditor.displayName,
                click: () => this._editWith(externalEditor),
              }))
            }
          />
        )}
      </div>
    );
  }
}
