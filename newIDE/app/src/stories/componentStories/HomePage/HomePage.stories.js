// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { HomePage } from '../../../MainFrame/EditorContainers/HomePage';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../GDevelopJsInitializerDecorator';
import { ExampleStoreStateProvider } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import { TutorialStateProvider } from '../../../Tutorial/TutorialContext';
import PreferencesContext, {
  initialPreferences,
  type InAppTutorialUserProgress,
} from '../../../MainFrame/Preferences/PreferencesContext';
import { type FileMetadataAndStorageProviderName } from '../../../ProjectsStorage';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import AuthenticatedUserContext, {
  initialAuthenticatedUser,
  type AuthenticatedUser,
} from '../../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import {
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserLoggingIn,
  indieUserProfile,
} from '../../../fixtures/GDevelopServicesTestData';
import { GDevelopAssetApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import InAppTutorialContext from '../../../InAppTutorial/InAppTutorialContext';
import fakeResourceManagementProps from '../../FakeResourceManagement';

const apiDataServerSideError = {
  mockData: [
    {
      url: `${GDevelopAssetApi.baseUrl}/tutorial`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
  ],
};

const getRecentProjectFiles = (count: number) =>
  new Array(count).fill(0).map((_, index) => ({
    fileMetadata: {
      fileIdentifier: `Users/me/Desktop/Gdevelop/project ${index}`,
      lastModifiedDate: Math.floor(Math.random() * 1656942410477) + 1,
    },
    storageProviderName: 'test',
  }));

const getPartiallySavedRecentProjectFiles = (count: number) =>
  new Array(count).fill(0).map((_, index) => ({
    fileMetadata: {
      fileIdentifier: `Users/Gdevelop/project ${index}`,
      lastModifiedDate:
        index % 3 === 0
          ? Math.floor(Math.random() * 1656942410477) + 1
          : undefined,
    },
    storageProviderName: 'test',
  }));

const WrappedHomePage = ({
  project,
  recentProjectFiles,
  tutorialProgress = undefined,
  inAppTutorialsFetchingError = null,
  user,
}: {|
  project: ?gdProject,
  recentProjectFiles: FileMetadataAndStorageProviderName[],
  tutorialProgress?: InAppTutorialUserProgress,
  inAppTutorialsFetchingError?: string | null,
  user: AuthenticatedUser,
|}) => (
  <FixedHeightFlexContainer height={1080}>
    <PreferencesContext.Provider
      value={{
        ...initialPreferences,
        getRecentProjectFiles: () => recentProjectFiles,
        getTutorialProgress: () => tutorialProgress,
      }}
    >
      <InAppTutorialContext.Provider
        value={{
          inAppTutorialShortHeaders: [
            {
              id: 'flingGame',
              contentUrl: 'fakeUrl',
              availableLocales: ['en', 'fr-FR'],
            },
          ],
          getInAppTutorialShortHeader: (tutorialId: string) => ({
            id: 'flingGame',
            contentUrl: 'fakeUrl',
            availableLocales: ['en', 'fr-FR'],
          }),
          currentlyRunningInAppTutorial: null,
          startTutorial: async () => {
            action('start tutorial');
          },
          startProjectData: {},
          endTutorial: () => {
            action('end tutorial');
          },
          startStepIndex: 0,
          inAppTutorialsFetchingError,
          fetchInAppTutorials: async () => {
            action('fetch tutorials')();
          },
        }}
      >
        <AuthenticatedUserContext.Provider value={user}>
          <ExampleStoreStateProvider>
            <TutorialStateProvider>
              <HomePage
                project={project}
                fileMetadata={null}
                isActive={true}
                projectItemName={null}
                setToolbar={() => {}}
                canOpen={true}
                storageProviders={[CloudStorageProvider]}
                onChooseProject={() => action('onChooseProject')()}
                onOpenRecentFile={() => action('onOpenRecentFile')()}
                onOpenExampleStore={() => action('onOpenExampleStore')()}
                onSelectExampleShortHeader={() =>
                  action('onSelectExampleShortHeader')()
                }
                onPreviewPrivateGameTemplateListingData={() =>
                  action('onPreviewPrivateGameTemplateListingData')()
                }
                onOpenPrivateGameTemplateListingData={() =>
                  action('onOpenPrivateGameTemplateListingData')()
                }
                onOpenProjectManager={() => action('onOpenProjectManager')()}
                onOpenLanguageDialog={() => action('open language dialog')()}
                onOpenNewProjectSetupDialog={() =>
                  action('onOpenNewProjectSetupDialog')()
                }
                canSave={true}
                onSave={() => action('onSave')()}
                selectInAppTutorial={() => action('select in app tutorial')()}
                onOpenProfile={() => action('open profile')()}
                onOpenPreferences={() => action('open preferences')()}
                onOpenAbout={() => action('open about')()}
                resourceManagementProps={fakeResourceManagementProps}
                canInstallPrivateAsset={() => true}
              />
            </TutorialStateProvider>
          </ExampleStoreStateProvider>
        </AuthenticatedUserContext.Provider>
      </InAppTutorialContext.Provider>
    </PreferencesContext.Provider>
  </FixedHeightFlexContainer>
);

export default {
  title: 'HomePage',
  component: WrappedHomePage,
  decorators: [GDevelopJsInitializerDecorator],
};

export const BuildSectionLoading = () => (
  <WrappedHomePage
    project={null}
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeAuthenticatedUserLoggingIn}
  />
);
export const NoProjectOpened = () => (
  <WrappedHomePage
    project={null}
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeSilverAuthenticatedUser}
  />
);
export const ProjectOpened = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeSilverAuthenticatedUser}
  />
);
export const NoRecentFiles = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={[]}
    user={fakeSilverAuthenticatedUser}
  />
);
export const LotOfRecentFiles = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
  />
);
export const SomeRecentFilesNotSavedYet = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getPartiallySavedRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
  />
);

export const Connected = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
  />
);

export const ConnectedWithLongName = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={{
      ...fakeSilverAuthenticatedUser,
      profile: {
        ...indieUserProfile,
        username: 'This is a very long username that should be truncated',
      },
    }}
  />
);

export const NotConnected = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={initialAuthenticatedUser}
  />
);

export const ConnectedWithInAppTutorialProgress = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
    tutorialProgress={{
      step: 40,
      progress: [100, 25, 0],
      fileMetadataAndStorageProviderName: {
        storageProviderName: 'fakeStorageProviderName',
        fileMetadata: { fileIdentifier: 'fileIdentifier' },
      },
      projectData: {},
    }}
  />
);
export const ConnectedWithInAppTutorialLoadingError = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
    tutorialProgress={undefined}
    inAppTutorialsFetchingError="fetching-error"
  />
);

export const ConnectedWithInAppTutorialCompleted = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
    tutorialProgress={{
      step: 40,
      progress: [100, 100, 100],
      fileMetadataAndStorageProviderName: {
        storageProviderName: 'fakeStorageProviderName',
        fileMetadata: { fileIdentifier: 'fileIdentifier' },
      },
      projectData: {},
    }}
  />
);

export const NetworkError = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeSilverAuthenticatedUser}
  />
);
NetworkError.parameters = apiDataServerSideError;
