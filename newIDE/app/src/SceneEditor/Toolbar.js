// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
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

const Toolbar = (props: Props) => {
  return (
    <>
      <ToolbarCommands
        openObjectsList={props.openObjectsList}
        openObjectGroupsList={props.openObjectGroupsList}
        openPropertiesPanel={props.openProperties}
        toggleInstancesList={props.toggleInstancesList}
        toggleLayersList={props.toggleLayersList}
        undo={props.undo}
        canUndo={props.canUndo}
        redo={props.redo}
        canRedo={props.canRedo}
        deleteSelection={props.deleteSelection}
        toggleWindowMask={props.toggleWindowMask}
        toggleGrid={props.toggleGrid}
        setupGrid={props.openSetupGrid}
        canDeleteSelection={
          props.instancesSelection.getSelectedInstances().length !== 0
        }
      />
      <ToolbarGroup lastChild>
        <ToolbarIcon
          id="open-objects-panel-button"
          onClick={props.openObjectsList}
          src="res/ribbon_default/objects64.png"
          tooltip={t`Open Objects Panel`}
        />
        <ToolbarIcon
          id="open-object-groups-panel-button"
          onClick={props.openObjectGroupsList}
          src={'res/ribbon_default/objectsgroups64.png'}
          tooltip={t`Open Object Groups Panel`}
        />
        <ToolbarIcon
          id="open-properties-panel-button"
          onClick={props.openProperties}
          src="res/ribbon_default/editprop32.png"
          tooltip={t`Open Properties Panel`}
        />
        <ToolbarIcon
          id="open-instances-list-panel-button"
          onClick={props.toggleInstancesList}
          src="res/ribbon_default/ObjectsPositionsList32.png"
          tooltip={t`Open Instances List Panel`}
        />
        <ToolbarIcon
          id="open-layers-panel-button"
          onClick={props.toggleLayersList}
          src="res/ribbon_default/layers32.png"
          tooltip={t`Open Layers Panel`}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={props.undo}
          src="res/ribbon_default/undo32.png"
          disabled={!props.canUndo}
          tooltip={t`Undo the last changes`}
        />
        <ToolbarIcon
          onClick={props.redo}
          src="res/ribbon_default/redo32.png"
          disabled={!props.canRedo}
          tooltip={t`Redo the last changes`}
        />
        <ToolbarSeparator />
        <ToolbarIcon
          onClick={props.deleteSelection}
          src="res/ribbon_default/deleteselected32.png"
          disabled={!props.instancesSelection.getSelectedInstances().length}
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
              checked: props.isWindowMaskShown(),
              click: () => props.toggleWindowMask(),
            },
            {
              type: 'checkbox',
              label: i18n._(t`Show grid`),
              checked: props.isGridShown(),
              click: () => props.toggleGrid(),
            },
            { type: 'separator' },
            {
              label: i18n._(t`Setup grid`),
              click: () => props.openSetupGrid(),
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
            ...props.getContextMenuZoomItems(i18n),
            { type: 'separator' },
            { label: '5%', click: () => props.setZoomFactor(0.05) },
            { label: '10%', click: () => props.setZoomFactor(0.1) },
            { label: '25%', click: () => props.setZoomFactor(0.25) },
            { label: '50%', click: () => props.setZoomFactor(0.5) },
            { label: '100%', click: () => props.setZoomFactor(1.0) },
            { label: '150%', click: () => props.setZoomFactor(1.5) },
            { label: '200%', click: () => props.setZoomFactor(2.0) },
            { label: '400%', click: () => props.setZoomFactor(4.0) },
          ]}
        />
        {props.onOpenSettings && <ToolbarSeparator />}
        {props.onOpenSettings && (
          <ToolbarIcon
            onClick={props.onOpenSettings}
            src="res/ribbon_default/pref32.png"
            tooltip={t`Open settings`}
          />
        )}
      </ToolbarGroup>
    </>
  );
};

export default Toolbar;
