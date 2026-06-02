// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import { I18n } from '@lingui/react';
import ResourcePropertiesEditor, {
  type ResourcePropertiesEditorInterface,
} from './ResourcePropertiesEditor';
import FilePropertiesPanel from './FilePropertiesPanel';
import ProjectFilesPanel, {
  type ProjectFilesPanelInterface,
  type ProjectFileSelection,
} from './ProjectFilesPanel';
import WorkingDesk from './WorkingDesk';
import ToolsPanel from './ToolsPanel';
import Toolbar from './Toolbar';
import ResourcesLoader from '../ResourcesLoader';
import AlertContext, { type ConfirmState } from '../UI/Alert/AlertContext';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
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
const layoutStorageKey = 'gdevelop.resourcesEditor.layout.v1';
const minWorkingDeskHeight = 220;
const minProjectFilesHeight = 150;
const minToolsWidth = 300;

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
    minHeight: minWorkingDeskHeight,
    minWidth: 0,
  },
  horizontalResizeHandle: {
    flex: '0 0 6px',
    cursor: 'ns-resize',
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderTop: '1px solid rgba(128, 128, 128, 0.2)',
    borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
  },
  projectFilesPane: {
    display: 'flex',
    flex: 1,
    minHeight: minProjectFilesHeight,
    minWidth: 0,
  },
  verticalResizeHandle: {
    flex: '0 0 6px',
    cursor: 'ew-resize',
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderLeft: '1px solid rgba(128, 128, 128, 0.2)',
    borderRight: '1px solid rgba(128, 128, 128, 0.2)',
  },
  toolsPane: {
    display: 'flex',
    minWidth: minToolsWidth,
  },
};

type State = {|
  selectedResource: ?gdResource,
  selectedProjectFile: ?ProjectFileSelection,
  propertiesDialogSelection: ?ProjectFileSelection,
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
  // $FlowFixMe[missing-local-annot]
  state = {
    selectedResource: null,
    selectedProjectFile: null,
    propertiesDialogSelection: null,
    isPropertiesShown: true,
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
    if (this._projectFilesPanel) await this._projectFilesPanel.refresh();
  };

  updateToolbar = () => {
    this.props.setToolbar(
      <Toolbar
        onToggleProperties={this.toggleProperties}
        isPropertiesShown={this.state.isPropertiesShown}
      />
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

  _startWorkingDeskResize = (event: MouseEvent) => {
    event.preventDefault();
    const mainColumn = this._mainColumn;
    if (!mainColumn) return;
    const bounds = mainColumn.getBoundingClientRect();

    const onMouseMove = (event: MouseEvent) => {
      const maxWorkingDeskHeight = Math.max(
        minWorkingDeskHeight,
        bounds.height - minProjectFilesHeight
      );
      this._updateLayout({
        workingDeskHeight: clamp(
          event.clientY - bounds.top,
          minWorkingDeskHeight,
          maxWorkingDeskHeight
        ),
      });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  _startToolsResize = (event: MouseEvent) => {
    event.preventDefault();
    const container = this._container;
    if (!container) return;
    const bounds = container.getBoundingClientRect();

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
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
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
              flex: `0 0 ${workingDeskHeight}px`,
            }}
          >
            <WorkingDesk
              project={project}
              resourcesLoader={this.resourcesLoader}
              selectedItem={selectedProjectFile}
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
