import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import Panes from './UI/Panes';
import injectTapEventPlugin from 'react-tap-event-plugin';

import EventsSheetContainer from './EventsSheet/EventsSheetContainer.js';
import SceneEditor from './SceneEditor';
import ProjectManager from './ProjectManager';
import ExternalEditor from './ExternalEditor';

import Window from './Utils/Window.js';

import JSONTree from 'react-json-tree'

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
      sceneOpened: '',
    }

    if (ExternalEditor.isSupported()) {
      console.log("Connection to an external editor...");
      const editorArguments = Window.getArguments();
      ExternalEditor.connectTo(editorArguments['server-port']);

      ExternalEditor.onUpdateReceived((serializedObject) => {
        console.log("Received update from server");
        this.loadGame(serializedObject);
      });
      ExternalEditor.onSetBoundsReceived((x, y, width, height) => {
        Window.setBounds(x, y, width, height);
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
      });
    } else {
      console.log("Connection to an external editor is not supported");
    }
  }

  requestUpdate = () => {
    ExternalEditor.requestUpdate();
  }

  loadBuiltinGame = () => {
    const unserializedProject = gd.Serializer.fromJSON(JSON.stringify(game));
    return this.loadGame(unserializedProject);
  }

  loadGame = (unserializedProject) => {
    const { currentProject } = this.state;
    if (currentProject) currentProject.delete();
    const newProject = gd.ProjectHelper.createNewGDJSProject();

    newProject.unserializeFrom(unserializedProject);
    this.setState({
      currentProject: newProject,
    })
  }

  render() {
    const { currentProject, externalEventsOpened, sceneOpened } = this.state;

    return (
      <MuiThemeProvider>
        <Panes
          firstChild={
            currentProject && (
              <ProjectManager
                project={currentProject}
                onOpenExternalEvents={name => this.setState({
                  externalEventsOpened: name
                })}
                onOpenLayout={name => this.setState({
                  sceneOpened: name
                })}
              />
            )
          }

          secondChild={
            <div className="App">
              <p className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
              </p>
              <RaisedButton label="Load game" onClick={this.loadBuiltinGame} />
              <RaisedButton label="Request update" onClick={this.requestUpdate} />
              {/*<JSONTree data={game} />*/}
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
                currentProject && currentProject.hasExternalEventsNamed(externalEventsOpened) && (
                  <EventsSheetContainer
                    project={currentProject}
                    events={currentProject.getExternalEvents(externalEventsOpened).getEvents()}
                    layout={currentProject.getLayoutAt(0)}
                  />
                )
              }
            </div>
          }
        />
      </MuiThemeProvider>
    );
  }
}

export default App;
