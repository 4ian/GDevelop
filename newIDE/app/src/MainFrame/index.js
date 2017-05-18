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
      editors: [],
      currentTab: 0,
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
    const editorTab = this.state.editors[this.state.currentTab];
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
    const editorTab = {
      //TODO: Pass only the project and the external events name as props
      getElement: () => (
        <EventsSheetContainer
          key={'external events ' + name}
          project={this.state.currentProject}
          events={this.state.currentProject.getExternalEvents(name).getEvents()}
          layout={this.state.currentProject.getLayoutAt(0)}
          setToolbar={this.setEditorToolbar}
          ref={editorRef => editorTab.editorRef = editorRef}
        />
      ),
      editorRef: null,
      name,
    };

    this.setState({
      editors: [...this.state.editors, editorTab],
      projectManagerOpen: false,
    });
  };

  openLayout = name => {
    const editorTab = {
      getElement: () => (
        <SceneEditor
          key={'layout ' + name}
          project={this.state.currentProject}
          layoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this.props.onPreview}
          showPreviewButton
          onEditObject={this.props.onEditObject}
          ref={editorRef => editorTab.editorRef = editorRef}
        />
      ),
      editorRef: null,
      name,
    };

    this.setState({
      editors: [...this.state.editors, editorTab],
      projectManagerOpen: false,
    });
  };

  openExternalLayout = name => {
    const editorTab = {
      getElement: () => (
        <ExternalLayoutEditor
          key={'external layout ' + name}
          ref={editorRef => editorTab.editorRef = editorRef}
          project={this.state.currentProject}
          externalLayoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this.props.onPreview}
          showPreviewButton
          onEditObject={this.props.onEditObject}
        />
      ),
      editorRef: null,
      name,
    };

    this.setState({
      editors: [...this.state.editors, editorTab],
      projectManagerOpen: false,
    });
  };

  openStartPage = () => {
    const editorTab = {
      getElement: () => (
        <StartPage
          key={'start page'}
          ref={editorRef => editorTab.editorRef = editorRef}
          setToolbar={this.setEditorToolbar}
          onOpen={this._onOpenFromFile}
        />
      ),
      editorRef: null,
      name: 'Start page',
    };

    this.setState({
      editors: [...this.state.editors, editorTab],
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
      currentTab: value,
    });
  };

  _onEditorTabActive = editorTab => {
    if (!editorTab.editorRef) return;
    editorTab.editorRef.updateToolbar();
  };

  _onCloseEditorTab = editorTab => {
    //TODO: Tab handling could be moved to a helper/hoc component?
    let newCurrentTab = this.state.currentTab;
    if (this.state.editors.indexOf(editorTab) < this.state.currentTab)
      newCurrentTab--;

    this.setState({
      editors: this.state.editors.filter(e => e !== editorTab),
      currentTab: newCurrentTab,
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
            value={this.state.currentTab}
            onChange={this._onChangeEditorTab}
            hideLabels={!!this.props.singleEditor}
          >
            {this.state.editors.map((editorTab, id) => (
              <Tab
                label={editorTab.name}
                value={id}
                key={id}
                onActive={() => this._onEditorTabActive(editorTab)}
                onClose={() => this._onCloseEditorTab(editorTab)}
              >
                <div style={{ display: 'flex', flex: 1, height: '100%' }}>
                  {editorTab.getElement()}
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
