import React, { Component } from 'react';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import AppBar from 'material-ui/AppBar';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import injectTapEventPlugin from 'react-tap-event-plugin';

import EventsSheetContainer from './EventsSheet/EventsSheetContainer.js';
import SceneEditor from './SceneEditor';
import ExternalLayoutEditor from './SceneEditor/ExternalLayoutEditor';
import ProjectManager from './ProjectManager';
import ExternalEditor from './ExternalEditor';
import LoaderModal from './UI/LoaderModal';

import Window from './Utils/Window.js';

const gd = global.gd;
import game from './fixtures/game.json';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentProject: null,
      externalEventsOpened: '',
      projectManagerOpen: false,
      sceneOpened: '',
      externalLayoutOpened: '',
      loading: false,
    }

    if (ExternalEditor.isSupported()) {
      console.log("Connection to an external editor...");
      const editorArguments = Window.getArguments();

      ExternalEditor.onUpdateReceived((serializedObject) => {
        console.log("Received update from server");
        this.loadGame(serializedObject);

        if (!this.state.sceneOpened && editorArguments['editor'] === 'scene-editor') {
          this.setState({
            sceneOpened: editorArguments['edited-element-name'],
          });
        }
        if (!this.state.externalLayoutOpened && editorArguments['editor'] === 'external-layout-editor') {
          this.setState({
            externalLayoutOpened: editorArguments['edited-element-name'],
          });
        }
      });
      ExternalEditor.onSetBoundsReceived((x, y, width, height) => {
        // Window.setBounds(x, y, width, height);
      });
      ExternalEditor.onShowReceived(() => {
        Window.show();
      });
      Window.onBlur(() => {
        console.log("Sending update to server");
        const { currentProject, sceneOpened } = this.state;
        if (!currentProject || !currentProject.hasLayoutNamed(sceneOpened))
          return;

        const instances = currentProject.getLayout(sceneOpened).getInitialInstances();

        const serializedInstances = new gd.SerializerElement();
        instances.serializeTo(serializedInstances);
        ExternalEditor.send(serializedInstances);
        serializedInstances.delete();
      });
      Window.onFocus(() => {
        this.requestUpdate();
      })

      ExternalEditor.connectTo(editorArguments['server-port']);
    } else {
      console.log("Connection to an external editor is not supported");
    }
  }

  requestUpdate = () => {
    this.setState({
      loading: true,
    }, () => {
      ExternalEditor.requestUpdate();
    });
  }

  loadBuiltinGame = () => {
    this.setState({
      loading: true,
    }, () => {
      const unserializedProject = gd.Serializer.fromJSON(JSON.stringify(game));
      return this.loadGame(unserializedProject);
    });
  }

  loadGame = (unserializedProject) => {
    this.setState({
      loading: true,
    }, () => {
      const { currentProject } = this.state;
      if (currentProject) currentProject.delete();
      const newProject = gd.ProjectHelper.createNewGDJSProject();

      newProject.unserializeFrom(unserializedProject);
      this.setState({
        currentProject: newProject,
        loading: false,
      });
    });
  }

  toggleProjectManager = () => {
    this.setState({
      projectManagerOpen: !this.state.projectManagerOpen,
    });
  }

  render() {
    const { currentProject, externalEventsOpened, sceneOpened, externalLayoutOpened } = this.state;

    return (
      <MuiThemeProvider>
        <div className="App">
          <Drawer open={this.state.projectManagerOpen}>
            <AppBar
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
          <LoaderModal show={this.state.loading} />
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <RaisedButton label="Project manager" onClick={this.toggleProjectManager} />
              <RaisedButton label="Load game" onClick={this.loadBuiltinGame} />
              <RaisedButton label="Request update" onClick={this.requestUpdate} />
            </ToolbarGroup>
          </Toolbar>
          {
            currentProject && sceneOpened && (
              <SceneEditor
                key={sceneOpened}
                project={currentProject}
                layoutName={sceneOpened}
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
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
