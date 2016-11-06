import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import Panes from './UI/Panes';
import injectTapEventPlugin from 'react-tap-event-plugin';

import EventsSheetContainer from './EventsSheet/EventsSheetContainer.js';
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
    const { currentProject, externalEventsOpened } = this.state;

    return (
      <MuiThemeProvider>
        <div>
          <Panes
            firstChild={
              currentProject && (
                <ProjectManager
                  project={currentProject}
                  onOpenExternalEvents={name => this.setState({
                    externalEventsOpened: name
                  })}
                />
              )
            }

            secondChild={
              <div className="App">
                <div className="App-header">
                  <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                  To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <RaisedButton label="Load game" onClick={this.loadGame} />
                {/*<JSONTree data={game} />*/}
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
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
