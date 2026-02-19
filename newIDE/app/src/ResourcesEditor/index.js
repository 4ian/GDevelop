// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import ResourcesList, { type ResourcesListInterface } from '../ResourcesList';
import ResourcePropertiesEditor, {
  type ResourcePropertiesEditorInterface,
} from './ResourcePropertiesEditor';
import Toolbar from './Toolbar';
import EditorMosaic, { type EditorMosaicInterface } from '../UI/EditorMosaic';
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
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
  selectedResource: ?gdResource,
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
  // $FlowFixMe[missing-local-annot]
  state = {
    selectedResource: null,
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
        canDelete={!!this.state.selectedResource}
        onDeleteSelection={() =>
          this.deleteResource(this.state.selectedResource)
        }
      />
    );
  };

  deleteResource = (resource: ?gdResource) => {
    const { project, onDeleteResource } = this.props;
    if (!resource) return;

    const answer = Window.showConfirmDialog(
      "Are you sure you want to remove this resource? This can't be undone."
    );
    if (!answer) return;

    const resourcesManager = project.getResourcesManager();
    const currentIndex = resourcesManager.getResourcePosition(
      resource.getName()
    );

    onDeleteResource(resource, doRemove => {
      if (!doRemove || !resource) return;

      resourcesManager.removeResource(resource.getName());

      const newCount = resourcesManager.count();
      const nextResourceToSelect =
        newCount > 0
          ? resourcesManager.getResourceAt(Math.min(currentIndex, newCount - 1))
          : null;

      this.setState(
        {
          selectedResource: nextResourceToSelect,
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
    });
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
    const selectedResourceName = this.state.selectedResource
      ? this.state.selectedResource.getName()
      : null;

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

    // The selectedResource might be *invalid* now if it was removed.
    // Be sure to drop the reference to it if that's the case.
    // $FlowFixMe[incompatible-type]
    if (removedResourceNames.includes(selectedResourceName)) {
      this._onResourceSelected(null);
    }

    // Force update of the resources list as otherwise it could render
    // resources that were just deleted.
    if (this._resourcesList) {
      this._resourcesList.forceUpdateList();
    }
  };

  _removeAllResourcesWithInvalidPath = () => {
    const { project } = this.props;
    const selectedResourceName = this.state.selectedResource
      ? this.state.selectedResource.getName()
      : null;

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

    // The selectedResource might be *invalid* now if it was removed.
    // Be sure to drop the reference to it if that's the case.
    // $FlowFixMe[incompatible-type]
    if (removedResourceNames.includes(selectedResourceName)) {
      this._onResourceSelected(null);
    }

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

  _onResourceSelected = (selectedResource: ?gdResource) => {
    this.setState(
      {
        selectedResource,
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
    const {
      project,
      onRenameResource,
      resourceManagementProps,
      fileMetadata,
    } = this.props;
    const { selectedResource } = this.state;
    const resourcesActionsMenuBuilder = resourceManagementProps.getStorageProviderResourceOperations();

    const editors = {
      properties: {
        type: 'secondary',
        title: t`Properties`,
        renderEditor: () => (
          <ResourcePropertiesEditor
            key={selectedResource ? selectedResource.ptr : undefined}
            resources={selectedResource ? [selectedResource] : []}
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
          />
        ),
      },
      'resources-list': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <ResourcesList
            project={project}
            fileMetadata={fileMetadata}
            onDeleteResource={this.deleteResource}
            onRenameResource={this.renameResource}
            onSelectResource={this._onResourceSelected}
            selectedResource={selectedResource}
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
