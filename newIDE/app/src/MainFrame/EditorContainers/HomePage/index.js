// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Line, Column } from '../../../UI/Grid';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../ProjectsStorage';
import GetStartedSection from './GetStartedSection';
import BuildSection, { type BuildSectionInterface } from './BuildSection';
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

type Props = {|
  project: ?gdProject,

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
  onCreateProject: (ExampleShortHeader | null) => void,
  onOpenProjectManager: () => void,

  // Other dialogs opening:
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onOpenProfile: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,

  // Project creation
  onOpenNewProjectSetupDialog: (?ExampleShortHeader) => void,

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
        canOpen,
        onChooseProject,
        onOpenRecentFile,
        onOpenNewProjectSetupDialog,
        onCreateProject,
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
        values: { showGetStartedSection },
        setShowGetStartedSection,
      } = React.useContext(PreferencesContext);
      const buildSectionRef = React.useRef<?BuildSectionInterface>(null);

      // Load everything when the user opens the home page, to avoid future loading times.
      React.useEffect(
        () => {
          fetchExamplesAndFilters();
          fetchTutorials();
        },
        [fetchExamplesAndFilters, fetchTutorials]
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

      // Refresh build section when homepage becomes active
      React.useEffect(
        () => {
          if (isActive && activeTab === 'build' && buildSectionRef.current) {
            buildSectionRef.current.forceUpdate();
          }
        },
        // Active tab is excluded from the dependencies because switching tab
        // mounts and unmounts section, so the data is already up to date.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isActive]
      );

      const getProject = React.useCallback(() => {
        return undefined;
      }, []);

      const updateToolbar = React.useCallback(
        () => {
          if (setToolbar)
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

      // Open the asset store and a pack if asked to do so.
      React.useEffect(
        () => {
          if (routeArguments['initial-dialog'] === 'asset-store') {
            setActiveTab('shop');
            setInitialPackUserFriendlySlug(routeArguments['asset-pack']);
            // Remove the arguments so that the asset store is not opened again.
            removeRouteArguments(['initial-dialog', 'asset-pack']);
          }
        },
        [routeArguments, removeRouteArguments, setInitialPackUserFriendlySlug]
      );

      const [activeTab, setActiveTab] = React.useState<HomeTab>(
        showGetStartedSection ? 'get-started' : 'build'
      );

      return (
        <I18n>
          {({ i18n }) => (
            <>
              <Column expand noMargin noOverflowParent>
                <Line expand noMargin useFullHeight>
                  <HomePageMenu
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenPreferences={onOpenPreferences}
                    onOpenAbout={onOpenAbout}
                  />
                  <Column noMargin expand noOverflowParent>
                    {activeTab !== 'community' && !!announcements && (
                      <AnnouncementsFeed canClose level="urgent" addMargins />
                    )}
                    {activeTab === 'get-started' && (
                      <GetStartedSection
                        onTabChange={setActiveTab}
                        onCreateProject={() =>
                          onCreateProject(/*exampleShortHeader=*/ null)
                        }
                        selectInAppTutorial={selectInAppTutorial}
                        showGetStartedSection={showGetStartedSection}
                        setShowGetStartedSection={setShowGetStartedSection}
                      />
                    )}
                    {activeTab === 'build' && (
                      <BuildSection
                        ref={buildSectionRef}
                        project={project}
                        canOpen={canOpen}
                        onChooseProject={onChooseProject}
                        onOpenNewProjectSetupDialog={
                          onOpenNewProjectSetupDialog
                        }
                        onShowAllExamples={() =>
                          onCreateProject(/*exampleShortHeader=*/ null)
                        }
                        onSelectExample={exampleShortHeader =>
                          onCreateProject(exampleShortHeader)
                        }
                        onOpenRecentFile={onOpenRecentFile}
                        storageProviders={storageProviders}
                      />
                    )}
                    {activeTab === 'learn' && (
                      <LearnSection
                        onCreateProject={() =>
                          onCreateProject(/*exampleShortHeader=*/ null)
                        }
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
                      />
                    )}
                  </Column>
                </Line>
              </Column>
            </>
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
    isActive={props.isActive}
    projectItemName={props.projectItemName}
    setToolbar={props.setToolbar}
    canOpen={props.canOpen}
    onChooseProject={props.onChooseProject}
    onOpenRecentFile={props.onOpenRecentFile}
    onCreateProject={props.onCreateProject}
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
