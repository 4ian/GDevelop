// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import './MainFrame.css';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
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
import {
  ClosableTabs,
  ClosableTab,
  TabContentContainer,
} from '../UI/ClosableTabs';
import {
  getEditorTabsInitialState,
  openEditorTab,
  closeEditorTab,
  closeOtherEditorTabs,
  closeAllEditorTabs,
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
import { timePromise } from '../Utils/TimeFunction';
import newNameGenerator from '../Utils/NewNameGenerator';
import HelpFinder from '../HelpFinder';
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
import {
  type PreviewLauncherInterface,
  type PreviewLauncherProps,
  type PreviewLauncherComponent,
  type PreviewOptions,
} from '../Export/PreviewLauncher.flow';
import { type ResourceSource } from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type JsExtensionsLoader } from '../JsExtensionsLoader';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
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
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';
import { type ExportDialogWithoutExportsProps } from '../Export/ExportDialog';
import { type CreateProjectDialogWithComponentsProps } from '../ProjectCreation/CreateProjectDialog';
import { getStartupTimesSummary } from '../Utils/StartupTimes';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
} from '../ProjectsStorage';
import OpenFromStorageProviderDialog from '../ProjectsStorage/OpenFromStorageProviderDialog';
import SaveToStorageProviderDialog from '../ProjectsStorage/SaveToStorageProviderDialog';
import OpenConfirmDialog from '../ProjectsStorage/OpenConfirmDialog';
import verifyProjectContent from '../ProjectsStorage/ProjectContentChecker';
import { emptyPreviewButtonSettings } from './Toolbar/PreviewButtons';

const GD_STARTUP_TIMES = global.GD_STARTUP_TIMES || [];

const gd = global.gd;

const styles = {
  drawerContent: {
    width: 320,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

type State = {|
  createDialogOpen: boolean,
  exportDialogOpen: boolean,
  introDialogOpen: boolean,
  openConfirmDialogOpen: boolean,
  genericDialogOpen: boolean,
  loadingProject: boolean,
  previewLoading: boolean,
  currentProject: ?gdProject,
  currentFileMetadata: ?FileMetadata,
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
  openFromStorageProviderDialogOpen: boolean,
  saveToStorageProviderDialogOpen: boolean,
  platformSpecificAssetsDialogOpen: boolean,
  helpFinderDialogOpen: boolean,
  eventsFunctionsExtensionsError: ?Error,
  gdjsDevelopmentWatcherEnabled: boolean,
  isPreviewFirstSceneOverriden: boolean,
  previewFirstSceneName: string,
|};

type Props = {
  integratedEditor?: boolean,
  introDialog?: React.Element<*>,
  renderPreviewLauncher?: (
    props: PreviewLauncherProps,
    ref: (previewLauncher: ?PreviewLauncherInterface) => void
  ) => React.Element<PreviewLauncherComponent>,
  onEditObject?: gdObject => void,
  storageProviderOperations: StorageProviderOperations,
  storageProviders: Array<StorageProvider>,
  useStorageProvider: (?StorageProvider) => Promise<void>,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  loading?: boolean,
  requestUpdate?: () => void,
  renderExportDialog?: ExportDialogWithoutExportsProps => React.Node,
  renderCreateDialog?: CreateProjectDialogWithComponentsProps => React.Node,
  renderGDJSDevelopmentWatcher?: ?() => React.Node,
  extensionsLoader?: JsExtensionsLoader,
  initialFileMetadataToOpen: ?FileMetadata,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  i18n: I18n,
};

class MainFrame extends React.Component<Props, State> {
  state = {
    createDialogOpen: false,
    exportDialogOpen: false,
    introDialogOpen: false,
    openConfirmDialogOpen: false,
    genericDialogOpen: false,
    loadingProject: false,
    previewLoading: false,
    currentProject: null,
    currentFileMetadata: null,
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
    openFromStorageProviderDialogOpen: false,
    saveToStorageProviderDialogOpen: false,
    platformSpecificAssetsDialogOpen: false,
    helpFinderDialogOpen: false,
    eventsFunctionsExtensionsError: null,
    gdjsDevelopmentWatcherEnabled: false,
    isPreviewFirstSceneOverriden: false,
    previewFirstSceneName: '',
  };
  toolbar = null;
  _resourceSourceDialogs = {};
  _previewLauncher: ?PreviewLauncherInterface = null;

  componentWillMount() {
    if (!this.props.integratedEditor) this.openStartPage();
  }

  componentDidMount() {
    GD_STARTUP_TIMES.push(['MainFrameComponentDidMount', performance.now()]);

    const { initialFileMetadataToOpen } = this.props;

    this._loadExtensions()
      .catch(() => {
        /* Ignore errors */
      })
      .then(() => {
        // Enable the GDJS development watcher *after* the extensions are loaded,
        // to avoid the watcher interfering with the extension loading (by updating GDJS,
        // which could lead in the extension loading failing for some extensions as file
        // are removed/copied).
        this.setState({
          gdjsDevelopmentWatcherEnabled: true,
        });
      });
    if (initialFileMetadataToOpen) {
      this._openInitialFileMetadata(/* isAfterUserInteraction= */ false);
    } else if (this.props.introDialog && !Window.isDev())
      this._openIntroDialog(true);

    GD_STARTUP_TIMES.push([
      'MainFrameComponentDidMountFinished',
      performance.now(),
    ]);
    console.info('Startup times:', getStartupTimesSummary());
  }

  _openInitialFileMetadata = (isAfterUserInteraction: boolean) => {
    const { storageProviderOperations, initialFileMetadataToOpen } = this.props;

    if (!initialFileMetadataToOpen) return;

    if (
      !isAfterUserInteraction &&
      storageProviderOperations.doesInitialOpenRequireUserInteraction
    ) {
      this._openOpenConfirmDialog(true);
      return;
    }

    this.openFromFileMetadata(initialFileMetadataToOpen).then(() =>
      this.openSceneOrProjectManager()
    );
  };

  _languageDidChange() {
    // A change in the language will automatically be applied
    // on all React components, as it's handled by GDI18nProvider.
    // We still have this method that will be called when the language
    // dialog is closed after a language change. We then reload GDevelop
    // extensions so that they declare all objects/actions/condition/etc...
    // using the new language.
    gd.JsPlatform.get().reloadBuiltinExtensions();
    this._loadExtensions().catch(() => {});
  }

  _loadExtensions = (): Promise<void> => {
    const { extensionsLoader, i18n } = this.props;
    if (!extensionsLoader) {
      console.info(
        'No extensions loader specified, skipping extensions loading.'
      );
      return Promise.reject(new Error('No extension loader specified.'));
    }

    return extensionsLoader
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
    fileMetadata: ?FileMetadata
  ): Promise<void> => {
    return timePromise(
      () => {
        const newProject = gd.ProjectHelper.createNewGDJSProject();
        newProject.unserializeFrom(serializedProject);

        return this.loadFromProject(newProject, fileMetadata);
      },
      time => console.info(`Unserialization took ${time} ms`)
    );
  };

  loadFromProject = (
    project: gdProject,
    fileMetadata: ?FileMetadata
  ): Promise<void> => {
    const { eventsFunctionsExtensionsState } = this.props;

    return this.closeProject().then(() => {
      // Make sure that the ResourcesLoader cache is emptied, so that
      // the URL to a resource with a name in the old project is not re-used
      // for another resource with the same name in the new project.
      ResourcesLoader.burstAllUrlsCache();
      // TODO: Pixi cache should also be burst

      return new Promise(resolve => {
        this.setState(
          {
            currentProject: project,
            currentFileMetadata: fileMetadata,
          },
          () => {
            // Load all the EventsFunctionsExtension when the game is loaded. If they are modified,
            // their editor will take care of reloading them.
            eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
              project
            );

            if (fileMetadata) {
              project.setProjectFile(fileMetadata.fileIdentifier);
            }

            resolve();
          }
        );
      });
    });
  };

  openFromFileMetadata = (fileMetadata: FileMetadata): Promise<void> => {
    const { i18n, storageProviderOperations } = this.props;
    const {
      hasAutoSave,
      onGetAutoSave,
      onOpen,
      getOpenErrorMessage,
    } = storageProviderOperations;

    if (!onOpen) {
      console.error(
        'Tried to open a file for a storage without onOpen support:',
        fileMetadata,
        storageProviderOperations
      );
      return Promise.resolve();
    }

    const checkForAutosave = (): Promise<FileMetadata> => {
      if (!hasAutoSave || !onGetAutoSave) {
        return Promise.resolve(fileMetadata);
      }

      return hasAutoSave(fileMetadata, true).then(canOpenAutosave => {
        if (!canOpenAutosave) return fileMetadata;

        //eslint-disable-next-line
        const answer = confirm(
          i18n._(
            t`An autosave file (backup made automatically by GDevelop) that is newer than the project file exists. Would you like to load it instead?`
          )
        );
        if (!answer) return fileMetadata;

        return onGetAutoSave(fileMetadata);
      });
    };

    const checkForAutosaveAfterFailure = (): Promise<?FileMetadata> => {
      if (!hasAutoSave || !onGetAutoSave) {
        return Promise.resolve(null);
      }

      return hasAutoSave(fileMetadata, false).then(canOpenAutosave => {
        if (!canOpenAutosave) return null;

        //eslint-disable-next-line
        const answer = confirm(
          i18n._(
            t`The project file appears to be malformed, but an autosave file exists (backup made automatically by GDevelop). Would you like to try to load it instead?`
          )
        );
        if (!answer) return null;

        return onGetAutoSave(fileMetadata);
      });
    };

    this.setState({ loadingProject: true });

    // Try to find an autosave (and ask user if found)
    return checkForAutosave()
      .then(fileMetadata => onOpen(fileMetadata))
      .catch(err => {
        // onOpen failed, tried to find again an autosave
        return checkForAutosaveAfterFailure().then(fileMetadata => {
          if (fileMetadata) {
            return onOpen(fileMetadata);
          }

          throw err;
        });
      })
      .then(({ content }) => {
        if (!verifyProjectContent(i18n, content)) {
          // The content is not recognized and the user was warned. Abort the opening.
          return;
        }

        const serializedProject = gd.Serializer.fromJSObject(content);
        return this.loadFromSerializedProject(
          serializedProject,
          // Note that fileMetadata is the original, unchanged one, even if we're loading
          // an autosave. If we're for some reason loading an autosave, we still consider
          // that we're opening the file that was originally requested by the user.
          fileMetadata
        ).then(
          () => {
            serializedProject.delete();
          },
          err => {
            serializedProject.delete();
            throw err;
          }
        );
      })
      .catch(error => {
        const errorMessage = getOpenErrorMessage
          ? getOpenErrorMessage(error)
          : t`Check that the path/URL is correct, that you selected a file that is a game file created with GDevelop and that is was not removed.`;
        showErrorBox(
          [i18n._(t`Unable to open the project.`), i18n._(errorMessage)].join(
            '\n'
          ),
          error
        );
      })
      .then(() => this.setState({ loadingProject: false }));
  };

  closeApp = (): void => {
    return Window.quit();
  };

  closeProject = (): Promise<void> => {
    const { currentProject } = this.state;
    const { eventsFunctionsExtensionsState } = this.props;
    if (!currentProject) return Promise.resolve();

    return new Promise(resolve => {
      this.openProjectManager(false);
      this.setState(
        {
          editorTabs: closeProjectTabs(this.state.editorTabs, currentProject),
        },
        () => {
          eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtensions(
            currentProject
          );
          currentProject.delete();
          this.setState(
            {
              currentProject: null,
              isPreviewFirstSceneOverriden: false,
              previewFirstSceneName: '',
            },
            () => {
              this.updateToolbar();
              resolve();
            }
          );
        }
      );
    });
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

  _togglePreviewFirstSceneOverride = () => {
    this.setState(
      {
        isPreviewFirstSceneOverriden: !this.state.isPreviewFirstSceneOverriden,
      },
      () => {
        this.updateToolbar();
      }
    );
  };

  addLayout = () => {
    const { currentProject } = this.state;
    if (!currentProject) return;

    const name = newNameGenerator('New scene', name =>
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

    const name = newNameGenerator('NewExtension', name =>
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
    const { i18n, eventsFunctionsExtensionsState } = this.props;
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

    // Reload extensions to make sure the deleted extension is removed
    // from the platform
    eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
      currentProject
    );
  };

  renameLayout = (oldName: string, newName: string) => {
    const { currentProject } = this.state;
    const { i18n } = this.props;
    if (!currentProject) return;

    if (!currentProject.hasLayoutNamed(oldName) || newName === oldName) return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

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

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

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

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

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
    const { eventsFunctionsExtensionsState } = this.props;
    if (!currentProject) return;

    if (
      !currentProject.hasEventsFunctionsExtensionNamed(oldName) ||
      newName === oldName
    )
      return;

    if (newName === '') {
      showWarningBox(
        i18n._(t`This name cannot be empty, please enter a new name.`)
      );
      return;
    }

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
        eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
          currentProject
        );

        this.forceUpdate();
      }
    );
  };

  _launchLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ) => {
    const { _previewLauncher } = this;
    const { previewFirstSceneName, isPreviewFirstSceneOverriden } = this.state;

    if (!_previewLauncher) return;

    this.setState(
      {
        previewLoading: true,
      },
      () => {
        let previewedLayout = layout;
        if (previewFirstSceneName && isPreviewFirstSceneOverriden) {
          if (project.hasLayoutNamed(previewFirstSceneName)) {
            previewedLayout = project.getLayout(previewFirstSceneName);
          }
        }

        _previewLauncher
          .launchLayoutPreview(project, previewedLayout, options)
          .catch(error => {
            console.error(
              'Error caught while launching preview, this should never happen.',
              error
            );
          })
          .then(() => {
            this.setState({
              previewLoading: false,
            });
          });
      }
    );
  };

  _launchExternalLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ) => {
    const { _previewLauncher } = this;
    if (!_previewLauncher) return;

    this.setState(
      {
        previewLoading: true,
      },
      () => {
        _previewLauncher
          .launchExternalLayoutPreview(project, layout, externalLayout, options)
          .catch(error => {
            console.error(
              'Error caught while launching preview, this should never happen.',
              error
            );
          })
          .then(() => {
            this.setState({
              previewLoading: false,
            });
          });
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
    const { i18n, storageProviderOperations } = this.props;
    const sceneEditorOptions = {
      label: name,
      renderEditor: ({ isActive, editorRef }) => (
        <PreferencesContext.Consumer>
          {({ values }) => (
            <SceneEditor
              previewButtonSettings={{
                isPreviewFirstSceneOverriden: this.state
                  .isPreviewFirstSceneOverriden,
                togglePreviewFirstSceneOverride: () =>
                  this._togglePreviewFirstSceneOverride(),
                previewFirstSceneName: this.state.previewFirstSceneName,
                useSceneAsPreviewFirstScene: () => {
                  this._setPreviewFirstScene(name);
                },
              }}
              project={this.state.currentProject}
              layoutName={name}
              setToolbar={this.setEditorToolbar}
              onPreview={(project, layout, options) => {
                this._launchLayoutPreview(project, layout, options);
                const { currentFileMetadata } = this.state;
                if (
                  values.autosaveOnPreview &&
                  storageProviderOperations.onAutoSaveProject &&
                  currentFileMetadata
                ) {
                  storageProviderOperations.onAutoSaveProject(
                    project,
                    currentFileMetadata
                  );
                }
              }}
              showPreviewButton={!!this.props.renderPreviewLauncher}
              showNetworkPreviewButton={
                this._previewLauncher &&
                this._previewLauncher.canDoNetworkPreview()
              }
              onOpenDebugger={this.openDebugger}
              onEditObject={this.props.onEditObject}
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
      label: name + ' ' + i18n._(t`(Events)`),
      renderEditor: ({ isActive, editorRef }) => (
        <PreferencesContext.Consumer>
          {({ values }) => (
            <EventsEditor
              project={this.state.currentProject}
              layoutName={name}
              setToolbar={this.setEditorToolbar}
              previewButtonSettings={{
                isPreviewFirstSceneOverriden: this.state
                  .isPreviewFirstSceneOverriden,
                togglePreviewFirstSceneOverride: () =>
                  this._togglePreviewFirstSceneOverride(),
                previewFirstSceneName: this.state.previewFirstSceneName,
                useSceneAsPreviewFirstScene: () => {
                  this._setPreviewFirstScene(name);
                },
              }}
              onPreview={(project, layout, options) => {
                this._launchLayoutPreview(project, layout, options);
                const { currentFileMetadata } = this.state;
                if (
                  values.autosaveOnPreview &&
                  storageProviderOperations.onAutoSaveProject &&
                  currentFileMetadata
                ) {
                  storageProviderOperations.onAutoSaveProject(
                    project,
                    currentFileMetadata
                  );
                }
              }}
              showPreviewButton={!!this.props.renderPreviewLauncher}
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
          label: name,
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
              previewButtonSettings={emptyPreviewButtonSettings}
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
    const { storageProviderOperations } = this.props;
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          label: name,
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
                    const { currentFileMetadata } = this.state;
                    if (
                      values.autosaveOnPreview &&
                      storageProviderOperations.onAutoSaveProject &&
                      currentFileMetadata
                    ) {
                      storageProviderOperations.onAutoSaveProject(
                        project,
                        currentFileMetadata
                      );
                    }
                  }}
                  showPreviewButton={!!this.props.renderPreviewLauncher}
                  showNetworkPreviewButton={
                    this._previewLauncher &&
                    this._previewLauncher.canDoNetworkPreview()
                  }
                  previewButtonSettings={emptyPreviewButtonSettings}
                  onOpenDebugger={this.openDebugger}
                  onEditObject={this.props.onEditObject}
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
    initiallyFocusedFunctionName?: string,
    initiallyFocusedBehaviorName?: ?string
  ) => {
    const { i18n, eventsFunctionsExtensionsState } = this.props;
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          label: name + ' ' + i18n._(t`(Extension)`),
          renderEditor: ({ isActive, editorRef }) => (
            <EventsFunctionsExtensionEditor
              project={this.state.currentProject}
              eventsFunctionsExtensionName={name}
              setToolbar={this.setEditorToolbar}
              resourceSources={this.props.resourceSources}
              onChooseResource={this._onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
              isActive={isActive}
              initiallyFocusedFunctionName={initiallyFocusedFunctionName}
              initiallyFocusedBehaviorName={initiallyFocusedBehaviorName}
              openInstructionOrExpression={this._openInstructionOrExpression}
              onCreateEventsFunction={this._onCreateEventsFunction}
              ref={editorRef}
              onLoadEventsFunctionsExtensions={() => {
                eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
                  this.state.currentProject
                );
              }}
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
          label: i18n._(t`Resources`),
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
    const { i18n, storageProviders } = this.props;
    this.setState(
      {
        editorTabs: openEditorTab(this.state.editorTabs, {
          label: i18n._(t`Start Page`),
          renderEditor: ({ isActive, editorRef }) => (
            <StartPage
              project={this.state.currentProject}
              setToolbar={this.setEditorToolbar}
              canOpen={
                !!storageProviders.filter(
                  ({ hiddenInOpenDialog }) => !hiddenInOpenDialog
                ).length
              }
              onOpen={this.chooseProject}
              onCreate={() => this.openCreateDialog()}
              onOpenProjectManager={() => this.openProjectManager()}
              onCloseProject={() => {
                this.askToCloseProject();
              }}
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
          label: i18n._(t`Debugger`),
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
        foundTab.editor.selectEventsFunctionByName(
          functionName.name,
          functionName.behaviorName
        );
        this.setState(state => ({
          editorTabs: changeCurrentTab(state.editorTabs, foundTab.tabIndex),
        }));
      } else {
        // Open a new editor for the extension and the given function
        this.openEventsFunctionsExtension(
          extensionName,
          functionName.name,
          functionName.behaviorName
        );
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
    const { eventsFunctionsExtensionsState } = this.props;

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
    eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
      currentProject
    );
  };

  openCreateDialog = (open: boolean = true) => {
    this.setState({
      createDialogOpen: open,
    });
  };

  chooseProject = () => {
    const { storageProviders } = this.props;

    if (
      storageProviders.filter(({ hiddenInOpenDialog }) => !hiddenInOpenDialog)
        .length > 1
    ) {
      this.openOpenFromStorageProviderDialog();
    } else {
      this.chooseProjectWithStorageProviderPicker();
    }
  };

  chooseProjectWithStorageProviderPicker = () => {
    const { storageProviderOperations, i18n } = this.props;
    if (!storageProviderOperations.onOpenWithPicker) return;

    storageProviderOperations
      .onOpenWithPicker()
      .then(fileMetadata => {
        if (!fileMetadata) return;

        return this.openFromFileMetadata(fileMetadata).then(() =>
          this.openSceneOrProjectManager()
        );
      })
      .catch(error => {
        const errorMessage = storageProviderOperations.getOpenErrorMessage
          ? storageProviderOperations.getOpenErrorMessage(error)
          : t`Verify that you have the authorizations for reading the file you're trying to access.`;
        showErrorBox(
          [i18n._(t`Unable to open the project.`), i18n._(errorMessage)].join(
            '\n'
          ),
          error
        );
      });
  };

  saveProject = () => {
    const { currentProject, currentFileMetadata } = this.state;
    if (!currentProject) return;
    if (!currentFileMetadata) {
      return this.saveProjectAs();
    }

    const { i18n, storageProviderOperations } = this.props;
    const { onSaveProject } = storageProviderOperations;
    if (!onSaveProject) {
      return this.saveProjectAs();
    }

    saveUiSettings(this.state.editorTabs);
    this._showSnackMessage(i18n._(t`Saving...`));

    onSaveProject(currentProject, currentFileMetadata).then(
      ({ wasSaved }) => {
        if (wasSaved) {
          this._showSnackMessage(i18n._(t`Project properly saved`));
        }
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
  };

  saveProjectAs = () => {
    const { currentProject } = this.state;
    const { storageProviders, storageProviderOperations } = this.props;
    if (!currentProject) return;

    if (
      storageProviders.filter(({ hiddenInSaveDialog }) => !hiddenInSaveDialog)
        .length > 1 ||
      !storageProviderOperations.onSaveProjectAs
    ) {
      this.openSaveToStorageProviderDialog();
    } else {
      this.saveProjectAsWithStorageProvider();
    }
  };

  saveProjectAsWithStorageProvider = () => {
    const { currentProject, currentFileMetadata } = this.state;
    if (!currentProject) return;

    saveUiSettings(this.state.editorTabs);
    const { i18n, storageProviderOperations } = this.props;

    if (!storageProviderOperations.onSaveProjectAs) {
      return;
    }

    storageProviderOperations
      .onSaveProjectAs(currentProject, currentFileMetadata)
      .then(
        ({ wasSaved, fileMetadata }) => {
          if (wasSaved) {
            this._showSnackMessage(i18n._(t`Project properly saved`));

            if (fileMetadata) {
              this.setState({
                currentFileMetadata: fileMetadata,
              });
            }
          }
        },
        err => {
          showErrorBox(
            i18n._(
              t`Unable to save as the project! Please try again by choosing another location.`
            ),
            err
          );
        }
      );
  };

  askToCloseProject = (): Promise<void> => {
    if (!this.state.currentProject) return Promise.resolve();
    const { i18n } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      i18n._(
        t`Close the project? Any changes that have not been saved will be lost.`
      )
    );
    if (!answer) return Promise.resolve();

    return this.closeProject();
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

  _openOpenConfirmDialog = (open: boolean = true) => {
    this.setState({
      openConfirmDialogOpen: open,
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

  _setPreviewFirstScene = (name: string) => {
    this.setState(
      {
        previewFirstSceneName: name,
        isPreviewFirstSceneOverriden: true,
      },
      () => {
        this.updateToolbar();
      }
    );
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

  _onCloseOtherEditorTabs = (editorTab: EditorTab) => {
    saveUiSettings(this.state.editorTabs);
    this.setState(
      {
        editorTabs: closeOtherEditorTabs(this.state.editorTabs, editorTab),
      },
      () => this.updateToolbar()
    );
  };

  _onCloseAllEditorTabs = () => {
    saveUiSettings(this.state.editorTabs);
    this.setState(
      {
        editorTabs: closeAllEditorTabs(this.state.editorTabs),
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

  openOpenFromStorageProviderDialog = (open: boolean = true) => {
    this.setState({
      openFromStorageProviderDialogOpen: open,
    });
  };

  openSaveToStorageProviderDialog = (open: boolean = true) => {
    if (open) {
      // Ensure the project manager is closed as Google Drive storage provider
      // display a picker that does not play nice with material-ui's overlays.
      this.openProjectManager(false);
    }
    this.setState({
      saveToStorageProviderDialogOpen: open,
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
      currentFileMetadata,
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
      renderExportDialog,
      renderCreateDialog,
      introDialog,
      resourceSources,
      renderPreviewLauncher,
      resourceExternalEditors,
      eventsFunctionsExtensionsState,
      useStorageProvider,
      i18n,
      renderGDJSDevelopmentWatcher,
    } = this.props;
    const showLoader =
      this.state.loadingProject ||
      this.state.previewLoading ||
      this.props.loading;

    return (
      <div className="main-frame">
        <ProjectTitlebar fileMetadata={currentFileMetadata} />
        <Drawer
          open={projectManagerOpen}
          PaperProps={{
            style: styles.drawerContent,
          }}
          onClose={this.toggleProjectManager}
        >
          <EditorBar
            title={currentProject ? currentProject.getName() : 'No project'}
            displayRightCloseButton
            onClose={this.toggleProjectManager}
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
              onSaveProject={this.saveProject}
              onSaveProjectAs={this.saveProjectAs}
              onCloseProject={() => {
                this.askToCloseProject();
              }}
              onExportProject={this.openExportDialog}
              onOpenPreferences={() => this.openPreferences(true)}
              onOpenProfile={() => this.openProfile(true)}
              onOpenResources={() => {
                this.openResources();
                this.openProjectManager(false);
              }}
              onOpenPlatformSpecificAssets={() =>
                this.openPlatformSpecificAssets()
              }
              onChangeSubscription={() => this.openSubscription(true)}
              eventsFunctionsExtensionsError={eventsFunctionsExtensionsError}
              onReloadEventsFunctionsExtensions={() => {
                // Check if load is sufficient
                eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
                  currentProject
                );
              }}
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
        <ClosableTabs hideLabels={!!this.props.integratedEditor}>
          {getEditors(this.state.editorTabs).map((editorTab, id) => {
            const isCurrentTab =
              getCurrentTabIndex(this.state.editorTabs) === id;
            return (
              <ClosableTab
                label={editorTab.label}
                key={editorTab.key}
                active={isCurrentTab}
                onClick={() => this._onChangeEditorTab(id)}
                onClose={() => this._onCloseEditorTab(editorTab)}
                onCloseOthers={() => this._onCloseOtherEditorTabs(editorTab)}
                onCloseAll={this._onCloseAllEditorTabs}
                onActivated={() => this._onEditorTabActive(editorTab)}
                closable={editorTab.closable}
              />
            );
          })}
        </ClosableTabs>
        {getEditors(this.state.editorTabs).map((editorTab, id) => {
          const isCurrentTab = getCurrentTabIndex(this.state.editorTabs) === id;
          return (
            <TabContentContainer key={editorTab.key} active={isCurrentTab}>
              <ErrorBoundary>{editorTab.render(isCurrentTab)}</ErrorBoundary>
            </TabContentContainer>
          );
        })}
        <LoaderModal show={showLoader} />
        <HelpFinder
          open={helpFinderDialogOpen}
          onClose={() => this.openHelpFinderDialog(false)}
        />
        <Snackbar
          open={this.state.snackMessageOpen}
          autoHideDuration={3000}
          onClose={this._closeSnackMessage}
          ContentProps={{
            'aria-describedby': 'snackbar-message',
          }}
          message={<span id="snackbar-message">{this.state.snackMessage}</span>}
        />
        {!!renderExportDialog &&
          this.state.exportDialogOpen &&
          renderExportDialog({
            onClose: () => this.openExportDialog(false),
            onChangeSubscription: () => {
              this.openExportDialog(false);
              this.openSubscription(true);
            },
            project: this.state.currentProject,
          })}
        {!!renderCreateDialog &&
          this.state.createDialogOpen &&
          renderCreateDialog({
            open: this.state.createDialogOpen,
            onClose: () => this.openCreateDialog(false),
            onOpen: (storageProvider, fileMetadata) => {
              this.openCreateDialog(false);
              // eslint-disable-next-line
              useStorageProvider(storageProvider)
                .then(() => this.openFromFileMetadata(fileMetadata))
                .then(() => this.openSceneOrProjectManager());
            },
            onCreate: (project, storageProvider, fileMetadata) => {
              this.openCreateDialog(false);
              // eslint-disable-next-line
              useStorageProvider(storageProvider)
                .then(() => this.loadFromProject(project, fileMetadata))
                .then(() => this.openSceneOrProjectManager());
            },
          })}
        {!!introDialog &&
          React.cloneElement(introDialog, {
            open: this.state.introDialogOpen,
            onClose: () => this._openIntroDialog(false),
          })}
        {!!this.state.currentProject &&
          this.state.platformSpecificAssetsDialogOpen && (
            <PlatformSpecificAssetsDialog
              project={this.state.currentProject}
              open
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
        {!!renderPreviewLauncher &&
          renderPreviewLauncher(
            {
              onExport: () => this.openExportDialog(true),
              onChangeSubscription: () => this.openSubscription(true),
            },
            (previewLauncher: ?PreviewLauncherInterface) => {
              this._previewLauncher = previewLauncher;
            }
          )}
        {resourceSources.map(
          (resourceSource, index): React.Node => {
            const Component = resourceSource.component;
            return (
              <Component
                key={resourceSource.name}
                ref={dialog =>
                  (this._resourceSourceDialogs[resourceSource.name] = dialog)
                }
                i18n={i18n}
              />
            );
          }
        )}
        {profileDialogOpen && (
          <ProfileDialog
            open
            onClose={() => this.openProfile(false)}
            onChangeSubscription={() => this.openSubscription(true)}
          />
        )}
        {subscriptionDialogOpen && (
          <SubscriptionDialog
            onClose={() => {
              this.openSubscription(false);
            }}
            open
          />
        )}
        {this.state.preferencesDialogOpen && (
          <PreferencesDialog onClose={() => this.openPreferences(false)} />
        )}
        {this.state.languageDialogOpen && (
          <LanguageDialog
            open
            onClose={languageChanged => {
              this.openLanguage(false);
              if (languageChanged) {
                this._languageDidChange();
              }
            }}
          />
        )}
        {aboutDialogOpen && (
          <AboutDialog
            open
            onClose={() => this.openAboutDialog(false)}
            updateStatus={updateStatus}
          />
        )}
        {this.state.openFromStorageProviderDialogOpen && (
          <OpenFromStorageProviderDialog
            onClose={() => this.openOpenFromStorageProviderDialog(false)}
            storageProviders={this.props.storageProviders}
            onChooseProvider={storageProvider => {
              this.openOpenFromStorageProviderDialog(false);
              useStorageProvider(storageProvider).then(() => {
                this.chooseProjectWithStorageProviderPicker();
              });
            }}
            onCreateNewProject={() => {
              this.openOpenFromStorageProviderDialog(false);
              this.openCreateDialog(true);
            }}
          />
        )}
        {this.state.saveToStorageProviderDialogOpen && (
          <SaveToStorageProviderDialog
            onClose={() => this.openSaveToStorageProviderDialog(false)}
            storageProviders={this.props.storageProviders}
            onChooseProvider={storageProvider => {
              this.openSaveToStorageProviderDialog(false);
              useStorageProvider(storageProvider).then(() => {
                this.saveProjectAsWithStorageProvider();
              });
            }}
          />
        )}
        {this.state.openConfirmDialogOpen && (
          <OpenConfirmDialog
            onClose={() => {
              this._openOpenConfirmDialog(false);
            }}
            onConfirm={() => {
              this._openOpenConfirmDialog(false);
              this._openInitialFileMetadata(/* isAfterUserInteraction= */ true);
            }}
          />
        )}
        <CloseConfirmDialog shouldPrompt={!!this.state.currentProject} />
        <ChangelogDialogContainer />
        {this.state.gdjsDevelopmentWatcherEnabled &&
          renderGDJSDevelopmentWatcher &&
          renderGDJSDevelopmentWatcher()}
      </div>
    );
  }
}

export default MainFrame;
