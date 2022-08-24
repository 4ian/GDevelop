// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Line, Column } from '../../../UI/Grid';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import {
  type OnCreateBlankFunction,
  type OnOpenProjectAfterCreationFunction,
} from '../../../ProjectCreation/CreateProjectDialog';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../ProjectsStorage';
import GetStartedSection from './GetStartedSection';
import BuildSection, { type BuildSectionInterface } from './BuildSection';
import LearnSection from './LearnSection';
import PlaySection from './PlaySection';
import CommunitySection from './CommunitySection';
import { TutorialContext } from '../../../Tutorial/TutorialContext';
import { GamesShowcaseContext } from '../../../GamesShowcase/GamesShowcaseContext';
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import { HomePageHeader } from './HomePageHeader';
import { HomePageMenu, type HomeTab } from './HomePageMenu';
import PreferencesContext from '../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';

type Props = {|
  project: ?gdProject,

  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,
  storageProviders: Array<StorageProvider>,

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
  onOpenOnboardingDialog: () => void,
  onChangeSubscription: () => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,

  // Project creation
  onCreateBlank: OnCreateBlankFunction,
  onOpenProjectAfterCreation: OnOpenProjectAfterCreationFunction,
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
        onCreateBlank,
        onOpenProjectAfterCreation,
        onCreateProject,
        onOpenProjectManager,
        onOpenHelpFinder,
        onOpenLanguageDialog,
        onOpenProfile,
        setToolbar,
        onOpenOnboardingDialog,
        onChangeSubscription,
        onOpenPreferences,
        onOpenAbout,
        isActive,
        storageProviders,
      }: Props,
      ref
    ) => {
      const { authenticated, onCloudProjectsChanged } = React.useContext(
        AuthenticatedUserContext
      );
      const { fetchTutorials } = React.useContext(TutorialContext);
      const { fetchShowcasedGamesAndFilters } = React.useContext(
        GamesShowcaseContext
      );
      const { fetchExamplesAndFilters } = React.useContext(ExampleStoreContext);
      const {
        values: { showGetStartedSection },
        setShowGetStartedSection,
      } = React.useContext(PreferencesContext);
      const buildSectionRef = React.useRef<?BuildSectionInterface>(null);

      // Load everything when the user opens the home page, to avoid future loading times.
      React.useEffect(
        () => {
          fetchShowcasedGamesAndFilters();
          fetchExamplesAndFilters();
          fetchTutorials();
        },
        [fetchExamplesAndFilters, fetchShowcasedGamesAndFilters, fetchTutorials]
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

      const getProject = () => {
        return undefined;
      };

      const updateToolbar = () => {
        if (setToolbar) setToolbar(null);
      };

      const forceUpdateEditor = () => {
        // No updates to be done
      };

      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor,
      }));

      const initialTab = showGetStartedSection ? 'get-started' : 'build';

      const [activeTab, setActiveTab] = React.useState<HomeTab>(initialTab);

      return (
        <I18n>
          {({ i18n }) => (
            <>
              <Column expand noMargin>
                <HomePageHeader
                  project={project}
                  onOpenLanguageDialog={onOpenLanguageDialog}
                  onOpenProfile={onOpenProfile}
                  onOpenProjectManager={onOpenProjectManager}
                />
                <Line expand noMargin useFullHeight>
                  <HomePageMenu
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenPreferences={onOpenPreferences}
                    onOpenAbout={onOpenAbout}
                  />
                  {activeTab === 'get-started' && (
                    <GetStartedSection
                      onTabChange={setActiveTab}
                      onCreateProject={() => onCreateProject(null)}
                      onOpenOnboardingDialog={onOpenOnboardingDialog}
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
                      onCreateBlank={onCreateBlank}
                      onShowAllExamples={() => onCreateProject(null)}
                      onSelectExample={exampleShortHeader =>
                        onCreateProject(exampleShortHeader)
                      }
                      onOpenProjectAfterCreation={onOpenProjectAfterCreation}
                      onOpenRecentFile={onOpenRecentFile}
                      onChangeSubscription={onChangeSubscription}
                      storageProviders={storageProviders}
                    />
                  )}
                  {activeTab === 'learn' && (
                    <LearnSection
                      onOpenOnboardingDialog={onOpenOnboardingDialog}
                      onCreateProject={() => onCreateProject(null)}
                      onTabChange={setActiveTab}
                      onOpenHelpFinder={onOpenHelpFinder}
                    />
                  )}
                  {activeTab === 'play' && <PlaySection />}
                  {activeTab === 'community' && <CommunitySection />}
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
    onOpenProjectAfterCreation={props.onOpenProjectAfterCreation}
    onOpenRecentFile={props.onOpenRecentFile}
    onCreateProject={props.onCreateProject}
    onCreateBlank={props.onCreateBlank}
    onOpenProjectManager={props.onOpenProjectManager}
    onOpenHelpFinder={props.onOpenHelpFinder}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
    onOpenOnboardingDialog={props.onOpenOnboardingDialog}
    onChangeSubscription={props.onChangeSubscription}
    onOpenPreferences={props.onOpenPreferences}
    onOpenAbout={props.onOpenAbout}
    storageProviders={
      (props.extraEditorProps && props.extraEditorProps.storageProviders) || []
    }
  />
);
