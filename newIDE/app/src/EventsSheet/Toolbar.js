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
import { getShortcutDisplayName, useShortcutMap } from '../KeyboardShortcuts';

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
  moveEventsIntoNewGroup: () => void,
  canMoveEventsIntoNewGroup: boolean,
|};

const Toolbar = React.memo<Props>(function Toolbar({
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
  moveEventsIntoNewGroup,
  canMoveEventsIntoNewGroup,
}: Props) {
  const shortcutMap = useShortcutMap();

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
        moveEventsIntoNewGroup={moveEventsIntoNewGroup}
        canMoveEventsIntoNewGroup={canMoveEventsIntoNewGroup}
      />
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          onClick={onAddStandardEvent}
          id="toolbar-add-event-button"
          tooltip={t`Add a new empty event`}
          acceleratorString={getShortcutDisplayName(
            shortcutMap['ADD_STANDARD_EVENT']
          )}
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
          acceleratorString={getShortcutDisplayName(
            shortcutMap['ADD_SUBEVENT']
          )}
        >
          <AddSubEventIcon />
        </IconButton>

        <IconButton
          size="small"
          color="default"
          onClick={onAddCommentEvent}
          id="toolbar-add-comment-button"
          tooltip={t`Add a comment`}
          acceleratorString={getShortcutDisplayName(
            shortcutMap['ADD_COMMENT_EVENT']
          )}
        >
          <AddCommentIcon />
        </IconButton>
        <ElementWithMenu
          element={
            <IconButton
              size="small"
              color="default"
              tooltip={t`Choose and add an event`}
              acceleratorString={getShortcutDisplayName(
                shortcutMap['CHOOSE_AND_ADD_EVENT']
              )}
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
          acceleratorString={'Delete'}
        >
          <TrashIcon />
        </IconButton>

        <IconButton
          size="small"
          color="default"
          onClick={undo}
          disabled={!canUndo}
          tooltip={t`Undo the last changes`}
          acceleratorString={'CmdOrCtrl+Z'}
        >
          <UndoIcon />
        </IconButton>

        <IconButton
          size="small"
          color="default"
          onClick={redo}
          disabled={!canRedo}
          tooltip={t`Redo the last changes`}
          acceleratorString={'CmdOrCtrl+Shift+Z'}
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
});

export default Toolbar;
