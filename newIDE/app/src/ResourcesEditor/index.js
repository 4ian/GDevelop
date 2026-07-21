// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import { I18n } from '@lingui/react';
import ResourcePropertiesEditor, {
  type ResourcePropertiesEditorInterface,
} from './ResourcePropertiesEditor';
import FilePropertiesPanel from './FilePropertiesPanel';
import ProjectFilesPanel, {
  findNodeByAbsolutePath,
  findNodeById,
  getResourceFromNode,
  type ProjectFilesPanelInterface,
  type ProjectFileNode,
  type ProjectFileSelection,
} from './ProjectFilesPanel';
import WorkingDesk from './WorkingDesk';
import ToolsPanel from './ToolsPanel';
import Toolbar from './Toolbar';
import { type WorkingDeskToolTabUpdate } from './WorkingDeskTabTypes';
import ResourcesLoader from '../ResourcesLoader';
import AlertContext, { type ConfirmState } from '../UI/Alert/AlertContext';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  type ResourceManagementProps,
  type ResourceKind,
} from '../ResourcesList/ResourceSource';
import { type FileMetadata } from '../ProjectsStorage';
import {
  getResourceFilePathStatus,
  removeAllUnusedResources,
  removeUnusedResources,
} from '../ResourcesList/ResourceUtils';
import type { StorageProvider } from '../ProjectsStorage';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../MainFrame/ResourcesWatcher';
import { showWarningBox } from '../UI/Messages/MessageBox';

const layoutStorageKey = 'gdevelop.resourcesEditor.layout.v1';
const minWorkingDeskHeight = 220;
const minProjectFilesHeight = 150;
const minToolsWidth = 300;
const resizeHandleSize = 6;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getPersistedLayout = (): {|
  workingDeskHeight: number,
  toolsWidth: number,
|} => {
  try {
    const serializedLayout = window.localStorage.getItem(layoutStorageKey);
    if (!serializedLayout) {
      return { workingDeskHeight: 420, toolsWidth: 380 };
    }
    const layout = JSON.parse(serializedLayout);
    return {
      workingDeskHeight:
        typeof layout.workingDeskHeight === 'number'
          ? layout.workingDeskHeight
          : 420,
      toolsWidth:
        typeof layout.toolsWidth === 'number' ? layout.toolsWidth : 380,
    };
  } catch (error) {
    return { workingDeskHeight: 420, toolsWidth: 380 };
  }
};

const persistLayout = ({
  workingDeskHeight,
  toolsWidth,
}: {|
  workingDeskHeight: number,
  toolsWidth: number,
|}) => {
  try {
    window.localStorage.setItem(
      layoutStorageKey,
      JSON.stringify({ workingDeskHeight, toolsWidth })
    );
  } catch (error) {
    // Ignore local storage errors.
  }
};

const getResizeEventDocument = (
  event: SyntheticMouseEvent<HTMLDivElement>
): Document =>
  event.currentTarget.ownerDocument
    ? event.currentTarget.ownerDocument
    : document;

const initialLayout: {|
  workingDeskHeight: number,
  toolsWidth: number,
|} = getPersistedLayout();

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mainColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  workingDeskPane: {
    display: 'flex',
    // The preferred height is kept in the layout state, but this pane must be
    // able to shrink when the editor is displayed in a shorter window.
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  horizontalResizeHandle: {
    flex: `0 0 ${resizeHandleSize}px`,
    boxSizing: 'border-box',
    cursor: 'ns-resize',
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderTop: '1px solid rgba(128, 128, 128, 0.2)',
    borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
    position: 'relative',
    zIndex: 2,
  },
  projectFilesPane: {
    display: 'flex',
    flex: 1,
    minHeight: minProjectFilesHeight,
    minWidth: 0,
    overflow: 'hidden',
  },
  verticalResizeHandle: {
    flex: `0 0 ${resizeHandleSize}px`,
    boxSizing: 'border-box',
    cursor: 'ew-resize',
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderLeft: '1px solid rgba(128, 128, 128, 0.2)',
    borderRight: '1px solid rgba(128, 128, 128, 0.2)',
    position: 'relative',
    zIndex: 2,
  },
  toolsPane: {
    display: 'flex',
    minWidth: minToolsWidth,
    overflow: 'hidden',
  },
};

type State = {|
  selectedResource: ?gdResource,
  selectedProjectFile: ?ProjectFileSelection,
  propertiesDialogSelection: ?ProjectFileSelection,
  workingDeskToolTabUpdate: ?WorkingDeskToolTabUpdate,
  isPropertiesShown: boolean,
  workingDeskHeight: number,
  toolsWidth: number,
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

export type ResourcesEditorProjectFileSelectionSnapshot = {|
  id: string,
  name: string,
  absolutePath: string,
  relativePath: string,
  type: 'folder' | 'file',
  extension: string,
  resourceName: ?string,
  resourceKind: ?string,
|};

export type ResourcesEditorResourceSelectionSnapshot = {|
  name: string,
  kind: string,
  file: string,
|};

export type ResourcesEditorSelectionSnapshot = {|
  selectionProvider: 'ResourcesEditor',
  isActive?: boolean,
  selectedProjectFile: ?ResourcesEditorProjectFileSelectionSnapshot,
  selectedResource: ?ResourcesEditorResourceSelectionSnapshot,
|};

const serializeProjectFileNodeForSelection = (
  node: ProjectFileNode
): ResourcesEditorProjectFileSelectionSnapshot => ({
  id: node.id,
  name: node.name,
  absolutePath: node.absolutePath,
  relativePath: node.relativePath,
  type: node.type,
  extension: node.extension,
  resourceName: node.resourceName || null,
  resourceKind: node.resourceKind || null,
});

const serializeResourceForSelection = (
  resource: ?gdResource
): ?ResourcesEditorResourceSelectionSnapshot =>
  resource
    ? {
        name: resource.getName(),
        kind: resource.getKind(),
        file: resource.getFile(),
      }
    : null;

export default class ResourcesEditor extends React.Component<Props, State> {
  static contextType: React.Context<ConfirmState> = AlertContext;
  // $FlowFixMe[missing-local-annot]
  static defaultProps = {
    setToolbar: () => {},
  };
  resourceExternallyChangedCallbackId: ?string;
  _propertiesEditor: ?ResourcePropertiesEditorInterface = null;
  _projectFilesPanel: ?ProjectFilesPanelInterface = null;
  _container: ?HTMLDivElement = null;
  _mainColumn: ?HTMLDivElement = null;
  // $FlowFixMe[missing-local-annot]
  resourcesLoader = ResourcesLoader;
  state: State = {
    selectedResource: null,
    selectedProjectFile: null,
    propertiesDialogSelection: null,
    workingDeskToolTabUpdate: null,
    isPropertiesShown: false,
    workingDeskHeight: initialLayout.workingDeskHeight,
    toolsWidth: initialLayout.toolsWidth,
  };

  componentDidMount() {
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
    this.updateToolbar();
  }

  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
  }

  refreshResourcesList = async (): Promise<void> => {
    if (!this._projectFilesPanel) return;
    await this._projectFilesPanel.refresh();
  };

  refreshResourcesListAndRemoveUnusedResources = async (): Promise<void> => {
    this._removeUnusedResourcesFromProject();
    await this.refreshResourcesList();
  };

  getEditorSelectionSnapshot(): ResourcesEditorSelectionSnapshot {
    const { selectedProjectFile } = this.state;

    return {
      selectionProvider: 'ResourcesEditor',
      selectedProjectFile: selectedProjectFile
        ? serializeProjectFileNodeForSelection(selectedProjectFile.node)
        : null,
      selectedResource: selectedProjectFile
        ? serializeResourceForSelection(selectedProjectFile.resource)
        : null,
    };
  }

  updateToolbar = () => {
    this.props.setToolbar(
      <Toolbar
        onToggleProperties={this.toggleProperties}
        isPropertiesShown={this.state.isPropertiesShown}
      />
    );
  };

  _updateSelectedProjectFileFromRootNode = (rootNode: ProjectFileNode) => {
    const { project } = this.props;
    const { selectedProjectFile } = this.state;
    if (!selectedProjectFile) return;

    const refreshedNode =
      findNodeById(rootNode, selectedProjectFile.node.id) ||
      findNodeByAbsolutePath(rootNode, selectedProjectFile.node.absolutePath);
    if (!refreshedNode) {
      this.setState(
        {
          selectedResource: null,
          selectedProjectFile: null,
        },
        () => {
          if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
          this.updateToolbar();
        }
      );
      return;
    }

    const refreshedResource = getResourceFromNode(project, refreshedNode);
    this.setState(
      {
        selectedProjectFile: {
          node: refreshedNode,
          resource: refreshedResource,
        },
        selectedResource: refreshedResource,
      },
      () => {
        if (this._propertiesEditor) this._propertiesEditor.forceUpdate();
        this.updateToolbar();
      }
    );
  };

  deleteResource = async (resource: ?gdResource) => {
    const { project, onDeleteResource } = this.props;
    if (!resource) return;

    const context: ConfirmState = this.context;
    const answer = await new Promise(resolve => {
      context.showConfirmDialog({
        title: t`Remove resource`,
        message: t`Are you sure you want to remove this resource? This can't be undone.`,
        callback: resolve,
      });
    });
    if (!answer) return;

    const resourcesManager = project.getResourcesManager();

    onDeleteResource(resource, doRemove => {
      if (!doRemove || !resource) return;

      resourcesManager.removeResource(resource.getName());

      this.setState(
        {
          selectedResource: null,
          selectedProjectFile: this.state.selectedProjectFile
            ? {
                node: this.state.selectedProjectFile.node,
                resource: null,
              }
            : null,
        },
        () => {
          this.refreshResourcesList();
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

      this.refreshResourcesList();
      const propertiesEditor = this._propertiesEditor;
      if (propertiesEditor) propertiesEditor.forceUpdate();
    });
  };

  _removeUnusedResourcesFromProject = (
    resourceKind?: ResourceKind
  ): Array<string> => {
    const { project, resourceManagementProps } = this.props;
    const selectedResourceName = this.state.selectedResource
      ? this.state.selectedResource.getName()
      : null;

    const removedResourceNames = resourceKind
      ? removeUnusedResources(project, resourceKind)
      : removeAllUnusedResources(project);
    if (!removedResourceNames.length) return removedResourceNames;

    console.info('Removing unused resource(s):', removedResourceNames);

    // The selectedResource might be *invalid* now if it was removed.
    // Be sure to drop the reference to it if that's the case.
    // $FlowFixMe[incompatible-type]
    if (removedResourceNames.includes(selectedResourceName)) {
      this.setState({
        selectedResource: null,
        selectedProjectFile: this.state.selectedProjectFile
          ? {
              node: this.state.selectedProjectFile.node,
              resource: null,
            }
          : null,
      });
    }

    resourceManagementProps.onResourceUsageChanged();

    return removedResourceNames;
  };

  _removeUnusedResources = (resourceKind: ResourceKind) => {
    this._removeUnusedResourcesFromProject(resourceKind);

    // Force update of the resources list as otherwise it could render
    // resources that were just deleted.
    this.refreshResourcesList();
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
      this.setState({
        selectedResource: null,
        selectedProjectFile: this.state.selectedProjectFile
          ? {
              node: this.state.selectedProjectFile.node,
              resource: null,
            }
          : null,
      });
    }

    // Force update of the resources list as otherwise it could render
    // resources that were just deleted.
    this.refreshResourcesList();
  };

  toggleProperties = () => {
    this.setState(
      state => ({
        isPropertiesShown: !state.isPropertiesShown,
      }),
      this.updateToolbar
    );
  };

  _updateLayout = (partialLayout: {|
    workingDeskHeight?: number,
    toolsWidth?: number,
  |}) => {
    this.setState(state => {
      const nextLayout = {
        workingDeskHeight:
          typeof partialLayout.workingDeskHeight === 'number'
            ? partialLayout.workingDeskHeight
            : state.workingDeskHeight,
        toolsWidth:
          typeof partialLayout.toolsWidth === 'number'
            ? partialLayout.toolsWidth
            : state.toolsWidth,
      };
      persistLayout(nextLayout);
      return nextLayout;
    });
  };

  _startWorkingDeskResize = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const mainColumn = this._mainColumn;
    if (!mainColumn) return;
    const bounds = mainColumn.getBoundingClientRect();
    const eventDocument = getResizeEventDocument(event);

    const onMouseMove = (event: MouseEvent) => {
      const maxWorkingDeskHeight = Math.max(
        0,
        bounds.height - minProjectFilesHeight - resizeHandleSize
      );
      const minimumWorkingDeskHeight = Math.min(
        minWorkingDeskHeight,
        maxWorkingDeskHeight
      );
      this._updateLayout({
        workingDeskHeight: clamp(
          event.clientY - bounds.top,
          minimumWorkingDeskHeight,
          maxWorkingDeskHeight
        ),
      });
    };
    const onMouseUp = () => {
      eventDocument.removeEventListener('mousemove', onMouseMove);
      eventDocument.removeEventListener('mouseup', onMouseUp);
    };
    eventDocument.addEventListener('mousemove', onMouseMove);
    eventDocument.addEventListener('mouseup', onMouseUp);
  };

  _startToolsResize = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const container = this._container;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const eventDocument = getResizeEventDocument(event);

    const onMouseMove = (event: MouseEvent) => {
      const maxToolsWidth = Math.max(minToolsWidth, bounds.width - 420);
      this._updateLayout({
        toolsWidth: clamp(
          bounds.right - event.clientX,
          minToolsWidth,
          maxToolsWidth
        ),
      });
    };
    const onMouseUp = () => {
      eventDocument.removeEventListener('mousemove', onMouseMove);
      eventDocument.removeEventListener('mouseup', onMouseUp);
    };
    eventDocument.addEventListener('mousemove', onMouseMove);
    eventDocument.addEventListener('mouseup', onMouseUp);
  };

  _onProjectFileSelected = (selectedProjectFile: ?ProjectFileSelection) => {
    this.setState(
      {
        selectedProjectFile,
        selectedResource: selectedProjectFile
          ? selectedProjectFile.resource
          : null,
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

  _openPropertiesDialog = (selectedProjectFile: ProjectFileSelection) => {
    this.setState({ propertiesDialogSelection: selectedProjectFile });
  };

  _closePropertiesDialog = () => {
    this.setState({ propertiesDialogSelection: null });
  };

  _openWorkingDeskToolTab = (
    workingDeskToolTabUpdate: WorkingDeskToolTabUpdate
  ) => {
    this.setState({ workingDeskToolTabUpdate });
  };

  _renderPropertiesContent = (
    selectedProjectFile: ?ProjectFileSelection
  ): React.Node => {
    const { project, resourceManagementProps } = this.props;
    const selectedResource = selectedProjectFile
      ? selectedProjectFile.resource
      : null;

    if (selectedResource) {
      return (
        <I18n>
          {({ i18n }) => (
            <ResourcePropertiesEditor
              key={selectedResource.ptr}
              resources={[selectedResource]}
              project={project}
              resourcesLoader={this.resourcesLoader}
              ref={propertiesEditor =>
                (this._propertiesEditor = propertiesEditor)
              }
              onResourcePathUpdated={() => {
                this.refreshResourcesList();
              }}
              resourceManagementProps={resourceManagementProps}
              i18n={i18n}
              hidePreview
            />
          )}
        </I18n>
      );
    }

    this._propertiesEditor = null;
    return <FilePropertiesPanel selectedItem={selectedProjectFile} />;
  };

  _renderPropertiesDialog = (): React.Node => {
    const { propertiesDialogSelection } = this.state;
    if (!propertiesDialogSelection) return null;

    return (
      <Dialog
        title={
          <React.Fragment>
            <Trans>Properties</Trans>: {propertiesDialogSelection.node.name}
          </React.Fragment>
        }
        open
        onRequestClose={this._closePropertiesDialog}
        maxWidth="md"
        fullHeight
        noPadding
        flexBody
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            onClick={this._closePropertiesDialog}
          />,
        ]}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {this._renderPropertiesContent(propertiesDialogSelection)}
        </div>
      </Dialog>
    );
  };

  render(): any {
    const { project, fileMetadata } = this.props;
    const {
      selectedProjectFile,
      isPropertiesShown,
      workingDeskHeight,
      toolsWidth,
      workingDeskToolTabUpdate,
    } = this.state;

    return (
      <div
        style={styles.container}
        ref={container => (this._container = container)}
      >
        <div
          style={styles.mainColumn}
          ref={mainColumn => (this._mainColumn = mainColumn)}
        >
          <div
            style={{
              ...styles.workingDeskPane,
              // Treat the persisted height as a preferred size. Allowing this
              // pane to shrink prevents it from hiding the panel below when a
              // popped-out editor window is shorter than the main editor.
              flex: `0 1 ${workingDeskHeight}px`,
            }}
          >
            <WorkingDesk
              project={project}
              resourcesLoader={this.resourcesLoader}
              selectedItem={selectedProjectFile}
              toolTabUpdate={workingDeskToolTabUpdate}
              onProjectFilesChanged={this.refreshResourcesList}
            />
          </div>
          <div
            style={styles.horizontalResizeHandle}
            onMouseDown={this._startWorkingDeskResize}
          />
          <div style={styles.projectFilesPane}>
            <ProjectFilesPanel
              project={project}
              fileMetadata={fileMetadata}
              storageProvider={this.props.storageProvider}
              selectedItem={selectedProjectFile}
              onSelectProjectFile={this._onProjectFileSelected}
              onViewProjectFileProperties={this._openPropertiesDialog}
              onRefreshProjectFiles={
                this.refreshResourcesListAndRemoveUnusedResources
              }
              onProjectFilesRefreshed={
                this._updateSelectedProjectFileFromRootNode
              }
              ref={projectFilesPanel =>
                (this._projectFilesPanel = projectFilesPanel)
              }
            />
          </div>
        </div>
        {isPropertiesShown && (
          <>
            <div
              style={styles.verticalResizeHandle}
              onMouseDown={this._startToolsResize}
            />
            <div
              style={{
                ...styles.toolsPane,
                width: toolsWidth,
              }}
            >
              <ToolsPanel
                project={project}
                selectedItem={selectedProjectFile}
                onOpenWorkingDeskTask={this._openWorkingDeskToolTab}
                onProjectFilesChanged={this.refreshResourcesList}
              />
            </div>
          </>
        )}
        {this._renderPropertiesDialog()}
      </div>
    );
  }
}
