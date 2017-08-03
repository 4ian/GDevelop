import React, { Component } from 'react';
import './MainFrame.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import DragDropContextProvider
  from '../Utils/DragDropHelpers/DragDropContextProvider';
import Toolbar from './Toolbar';
import ProjectTitlebar from './ProjectTitlebar';
import ConfirmCloseDialog from './ConfirmCloseDialog';
import ProjectManager from '../ProjectManager';
import LoaderModal from '../UI/LoaderModal';
import EditorBar from '../UI/EditorBar';
import Window from '../Utils/Window';
import defaultTheme from '../UI/Theme/DefaultTheme';
import { showErrorBox } from '../UI/Messages/MessageBox';
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
import { watchPromiseInState } from '../Utils/WatchPromiseInState';
import { timeFunction } from '../Utils/TimeFunction';
import newNameGenerator from '../Utils/NewNameGenerator';

// Editors:
import EventsEditor from './Editors/EventsEditor';
import ExternalEventsEditor from './Editors/ExternalEventsEditor';
import SceneEditor from './Editors/SceneEditor';
import ExternalLayoutEditor from './Editors/ExternalLayoutEditor';
import StartPage from './Editors/StartPage';

import fixtureGame from '../fixtures/platformer/platformer.json';
const gd = global.gd;

const styles = {
  drawerContent: {
    overflowX: 'hidden',
  },
};

export default class MainFrame extends Component {
  constructor() {
    super();
    this.state = {
      createDialogOpen: false,
      exportDialogOpen: false,
      introDialogOpen: false,
      loadingProject: false,
      previewLoading: false,
      currentProject: null,
      projectManagerOpen: false,
      editorTabs: getEditorTabsInitialState(),
    };
    this.toolbar = null;
  }

  componentWillMount() {
    if (!this.props.integratedEditor) this.openStartPage();
    if (this.props.introDialog && !Window.isDev()) this._openIntroDialog(true);
  }

  loadFullProject = (serializedProject, cb) => {
    this.setState(
      {
        loadingProject: true,
      },
      () => {
        timeFunction(
          () => {
            const { currentProject } = this.state;
            if (currentProject) currentProject.delete();

            const newProject = gd.ProjectHelper.createNewGDJSProject();
            newProject.unserializeFrom(serializedProject);

            this.setState(
              {
                currentProject: newProject,
                loadingProject: false,
              },
              cb
            );
          },
          time => console.info(`Unserialization took ${time} ms`)
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

  loadBuiltinGame = () => {
    this.setState(
      {
        loadingProject: true,
      },
      () => {
        let unserializedProject = null;
        timeFunction(
          () => unserializedProject = gd.Serializer.fromJSObject(fixtureGame),
          time => console.info(`gd.Serializer.fromJSObject took ${time}ms`)
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

  addLayout = () => {
    const { currentProject } = this.state;
    const name = newNameGenerator('NewScene', name =>
      currentProject.hasLayoutNamed(name));
    currentProject.insertNewLayout(name, currentProject.getLayoutsCount());
    this.forceUpdate();
  };

  _launchLayoutPreview = (project, layout) =>
    watchPromiseInState(this, 'previewLoading', () =>
      this.props.onLayoutPreview(project, layout)).catch(err => {
      showErrorBox('Unable to launch the preview!', err);
    });

  _launchExternalLayoutPreview = (project, layout, externalLayout) =>
    watchPromiseInState(this, 'previewLoading', () =>
      this.props.onExternalLayoutPreview(
        project,
        layout,
        externalLayout
      )).catch(err => {
      showErrorBox('Unable to launch the preview!', err);
    });

  openLayout = name => {
    const sceneEditorOptions = {
      name,
      editorCreator: () => (
        <SceneEditor
          project={this.state.currentProject}
          layoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this._launchLayoutPreview}
          showPreviewButton={!!this.props.onLayoutPreview}
          onEditObject={this.props.onEditObject}
          showObjectsList={!this.props.integratedEditor}
          resourceSources={this.props.resourceSources}
        />
      ),
      key: 'layout ' + name,
    };
    const eventsEditorOptions = {
      name: name + ' (Events)',
      editorCreator: () => (
        <EventsEditor
          project={this.state.currentProject}
          layoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this._launchLayoutPreview}
          showPreviewButton={!!this.props.onLayoutPreview}
        />
      ),
      key: 'layout events ' + name,
      dontFocusTab: true,
    };

    const tabsWithSceneEditor = openEditorTab(
      this.state.editorTabs,
      sceneEditorOptions
    );
    const tabsWithSceneAndEventsEditors = openEditorTab(
      tabsWithSceneEditor,
      eventsEditorOptions
    );

    this.setState({ editorTabs: tabsWithSceneAndEventsEditors }, () =>
      this.updateToolbar());
  };

  openExternalEvents = name => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name,
          editorCreator: () => (
            <ExternalEventsEditor
              project={this.state.currentProject}
              externalEventsName={name}
              setToolbar={this.setEditorToolbar}
            />
          ),
          key: 'external events ' + name,
        }),
      },
      () => this.updateToolbar()
    );
  };

  openExternalLayout = name => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name,
          editorCreator: () => (
            <ExternalLayoutEditor
              project={this.state.currentProject}
              externalLayoutName={name}
              setToolbar={this.setEditorToolbar}
              onPreview={this._launchExternalLayoutPreview}
              showPreviewButton={!!this.props.onExternalLayoutPreview}
              onEditObject={this.props.onEditObject}
              showObjectsList={!this.props.integratedEditor}
              resourceSources={this.props.resourceSources}
            />
          ),
          key: 'external layout ' + name,
        }),
      },
      () => this.updateToolbar()
    );
  };

  openStartPage = () => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name: 'Start Page',
          editorCreator: () => (
            <StartPage
              setToolbar={this.setEditorToolbar}
              onOpen={this.chooseProject}
              onCreate={() => this.openCreateDialog()}
            />
          ),
          key: 'start page',
        }),
      },
      () => this.updateToolbar()
    );
  };

  openCreateDialog = (open = true) => {
    this.setState({
      createDialogOpen: open,
    });
  };

  openFromPathOrURL = url => {
    this.props.onReadFromPathOrURL(url).then(
      projectObject => {
        this.setState(
          {
            loadingProject: true,
            editorTabs: closeProjectTabs(
              this.state.editorTabs,
              this.state.currentProject
            ),
          },
          () =>
            setTimeout(() => {
              const serializedObject = gd.Serializer.fromJSObject(
                projectObject
              );

              this.loadFullProject(serializedObject, () => {
                serializedObject.delete();

                this.state.currentProject.setProjectFile(url);
                this.setState({
                  loadingProject: false,
                  projectManagerOpen: true,
                });
              });
            }),
          10 // Let some time for the loader to be shown
        );
      },
      err => {
        showErrorBox(
          'Unable to read this project. Please try again later or with another save of the project.',
          err
        );
        return;
      }
    );
  };

  chooseProject = () => {
    this.props
      .onChooseProject()
      .then(filepath => {
        if (!filepath) return;

        this.openFromPathOrURL(filepath);
      })
      .catch(() => {});
  };

  save = () => {
    if (!this.state.currentProject) return;

    this.props.onSaveProject(this.state.currentProject).catch(err => {
      showErrorBox(
        'Unable to save the project! Please try again by choosing another location.',
        err
      );
    });
  };

  closeProject = () => {
    if (!this.state.currentProject) return;

    this.confirmCloseDialog.show(closeProject => {
      if (!closeProject || !this.state.currentProject) return;

      this.setState(
        {
          projectManagerOpen: false,
          editorTabs: closeProjectTabs(
            this.state.editorTabs,
            this.state.currentProject
          ),
        },
        () => {
          this.state.currentProject.delete();
          this.setState({
            currentProject: null,
          });
        }
      );
    });
  };

  openExportDialog = (open = true) => {
    this.setState({
      exportDialogOpen: open,
    });
  };

  _openIntroDialog = (open = true) => {
    this.setState({
      introDialogOpen: open,
    });
  };

  _onChangeEditorTab = value => {
    this.setState(
      {
        editorTabs: changeCurrentTab(this.state.editorTabs, value),
      },
      () => this.updateToolbar()
    );
  };

  _onEditorTabActive = editorTab => {
    this.updateToolbar();
  };

  _onCloseEditorTab = editorTab => {
    this.setState(
      {
        editorTabs: closeEditorTab(this.state.editorTabs, editorTab),
      },
      () => this.updateToolbar()
    );
  };

  updateToolbar() {
    const editorTab = getCurrentTab(this.state.editorTabs);
    if (!editorTab || !editorTab.editorRef) {
      this.setEditorToolbar(null);
      return;
    }

    editorTab.editorRef.updateToolbar();
  }

  render() {
    const {
      currentProject,
    } = this.state;
    const { exportDialog, createDialog, introDialog } = this.props;
    const showLoader = this.state.loadingProject ||
      this.state.previewLoading ||
      this.props.loading;

    return (
      <DragDropContextProvider>
        <MuiThemeProvider muiTheme={defaultTheme}>
          <div className="main-frame">
            <ProjectTitlebar project={this.state.currentProject} />
            <Drawer
              open={this.state.projectManagerOpen}
              containerStyle={styles.drawerContent}
            >
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
                  onAddLayout={this.addLayout}
                  onOpenExternalLayout={this.openExternalLayout}
                  onSaveProject={this.save}
                  onCloseProject={this.closeProject}
                  onExportProject={this.openExportDialog}
                />}
            </Drawer>
            <Toolbar
              ref={toolbar => this.toolbar = toolbar}
              showProjectIcons={!this.props.integratedEditor}
              hasProject={!!this.state.currentProject}
              toggleProjectManager={this.toggleProjectManager}
              openProject={this.chooseProject}
              loadBuiltinGame={this.loadBuiltinGame}
              requestUpdate={this.props.requestUpdate}
            />
            <Tabs
              value={getCurrentTabIndex(this.state.editorTabs)}
              onChange={this._onChangeEditorTab}
              hideLabels={!!this.props.integratedEditor}
            >
              {getEditors(this.state.editorTabs).map((editorTab, id) => (
                <Tab
                  label={editorTab.name}
                  value={id}
                  key={editorTab.key}
                  onActive={() => this._onEditorTabActive(editorTab)}
                  onClose={() => this._onCloseEditorTab(editorTab)}
                >
                  <div style={{ display: 'flex', flex: 1, height: '100%' }}>
                    {editorTab.render()}
                  </div>
                </Tab>
              ))}
            </Tabs>
            <LoaderModal show={showLoader} />
            <ConfirmCloseDialog
              ref={confirmCloseDialog =>
                this.confirmCloseDialog = confirmCloseDialog}
            />
            {!!exportDialog &&
              React.cloneElement(exportDialog, {
                open: this.state.exportDialogOpen,
                onClose: () => this.openExportDialog(false),
                project: this.state.currentProject,
              })}
            {!!createDialog &&
              React.cloneElement(createDialog, {
                open: this.state.createDialogOpen,
                onClose: () => this.openCreateDialog(false),
                onOpen: filepath => {
                  this.openCreateDialog(false);
                  this.openFromPathOrURL(filepath);
                },
              })}
            {!!introDialog &&
              React.cloneElement(introDialog, {
                open: this.state.introDialogOpen,
                onClose: () => this._openIntroDialog(false),
              })}
          </div>
        </MuiThemeProvider>
      </DragDropContextProvider>
    );
  }
}
