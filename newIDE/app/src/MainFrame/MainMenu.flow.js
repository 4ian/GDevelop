// @flow
import { type I18n as I18nType } from '@lingui/core';
import { type UpdateStatus } from './UpdaterTools';

export type MainMenuProps = {|
  i18n: I18nType,
  project: ?gdProject,
  onChooseProject: () => void,
  onSaveProject: () => void,
  onSaveProjectAs: () => void,
  onCloseProject: () => Promise<void>,
  onCloseApp: () => void,
  onExportProject: (open?: boolean) => void,
  onCreateProject: (open?: boolean) => void,
  onOpenProjectManager: (open?: boolean) => void,
  onOpenStartPage: () => void,
  onOpenDebugger: () => void,
  onOpenAbout: (open?: boolean) => void,
  onOpenPreferences: (open?: boolean) => void,
  onOpenLanguage: (open?: boolean) => void,
  onOpenProfile: (open?: boolean) => void,
  setUpdateStatus: UpdateStatus => void,
|};
