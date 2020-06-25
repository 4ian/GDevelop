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

const quitAppText = t`Close GDevelop`;
const openProjectManagerText = t`Open project manager`;
const launchPreviewText = t`Launch preview`;
const launchDebugPreviewText = t`Launch preview with debugger and profiler`;
const openStartPageText = t`Open start page`;
const createNewProjectText = t`Create a new project`;
const openProjectText = t`Open project`;
const saveProjectText = t`Save project`;
const saveProjectAsText = t`Save project as...`;
const closeProjectText = t`Close project`;
const exportGameText = t`Export game`;

const useMainFrameCommands = (handlers: CommandHandlers) => {
  useCommand('QUIT_APP', {
    displayText: quitAppText,
    enabled: true,
    handler: handlers.onCloseApp,
  });

  useCommand('OPEN_PROJECT_MANAGER', {
    displayText: openProjectManagerText,
    enabled: !!handlers.project,
    handler: handlers.onOpenProjectManager,
  });

  useCommand('LAUNCH_PREVIEW', {
    displayText: launchPreviewText,
    enabled: handlers.previewEnabled,
    handler: handlers.onLaunchPreview,
  });

  useCommand('LAUNCH_DEBUG_PREVIEW', {
    displayText: launchDebugPreviewText,
    enabled: handlers.previewEnabled,
    handler: handlers.onLaunchDebugPreview,
  });

  useCommand('OPEN_START_PAGE', {
    displayText: openStartPageText,
    enabled: true,
    handler: handlers.onOpenStartPage,
  });

  useCommand('CREATE_NEW_PROJECT', {
    displayText: createNewProjectText,
    enabled: true,
    handler: handlers.onCreateProject,
  });

  useCommand('OPEN_PROJECT', {
    displayText: openProjectText,
    enabled: true,
    handler: handlers.onOpenProject,
  });

  useCommand('SAVE_PROJECT', {
    displayText: saveProjectText,
    enabled: !!handlers.project,
    handler: handlers.onSaveProject,
  });

  useCommand('SAVE_PROJECT_AS', {
    displayText: saveProjectAsText,
    enabled: !!handlers.project,
    handler: handlers.onSaveProjectAs,
  });

  useCommand('CLOSE_PROJECT', {
    displayText: closeProjectText,
    enabled: !!handlers.project,
    handler: handlers.onCloseProject,
  });

  useCommand('EXPORT_GAME', {
    displayText: exportGameText,
    enabled: !!handlers.project,
    handler: handlers.onExportGame,
  });
};

export default useMainFrameCommands;
