// @flow

import * as React from 'react';
import './MainFrame.css';

import Providers from './Providers';

import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import Toolbar from './Toolbar';
import ProjectTitlebar from './ProjectTitlebar';
import PreferencesDialog from './Preferences/PreferencesDialog';
import ConfirmCloseDialog from './ConfirmCloseDialog';
import AboutDialog from './AboutDialog';
import ProjectManager from '../ProjectManager';
import PlatformSpecificAssetsDialog from '../PlatformSpecificAssetsEditor/PlatformSpecificAssetsDialog';
import LoaderModal from '../UI/LoaderModal';
import EditorBar from '../UI/EditorBar';
import CloseConfirmDialog from '../UI/CloseConfirmDialog';
import ProfileDialog from '../Profile/ProfileDialog';
import Window from '../Utils/Window';
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
  closeLayoutTabs,
  closeExternalLayoutTabs,
  closeExternalEventsTabs,
  closeEventsFunctionsExtensionTabs,
  type EditorTabsState,
  type EditorTab,
} from './EditorTabsHandler';
import { watchPromiseInState } from '../Utils/WatchPromiseInState';
import { timeFunction } from '../Utils/TimeFunction';
import newNameGenerator from '../Utils/NewNameGenerator';
import HelpFinder from '../HelpFinder';

// Editors:
import DebuggerEditor from './Editors/DebuggerEditor';
import EventsEditor from './Editors/EventsEditor';
import ExternalEventsEditor from './Editors/ExternalEventsEditor';
import SceneEditor from './Editors/SceneEditor';
import ExternalLayoutEditor from './Editors/ExternalLayoutEditor';
import EventsFunctionsExtensionEditor from './Editors/EventsFunctionsExtensionEditor';
import StartPage from './Editors/StartPage';
import ResourcesEditor from './Editors/ResourcesEditor';
import ErrorBoundary from '../UI/ErrorBoundary';
import SubscriptionDialog from '../Profile/SubscriptionDialog';
import ResourcesLoader from '../ResourcesLoader/index';
import Authentification from '../Utils/GDevelopServices/Authentification';
import {
  type PreviewLauncher,
  type PreviewOptions,
} from '../Export/PreviewLauncher.flow';
import { type ResourceSource } from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type JsExtensionsLoader } from '../JsExtensionsLoader';
import {
  getUpdateNotificationTitle,
  getUpdateNotificationBody,
  type UpdateStatus,
} from './UpdaterTools';

const gd = global.gd;

const styles = {
  drawerContent: {
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

type State = {|
  createDialogOpen: boolean,
  exportDialogOpen: boolean,
  introDialogOpen: boolean,
  saveDialogOpen: boolean,
  genericDialogOpen: boolean,
  loadingProject: boolean,
  previewLoading: boolean,
  currentProject: ?gdProject,
  projectManagerOpen: boolean,
  editorTabs: EditorTabsState,
  genericDialog: null,
  snackMessage: string,
  snackMessageOpen: boolean,
  preferencesDialogOpen: boolean,
  profileDialogOpen: boolean,
  subscriptionDialogOpen: boolean,
  updateStatus: UpdateStatus,
  aboutDialogOpen: boolean,
  platformSpecificAssetsDialogOpen: boolean,
  helpFinderDialogOpen: boolean,
|};

type Props = {
  integratedEditor?: boolean,
  introDialog?: React.Element<*>,
  onReadFromPathOrURL: (url: string) => Promise<any>,
  previewLauncher?: React.Element<PreviewLauncher>,
  onEditObject?: gdObject => void,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onChooseProject?: () => Promise<string>,
  saveDialog?: React.Element<*>,
  onSaveProject?: gdProject => Promise<any>,
  loading?: boolean,
  requestUpdate?: () => void,
  exportDialog?: React.Element<*>,
  createDialog?: React.Element<*>,
  authentification: Authentification,
  extensionsLoader?: JsExtensionsLoader,
  initialPathsOrURLsToOpen: ?Array<string>,
};

export default class MainFrame extends React.Component<Props, State> {
  state = {
    createDialogOpen: false,
    exportDialogOpen: false,
    introDialogOpen: false,
    saveDialogOpen: false,
    genericDialogOpen: false,
    loadingProject: false,
    previewLoading: false,
    currentProject: null,
    projectManagerOpen: false,
    editorTabs: getEditorTabsInitialState(),
    genericDialog: null,
    snackMessage: '',
    snackMessageOpen: false,
    preferencesDialogOpen: false,
    profileDialogOpen: false,
    subscriptionDialogOpen: false,
    updateStatus: { message: '', status: 'unknown' },
    aboutDialogOpen: false,
    platformSpecificAssetsDialogOpen: false,
    helpFinderDialogOpen: false,
  };
  toolbar = null;
  confirmCloseDialog: any = null;
  _resourceSourceDialogs = {};
  _previewLauncher: ?PreviewLauncher = null;
  _providers = null;

  componentWillMount() {
    if (!this.props.integratedEditor) this.openStartPage();
  }

  componentDidMount() {
    const { initialPathsOrURLsToOpen } = this.props;

    this.loadExtensions();
    if (initialPathsOrURLsToOpen && initialPathsOrURLsToOpen[0]) {
      this.openFromPathOrURL(initialPathsOrURLsToOpen[0], () =>
        this.openSceneOrProjectManager()
      );
    } else if (this.props.introDialog && !Window.isDev())
      this._openIntroDialog(true);
  }

  loadExtensions = () => {
    const { extensionsLoader } = this.props;
    if (extensionsLoader) {
      extensionsLoader.loadAllExtensions().then(loadingResults => {
        const successLoadingResults = loadingResults.filter(
          loadingResult => !loadingResult.result.error
        );
        const failLoadingResults = loadingResults.filter(
          loadingResult =>
            loadingResult.result.error && !loadingResult.result.dangerous
        );
        const dangerousLoadingResults = loadingResults.filter(
          loadingResult =>
            loadingResult.result.error && loadingResult.result.dangerous
        );
        console.info(`Loaded ${successLoadingResults.length} JS extensions.`);
        if (failLoadingResults.length) {
          console.error(
            `⚠️ Unable to load ${failLoadingResults.length} JS extensions. Please check these errors:`,
            failLoadingResults
          );
        }
        if (dangerousLoadingResults.length) {
          console.error(
            `💣 Dangerous exceptions while loading ${dangerousLoadingResults.length} JS extensions. 🔥 Please check these errors as they will CRASH GDevelop:`,
            dangerousLoadingResults
          );
        }
      });
    }
  };

  loadFromSerializedProject = (
    serializedProject: gdSerializerElement,
    cb: Function
  ) => {
    timeFunction(
      () => {
        const newProject = gd.ProjectHelper.createNewGDJSProject();
        newProject.unserializeFrom(serializedProject);

        this.closeProject(() => this.loadFromProject(newProject, cb));
      },
      time => console.info(`Unserialization took ${time} ms`)
    );
  };

  loadFromProject = (project: gdProject, cb: Function) => {
    this.closeProject(() => {
      // Make sure that the ResourcesLoader cache is emptied, so that
      // the URL to a resource with a name in the old project is not re-used
      // for another resource with the same name in the new project.
      ResourcesLoader.burstAllUrlsCache();
      // TODO: Pixi cache should also be burst

      this.setState(
        {
          currentProject: project,
        },
        () => {
          cb();
        }
      );
    });
  };

  openFromPathOrURL = (url: string, cb: Function) => {
    this.props.onReadFromPathOrURL(url).then(
      projectObject => {
        this.setState({ loadingProject: true }, () =>
          setTimeout(() => {
            const serializedProject = gd.Serializer.fromJSObject(projectObject);

            this.loadFromSerializedProject(serializedProject, () => {
              serializedProject.delete();

              if (this.state.currentProject)
                this.state.currentProject.setProjectFile(url);

              this.setState(
                {
                  loadingProject: false,
                },
                cb
              );
            });
          })
        );
      },
      err => {
        showErrorBox(
          'Unable to open this project. Check that the path/URL is correct, that you selected a file that is a game file created with GDevelop and that is was not removed.',
          err
        );
        return;
      }
    );
  };

  closeProject = (cb: Function) => {
    if (!this.state.currentProject) return cb();

    this.openProjectManager(false);
    this.setState(
      {
        editorTabs: closeProjectTabs(
          this.state.editorTabs,
          this.state.currentProject
        ),
      },
      () => {
        if (this.state.currentProject) this.state.currentProject.delete();
        this.setState(
          {
            currentProject: null,
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

  toggleProjectManager = () => {
    if (!this.refs.toolbar)
      this.setState({
        projectManagerOpen: !this.state.projectManagerOpen,
      });
  };

  openProjectManager = (open: boolean = true) => {
    this.setState({
      projectManagerOpen: open,
    });
  };

  setEditorToolbar = (editorToolbar: any) => {
    if (!this.toolbar) return;

    // $FlowFixMe
    this.toolbar.getWrappedInstance().setEditorToolbar(editorToolbar);
  };

  addLayout = () => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    const name = newNameGenerator('NewScene', name =>
      currentProject.hasLayoutNamed(name)
    );
    const newLayout = currentProject.insertNewLayout(
      name,
      currentProject.getLayoutsCount()
    );
    newLayout.updateBehaviorsSharedData(currentProject);
    this.forceUpdate();
  };

  addExternalLayout = () => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExternalLayout', name =>
      currentProject.hasExternalLayoutNamed(name)
    );
    currentProject.insertNewExternalLayout(
      name,
      currentProject.getExternalLayoutsCount()
    );
    this.forceUpdate();
  };

  addExternalEvents = () => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExternalEvents', name =>
      currentProject.hasExternalEventsNamed(name)
    );
    currentProject.insertNewExternalEvents(
      name,
      currentProject.getExternalEventsCount()
    );
    this.forceUpdate();
  };

  addEventsFunctionsExtension = () => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    const name = newNameGenerator('NewEventsFunctionsExtension', name =>
      currentProject.hasEventsFunctionsExtensionNamed(name)
    );
    currentProject.insertNewEventsFunctionsExtension(
      name,
      currentProject.getEventsFunctionsExtensionsCount()
    );
    this.forceUpdate();
  };

  deleteLayout = (layout: gdLayout) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this scene? This can't be undone."
    );
    if (!answer) return;

    this.setState(
      {
        editorTabs: closeLayoutTabs(this.state.editorTabs, layout),
      },
      () => {
        currentProject.removeLayout(layout.getName());
        this.forceUpdate();
      }
    );
  };

  deleteExternalLayout = (externalLayout: gdExternalLayout) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this external layout? This can't be undone."
    );
    if (!answer) return;

    this.setState(
      {
        editorTabs: closeExternalLayoutTabs(
          this.state.editorTabs,
          externalLayout
        ),
      },
      () => {
        currentProject.removeExternalLayout(externalLayout.getName());
        this.forceUpdate();
      }
    );
  };

  deleteExternalEvents = (externalEvents: gdExternalEvents) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove these external events? This can't be undone."
    );
    if (!answer) return;

    this.setState(
      {
        editorTabs: closeExternalEventsTabs(
          this.state.editorTabs,
          externalEvents
        ),
      },
      () => {
        currentProject.removeExternalEvents(externalEvents.getName());
        this.forceUpdate();
      }
    );
  };

  deleteEventsFunctionsExtension = (externalLayout: gdEventsFunctionsExtension) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this extension? This can't be undone."
    );
    if (!answer) return;

    this.setState(
      {
        editorTabs: closeEventsFunctionsExtensionTabs(
          this.state.editorTabs,
          externalLayout
        ),
      },
      () => {
        currentProject.removeEventsFunctionsExtension(externalLayout.getName());
        this.forceUpdate();
      }
    );
  };

  renameLayout = (oldName: string, newName: string) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    if (!currentProject.hasLayoutNamed(oldName)) return;

    const layout = currentProject.getLayout(oldName);
    this.setState(
      {
        editorTabs: closeLayoutTabs(this.state.editorTabs, layout),
      },
      () => {
        layout.setName(newName);
        this.forceUpdate();
      }
    );
  };

  renameExternalLayout = (oldName: string, newName: string) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    if (!currentProject.hasExternalLayoutNamed(oldName)) return;

    const externalLayout = currentProject.getExternalLayout(oldName);
    this.setState(
      {
        editorTabs: closeExternalLayoutTabs(
          this.state.editorTabs,
          externalLayout
        ),
      },
      () => {
        externalLayout.setName(newName);
        this.forceUpdate();
      }
    );
  };

  renameExternalEvents = (oldName: string, newName: string) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    if (!currentProject.hasExternalEventsNamed(oldName)) return;

    const externalEvents = currentProject.getExternalEvents(oldName);
    this.setState(
      {
        editorTabs: closeExternalEventsTabs(
          this.state.editorTabs,
          externalEvents
        ),
      },
      () => {
        externalEvents.setName(newName);
        this.forceUpdate();
      }
    );
  };

  renameEventsFunctionsExtension = (oldName: string, newName: string) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    if (!currentProject.hasEventsFunctionsExtensionNamed(oldName)) return;

    const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(oldName);
    this.setState(
      {
        editorTabs: closeEventsFunctionsExtensionTabs(
          this.state.editorTabs,
          eventsFunctionsExtension
        ),
      },
      () => {
        eventsFunctionsExtension.setName(newName);
        this.forceUpdate();
      }
    );
  };

  _launchLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ) =>
    watchPromiseInState(this, 'previewLoading', () =>
      this._handlePreviewResult(
        this._previewLauncher &&
          this._previewLauncher.launchLayoutPreview(project, layout, options)
      )
    );

  _launchExternalLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ) =>
    watchPromiseInState(this, 'previewLoading', () =>
      this._handlePreviewResult(
        this._previewLauncher &&
          this._previewLauncher.launchExternalLayoutPreview(
            project,
            layout,
            externalLayout,
            options
          )
      )
    );

  _handlePreviewResult = (previewPromise: ?Promise<any>): Promise<void> => {
    if (!previewPromise) return Promise.reject();

    return previewPromise.then(
      (result: any) => {},
      (err: any) => {
        showErrorBox('Unable to launch the preview!', err);
      }
    );
  };

  openLayout = (
    name: string,
    {
      openEventsEditor = true,
      openSceneEditor = true,
    }: { openEventsEditor: boolean, openSceneEditor: boolean } = {}
  ) => {
    const sceneEditorOptions = {
      name,
      renderEditor: ({ isActive, editorRef }) => (
        <SceneEditor
          project={this.state.currentProject}
          layoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this._launchLayoutPreview}
          showPreviewButton={!!this.props.previewLauncher}
          showNetworkPreviewButton={
            this._previewLauncher && this._previewLauncher.canDoNetworkPreview()
          }
          onOpenDebugger={this.openDebugger}
          onEditObject={this.props.onEditObject}
          showObjectsList={!this.props.integratedEditor}
          resourceSources={this.props.resourceSources}
          onChooseResource={this._onChooseResource}
          resourceExternalEditors={this.props.resourceExternalEditors}
          isActive={isActive}
          ref={editorRef}
        />
      ),
      key: 'layout ' + name,
    };
    const eventsEditorOptions = {
      name: name + ' (Events)',
      renderEditor: ({ isActive, editorRef }) => (
        <EventsEditor
          project={this.state.currentProject}
          layoutName={name}
          setToolbar={this.setEditorToolbar}
          onPreview={this._launchLayoutPreview}
          showPreviewButton={!!this.props.previewLauncher}
          showNetworkPreviewButton={
            this._previewLauncher && this._previewLauncher.canDoNetworkPreview()
          }
          onOpenDebugger={this.openDebugger}
          onOpenExternalEvents={this.openExternalEvents}
          onOpenLayout={name =>
            this.openLayout(name, {
              openEventsEditor: true,
              openSceneEditor: false,
            })}
          resourceSources={this.props.resourceSources}
          onChooseResource={this._onChooseResource}
          resourceExternalEditors={this.props.resourceExternalEditors}
          isActive={isActive}
          ref={editorRef}
        />
      ),
      key: 'layout events ' + name,
      dontFocusTab: openSceneEditor,
    };

    const tabsWithSceneEditor = openSceneEditor
      ? openEditorTab(this.state.editorTabs, sceneEditorOptions)
      : this.state.editorTabs;
    const tabsWithSceneAndEventsEditors = openEventsEditor
      ? openEditorTab(tabsWithSceneEditor, eventsEditorOptions)
      : tabsWithSceneEditor;

    this.setState({ editorTabs: tabsWithSceneAndEventsEditors }, () =>
      this.updateToolbar()
    );
  };

  openExternalEvents = (name: string) => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name,
          renderEditor: ({ isActive, editorRef }) => (
            <ExternalEventsEditor
              project={this.state.currentProject}
              externalEventsName={name}
              setToolbar={this.setEditorToolbar}
              onOpenExternalEvents={this.openExternalEvents}
              onOpenLayout={name =>
                this.openLayout(name, {
                  openEventsEditor: true,
                  openSceneEditor: false,
                })}
              resourceSources={this.props.resourceSources}
              onChooseResource={this._onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
              isActive={isActive}
              ref={editorRef}
            />
          ),
          key: 'external events ' + name,
        }),
      },
      () => this.updateToolbar()
    );
  };

  openExternalLayout = (name: string) => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name,
          renderEditor: ({ isActive, editorRef }) => (
            <ExternalLayoutEditor
              project={this.state.currentProject}
              externalLayoutName={name}
              setToolbar={this.setEditorToolbar}
              onPreview={this._launchExternalLayoutPreview}
              showPreviewButton={!!this.props.previewLauncher}
              showNetworkPreviewButton={
                this._previewLauncher &&
                this._previewLauncher.canDoNetworkPreview()
              }
              onOpenDebugger={this.openDebugger}
              onEditObject={this.props.onEditObject}
              showObjectsList={!this.props.integratedEditor}
              resourceSources={this.props.resourceSources}
              onChooseResource={this._onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
              isActive={isActive}
              ref={editorRef}
            />
          ),
          key: 'external layout ' + name,
        }),
      },
      () => this.updateToolbar()
    );
  };

  openEventsFunctionsExtension = (name: string) => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name,
          renderEditor: ({ isActive, editorRef }) => (
            <EventsFunctionsExtensionEditor
              project={this.state.currentProject}
              eventsFunctionsExtensionName={name}
              setToolbar={this.setEditorToolbar}
              resourceSources={this.props.resourceSources}
              onChooseResource={this._onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
              isActive={isActive}
              ref={editorRef}
            />
          ),
          key: 'events functions extension ' + name,
        }),
      },
      () => this.updateToolbar()
    );
  };

  openResources = () => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name: 'Resources',
          renderEditor: ({ isActive, editorRef }) => (
            <ResourcesEditor
              project={this.state.currentProject}
              setToolbar={this.setEditorToolbar}
              onDeleteResource={(resource: gdResource, cb: boolean => void) => {
                // TODO: Project wide refactoring of objects/events using the resource
                cb(true);
              }}
              onRenameResource={(
                resource: gdResource,
                newName: string,
                cb: boolean => void
              ) => {
                // TODO: Project wide refactoring of objects/events using the resource
                cb(true);
              }}
              isActive={isActive}
              ref={editorRef}
            />
          ),
          key: 'resources',
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
          renderEditor: ({ isActive, editorRef }) => (
            <StartPage
              project={this.state.currentProject}
              setToolbar={this.setEditorToolbar}
              canOpen={!!this.props.onChooseProject}
              onOpen={this.chooseProject}
              onCreate={() => this.openCreateDialog()}
              onOpenProjectManager={() => this.openProjectManager()}
              onCloseProject={() => this.askToCloseProject()}
              onOpenAboutDialog={() => this.openAboutDialog()}
              onOpenHelpFinder={() => this.openHelpFinderDialog()}
              isActive={isActive}
              ref={editorRef}
            />
          ),
          key: 'start page',
          closable: false,
        }),
      },
      () => this.updateToolbar()
    );
  };

  openDebugger = () => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name: 'Debugger',
          renderEditor: ({ isActive, editorRef }) => (
            <DebuggerEditor
              project={this.state.currentProject}
              setToolbar={this.setEditorToolbar}
              isActive={isActive}
              ref={editorRef}
              onChangeSubscription={() => this.openSubscription(true)}
            />
          ),
          key: 'debugger',
        }),
      },
      () => this.updateToolbar()
    );
  };

  openCreateDialog = (open: boolean = true) => {
    this.setState({
      createDialogOpen: open,
    });
  };

  chooseProject = () => {
    if (!this.props.onChooseProject) return;

    this.props
      .onChooseProject()
      .then(filepath => {
        if (!filepath) return;

        this.openFromPathOrURL(filepath, () =>
          this.openSceneOrProjectManager()
        );
      })
      .catch(() => {});
  };

  save = () => {
    if (!this.state.currentProject) return;

    if (this.props.saveDialog) {
      this._openSaveDialog();
    } else if (this.props.onSaveProject) {
      this.props.onSaveProject(this.state.currentProject).then(
        () => {
          this._showSnackMessage('Project properly saved');
        },
        err => {
          showErrorBox(
            'Unable to save the project! Please try again by choosing another location.',
            err
          );
        }
      );
    }
  };

  askToCloseProject = (cb: ?Function) => {
    if (!this.state.currentProject) return;

    this.confirmCloseDialog.show(closeProject => {
      if (!closeProject || !this.state.currentProject) return;

      const noop = () => {};
      const callback = cb || noop;
      this.closeProject(callback);
    });
  };

  openSceneOrProjectManager = () => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    if (currentProject.getLayoutsCount() === 1) {
      this.openLayout(currentProject.getLayoutAt(0).getName(), {
        openSceneEditor: true,
        openEventsEditor: true,
      });
    } else {
      this.openProjectManager();
    }
  };

  openExportDialog = (open: boolean = true) => {
    this.setState({
      exportDialogOpen: open,
    });
  };

  _openIntroDialog = (open: boolean = true) => {
    this.setState({
      introDialogOpen: open,
    });
  };

  _openSaveDialog = (open: boolean = true) => {
    this.setState({
      saveDialogOpen: open,
    });
  };

  _openGenericDialog = (open: boolean = true) => {
    this.setState({
      genericDialogOpen: open,
      genericDialog: null,
    });
  };

  openPreferences = (open: boolean = true) => {
    this.setState({
      preferencesDialogOpen: open,
    });
  };

  openProfile = (open: boolean = true) => {
    this.setState({
      profileDialogOpen: open,
    });
  };

  openSubscription = (open: boolean = true) => {
    this.setState({
      subscriptionDialogOpen: open,
    });
  };

  _onChangeEditorTab = (value: number) => {
    this.setState(
      {
        editorTabs: changeCurrentTab(this.state.editorTabs, value),
      },
      () => this._onEditorTabActive(getCurrentTab(this.state.editorTabs))
    );
  };

  _onEditorTabActive = (editorTab: EditorTab) => {
    this.updateToolbar();
  };

  _onCloseEditorTab = (editorTab: EditorTab) => {
    this.setState(
      {
        editorTabs: closeEditorTab(this.state.editorTabs, editorTab),
      },
      () => this.updateToolbar()
    );
  };

  _onChooseResource = (
    sourceName: string,
    multiSelection: boolean = true
  ): Promise<Array<any>> => {
    const { currentProject } = this.state;
    const resourceSourceDialog = this._resourceSourceDialogs[sourceName];
    if (!resourceSourceDialog) return Promise.resolve([]);

    return resourceSourceDialog.chooseResources(currentProject, multiSelection);
  };

  updateToolbar() {
    const editorTab = getCurrentTab(this.state.editorTabs);
    if (!editorTab || !editorTab.editorRef) {
      this.setEditorToolbar(null);
      return;
    }

    editorTab.editorRef.updateToolbar();
  }

  openAboutDialog = (open: boolean = true) => {
    this.setState({
      aboutDialogOpen: open,
    });
  };

  openPlatformSpecificAssets = (open: boolean = true) => {
    this.setState({
      platformSpecificAssetsDialogOpen: open,
    });
  };

  openHelpFinderDialog = (open: boolean = true) => {
    this.setState({
      helpFinderDialogOpen: open,
    });
  };

  setUpdateStatus = (updateStatus: UpdateStatus) => {
    this.setState({
      updateStatus,
    });

    const notificationTitle = getUpdateNotificationTitle(updateStatus);
    const notificationBody = getUpdateNotificationBody(updateStatus);
    if (notificationTitle) {
      const notification = new window.Notification(notificationTitle, {
        body: notificationBody,
      });
      notification.onclick = () => this.openAboutDialog(true);
    }
  };

  simulateUpdateDownloaded = () =>
    this.setUpdateStatus({
      status: 'update-downloaded',
      message: 'update-downloaded',
      info: {
        releaseName: 'Fake update',
      },
    });

  simulateUpdateAvailable = () =>
    this.setUpdateStatus({
      status: 'update-available',
      message: 'Update available',
    });

  _showSnackMessage = (snackMessage: string) =>
    this.setState({
      snackMessage,
      snackMessageOpen: true,
    });

  _closeSnackMessage = () =>
    this.setState({
      snackMessageOpen: false,
    });

  render() {
    const {
      currentProject,
      genericDialog,
      projectManagerOpen,
      profileDialogOpen,
      subscriptionDialogOpen,
      updateStatus,
      aboutDialogOpen,
      helpFinderDialogOpen,
    } = this.state;
    const {
      exportDialog,
      createDialog,
      introDialog,
      saveDialog,
      resourceSources,
      authentification,
      previewLauncher,
      resourceExternalEditors,
    } = this.props;
    const showLoader =
      this.state.loadingProject ||
      this.state.previewLoading ||
      this.props.loading;

    return (
      <Providers authentification={authentification}>
        <div className="main-frame">
          <ProjectTitlebar project={currentProject} />
          <Drawer
            open={projectManagerOpen}
            containerStyle={styles.drawerContent}
            width={320}
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
            {currentProject && (
              <ProjectManager
                project={currentProject}
                onOpenExternalEvents={this.openExternalEvents}
                onOpenLayout={this.openLayout}
                onOpenExternalLayout={this.openExternalLayout}
                onOpenEventsFunctionsExtension={this.openEventsFunctionsExtension}
                onAddLayout={this.addLayout}
                onAddExternalLayout={this.addExternalLayout}
                onAddEventsFunctionsExtension={this.addEventsFunctionsExtension}
                onAddExternalEvents={this.addExternalEvents}
                onDeleteLayout={this.deleteLayout}
                onDeleteExternalLayout={this.deleteExternalLayout}
                onDeleteEventsFunctionsExtension={this.deleteEventsFunctionsExtension}
                onDeleteExternalEvents={this.deleteExternalEvents}
                onRenameLayout={this.renameLayout}
                onRenameExternalLayout={this.renameExternalLayout}
                onRenameEventsFunctionsExtension={this.renameEventsFunctionsExtension}
                onRenameExternalEvents={this.renameExternalEvents}
                onSaveProject={this.save}
                onCloseProject={this.askToCloseProject}
                onExportProject={this.openExportDialog}
                onOpenPreferences={() => this.openPreferences(true)}
                onOpenResources={() => this.openResources()}
                onOpenPlatformSpecificAssets={() =>
                  this.openPlatformSpecificAssets()}
                onChangeSubscription={() => this.openSubscription(true)}
                freezeUpdate={!projectManagerOpen}
              />
            )}
          </Drawer>
          <Toolbar
            ref={toolbar => (this.toolbar = toolbar)}
            showProjectIcons={!this.props.integratedEditor}
            hasProject={!!this.state.currentProject}
            toggleProjectManager={this.toggleProjectManager}
            exportProject={() => this.openExportDialog(true)}
            requestUpdate={this.props.requestUpdate}
            simulateUpdateDownloaded={this.simulateUpdateDownloaded}
            simulateUpdateAvailable={this.simulateUpdateAvailable}
          />
          <Tabs
            value={getCurrentTabIndex(this.state.editorTabs)}
            onChange={this._onChangeEditorTab}
            hideLabels={!!this.props.integratedEditor}
          >
            {getEditors(this.state.editorTabs).map((editorTab, id) => {
              const isCurrentTab =
                getCurrentTabIndex(this.state.editorTabs) === id;
              return (
                <Tab
                  label={editorTab.name}
                  value={id}
                  key={editorTab.key}
                  onActive={() => this._onEditorTabActive(editorTab)}
                  onClose={() => this._onCloseEditorTab(editorTab)}
                  closable={editorTab.closable}
                >
                  <div style={{ display: 'flex', flex: 1, height: '100%' }}>
                    <ErrorBoundary>
                      {editorTab.render(isCurrentTab)}
                    </ErrorBoundary>
                  </div>
                </Tab>
              );
            })}
          </Tabs>
          <LoaderModal show={showLoader} />
          <HelpFinder
            open={helpFinderDialogOpen}
            onClose={() => this.openHelpFinderDialog(false)}
          />
          <ConfirmCloseDialog
            ref={confirmCloseDialog =>
              (this.confirmCloseDialog = confirmCloseDialog)}
          />
          <Snackbar
            open={this.state.snackMessageOpen}
            message={this.state.snackMessage}
            autoHideDuration={3000}
            onRequestClose={this._closeSnackMessage}
          />
          {!!exportDialog &&
            React.cloneElement(exportDialog, {
              open: this.state.exportDialogOpen,
              onClose: () => this.openExportDialog(false),
              onChangeSubscription: () => {
                this.openExportDialog(false);
                this.openSubscription(true);
              },
              project: this.state.currentProject,
              authentification,
            })}
          {!!createDialog &&
            React.cloneElement(createDialog, {
              open: this.state.createDialogOpen,
              onClose: () => this.openCreateDialog(false),
              onOpen: filepath => {
                this.openCreateDialog(false);
                this.openFromPathOrURL(filepath, () =>
                  this.openSceneOrProjectManager()
                );
              },
              onCreate: project => {
                this.openCreateDialog(false);
                this.loadFromProject(project, () =>
                  this.openSceneOrProjectManager()
                );
              },
            })}
          {!!introDialog &&
            React.cloneElement(introDialog, {
              open: this.state.introDialogOpen,
              onClose: () => this._openIntroDialog(false),
            })}
          {!!saveDialog &&
            React.cloneElement(saveDialog, {
              project: this.state.currentProject,
              open: this.state.saveDialogOpen,
              onClose: () => this._openSaveDialog(false),
            })}
          {!!this.state.currentProject && (
            <PlatformSpecificAssetsDialog
              project={this.state.currentProject}
              open={this.state.platformSpecificAssetsDialogOpen}
              onApply={() => this.openPlatformSpecificAssets(false)}
              onClose={() => this.openPlatformSpecificAssets(false)}
              resourceSources={resourceSources}
              onChooseResource={this._onChooseResource}
              resourceExternalEditors={resourceExternalEditors}
            />
          )}
          {!!genericDialog &&
            React.cloneElement(genericDialog, {
              open: this.state.genericDialogOpen,
              onClose: () => this._openGenericDialog(false),
            })}
          {!!previewLauncher &&
            React.cloneElement(previewLauncher, {
              ref: (previewLauncher: ?PreviewLauncher) =>
                (this._previewLauncher = previewLauncher),
              onExport: () => this.openExportDialog(true),
              onChangeSubscription: () => this.openSubscription(true),
            })}
          {resourceSources.map((resourceSource, index) => {
            // $FlowFixMe
            const Component = resourceSource.component;
            return (
              // $FlowFixMe
              <Component
                key={resourceSource.name}
                ref={dialog =>
                  (this._resourceSourceDialogs[resourceSource.name] = dialog)}
              />
            );
          })}
          <ProfileDialog
            open={profileDialogOpen}
            onClose={() => this.openProfile(false)}
            onChangeSubscription={() => this.openSubscription(true)}
          />
          <SubscriptionDialog
            onClose={() => {
              this.openSubscription(false);
            }}
            open={subscriptionDialogOpen}
          />
          <PreferencesDialog
            open={this.state.preferencesDialogOpen}
            onClose={() => this.openPreferences(false)}
          />
          <AboutDialog
            open={aboutDialogOpen}
            onClose={() => this.openAboutDialog(false)}
            updateStatus={updateStatus}
          />
          <CloseConfirmDialog shouldPrompt={!!this.state.currentProject} />
        </div>
      </Providers>
    );
  }
}
