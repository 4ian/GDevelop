import React, { Component } from 'react';
import './MainFrame.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import Toolbar from './Toolbar';
import EventsSheetContainer from '../EventsSheet/EventsSheetContainer.js';
import SceneEditor from '../SceneEditor';
import ExternalLayoutEditor from '../SceneEditor/ExternalLayoutEditor';
import ProjectManager from '../ProjectManager';
import LoaderModal from '../UI/LoaderModal';
import EditorBar from '../UI/EditorBar';
import defaultTheme from '../UI/Theme/DefaultTheme';

import game from '../fixtures/game.json';
const gd = global.gd;

class MainFrame extends Component {
  constructor() {
    super();
    this.state = {
      loadingProject: false,
      currentProject: null,
      externalEventsOpened: '',
      projectManagerOpen: false,
      sceneOpened: '',
      externalLayoutOpened: '',
    }
  }

  loadFullProject = (serializedProject, cb) => {
    this.setState({
      loadingProject: true,
    }, () => {
      var t0 = performance.now();
      const { currentProject } = this.state;
      if (currentProject) currentProject.delete();
      const newProject = gd.ProjectHelper.createNewGDJSProject();

      newProject.unserializeFrom(serializedProject);
      var t1 = performance.now();
      console.log("Creation and unserialization project took " + (t1 - t0) + " milliseconds.");

      if (!this.state.sceneOpened && this.props.selectedEditor === 'scene-editor') {
        this.setState({
          sceneOpened: this.props.editedElementName,
        });
      }
      if (!this.state.externalLayoutOpened && this.props.selectedEditor === 'external-layout-editor') {
        this.setState({
          externalLayoutOpened: this.props.editedElementName,
        });
      }

      this.setState({
        currentProject: newProject,
        loadingProject: false,
      }, cb);
    });
  }

  getSerializedEditedElement = (serializedElement) => {
    const { currentProject, sceneOpened } = this.state
    if (!currentProject || !currentProject.hasLayoutNamed(sceneOpened)){
    	console.warn("No project/layout to be serialized");
    	return;
    }

    const instances = currentProject.getLayout(sceneOpened).getInitialInstances();
    instances.serializeTo(serializedElement);
    return 'instances';
  }

  requestUpdate = () => {
    this.props.requestUpdate();
  }

  loadBuiltinGame = () => {
    this.setState({
      loadingProject: true,
    }, () => {
      var t0 = performance.now();

      const unserializedProject = gd.Serializer.fromJSObject(game);
      var t1 = performance.now();
      console.log("Call to gd.Serializer.fromJSON on builtin game took " + (t1 - t0) + " milliseconds.");
      return this.loadFullProject(unserializedProject, () => {
        unserializedProject.delete();
      });
    });
  }

  toggleProjectManager = () => {
    this.setState({
      projectManagerOpen: !this.state.projectManagerOpen,
    });
  }

  setToolbar = (toolbar) => {
    this.setState({
      toolbar,
    })
  }

  render() {
    const { currentProject, externalEventsOpened, sceneOpened, externalLayoutOpened } = this.state;

    return (
      <MuiThemeProvider muiTheme={defaultTheme}>
        <div className="main-frame">
          <Drawer open={this.state.projectManagerOpen}>
            <EditorBar
              title={currentProject ? currentProject.getName() : 'No project'}
              showMenuIconButton={false}
              iconElementRight={<IconButton onClick={this.toggleProjectManager}><NavigationClose /></IconButton>}
            />
            {
              currentProject && (
                <ProjectManager
                  project={currentProject}
                  onOpenExternalEvents={name => this.setState({
                    externalEventsOpened: name
                  })}
                  onOpenLayout={name => this.setState({
                    sceneOpened: name
                  })}
                  onOpenExternalLayout={name => this.setState({
                    externalLayoutOpened: name
                  })}
                />
              )
            }
          </Drawer>
          <Toolbar
            editorToolbar={this.state.toolbar}
            toggleProjectManager={this.toggleProjectManager}
            loadBuiltinGame={this.loadBuiltinGame}
            requestUpdate={this.requestUpdate}
          />
          {
            currentProject && sceneOpened && (
              <SceneEditor
                key={sceneOpened}
                project={currentProject}
                layoutName={sceneOpened}
                setToolbar={this.setToolbar}
                onPreview={this.props.onPreview}
                showPreviewButton
              />
            )
          }
          {
            currentProject && externalLayoutOpened && (
              <ExternalLayoutEditor
                key={externalLayoutOpened}
                project={currentProject}
                externalLayoutName={externalLayoutOpened}
              />
            )
          }
          {
            currentProject && currentProject.hasExternalEventsNamed(externalEventsOpened) && (
              <EventsSheetContainer
                project={currentProject}
                events={currentProject.getExternalEvents(externalEventsOpened).getEvents()}
                layout={currentProject.getLayoutAt(0)}
              />
            )
          }
          <LoaderModal show={this.state.loadingProject || this.props.loading} />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default MainFrame;
