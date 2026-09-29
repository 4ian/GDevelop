// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import { I18n } from '@lingui/react';
import ResourcesList, { type ResourcesListInterface } from '../ResourcesList';
import ResourcePropertiesEditor, {
  type ResourcePropertiesEditorInterface,
} from './ResourcePropertiesEditor';
import Toolbar from './Toolbar';
import EditorMosaic, { type EditorMosaicInterface } from '../UI/EditorMosaic';
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire';
import AlertContext, { type ConfirmState } from '../UI/Alert/AlertContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  type ResourceManagementProps,
  type ResourceKind,
} from '../ResourcesList/ResourceSource';
import { type FileMetadata } from '../ProjectsStorage';
import { getResourceFilePathStatus } from '../ResourcesList/ResourceUtils';
import type { StorageProvider } from '../ProjectsStorage';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../MainFrame/ResourcesWatcher';
import { showWarningBox } from '../UI/Messages/MessageBox';

const gd: libGDevelop = global.gd;

// It's important to use remote and not electron for folder actions,
// otherwise they will be opened in the background.
// See https://github.com/electron/electron/issues/4349#issuecomment-777475765
const remote = optionalRequire('@electron/remote');
const shell = remote ? remote.shell : null;
const path = optionalRequire('path');
const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

type State = {|
  selectedResources: Array<gdResource>,
|};

type Props = {|
  setToolbar: React.Node => void,
  project: gdProject,
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,
  resourceManagementProps: ResourceManagementProps,
  fileMetadata: ?FileMetadata,
  storageProvider: StorageProvider,
|};

const initialMosaicEditorNodes = {
  direction: 'row',
  first: 'properties',
  second: 'resources-list',
  splitPercentage: 66,
};

export default class ResourcesEditor extends React.Component<Props, State> {
  static contextType: React.Context<ConfirmState> = AlertContext;
  // $FlowFixMe[missing-local-annot]
  static defaultProps = {
    setToolbar: () => {},
  };
  resourceExternallyChangedCallbackId: ?string;
  editorMosaic: ?EditorMosaicInterface = null;
  _propertiesEditor: ?ResourcePropertiesEditorInterface = null;
  _resourcesList: ?ResourcesListInterface = null;
  // $FlowFixMe[missing-local-annot]
  resourcesLoader = ResourcesLoader;
  state: State = {
    selectedResources: [],
  };

  componentDidMount() {
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
  }

  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
  }

  refreshResourcesList() {
    if (this._resourcesList) this._resourcesList.forceUpdateList();
  }

  updateToolbar = () => {
    const openedEditorNames = this.editorMosaic
      ? this.editorMosaic.getOpenedEditorNames()
      : [];

    this.props.setToolbar(
      <Toolbar
        onOpenProjectFolder={this.openProjectFolder}
        canOpenProjectFolder={
          !!remote &&
          !!this.props.fileMetadata &&
          this.props.storageProvider.internalName === 'LocalFile'
        }
        onToggleProperties={this.toggleProperties}
        isPropertiesShown={openedEditorNames.includes('properties')}
        canDelete={this.state.selectedResources.length > 0}
        onDeleteSelection={() =>
          this.deleteResources(this.state.selectedResources)
        }
      />
    );
  };

  deleteResources = async (resources: Array<gdResource>) => {
    const { project, onDeleteResource } = this.props;
    if (!resources.length) return;

    const resourcesCount = resources.length;
    const context: ConfirmState = this.context;
    const answer = await new Promise(resolve => {
      context.showConfirmDialog({
        title: resourcesCount > 1 ? t`Remove resources` : t`Remove resource`,
        message:
          resourcesCount > 1
            ? t`Are you sure you want to remove these ${resourcesCount} resources? This can't be undone.`
            : t`Are you sure you want to remove this resource? This can't be undone.`,
        callback: resolve,
      });
    });
    if (!answer) return;

    const resourcesManager = project.getResourcesManager();
    const firstRemovedIndex = Math.min(
      ...resources.map(resource =>
        resourcesManager.getResourcePosition(resource.getName())
      )
    );

    for (const resource of resources) {
      // Read the name before the removal, as the resource is destroyed by it.
      const resourceName = resource.getName();
      const doRemove = await new Promise(resolve =>
        onDeleteResource(resource, resolve)
      );
      if (doRemove) resourcesManager.removeResource(resourceName);
    }

    const newCount = resourcesManager.count();
    const nextResourceToSelect =
      newCount > 0
        ? resourcesManager.getResourceAt(
            Math.min(firstRemovedIndex, newCount - 1)
          )
        : null;

    this.setState(
      {
        selectedResources: nextResourceToSelect ? [nextResourceToSelect] : [],
      },
      () => {
        const resourcesList = this._resourcesList;
        if (resourcesList) {
          resourcesList.forceUpdateList();
          resourcesList.focusList();
        }
        const propertiesEditor = this._propertiesEditor;
        if (propertiesEditor) propertiesEditor.forceUpdate();
        this.updateToolbar();
      }
    );
  };

  renameResource = (resource: gdResource, newName: string) => {
    const { project, onRenameResource } = this.props;

    // Nothing to do if the name is not changed or empty.
    if (resource.getName() === newName || newName.length === 0) return;

    // Check for duplicate names.
    const resourcesManager = project.getResourcesManager();
    if (resourcesManager.hasResource(newName)) {
      showWarningBox('Another resource with this name already exists', {
        delayToNextTick: true,
      });
      return;
    }

    onRenameResource(resource, newName, doRename => {
      if (!doRename) return;

      resource.setName(newName);

      const resourcesList = this._resourcesList;
      if (resourcesList) {
        resourcesList.forceUpdateList();
        resourcesList.focusList();
      }
      const propertiesEditor = this._propertiesEditor;
      if (propertiesEditor) propertiesEditor.forceUpdate();
    });
  };

  _removeUnusedResources = (resourceKind: ResourceKind) => {
    const { project } = this.props;
    const selectedResourceNames = this.state.selectedResources.map(resource =>
      resource.getName()
    );

    const removedResourceNames = gd.ProjectResourcesAdder.getAllUseless(
      project,
      resourceKind
    ).toJSArray();
    console.info(
      `Removing ${
        removedResourceNames.length
      } unused ${resourceKind} resource(s):`,
      removedResourceNames
    );

    gd.ProjectResourcesAdder.removeAllUseless(project, resourceKind);

    this._dropRemovedResourcesFromSelection(
      selectedResourceNames,
      removedResourceNames
    );

    // Force update of the resources list as otherwise it could render
    // resources that were just deleted.
    if (this._resourcesList) {
      this._resourcesList.forceUpdateList();
    }
  };

  _removeAllResourcesWithInvalidPath = () => {
    const { project } = this.props;
    const selectedResourceNames = this.state.selectedResources.map(resource =>
      resource.getName()
    );

    const resourcesManager = project.getResourcesManager();
    const removedResourceNames = resourcesManager
      .getAllResourceNames()
      .toJSArray()
      .filter(resourceName => {
        return getResourceFilePathStatus(project, resourceName) === 'error';
      });

    removedResourceNames.forEach(resourceName => {
      resourcesManager.removeResource(resourceName);
      console.info('Removed due to invalid path: ' + resourceName);
    });

    this._dropRemovedResourcesFromSelection(
      selectedResourceNames,
      removedResourceNames
    );

    // Force update of the resources list as otherwise it could render
    // resources that were just deleted.
    if (this._resourcesList) {
      this._resourcesList.forceUpdateList();
    }
  };

  openProjectFolder = () => {
    if (shell)
      shell.openPath(path.dirname(this.props.project.getProjectFile()));
  };

  toggleProperties = () => {
    if (!this.editorMosaic) return;
    this.editorMosaic.toggleEditor('properties', 'left');
  };

  /**
   * Selected resources that were removed are now *invalid* (their memory
   * was freed). Drop them from the selection without accessing them.
   * `selectedResourceNames` must have been read before the removal.
   */
  _dropRemovedResourcesFromSelection = (
    selectedResourceNames: Array<string>,
    removedResourceNames: Array<string>
  ) => {
    const remainingSelectedResources = this.state.selectedResources.filter(
      (resource, index) =>
        !removedResourceNames.includes(selectedResourceNames[index])
    );
    if (
      remainingSelectedResources.length !== this.state.selectedResources.length
    ) {
      this._onResourcesSelected(remainingSelectedResources);
    }
  };

  _onResourcesSelected = (selectedResources: Array<gdResource>) => {
    this.setState(
      {
        selectedResources,
      },
      () => {
        if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
        this.updateToolbar();
      }
    );
  };

  onResourceExternallyChanged = (resourceInfo: {| identifier: string |}) => {
    if (this._propertiesEditor) {
      this._propertiesEditor.forceUpdate();
    }
    this.refreshResourcesList();
  };

  render(): any {
    const { project, resourceManagementProps, fileMetadata } = this.props;
    const { selectedResources } = this.state;
    const resourcesActionsMenuBuilder = resourceManagementProps.getStorageProviderResourceOperations();

    const editors = {
      properties: {
        type: 'secondary',
        title: t`Properties`,
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <ResourcePropertiesEditor
                key={selectedResources
                  .map(resource => '' + resource.ptr)
                  .join(';')}
                resources={selectedResources}
                project={project}
                resourcesLoader={this.resourcesLoader}
                ref={propertiesEditor =>
                  (this._propertiesEditor = propertiesEditor)
                }
                onResourcePathUpdated={() => {
                  if (this._resourcesList) {
                    this._resourcesList.checkMissingPaths();
                  }
                }}
                resourceManagementProps={resourceManagementProps}
                i18n={i18n}
              />
            )}
          </I18n>
        ),
      },
      'resources-list': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <ResourcesList
            project={project}
            fileMetadata={fileMetadata}
            onDeleteResources={this.deleteResources}
            onRenameResource={this.renameResource}
            onSelectResources={this._onResourcesSelected}
            selectedResources={selectedResources}
            ref={resourcesList => (this._resourcesList = resourcesList)}
            onRemoveUnusedResources={this._removeUnusedResources}
            onRemoveAllResourcesWithInvalidPath={
              this._removeAllResourcesWithInvalidPath
            }
            getResourceActionsSpecificToStorageProvider={
              resourcesActionsMenuBuilder
            }
          />
        ),
      },
    };

    return (
      <div style={styles.container}>
        <PreferencesContext.Consumer>
          {({ getDefaultEditorMosaicNode, setDefaultEditorMosaicNode }) => (
            <EditorMosaic
              // $FlowFixMe[incompatible-type]
              editors={editors}
              centralNodeId="resources-list"
              ref={editorMosaic => (this.editorMosaic = editorMosaic)}
              initialNodes={
                getDefaultEditorMosaicNode('resources-editor') ||
                // $FlowFixMe[incompatible-type]
                initialMosaicEditorNodes
              }
              onOpenedEditorsChanged={this.updateToolbar}
              onPersistNodes={node =>
                setDefaultEditorMosaicNode('resources-editor', node)
              }
            />
          )}
        </PreferencesContext.Consumer>
      </div>
    );
  }
}
