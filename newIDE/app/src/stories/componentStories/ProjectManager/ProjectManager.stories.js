// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../PaperDecorator';
import { action } from '@storybook/addon-actions';
import ProjectManager from '../../../ProjectManager';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../GDevelopJsInitializerDecorator';
import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';
import { UnsavedChangesContextProvider } from '../../../MainFrame/UnsavedChangesContext';
import { useShortcutMap } from '../../../KeyboardShortcuts';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'Project Creation/ProjectManager',
  component: ProjectManager,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};

const mainMenuCallbacks = {
  onChooseProject: () => action('onChooseProject'),
  onOpenRecentFile: () => action('onOpenRecentFile'),
  onSaveProject: () => action('onSaveProject'),
  onSaveProjectAs: () => action('onSaveProjectAs'),
  onShowVersionHistory: () => action('onShowVersionHistory'),
  onCloseProject: () => action('onCloseProject'),
  onCloseApp: () => action('onCloseApp'),
  onExportProject: () => action('onExportProject'),
  onInviteCollaborators: () => action('onInviteCollaborators'),
  onCreateProject: () => action('onCreateProject'),
  onOpenProjectManager: () => action('onOpenProjectManager'),
  onOpenHomePage: () => action('onOpenHomePage'),
  onOpenDebugger: () => action('onOpenDebugger'),
  onOpenAbout: () => action('onOpenAbout'),
  onOpenPreferences: () => action('onOpenPreferences'),
  onOpenLanguage: () => action('onOpenLanguage'),
  onOpenProfile: () => action('onOpenProfile'),
  setElectronUpdateStatus: () => action('setElectronUpdateStatus'),
};

export const NoProjectOpen = () => {
  const shortcutMap = useShortcutMap();
  return (
    <I18n>
      {({ i18n }) => (
        <UnsavedChangesContextProvider>
          <DragAndDropContextProvider>
            <FixedHeightFlexContainer height={1000}>
              <FixedWidthFlexContainer width={320}>
                <ProjectManager
                  project={null}
                  onSaveProjectProperties={async () => true}
                  onChangeProjectName={action('onChangeProjectName')}
                  onOpenExternalEvents={action('onOpenExternalEvents')}
                  onOpenLayout={action('onOpenLayout')}
                  onOpenExternalLayout={action('onOpenExternalLayout')}
                  onOpenEventsFunctionsExtension={action(
                    'onOpenEventsFunctionsExtension'
                  )}
                  onInstallExtension={action('onInstallExtension')}
                  onDeleteLayout={action('onDeleteLayout')}
                  onDeleteExternalLayout={action('onDeleteExternalLayout')}
                  onDeleteEventsFunctionsExtension={action(
                    'onDeleteEventsFunctionsExtension'
                  )}
                  onDeleteExternalEvents={action('onDeleteExternalEvents')}
                  onRenameLayout={action('onRenameLayout')}
                  onRenameExternalLayout={action('onRenameExternalLayout')}
                  onRenameEventsFunctionsExtension={action(
                    'onRenameEventsFunctionsExtension'
                  )}
                  onRenameExternalEvents={action('onRenameExternalEvents')}
                  onOpenResources={action('onOpenResources')}
                  onReloadEventsFunctionsExtensions={action(
                    'onReloadEventsFunctionsExtensions'
                  )}
                  onShareProject={action('onShareProject')}
                  isOpen
                  hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
                  resourceManagementProps={fakeResourceManagementProps}
                  gamesList={{
                    games: null,
                    fetchGames: async () => {},
                    gamesFetchingError: null,
                    onGameUpdated: () => {},
                    markGameAsSavedIfRelevant: async () => {},
                  }}
                  onOpenHomePage={action('openHomepage')}
                  toggleProjectManager={action('toggleProjectManager')}
                  buildMainMenuProps={{
                    i18n,
                    project: testProject.project,
                    canSaveProjectAs: true,
                    recentProjectFiles: [],
                    shortcutMap,
                    isApplicationTopLevelMenu: false,
                  }}
                  mainMenuCallbacks={mainMenuCallbacks}
                />
              </FixedWidthFlexContainer>
            </FixedHeightFlexContainer>
          </DragAndDropContextProvider>
        </UnsavedChangesContextProvider>
      )}
    </I18n>
  );
};

export const ProjectOpen = () => {
  const shortcutMap = useShortcutMap();
  return (
    <I18n>
      {({ i18n }) => (
        <UnsavedChangesContextProvider>
          <DragAndDropContextProvider>
            <FixedHeightFlexContainer height={1000}>
              <FixedWidthFlexContainer width={320}>
                <ProjectManager
                  project={testProject.project}
                  onSaveProjectProperties={async () => true}
                  onChangeProjectName={action('onChangeProjectName')}
                  onOpenExternalEvents={action('onOpenExternalEvents')}
                  onOpenLayout={action('onOpenLayout')}
                  onOpenExternalLayout={action('onOpenExternalLayout')}
                  onOpenEventsFunctionsExtension={action(
                    'onOpenEventsFunctionsExtension'
                  )}
                  onInstallExtension={action('onInstallExtension')}
                  onDeleteLayout={action('onDeleteLayout')}
                  onDeleteExternalLayout={action('onDeleteExternalLayout')}
                  onDeleteEventsFunctionsExtension={action(
                    'onDeleteEventsFunctionsExtension'
                  )}
                  onDeleteExternalEvents={action('onDeleteExternalEvents')}
                  onRenameLayout={action('onRenameLayout')}
                  onRenameExternalLayout={action('onRenameExternalLayout')}
                  onRenameEventsFunctionsExtension={action(
                    'onRenameEventsFunctionsExtension'
                  )}
                  onRenameExternalEvents={action('onRenameExternalEvents')}
                  onOpenResources={action('onOpenResources')}
                  onReloadEventsFunctionsExtensions={action(
                    'onReloadEventsFunctionsExtensions'
                  )}
                  onShareProject={action('onShareProject')}
                  isOpen
                  hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
                  resourceManagementProps={fakeResourceManagementProps}
                  gamesList={{
                    games: null,
                    fetchGames: async () => {},
                    gamesFetchingError: null,
                    onGameUpdated: () => {},
                    markGameAsSavedIfRelevant: async () => {},
                  }}
                  onOpenHomePage={action('openHomepage')}
                  toggleProjectManager={action('toggleProjectManager')}
                  buildMainMenuProps={{
                    i18n,
                    project: testProject.project,
                    canSaveProjectAs: true,
                    recentProjectFiles: [],
                    shortcutMap,
                    isApplicationTopLevelMenu: false,
                  }}
                  mainMenuCallbacks={mainMenuCallbacks}
                />
              </FixedWidthFlexContainer>
            </FixedHeightFlexContainer>
          </DragAndDropContextProvider>
        </UnsavedChangesContextProvider>
      )}
    </I18n>
  );
};
