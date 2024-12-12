// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../../ProjectsStorage';
import GetStartedSection from './GetStartedSection';
import BuildSection from './BuildSection';
import LearnSection from './LearnSection';
import PlaySection from './PlaySection';
import ManageSection from './ManageSection';
import StoreSection from './StoreSection';
import { type TutorialCategory } from '../../../Utils/GDevelopServices/Tutorial';
import { TutorialContext } from '../../../Tutorial/TutorialContext';
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import { HomePageHeader } from './HomePageHeader';
import { HomePageMenu, type HomeTab } from './HomePageMenu';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';
import { type ResourceManagementProps } from '../../../ResourcesList/ResourceSource';
import { AssetStoreContext } from '../../../AssetStore/AssetStoreContext';
import TeamSection from './TeamSection';
import TeamProvider from '../../../Profile/Team/TeamProvider';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import { type PrivateGameTemplateListingData } from '../../../Utils/GDevelopServices/Shop';
import { PrivateGameTemplateStoreContext } from '../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import PreferencesContext from '../../Preferences/PreferencesContext';
import useSubscriptionPlans from '../../../Utils/UseSubscriptionPlans';
import { incrementGetStartedSectionViewCount } from '../../../Utils/Analytics/LocalStats';
import {
  sendUserSurveyHidden,
  sendUserSurveyStarted,
} from '../../../Utils/Analytics/EventSender';
import RouterContext, { type RouteArguments } from '../../RouterContext';
import { type GameDetailsTab } from '../../../GameDashboard';
import { canUseClassroomFeature } from '../../../Utils/GDevelopServices/Usage';
import EducationMarketingSection from './EducationMarketingSection';
import useEducationForm from './UseEducationForm';
import { type NewProjectSetup } from '../../../ProjectCreation/NewProjectSetupDialog';
import { type ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import { type GamesList } from '../../../GameDashboard/UseGamesList';
import { type CourseChapter } from '../../../Utils/GDevelopServices/Asset';
import useCourses from './UseCourses';

const getRequestedTab = (routeArguments: RouteArguments): HomeTab | null => {
  if (
    routeArguments['initial-dialog'] === 'asset-store' || // Compatibility with old links
    routeArguments['initial-dialog'] === 'store' // New way of opening the store
  ) {
    return 'shop';
  } else if (routeArguments['initial-dialog'] === 'games-dashboard') {
    return 'manage';
  } else if (routeArguments['initial-dialog'] === 'build') {
    return 'build';
  } else if (routeArguments['initial-dialog'] === 'education') {
    return 'team-view';
  } else if (routeArguments['initial-dialog'] === 'play') {
    return 'play';
  } else if (routeArguments['initial-dialog'] === 'get-started') {
    return 'get-started';
  }

  return null;
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: 0,
    marginBottom: 0,
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  mobileContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  },
  scrollableContainer: {
    display: 'flex',
    marginLeft: 0,
    marginRight: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
    height: '100%',
    minWidth: 0,
    overflowY: 'auto',
  },
};

type Props = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,

  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,
  storageProviders: Array<StorageProvider>,

  // Games
  gamesList: GamesList,

  // Project opening
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onSelectExampleShortHeader: ExampleShortHeader => void,
  onSelectPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,
  onOpenPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onOpenProjectManager: () => void,
  askToCloseProject: () => Promise<boolean>,
  closeProject: () => Promise<void>,

  // Other dialogs opening:
  onOpenLanguageDialog: () => void,
  onOpenProfile: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,

  // Project creation
  onOpenNewProjectSetupDialog: () => void,
  onCreateProjectFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType
  ) => Promise<void>,
  onOpenTemplateFromTutorial: (tutorialId: string) => Promise<void>,
  onOpenTemplateFromCourseChapter: (
    courseChapter: CourseChapter
  ) => Promise<void>,

  // Project save
  onSave: () => Promise<void>,
  canSave: boolean,

  resourceManagementProps: ResourceManagementProps,
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
|};

export const HomePage = React.memo<Props>(
  React.forwardRef<Props, HomePageEditorInterface>(
    (
      {
        project,
        fileMetadata,
        canOpen,
        onChooseProject,
        onOpenRecentFile,
        onOpenNewProjectSetupDialog,
        onSelectExampleShortHeader,
        onSelectPrivateGameTemplateListingData,
        onOpenPrivateGameTemplateListingData,
        onOpenProjectManager,
        onOpenLanguageDialog,
        onOpenProfile,
        onCreateProjectFromExample,
        setToolbar,
        selectInAppTutorial,
        onOpenPreferences,
        onOpenAbout,
        isActive,
        storageProviders,
        onSave,
        canSave,
        resourceManagementProps,
        askToCloseProject,
        closeProject,
        onOpenTemplateFromTutorial,
        onOpenTemplateFromCourseChapter,
        gamesList,
      }: Props,
      ref
    ) => {
      const authenticatedUser = React.useContext(AuthenticatedUserContext);
      const {
        authenticated,
        onCloudProjectsChanged,
        onOpenLoginDialog,
        limits,
      } = authenticatedUser;
      const userSurveyStartedRef = React.useRef<boolean>(false);
      const userSurveyHiddenRef = React.useRef<boolean>(false);
      const { fetchTutorials } = React.useContext(TutorialContext);
      const { fetchExamplesAndFilters } = React.useContext(ExampleStoreContext);
      const {
        fetchGameTemplates,
        shop: { setInitialGameTemplateUserFriendlySlug },
      } = React.useContext(PrivateGameTemplateStoreContext);
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
      const { routeArguments, removeRouteArguments } = React.useContext(
        RouterContext
      );
      const {
        educationForm,
        onChangeEducationForm,
        onSendEducationForm,
        educationFormError,
        educationFormStatus,
        onResetEducationForm,
      } = useEducationForm({ authenticatedUser });
      const {
        selectedCourse,
        courseChapters,
        isLoadingChapters,
        onCompleteTask,
        isTaskCompleted,
        getChapterCompletion,
        getCourseCompletion,
        onBuyCourseChapterWithCredits,
      } = useCourses();
      const [displayCourse, setDisplayCourse] = React.useState<boolean>(false);
      const { isMobile } = useResponsiveWindowSize();
      const {
        values: { showGetStartedSectionByDefault },
      } = React.useContext(PreferencesContext);
      const tabRequestedAtOpening = React.useRef<HomeTab | null>(
        getRequestedTab(routeArguments)
      );
      const initialTab = tabRequestedAtOpening.current
        ? tabRequestedAtOpening.current
        : showGetStartedSectionByDefault
        ? 'get-started'
        : 'build';

      const [activeTab, setActiveTab] = React.useState<HomeTab>(initialTab);
      const [
        learnInitialCategory,
        setLearnInitialCategory,
      ] = React.useState<TutorialCategory | null>(null);

      const { setInitialPackUserFriendlySlug } = React.useContext(
        AssetStoreContext
      );
      const openedGame = React.useMemo(
        () =>
          !openedGameId || !games
            ? null
            : games.find(game => game.id === openedGameId),
        [games, openedGameId]
      );
      const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
        includeLegacy: false,
      });

      // Open the store and a pack or game template if asked to do so, either at
      // app opening, either when the route changes (when clicking on an announcement
      // that redirects to the asset store for instance).
      React.useEffect(
        () => {
          const requestedTab = getRequestedTab(routeArguments);

          if (!requestedTab) return;

          setActiveTab(requestedTab);
          if (requestedTab === 'shop') {
            if (routeArguments['asset-pack']) {
              setInitialPackUserFriendlySlug(routeArguments['asset-pack']);
            }
            if (routeArguments['game-template']) {
              setInitialGameTemplateUserFriendlySlug(
                routeArguments['game-template']
              );
            }
            // Remove the arguments so that the asset store is not opened again.
            removeRouteArguments(['asset-pack', 'game-template']);
          } else if (requestedTab === 'manage') {
            const gameId = routeArguments['game-id'];
            if (gameId) {
              if (games && games.find(game => game.id === gameId)) {
                setOpenedGameId(gameId);
                if (routeArguments['games-dashboard-tab']) {
                  setGameDetailsCurrentTab(
                    // $FlowIgnore - We are confident the argument is one of the possible tab.
                    routeArguments['games-dashboard-tab']
                  );
                  removeRouteArguments(['games-dashboard-tab']);
                }
              }
            }
          }

          removeRouteArguments(['initial-dialog']);
        },
        [
          routeArguments,
          removeRouteArguments,
          setInitialPackUserFriendlySlug,
          setInitialGameTemplateUserFriendlySlug,
          games,
        ]
      );

      React.useEffect(
        () => {
          if (initialTab === 'get-started') {
            incrementGetStartedSectionViewCount();
          }
        },
        [initialTab]
      );

      // Load everything when the user opens the home page, to avoid future loading times.
      React.useEffect(
        () => {
          fetchExamplesAndFilters();
          fetchGameTemplates();
          fetchTutorials();
        },
        [fetchExamplesAndFilters, fetchTutorials, fetchGameTemplates]
      );

      // Only fetch games if the user decides to open the games dashboard tab
      // or the build tab to enable the context menu on project list items that
      // redirects to the games dashboard.
      React.useEffect(
        () => {
          if ((activeTab === 'manage' || activeTab === 'build') && !games) {
            fetchGames();
          }
        },
        [fetchGames, activeTab, games]
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

      // Refresh games list (as one could have been modified using the game dashboard
      // in the project manager) when navigating to the "Manage" tab.
      React.useEffect(
        () => {
          if (isActive && activeTab === 'manage' && authenticated) {
            fetchGames();
          }
        },
        [isActive, activeTab, authenticated, fetchGames]
      );

      const getProject = React.useCallback(() => {
        return undefined;
      }, []);

      const updateToolbar = React.useCallback(
        () => {
          if (setToolbar) {
            setToolbar(
              <HomePageHeader
                hasProject={!!project}
                onOpenLanguageDialog={onOpenLanguageDialog}
                onOpenProfile={onOpenProfile}
                onOpenProjectManager={onOpenProjectManager}
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
          onOpenProjectManager,
          project,
          onSave,
          canSave,
        ]
      );

      // Ensure the toolbar is up to date when the active tab changes.
      React.useEffect(
        () => {
          updateToolbar();
        },
        [updateToolbar]
      );

      const forceUpdateEditor = React.useCallback(() => {
        // No updates to be done
      }, []);

      const onEventsBasedObjectChildrenEdited = React.useCallback(() => {
        // No thing to be done
      }, []);

      const onSceneObjectEdited = React.useCallback(
        (scene: gdLayout, objectWithContext: ObjectWithContext) => {
          // No thing to be done
        },
        []
      );

      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor,
        onEventsBasedObjectChildrenEdited,
        onSceneObjectEdited,
      }));

      const onUserSurveyStarted = React.useCallback(() => {
        if (userSurveyStartedRef.current) return;
        sendUserSurveyStarted();
        userSurveyStartedRef.current = true;
      }, []);
      const onUserSurveyHidden = React.useCallback(() => {
        if (userSurveyHiddenRef.current) return;
        sendUserSurveyHidden();
        userSurveyHiddenRef.current = true;
      }, []);

      React.useEffect(
        () => {
          if (!authenticated) {
            userSurveyStartedRef.current = false;
            userSurveyHiddenRef.current = false;
          }
        },
        // Reset flag that prevents multiple send of the same event on user change.
        [authenticated]
      );

      const onManageGame = React.useCallback((gameId: string) => {
        setOpenedGameId(gameId);
        setActiveTab('manage');
      }, []);

      const canManageGame = React.useCallback(
        (gameId: string): boolean => {
          if (!games) return false;
          const matchingGameIndex = games.findIndex(game => game.id === gameId);
          return matchingGameIndex > -1;
        },
        [games]
      );

      return (
        <I18n>
          {({ i18n }) => (
            <TeamProvider>
              <div style={isMobile ? styles.mobileContainer : styles.container}>
                <div style={styles.scrollableContainer}>
                  {activeTab === 'manage' && (
                    <ManageSection
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
                    />
                  )}
                  {activeTab === 'get-started' && (
                    <GetStartedSection
                      selectInAppTutorial={selectInAppTutorial}
                      onUserSurveyStarted={onUserSurveyStarted}
                      onUserSurveyHidden={onUserSurveyHidden}
                      subscriptionPlansWithPricingSystems={
                        subscriptionPlansWithPricingSystems
                      }
                      onOpenProfile={onOpenProfile}
                      onCreateProjectFromExample={onCreateProjectFromExample}
                      askToCloseProject={askToCloseProject}
                    />
                  )}
                  {activeTab === 'build' && (
                    <BuildSection
                      project={project}
                      currentFileMetadata={fileMetadata}
                      canOpen={canOpen}
                      onChooseProject={onChooseProject}
                      onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
                      onSelectExampleShortHeader={onSelectExampleShortHeader}
                      onSelectPrivateGameTemplateListingData={
                        onSelectPrivateGameTemplateListingData
                      }
                      onOpenRecentFile={onOpenRecentFile}
                      onManageGame={onManageGame}
                      canManageGame={canManageGame}
                      storageProviders={storageProviders}
                      i18n={i18n}
                      closeProject={closeProject}
                    />
                  )}
                  {activeTab === 'learn' && (
                    <LearnSection
                      onTabChange={setActiveTab}
                      selectInAppTutorial={selectInAppTutorial}
                      onOpenTemplateFromTutorial={onOpenTemplateFromTutorial}
                      onOpenTemplateFromCourseChapter={
                        onOpenTemplateFromCourseChapter
                      }
                      initialCategory={learnInitialCategory}
                      course={selectedCourse}
                      displayCourse={displayCourse}
                      onDisplayCourse={setDisplayCourse}
                      courseChapters={courseChapters}
                      isLoadingChapters={isLoadingChapters}
                      onCompleteCourseTask={onCompleteTask}
                      isCourseTaskCompleted={isTaskCompleted}
                      getCourseChapterCompletion={getChapterCompletion}
                      getCourseCompletion={getCourseCompletion}
                      onBuyCourseChapterWithCredits={
                        onBuyCourseChapterWithCredits
                      }
                    />
                  )}
                  {activeTab === 'play' && <PlaySection />}
                  {activeTab === 'shop' && (
                    <StoreSection
                      project={project}
                      resourceManagementProps={resourceManagementProps}
                      onOpenPrivateGameTemplateListingData={
                        onOpenPrivateGameTemplateListingData
                      }
                      onOpenProfile={onOpenProfile}
                    />
                  )}
                  {activeTab === 'team-view' &&
                    (canUseClassroomFeature(limits) ? (
                      <TeamSection
                        project={project}
                        onOpenRecentFile={onOpenRecentFile}
                        storageProviders={storageProviders}
                        currentFileMetadata={fileMetadata}
                        onOpenTeachingResources={() => {
                          setLearnInitialCategory('education-curriculum');
                          setActiveTab('learn');
                        }}
                      />
                    ) : (
                      <EducationMarketingSection
                        form={educationForm}
                        onChangeForm={onChangeEducationForm}
                        onSendForm={onSendEducationForm}
                        formError={educationFormError}
                        formStatus={educationFormStatus}
                        onResetForm={onResetEducationForm}
                        onLogin={onOpenLoginDialog}
                      />
                    ))}
                </div>
                <HomePageMenu
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onOpenPreferences={onOpenPreferences}
                  onOpenAbout={onOpenAbout}
                />
              </div>
            </TeamProvider>
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
) => (
  <HomePage
    ref={props.ref}
    project={props.project}
    fileMetadata={props.fileMetadata}
    isActive={props.isActive}
    projectItemName={props.projectItemName}
    setToolbar={props.setToolbar}
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
    onOpenProjectManager={props.onOpenProjectManager}
    onOpenTemplateFromTutorial={props.onOpenTemplateFromTutorial}
    onOpenTemplateFromCourseChapter={props.onOpenTemplateFromCourseChapter}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
    onCreateProjectFromExample={props.onCreateProjectFromExample}
    askToCloseProject={props.askToCloseProject}
    closeProject={props.closeProject}
    selectInAppTutorial={props.selectInAppTutorial}
    onOpenPreferences={props.onOpenPreferences}
    onOpenAbout={props.onOpenAbout}
    storageProviders={
      (props.extraEditorProps && props.extraEditorProps.storageProviders) || []
    }
    onSave={props.onSave}
    canSave={props.canSave}
    resourceManagementProps={props.resourceManagementProps}
    gamesList={props.gamesList}
  />
);
