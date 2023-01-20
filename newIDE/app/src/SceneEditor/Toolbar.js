// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconButton from '../UI/IconButton';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import ToolbarCommands from './ToolbarCommands';
import InstancesSelection from '../InstancesEditor/InstancesSelection';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import ObjectIcon from '../UI/CustomSvgIcons/Object';
import ObjectGroupIcon from '../UI/CustomSvgIcons/ObjectGroup';
import PropertiesPanelIcon from '../UI/CustomSvgIcons/PropertiesPanel';
import InstancesListIcon from '../UI/CustomSvgIcons/InstancesList';
import LayersIcon from '../UI/CustomSvgIcons/Layers';
import UndoIcon from '../UI/CustomSvgIcons/Undo';
import RedoIcon from '../UI/CustomSvgIcons/Redo';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import GridIcon from '../UI/CustomSvgIcons/Grid';
import ZoomInIcon from '../UI/CustomSvgIcons/ZoomIn';
import EditSceneIcon from '../UI/CustomSvgIcons/EditScene';

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
  onRenameObjectOrGroup: () => void,
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
        onRenameObjectOrGroup={props.onRenameObjectOrGroup}
      />
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-objects-panel-button"
          onClick={props.openObjectsList}
          tooltip={t`Open Objects Panel`}
        >
          <ObjectIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-object-groups-panel-button"
          onClick={props.openObjectGroupsList}
          tooltip={t`Open Object Groups Panel`}
        >
          <ObjectGroupIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-properties-panel-button"
          onClick={props.openProperties}
          tooltip={t`Open Properties Panel`}
        >
          <PropertiesPanelIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-instances-list-panel-button"
          onClick={props.toggleInstancesList}
          tooltip={t`Open Instances List Panel`}
        >
          <InstancesListIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-layers-panel-button"
          onClick={props.toggleLayersList}
          tooltip={t`Open Layers Panel`}
        >
          <LayersIcon />
        </IconButton>
        <ElementWithMenu
          element={
            <IconButton
              size="small"
              color="default"
              tooltip={t`Toggle/edit grid`}
            >
              <GridIcon />
            </IconButton>
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
        <ToolbarSeparator />
        <IconButton
          size="small"
          color="default"
          onClick={props.undo}
          disabled={!props.canUndo}
          tooltip={t`Undo the last changes`}
        >
          <UndoIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          onClick={props.redo}
          disabled={!props.canRedo}
          tooltip={t`Redo the last changes`}
        >
          <RedoIcon />
        </IconButton>
        <ElementWithMenu
          element={
            <IconButton
              size="small"
              color="default"
              tooltip={t`Change editor zoom`}
            >
              <ZoomInIcon />
            </IconButton>
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
        <IconButton
          size="small"
          color="default"
          onClick={props.deleteSelection}
          disabled={!props.instancesSelection.getSelectedInstances().length}
          tooltip={t`Delete the selected instances from the scene`}
        >
          <TrashIcon />
        </IconButton>
        {props.onOpenSettings && <ToolbarSeparator />}
        {props.onOpenSettings && (
          <IconButton
            size="small"
            color="default"
            onClick={props.onOpenSettings}
            tooltip={t`Open settings`}
          >
            <EditSceneIcon />
          </IconButton>
        )}
      </ToolbarGroup>
    </>
  );
};

export default Toolbar;
