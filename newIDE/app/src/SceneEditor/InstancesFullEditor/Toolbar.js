import React, { PureComponent } from 'react';
import { translate } from 'react-i18next';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarSeparator from '../../UI/ToolbarSeparator';
import ToolbarIcon from '../../UI/ToolbarIcon';
import IconMenu from '../../UI/Menu/IconMenu';

export class Toolbar extends PureComponent {
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
        {this.props.showObjectsList && (
          <ToolbarIcon
            onClick={this.props.openObjectsList}
            src="res/ribbon_default/objects64.png"
            tooltip={t('Open the objects editor')}
          />
        )}
        {this.props.showObjectsList && (
          <ToolbarIcon
            onClick={this.props.openObjectsGroupsList}
            src={'res/ribbon_default/objectsgroups64.png'}
            tooltip={t('Open the objects groups editor')}
          />
        )}
        <ToolbarIcon
          onClick={this.props.openProperties}
          src="res/ribbon_default/editprop32.png"
          tooltip={t('Open the properties panel')}
        />
        <ToolbarSeparator />
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
          onClick={this.props.deleteSelection}
          src="res/ribbon_default/deleteselected32.png"
          disabled={
            !this.props.instancesSelection.getSelectedInstances().length
          }
          tooltip={t('Delete the selected instances from the scene')}
        />
        <ToolbarIcon
          onClick={this.props.toggleInstancesList}
          src="res/ribbon_default/ObjectsPositionsList32.png"
          tooltip={t('Open the list of instances')}
        />
        <ToolbarIcon
          onClick={this.props.toggleLayersList}
          src="res/ribbon_default/layers32.png"
          tooltip={t('Open the layers editor')}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.toggleWindowMask}
          src="res/ribbon_default/windowMask32.png"
          tooltip={t('Toggle window mask')}
        />
        <IconMenu
          iconButtonElement={
            <ToolbarIcon
              src="res/ribbon_default/grid32.png"
              tooltip={t('Toggle/edit grid')}
            />
          }
          buildMenuTemplate={() => [
            {
              type: 'checkbox',
              label: 'Show grid',
              checked: this.props.isGridShown(),
              click: () => this.props.toggleGrid(),
            },
            { type: 'separator' },
            {
              label: 'Setup grid',
              click: () => this.props.openSetupGrid(),
            },
          ]}
        />
        <IconMenu
          iconButtonElement={
            <ToolbarIcon
              src="res/ribbon_default/zoom32.png"
              tooltip={t('Change editor zoom')}
            />
          }
          buildMenuTemplate={() => [
            {
              label: 'Zoom in',
              click: this.props.zoomIn,
              accelerator: 'CmdOrCtrl++',
            },
            {
              label: 'Zoom out',
              click: this.props.zoomOut,
              accelerator: 'CmdOrCtrl+-',
            },
            { type: 'separator' },
            { label: '5%', click: () => this.props.setZoomFactor(0.05) },
            { label: '10%', click: () => this.props.setZoomFactor(0.1) },
            { label: '25%', click: () => this.props.setZoomFactor(0.25) },
            { label: '50%', click: () => this.props.setZoomFactor(0.5) },
            { label: '100%', click: () => this.props.setZoomFactor(1.0) },
            { label: '150%', click: () => this.props.setZoomFactor(1.5) },
            { label: '200%', click: () => this.props.setZoomFactor(2.0) },
          ]}
        />
      </ToolbarGroup>
    );
  }
}

export default translate()(Toolbar);
