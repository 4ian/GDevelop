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
import { type UnsavedChanges } from './UnsavedChangesContext';
import { type MainMenuProps } from './MainMenu.flow';
import { emptyPreviewButtonSettings } from './Toolbar/PreviewButtons';
import useForceUpdate from '../Utils/UseForceUpdate';
import useStateWithCallback from '../Utils/UseSetStateWithCallback';

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

export type State = {|
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
  renderMainMenu?: MainMenuProps => React.Node,
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
  unsavedChanges?: UnsavedChanges,
};

const MainFrame = (props: Props) => {
  const [state, setState]: [
    State,
    ((State => State) | State) => Promise<State>,
  ] = useStateWithCallback({
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
  });
  const toolbar = React.useRef(null);
  const _resourceSourceDialogs = React.useRef({});
  const _previewLauncher = React.useRef((null: ?PreviewLauncherInterface));
  //const { addRecentFile } = React.useContext(PreferencesContext);
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    console.log(state);
  });

  React.useEffect(() => {
    (async () => {
      if (!props.integratedEditor) openStartPage();
      GD_STARTUP_TIMES.push(['MainFrameComponentDidMount', performance.now()]);
      const { initialFileMetadataToOpen } = props;
      try {
        await _loadExtensions();
        // Enable the GDJS development watcher *after* the extensions are loaded,
        // to avoid the watcher interfering with the extension loading (by updating GDJS,
        // which could lead in the extension loading failing for some extensions as file
        // are removed/copied).
        await setState(state => ({
          ...state,
          gdjsDevelopmentWatcherEnabled: true,
        }));
        if (initialFileMetadataToOpen) {
          _openInitialFileMetadata(/* isAfterUserInteraction= */ false);
        } else if (props.introDialog && !Window.isDev()) _openIntroDialog(true);

        GD_STARTUP_TIMES.push([
          'MainFrameComponentDidMountFinished',
          performance.now(),
        ]);
        console.info('Startup times:', getStartupTimesSummary());
      } catch {
        /* Ignore errors */
      }
    })();
  }, []);

  const _openInitialFileMetadata = (isAfterUserInteraction: boolean) => {
    const { storageProviderOperations, initialFileMetadataToOpen } = props;

    if (!initialFileMetadataToOpen) return;

    if (
      !isAfterUserInteraction &&
      storageProviderOperations.doesInitialOpenRequireUserInteraction
    ) {
      _openOpenConfirmDialog(true);
      return;
    }

    openFromFileMetadata(initialFileMetadataToOpen).then(state =>
      openSceneOrProjectManager(state)
    );
  };

  React.useEffect(
    () => {
      updateToolbar();
    },
    [
      state.editorTabs,
      state.isPreviewFirstSceneOverriden,
      state.previewFirstSceneName,
      state.currentProject,
    ]
  );

  const _languageDidChange = () => {
    // A change in the language will automatically be applied
    // on all React components, as it's handled by GDI18nProvider.
    // We still have this method that will be called when the language
    // dialog is closed after a language change. We then reload GDevelop
    // extensions so that they declare all objects/actions/condition/etc...
    // using the new language.
    gd.JsPlatform.get().reloadBuiltinExtensions();
    _loadExtensions().catch(() => {});
  };

  const _loadExtensions = (): Promise<void> => {
    const { extensionsLoader, i18n } = props;
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

  const loadFromSerializedProject = (
    serializedProject: gdSerializerElement,
    fileMetadata: ?FileMetadata,
    newState: State = state
  ): Promise<State> => {
    return timePromise(
      () => {
        const newProject = gd.ProjectHelper.createNewGDJSProject();
        newProject.unserializeFrom(serializedProject);
        return loadFromProject(newProject, fileMetadata, newState);
      },
      time => console.info(`Unserialization took ${time} ms`)
    );
  };

  const loadFromProject = async (
    project: gdProject,
    fileMetadata: ?FileMetadata,
    newState: State = state
  ): Promise<State> => {
    const { eventsFunctionsExtensionsState } = props;

    newState = await closeProject(newState);
    // Make sure that the ResourcesLoader cache is emptied, so that
    // the URL to a resource with a name in the old project is not re-used
    // for another resource with the same name in the new project.
    ResourcesLoader.burstAllUrlsCache();
    // TODO: Pixi cache should also be burst
    debugger;
    newState = await setState({
      ...newState,
      currentProject: project,
      currentFileMetadata: fileMetadata,
    });

    eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
      project
    );
    if (fileMetadata) {
      project.setProjectFile(fileMetadata.fileIdentifier);
    }
    return newState;
  };

  const openFromFileMetadata = async (
    fileMetadata: FileMetadata
  ): Promise<any> => {
    const { i18n, storageProviderOperations } = props;
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
      return Promise.resolve(state);
    }

    const checkForAutosave = (): Promise<FileMetadata> => {
      if (!hasAutoSave || !onGetAutoSave) {
        return Promise.resolve(fileMetadata);
      }

      return hasAutoSave(fileMetadata, true).then(canOpenAutosave => {
        if (!canOpenAutosave) return fileMetadata;

        const answer = Window.showConfirmDialog(
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

        const answer = Window.showConfirmDialog(
          i18n._(
            t`The project file appears to be malformed, but an autosave file exists (backup made automatically by GDevelop). Would you like to try to load it instead?`
          )
        );
        if (!answer) return null;

        return onGetAutoSave(fileMetadata);
      });
    };

    let newState = await setState(state => ({
      ...state,
      loadingProject: true,
    }));
    let _fileMetadata = await checkForAutosave();
    let content;
    try {
      // Try to find an autosave (and ask user if found)
      content = (await onOpen(_fileMetadata)).content;
      if (!verifyProjectContent(i18n, content)) return Promise.resolve(state);
    } catch (err) {
      // onOpen failed, tried to find again an autosave
      _fileMetadata = await checkForAutosaveAfterFailure();
      if (_fileMetadata) {
        content = (await onOpen(_fileMetadata)).content;
      } else throw err;
    }
    const serializedProject = gd.Serializer.fromJSObject(content);
    try {
      newState = await loadFromSerializedProject(
        serializedProject,
        // Note that fileMetadata is the original, unchanged one, even if we're loading
        // an autosave. If we're for some reason loading an autosave, we still consider
        // that we're opening the file that was originally requested by the user.
        _fileMetadata,
        newState
      );
      console.log(newState);
      serializedProject.delete();
      return await setState({ ...newState, loadingProject: false });
    } catch (error) {
      serializedProject.delete();
      const errorMessage = getOpenErrorMessage
        ? getOpenErrorMessage(error)
        : t`Check that the path/URL is correct, that you selected a file that is a game file created with GDevelop and that is was not removed.`;
      showErrorBox(
        [i18n._(t`Unable to open the project.`), i18n._(errorMessage)].join(
          '\n'
        ),
        error
      );
    }
  };

  const closeApp = (): void => {
    return Window.quit();
  };

  const closeProject = async (newState: State = state): Promise<State> => {
    let { currentProject } = newState;

    const { eventsFunctionsExtensionsState } = props;
    if (!currentProject) return Promise.resolve(newState);

    openProjectManager(false);
    newState = await setState(state => ({
      ...state,
      editorTabs: closeProjectTabs(state.editorTabs, currentProject),
    }));

    if (newState.currentProject) {
      eventsFunctionsExtensionsState.unloadProjectEventsFunctionsExtensions(
        newState.currentProject
      );
    }

    if (newState.currentProject) newState.currentProject.delete();

    return await setState(state => ({
      ...state,
      currentProject: null,
      isPreviewFirstSceneOverriden: false,
      previewFirstSceneName: '',
    }));
  };

  const getSerializedElements = () => {
    const editorTab = getCurrentTab(state.editorTabs);
    if (!editorTab || !editorTab.editorRef) {
      console.warn('No active editor or reference to the editor');
      return {};
    }

    return editorTab.editorRef.getSerializedElements();
  };

  const toggleProjectManager = () => {
    if (toolbar.current)
      setState(state => ({
        ...state,
        projectManagerOpen: !state.projectManagerOpen,
      }));
  };

  const openProjectManager = (open: boolean = true) => {
    setState(state => ({
      ...state,
      projectManagerOpen: open,
    }));
  };

  const setEditorToolbar = (editorToolbar: any) => {
    if (!toolbar.current) return;

    toolbar.current.setEditorToolbar(editorToolbar);
  };

  const _togglePreviewFirstSceneOverride = () => {
    setState(state => ({
      ...state,
      isPreviewFirstSceneOverriden: !state.isPreviewFirstSceneOverriden,
    }));
  };

  const addLayout = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('New scene', name =>
      currentProject.hasLayoutNamed(name)
    );
    const newLayout = currentProject.insertNewLayout(
      name,
      currentProject.getLayoutsCount()
    );
    newLayout.updateBehaviorsSharedData(currentProject);
    _onProjectItemModified();
  };

  const addExternalLayout = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExternalLayout', name =>
      currentProject.hasExternalLayoutNamed(name)
    );
    currentProject.insertNewExternalLayout(
      name,
      currentProject.getExternalLayoutsCount()
    );
    _onProjectItemModified();
  };

  const addExternalEvents = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExternalEvents', name =>
      currentProject.hasExternalEventsNamed(name)
    );
    currentProject.insertNewExternalEvents(
      name,
      currentProject.getExternalEventsCount()
    );
    _onProjectItemModified();
  };

  const addEventsFunctionsExtension = () => {
    const { currentProject } = state;
    if (!currentProject) return;

    const name = newNameGenerator('NewExtension', name =>
      currentProject.hasEventsFunctionsExtensionNamed(name)
    );
    currentProject.insertNewEventsFunctionsExtension(
      name,
      currentProject.getEventsFunctionsExtensionsCount()
    );
    _onProjectItemModified();
  };

  const deleteLayout = (layout: gdLayout) => {
    const { i18n } = props;
    if (!state.currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this scene? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, layout),
    })).then(state => {
      if (state.currentProject)
        state.currentProject.removeLayout(layout.getName());
      _onProjectItemModified();
    });
  };

  const deleteExternalLayout = (externalLayout: gdExternalLayout) => {
    const { currentProject } = state;
    const { i18n } = props;
    if (!currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this external layout? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeExternalLayoutTabs(state.editorTabs, externalLayout),
    })).then(state => {
      if (state.currentProject)
        state.currentProject.removeExternalLayout(externalLayout.getName());
      _onProjectItemModified();
    });
  };

  const deleteExternalEvents = (externalEvents: gdExternalEvents) => {
    const { i18n } = props;
    if (!state.currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove these external events? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeExternalEventsTabs(state.editorTabs, externalEvents),
    })).then(state => {
      if (state.currentProject)
        state.currentProject.removeExternalEvents(externalEvents.getName());
      _onProjectItemModified();
    });
  };

  const deleteEventsFunctionsExtension = (
    externalLayout: gdEventsFunctionsExtension
  ) => {
    const { currentProject } = state;
    const { i18n, eventsFunctionsExtensionsState } = props;
    if (!currentProject) return;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this extension? This can't be undone.`
      )
    );
    if (!answer) return;

    setState(state => ({
      ...state,
      editorTabs: closeEventsFunctionsExtensionTabs(
        state.editorTabs,
        externalLayout
      ),
    })).then(state => {
      currentProject.removeEventsFunctionsExtension(externalLayout.getName());
      _onProjectItemModified();
    });

    // Reload extensions to make sure the deleted extension is removed
    // from the platform
    eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
      currentProject
    );
  };

  const renameLayout = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
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
    setState(state => ({
      ...state,
      editorTabs: closeLayoutTabs(state.editorTabs, layout),
    })).then(state => {
      layout.setName(newName);
      _onProjectItemModified();
    });
  };

  const renameExternalLayout = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
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
    setState(state => ({
      ...state,
      editorTabs: closeExternalLayoutTabs(state.editorTabs, externalLayout),
    })).then(state => {
      externalLayout.setName(newName);
      _onProjectItemModified();
    });
  };

  const renameExternalEvents = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
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
    setState(state => ({
      ...state,
      editorTabs: closeExternalEventsTabs(state.editorTabs, externalEvents),
    })).then(state => {
      externalEvents.setName(newName);
      _onProjectItemModified();
    });
  };

  const renameEventsFunctionsExtension = (oldName: string, newName: string) => {
    const { currentProject } = state;
    const { i18n } = props;
    const { eventsFunctionsExtensionsState } = props;
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

    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        )
      );
      return;
    }

    const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
      oldName
    );
    setState(state => ({
      ...state,
      editorTabs: closeEventsFunctionsExtensionTabs(
        state.editorTabs,
        eventsFunctionsExtension
      ),
    })).then(state => {
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
      _onProjectItemModified();
    });
  };

  const [_layoutPreview, _setLayoutPreview] = React.useState({
    project: null,
    layout: null,
    options: null,
  });

  const _launchLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ) => {
    const { previewFirstSceneName, isPreviewFirstSceneOverriden } = state;

    if (!_previewLauncher.current) return;

    setState(state => ({
      ...state,
      previewLoading: true,
    }));

    _setLayoutPreview({
      project: project,
      layout: layout,
      options: options,
    });
    //callback shifted to useEffect
  };

  React.useEffect(
    () => {
      const previewedLayout = _layoutPreview.layout;
      const project = _layoutPreview.project;
      const options = _layoutPreview.options;
      if (state.previewFirstSceneName && state.isPreviewFirstSceneOverriden) {
        if (project && project.hasLayoutNamed(state.previewFirstSceneName)) {
          _setLayoutPreview(layoutPreview => ({
            ...layoutPreview,
            layout: project.getLayout(state.previewFirstSceneName),
          }));
        }
      }
      if (project && previewedLayout && options && _previewLauncher.current)
        _previewLauncher.current
          .launchLayoutPreview(project, previewedLayout, options)
          .catch(error => {
            console.error(
              'Error caught while launching preview, this should never happen.',
              error
            );
          })
          .then(() => {
            setState(state => ({
              ...state,
              previewLoading: false,
            }));
          });
    },
    [_layoutPreview]
  );

  const _launchExternalLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ) => {
    if (!_previewLauncher.current) return;

    setState(state => ({
      ...state,
      previewLoading: true,
    })).then(state => {
      if (_previewLauncher.current)
        _previewLauncher.current
          .launchExternalLayoutPreview(project, layout, externalLayout, options)
          .catch(error => {
            console.error(
              'Error caught while launching preview, this should never happen.',
              error
            );
          })
          .then(() => {
            setState(state => ({
              ...state,
              previewLoading: false,
            }));
          });
    });
  };

  const openLayout = (
    name: string,
    {
      openEventsEditor = true,
      openSceneEditor = true,
    }: { openEventsEditor: boolean, openSceneEditor: boolean } = {},
    newState: State = state
  ) => {
    const { i18n, storageProviderOperations } = props;
    const sceneEditorOptions = {
      label: name,
      renderEditor: ({ isActive, editorRef }) => (
        <PreferencesContext.Consumer>
          {({ values }) => (
            <SceneEditor
              previewButtonSettings={{
                isPreviewFirstSceneOverriden:
                  state.isPreviewFirstSceneOverriden,
                togglePreviewFirstSceneOverride: () =>
                  _togglePreviewFirstSceneOverride(),
                previewFirstSceneName: state.previewFirstSceneName,
                useSceneAsPreviewFirstScene: () => {
                  _setPreviewFirstScene(name);
                },
              }}
              project={newState.currentProject}
              layoutName={name}
              setToolbar={setEditorToolbar}
              onPreview={(project, layout, options) => {
                _launchLayoutPreview(project, layout, options);
                const { currentFileMetadata } = newState;
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
              showPreviewButton={!!props.renderPreviewLauncher}
              showNetworkPreviewButton={
                _previewLauncher.current &&
                _previewLauncher.current.canDoNetworkPreview()
              }
              onOpenDebugger={openDebugger}
              onEditObject={props.onEditObject}
              resourceSources={props.resourceSources}
              onChooseResource={_onChooseResource}
              resourceExternalEditors={props.resourceExternalEditors}
              isActive={isActive}
              ref={editorRef}
              unsavedChanges={props.unsavedChanges}
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
              project={newState.currentProject}
              layoutName={name}
              setToolbar={setEditorToolbar}
              previewButtonSettings={{
                isPreviewFirstSceneOverriden:
                  state.isPreviewFirstSceneOverriden,
                togglePreviewFirstSceneOverride: () =>
                  _togglePreviewFirstSceneOverride(),
                previewFirstSceneName: state.previewFirstSceneName,
                useSceneAsPreviewFirstScene: () => {
                  _setPreviewFirstScene(name);
                },
              }}
              onPreview={(project, layout, options) => {
                _launchLayoutPreview(project, layout, options);
                const { currentFileMetadata } = newState;
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
              showPreviewButton={!!props.renderPreviewLauncher}
              showNetworkPreviewButton={
                _previewLauncher.current &&
                _previewLauncher.current.canDoNetworkPreview()
              }
              onOpenDebugger={openDebugger}
              onOpenExternalEvents={openExternalEvents}
              onOpenLayout={name =>
                openLayout(name, {
                  openEventsEditor: true,
                  openSceneEditor: false,
                })
              }
              resourceSources={props.resourceSources}
              onChooseResource={_onChooseResource}
              resourceExternalEditors={props.resourceExternalEditors}
              openInstructionOrExpression={_openInstructionOrExpression}
              onCreateEventsFunction={_onCreateEventsFunction}
              isActive={isActive}
              ref={editorRef}
              unsavedChanges={props.unsavedChanges}
            />
          )}
        </PreferencesContext.Consumer>
      ),
      key: 'layout events ' + name,
      dontFocusTab: openSceneEditor,
    };

    const tabsWithSceneEditor = openSceneEditor
      ? openEditorTab(newState.editorTabs, sceneEditorOptions)
      : newState.editorTabs;
    const tabsWithSceneAndEventsEditors = openEventsEditor
      ? openEditorTab(tabsWithSceneEditor, eventsEditorOptions)
      : tabsWithSceneEditor;

    setState({
      ...newState,
      editorTabs: tabsWithSceneAndEventsEditors,
    });
    openProjectManager(false);
  };

  const openExternalEvents = (name: string) => {
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: name,
        renderEditor: ({ isActive, editorRef }) => (
          <ExternalEventsEditor
            project={state.currentProject}
            externalEventsName={name}
            setToolbar={setEditorToolbar}
            onOpenExternalEvents={openExternalEvents}
            onOpenLayout={name =>
              openLayout(name, {
                openEventsEditor: true,
                openSceneEditor: false,
              })
            }
            resourceSources={props.resourceSources}
            onChooseResource={_onChooseResource}
            resourceExternalEditors={props.resourceExternalEditors}
            openInstructionOrExpression={_openInstructionOrExpression}
            onCreateEventsFunction={_onCreateEventsFunction}
            previewButtonSettings={emptyPreviewButtonSettings}
            isActive={isActive}
            ref={editorRef}
            unsavedChanges={props.unsavedChanges}
          />
        ),
        key: 'external events ' + name,
      }),
    }));
    openProjectManager(false);
  };

  const openExternalLayout = (name: string) => {
    const { storageProviderOperations } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: name,
        renderEditor: ({ isActive, editorRef }) => (
          <PreferencesContext.Consumer>
            {({ values }) => (
              <ExternalLayoutEditor
                project={state.currentProject}
                externalLayoutName={name}
                setToolbar={setEditorToolbar}
                onPreview={(project, layout, externalLayout, options) => {
                  _launchExternalLayoutPreview(
                    project,
                    layout,
                    externalLayout,
                    options
                  );
                  const { currentFileMetadata } = state;
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
                showPreviewButton={!!props.renderPreviewLauncher}
                showNetworkPreviewButton={
                  _previewLauncher.current &&
                  _previewLauncher.current.canDoNetworkPreview()
                }
                previewButtonSettings={emptyPreviewButtonSettings}
                onOpenDebugger={openDebugger}
                onEditObject={props.onEditObject}
                resourceSources={props.resourceSources}
                onChooseResource={_onChooseResource}
                resourceExternalEditors={props.resourceExternalEditors}
                isActive={isActive}
                ref={editorRef}
              />
            )}
          </PreferencesContext.Consumer>
        ),
        key: 'external layout ' + name,
      }),
    }));
    openProjectManager(false);
  };

  const openEventsFunctionsExtension = (
    name: string,
    initiallyFocusedFunctionName?: string,
    initiallyFocusedBehaviorName?: ?string
  ) => {
    const { i18n, eventsFunctionsExtensionsState } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: name + ' ' + i18n._(t`(Extension)`),
        renderEditor: ({ isActive, editorRef }) => (
          <EventsFunctionsExtensionEditor
            project={state.currentProject}
            eventsFunctionsExtensionName={name}
            setToolbar={setEditorToolbar}
            resourceSources={props.resourceSources}
            onChooseResource={_onChooseResource}
            resourceExternalEditors={props.resourceExternalEditors}
            isActive={isActive}
            initiallyFocusedFunctionName={initiallyFocusedFunctionName}
            initiallyFocusedBehaviorName={initiallyFocusedBehaviorName}
            openInstructionOrExpression={_openInstructionOrExpression}
            onCreateEventsFunction={_onCreateEventsFunction}
            ref={editorRef}
            onLoadEventsFunctionsExtensions={() => {
              eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
                state.currentProject
              );
            }}
            unsavedChanges={props.unsavedChanges}
          />
        ),
        key: 'events functions extension ' + name,
      }),
    }));
    openProjectManager(false);
  };

  const openResources = () => {
    const { i18n } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: i18n._(t`Resources`),
        renderEditor: ({ isActive, editorRef }) => (
          <ResourcesEditor
            project={state.currentProject}
            setToolbar={setEditorToolbar}
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
            onChooseResource={_onChooseResource}
            resourceSources={props.resourceSources}
          />
        ),
        key: 'resources',
      }),
    }));
  };

  const openStartPage = () => {
    const { i18n, storageProviders } = props;
    setState({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: i18n._(t`Start Page`),
        renderEditor: ({ isActive, editorRef, newState }) => (
          <StartPage
            project={newState.currentProject}
            setToolbar={setEditorToolbar}
            canOpen={
              !!storageProviders.filter(
                ({ hiddenInOpenDialog }) => !hiddenInOpenDialog
              ).length
            }
            onOpen={chooseProject}
            onCreate={() => openCreateDialog()}
            onOpenProjectManager={() => openProjectManager()}
            onCloseProject={() => askToCloseProject(newState)}
            onOpenAboutDialog={() => openAboutDialog()}
            onOpenHelpFinder={() => openHelpFinderDialog()}
            onOpenLanguageDialog={() => openLanguage()}
            isActive={isActive}
            ref={editorRef}
          />
        ),
        key: 'start page',
        closable: false,
      }),
    });
  };

  const openDebugger = () => {
    const { i18n } = props;
    setState(state => ({
      ...state,
      editorTabs: openEditorTab(state.editorTabs, {
        label: i18n._(t`Debugger`),
        renderEditor: ({ isActive, editorRef }) => (
          <DebuggerEditor
            project={state.currentProject}
            setToolbar={setEditorToolbar}
            isActive={isActive}
            ref={editorRef}
            onChangeSubscription={() => openSubscription(true)}
          />
        ),
        key: 'debugger',
      }),
    }));
  };

  const _openInstructionOrExpression = (
    extension: gdPlatformExtension,
    type: string
  ) => {
    const { currentProject } = state;
    if (!currentProject) return;

    const extensionName = extension.getName();
    if (currentProject.hasEventsFunctionsExtensionNamed(extensionName)) {
      // It's an events functions extension, open the editor for it.
      const eventsFunctionsExtension = currentProject.getEventsFunctionsExtension(
        extensionName
      );
      const functionName = getFunctionNameFromType(type);

      const foundTab = getEventsFunctionsExtensionEditor(
        state.editorTabs,
        eventsFunctionsExtension
      );
      if (foundTab) {
        // Open the given function and focus the tab
        foundTab.editor.selectEventsFunctionByName(
          functionName.name,
          functionName.behaviorName
        );
        setState(state => ({
          ...state,
          editorTabs: changeCurrentTab(state.editorTabs, foundTab.tabIndex),
        }));
      } else {
        // Open a new editor for the extension and the given function
        openEventsFunctionsExtension(
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

  const _onProjectItemModified = () => {
    if (props.unsavedChanges) props.unsavedChanges.triggerUnsavedChanges();
    forceUpdate();
  };

  const _onCreateEventsFunction = (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    const { currentProject } = state;
    if (!currentProject) return;
    const { eventsFunctionsExtensionsState } = props;

    // Names are assumed to be alreaStartPagedy validated
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

  const openCreateDialog = (open: boolean = true) => {
    setState(state => ({ ...state, createDialogOpen: open }));
  };

  const chooseProject = () => {
    const { storageProviders } = props;

    if (
      storageProviders.filter(({ hiddenInOpenDialog }) => !hiddenInOpenDialog)
        .length > 1
    ) {
      openOpenFromStorageProviderDialog();
    } else {
      chooseProjectWithStorageProviderPicker();
    }
  };

  const chooseProjectWithStorageProviderPicker = () => {
    const { storageProviderOperations, i18n } = props;
    if (!storageProviderOperations.onOpenWithPicker) return;

    storageProviderOperations
      .onOpenWithPicker()
      .then(fileMetadata => {
        if (!fileMetadata) return;

        return openFromFileMetadata(fileMetadata).then(state => {
          openSceneOrProjectManager(state);
          //addRecentFile(fileMetadata);
        });
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

  const saveProject = () => {
    const { currentProject, currentFileMetadata } = state;
    if (!currentProject) return;
    if (!currentFileMetadata) {
      return saveProjectAs();
    }

    const { i18n, storageProviderOperations } = props;
    const { onSaveProject } = storageProviderOperations;
    if (!onSaveProject) {
      return saveProjectAs();
    }

    saveUiSettings(state.editorTabs);
    _showSnackMessage(i18n._(t`Saving...`));

    onSaveProject(currentProject, currentFileMetadata).then(
      ({ wasSaved }) => {
        if (wasSaved) {
          if (props.unsavedChanges) props.unsavedChanges.sealUnsavedChanges();
          _showSnackMessage(i18n._(t`Project properly saved`));
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

  const saveProjectAs = () => {
    const { currentProject } = state;
    const { storageProviders, storageProviderOperations } = props;
    if (!currentProject) return;

    if (
      storageProviders.filter(({ hiddenInSaveDialog }) => !hiddenInSaveDialog)
        .length > 1 ||
      !storageProviderOperations.onSaveProjectAs
    ) {
      openSaveToStorageProviderDialog();
    } else {
      saveProjectAsWithStorageProvider();
    }
  };

  const saveProjectAsWithStorageProvider = () => {
    const { currentProject, currentFileMetadata } = state;
    if (!currentProject) return;

    saveUiSettings(state.editorTabs);
    const { i18n, storageProviderOperations } = props;

    if (!storageProviderOperations.onSaveProjectAs) {
      return;
    }

    storageProviderOperations
      .onSaveProjectAs(currentProject, currentFileMetadata)
      .then(
        ({ wasSaved, fileMetadata }) => {
          if (wasSaved) {
            if (props.unsavedChanges) props.unsavedChanges.sealUnsavedChanges();
            _showSnackMessage(i18n._(t`Project properly saved`));

            if (fileMetadata) {
              setState(state => ({
                ...state,
                currentFileMetadata: fileMetadata,
              }));
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

  const askToCloseProject = (newState: State = state): Promise<State> => {
    if (props.unsavedChanges && props.unsavedChanges.hasUnsavedChanges) {
      if (!newState.currentProject) return Promise.resolve(newState);
      const { i18n } = props;

      const answer = Window.showConfirmDialog(
        i18n._(
          t`Close the project? Any changes that have not been saved will be lost.`
        )
      );
      if (!answer) return Promise.resolve(newState);
    }
    return closeProject(newState);
  };

  const openSceneOrProjectManager = (newState: State = state) => {
    const { currentProject } = newState;
    if (!currentProject) return;

    if (currentProject.getLayoutsCount() === 1) {
      openLayout(
        currentProject.getLayoutAt(0).getName(),
        {
          openSceneEditor: true,
          openEventsEditor: true,
        },
        newState
      );
    } else {
      openProjectManager();
    }
  };

  const openExportDialog = (open: boolean = true) => {
    setState(state => ({ ...state, exportDialogOpen: open }));
  };

  const _openIntroDialog = (open: boolean = true) => {
    setState(state => ({ ...state, introDialogOpen: open }));
  };

  const _openOpenConfirmDialog = (open: boolean = true) => {
    setState(state => ({ ...state, openConfirmDialogOpen: open }));
  };

  const _openGenericDialog = (open: boolean = true) => {
    setState(state => ({
      ...state,
      genericDialogOpen: open,
      genericDialog: null,
    }));
  };

  const openPreferences = (open: boolean = true) => {
    setState(state => ({ ...state, preferencesDialogOpen: open }));
  };

  const openLanguage = (open: boolean = true) => {
    setState(state => ({ ...state, languageDialogOpen: open }));
  };

  const openProfile = (open: boolean = true) => {
    setState(state => ({ ...state, profileDialogOpen: open }));
  };

  const openSubscription = (open: boolean = true) => {
    setState(state => ({ ...state, subscriptionDialogOpen: open }));
  };

  const _setPreviewFirstScene = (name: string) => {
    setState(state => ({
      ...state,
      previewFirstSceneName: name,
      isPreviewFirstSceneOverriden: true,
    }));
  };

  const _onChangeEditorTab = (value: number) => {
    setState(state => ({
      ...state,
      editorTabs: changeCurrentTab(state.editorTabs, value),
    })).then(state =>
      _onEditorTabActive(getCurrentTab(state.editorTabs), state)
    );
  };

  const _onEditorTabActive = (editorTab: EditorTab, stateRef) => {
    stateRef = stateRef || state;
    updateToolbar(stateRef);
    // Ensure the editors shown on the screen are updated. This is for
    // example useful if global objects have been updated in another editor.
    if (editorTab.editorRef) {
      editorTab.editorRef.forceUpdateEditor();
    }
  };

  const _onCloseEditorTab = (editorTab: EditorTab) => {
    saveUiSettings(state.editorTabs);
    setState({
      ...state,
      editorTabs: closeEditorTab(state.editorTabs, editorTab),
    });
  };

  const _onCloseOtherEditorTabs = (editorTab: EditorTab) => {
    saveUiSettings(state.editorTabs);
    setState(state => ({
      ...state,
      editorTabs: closeOtherEditorTabs(state.editorTabs, editorTab),
    }));
  };

  const _onCloseAllEditorTabs = () => {
    saveUiSettings(state.editorTabs);
    setState(state => ({
      ...state,
      editorTabs: closeAllEditorTabs(state.editorTabs),
    }));
  };

  const _onChooseResource = (
    sourceName: string,
    multiSelection: boolean = true
  ): Promise<Array<any>> => {
    const { currentProject } = state;
    const resourceSourceDialog = _resourceSourceDialogs.current[sourceName];
    if (!resourceSourceDialog) return Promise.resolve([]);

    return resourceSourceDialog.chooseResources(currentProject, multiSelection);
  };

  const updateToolbar = (newState: State = state) => {
    const editorTab = getCurrentTab(newState.editorTabs);
    if (!editorTab || !editorTab.editorRef) {
      setEditorToolbar(null);
      return;
    }

    editorTab.editorRef.updateToolbar();
  };

  const openAboutDialog = (open: boolean = true) => {
    setState(state => ({ ...state, aboutDialogOpen: open }));
  };

  const openOpenFromStorageProviderDialog = (open: boolean = true) => {
    setState(state => ({ ...state, openFromStorageProviderDialogOpen: open }));
  };

  const openSaveToStorageProviderDialog = (open: boolean = true) => {
    if (open) {
      // Ensure the project manager is closed as Google Drive storage provider
      // display a picker that does not play nice with material-ui's overlays.
      openProjectManager(false);
    }
    setState(state => ({ ...state, saveToStorageProviderDialogOpen: open }));
  };

  const openPlatformSpecificAssets = (open: boolean = true) => {
    setState(state => ({ ...state, platformSpecificAssetsDialogOpen: open }));
  };

  const openHelpFinderDialog = (open: boolean = true) => {
    setState(state => ({ ...state, helpFinderDialogOpen: open }));
  };

  const setUpdateStatus = (updateStatus: UpdateStatus) => {
    setState(state => ({ ...state, updateStatus }));

    const notificationTitle = getUpdateNotificationTitle(updateStatus);
    const notificationBody = getUpdateNotificationBody(updateStatus);
    if (notificationTitle) {
      const notification = new window.Notification(notificationTitle, {
        body: notificationBody,
      });
      notification.onclick = () => openAboutDialog(true);
    }
  };

  const simulateUpdateDownloaded = () =>
    setUpdateStatus({
      status: 'update-downloaded',
      message: 'update-downloaded',
      info: {
        releaseName: 'Fake update',
      },
    });

  const simulateUpdateAvailable = () =>
    setUpdateStatus({
      status: 'update-available',
      message: 'Update available',
    });

  const _showSnackMessage = (snackMessage: string) => {
    setState(state => ({
      ...state,
      snackMessage,
      snackMessageOpen: true,
    }));
  };
  const _closeSnackMessage = () => {
    setState(state => ({
      ...state,
      snackMessageOpen: false,
    }));
  };

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
  } = state;
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
    renderMainMenu,
  } = props;
  const showLoader =
    state.loadingProject || state.previewLoading || props.loading;

  return (
    <div className="main-frame">
      {!!renderMainMenu &&
        renderMainMenu({
          i18n: i18n,
          project: state.currentProject,
          onChooseProject: chooseProject,
          onSaveProject: saveProject,
          onSaveProjectAs: saveProjectAs,
          onCloseProject: askToCloseProject,
          onCloseApp: closeApp,
          onExportProject: openExportDialog,
          onCreateProject: openCreateDialog,
          onOpenProjectManager: openProjectManager,
          onOpenStartPage: openStartPage,
          onOpenDebugger: openDebugger,
          onOpenAbout: openAboutDialog,
          onOpenPreferences: openPreferences,
          onOpenLanguage: openLanguage,
          onOpenProfile: openProfile,
          setUpdateStatus: setUpdateStatus,
        })}
      <ProjectTitlebar fileMetadata={currentFileMetadata} />
      <Drawer
        open={projectManagerOpen}
        PaperProps={{
          style: styles.drawerContent,
        }}
        onClose={toggleProjectManager}
      >
        <EditorBar
          title={
            state.currentProject ? state.currentProject.getName() : 'No project'
          }
          displayRightCloseButton
          onClose={toggleProjectManager}
        />
        {currentProject && (
          <ProjectManager
            project={currentProject}
            onOpenExternalEvents={openExternalEvents}
            onOpenLayout={openLayout}
            onOpenExternalLayout={openExternalLayout}
            onOpenEventsFunctionsExtension={openEventsFunctionsExtension}
            onAddLayout={addLayout}
            onAddExternalLayout={addExternalLayout}
            onAddEventsFunctionsExtension={addEventsFunctionsExtension}
            onAddExternalEvents={addExternalEvents}
            onDeleteLayout={deleteLayout}
            onDeleteExternalLayout={deleteExternalLayout}
            onDeleteEventsFunctionsExtension={deleteEventsFunctionsExtension}
            onDeleteExternalEvents={deleteExternalEvents}
            onRenameLayout={renameLayout}
            onRenameExternalLayout={renameExternalLayout}
            onRenameEventsFunctionsExtension={renameEventsFunctionsExtension}
            onRenameExternalEvents={renameExternalEvents}
            onSaveProject={saveProject}
            onSaveProjectAs={saveProjectAs}
            onCloseProject={() => {
              askToCloseProject();
            }}
            onExportProject={openExportDialog}
            onOpenPreferences={() => openPreferences(true)}
            onOpenProfile={() => openProfile(true)}
            onOpenResources={() => {
              openResources();
              openProjectManager(false);
            }}
            onOpenPlatformSpecificAssets={() => openPlatformSpecificAssets()}
            onChangeSubscription={() => openSubscription(true)}
            eventsFunctionsExtensionsError={eventsFunctionsExtensionsError}
            onReloadEventsFunctionsExtensions={() => {
              // Check if load is sufficient
              eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensions(
                currentProject
              );
            }}
            freezeUpdate={!projectManagerOpen}
            unsavedChanges={props.unsavedChanges}
          />
        )}
        {!state.currentProject && (
          <EmptyMessage>
            <Trans>To begin, open or create a new project.</Trans>
          </EmptyMessage>
        )}
      </Drawer>
      <Toolbar
        ref={toolbar}
        showProjectIcons={!props.integratedEditor}
        hasProject={!!currentProject}
        toggleProjectManager={toggleProjectManager}
        exportProject={() => openExportDialog(true)}
        requestUpdate={props.requestUpdate}
        simulateUpdateDownloaded={simulateUpdateDownloaded}
        simulateUpdateAvailable={simulateUpdateAvailable}
      />
      <ClosableTabs hideLabels={!!props.integratedEditor}>
        {getEditors(state.editorTabs).map((editorTab, id) => {
          const isCurrentTab = getCurrentTabIndex(state.editorTabs) === id;
          return (
            <ClosableTab
              label={editorTab.label}
              key={editorTab.key}
              active={isCurrentTab}
              onClick={() => _onChangeEditorTab(id)}
              onClose={() => _onCloseEditorTab(editorTab)}
              onCloseOthers={() => _onCloseOtherEditorTabs(editorTab)}
              onCloseAll={_onCloseAllEditorTabs}
              onActivated={() => _onEditorTabActive(editorTab)}
              closable={editorTab.closable}
            />
          );
        })}
      </ClosableTabs>
      {getEditors(state.editorTabs).map((editorTab, id) => {
        const isCurrentTab = getCurrentTabIndex(state.editorTabs) === id;
        return (
          <TabContentContainer key={editorTab.key} active={isCurrentTab}>
            <ErrorBoundary>
              {editorTab.render(isCurrentTab, state)}
            </ErrorBoundary>
          </TabContentContainer>
        );
      })}
      <LoaderModal show={showLoader} />
      <HelpFinder
        open={helpFinderDialogOpen}
        onClose={() => openHelpFinderDialog(false)}
      />
      <Snackbar
        open={state.snackMessageOpen}
        autoHideDuration={3000}
        onClose={_closeSnackMessage}
        ContentProps={{
          'aria-describedby': 'snackbar-message',
        }}
        message={<span id="snackbar-message">{state.snackMessage}</span>}
      />
      {!!renderExportDialog &&
        state.exportDialogOpen &&
        renderExportDialog({
          onClose: () => openExportDialog(false),
          onChangeSubscription: () => {
            openExportDialog(false);
            openSubscription(true);
          },
          project: state.currentProject,
        })}
      {!!renderCreateDialog &&
        state.createDialogOpen &&
        renderCreateDialog({
          open: state.createDialogOpen,
          onClose: () => openCreateDialog(false),
          onOpen: (storageProvider, fileMetadata) => {
            openCreateDialog(false);
            // eslint-disable-next-line
            useStorageProvider(storageProvider)
              .then(() => openFromFileMetadata(fileMetadata))
              .then(state => openSceneOrProjectManager(state));
          },
          onCreate: (project, storageProvider, fileMetadata) => {
            openCreateDialog(false);
            // eslint-disable-next-line
            useStorageProvider(storageProvider)
              .then(() => loadFromProject(project, fileMetadata))
              .then(state => openSceneOrProjectManager(state));
          },
        })}
      {!!introDialog &&
        React.cloneElement(introDialog, {
          open: state.introDialogOpen,
          onClose: () => _openIntroDialog(false),
        })}
      {!!currentProject && state.platformSpecificAssetsDialogOpen && (
        <PlatformSpecificAssetsDialog
          project={currentProject}
          open
          onApply={() => openPlatformSpecificAssets(false)}
          onClose={() => openPlatformSpecificAssets(false)}
          resourceSources={resourceSources}
          onChooseResource={_onChooseResource}
          resourceExternalEditors={resourceExternalEditors}
        />
      )}
      {!!genericDialog &&
        React.cloneElement(genericDialog, {
          open: state.genericDialogOpen,
          onClose: () => _openGenericDialog(false),
        })}
      {!!renderPreviewLauncher &&
        renderPreviewLauncher(
          {
            onExport: () => openExportDialog(true),
            onChangeSubscription: () => openSubscription(true),
          },
          (previewLauncher: ?PreviewLauncherInterface) => {
            _previewLauncher.current = previewLauncher;
          }
        )}
      {resourceSources.map(
        (resourceSource, index): React.Node => {
          const Component = resourceSource.component;
          return (
            <PreferencesContext.Consumer key={resourceSource.name}>
              {({ getLastUsedPath, setLastUsedPath }) => {
                return (
                  <Component
                    ref={dialog =>
                      (_resourceSourceDialogs.current[
                        resourceSource.name
                      ] = dialog)
                    }
                    i18n={i18n}
                    getLastUsedPath={getLastUsedPath}
                    setLastUsedPath={setLastUsedPath}
                  />
                );
              }}
            </PreferencesContext.Consumer>
          );
        }
      )}
      {profileDialogOpen && (
        <ProfileDialog
          open
          onClose={() => openProfile(false)}
          onChangeSubscription={() => openSubscription(true)}
        />
      )}
      {subscriptionDialogOpen && (
        <SubscriptionDialog
          onClose={() => {
            openSubscription(false);
          }}
          open
        />
      )}
      {state.preferencesDialogOpen && (
        <PreferencesDialog onClose={() => openPreferences(false)} />
      )}
      {state.languageDialogOpen && (
        <LanguageDialog
          open
          onClose={languageChanged => {
            openLanguage(false);
            if (languageChanged) {
              _languageDidChange();
            }
          }}
        />
      )}
      {aboutDialogOpen && (
        <AboutDialog
          open
          onClose={() => openAboutDialog(false)}
          updateStatus={updateStatus}
        />
      )}
      {state.openFromStorageProviderDialogOpen && (
        <OpenFromStorageProviderDialog
          onClose={() => openOpenFromStorageProviderDialog(false)}
          storageProviders={props.storageProviders}
          onChooseProvider={storageProvider => {
            openOpenFromStorageProviderDialog(false);
            props.useStorageProvider(storageProvider).then(() => {
              chooseProjectWithStorageProviderPicker();
            });
          }}
          onCreateNewProject={() => {
            openOpenFromStorageProviderDialog(false);
            openCreateDialog(true);
          }}
        />
      )}
      {state.saveToStorageProviderDialogOpen && (
        <SaveToStorageProviderDialog
          onClose={() => openSaveToStorageProviderDialog(false)}
          storageProviders={props.storageProviders}
          onChooseProvider={storageProvider => {
            openSaveToStorageProviderDialog(false);
            props.useStorageProvider(storageProvider).then(() => {
              saveProjectAsWithStorageProvider();
            });
          }}
        />
      )}
      {state.openConfirmDialogOpen && (
        <OpenConfirmDialog
          onClose={() => {
            _openOpenConfirmDialog(false);
          }}
          onConfirm={() => {
            _openOpenConfirmDialog(false);
            _openInitialFileMetadata(/* isAfterUserInteraction= */ true);
          }}
        />
      )}
      <CloseConfirmDialog
          shouldPrompt={!!this.state.currentProject}
          i18n={this.props.i18n}
          language={this.props.i18n.language}
          hasUnsavedChanges={
            !!this.props.unsavedChanges &&
            this.props.unsavedChanges.hasUnsavedChanges
          }
        />
        <ChangelogDialogContainer />
        {this.state.gdjsDevelopmentWatcherEnabled &&
          renderGDJSDevelopmentWatcher &&
          renderGDJSDevelopmentWatcher()}
    </div>
  );
};

export default MainFrame;
