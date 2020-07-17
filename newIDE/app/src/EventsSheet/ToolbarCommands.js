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

  useCommand('ADD_STANDARD EVENT', true, {
    displayText: addEmptyEventCommandText,
    handler: props.onAddStandardEvent,
  });

  useCommand('ADD_SUBEVENT', props.canAddSubEvent, {
    displayText: addSubEventCommandText,
    handler: props.onAddSubEvent,
  });

  useCommand('ADD_COMMENT_EVENT', true, {
    displayText: addCommentCommandText,
    handler: props.onAddCommentEvent,
  });

  useCommandWithOptions('CHOOSE_AND_ADD_EVENT', true, {
    displayText: chooseAndAddEventCommandText,
    generateOptions: React.useCallback(
      () =>
        props.allEventsMetadata.map(metadata => ({
          text: metadata.fullName,
          handler: () => {
            onAddEvent(metadata.type);
          },
        })),
      [props.allEventsMetadata, onAddEvent]
    ),
  });

  useCommand('DELETE_SELECTION', props.canRemove, {
    displayText: deleteSelectionCommandText,
    handler: props.onRemove,
  });

  useCommand('UNDO', props.canUndo, {
    displayText: undoCommandText,
    handler: props.undo,
  });

  useCommand('REDO', props.canRedo, {
    displayText: redoCommandText,
    handler: props.redo,
  });

  useCommand('SEARCH_EVENTS', true, {
    displayText: searchEventsCommandText,
    handler: props.onToggleSearchPanel,
  });

  useCommand('OPEN_SETTINGS', !!props.onOpenSettings, {
    displayText: openSettingsCommandText,
    handler: props.onOpenSettings || (() => {}),
  });

  return null;
};

export default ToolbarCommands;
