//@flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
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
import AddLocalVariableIcon from '../UI/CustomSvgIcons/LocalVariable';
import GraphsIcon from '../UI/CustomSvgIcons/Graphs';
import VariableTreeIcon from '../UI/CustomSvgIcons/VariableTree';

type Props = {|
  onAddStandardEvent: () => void,
  onAddSubEvent: () => void,
  canAddSubEvent: boolean,
  onAddLocalVariable: () => void,
  canAddLocalVariable: boolean,
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
  onToggleGraphPreview: () => void,
  isGraphPreviewVisible: boolean,
  onOpenSettings?: ?() => void,
  settingsIcon?: React.Node,
  moveEventsIntoNewGroup: () => void,
  canMoveEventsIntoNewGroup: boolean,
  onOpenSceneVariables: () => void,
|};

const Toolbar: React.ComponentType<Props> = React.memo<Props>(function Toolbar({
  onAddStandardEvent,
  onAddSubEvent,
  canAddSubEvent,
  onAddLocalVariable,
  canAddLocalVariable,
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
  onToggleGraphPreview,
  isGraphPreviewVisible,
  onOpenSettings,
  settingsIcon,
  moveEventsIntoNewGroup,
  canMoveEventsIntoNewGroup,
  onOpenSceneVariables,
}: Props) {
  const shortcutMap = useShortcutMap();

  return (
    <>
      <ToolbarCommands
        onAddCommentEvent={onAddCommentEvent}
        onAddSubEvent={onAddSubEvent}
        canAddSubEvent={canAddSubEvent}
        onAddLocalVariable={onAddLocalVariable}
        canAddLocalVariable={canAddLocalVariable}
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
        onOpenSceneVariables={onOpenSceneVariables}
      />
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          onClick={onOpenSceneVariables}
          id="toolbar-open-variables-button"
          tooltip={t`Edit variables`}
          acceleratorString={getShortcutDisplayName(
            shortcutMap['OPEN_SCENE_VARIABLES']
          )}
        >
          <VariableTreeIcon />
        </IconButton>

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
          onClick={onAddLocalVariable}
          disabled={!canAddLocalVariable}
          id="toolbar-add-local-variable-button"
          tooltip={t`Add a local variable`}
          acceleratorString={getShortcutDisplayName(
            shortcutMap['ADD_LOCAL_VARIABLE']
          )}
        >
          <AddLocalVariableIcon />
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
        <FlatButton
          primary={isGraphPreviewVisible}
          noBorder={!isGraphPreviewVisible}
          noBackground={!isGraphPreviewVisible}
          onClick={onToggleGraphPreview}
          leftIcon={<GraphsIcon />}
          label={<Trans>Catalog</Trans>}
          id="toolbar-toggle-events-graph-preview-button"
        />
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
