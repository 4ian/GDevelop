import React, { PureComponent } from 'react';
import { translate } from 'react-i18next';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import ToolbarIcon from '../UI/ToolbarIcon';
import IconMenu from '../UI/Menu/IconMenu';
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';
const gd = global.gd;

export class Toolbar extends PureComponent {
  componentWillMount() {
    const allExtensions = gd
      .asPlatform(gd.JsPlatform.get())
      .getAllPlatformExtensions();

    this.allEventsMetadata = flatten(
      mapFor(0, allExtensions.size(), i => {
        const extension = allExtensions.get(i);
        const extensionEvents = extension.getAllEvents();

        return extensionEvents
          .keys()
          .toJSArray()
          .map(type => {
            const metadata = extensionEvents.get(type);
            return {
              type,
              fullName: metadata.getFullName(),
              description: metadata.getDescription(),
            };
          });
      })
    );
  }

  render() {
    const { t } = this.props;

    return (
      <ToolbarGroup lastChild>
        {this.props.showPreviewButton && (
          <ToolbarIcon
            onClick={this.props.onPreview}
            src="res/ribbon_default/preview32.png"
            tooltip={t('Launch a preview of the scene')}
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
            this.allEventsMetadata.map(metadata => {
              return {
                label: metadata.fullName,
                click: () => this.props.onAddEvent(metadata.type),
              };
            })}
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
          disabled
          onClick={() => {
            /*TODO*/
          }}
          src="res/ribbon_default/search32.png"
          tooltip={t('Search in events')}
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

export default translate()(Toolbar);
