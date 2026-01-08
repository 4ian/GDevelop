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
  static defaultProps = {
    setToolbar: () => {},
  };
  resourceExternallyChangedCallbackId: ?string;
  editorMosaic: ?EditorMosaicInterface = null;
  _propertiesEditor: ?ResourcePropertiesEditorInterface = null;
  _resourcesList: ?ResourcesListInterface = null;
  resourcesLoader = ResourcesLoader;
  state = {
    selectedResource: null,
  };

  componentDidMount() {
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
    window.addEventListener('keydown', this._onKeyDown);
  }

  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
    window.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown = (event: KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this._moveSelection(event.key === 'ArrowDown' ? 1 : -1);
      event.preventDefault();
    }
  };

  _moveSelection = (delta: number) => {
    const { project } = this.props;
    const { selectedResource } = this.state;
    const resourcesManager = project.getResourcesManager();
    const allNames = resourcesManager.getAllResourceNames().toJSArray();

    if (allNames.length === 0) return;

    let nextIndex = 0;
    if (selectedResource) {
      const currentIndex = allNames.indexOf(selectedResource.getName());
      nextIndex = Math.max(
        0,
        Math.min(allNames.length - 1, currentIndex + delta)
      );
    }

    const nextResource = resourcesManager.getResource(allNames[nextIndex]);
    if (nextResource !== selectedResource) {
      this._onResourceSelected(nextResource);
    }
  };

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
    const allNames = resourcesManager.getAllResourceNames().toJSArray();
    const currentIndex = allNames.indexOf(resource.getName());

    let nextResourceName = null;
    if (allNames.length > 1) {
      const nextIndex =
        currentIndex < allNames.length - 1
          ? currentIndex + 1
          : currentIndex - 1;
      nextResourceName = allNames[nextIndex];
    }

    onDeleteResource(resource, doRemove => {
      if (!doRemove || !resource) return;

      resourcesManager.removeResource(resource.getName());

      const nextResourceToSelect = nextResourceName
        ? resourcesManager.getResource(nextResourceName)
        : null;

      this.setState(
        {
          selectedResource: nextResourceToSelect,
        },
        () => {
          if (this._resourcesList) {
            this._resourcesList.forceUpdateList();
            if (this._resourcesList.focus) this._resourcesList.focus();
          }
          if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
          this.updateToolbar();
        }
      );
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

  render() {
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
            onRenameResource={onRenameResource}
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
            onResourceRenamed={() => {
              if (this._propertiesEditor) {
                this._propertiesEditor.forceUpdate();
              }
            }}
          />
        ),
      },
    };

    return (
      <div style={styles.container}>
        <PreferencesContext.Consumer>
          {({ getDefaultEditorMosaicNode, setDefaultEditorMosaicNode }) => (
            <EditorMosaic
              editors={editors}
              centralNodeId="resources-list"
              ref={editorMosaic => (this.editorMosaic = editorMosaic)}
              initialNodes={
                getDefaultEditorMosaicNode('resources-editor') ||
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
