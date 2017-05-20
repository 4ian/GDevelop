import React, { Component } from 'react';
import './MainFrame.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import Toolbar from './Toolbar';
import StartPage from './StartPage';
import EventsSheetContainer from '../EventsSheet/EventsSheetContainer.js';
import SceneEditor from '../SceneEditor';
import ExternalLayoutEditor from '../SceneEditor/ExternalLayoutEditor';
import ProjectManager from '../ProjectManager';
import LoaderModal from '../UI/LoaderModal';
import EditorBar from '../UI/EditorBar';
import defaultTheme from '../UI/Theme/DefaultTheme';
import { Tabs, Tab } from '../UI/Tabs';
import {
  getEditorTabsInitialState,
  openEditorTab,
  closeEditorTab,
  changeCurrentTab,
  getEditors,
  getCurrentTabIndex,
  getCurrentTab,
  closeProjectTabs,
} from './EditorTabsHandler';
import FileOpener from '../Utils/FileOpener';

import fixtureGame from '../fixtures/fixture-game.json';
const gd = global.gd;

class MainFrame extends Component {
  constructor() {
    super();
    this.state = {
      loadingProject: false,
      currentProject: null,
      projectManagerOpen: false,
      editorTabs: getEditorTabsInitialState(),
    };
    this.toolbar = null;
  }

  componentWillMount() {
    if (!this.props.singleEditor) this.openStartPage();
  }

  loadFullProject = (serializedProject, cb) => {
    this.setState(
      {
        loadingProject: true,
      },
      () => {
        var t0 = performance.now();
        const { currentProject } = this.state;
        if (currentProject) currentProject.delete();
        const newProject = gd.ProjectHelper.createNewGDJSProject();

        newProject.unserializeFrom(serializedProject);
        var t1 = performance.now();
        console.log(
          'Creation and unserialization project took ' +
            (t1 - t0) +
            ' milliseconds.'
        );

        this.setState(
          {
            currentProject: newProject,
            loadingProject: false,
          },
          cb
        );
      }
    );
  };

  getSerializedElements = () => {
    const editorTab = getCurrentTab(this.state.editorTabs);
    if (!editorTab || !editorTab.editorRef) {
      console.warn('No active editor or reference to the editor');
      return {};
    }

    return editorTab.editorRef.getSerializedElements();
  };

  requestUpdate = () => {
    this.props.requestUpdate();
  };

  loadBuiltinGame = () => {
    this.setState(
      {
        loadingProject: true,
      },
      () => {
        var t0 = performance.now();

        const unserializedProject = gd.Serializer.fromJSObject(fixtureGame);
        var t1 = performance.now();
        console.log(
          'Call to gd.Serializer.fromJSON on builtin game took ' +
            (t1 - t0) +
            ' milliseconds.'
        );
        return this.loadFullProject(unserializedProject, () => {
          unserializedProject.delete();
        });
      }
    );
  };

  toggleProjectManager = () => {
    if (!this.refs.toolbar)
      this.setState({
        projectManagerOpen: !this.state.projectManagerOpen,
      });
  };

  setEditorToolbar = editorToolbar => {
    if (!this.toolbar) return;

    this.toolbar.setEditorToolbar(editorToolbar);
  };

  openExternalEvents = name => {
    this.setState({
      editorTabs: openEditorTab(this.state.editorTabs, name, () => (
        <EventsSheetContainer
          key={'external events ' + name}
          project={this.state.currentProject}
          events={this.state.currentProject.getExternalEvents(name).getEvents()}
          layout={this.state.currentProject.getLayoutAt(0)}
          setToolbar={this.setEditorToolbar}
        />
      )),
    });
  };

  openLayout = name => {
    this.setState({
      editorTabs: openEditorTab(this.state.editorTabs, name, () => (
        <SceneEditor
          key={'layout ' + name}
          project={this.state.currentProject}
          layoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this.props.onPreview}
          showPreviewButton
          onEditObject={this.props.onEditObject}
        />
      )),
    });
  };

  openExternalLayout = name => {
    this.setState({
      editorTabs: openEditorTab(this.state.editorTabs, name, () => (
        <ExternalLayoutEditor
          key={'external layout ' + name}
          project={this.state.currentProject}
          externalLayoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this.props.onPreview}
          showPreviewButton
          onEditObject={this.props.onEditObject}
        />
      )),
    });
  };

  openStartPage = () => {
    this.setState({
      editorTabs: openEditorTab(this.state.editorTabs, 'Start Page', () => (
        <StartPage
          key={'start page'}
          setToolbar={this.setEditorToolbar}
          onOpen={this._onOpenFromFile}
        />
      )),
    });
  };

  _onOpenFromFile = () => {
    FileOpener.chooseProjectFile((err, filepath) => {
      if (!filepath || err) return;

      FileOpener.readProjectJSONFile(filepath, (err, projectObject) => {
        if (err) {
          //TODO: Error displayed to user with a generic component
          console.error('Unable to read project', err);
          return;
        }

        this.setState(
          {
            loadingProject: true,
            editorTabs: closeProjectTabs(this.state.editorTabs, this.state.currentProject)
          },
          () =>
            setTimeout(() => {
              const serializedObject = gd.Serializer.fromJSObject(
                projectObject
              );

              this.loadFullProject(serializedObject, () => {
                serializedObject.delete();
                this.setState({
                  loadingProject: false,
                  projectManagerOpen: true,
                });
              });
            }),
          10 // Let some time for the loader to be shown
        );
      });
    });
  };

  _onChangeEditorTab = value => {
    this.setState({
      editorTabs: changeCurrentTab(this.state.editorTabs, value)
    });
  };

  _onEditorTabActive = editorTab => {
    if (!editorTab.editorRef) return;
    editorTab.editorRef.updateToolbar();
  };

  _onCloseEditorTab = editorTab => {
    this.setState({
      editorTabs: closeEditorTab(this.state.editorTabs, editorTab),
    });
  };

  render() {
    const {
      currentProject,
    } = this.state;

    return (
      <MuiThemeProvider muiTheme={defaultTheme}>
        <div className="main-frame">
          <Drawer open={this.state.projectManagerOpen}>
            <EditorBar
              title={currentProject ? currentProject.getName() : 'No project'}
              showMenuIconButton={false}
              iconElementRight={
                <IconButton onClick={this.toggleProjectManager}>
                  <NavigationClose />
                </IconButton>
              }
            />
            {currentProject &&
              <ProjectManager
                project={currentProject}
                onOpenExternalEvents={this.openExternalEvents}
                onOpenLayout={this.openLayout}
                onOpenExternalLayout={this.openExternalLayout}
              />}
          </Drawer>
          <Toolbar
            ref={toolbar => this.toolbar = toolbar}
            toggleProjectManager={this.toggleProjectManager}
            loadBuiltinGame={this.loadBuiltinGame}
            requestUpdate={this.requestUpdate}
          />
          <Tabs
            value={getCurrentTabIndex(this.state.editorTabs)}
            onChange={this._onChangeEditorTab}
            hideLabels={!!this.props.singleEditor}
          >
            {getEditors(this.state.editorTabs).map((editorTab, id) => (
              <Tab
                label={editorTab.name}
                value={id}
                key={id}
                onActive={() => this._onEditorTabActive(editorTab)}
                onClose={() => this._onCloseEditorTab(editorTab)}
              >
                <div style={{ display: 'flex', flex: 1, height: '100%' }}>
                  {editorTab.render()}
                </div>
              </Tab>
            ))}
          </Tabs>
          <LoaderModal show={this.state.loadingProject || this.props.loading} />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default MainFrame;
