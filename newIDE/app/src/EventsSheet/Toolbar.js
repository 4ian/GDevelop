//@flow
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import ToolbarIcon from '../UI/ToolbarIcon';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import { type EventMetadata } from './EnumerateEventsMetadata';
import PreviewButtons, {
  type PreviewButtonSettings,
} from '../MainFrame/Toolbar/PreviewButtons.js';

type Props = {|
  showPreviewButton: boolean,
  onPreview: () => void,
  previewButtonSettings: PreviewButtonSettings,
  showNetworkPreviewButton: boolean,
  onNetworkPreview: () => void,
  onOpenDebugger: () => void,
  onAddStandardEvent: () => void,
  onAddSubEvent: () => void,
  canAddSubEvent: boolean,
  onAddCommentEvent: () => void,
  allEventsMetadata: Array<EventMetadata>,
  onAddEvent: (eventType: string) => void,
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
      <ToolbarGroup lastChild>
        <PreviewButtons
          showPreviewButton={this.props.showPreviewButton}
          onPreview={this.props.onPreview}
          previewButtonSettings={this.props.previewButtonSettings}
          onNetworkPreview={this.props.onNetworkPreview}
          onOpenDebugger={this.props.onOpenDebugger}
          showNetworkPreviewButton={this.props.showNetworkPreviewButton}
        />
        {this.props.showPreviewButton && <ToolbarSeparator />}
        <ToolbarIcon
          onClick={this.props.onAddStandardEvent}
          src="res/ribbon_default/eventadd32.png"
          tooltip={t`Add a new empty event`}
        />
        <ToolbarIcon
          onClick={this.props.onAddSubEvent}
          src="res/ribbon_default/subeventadd32.png"
          disabled={!this.props.canAddSubEvent}
          tooltip={t`Add a sub-event to the selected event`}
        />
        <ToolbarIcon
          onClick={this.props.onAddCommentEvent}
          src="res/ribbon_default/commentaireadd32.png"
          tooltip={t`Add a comment`}
        />
        <ElementWithMenu
          element={
            <ToolbarIcon
              src="res/ribbon_default/add32.png"
              tooltip={t`Choose and add an event`}
            />
          }
          buildMenuTemplate={() =>
            this.props.allEventsMetadata.map(metadata => {
              return {
                label: metadata.fullName,
                click: () => this.props.onAddEvent(metadata.type),
              };
            })
          }
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.onRemove}
          src="res/ribbon_default/deleteselected32.png"
          disabled={!this.props.canRemove}
          tooltip={t`Delete the selected event(s)`}
        />
        <ToolbarIcon
          onClick={this.props.undo}
          src="res/ribbon_default/undo32.png"
          disabled={!this.props.canUndo}
          tooltip={t`Undo the last changes`}
        />
        <ToolbarIcon
          onClick={this.props.redo}
          src="res/ribbon_default/redo32.png"
          disabled={!this.props.canRedo}
          tooltip={t`Redo the last changes`}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={() => this.props.onToggleSearchPanel()}
          src="res/ribbon_default/search32.png"
          tooltip={t`Search in events`}
          acceleratorString={'CmdOrCtrl+F'}
        />
        {this.props.onOpenSettings && <ToolbarSeparator />}
        {this.props.onOpenSettings && (
          <ToolbarIcon
            onClick={this.props.onOpenSettings}
            src="res/ribbon_default/pref32.png"
            tooltip={t`Open settings`}
          />
        )}
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
