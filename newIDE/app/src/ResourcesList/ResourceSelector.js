// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import SemiControlledAutoComplete, {
  type DataSource,
  type SemiControlledAutoCompleteInterface,
} from '../UI/SemiControlledAutoComplete';
import {
  type ResourceSource,
  type ResourceManagementProps,
  type ResourceKind,
} from '../ResourcesList/ResourceSource';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor';
import ResourcesLoader from '../ResourcesLoader';
import { applyResourceDefaults } from './ResourceUtils';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import FlatButtonWithSplitMenu from '../UI/FlatButtonWithSplitMenu';
import { LineStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import IconButton from '../UI/IconButton';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import { Column } from '../UI/Grid';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { ExternalEditorOpenedDialog } from '../UI/ExternalEditorOpenedDialog';
import Add from '../UI/CustomSvgIcons/Add';
import Edit from '../UI/CustomSvgIcons/Edit';
import Cross from '../UI/CustomSvgIcons/Cross';

const styles = {
  textFieldStyle: { display: 'flex', flex: 1 },
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  resourcesLoader: typeof ResourcesLoader,
  resourceKind: ResourceKind,
  fallbackResourceKind?: ?ResourceKind,
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
  id?: string,
|};

type State = {|
  notExistingError: boolean,
  resourceName: string,
  externalEditorOpened: boolean,
|};

export default class ResourceSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      notExistingError: false,
      resourceName: props.initialResourceName || '',
      externalEditorOpened: false,
    };

    const { project } = props;
    if (project) {
      this._loadFrom(project.getResourcesManager());
    }
  }

  allResourcesNames: Array<string>;
  autoCompleteData: DataSource;
  _autoComplete: ?SemiControlledAutoCompleteInterface;

  focus: FieldFocusFunction = options => {
    if (this._autoComplete) this._autoComplete.focus(options);
  };

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.initialResourceName !== this.props.initialResourceName) {
      this.setState({
        resourceName: nextProps.initialResourceName || '',
      });
    }
  }

  _getResourceSourceItems(): DataSource {
    const { resourceManagementProps } = this.props;
    const sources = resourceManagementProps.resourceSources || [];
    const storageProvider = resourceManagementProps.getStorageProvider();

    return [
      ...sources
        .filter(source => source.kind === this.props.resourceKind)
        .filter(
          ({ onlyForStorageProvider }) =>
            !onlyForStorageProvider ||
            onlyForStorageProvider === storageProvider.internalName
        )
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
      const mainResourcesNames = this.allResourcesNames.filter(resourceName => {
        return (
          resourcesManager.getResource(resourceName).getKind() ===
          this.props.resourceKind
        );
      });

      if (this.props.fallbackResourceKind) {
        mainResourcesNames.push(
          ...this.allResourcesNames.filter(resourceName => {
            return (
              resourcesManager.getResource(resourceName).getKind() ===
              this.props.fallbackResourceKind
            );
          })
        );
      }

      this.allResourcesNames = mainResourcesNames;
    }
    const resourceSourceItems = this._getResourceSourceItems();
    const resourceItems = this.allResourcesNames.map(resourceName => ({
      text: resourceName,
      value: resourceName,
    }));
    this.autoCompleteData = [...resourceSourceItems, ...resourceItems];
  }

  _addFrom = async (source: ResourceSource) => {
    try {
      if (!source) return;

      const { project, resourceManagementProps } = this.props;
      const resources = await resourceManagementProps.onChooseResource({
        initialSourceName: source.name,
        multiSelection: false,
        resourceKind: this.props.resourceKind,
      });

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

      await resourceManagementProps.onFetchNewlyAddedResources();
    } catch (err) {
      // Should never happen, errors should be shown in the interface.
      console.error('Unable to choose a resource', err);
    }
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

  _editWith = async (
    i18n: I18nType,
    resourceExternalEditor: ResourceExternalEditor
  ) => {
    const { project, resourcesLoader, resourceManagementProps } = this.props;
    const { resourceName } = this.state;
    const resourcesManager = project.getResourcesManager();
    const initialResource = resourcesManager.getResource(resourceName);

    try {
      this.setState({ externalEditorOpened: true });
      const editResult = await resourceExternalEditor.edit({
        project,
        i18n,
        getStorageProvider: resourceManagementProps.getStorageProvider,
        resourceManagementProps,
        resourceNames: [resourceName],
        extraOptions: {
          existingMetadata: initialResource.getMetadata(),

          // Only useful for images:
          singleFrame: true,
          fps: 0,
          name: resourceName,
          isLooping: false,
        },
      });

      this.setState({ externalEditorOpened: false });
      if (!editResult) return;

      const { resources } = editResult;
      if (!resources.length) return;

      // Burst the ResourcesLoader cache to force the file to be reloaded (and not cached by the browser).
      resourcesLoader.burstUrlsCacheForResources(project, [resources[0].name]);

      this.props.onChange(resources[0].name);
      this._loadFrom(resourcesManager);
      this.forceUpdate();
    } catch (error) {
      this.setState({ externalEditorOpened: false });
      console.error(
        'An exception was thrown when launching or reading resources from the external editor:',
        error
      );
      showErrorBox({
        message: `There was an error while using the external editor. Try with another resource and if this persists, please report this as a bug.`,
        rawError: error,
        errorId: 'external-editor-error',
      });
    }
  };

  render() {
    const errorText = this.state.notExistingError ? (
      <Trans>This resource does not exist in the game</Trans>
    ) : null;

    const externalEditors = this.props.resourceManagementProps.resourceExternalEditors.filter(
      externalEditor => externalEditor.kind === this.props.resourceKind
    );
    return (
      <I18n>
        {({ i18n }) => (
          <ResponsiveLineStackLayout noMargin expand alignItems="center">
            <Column expand noMargin>
              <LineStackLayout expand noMargin>
                <SemiControlledAutoComplete
                  style={this.props.style}
                  textFieldStyle={styles.textFieldStyle}
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
                  id={this.props.id}
                />
                {this.props.canBeReset && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      this._onResetResourceName();
                    }}
                  >
                    <Cross />
                  </IconButton>
                )}
              </LineStackLayout>
            </Column>
            <RaisedButton
              label={
                this.state.resourceName ? (
                  <Trans>Replace</Trans>
                ) : (
                  <Trans>Choose a file</Trans>
                )
              }
              onClick={() => {
                this._autoComplete && this._autoComplete.focus();
              }}
              primary
            />
            {externalEditors.length === 1 && (
              <FlatButton
                leftIcon={<Edit fontSize="small" />}
                label={i18n._(
                  this.state.resourceName
                    ? externalEditors[0].editDisplayName
                    : externalEditors[0].createDisplayName
                )}
                onClick={() => this._editWith(i18n, externalEditors[0])}
              />
            )}
            {externalEditors.length > 1 ? (
              <FlatButtonWithSplitMenu
                icon={<Edit fontSize="small" />}
                label={i18n._(
                  this.state.resourceName
                    ? externalEditors[0].editDisplayName
                    : externalEditors[0].createDisplayName
                )}
                onClick={() => this._editWith(i18n, externalEditors[0])}
                buildMenuTemplate={(i18n: I18nType) =>
                  externalEditors.map(externalEditor => ({
                    label: i18n._(
                      this.state.resourceName
                        ? externalEditor.editDisplayName
                        : externalEditor.createDisplayName
                    ),
                    click: () => this._editWith(i18n, externalEditor),
                  }))
                }
              />
            ) : null}
            {this.state.externalEditorOpened && <ExternalEditorOpenedDialog />}
          </ResponsiveLineStackLayout>
        )}
      </I18n>
    );
  }
}
