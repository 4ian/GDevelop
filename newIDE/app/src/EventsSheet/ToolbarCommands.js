// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  useCommand,
  useCommandWithOptions,
} from '../CommandPalette/CommandHooks';
import { type EventMetadata } from './EnumerateEventsMetadata';

const addEmptyEventCommandText = t`Add a new empty event`;
const addSubEventCommandText = t`Add a sub-event to the selected event`;
const addCommentCommandText = t`Add a comment`;
const chooseAndAddEventCommandText = t`Choose and add an event...`;
const undoCommandText = t`Undo the last changes`;
const redoCommandText = t`Redo the last changes`;
const deleteSelectionCommandText = t`Delete the selected event(s)`;
const searchEventsCommandText = t`Search in events`;
const openSettingsCommandText = t`Open settings`;

type Props = {|
  onAddStandardEvent: () => void,
  onAddSubEvent: () => void,
  canAddSubEvent: boolean,
  onAddCommentEvent: () => void,
  allEventsMetadata: Array<EventMetadata>,
  onAddEvent: (eventType: string) => Array<gdBaseEvent>,
  onRemove: () => void,
  canRemove: boolean,
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  onToggleSearchPanel: () => void,
  onOpenSettings?: ?() => void,
|};

const ToolbarCommands = (props: Props) => {
  const { onAddEvent } = props;

  useCommand('ADD_STANDARD EVENT', {
    displayText: addEmptyEventCommandText,
    enabled: true,
    handler: props.onAddStandardEvent,
  });

  useCommand('ADD_SUBEVENT', {
    displayText: addSubEventCommandText,
    enabled: props.canAddSubEvent,
    handler: props.onAddSubEvent,
  });

  useCommand('ADD_COMMENT_EVENT', {
    displayText: addCommentCommandText,
    enabled: true,
    handler: props.onAddCommentEvent,
  });

  useCommandWithOptions('CHOOSE_AND_ADD_EVENT', {
    displayText: chooseAndAddEventCommandText,
    enabled: true,
    generateOptions: React.useCallback(
      () =>
        props.allEventsMetadata.map(metadata => ({
          text: metadata.fullName,
          handler: () => {
            onAddEvent(metadata.type);
          },
          value: metadata,
        })),
      [props.allEventsMetadata, onAddEvent]
    ),
  });

  useCommand('DELETE_SELECTION', {
    displayText: deleteSelectionCommandText,
    enabled: props.canRemove,
    handler: props.onRemove,
  });

  useCommand('UNDO', {
    displayText: undoCommandText,
    enabled: props.canUndo,
    handler: props.undo,
  });

  useCommand('REDO', {
    displayText: redoCommandText,
    enabled: props.canRedo,
    handler: props.redo,
  });

  useCommand('SEARCH_EVENTS', {
    displayText: searchEventsCommandText,
    enabled: true,
    handler: props.onToggleSearchPanel,
  });

  useCommand('OPEN_SETTINGS', {
    displayText: openSettingsCommandText,
    enabled: !!props.onOpenSettings,
    handler: props.onOpenSettings || (() => {}),
  });

  return null;
};

export default ToolbarCommands;
