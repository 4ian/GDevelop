// @flow
import * as React from 'react';
import { type I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import {
  useCommand,
  useCommandWithOptions,
} from '../CommandPalette/CommandHooks';
import {
  enumerateLayouts,
  enumerateExternalEvents,
  enumerateExternalLayouts,
  enumerateEventsFunctionsExtensions,
} from '../ProjectManager/EnumerateProjectItems';

type Item =
  | gdLayout
  | gdExternalEvents
  | gdExternalLayout
  | gdEventsFunctionsExtension;

/**
 * Helper function to generate options list
 * for each kind of project item
 */
const generateProjectItemOptions = <T: Item>(
  project: ?gdProject,
  enumerate: (project: gdProject) => Array<T>,
  onOpen: string => void
) => {
  if (!project) return [];
  return enumerate(project).map(item => ({
    text: item.getName(),
    handler: () => onOpen(item.getName()),
  }));
};

type CommandHandlers = {|
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
  onOpenLayout: string => void,
  onOpenExternalEvents: string => void,
  onOpenExternalLayout: string => void,
  onOpenEventsFunctionsExtension: string => void,
|};

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
const openLayoutCommandText = t`Open scene...`;
const openExternalEventsCommandText = t`Open external events...`;
const openExternalLayoutCommandText = t`Open external layout...`;
const openEventsFunctionsExtensionCommandText = t`Open extension...`;

const useMainFrameCommands = (handlers: CommandHandlers) => {
  useCommand('QUIT_APP', true, {
    displayText: quitAppText,
    handler: handlers.onCloseApp,
  });

  useCommand('OPEN_PROJECT_MANAGER', !!handlers.project, {
    displayText: openProjectManagerText,
    handler: handlers.onOpenProjectManager,
  });

  useCommand('LAUNCH_PREVIEW', handlers.previewEnabled, {
    displayText: launchPreviewText,
    handler: handlers.onLaunchPreview,
  });

  useCommand('LAUNCH_DEBUG_PREVIEW', handlers.previewEnabled, {
    displayText: launchDebugPreviewText,
    handler: handlers.onLaunchDebugPreview,
  });

  useCommand('OPEN_START_PAGE', true, {
    displayText: openStartPageText,
    handler: handlers.onOpenStartPage,
  });

  useCommand('CREATE_NEW_PROJECT', true, {
    displayText: createNewProjectText,
    handler: handlers.onCreateProject,
  });

  useCommand('OPEN_PROJECT', true, {
    displayText: openProjectText,
    handler: handlers.onOpenProject,
  });

  useCommand('SAVE_PROJECT', !!handlers.project, {
    displayText: saveProjectText,
    handler: handlers.onSaveProject,
  });

  useCommand('SAVE_PROJECT_AS', !!handlers.project, {
    displayText: saveProjectAsText,
    handler: handlers.onSaveProjectAs,
  });

  useCommand('CLOSE_PROJECT', !!handlers.project, {
    displayText: closeProjectText,
    handler: handlers.onCloseProject,
  });

  useCommand('EXPORT_GAME', !!handlers.project, {
    displayText: exportGameText,
    handler: handlers.onExportGame,
  });

  useCommandWithOptions('OPEN_LAYOUT', !!handlers.project, {
    displayText: openLayoutCommandText,
    generateOptions: React.useCallback(
      () =>
        generateProjectItemOptions(
          handlers.project,
          enumerateLayouts,
          handlers.onOpenLayout
        ),
      [handlers.project, handlers.onOpenLayout]
    ),
  });

  useCommandWithOptions('OPEN_EXTERNAL_EVENTS', !!handlers.project, {
    displayText: openExternalEventsCommandText,
    generateOptions: React.useCallback(
      () =>
        generateProjectItemOptions(
          handlers.project,
          enumerateExternalEvents,
          handlers.onOpenExternalEvents
        ),
      [handlers.project, handlers.onOpenExternalEvents]
    ),
  });

  useCommandWithOptions('OPEN_EXTERNAL_LAYOUT', !!handlers.project, {
    displayText: openExternalLayoutCommandText,
    generateOptions: React.useCallback(
      () =>
        generateProjectItemOptions(
          handlers.project,
          enumerateExternalLayouts,
          handlers.onOpenExternalLayout
        ),
      [handlers.project, handlers.onOpenExternalLayout]
    ),
  });

  useCommandWithOptions('OPEN_EXTENSION', !!handlers.project, {
    displayText: openEventsFunctionsExtensionCommandText,
    generateOptions: React.useCallback(
      () =>
        generateProjectItemOptions(
          handlers.project,
          enumerateEventsFunctionsExtensions,
          handlers.onOpenEventsFunctionsExtension
        ),
      [handlers.project, handlers.onOpenEventsFunctionsExtension]
    ),
  });
};

export default useMainFrameCommands;
