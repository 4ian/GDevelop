// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ResourcesList from '../ResourcesList';
import ResourcePropertiesEditor from './ResourcePropertiesEditor';
import Toolbar from './Toolbar';
import EditorMosaic, { MosaicWindow } from '../UI/EditorMosaic';
import InfoBar from '../UI/Messages/InfoBar';
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire';

import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';

const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;
const path = optionalRequire('path');
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
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
};

export default class ResourcesEditor extends React.Component<Props, State> {
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
        onOpenProjectFolder={this.openProjectFolder}
        onOpenProperties={this.openProperties}
        canDelete={!!this.state.selectedResource}
        onDeleteSelection={() =>
          this.deleteResource(this.state.selectedResource)
        }
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

  openProjectFolder = () => {
    const project = this.props.project;
    if (shell) shell.openItem(path.dirname(project.getProjectFile()));
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
    const {
      project,
      onRenameResource,
      onChooseResource,
      resourceSources,
    } = this.props;
    const { selectedResource } = this.state;

    const editors = {
      properties: (
        <MosaicWindow
          title={<Trans>Properties</Trans>}
          // Pass resources to force MosaicWindow update when selectedResource is changed
          resources={selectedResource ? [selectedResource] : []}
        >
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
            onChooseResource={onChooseResource}
            resourceSources={resourceSources}
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
          initialNodes={{
            direction: 'row',
            first: 'properties',
            second: 'resources-list',
            splitPercentage: 75,
          }}
        />
        <InfoBar
          message={<Trans>Properties panel is already opened</Trans>}
          show={!!this.state.showPropertiesInfoBar}
        />
      </div>
    );
  }
}
