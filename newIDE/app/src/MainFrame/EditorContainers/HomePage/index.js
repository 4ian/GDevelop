// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  type RenderEditorContainerPropsWithRef,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from '../BaseEditor';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../../ProjectsStorage';
import CreateSection from './CreateSection';
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import { HomePageHeader } from './HomePageHeader';
import { HomePageMenu, type HomeTab } from './HomePageMenu';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';
import { type ResourceManagementProps } from '../../../ResourcesList/ResourceSource';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import { type PrivateGameTemplateListingData } from '../../../Utils/GDevelopServices/Shop';
import { type GameDetailsTab } from '../../../GameDashboard';
import {
  type ExampleProjectSetup,
  type NewProjectSetup,
} from '../../../ProjectCreation/NewProjectSetupDialog';
import { type ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import { type GamesList } from '../../../GameDashboard/UseGamesList';
import { type HotReloadSteps } from '../../../EmbeddedGame/EmbeddedGameFrame';
import { type CreateProjectResult } from '../../../Utils/UseCreateProject';
import { type OpenAskAiOptions } from '../../../AiGeneration/Utils';

const noop = () => {};
const BUILD_SECTION_ID = 'carrots-home-build-section';
const TEMPLATES_SECTION_ID = 'carrots-home-templates-section';
const homePageFontFamily =
  '"Cairo", "Noto Sans Arabic", "Noto Sans", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Segoe UI", "Ubuntu", sans-serif';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 0,
    flex: 1,
    minHeight: 0,
    width: '100%',
    background:
      'radial-gradient(circle at top left, rgba(244, 182, 122, 0.28), transparent 42%), radial-gradient(circle at bottom right, rgba(154, 201, 144, 0.2), transparent 44%), #d7d2c8',
    fontFamily: homePageFontFamily,
  },
  mobileContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    background:
      'radial-gradient(circle at top left, rgba(244, 182, 122, 0.28), transparent 42%), radial-gradient(circle at bottom right, rgba(154, 201, 144, 0.2), transparent 44%), #d7d2c8',
    fontFamily: homePageFontFamily,
  },
  scrollableContainer: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
    height: '100%',
    minWidth: 0,
    overflowY: 'auto',
    borderRadius: 18,
    marginTop: 8,
    marginBottom: 8,
    marginRight: 8,
    background: 'linear-gradient(160deg, rgba(244, 242, 237, 0.95), #d6d2cb)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
};

type Props = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,

  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,
  setGamesPlatformFrameShown: ({| shown: boolean, isMobile: boolean |}) => void,
  storageProviders: Array<StorageProvider>,
  storageProvider: ?StorageProvider,

  // Games
  gamesList: GamesList,

  // Games platform
  gamesPlatformFrameTools: any,

  // Project opening
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onSelectExampleShortHeader: ExampleShortHeader => void,
  onSelectPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,
  onOpenPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onOpenVersionHistory: () => void,
  askToCloseProject: () => Promise<boolean>,
  closeProject: () => Promise<void>,

  // Other dialogs opening:
  onOpenLanguageDialog: () => void,
  onOpenProfile: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,
  onOpenAskAi: (?OpenAskAiOptions) => void,
  onCloseAskAi: () => void,

  // Project creation
  onOpenNewProjectSetupDialog: () => void,
  onOpenEmptyProjectSetupDialog: () => void,
  onCreateProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  onCreateEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,

  // Asset store
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,

  // Project save
  onSave: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  canSave: boolean,

  resourceManagementProps: ResourceManagementProps,
  onOpenLayout: (
    sceneName: string,
    options: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,

  gameEditorMode: 'embedded-game' | 'instances-editor',
|};

export type HomePageEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,
  onSceneObjectsDeleted: (scene: gdLayout) => void,
  onSceneEventsModifiedOutsideEditor: (
    scene: SceneEventsOutsideEditorChanges
  ) => void,
  notifyChangesToInGameEditor: (hotReloadSteps: HotReloadSteps) => void,
  switchInGameEditorIfNoHotReloadIsNeeded: () => void,
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onObjectsModifiedOutsideEditor: (
    changes: ObjectsOutsideEditorChanges
  ) => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
|};

export const HomePage: React.ComponentType<Props> = React.memo<Props>(
  React.forwardRef<Props, HomePageEditorInterface>(
    (
      {
        project,
        fileMetadata,
        canOpen,
        onChooseProject,
        onOpenRecentFile,
        onOpenNewProjectSetupDialog,
        onOpenEmptyProjectSetupDialog,
        onSelectExampleShortHeader,
        onSelectPrivateGameTemplateListingData,
        onOpenVersionHistory,
        onOpenLanguageDialog,
        onOpenProfile,
        setToolbar,
        setGamesPlatformFrameShown,
        onOpenPreferences,
        onOpenAbout,
        isActive,
        storageProviders,
        onSave,
        canSave,
        askToCloseProject,
        closeProject,
        gamesList,
      }: Props,
      ref
    ) => {
      const authenticatedUser = React.useContext(AuthenticatedUserContext);
      const { authenticated, onCloudProjectsChanged } = authenticatedUser;
      const { fetchExamplesAndFilters } = React.useContext(ExampleStoreContext);
      const [openedGameId, setOpenedGameId] = React.useState<?string>(null);
      const {
        games,
        fetchGames,
        gamesFetchingError,
        onGameUpdated,
      } = gamesList;
      const [
        gameDetailsCurrentTab,
        setGameDetailsCurrentTab,
      ] = React.useState<GameDetailsTab>('details');

      const { isMobile } = useResponsiveWindowSize();
      const activeTab: HomeTab = 'create';
      const scrollToSection = React.useCallback(
        (sectionId: string): boolean => {
          if (typeof document === 'undefined') return false;
          const section = document.getElementById(sectionId);
          if (!section) return false;
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        },
        []
      );
      const setActiveTab = React.useCallback(
        (_tab: HomeTab) => {
          scrollToSection(BUILD_SECTION_ID);
        },
        [scrollToSection]
      );
      const onOpenTemplatesFromMenu = React.useCallback(
        () => {
          if (!scrollToSection(TEMPLATES_SECTION_ID)) {
            onOpenNewProjectSetupDialog();
          }
        },
        [scrollToSection, onOpenNewProjectSetupDialog]
      );
      const openedGame = React.useMemo(
        () =>
          !openedGameId || !games
            ? null
            : games.find(game => game.id === openedGameId),
        [games, openedGameId]
      );

      // Load everything when the user opens the home page, to avoid future loading times.
      React.useEffect(
        () => {
          fetchExamplesAndFilters();
        },
        [fetchExamplesAndFilters]
      );

      // Fetch user cloud projects when home page becomes active
      React.useEffect(
        () => {
          if (isActive && authenticated) {
            onCloudProjectsChanged();
          }
        },
        [isActive, authenticated, onCloudProjectsChanged]
      );

      // Refresh games list when the home page is active.
      React.useEffect(
        () => {
          if (isActive && authenticated) {
            fetchGames();
          }
        },
        [isActive, authenticated, fetchGames]
      );

      const getProject = React.useCallback(() => {
        return undefined;
      }, []);

      const updateToolbar = React.useCallback(
        () => {
          // $FlowFixMe[constant-condition]
          if (setToolbar) {
            setToolbar(
              <HomePageHeader
                hasProject={!!project}
                onOpenLanguageDialog={onOpenLanguageDialog}
                onOpenProfile={onOpenProfile}
                onOpenVersionHistory={onOpenVersionHistory}
                onSave={onSave}
                canSave={canSave}
              />
            );
          }
        },
        [
          setToolbar,
          onOpenLanguageDialog,
          onOpenProfile,
          onOpenVersionHistory,
          project,
          onSave,
          canSave,
        ]
      );

      // Home page is create-only: keep toolbars visible and games frame hidden.
      React.useLayoutEffect(
        () => {
          setGamesPlatformFrameShown({ shown: false, isMobile });
          updateToolbar();

          return () => {
            setGamesPlatformFrameShown({ shown: false, isMobile });
          };
        },
        [updateToolbar, setGamesPlatformFrameShown, isMobile]
      );

      // $FlowFixMe[incompatible-type]
      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor: noop,
        onEventsBasedObjectChildrenEdited: noop,
        onSceneObjectEdited: noop,
        onSceneObjectsDeleted: noop,
        onSceneEventsModifiedOutsideEditor: noop,
        notifyChangesToInGameEditor: noop,
        switchInGameEditorIfNoHotReloadIsNeeded: noop,
        onInstancesModifiedOutsideEditor: noop,
        onObjectsModifiedOutsideEditor: noop,
        onObjectGroupsModifiedOutsideEditor: noop,
      }));

      return (
        <I18n>
          {({ i18n }) => (
            <div style={isMobile ? styles.mobileContainer : styles.container}>
              <div style={styles.scrollableContainer}>
                <CreateSection
                  project={project}
                  currentFileMetadata={fileMetadata}
                  onOpenProject={onOpenRecentFile}
                  storageProviders={storageProviders}
                  closeProject={closeProject}
                  games={games}
                  onRefreshGames={fetchGames}
                  onGameUpdated={onGameUpdated}
                  gamesFetchingError={gamesFetchingError}
                  openedGame={openedGame}
                  setOpenedGameId={setOpenedGameId}
                  currentTab={gameDetailsCurrentTab}
                  setCurrentTab={setGameDetailsCurrentTab}
                  canOpen={canOpen}
                  askToCloseProject={askToCloseProject}
                  onSelectExampleShortHeader={onSelectExampleShortHeader}
                  onSelectPrivateGameTemplateListingData={
                    onSelectPrivateGameTemplateListingData
                  }
                  i18n={i18n}
                  onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
                  onStartNewProject={onOpenEmptyProjectSetupDialog}
                  onChooseProject={onChooseProject}
                  onSaveProject={onSave}
                  canSaveProject={canSave}
                />
              </div>
              <HomePageMenu
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenPreferences={onOpenPreferences}
                onOpenAbout={onOpenAbout}
                onOpenTemplates={onOpenTemplatesFromMenu}
              />
            </div>
          )}
        </I18n>
      );
    }
  ),
  // Prevent any update to the editor if the editor is not active,
  // and so not visible to the user.
  (prevProps, nextProps) => prevProps.isActive || nextProps.isActive
);

export const renderHomePageContainer = (
  props: RenderEditorContainerPropsWithRef
): React.MixedElement => (
  // $FlowFixMe[incompatible-type]
  <HomePage
    ref={props.ref}
    project={props.project}
    fileMetadata={props.fileMetadata}
    isActive={props.isActive}
    projectItemName={props.projectItemName}
    setToolbar={props.setToolbar}
    setGamesPlatformFrameShown={props.setGamesPlatformFrameShown}
    canOpen={props.canOpen}
    onChooseProject={props.onChooseProject}
    onOpenRecentFile={props.onOpenRecentFile}
    onSelectExampleShortHeader={props.onSelectExampleShortHeader}
    onSelectPrivateGameTemplateListingData={
      props.onSelectPrivateGameTemplateListingData
    }
    onOpenPrivateGameTemplateListingData={
      props.onOpenPrivateGameTemplateListingData
    }
    onOpenNewProjectSetupDialog={props.onOpenNewProjectSetupDialog}
    onOpenEmptyProjectSetupDialog={props.onOpenEmptyProjectSetupDialog}
    onOpenVersionHistory={props.onOpenVersionHistory}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
    onCreateProjectFromExample={props.onCreateProjectFromExample}
    onCreateEmptyProject={props.onCreateEmptyProject}
    askToCloseProject={props.askToCloseProject}
    closeProject={props.closeProject}
    selectInAppTutorial={props.selectInAppTutorial}
    onOpenPreferences={props.onOpenPreferences}
    onOpenAbout={props.onOpenAbout}
    onOpenAskAi={props.onOpenAskAi}
    onCloseAskAi={props.onCloseAskAi}
    onOpenLayout={props.onOpenLayout}
    storageProviders={
      (props.extraEditorProps && props.extraEditorProps.storageProviders) || []
    }
    storageProvider={props.storageProvider}
    onSave={props.onSave}
    canSave={props.canSave}
    resourceManagementProps={props.resourceManagementProps}
    gamesList={props.gamesList}
    gamesPlatformFrameTools={props.gamesPlatformFrameTools}
    onWillInstallExtension={props.onWillInstallExtension}
    onExtensionInstalled={props.onExtensionInstalled}
    gameEditorMode={props.gameEditorMode}
  />
);
