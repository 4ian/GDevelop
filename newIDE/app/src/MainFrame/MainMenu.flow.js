// @flow
import { type I18n as I18nType } from '@lingui/core';
import { type ElectronUpdateStatus } from './UpdaterTools';
import { type FileMetadataAndStorageProviderName } from '../ProjectsStorage';

export type MainMenuProps = {|
  i18n: I18nType,
  project: ?gdProject,
  onChooseProject: () => void,
  onOpenRecentFile: (
    fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName
  ) => void,
  onSaveProject: () => Promise<void>,
  onSaveProjectAs: () => void,
  onCloseProject: () => Promise<void>,
  onCloseApp: () => void,
  onExportProject: (open?: boolean) => void,
  onCreateProject: (open?: boolean) => void,
  onCreateBlank: () => void,
  onOpenProjectManager: (open?: boolean) => void,
  onOpenHomePage: () => void,
  onOpenDebugger: () => void,
  onOpenAbout: (open?: boolean) => void,
  onOpenPreferences: (open?: boolean) => void,
  onOpenLanguage: (open?: boolean) => void,
  onOpenProfile: (open?: boolean) => void,
  onOpenGamesDashboard: (open?: boolean) => void,
  setElectronUpdateStatus: ElectronUpdateStatus => void,
  recentProjectFiles: Array<FileMetadataAndStorageProviderName>,
|};
