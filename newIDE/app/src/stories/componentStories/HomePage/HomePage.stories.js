// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
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
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import { fakeSilverAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import inAppTutorialDecorator from '../../InAppTutorialDecorator';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import { client as tutorialClient } from '../../../Utils/GDevelopServices/Tutorial';
import { client as assetClient } from '../../../Utils/GDevelopServices/Asset';

const WrappedHomePage = ({
  project,
  tutorialProgress = undefined,
  inAppTutorialsFetchingError = null,
  user,
}: {|
  project: ?gdProject,
  tutorialProgress?: InAppTutorialUserProgress,
  inAppTutorialsFetchingError?: string | null,
  user: AuthenticatedUser,
|}) => {
  const assetApiMock = React.useMemo(() => {
    const mock = new MockAdapter(assetClient, {
      delayResponse: 250,
    });

    mock.onGet('/course').reply(200, []);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        assetApiMock.restore();
      };
    },
    [assetApiMock]
  );

  const { isMobile, isLandscape } = useResponsiveWindowSize();
  // Adapt height for storybook to see the bottom menu on mobile.
  const fixedHeight = isMobile ? (isLandscape ? 400 : 850) : 1080;
  return (
    <FixedHeightFlexContainer height={fixedHeight}>
      <PreferencesContext.Provider
        value={{
          ...initialPreferences,
          getTutorialProgress: () => tutorialProgress,
        }}
      >
        <AuthenticatedUserContext.Provider value={user}>
          <ExampleStoreStateProvider>
            <TutorialStateProvider>
              <HomePage
                gameEditorMode="instances-editor"
                project={project}
                fileMetadata={null}
                isActive={true}
                projectItemName={null}
                setToolbar={() => {}}
                setGamesPlatformFrameShown={() => {}}
                canOpen={true}
                storageProviders={[CloudStorageProvider]}
                onChooseProject={() => action('onChooseProject')()}
                onOpenRecentFile={() => action('onOpenRecentFile')()}
                onSelectExampleShortHeader={() =>
                  action('onSelectExampleShortHeader')()
                }
                onSelectPrivateGameTemplateListingData={() =>
                  action('onSelectPrivateGameTemplateListingData')()
                }
                onOpenPrivateGameTemplateListingData={() =>
                  action('onOpenPrivateGameTemplateListingData')()
                }
                onOpenVersionHistory={() => action('onOpenVersionHistory')()}
                onOpenLanguageDialog={() => action('open language dialog')()}
                onOpenNewProjectSetupDialog={() =>
                  action('onOpenNewProjectSetupDialog')()
                }
                onOpenTemplateFromTutorial={() =>
                  action('onOpenTemplateFromTutorial')()
                }
                onOpenTemplateFromCourseChapter={() =>
                  action('onOpenTemplateFromCourseChapter')()
                }
                canSave={true}
                onSave={() => action('onSave')()}
                selectInAppTutorial={() => action('select in app tutorial')()}
                onOpenProfile={() => action('open profile')()}
                onOpenPreferences={() => action('open preferences')()}
                onOpenAbout={() => action('open about')()}
                resourceManagementProps={fakeResourceManagementProps}
                onCreateProjectFromExample={action(
                  'onCreateProjectFromExample'
                )}
                onCreateEmptyProject={action('onCreateEmptyProject')}
                onOpenLayout={() => action('onOpenLayout')()}
                storageProvider={CloudStorageProvider}
                askToCloseProject={async () => true}
                closeProject={async () => {}}
                gamesList={{
                  games: null,
                  fetchGames: async () => {},
                  gamesFetchingError: null,
                  onGameUpdated: () => {},
                  markGameAsSavedIfRelevant: async () => {},
                }}
                gamesPlatformFrameTools={{
                  startTimeoutToUnloadIframe: () => {},
                  loadIframeOrRemoveTimeout: () => {},
                  iframeLoaded: false,
                  iframeVisible: false,
                  iframeErrored: false,
                  updateIframePosition: () => {},
                  renderGamesPlatformFrame: () => null,
                }}
                onWillInstallExtension={action('extension will be installed')}
                onExtensionInstalled={action('onExtensionInstalled')}
                onOpenAskAi={() => action('onOpenAskAi')()}
                onCloseAskAi={() => action('onCloseAskAi')()}
              />
            </TutorialStateProvider>
          </ExampleStoreStateProvider>
        </AuthenticatedUserContext.Provider>
      </PreferencesContext.Provider>
    </FixedHeightFlexContainer>
  );
};

export default {
  title: 'HomePage',
  component: WrappedHomePage,
  decorators: [GDevelopJsInitializerDecorator, inAppTutorialDecorator],
};

export const Connected = () => (
  <WrappedHomePage
    project={testProject.project}
    user={fakeSilverAuthenticatedUser}
  />
);

export const ConnectedWithInAppTutorialCompleted = () => (
  <WrappedHomePage
    project={testProject.project}
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

export const NetworkError = () => {
  const tutorialApiMock = React.useMemo(() => {
    const mock = new MockAdapter(tutorialClient, {
      delayResponse: 250,
    });

    mock.onGet('/tutorial').reply(500, { data: 'status' });

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        tutorialApiMock.restore();
      };
    },
    [tutorialApiMock]
  );

  return (
    <WrappedHomePage
      project={testProject.project}
      user={fakeSilverAuthenticatedUser}
    />
  );
};
