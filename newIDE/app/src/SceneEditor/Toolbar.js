// @flow
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import ToolbarIcon from '../UI/ToolbarIcon';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import InstancesSelection from './InstancesSelection';
import PreviewButtons, {
  type PreviewButtonSettings,
} from '../MainFrame/Toolbar/PreviewButtons.js';

type Props = {|
  previewButtonSettings: PreviewButtonSettings,
  showPreviewButton: boolean,
  onPreview: () => void,
  showNetworkPreviewButton: boolean,
  onNetworkPreview: () => void,
  onOpenDebugger: () => void,
  openObjectsList: () => void,
  openObjectGroupsList: () => void,
  openProperties: () => void,
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  deleteSelection: () => void,
  instancesSelection: InstancesSelection,
  toggleInstancesList: () => void,
  toggleLayersList: () => void,
  isWindowMaskShown: () => boolean,
  toggleWindowMask: () => void,
  isGridShown: () => boolean,
  toggleGrid: () => void,
  openSetupGrid: () => void,
  zoomIn: () => void,
  zoomOut: () => void,
  centerView: () => void,
  setZoomFactor: number => void,
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
          onClick={this.props.openObjectsList}
          src="res/ribbon_default/objects64.png"
          tooltip={t`Open the objects editor`}
        />
        <ToolbarIcon
          onClick={this.props.openObjectGroupsList}
          src={'res/ribbon_default/objectsgroups64.png'}
          tooltip={t`Open the objects groups editor`}
        />
        <ToolbarIcon
          onClick={this.props.openProperties}
          src="res/ribbon_default/editprop32.png"
          tooltip={t`Open the properties panel`}
        />
        <ToolbarSeparator />
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
          onClick={this.props.deleteSelection}
          src="res/ribbon_default/deleteselected32.png"
          disabled={
            !this.props.instancesSelection.getSelectedInstances().length
          }
          tooltip={t`Delete the selected instances from the scene`}
        />
        <ToolbarIcon
          onClick={this.props.toggleInstancesList}
          src="res/ribbon_default/ObjectsPositionsList32.png"
          tooltip={t`Open the list of instances`}
        />
        <ToolbarIcon
          onClick={this.props.toggleLayersList}
          src="res/ribbon_default/layers32.png"
          tooltip={t`Open the layers editor`}
        />
        <ToolbarSeparator />
        <ElementWithMenu
          element={
            <ToolbarIcon
              src="res/ribbon_default/grid32.png"
              tooltip={t`Toggle/edit grid`}
            />
          }
          buildMenuTemplate={() => [
            {
              type: 'checkbox',
              label: 'Show Mask',
              checked: this.props.isWindowMaskShown(),
              click: () => this.props.toggleWindowMask(),
            },
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
        <ElementWithMenu
          element={
            <ToolbarIcon
              src="res/ribbon_default/zoom32.png"
              tooltip={t`Change editor zoom`}
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
            {
              label: 'Center View',
              click: () => this.props.centerView(),
            },
            { type: 'separator' },
            { label: '5%', click: () => this.props.setZoomFactor(0.05) },
            { label: '10%', click: () => this.props.setZoomFactor(0.1) },
            { label: '25%', click: () => this.props.setZoomFactor(0.25) },
            { label: '50%', click: () => this.props.setZoomFactor(0.5) },
            { label: '100%', click: () => this.props.setZoomFactor(1.0) },
            { label: '150%', click: () => this.props.setZoomFactor(1.5) },
            { label: '200%', click: () => this.props.setZoomFactor(2.0) },
            { label: '400%', click: () => this.props.setZoomFactor(4.0) },
          ]}
        />
      </ToolbarGroup>
    );
  }
}

export default Toolbar;
