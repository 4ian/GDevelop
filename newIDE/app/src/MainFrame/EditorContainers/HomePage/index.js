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
import LearnSection from './LearnSection';
import { type LearnCategory } from './LearnSection/Utils';
import PlaySection from './PlaySection';
import CreateSection from './CreateSection';
import StoreSection from './StoreSection';
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
import RouterContext, { type RouteArguments } from '../../RouterContext';
import { type GameDetailsTab } from '../../../GameDashboard';
import { canUseClassroomFeature } from '../../../Utils/GDevelopServices/Usage';
import EducationMarketingSection from './EducationMarketingSection';
import useEducationForm from './UseEducationForm';
import { type ExampleProjectSetup } from '../../../ProjectCreation/NewProjectSetupDialog';
import { type ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import { type GamesList } from '../../../GameDashboard/UseGamesList';
import { type GamesPlatformFrameTools } from './PlaySection/UseGamesPlatformFrame';
import { type CourseChapter } from '../../../Utils/GDevelopServices/Asset';
import useCourses from './UseCourses';
import PreferencesContext from '../../Preferences/PreferencesContext';
import useSubscriptionPlans from '../../../Utils/UseSubscriptionPlans';
import { BundleStoreContext } from '../../../AssetStore/Bundles/BundleStoreContext';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../../../EmbeddedGame/EmbeddedGameFrame';
import { type CreateProjectResult } from '../../../Utils/UseCreateProject';
import { CreditsPackageStoreContext } from '../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';

const noop = () => {};

const getRequestedTab = (routeArguments: RouteArguments): HomeTab | null => {
  if (
    routeArguments['initial-dialog'] === 'asset-store' || // Compatibility with old links
    routeArguments['initial-dialog'] === 'store' // New way of opening the store
  ) {
    return 'shop';
  } else if (
    [
      'games-dashboard',
      'build', // Compatibility with old links
      'create',
    ].includes(routeArguments['initial-dialog'])
  ) {
    return 'create';
  } else if (routeArguments['initial-dialog'] === 'education') {
    return 'team-view';
  } else if (routeArguments['initial-dialog'] === 'play') {
    return 'play';
  } else if (routeArguments['initial-dialog'] === 'learn') {
    return 'learn';
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
    position: 'relative',
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
  setGamesPlatformFrameShown: ({| shown: boolean, isMobile: boolean |}) => void,
  storageProviders: Array<StorageProvider>,

  // Games
  gamesList: GamesList,

  // Games platform
  gamesPlatformFrameTools: GamesPlatformFrameTools,

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
  onOpenAskAi: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,

  // Project creation
  onOpenNewProjectSetupDialog: () => void,
  onCreateProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  onOpenTemplateFromTutorial: (tutorialId: string) => Promise<void>,
  onOpenTemplateFromCourseChapter: (
    CourseChapter,
    templateId?: string
  ) => Promise<void>,

  // Asset store
  onExtensionInstalled: (extensionNames: Array<string>) => void,

  // Project save
  onSave: () => Promise<void>,
  canSave: boolean,

  resourceManagementProps: ResourceManagementProps,

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
        onOpenVersionHistory,
        onOpenLanguageDialog,
        onOpenProfile,
        onCreateProjectFromExample,
        setToolbar,
        setGamesPlatformFrameShown,
        selectInAppTutorial,
        onOpenPreferences,
        onOpenAbout,
        onOpenAskAi,
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
        gamesPlatformFrameTools,
        onExtensionInstalled,
        gameEditorMode,
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
      const {
        startTimeoutToUnloadIframe,
        loadIframeOrRemoveTimeout,
      } = gamesPlatformFrameTools;
      const { fetchTutorials } = React.useContext(TutorialContext);
      const { fetchExamplesAndFilters } = React.useContext(ExampleStoreContext);
      const {
        fetchGameTemplates,
        shop: { setInitialGameTemplateUserFriendlySlug },
      } = React.useContext(PrivateGameTemplateStoreContext);
      const { fetchCreditsPackages } = React.useContext(
        CreditsPackageStoreContext
      );
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
        courses,
        selectedCourse,
        getCourseChapters,
        onSelectCourse,
        areCoursesFetched,
        onCompleteTask,
        isTaskCompleted,
        getChapterCompletion,
        getCourseCompletion,
        onBuyCourseWithCredits,
        onBuyCourse,
        purchasingCourseListingData,
        setPurchasingCourseListingData,
      } = useCourses();
      const [learnCategory, setLearnCategory] = React.useState<LearnCategory>(
        null
      );
      const { getSubscriptionPlansWithPricingSystems } = useSubscriptionPlans({
        authenticatedUser,
        includeLegacy: false,
      });

      const { isMobile } = useResponsiveWindowSize();
      const {
        values: { showCreateSectionByDefault },
      } = React.useContext(PreferencesContext);
      const tabRequestedAtOpening = React.useRef<HomeTab | null>(
        getRequestedTab(routeArguments)
      );
      const initialTab = tabRequestedAtOpening.current
        ? tabRequestedAtOpening.current
        : showCreateSectionByDefault
        ? 'create'
        : 'learn';

      const [activeTab, setActiveTab] = React.useState<HomeTab>(initialTab);

      const { setInitialPackUserFriendlySlug } = React.useContext(
        AssetStoreContext
      );
      const {
        fetchBundles,
        shop: {
          setInitialBundleUserFriendlySlug: setInitialBundleUserFriendlySlugForShop,
          setInitialBundleCategory: setInitialBundleCategoryForShop,
        },
      } = React.useContext(BundleStoreContext);
      const [
        initialBundleUserFriendlySlugForLearn,
        setInitialBundleUserFriendlySlugForLearn,
      ] = React.useState<?string>(null);
      const [
        initialBundleCategoryForLearn,
        setInitialBundleCategoryForLearn,
      ] = React.useState<?string>(null);
      const openedGame = React.useMemo(
        () =>
          !openedGameId || !games
            ? null
            : games.find(game => game.id === openedGameId),
        [games, openedGameId]
      );

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
            if (routeArguments['bundle']) {
              setInitialBundleUserFriendlySlugForShop(routeArguments['bundle']);
            }
            if (routeArguments['bundle-category']) {
              setInitialBundleCategoryForShop(
                routeArguments['bundle-category']
              );
            }
            // Remove the arguments so that the asset store is not opened again.
            removeRouteArguments([
              'asset-pack',
              'game-template',
              'bundle',
              'bundle-category',
            ]);
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
          } else if (requestedTab === 'learn') {
            if (routeArguments['course-id']) {
              if (!areCoursesFetched) {
                // Do not process requested tab before courses are ready.
                return;
              }
              onSelectCourse(routeArguments['course-id']);
            }
            if (routeArguments['bundle']) {
              setInitialBundleUserFriendlySlugForLearn(
                routeArguments['bundle']
              );
            }
            if (routeArguments['bundle-category']) {
              setInitialBundleCategoryForLearn(
                routeArguments['bundle-category']
              );
            }
            removeRouteArguments(['course-id', 'bundle', 'bundle-category']);
          }

          removeRouteArguments(['initial-dialog']);
        },
        [
          routeArguments,
          onSelectCourse,
          removeRouteArguments,
          setInitialPackUserFriendlySlug,
          setInitialGameTemplateUserFriendlySlug,
          setInitialBundleUserFriendlySlugForShop,
          setInitialBundleCategoryForShop,
          games,
          areCoursesFetched,
        ]
      );

      // Load everything when the user opens the home page, to avoid future loading times.
      React.useEffect(
        () => {
          fetchExamplesAndFilters();
          fetchGameTemplates();
          fetchTutorials();
          fetchBundles();
          fetchCreditsPackages();
        },
        [
          fetchExamplesAndFilters,
          fetchTutorials,
          fetchGameTemplates,
          fetchBundles,
          fetchCreditsPackages,
        ]
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
      // in the project manager) when navigating to the "Create" tab.
      React.useEffect(
        () => {
          if (isActive && activeTab === 'create' && authenticated) {
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

      // Ensure the toolbar is up to date when the active tab changes.
      // Use a layout effect to ensure titlebar/toolbar are updated at the same time
      // as the rest of the interface (same React render).
      React.useLayoutEffect(
        () => {
          // Hide the toolbars when on mobile in the "play" tab.
          if (activeTab === 'play') {
            setGamesPlatformFrameShown({ shown: true, isMobile });
          } else {
            setGamesPlatformFrameShown({ shown: false, isMobile });
            updateToolbar();
          }

          // Ensure we show it again when the tab changes.
          return () => {
            setGamesPlatformFrameShown({ shown: false, isMobile });
          };
        },
        [updateToolbar, activeTab, setGamesPlatformFrameShown, isMobile]
      );

      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor: noop,
        onEventsBasedObjectChildrenEdited: noop,
        onSceneObjectEdited: noop,
        onSceneObjectsDeleted: noop,
        onSceneEventsModifiedOutsideEditor: noop,
        notifyChangesToInGameEditor: setEditorHotReloadNeeded,
        switchInGameEditorIfNoHotReloadIsNeeded: noop,
        onInstancesModifiedOutsideEditor: noop,
        onObjectsModifiedOutsideEditor: noop,
        onObjectGroupsModifiedOutsideEditor: noop,
      }));

      // As the homepage is never unmounted, we need to ensure the games platform
      // iframe is unloaded & loaded from here,
      // allowing to handle when the user navigates to another tab.
      React.useEffect(
        () => {
          if (!isActive) {
            // This happens when the user navigates to another tab. (ex: Scene or Events)
            startTimeoutToUnloadIframe();
            return;
          }

          if (activeTab === 'play') {
            // This happens when the user navigates to the "Play" tab,
            // - From another Home Tab.
            // - From another tab (ex: Scene or Events).
            loadIframeOrRemoveTimeout();
          } else {
            // This happens when the user navigates to another Home Tab.
            startTimeoutToUnloadIframe();
          }
        },
        [
          isActive,
          startTimeoutToUnloadIframe,
          loadIframeOrRemoveTimeout,
          activeTab,
        ]
      );

      const premiumCourse = courses
        ? courses.find(course => course.id === 'premium-course')
        : null;

      return (
        <I18n>
          {({ i18n }) => (
            <TeamProvider>
              <div style={isMobile ? styles.mobileContainer : styles.container}>
                <div style={styles.scrollableContainer}>
                  {activeTab === 'create' && (
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
                      onOpenProfile={onOpenProfile}
                      askToCloseProject={askToCloseProject}
                      onCreateProjectFromExample={onCreateProjectFromExample}
                      onSelectExampleShortHeader={onSelectExampleShortHeader}
                      onSelectPrivateGameTemplateListingData={
                        onSelectPrivateGameTemplateListingData
                      }
                      i18n={i18n}
                      onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
                      onChooseProject={onChooseProject}
                      onSaveProject={onSave}
                      canSaveProject={canSave}
                    />
                  )}
                  {activeTab === 'learn' && (
                    <LearnSection
                      selectInAppTutorial={selectInAppTutorial}
                      onOpenTemplateFromTutorial={onOpenTemplateFromTutorial}
                      onOpenTemplateFromCourseChapter={
                        onOpenTemplateFromCourseChapter
                      }
                      selectedCategory={learnCategory}
                      onSelectCategory={setLearnCategory}
                      onSelectCourse={onSelectCourse}
                      courses={courses}
                      previewedCourse={premiumCourse}
                      course={selectedCourse}
                      getCourseChapters={getCourseChapters}
                      onCompleteCourseTask={onCompleteTask}
                      isCourseTaskCompleted={isTaskCompleted}
                      getCourseChapterCompletion={getChapterCompletion}
                      getCourseCompletion={getCourseCompletion}
                      onBuyCourseWithCredits={onBuyCourseWithCredits}
                      onBuyCourse={onBuyCourse}
                      purchasingCourseListingData={purchasingCourseListingData}
                      setPurchasingCourseListingData={
                        setPurchasingCourseListingData
                      }
                      onOpenAskAi={onOpenAskAi}
                      onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
                      onSelectPrivateGameTemplateListingData={
                        onSelectPrivateGameTemplateListingData
                      }
                      onSelectExampleShortHeader={onSelectExampleShortHeader}
                      getSubscriptionPlansWithPricingSystems={
                        getSubscriptionPlansWithPricingSystems
                      }
                      clearInitialBundleValues={() => {
                        setInitialBundleUserFriendlySlugForLearn(null);
                        setInitialBundleCategoryForLearn(null);
                      }}
                      initialBundleUserFriendlySlug={
                        initialBundleUserFriendlySlugForLearn
                      }
                      initialBundleCategory={initialBundleCategoryForLearn}
                    />
                  )}
                  {activeTab === 'play' && (
                    <PlaySection
                      gamesPlatformFrameTools={gamesPlatformFrameTools}
                    />
                  )}
                  {activeTab === 'shop' && (
                    <StoreSection
                      project={project}
                      resourceManagementProps={resourceManagementProps}
                      onOpenPrivateGameTemplateListingData={
                        onOpenPrivateGameTemplateListingData
                      }
                      onOpenProfile={onOpenProfile}
                      onExtensionInstalled={onExtensionInstalled}
                      onCourseOpen={(courseId: string) => {
                        onSelectCourse(courseId);
                        setActiveTab('learn');
                      }}
                      courses={courses}
                      getCourseCompletion={getCourseCompletion}
                      getSubscriptionPlansWithPricingSystems={
                        getSubscriptionPlansWithPricingSystems
                      }
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
                          setLearnCategory('education-curriculum');
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
    onOpenVersionHistory={props.onOpenVersionHistory}
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
    onOpenAskAi={props.onOpenAskAi}
    storageProviders={
      (props.extraEditorProps && props.extraEditorProps.storageProviders) || []
    }
    onSave={props.onSave}
    canSave={props.canSave}
    resourceManagementProps={props.resourceManagementProps}
    gamesList={props.gamesList}
    gamesPlatformFrameTools={props.gamesPlatformFrameTools}
    onExtensionInstalled={props.onExtensionInstalled}
    gameEditorMode={props.gameEditorMode}
  />
);
