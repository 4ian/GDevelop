// @flow
import * as React from 'react';
import ResourcesList from '../ResourcesList';
import ResourcePropertiesEditor from './ResourcePropertiesEditor';
import Toolbar from './Toolbar';
import EditorMosaic, { MosaicWindow } from '../UI/EditorMosaic';
import InfoBar from '../UI/Messages/InfoBar';
import ResourcesLoader from '../ObjectsRendering/ResourcesLoader';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

type State = {
  showPropertiesInfoBar: boolean,
  selectedResource: ?gdResource,
};

type Props = {
  setToolbar: React.Node => void,
  project: gdProject,
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,
};

export default class InstancesFullEditor extends React.Component<Props, State> {
  static defaultProps = {
    setToolbar: () => {},
  };

  editorMosaic: ?EditorMosaic = null;
  _propertiesEditor: ?ResourcePropertiesEditor = null;
  _resourcesList: ?ResourcesList = null;
  resourcesLoader = ResourcesLoader;
  state = {
    showPropertiesInfoBar: false,
    selectedResource: null,
  };

  updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        onOpenProperties={this.openProperties}
        canDelete={!!this.state.selectedResource}
        onDeleteSelection={() =>
          this.deleteResource(this.state.selectedResource)}
      />
    );
  }

  deleteResource = (resource: ?gdResource) => {
    const { project, onDeleteResource } = this.props;
    if (!resource) return;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this resource? This can't be undone."
    );
    if (!answer) return;

    onDeleteResource(resource, doRemove => {
      if (!doRemove || !resource) return;

      project.getResourcesManager().removeResource(resource.getName());
      this.setState(
        {
          selectedResource: null,
        },
        () => {
          if (this._resourcesList) this._resourcesList.forceUpdateList();
          this.updateToolbar();
        }
      );
    });
  };

  openProperties = () => {
    if (!this.editorMosaic) return;
    if (!this.editorMosaic.openEditor('properties')) {
      this.setState({
        showPropertiesInfoBar: true,
      });
    }
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

  render() {
    const { project, onRenameResource } = this.props;
    const { selectedResource } = this.state;

    const editors = {
      properties: (
        <MosaicWindow
          title="Properties"
          // Pass resources to force MosaicWindow update when selectedResource is changed
          resources={selectedResource ? [selectedResource] : []}
        >
          <ResourcePropertiesEditor
            key={selectedResource ? selectedResource.ptr : undefined}
            resources={selectedResource ? [selectedResource] : []}
            project={project}
            resourcesLoader={this.resourcesLoader}
            ref={propertiesEditor =>
              (this._propertiesEditor = propertiesEditor)}
          />
        </MosaicWindow>
      ),
      'resources-list': (
        <ResourcesList
          project={project}
          onDeleteResource={this.deleteResource}
          onRenameResource={onRenameResource}
          onSelectResource={this._onResourceSelected}
          selectedResource={selectedResource}
          ref={resourcesList => (this._resourcesList = resourcesList)}
        />
      ),
    };

    return (
      <div style={styles.container}>
        <EditorMosaic
          editors={editors}
          ref={editorMosaic => (this.editorMosaic = editorMosaic)}
          initialEditorNames={['properties', 'resources-list']}
        />
        <InfoBar
          message="Properties panel is already opened"
          show={!!this.state.showPropertiesInfoBar}
        />
      </div>
    );
  }
}
