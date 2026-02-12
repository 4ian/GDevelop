// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';
import CreateSection from '../../../../MainFrame/EditorContainers/HomePage/CreateSection';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../../GDevelopJsInitializerDecorator';
import { ExampleStoreStateProvider } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import { TutorialStateProvider } from '../../../../Tutorial/TutorialContext';
import PreferencesContext, {
  initialPreferences,
  type InAppTutorialUserProgress,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import { type FileMetadataAndStorageProviderName } from '../../../../ProjectsStorage';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../../../ProjectsStorage/CloudStorageProvider';
import {
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserLoggingIn,
} from '../../../../fixtures/GDevelopServicesTestData';
import fakeResourceManagementProps from '../../../FakeResourceManagement';
import inAppTutorialDecorator from '../../../InAppTutorialDecorator';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { type Game } from '../../../../Utils/GDevelopServices/Game';

const getRecentProjectFiles = (count: number) =>
  new Array<number>(count).fill(0).map((_, index) => ({
    fileMetadata: {
      fileIdentifier: `Users/me/Desktop/Gdevelop/project ${index}`,
      lastModifiedDate: Math.floor(Math.random() * 1656942410477) + 1,
    },
    storageProviderName: 'test',
  }));

const getPartiallySavedRecentProjectFiles = (count: number) =>
  new Array<number>(count).fill(0).map((_, index) => ({
    fileMetadata: {
      fileIdentifier: `Users/Gdevelop/project ${index}`,
      lastModifiedDate:
        index % 3 === 0
          ? Math.floor(Math.random() * 1656942410477) + 1
          : undefined,
    },
    storageProviderName: 'test',
  }));

const WrappedCreateSection = ({
  project,
  recentProjectFiles,
  // $FlowFixMe[incompatible-type]
  tutorialProgress = undefined,
  inAppTutorialsFetchingError = null,
  user,
  games = [],
}: {|
  project: ?gdProject,
  recentProjectFiles: Array<FileMetadataAndStorageProviderName>,
  tutorialProgress?: InAppTutorialUserProgress,
  inAppTutorialsFetchingError?: string | null,
  user: AuthenticatedUser,
  games?: ?Array<Game>,
|}): React.Node => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  // Adapt height for storybook to see the bottom menu on mobile.
  const fixedHeight = isMobile ? (isLandscape ? 400 : 850) : 1080;
  return (
    <I18n>
      {({ i18n }) => (
        <FixedHeightFlexContainer height={fixedHeight}>
          <PreferencesContext.Provider
            // $FlowFixMe[incompatible-type]
            value={{
              ...initialPreferences,
              getRecentProjectFiles: () => recentProjectFiles,
              getTutorialProgress: () => tutorialProgress,
            }}
          >
            <AuthenticatedUserContext.Provider value={user}>
              <ExampleStoreStateProvider>
                <TutorialStateProvider>
                  <CreateSection
                    project={project}
                    currentFileMetadata={null}
                    onOpenProject={() => action('onOpenProject')()}
                    storageProviders={[CloudStorageProvider]}
                    storageProvider={CloudStorageProvider}
                    resourceManagementProps={fakeResourceManagementProps}
                    onCreateEmptyProject={action('onCreateEmptyProject')}
                    onOpenLayout={() => action('onOpenLayout')()}
                    onWillInstallExtension={action(
                      'extension will be installed'
                    )}
                    onExtensionInstalled={action('onExtensionInstalled')}
                    onCloseAskAi={() => action('onCloseAskAi')()}
                    closeProject={async () => {}}
                    canOpen={true}
                    onOpenProfile={() => action('open profile')()}
                    askToCloseProject={async () => true}
                    onCreateProjectFromExample={action(
                      'onCreateProjectFromExample'
                    )}
                    onSelectPrivateGameTemplateListingData={() =>
                      action('onSelectPrivateGameTemplateListingData')()
                    }
                    onSelectExampleShortHeader={() =>
                      action('onSelectExampleShortHeader')()
                    }
                    i18n={i18n}
                    games={games}
                    onRefreshGames={() => Promise.resolve()}
                    onGameUpdated={() => {}}
                    gamesFetchingError={null}
                    openedGame={null}
                    setOpenedGameId={() => {}}
                    currentTab="details"
                    setCurrentTab={() => {}}
                    onOpenNewProjectSetupDialog={() =>
                      action('onOpenNewProjectSetupDialog')()
                    }
                    onChooseProject={() => action('onChooseProject')()}
                    onSaveProject={() => action('onSaveProject')()}
                    canSaveProject={true}
                  />
                </TutorialStateProvider>
              </ExampleStoreStateProvider>
            </AuthenticatedUserContext.Provider>
          </PreferencesContext.Provider>
        </FixedHeightFlexContainer>
      )}
    </I18n>
  );
};

export default {
  title: 'HomePage/CreateSection',
  component: WrappedCreateSection,
  decorators: [GDevelopJsInitializerDecorator, inAppTutorialDecorator],
};

export const CreateSectionLoading = (): React.Node => (
  <WrappedCreateSection
    project={null}
    // $FlowFixMe[incompatible-type]
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeAuthenticatedUserLoggingIn}
    games={null}
  />
);
export const NoProjectOpened = (): React.Node => (
  <WrappedCreateSection
    project={null}
    // $FlowFixMe[incompatible-type]
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeSilverAuthenticatedUser}
  />
);
export const ProjectOpened = (): React.Node => (
  <WrappedCreateSection
    project={testProject.project}
    // $FlowFixMe[incompatible-type]
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeSilverAuthenticatedUser}
  />
);
export const NoRecentFiles = (): React.Node => (
  <WrappedCreateSection
    project={testProject.project}
    recentProjectFiles={[]}
    user={fakeSilverAuthenticatedUser}
  />
);
export const LotOfRecentFiles = (): React.Node => (
  <WrappedCreateSection
    project={testProject.project}
    // $FlowFixMe[incompatible-type]
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
  />
);
export const SomeRecentFilesNotSavedYet = (): React.Node => (
  <WrappedCreateSection
    project={testProject.project}
    // $FlowFixMe[incompatible-type]
    recentProjectFiles={getPartiallySavedRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
  />
);
