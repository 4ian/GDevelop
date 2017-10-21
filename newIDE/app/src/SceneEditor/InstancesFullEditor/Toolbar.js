import React, { PureComponent } from 'react';
import { ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarSeparator from '../../UI/ToolbarSeparator';
import ToolbarIcon from '../../UI/ToolbarIcon';
import IconMenu from '../../UI/Menu/IconMenu';

export default class Toolbar extends PureComponent {
  render() {
    return (
      <ToolbarGroup lastChild>
        {this.props.showPreviewButton && (
          <ToolbarIcon
            onClick={this.props.onPreview}
            src="res/ribbon_default/preview32.png"
          />
        )}
        {this.props.showPreviewButton && <ToolbarSeparator />}
        {this.props.showObjectsList && (
          <ToolbarIcon
            onClick={this.props.openObjectsList}
            src="res/ribbon_default/objects64.png"
          />
        )}
        {this.props.showObjectsList && (
          <ToolbarIcon
            onClick={this.props.openObjectsGroupsList}
            src={'res/ribbon_default/objectsgroups64.png'}
          />
        )}
        <ToolbarIcon
          onClick={this.props.openProperties}
          src="res/ribbon_default/editprop32.png"
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.undo}
          src="res/ribbon_default/undo32.png"
          disabled={!this.props.canUndo}
        />
        <ToolbarIcon
          onClick={this.props.redo}
          src="res/ribbon_default/redo32.png"
          disabled={!this.props.canRedo}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.deleteSelection}
          src="res/ribbon_default/deleteselected32.png"
          disabled={
            !this.props.instancesSelection.getSelectedInstances().length
          }
        />
        <ToolbarIcon
          onClick={this.props.toggleInstancesList}
          src="res/ribbon_default/ObjectsPositionsList32.png"
        />
        <ToolbarIcon
          onClick={this.props.toggleLayersList}
          src="res/ribbon_default/layers32.png"
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={this.props.toggleWindowMask}
          src="res/ribbon_default/windowMask32.png"
        />
        <IconMenu
          iconButtonElement={
            <ToolbarIcon src="res/ribbon_default/grid32.png" />
          }
          menuTemplate={[
            {
              label: 'Toggle grid',
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
            <ToolbarIcon src="res/ribbon_default/zoom32.png" />
          }
          menuTemplate={[
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
