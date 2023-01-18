//@flow
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
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
|};

export class Toolbar extends PureComponent<Props> {
  render() {
    return (
      <>
        <ToolbarCommands {...this.props} />
        <ToolbarGroup lastChild>
          <IconButton
            size="small"
            color="default"
            onClick={this.props.onAddStandardEvent}
            id="toolbar-add-event-button"
            tooltip={t`Add a new empty event`}
          >
            <AddEventIcon />
          </IconButton>

          <IconButton
            size="small"
            color="default"
            onClick={this.props.onAddSubEvent}
            disabled={!this.props.canAddSubEvent}
            id="toolbar-add-sub-event-button"
            tooltip={t`Add a sub-event to the selected event`}
          >
            <AddSubEventIcon />
          </IconButton>

          <IconButton
            size="small"
            color="default"
            onClick={this.props.onAddCommentEvent}
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
              this.props.allEventsMetadata.map(metadata => {
                return {
                  label: metadata.fullName,
                  click: () => {
                    this.props.onAddEvent(metadata.type);
                  },
                };
              })
            }
          />
          <ToolbarSeparator />

          <IconButton
            size="small"
            color="default"
            onClick={this.props.onRemove}
            disabled={!this.props.canRemove}
            tooltip={t`Delete the selected event(s)`}
          >
            <TrashIcon />
          </IconButton>

          <IconButton
            size="small"
            color="default"
            onClick={this.props.undo}
            disabled={!this.props.canUndo}
            tooltip={t`Undo the last changes`}
          >
            <UndoIcon />
          </IconButton>

          <IconButton
            size="small"
            color="default"
            onClick={this.props.redo}
            disabled={!this.props.canRedo}
            tooltip={t`Redo the last changes`}
          >
            <RedoIcon />
          </IconButton>
          <ToolbarSeparator />

          <IconButton
            size="small"
            color="default"
            onClick={() => this.props.onToggleSearchPanel()}
            tooltip={t`Search in events`}
            acceleratorString={'CmdOrCtrl+F'}
          >
            <ToolbarSearchIcon />
          </IconButton>
          {this.props.onOpenSettings && <ToolbarSeparator />}
          {this.props.onOpenSettings && (
            <IconButton
              size="small"
              color="default"
              onClick={this.props.onOpenSettings}
              tooltip={t`Open settings`}
            >
              <EditSceneIcon />
            </IconButton>
          )}
        </ToolbarGroup>
      </>
    );
  }
}

export default Toolbar;
