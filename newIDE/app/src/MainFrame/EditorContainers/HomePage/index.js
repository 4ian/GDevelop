// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
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
import CommunitySection from './CommunitySection';
import StoreSection from './StoreSection';
import { TutorialContext } from '../../../Tutorial/TutorialContext';
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import { HomePageHeader } from './HomePageHeader';
import { HomePageMenu, type HomeTab } from './HomePageMenu';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';
import { AnnouncementsFeed } from '../../../AnnouncementsFeed';
import { AnnouncementsFeedContext } from '../../../AnnouncementsFeed/AnnouncementsFeedContext';
import { type ResourceManagementProps } from '../../../ResourcesList/ResourceSource';
import { AssetStoreContext } from '../../../AssetStore/AssetStoreContext';
import TeamSection from './TeamSection';
import TeamProvider from '../../../Profile/Team/TeamProvider';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { type PrivateGameTemplateListingData } from '../../../Utils/GDevelopServices/Shop';
import { PrivateGameTemplateStoreContext } from '../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import PreferencesContext from '../../Preferences/PreferencesContext';
import { incrementGetStartedSectionViewCount } from '../../../Utils/Analytics/LocalStats';
import {
  sendUserSurveyHidden,
  sendUserSurveyStarted,
} from '../../../Utils/Analytics/EventSender';
import RouterContext, { type RouteArguments } from '../../RouterContext';
import { type GameDetailsTab } from '../../../GameDashboard/GameDetails';
import { type Game } from '../../../Utils/GDevelopServices/Game';
import useGamesList from '../../../GameDashboard/UseGamesList';
import useDisplayNewFeature from '../../../Utils/UseDisplayNewFeature';
import HighlightingTooltip from '../../../UI/HighlightingTooltip';
import Text from '../../../UI/Text';
import Link from '../../../UI/Link';
import Window from '../../../Utils/Window';
import { getHelpLink } from '../../../Utils/HelpLink';

const gamesDashboardWikiArticle = getHelpLink('/interface/games-dashboard/');
const isShopRequested = (routeArguments: RouteArguments): boolean =>
  routeArguments['initial-dialog'] === 'asset-store' || // Compatibility with old links
  routeArguments['initial-dialog'] === 'store'; // New way of opening the store
const isGamesDashboardRequested = (routeArguments: RouteArguments): boolean =>
  routeArguments['initial-dialog'] === 'games-dashboard';

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

  // Project opening
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenExampleStore: () => void,
  onOpenExampleStoreWithExampleShortHeader: ExampleShortHeader => void,
  onOpenExampleStoreWithPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onOpenPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onOpenProjectManager: () => void,

  // Other dialogs opening:
  onOpenLanguageDialog: () => void,
  onOpenProfile: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,

  // Project creation
  onOpenNewProjectSetupDialog: () => void,

  // Project save
  onSave: () => Promise<void>,
  canSave: boolean,

  resourceManagementProps: ResourceManagementProps,
  canInstallPrivateAsset: () => boolean,
|};

type HomePageEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
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
        onOpenExampleStore,
        onOpenExampleStoreWithExampleShortHeader,
        onOpenExampleStoreWithPrivateGameTemplateListingData,
        onOpenPrivateGameTemplateListingData,
        onOpenProjectManager,
        onOpenLanguageDialog,
        onOpenProfile,
        setToolbar,
        selectInAppTutorial,
        onOpenPreferences,
        onOpenAbout,
        isActive,
        storageProviders,
        onSave,
        canSave,
        resourceManagementProps,
        canInstallPrivateAsset,
      }: Props,
      ref
    ) => {
      const {
        authenticated,
        onCloudProjectsChanged,
        loginState,
      } = React.useContext(AuthenticatedUserContext);
      const userSurveyStartedRef = React.useRef<boolean>(false);
      const userSurveyHiddenRef = React.useRef<boolean>(false);
      const shouldChangeTabAfterUserLoggedIn = React.useRef<boolean>(true);
      const { announcements } = React.useContext(AnnouncementsFeedContext);
      const { fetchTutorials } = React.useContext(TutorialContext);
      const { fetchExamplesAndFilters } = React.useContext(ExampleStoreContext);
      const {
        fetchGameTemplates,
        shop: { setInitialGameTemplateUserFriendlySlug },
      } = React.useContext(PrivateGameTemplateStoreContext);
      const [showUserChip, setShowUserChip] = React.useState<boolean>(false);
      const [openedGame, setOpenedGame] = React.useState<?Game>(null);
      const [
        gameDetailsCurrentTab,
        setGameDetailsCurrentTab,
      ] = React.useState<GameDetailsTab>('details');

      const windowWidth = useResponsiveWindowWidth();
      const isMobile = windowWidth === 'small';
      const {
        values: { showGetStartedSectionByDefault },
      } = React.useContext(PreferencesContext);
      const initialTab = showGetStartedSectionByDefault
        ? 'get-started'
        : 'build';

      const [activeTab, setActiveTab] = React.useState<HomeTab>(initialTab);

      const { routeArguments, removeRouteArguments } = React.useContext(
        RouterContext
      );
      const { setInitialPackUserFriendlySlug } = React.useContext(
        AssetStoreContext
      );
      const isShopRequestedAtOpening = React.useRef<boolean>(
        isShopRequested(routeArguments)
      );
      const isGamesDashboardRequestedAtOpening = React.useRef<boolean>(
        isGamesDashboardRequested(routeArguments)
      );
      const [
        displayTooltipDelayed,
        setDisplayTooltipDelayed,
      ] = React.useState<boolean>(false);
      const {
        games,
        gamesFetchingError,
        onGameUpdated,
        fetchGames,
      } = useGamesList();
      const {
        shouldDisplayNewFeatureHighlighting,
        acknowledgeNewFeature,
      } = useDisplayNewFeature();
      const manageTabElement = document.getElementById('home-manage-tab');
      const shouldDisplayTooltip = shouldDisplayNewFeatureHighlighting({
        featureId: 'gamesDashboardInHomePage',
      });

      const displayTooltip =
        isActive && shouldDisplayTooltip && manageTabElement;

      const onCloseTooltip = React.useCallback(
        () => {
          setDisplayTooltipDelayed(false);
          acknowledgeNewFeature({ featureId: 'gamesDashboardInHomePage' });
        },
        [acknowledgeNewFeature]
      );

      // Open the store and a pack or game template if asked to do so.
      React.useEffect(
        () => {
          if (isShopRequested(routeArguments)) {
            setActiveTab('shop');
            if (routeArguments['asset-pack']) {
              setInitialPackUserFriendlySlug(routeArguments['asset-pack']);
            }
            if (routeArguments['game-template']) {
              setInitialGameTemplateUserFriendlySlug(
                routeArguments['game-template']
              );
            }
            // Remove the arguments so that the asset store is not opened again.
            removeRouteArguments([
              'initial-dialog',
              'asset-pack',
              'game-template',
            ]);
          } else if (isGamesDashboardRequested(routeArguments)) {
            setActiveTab('manage');
            removeRouteArguments(['initial-dialog']);
          }
        },
        [
          routeArguments,
          removeRouteArguments,
          setInitialPackUserFriendlySlug,
          setInitialGameTemplateUserFriendlySlug,
        ]
      );

      // If the user is not authenticated, the GetStarted section is displayed unless
      // a specific tab is requested via the url.
      React.useEffect(
        () => {
          if (
            isShopRequestedAtOpening.current ||
            isGamesDashboardRequestedAtOpening.current
          )
            return;
          if (shouldChangeTabAfterUserLoggedIn.current) {
            setActiveTab(authenticated ? initialTab : 'get-started');
          }
        },
        // Only the initialTab at component mounting is interesting
        // and we don't want to change the active tab if initialTab changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [authenticated]
      );

      // This effect makes sure that the tab changing cannot happen once the editor is up
      // and running (shouldChangeTabAfterUserLoggedIn is never set back to true).
      // At the time the HomePage is mounting, if there is any firebase data on the device
      // the authentication is ongoing, with loginState having the value 'loggingIn'.
      // So once the authentication is over (loginState with value 'done'), the above effect
      // (that changes the tab) is run prior to this one, the tab is changed
      // and shouldChangeTabAfterUserLoggedIn is set to false.
      React.useEffect(
        () => {
          if (loginState === 'loggingIn') return;
          shouldChangeTabAfterUserLoggedIn.current = false;
        },
        [loginState]
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

      React.useEffect(
        () => {
          if (displayTooltip) {
            const timeoutId = setTimeout(() => {
              setDisplayTooltipDelayed(true);
            }, 500);
            return () => clearTimeout(timeoutId);
          } else {
            setDisplayTooltipDelayed(false);
          }
        },
        // Delay display of tooltip because home tab is the first to be opened
        // but the editor might open a project at start, displaying the tooltip
        // while the project is loading, giving the impression of a glitch.
        [displayTooltip]
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
                showUserChip={showUserChip}
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
          showUserChip,
        ]
      );

      // Ensure the toolbar is up to date when the active tab changes.
      React.useEffect(
        () => {
          updateToolbar();
        },
        [updateToolbar]
      );

      React.useEffect(
        () => {
          // Always show the user chip, apart on the GetStarted page which handles it on its own.
          if (activeTab !== 'get-started') {
            setShowUserChip(true);
          }
        },
        [activeTab]
      );

      const forceUpdateEditor = React.useCallback(() => {
        // No updates to be done
      }, []);

      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor,
      }));

      // If the user logs out and is on the team view section, go back to the build section.
      React.useEffect(
        () => {
          if (activeTab === 'team-view' && !authenticated) {
            setActiveTab('build');
          }
        },
        [authenticated, activeTab]
      );

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

      const handleGameUpdated = React.useCallback(
        (game: Game) => {
          onGameUpdated(game);
          if (openedGame) setOpenedGame(game);
        },
        [onGameUpdated, openedGame]
      );

      const onManageGame = React.useCallback(
        ({ gameId }: { gameId: string }) => {
          if (!games) return;
          const matchingGame = games.find(game => game.id === gameId);
          if (!matchingGame) return;
          setOpenedGame(matchingGame);
          setActiveTab('manage');
        },
        [games]
      );

      const canManageGame = React.useCallback(
        ({ gameId }: { gameId: string }): boolean => {
          if (!games) return false;
          const matchingGameIndex = games.findIndex(game => game.id === gameId);
          return matchingGameIndex > -1;
        },
        [games]
      );

      const shouldDisplayAnnouncements =
        activeTab !== 'community' &&
        // Get started page displays announcements itself.
        activeTab !== 'get-started' &&
        !!announcements;

      return (
        <I18n>
          {({ i18n }) => (
            <TeamProvider>
              <div style={isMobile ? styles.mobileContainer : styles.container}>
                <div style={styles.scrollableContainer}>
                  {shouldDisplayAnnouncements && (
                    <AnnouncementsFeed canClose level="urgent" addMargins />
                  )}
                  {activeTab === 'manage' && (
                    <ManageSection
                      project={project}
                      games={games}
                      onGameUpdated={handleGameUpdated}
                      onRefreshGames={fetchGames}
                      gamesFetchingError={gamesFetchingError}
                      openedGame={openedGame}
                      setOpenedGame={setOpenedGame}
                      currentTab={gameDetailsCurrentTab}
                      setCurrentTab={setGameDetailsCurrentTab}
                    />
                  )}
                  {activeTab === 'get-started' && (
                    <GetStartedSection
                      showUserChip={setShowUserChip}
                      selectInAppTutorial={selectInAppTutorial}
                      onUserSurveyStarted={onUserSurveyStarted}
                      onUserSurveyHidden={onUserSurveyHidden}
                    />
                  )}
                  {activeTab === 'build' && (
                    <BuildSection
                      project={project}
                      currentFileMetadata={fileMetadata}
                      canOpen={canOpen}
                      onChooseProject={onChooseProject}
                      onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
                      onShowAllExamples={onOpenExampleStore}
                      onSelectExampleShortHeader={
                        onOpenExampleStoreWithExampleShortHeader
                      }
                      onSelectPrivateGameTemplateListingData={
                        onOpenExampleStoreWithPrivateGameTemplateListingData
                      }
                      onOpenRecentFile={onOpenRecentFile}
                      onManageGame={onManageGame}
                      canManageGame={canManageGame}
                      storageProviders={storageProviders}
                      i18n={i18n}
                    />
                  )}
                  {activeTab === 'learn' && (
                    <LearnSection
                      onOpenExampleStore={onOpenExampleStore}
                      onTabChange={setActiveTab}
                      selectInAppTutorial={selectInAppTutorial}
                    />
                  )}
                  {activeTab === 'play' && <PlaySection />}
                  {activeTab === 'community' && <CommunitySection />}
                  {activeTab === 'shop' && (
                    <StoreSection
                      project={project}
                      resourceManagementProps={resourceManagementProps}
                      canInstallPrivateAsset={canInstallPrivateAsset}
                      onOpenPrivateGameTemplateListingData={
                        onOpenPrivateGameTemplateListingData
                      }
                    />
                  )}
                  {activeTab === 'team-view' && (
                    <TeamSection
                      project={project}
                      onOpenRecentFile={onOpenRecentFile}
                      storageProviders={storageProviders}
                      currentFileMetadata={fileMetadata}
                    />
                  )}
                </div>
                <HomePageMenu
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onOpenPreferences={onOpenPreferences}
                  onOpenAbout={onOpenAbout}
                />
              </div>
              {displayTooltipDelayed && (
                <HighlightingTooltip
                  // $FlowIgnore - displayTooltipDelayed makes sure the element is defined
                  anchorElement={manageTabElement}
                  title={<Trans>Games Dashboard</Trans>}
                  thumbnailSource="res/features/games-dashboard.svg"
                  thumbnailAlt={'Red hero presenting games analytics'}
                  content={[
                    <Text noMargin key="paragraph">
                      <Trans>
                        Follow your games’ online performance, manage published
                        versions, and collect player feedback.
                      </Trans>
                    </Text>,
                    <Text noMargin key="link">
                      <Link
                        href={gamesDashboardWikiArticle}
                        onClick={() =>
                          Window.openExternalURL(gamesDashboardWikiArticle)
                        }
                      >
                        <Trans>Learn more</Trans>
                      </Link>
                    </Text>,
                  ]}
                  placement={isMobile ? 'bottom' : 'right'}
                  onClose={onCloseTooltip}
                  closeWithBackdropClick={false}
                />
              )}
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
    onOpenExampleStore={props.onOpenExampleStore}
    onOpenExampleStoreWithExampleShortHeader={
      props.onOpenExampleStoreWithExampleShortHeader
    }
    onOpenExampleStoreWithPrivateGameTemplateListingData={
      props.onOpenExampleStoreWithPrivateGameTemplateListingData
    }
    onOpenPrivateGameTemplateListingData={
      props.onOpenPrivateGameTemplateListingData
    }
    onOpenNewProjectSetupDialog={props.onOpenNewProjectSetupDialog}
    onOpenProjectManager={props.onOpenProjectManager}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
    selectInAppTutorial={props.selectInAppTutorial}
    onOpenPreferences={props.onOpenPreferences}
    onOpenAbout={props.onOpenAbout}
    storageProviders={
      (props.extraEditorProps && props.extraEditorProps.storageProviders) || []
    }
    onSave={props.onSave}
    canSave={props.canSave}
    resourceManagementProps={props.resourceManagementProps}
    canInstallPrivateAsset={props.canInstallPrivateAsset}
  />
);
