import React, { PureComponent } from 'react';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import ToolbarIcon from '../UI/ToolbarIcon';
import IconMenu from '../UI/Menu/IconMenu';
import { adaptAcceleratorString } from '../UI/AcceleratorString';

export class Toolbar extends PureComponent {
  render() {
    const t = str => str; //TODO

    return (
      <ToolbarGroup lastChild>
        {this.props.showPreviewButton && (
          <ToolbarIcon
            onClick={this.props.onPreview}
            src="res/ribbon_default/preview32.png"
            tooltip={t('Launch a preview of the scene')}
          />
        )}
        {this.props.showNetworkPreviewButton && (
          <IconMenu
            iconButtonElement={
              <ToolbarIcon
                src="res/ribbon_default/bug32.png"
                tooltip={t(
                  'Advanced preview options (debugger, network preview...)'
                )}
              />
            }
            buildMenuTemplate={() => [
              {
                label: 'Network preview (Preview over WiFi/LAN)',
                click: () => this.props.onNetworkPreview(),
              },
              { type: 'separator' },
              {
                label: 'Preview with debugger and performance profiler',
                click: () => this.props.onOpenDebugger(),
              },
            ]}
          />
        )}
        {this.props.showPreviewButton && <ToolbarSeparator />}
        <ToolbarIcon
          onClick={this.props.onAddStandardEvent}
          src="res/ribbon_default/eventadd32.png"
          tooltip={t('Add a new empty event')}
        />
        <ToolbarIcon
          onClick={this.props.onAddSubEvent}
          src="res/ribbon_default/subeventadd32.png"
          disabled={!this.props.canAddSubEvent}
          tooltip={t('Add a sub-event to the selected event')}
        />
        <ToolbarIcon
          onClick={this.props.onAddCommentEvent}
          src="res/ribbon_default/commentaireadd32.png"
          tooltip={t('Add a comment')}
        />
        <IconMenu
          iconButtonElement={
            <ToolbarIcon
              src="res/ribbon_default/add32.png"
              tooltip={t('Choose and add an event')}
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
          tooltip={t('Delete the selected event(s)')}
        />
        <ToolbarIcon
          onClick={this.props.undo}
          src="res/ribbon_default/undo32.png"
          disabled={!this.props.canUndo}
          tooltip={t('Undo the last changes')}
        />
        <ToolbarIcon
          onClick={this.props.redo}
          src="res/ribbon_default/redo32.png"
          disabled={!this.props.canRedo}
          tooltip={t('Redo the last changes')}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={() => this.props.onToggleSearchPanel()}
          src="res/ribbon_default/search32.png"
          tooltip={`${t('Search in events')} ${adaptAcceleratorString(
            'CmdOrCtrl+F'
          )}`}
        />
        {this.props.onOpenSettings && <ToolbarSeparator />}
        {this.props.onOpenSettings && (
          <ToolbarIcon
            onClick={this.props.onOpenSettings}
            src="res/ribbon_default/pref32.png"
            tooltip={t('Open settings')}
          />
        )}
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
