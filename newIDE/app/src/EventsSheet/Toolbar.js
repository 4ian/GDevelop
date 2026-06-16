//@flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconButton from '../UI/IconButton';
import ToolbarCommands from './ToolbarCommands';
import { type EventMetadata } from './EnumerateEventsMetadata';
import ToolbarSearchIcon from '../UI/CustomSvgIcons/ToolbarSearch';
import EditSceneIcon from '../UI/CustomSvgIcons/EditScene';
import { getShortcutDisplayName, useShortcutMap } from '../KeyboardShortcuts';
import GraphsIcon from '../UI/CustomSvgIcons/Graphs';
import VariableTreeIcon from '../UI/CustomSvgIcons/VariableTree';
import ConsoleIcon from '../UI/CustomSvgIcons/Console';

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
  onShowGeneratedCode?: ?() => void,
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
  onShowGeneratedCode,
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
        {onShowGeneratedCode && (
          <IconButton
            size="small"
            color="default"
            onClick={onShowGeneratedCode}
            id="toolbar-show-generated-code-button"
            tooltip={t`Show the generated JavaScript code for these events`}
          >
            <ConsoleIcon />
          </IconButton>
        )}
        <IconButton
          size="small"
          color="default"
          selected={isGraphPreviewVisible}
          onClick={onToggleGraphPreview}
          tooltip={t`Catalog`}
          id="toolbar-toggle-events-graph-preview-button"
        >
          <GraphsIcon />
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
