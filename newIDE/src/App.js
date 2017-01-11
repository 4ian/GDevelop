import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import Panes from './UI/Panes';
import injectTapEventPlugin from 'react-tap-event-plugin';

import EventsSheetContainer from './EventsSheet/EventsSheetContainer.js';
import FullSizeSceneEditor from './SceneEditor/FullSizeSceneEditor.js';
import ProjectManager from './ProjectManager';

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
  }

  loadGame = () => {
    let { currentProject } = this.state;
    if (currentProject) currentProject.delete();
    const newProject = gd.ProjectHelper.createNewGDJSProject();

    const unserializedProject = gd.Serializer.fromJSON(JSON.stringify(game));
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
              <RaisedButton label="Load game" onClick={this.loadGame} />
              {/*<JSONTree data={game} />*/}
              {
                currentProject && currentProject.hasLayoutNamed(sceneOpened) && (
                  <FullSizeSceneEditor
                    key={sceneOpened}
                    project={currentProject}
                    layout={currentProject.getLayout(sceneOpened)}
                    initialInstances={currentProject.getLayout(sceneOpened).getInitialInstances()}
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
