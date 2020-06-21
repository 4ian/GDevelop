// @flow
import { type I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { useCommand } from '../CommandPalette/CommandHooks';

type CommandHandlers = {
  i18n: I18n,
  project: ?gdProject,
  previewEnabled: boolean,
  onOpenProjectManager: () => void,
  onLaunchPreview: () => void | Promise<void>,
  onLaunchDebugPreview: () => void,
  onOpenStartPage: () => void,
  onCreateProject: () => void,
  onOpenProject: () => void,
  onSaveProject: () => void,
  onSaveProjectAs: () => void,
  onCloseApp: () => void,
  onCloseProject: () => Promise<void>,
  onExportGame: () => void,
};

const useMainFrameCommands = (handlers: CommandHandlers) => {
  useCommand('QUIT_APP', {
    displayText: t`Close GDevelop`,
    enabled: true,
    handler: handlers.onCloseApp,
  });

  useCommand('OPEN_PROJECT_MANAGER', {
    displayText: t`Open project manager`,
    enabled: !!handlers.project,
    handler: handlers.onOpenProjectManager,
  });

  useCommand('LAUNCH_PREVIEW', {
    displayText: t`Launch preview`,
    enabled: handlers.previewEnabled,
    handler: handlers.onLaunchPreview,
  });

  useCommand('LAUNCH_DEBUG_PREVIEW', {
    displayText: t`Launch preview with debugger and profiler`,
    enabled: handlers.previewEnabled,
    handler: handlers.onLaunchDebugPreview,
  });

  useCommand('OPEN_START_PAGE', {
    displayText: t`Open start page`,
    enabled: true,
    handler: handlers.onOpenStartPage,
  });

  useCommand('CREATE_NEW_PROJECT', {
    displayText: t`Create a new project`,
    enabled: true,
    handler: handlers.onCreateProject,
  });

  useCommand('OPEN_PROJECT', {
    displayText: t`Open a project`,
    enabled: true,
    handler: handlers.onOpenProject,
  });

  useCommand('SAVE_PROJECT', {
    displayText: t`Save project`,
    enabled: !!handlers.project,
    handler: handlers.onSaveProject,
  });

  useCommand('SAVE_PROJECT_AS', {
    displayText: t`Save project as...`,
    enabled: !!handlers.project,
    handler: handlers.onSaveProjectAs,
  });

  useCommand('CLOSE_PROJECT', {
    displayText: t`Close the current project`,
    enabled: !!handlers.project,
    handler: handlers.onCloseProject,
  });

  useCommand('EXPORT_GAME', {
    displayText: t`Export game`,
    enabled: !!handlers.project,
    handler: handlers.onExportGame,
  });
};

export default useMainFrameCommands;
