//@flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconButton from '../UI/IconButton';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import ToolbarCommands from './ToolbarCommands';
import { type EventMetadata } from './EnumerateEventsMetadata';
import AddEventIcon from '../UI/CustomSvgIcons/AddEvent';
import AddSubEventIcon from '../UI/CustomSvgIcons/AddSubEvent';
import AddCommentIcon from '../UI/CustomSvgIcons/AddComment';
import CircledAddIcon from '../UI/CustomSvgIcons/CircledAdd';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import UndoIcon from '../UI/CustomSvgIcons/Undo';
import RedoIcon from '../UI/CustomSvgIcons/Redo';
import ToolbarSearchIcon from '../UI/CustomSvgIcons/ToolbarSearch';
import EditSceneIcon from '../UI/CustomSvgIcons/EditScene';

type Props = {|
  onAddStandardEvent: () => void,
  onAddSubEvent: () => void,
  canAddSubEvent: boolean,
  onAddCommentEvent: () => void,
  allEventsMetadata: Array<EventMetadata>,
  onAddEvent: (eventType: string) => Array<gdBaseEvent>,
  onToggleInvertedCondition: () => void,
  onToggleDisabledEvent: () => void,
  canToggleEventDisabled: boolean,
  canToggleInstructionInverted: boolean,
  onRemove: () => void,
  canRemove: boolean,
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  onToggleSearchPanel: () => void,
  onOpenSettings?: ?() => void,
  settingsIcon?: React.Node,
|};

const Toolbar = ({
  onAddStandardEvent,
  onAddSubEvent,
  canAddSubEvent,
  onAddCommentEvent,
  allEventsMetadata,
  onAddEvent,
  onToggleInvertedCondition,
  onToggleDisabledEvent,
  canToggleEventDisabled,
  canToggleInstructionInverted,
  onRemove,
  canRemove,
  undo,
  canUndo,
  redo,
  canRedo,
  onToggleSearchPanel,
  onOpenSettings,
  settingsIcon,
}: Props) => {
  return (
    <>
      <ToolbarCommands
        onAddCommentEvent={onAddCommentEvent}
        onAddSubEvent={onAddSubEvent}
        canAddSubEvent={canAddSubEvent}
        onAddStandardEvent={onAddStandardEvent}
        onAddEvent={onAddEvent}
        allEventsMetadata={allEventsMetadata}
        onToggleInvertedCondition={onToggleInvertedCondition}
        onToggleDisabledEvent={onToggleDisabledEvent}
        canToggleEventDisabled={canToggleEventDisabled}
        canToggleInstructionInverted={canToggleInstructionInverted}
        onRemove={onRemove}
        canRemove={canRemove}
        undo={undo}
        canUndo={canUndo}
        redo={redo}
        canRedo={canRedo}
        onToggleSearchPanel={onToggleSearchPanel}
        onOpenSettings={onOpenSettings}
      />
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          onClick={onAddStandardEvent}
          id="toolbar-add-event-button"
          tooltip={t`Add a new empty event`}
        >
          <AddEventIcon />
        </IconButton>

        <IconButton
          size="small"
          color="default"
          onClick={onAddSubEvent}
          disabled={!canAddSubEvent}
          id="toolbar-add-sub-event-button"
          tooltip={t`Add a sub-event to the selected event`}
        >
          <AddSubEventIcon />
        </IconButton>

        <IconButton
          size="small"
          color="default"
          onClick={onAddCommentEvent}
          id="toolbar-add-comment-button"
          tooltip={t`Add a comment`}
        >
          <AddCommentIcon />
        </IconButton>
        <ElementWithMenu
          element={
            <IconButton
              size="small"
              color="default"
              tooltip={t`Choose and add an event`}
            >
              <CircledAddIcon />
            </IconButton>
          }
          buildMenuTemplate={() =>
            allEventsMetadata.map(metadata => {
              return {
                label: metadata.fullName,
                click: () => {
                  onAddEvent(metadata.type);
                },
              };
            })
          }
        />
        <ToolbarSeparator />

        <IconButton
          size="small"
          color="default"
          onClick={onRemove}
          disabled={!canRemove}
          tooltip={t`Delete the selected event(s)`}
        >
          <TrashIcon />
        </IconButton>

        <IconButton
          size="small"
          color="default"
          onClick={undo}
          disabled={!canUndo}
          tooltip={t`Undo the last changes`}
        >
          <UndoIcon />
        </IconButton>

        <IconButton
          size="small"
          color="default"
          onClick={redo}
          disabled={!canRedo}
          tooltip={t`Redo the last changes`}
        >
          <RedoIcon />
        </IconButton>
        <ToolbarSeparator />

        <IconButton
          size="small"
          color="default"
          onClick={() => onToggleSearchPanel()}
          tooltip={t`Search in events`}
          acceleratorString={'CmdOrCtrl+F'}
        >
          <ToolbarSearchIcon />
        </IconButton>
        {onOpenSettings && <ToolbarSeparator />}
        {onOpenSettings && (
          <IconButton
            size="small"
            color="default"
            onClick={onOpenSettings}
            tooltip={t`Open settings`}
          >
            {settingsIcon || <EditSceneIcon />}
          </IconButton>
        )}
      </ToolbarGroup>
    </>
  );
};

export default Toolbar;
