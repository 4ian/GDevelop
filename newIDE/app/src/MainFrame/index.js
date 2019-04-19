// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import './MainFrame.css';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Toolbar from './Toolbar';
import ProjectTitlebar from './ProjectTitlebar';
import PreferencesDialog from './Preferences/PreferencesDialog';
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
  saveUiSettings,
  type EditorTabsState,
  type EditorTab,
  getEventsFunctionsExtensionEditor,
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
  type EventsFunctionWriter,
  loadProjectEventsFunctionsExtensions,
  unloadProjectEventsFunctionsExtensions,
  getFunctionNameFromType,
} from '../EventsFunctionsExtensionsLoader';
import {
  getUpdateNotificationTitle,
  getUpdateNotificationBody,
  type UpdateStatus,
} from './UpdaterTools';
import { showWarningBox } from '../UI/Messages/MessageBox';
import EmptyMessage from '../UI/EmptyMessage';
import ChangelogDialogContainer from './Changelog/ChangelogDialogContainer';
import { getNotNullTranslationFunction } from '../Utils/i18n/getTranslationFunction';
import { type I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import LanguageDialog from './Preferences/LanguageDialog';
import PreferencesContext from './Preferences/PreferencesContext';

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
  languageDialogOpen: boolean,
  profileDialogOpen: boolean,
  subscriptionDialogOpen: boolean,
  updateStatus: UpdateStatus,
  aboutDialogOpen: boolean,
  platformSpecificAssetsDialogOpen: boolean,
  helpFinderDialogOpen: boolean,
  eventsFunctionsExtensionsError: ?Error,
|};

type Props = {
  integratedEditor?: boolean,
  introDialog?: React.Element<*>,
  onReadFromPathOrURL: (url: string) => Promise<any>,
  previewLauncher?: React.Element<PreviewLauncher>,
  onEditObject?: gdObject => void,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onChooseProject?: () => Promise<?string>,
  saveDialog?: React.Element<*>,
  onSaveProject?: gdProject => Promise<any>,
  onAutoSaveProject?: (project: gdProject) => void,
  shouldOpenAutosave?: (
    filePath: string,
    autoSavePath: string,
    compareLastModified: boolean
  ) => boolean,
  loading?: boolean,
  requestUpdate?: () => void,
  exportDialog?: React.Element<*>,
  createDialog?: React.Element<*>,
  authentification: Authentification,
  extensionsLoader?: JsExtensionsLoader,
  initialPathsOrURLsToOpen: ?Array<string>,
  eventsFunctionWriter?: EventsFunctionWriter,
  i18n: I18n,
};

class MainFrame extends React.Component<Props, State> {
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
    languageDialogOpen: false,
    profileDialogOpen: false,
    subscriptionDialogOpen: false,
    updateStatus: { message: '', status: 'unknown' },
    aboutDialogOpen: false,
    platformSpecificAssetsDialogOpen: false,
    helpFinderDialogOpen: false,
    eventsFunctionsExtensionsError: null,
  };
  toolbar = null;
  _resourceSourceDialogs = {};
  _previewLauncher: ?PreviewLauncher = null;
  _providers = null;

  componentWillMount() {
    if (!this.props.integratedEditor) this.openStartPage();
  }

  componentDidMount() {
    const { initialPathsOrURLsToOpen } = this.props;

    this._loadExtensions();
    if (initialPathsOrURLsToOpen && initialPathsOrURLsToOpen[0]) {
      this.openFromPathOrURL(initialPathsOrURLsToOpen[0], () =>
        this.openSceneOrProjectManager()
      );
    } else if (this.props.introDialog && !Window.isDev())
      this._openIntroDialog(true);
  }

  _languageDidChange() {
    // A change in the language will automatically be applied
    // on all React components, as it's handled by GDI18nProvider.
    // We still have this method that will be called when the language
    // dialog is closed after a language change. We then reload GDevelop
    // extensions so that they declare all objects/actions/condition/etc...
    // using the new language.
    gd.JsPlatform.get().reloadBuiltinExtensions();
    this._loadExtensions();
  }

  _loadExtensions = () => {
    const { extensionsLoader, i18n } = this.props;
    if (!extensionsLoader) {
      console.info(
        'No extensions loader specified, skipping extensions loading.'
      );
      return;
    }

    extensionsLoader
      .loadAllExtensions(getNotNullTranslationFunction(i18n))
      .then(loadingResults => {
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
            `⚠️ Unable to load ${
              failLoadingResults.length
            } JS extensions. Please check these errors:`,
            failLoadingResults
          );
        }
        if (dangerousLoadingResults.length) {
          console.error(
            `💣 Dangerous exceptions while loading ${
              dangerousLoadingResults.length
            } JS extensions. 🔥 Please check these errors as they will CRASH GDevelop:`,
            dangerousLoadingResults
          );
        }
      });
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
          // Load all the EventsFunctionsExtension when the game is loaded. If they are modified,
          // their editor will take care of reloading them.
          this._loadProjectEventsFunctionsExtensions();
          cb();
        }
      );
    });
  };

  _loadProjectEventsFunctionsExtensions = () => {
    const { i18n } = this.props;
    if (this.props.eventsFunctionWriter && this.state.currentProject) {
      loadProjectEventsFunctionsExtensions(
        this.state.currentProject,
        this.props.eventsFunctionWriter
      )
        .then(() =>
          this.setState({
            eventsFunctionsExtensionsError: null,
          })
        )
        .catch((eventsFunctionsExtensionsError: Error) => {
          this.setState({
            eventsFunctionsExtensionsError,
          });
          showErrorBox(
            i18n._(
              t`An error has occured during functions generation. If GDevelop is installed, verify that nothing is preventing GDevelop from writing on disk. If you're running GDevelop online, verify your internet connection and refresh functions from the Project Manager.`
            ),
            eventsFunctionsExtensionsError
          );
        });
    }
  };

  openFromPathOrURL = (url: string, cb: Function) => {
    const { i18n, shouldOpenAutosave } = this.props;

    const projectFilePath = url;
    const autoSavePath = url + '.autosave';
    if (shouldOpenAutosave && shouldOpenAutosave(url, autoSavePath, true)) {
      //eslint-disable-next-line
      const answer = confirm(
        i18n._(
          t`An autosave file (backup made automatically by GDevelop) that is newer than the project file exists. Would you like to load it instead?`
        )
      );
      if (answer) url = autoSavePath;
    }

    this.props.onReadFromPathOrURL(url).then(
      projectObject => {
        this.setState({ loadingProject: true }, () =>
          setTimeout(() => {
            const serializedProject = gd.Serializer.fromJSObject(projectObject);

            this.loadFromSerializedProject(serializedProject, () => {
              serializedProject.delete();

              if (this.state.currentProject) {
                this.state.currentProject.setProjectFile(projectFilePath);
              }

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
        if (
          shouldOpenAutosave &&
          shouldOpenAutosave(projectFilePath, autoSavePath, false)
        ) {
          //eslint-disable-next-line
          const answer = confirm(
            i18n._(
              t`The project file appears to be malformed, but an autosave file exists (backup made automatically by GDevelop). Would you like to try to load it instead?`
            )
          );
          if (answer) {
            this.openFromPathOrURL(autoSavePath, () =>
              this.openSceneOrProjectManager()
            );
          }
        } else {
          showErrorBox(
            i18n._(
              t`Unable to open this project. Check that the path/URL is correct, that you selected a file that is a game file created with GDevelop and that is was not removed.`
            ),
            err
          );
          return;
        }
      }
    );
  };

  closeProject = (cb: Function) => {
    const { currentProject } = this.state;
    if (!currentProject) return cb();

    this.openProjectManager(false);
    this.setState(
      {
        editorTabs: closeProjectTabs(this.state.editorTabs, currentProject),
      },
      () => {
        unloadProjectEventsFunctionsExtensions(currentProject);
        currentProject.delete();
        this.setState(
          {
            currentProject: null,
          },
          () => {
            this.updateToolbar();
            cb();
          }
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

    this.toolbar.setEditorToolbar(editorToolbar);
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
    const { i18n } = this.props;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      i18n._(
        t`Are you sure you want to remove this scene? This can't be undone.`
      )
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
    const { i18n } = this.props;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      i18n._(
        t`Are you sure you want to remove this external layout? This can't be undone.`
      )
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
    const { i18n } = this.props;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      i18n._(
        t`Are you sure you want to remove these external events? This can't be undone.`
      )
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

  deleteEventsFunctionsExtension = (
    externalLayout: gdEventsFunctionsExtension
  ) => {
    const { currentProject } = this.state;
    const { i18n } = this.props;
    if (!currentProject) return;

    //eslint-disable-next-line
    const answer = confirm(
      i18n._(
        t`Are you sure you want to remove this extension? This can't be undone.`
      )
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
    const { i18n } = this.props;
    if (!currentProject) return;

    if (!currentProject.hasLayoutNamed(oldName) || newName === oldName) return;

    if (currentProject.hasLayoutNamed(newName)) {
      showWarningBox(i18n._(t`Another scene with this name already exists.`));
      return;
    }

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
    const { i18n } = this.props;
    if (!currentProject) return;

    if (!currentProject.hasExternalLayoutNamed(oldName) || newName === oldName)
      return;

    if (currentProject.hasExternalLayoutNamed(newName)) {
      showWarningBox(
        i18n._(t`Another external layout with this name already exists.`)
      );
      return;
    }

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
    const { i18n } = this.props;
    if (!currentProject) return;

    if (!currentProject.hasExternalEventsNamed(oldName) || newName === oldName)
      return;

    if (currentProject.hasExternalEventsNamed(newName)) {
      showWarningBox(
        i18n._(t`Other external events with this name already exist.`)
      );
      return;
    }

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
    const { i18n } = this.props;
    const { eventsFunctionWriter } = this.props;
    if (!currentProject) return;

    if (
      !currentProject.hasEventsFunctionsExtensionNamed(oldName) ||
      newName === oldName
    )
      return;

    if (currentProject.hasEventsFunctionsExtensionNamed(newName)) {
      showWarningBox(
        i18n._(t`Another extension with this name already exists.`)
      );
      return;
    }

    if (!gd.Project.validateObjectName(newName)) {
      showWarningBox(
        i18n._(
          t`This name contains forbidden characters: please only use alphanumeric characters (0-9, a-z) and underscores in your extension name.`
        )
      );
      return;
    }

    const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
      oldName
    );
    this.setState(
      {
        editorTabs: closeEventsFunctionsExtensionTabs(
          this.state.editorTabs,
          eventsFunctionsExtension
        ),
      },
      () => {
        // Refactor the project to update the instructions (and later expressions)
        // of this extension:
        gd.WholeProjectRefactorer.renameEventsFunctionsExtension(
          currentProject,
          eventsFunctionsExtension,
          oldName,
          newName
        );
        eventsFunctionsExtension.setName(newName);
        if (eventsFunctionWriter) {
          unloadProjectEventsFunctionsExtensions(currentProject);
          this._loadProjectEventsFunctionsExtensions();
        }

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
    const { i18n } = this.props;

    return previewPromise.then(
      (result: any) => {},
      (err: any) => {
        showErrorBox(i18n._(t`Unable to launch the preview!`), err);
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
    const { i18n, onAutoSaveProject } = this.props;
    const sceneEditorOptions = {
      name,
      renderEditor: ({ isActive, editorRef }) => (
        <PreferencesContext.Consumer>
          {({ values }) => (
            <SceneEditor
              project={this.state.currentProject}
              layoutName={name}
              setToolbar={this.setEditorToolbar}
              onPreview={(project, layout, options) => {
                this._launchLayoutPreview(project, layout, options);
                if (values.autosaveOnPreview && onAutoSaveProject) {
                  onAutoSaveProject(project);
                }
              }}
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
          )}
        </PreferencesContext.Consumer>
      ),
      key: 'layout ' + name,
    };
    const eventsEditorOptions = {
      name: name + ' ' + i18n._(t`(Events)`),
      renderEditor: ({ isActive, editorRef }) => (
        <PreferencesContext.Consumer>
          {({ values }) => (
            <EventsEditor
              project={this.state.currentProject}
              layoutName={name}
              setToolbar={this.setEditorToolbar}
              onPreview={(project, layout, options) => {
                this._launchLayoutPreview(project, layout, options);
                if (values.autosaveOnPreview && onAutoSaveProject) {
                  onAutoSaveProject(project);
                }
              }}
              showPreviewButton={!!this.props.previewLauncher}
              showNetworkPreviewButton={
                this._previewLauncher &&
                this._previewLauncher.canDoNetworkPreview()
              }
              onOpenDebugger={this.openDebugger}
              onOpenExternalEvents={this.openExternalEvents}
              onOpenLayout={name =>
                this.openLayout(name, {
                  openEventsEditor: true,
                  openSceneEditor: false,
                })
              }
              resourceSources={this.props.resourceSources}
              onChooseResource={this._onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
              openInstructionOrExpression={this._openInstructionOrExpression}
              onCreateEventsFunction={this._onCreateEventsFunction}
              isActive={isActive}
              ref={editorRef}
            />
          )}
        </PreferencesContext.Consumer>
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
    this.openProjectManager(false);
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
                })
              }
              resourceSources={this.props.resourceSources}
              onChooseResource={this._onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
              openInstructionOrExpression={this._openInstructionOrExpression}
              onCreateEventsFunction={this._onCreateEventsFunction}
              isActive={isActive}
              ref={editorRef}
            />
          ),
          key: 'external events ' + name,
        }),
      },
      () => this.updateToolbar()
    );
    this.openProjectManager(false);
  };

  openExternalLayout = (name: string) => {
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name,
          renderEditor: ({ isActive, editorRef }) => (
            <PreferencesContext.Consumer>
              {({ values }) => (
                <ExternalLayoutEditor
                  project={this.state.currentProject}
                  externalLayoutName={name}
                  setToolbar={this.setEditorToolbar}
                  onPreview={(project, layout, externalLayout, options) => {
                    this._launchExternalLayoutPreview(
                      project,
                      layout,
                      externalLayout,
                      options
                    );
                    if (
                      values.autosaveOnPreview &&
                      this.props.onAutoSaveProject
                    ) {
                      this.props.onAutoSaveProject(project);
                    }
                  }}
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
              )}
            </PreferencesContext.Consumer>
          ),
          key: 'external layout ' + name,
        }),
      },
      () => this.updateToolbar()
    );
    this.openProjectManager(false);
  };

  openEventsFunctionsExtension = (
    name: string,
    initiallyFocusedFunctionName?: string
  ) => {
    if (!this.props.eventsFunctionWriter) return;

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
              onReloadEventsFunctionsExtensions={
                this._loadProjectEventsFunctionsExtensions
              }
              initiallyFocusedFunctionName={initiallyFocusedFunctionName}
              openInstructionOrExpression={this._openInstructionOrExpression}
              onCreateEventsFunction={this._onCreateEventsFunction}
              ref={editorRef}
            />
          ),
          key: 'events functions extension ' + name,
        }),
      },
      () => this.updateToolbar()
    );
    this.openProjectManager(false);
  };

  openResources = () => {
    const { i18n } = this.props;
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name: i18n._(t`Resources`),
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
              onChooseResource={this._onChooseResource}
              resourceSources={this.props.resourceSources}
            />
          ),
          key: 'resources',
        }),
      },
      () => this.updateToolbar()
    );
  };

  openStartPage = () => {
    const { i18n } = this.props;
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name: i18n._(t`Start Page`),
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
              onOpenLanguageDialog={() => this.openLanguage()}
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
    const { i18n } = this.props;
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          name: i18n._(t`Debugger`),
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

  _openInstructionOrExpression = (
    extension: gdPlatformExtension,
    type: string
  ) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    const extensionName = extension.getName();
    if (currentProject.hasEventsFunctionsExtensionNamed(extensionName)) {
      // It's an events functions extension, open the editor for it.
      const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
        extensionName
      );
      const functionName = getFunctionNameFromType(type);

      const foundTab = getEventsFunctionsExtensionEditor(
        this.state.editorTabs,
        eventsFunctionsExtension
      );
      if (foundTab) {
        // Open the given function and focus the tab
        foundTab.editor.selectEventsFunctionByName(functionName);
        this.setState(state => ({
          editorTabs: changeCurrentTab(state.editorTabs, foundTab.tabIndex),
        }));
      } else {
        // Open a new editor for the extension and the given function
        this.openEventsFunctionsExtension(extensionName, functionName);
      }
    } else {
      // It's not an events functions extension, we should not be here.
      console.warn(
        `Extension with name=${extensionName} can not be opened (no editor for this)`
      );
    }
  };

  _onCreateEventsFunction = (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    // Names are assumed to be already validated
    const createNewExtension = !currentProject.hasEventsFunctionsExtensionNamed(
      extensionName
    );
    const extension = createNewExtension
      ? currentProject.insertNewEventsFunctionsExtension(extensionName, 0)
      : currentProject.getEventsFunctionsExtension(extensionName);

    if (createNewExtension) {
      extension.setFullName(extensionName);
      extension.setDescription(
        'Originally automatically extracted from events of the project'
      );
    }

    extension.insertEventsFunction(eventsFunction, 0);
    this._loadProjectEventsFunctionsExtensions();
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
    saveUiSettings(this.state.editorTabs);

    const { currentProject } = this.state;
    if (!currentProject) return;
    const { i18n } = this.props;

    if (this.props.saveDialog) {
      this._openSaveDialog();
    } else if (this.props.onSaveProject) {
      this.props.onSaveProject(currentProject).then(
        () => {
          this._showSnackMessage(i18n._(t`Project properly saved`));
        },
        err => {
          showErrorBox(
            i18n._(
              t`Unable to save the project! Please try again by choosing another location.`
            ),
            err
          );
        }
      );
    }
  };

  askToCloseProject = (cb: ?Function) => {
    if (!this.state.currentProject) return;
    const { i18n } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      i18n._(
        t`Close the project? Any changes that have not been saved will be lost.`
      )
    );
    if (!answer) return;

    const noop = () => {};
    this.closeProject(cb || noop);
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

  openLanguage = (open: boolean = true) => {
    this.setState({
      languageDialogOpen: open,
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
    saveUiSettings(this.state.editorTabs);
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
      eventsFunctionsExtensionsError,
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
              onDeleteEventsFunctionsExtension={
                this.deleteEventsFunctionsExtension
              }
              onDeleteExternalEvents={this.deleteExternalEvents}
              onRenameLayout={this.renameLayout}
              onRenameExternalLayout={this.renameExternalLayout}
              onRenameEventsFunctionsExtension={
                this.renameEventsFunctionsExtension
              }
              onRenameExternalEvents={this.renameExternalEvents}
              onSaveProject={this.save}
              onCloseProject={this.askToCloseProject}
              onExportProject={this.openExportDialog}
              onOpenPreferences={() => this.openPreferences(true)}
              onOpenResources={() => {
                this.openResources();
                this.openProjectManager(false);
              }}
              onOpenPlatformSpecificAssets={() =>
                this.openPlatformSpecificAssets()
              }
              onChangeSubscription={() => this.openSubscription(true)}
              eventsFunctionsExtensionsError={eventsFunctionsExtensionsError}
              onReloadEventsFunctionsExtensions={
                this._loadProjectEventsFunctionsExtensions
              }
              freezeUpdate={!projectManagerOpen}
            />
          )}
          {!currentProject && (
            <EmptyMessage>
              <Trans>To begin, open or create a new project.</Trans>
            </EmptyMessage>
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
                (this._resourceSourceDialogs[resourceSource.name] = dialog)
              }
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
        <LanguageDialog
          open={this.state.languageDialogOpen}
          onClose={languageChanged => {
            this.openLanguage(false);
            if (languageChanged) {
              this._languageDidChange();
            }
          }}
        />
        <AboutDialog
          open={aboutDialogOpen}
          onClose={() => this.openAboutDialog(false)}
          updateStatus={updateStatus}
        />
        <CloseConfirmDialog shouldPrompt={!!this.state.currentProject} />
        <ChangelogDialogContainer />
      </div>
    );
  }
}

export default MainFrame;
