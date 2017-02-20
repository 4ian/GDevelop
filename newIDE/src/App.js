import React, { Component } from 'react';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import {Toolbar, ToolbarGroup, ToolbarSeparator} from 'material-ui/Toolbar';
import injectTapEventPlugin from 'react-tap-event-plugin';

import EventsSheetContainer from './EventsSheet/EventsSheetContainer.js';
import SceneEditor from './SceneEditor';
import ExternalLayoutEditor from './SceneEditor/ExternalLayoutEditor';
import ProjectManager from './ProjectManager';
import ExternalEditor from './ExternalEditor';
import LoaderModal from './UI/LoaderModal';
import EditorBar from './UI/EditorBar';
import defaultTheme from './UI/Theme/DefaultTheme';

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

      ExternalEditor.onUpdateReceived((serializedObject, scope) => {
        if (scope === 'instances') {
          //TODO
          console.warn("Not implemented: received instances update from server");
        } else {
          console.log("Received project update from server");
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
        }
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
        ExternalEditor.send(serializedInstances, 'instances');
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

  requestUpdate = (scope = "") => {
    this.setState({
      loading: true,
    }, () => {
      ExternalEditor.requestUpdate(scope);
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

  setToolbar = (toolbar) => {
    this.setState({
      toolbar,
    })
  }

  render() {
    const { currentProject, externalEventsOpened, sceneOpened, externalLayoutOpened } = this.state;

    return (
      <MuiThemeProvider muiTheme={defaultTheme}>
        <div className="App">
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
          <LoaderModal show={this.state.loading} />
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <RaisedButton label="Project manager" onClick={this.toggleProjectManager} />
              <RaisedButton label="Load game" onClick={this.loadBuiltinGame} />
              <RaisedButton label="Request update" onClick={this.requestUpdate} />
            </ToolbarGroup>
            <ToolbarSeparator />
            {this.state.toolbar || <ToolbarGroup />}
          </Toolbar>
          {
            currentProject && sceneOpened && (
              <SceneEditor
                key={sceneOpened}
                project={currentProject}
                layoutName={sceneOpened}
                setToolbar={this.setToolbar}
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
