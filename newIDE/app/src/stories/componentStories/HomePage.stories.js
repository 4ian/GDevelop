// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../ThemeDecorator';
import { HomePage } from '../../MainFrame/EditorContainers/HomePage';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import { ExampleStoreStateProvider } from '../../AssetStore/ExampleStore/ExampleStoreContext';
import { TutorialStateProvider } from '../../Tutorial/TutorialContext';
import PreferencesContext, {
  initialPreferences,
} from '../../MainFrame/Preferences/PreferencesContext';
import { type FileMetadataAndStorageProviderName } from '../../ProjectsStorage';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import AuthenticatedUserContext, {
  initialAuthenticatedUser,
  type AuthenticatedUser,
} from '../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../ProjectsStorage/CloudStorageProvider';
import {
  fakeIndieAuthenticatedUser,
  fakeAuthenticatedButLoadingAuthenticatedUser,
  indieUserProfile,
} from '../../fixtures/GDevelopServicesTestData';
import { GDevelopAssetApi } from '../../Utils/GDevelopServices/ApiConfigs';
import withMock from 'storybook-addon-mock';

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
  user,
}: {|
  project: ?gdProject,
  recentProjectFiles: FileMetadataAndStorageProviderName[],
  user: AuthenticatedUser,
|}) => (
  <FixedHeightFlexContainer height={1080}>
    <PreferencesContext.Provider
      value={{
        ...initialPreferences,
        getRecentProjectFiles: () => recentProjectFiles,
      }}
    >
      <AuthenticatedUserContext.Provider value={user}>
        <ExampleStoreStateProvider>
          <TutorialStateProvider>
            <HomePage
              project={project}
              isActive={true}
              projectItemName={null}
              setToolbar={() => {}}
              canOpen={true}
              storageProviders={[CloudStorageProvider]}
              onChooseProject={() => action('onChooseProject')()}
              onOpenRecentFile={() => action('onOpenRecentFile')()}
              onCreateProject={() => action('onCreateProject')()}
              onOpenProjectManager={() => action('onOpenProjectManager')()}
              onOpenHelpFinder={() => action('onOpenHelpFinder')()}
              onOpenLanguageDialog={() => action('open language dialog')()}
              onOpenOnboardingDialog={() => action('open onboarding dialog')()}
              onOpenNewProjectSetupDialog={() =>
                action('onOpenNewProjectSetupDialog')()
              }
              onOpenProfile={() => action('open profile')()}
              onOpenPreferences={() => action('open preferences')()}
              onOpenAbout={() => action('open about')()}
            />
          </TutorialStateProvider>
        </ExampleStoreStateProvider>
      </AuthenticatedUserContext.Provider>
    </PreferencesContext.Provider>
  </FixedHeightFlexContainer>
);

export default {
  title: 'HomePage',
  component: WrappedHomePage,
  decorators: [muiDecorator, GDevelopJsInitializerDecorator],
};

export const BuildSectionLoading = () => (
  <WrappedHomePage
    project={null}
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeAuthenticatedButLoadingAuthenticatedUser}
  />
);
export const NoProjectOpened = () => (
  <WrappedHomePage
    project={null}
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeIndieAuthenticatedUser}
  />
);
export const ProjectOpened = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(5)}
    user={fakeIndieAuthenticatedUser}
  />
);
export const NoRecentFiles = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={[]}
    user={fakeIndieAuthenticatedUser}
  />
);
export const LotOfRecentFiles = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeIndieAuthenticatedUser}
  />
);
export const SomeRecentFilesNotSavedYet = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getPartiallySavedRecentProjectFiles(20)}
    user={fakeIndieAuthenticatedUser}
  />
);

export const Connected = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeIndieAuthenticatedUser}
  />
);

export const ConnectedWithLongName = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={{
      ...fakeIndieAuthenticatedUser,
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

export const NetworkError = () => (
  <WrappedHomePage
    project={testProject.project}
    recentProjectFiles={getRecentProjectFiles(20)}
    user={fakeIndieAuthenticatedUser}
  />
);
NetworkError.decorators = [withMock];
NetworkError.parameters = apiDataServerSideError;
