// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import React, { PureComponent } from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import ToolbarIcon from '../UI/ToolbarIcon';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import ToolbarCommands from './ToolbarCommands';
import InstancesSelection from '../InstancesEditor/InstancesSelection';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';

type Props = {|
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
  getContextMenuZoomItems: I18nType => Array<MenuItemTemplate>,
  setZoomFactor: number => void,
  onOpenSettings?: ?() => void,
|};

export class Toolbar extends PureComponent<Props> {
  render() {
    return (
      <>
        <ToolbarCommands
          openObjectsList={this.props.openObjectsList}
          openObjectGroupsList={this.props.openObjectGroupsList}
          openPropertiesPanel={this.props.openProperties}
          toggleInstancesList={this.props.toggleInstancesList}
          toggleLayersList={this.props.toggleLayersList}
          undo={this.props.undo}
          canUndo={this.props.canUndo}
          redo={this.props.redo}
          canRedo={this.props.canRedo}
          deleteSelection={this.props.deleteSelection}
          toggleWindowMask={this.props.toggleWindowMask}
          toggleGrid={this.props.toggleGrid}
          setupGrid={this.props.openSetupGrid}
          canDeleteSelection={
            this.props.instancesSelection.getSelectedInstances().length !== 0
          }
        />
        <ToolbarGroup lastChild>
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
          <ToolbarSeparator />
          <ElementWithMenu
            element={
              <ToolbarIcon
                src="res/ribbon_default/grid32.png"
                tooltip={t`Toggle/edit grid`}
              />
            }
            buildMenuTemplate={(i18n: I18nType) => [
              {
                type: 'checkbox',
                label: i18n._(t`Show Mask`),
                checked: this.props.isWindowMaskShown(),
                click: () => this.props.toggleWindowMask(),
              },
              {
                type: 'checkbox',
                label: i18n._(t`Show grid`),
                checked: this.props.isGridShown(),
                click: () => this.props.toggleGrid(),
              },
              { type: 'separator' },
              {
                label: i18n._(t`Setup grid`),
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
            buildMenuTemplate={(i18n: I18nType) => [
              ...this.props.getContextMenuZoomItems(i18n),
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
          {this.props.onOpenSettings && <ToolbarSeparator />}
          {this.props.onOpenSettings && (
            <ToolbarIcon
              onClick={this.props.onOpenSettings}
              src="res/ribbon_default/pref32.png"
              tooltip={t`Open settings`}
            />
          )}
        </ToolbarGroup>
      </>
    );
  }
}

export default Toolbar;
