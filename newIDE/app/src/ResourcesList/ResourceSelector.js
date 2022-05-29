// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import SemiControlledAutoComplete, {
  type DataSource,
  type SemiControlledAutoCompleteInterface,
} from '../UI/SemiControlledAutoComplete';
import BackspaceIcon from '@material-ui/icons/Backspace';
import Add from '@material-ui/icons/Add';
import Brush from '@material-ui/icons/Brush';
import {
  type ResourceSource,
  type ChooseResourceFunction,
  type ResourceKind,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import ResourcesLoader from '../ResourcesLoader';
import { applyResourceDefaults } from './ResourceUtils';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import RaisedButtonWithMenu from '../UI/RaisedButtonWithMenu';
import { TextFieldWithButtonLayout } from '../UI/Layout';
import IconButton from '../UI/IconButton';

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  resourcesLoader: typeof ResourcesLoader,
  resourceKind: ResourceKind,
  fullWidth?: boolean,
  canBeReset?: boolean,
  initialResourceName: string,
  onChange: string => void,
  floatingLabelText?: React.Node,
  helperMarkdownText?: ?string,
  hintText?: MessageDescriptor,
  onRequestClose?: () => void,
  onApply?: () => void,
  margin?: 'none' | 'dense',
  style?: {| alignSelf?: 'center' |},
|};

type State = {|
  notExistingError: boolean,
  resourceName: string,
|};

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
  autoCompleteData: DataSource;
  _autoComplete: ?SemiControlledAutoCompleteInterface;

  focus(selectAll: boolean = false) {
    if (this._autoComplete) this._autoComplete.focus(selectAll);
  }

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.initialResourceName !== this.props.initialResourceName) {
      this.setState({
        resourceName: nextProps.initialResourceName || '',
      });
    }
  }

  _getResourceSourceItems(): DataSource {
    const sources = this.props.resourceSources || [];
    return [
      ...sources
        .filter(source => source.kind === this.props.resourceKind)
        .map(source => ({
          text: '',
          value: '',
          translatableValue: source.displayName,
          renderIcon: () => <Add />,
          onClick: () => this._addFrom(source),
        })),
      {
        type: 'separator',
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
    const resourceSourceItems = this._getResourceSourceItems();
    const resourceItems = this.allResourcesNames.map(resourceName => ({
      text: resourceName,
      value: resourceName,
    }));
    this.autoCompleteData = [...resourceSourceItems, ...resourceItems];
  }

  _addFrom = (source: ResourceSource) => {
    if (!source) return;

    const { project, onChooseResource } = this.props;
    onChooseResource({
      initialSourceName: source.name,
      multiSelection: false,
      resourceKind: this.props.resourceKind,
    })
      .then(resources => {
        if (!resources.length) return;
        const resource = resources[0];
        applyResourceDefaults(project, resource);

        // addResource will check if a resource with the same name exists, and if it is
        // the case, no new resource will be added.
        project.getResourcesManager().addResource(resource);

        this._loadFrom(project.getResourcesManager());
        const resourceName: string = resource.getName();
        this._onChangeResourceName(resourceName);

        // Imperatively set the value of the autocomplete, as it can be (on Windows for example),
        // still focused. This means that when it's then getting blurred, the value we
        // set for the resource name would get erased by the one that was getting entered.
        if (this._autoComplete)
          this._autoComplete.forceInputValueTo(resourceName);

        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
        resources.forEach(resource => resource.delete());
      })
      .catch(err => {
        // Should never happen, errors should be shown in the interface.
        console.error('Unable to choose a resource', err);
      });
  };

  _onResetResourceName = () => {
    this.setState(
      {
        resourceName: '',
        notExistingError: false,
      },
      () => {
        if (this.props.onChange) this.props.onChange(this.state.resourceName);
      }
    );
  };

  _onChangeResourceName = (resourceName: string) => {
    if (resourceName === '') {
      this._onResetResourceName();
      return;
    }

    const notExistingError =
      this.allResourcesNames.indexOf(resourceName) === -1;

    if (!notExistingError) {
      if (this.props.onChange) this.props.onChange(resourceName);
    }
    this.setState({
      resourceName,
      notExistingError,
    });
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
        onChangesSaved: newResourceData => {
          if (!newResourceData.length) return;

          // Burst the ResourcesLoader cache to force images to be reloaded (and not cached by the browser).
          resourcesLoader.burstUrlsCacheForResources(project, [
            newResourceData[0].name,
          ]);
          this.props.onChange(newResourceData[0].name);
        },
      };
      resourceExternalEditor.edit(externalEditorOptions);
    } else if (resourceKind === 'audio') {
      const externalEditorOptions = {
        project,
        resourcesLoader,
        resourceNames: [resourceName],
        extraOptions: {
          externalEditorData: initialResourceMetadata,
        },
        onChangesSaved: newResourceData => {
          // Burst the ResourcesLoader cache to force audio to be reloaded (and not cached by the browser).
          resourcesLoader.burstUrlsCacheForResources(project, [
            newResourceData[0].name,
          ]);
          this.props.onChange(newResourceData[0].name);
        },
      };
      resourceExternalEditor.edit(externalEditorOptions);
    } else if (resourceKind === 'json') {
      const externalEditorOptions = {
        project,
        resourcesLoader,
        resourceNames: [resourceName],
        extraOptions: {
          initialResourceMetadata,
        },
        onChangesSaved: newResourceData => {
          this.props.onChange(newResourceData[0].name);
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
      <TextFieldWithButtonLayout
        noFloatingLabelText={!this.props.floatingLabelText}
        margin={this.props.margin}
        renderTextField={() => (
          <SemiControlledAutoComplete
            style={this.props.style}
            floatingLabelText={this.props.floatingLabelText}
            helperMarkdownText={this.props.helperMarkdownText}
            hintText={this.props.hintText}
            openOnFocus
            dataSource={this.autoCompleteData || []}
            value={this.state.resourceName}
            onChange={this._onChangeResourceName}
            errorText={errorText}
            fullWidth={this.props.fullWidth}
            margin={this.props.margin}
            onRequestClose={this.props.onRequestClose}
            onApply={this.props.onApply}
            ref={autoComplete => (this._autoComplete = autoComplete)}
          />
        )}
        renderButton={style => (
          <React.Fragment>
            {this.props.canBeReset && (
              <IconButton
                size="small"
                onClick={() => {
                  this._onResetResourceName();
                }}
              >
                <BackspaceIcon />
              </IconButton>
            )}
            {!!externalEditors.length ? (
              <RaisedButtonWithMenu
                style={style}
                icon={<Brush />}
                label={
                  this.state.resourceName ? (
                    <Trans>Edit</Trans>
                  ) : (
                    <Trans>Create</Trans>
                  )
                }
                primary
                buildMenuTemplate={() =>
                  externalEditors.map(externalEditor => ({
                    label: externalEditor.displayName,
                    click: () => this._editWith(externalEditor),
                  }))
                }
              />
            ) : null}
          </React.Fragment>
        )}
      />
    );
  }
}
