// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';
import {
  enumerateLayouts,
  enumerateExternalEvents,
  enumerateExternalLayouts,
  enumerateEventsFunctionsExtensions,
} from './EnumerateProjectItems';

const openLayoutCommandText = t`Open scene...`;
const openExternalEventsCommandText = t`Open external events...`;
const openExternalLayoutCommandText = t`Open external layout...`;
const openEventsFunctionsExtensionCommandText = t`Open extension...`;

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
  project: gdProject,
  enumerate: (project: gdProject) => Array<T>,
  onOpen: string => void
) => {
  return enumerate(project).map(item => ({
    text: item.getName(),
    handler: () => onOpen(item.getName()),
    value: item,
  }));
};

type Props = {
  project: gdProject,
  onOpenLayout: string => void,
  onOpenExternalEvents: string => void,
  onOpenExternalLayout: string => void,
  onOpenEventsFunctionsExtension: string => void,
};

const UseProjectManagerCommands = (props: Props) => {
  const {
    project,
    onOpenLayout,
    onOpenExternalEvents,
    onOpenExternalLayout,
    onOpenEventsFunctionsExtension,
  } = props;

  useCommandWithOptions('OPEN_LAYOUT', {
    displayText: openLayoutCommandText,
    enabled: !!project,
    generateOptions: React.useCallback(
      () => generateProjectItemOptions(project, enumerateLayouts, onOpenLayout),
      [project, onOpenLayout]
    ),
  });

  useCommandWithOptions('OPEN_EXTERNAL_EVENTS', {
    displayText: openExternalEventsCommandText,
    enabled: !!project,
    generateOptions: React.useCallback(
      () =>
        generateProjectItemOptions(
          project,
          enumerateExternalEvents,
          onOpenExternalEvents
        ),
      [project, onOpenExternalEvents]
    ),
  });

  useCommandWithOptions('OPEN_EXTERNAL_LAYOUT', {
    displayText: openExternalLayoutCommandText,
    enabled: !!project,
    generateOptions: React.useCallback(
      () =>
        generateProjectItemOptions(
          project,
          enumerateExternalLayouts,
          onOpenExternalLayout
        ),
      [project, onOpenExternalLayout]
    ),
  });

  useCommandWithOptions('OPEN_EXTENSION', {
    displayText: openEventsFunctionsExtensionCommandText,
    enabled: !!project,
    generateOptions: React.useCallback(
      () =>
        generateProjectItemOptions(
          project,
          enumerateEventsFunctionsExtensions,
          onOpenEventsFunctionsExtension
        ),
      [project, onOpenEventsFunctionsExtension]
    ),
  });

  return null;
};

export default UseProjectManagerCommands;
