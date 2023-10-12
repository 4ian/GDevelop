// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
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
import CommunitySection from './CommunitySection';
import StoreSection from './StoreSection';
import { TutorialContext } from '../../../Tutorial/TutorialContext';
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import { HomePageHeader } from './HomePageHeader';
import { HomePageMenu, type HomeTab } from './HomePageMenu';
import PreferencesContext from '../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';
import { AnnouncementsFeed } from '../../../AnnouncementsFeed';
import { AnnouncementsFeedContext } from '../../../AnnouncementsFeed/AnnouncementsFeedContext';
import { type ResourceManagementProps } from '../../../ResourcesList/ResourceSource';
import RouterContext from '../../RouterContext';
import { AssetStoreContext } from '../../../AssetStore/AssetStoreContext';
import TeamSection from './TeamSection';
import TeamProvider from '../../../Profile/Team/TeamProvider';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { type PrivateGameTemplateListingData } from '../../../Utils/GDevelopServices/Shop';
import { PrivateGameTemplateStoreContext } from '../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';

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
  initialTab?: ?string,

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
  onOpenHelpFinder: () => void,
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
        onOpenHelpFinder,
        onOpenLanguageDialog,
        onOpenProfile,
        setToolbar,
        selectInAppTutorial,
        onOpenPreferences,
        onOpenAbout,
        isActive,
        storageProviders,
        initialTab,
        onSave,
        canSave,
        resourceManagementProps,
        canInstallPrivateAsset,
      }: Props,
      ref
    ) => {
      const { authenticated, onCloudProjectsChanged } = React.useContext(
        AuthenticatedUserContext
      );
      const { announcements } = React.useContext(AnnouncementsFeedContext);
      const { fetchTutorials } = React.useContext(TutorialContext);
      const { fetchExamplesAndFilters } = React.useContext(ExampleStoreContext);
      const {
        fetchGameTemplates,
        shop: { setInitialGameTemplateUserFriendlySlug },
      } = React.useContext(PrivateGameTemplateStoreContext);
      const {
        values: { showGetStartedSection },
        setShowGetStartedSection,
      } = React.useContext(PreferencesContext);
      const windowWidth = useResponsiveWindowWidth();
      const isMobile = windowWidth === 'small';

      const [activeTab, setActiveTab] = React.useState<HomeTab>('get-started');

      console.log(activeTab);

      // Load everything when the user opens the home page, to avoid future loading times.
      React.useEffect(
        () => {
          fetchExamplesAndFilters();
          fetchGameTemplates();
          fetchTutorials();
        },
        [fetchExamplesAndFilters, fetchTutorials, fetchGameTemplates]
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
                showUserChip={activeTab !== 'get-started'}
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
          activeTab,
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

      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor,
      }));

      const { routeArguments, removeRouteArguments } = React.useContext(
        RouterContext
      );
      const { setInitialPackUserFriendlySlug } = React.useContext(
        AssetStoreContext
      );

      // Open the store and a pack or game template if asked to do so.
      React.useEffect(
        () => {
          if (
            routeArguments['initial-dialog'] === 'asset-store' || // Compatibility with old links
            routeArguments['initial-dialog'] === 'store' // New way of opening the store
          ) {
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
          }
        },
        [
          routeArguments,
          removeRouteArguments,
          setInitialPackUserFriendlySlug,
          setInitialGameTemplateUserFriendlySlug,
        ]
      );

      // If the user logs out and is on the team view section, go back to the build section.
      React.useEffect(
        () => {
          if (activeTab === 'team-view' && !authenticated) {
            setActiveTab('build');
          }
        },
        [authenticated, activeTab]
      );

      return (
        <I18n>
          {({ i18n }) => (
            <TeamProvider>
              <div style={isMobile ? styles.mobileContainer : styles.container}>
                <div style={styles.scrollableContainer}>
                  {activeTab !== 'community' &&
                    activeTab !== 'get-started' &&
                    activeTab !== 'build' &&
                    !!announcements && (
                      <AnnouncementsFeed canClose level="urgent" addMargins />
                    )}
                  {activeTab === 'get-started' && <GetStartedSection />}
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
                      storageProviders={storageProviders}
                      i18n={i18n}
                    />
                  )}
                  {activeTab === 'learn' && (
                    <LearnSection
                      onOpenExampleStore={onOpenExampleStore}
                      onTabChange={setActiveTab}
                      onOpenHelpFinder={onOpenHelpFinder}
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
    onOpenHelpFinder={props.onOpenHelpFinder}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
    selectInAppTutorial={props.selectInAppTutorial}
    onOpenPreferences={props.onOpenPreferences}
    onOpenAbout={props.onOpenAbout}
    storageProviders={
      (props.extraEditorProps && props.extraEditorProps.storageProviders) || []
    }
    initialTab={
      (props.extraEditorProps && props.extraEditorProps.initialTab) || null
    }
    onSave={props.onSave}
    canSave={props.canSave}
    resourceManagementProps={props.resourceManagementProps}
    canInstallPrivateAsset={props.canInstallPrivateAsset}
  />
);
