// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { ToolbarGroup } from '../../UI/Toolbar';
import ToolbarSeparator from '../../UI/ToolbarSeparator';
import IconButton from '../../UI/IconButton';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import ToolbarCommands from '../ToolbarCommands';
import { type MenuItemTemplate } from '../../UI/Menu/Menu.flow';
import ObjectIcon from '../../UI/CustomSvgIcons/Object';
import ObjectGroupIcon from '../../UI/CustomSvgIcons/ObjectGroup';
import EditIcon from '../../UI/CustomSvgIcons/Edit';
import InstancesListIcon from '../../UI/CustomSvgIcons/InstancesList';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import UndoIcon from '../../UI/CustomSvgIcons/Undo';
import RedoIcon from '../../UI/CustomSvgIcons/Redo';
import TrashIcon from '../../UI/CustomSvgIcons/Trash';
import GridIcon from '../../UI/CustomSvgIcons/Grid';
import ZoomInIcon from '../../UI/CustomSvgIcons/ZoomIn';
import EditSceneIcon from '../../UI/CustomSvgIcons/EditScene';

type Props = {|
  toggleObjectsList: () => void,
  isObjectsListShown: boolean,
  toggleObjectGroupsList: () => void,
  isObjectGroupsListShown: boolean,
  toggleProperties: () => void,
  isPropertiesShown: boolean,
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  deleteSelection: () => void,
  selectedInstancesCount: number,
  toggleInstancesList: () => void,
  isInstancesListShown: boolean,
  toggleLayersList: () => void,
  isLayersListShown: boolean,
  isWindowMaskShown: boolean,
  toggleWindowMask: () => void,
  isGridShown: boolean,
  toggleGrid: () => void,
  openSetupGrid: () => void,
  getContextMenuZoomItems: I18nType => Array<MenuItemTemplate>,
  setZoomFactor: number => void,
  onOpenSettings?: ?() => void,
  settingsIcon?: React.Node,
  canRenameObject: boolean,
  onRenameObject: () => void,
|};

const Toolbar = React.memo<Props>(function Toolbar(props) {
  return (
    <>
      <ToolbarCommands
        toggleObjectsList={props.toggleObjectsList}
        toggleObjectGroupsList={props.toggleObjectGroupsList}
        togglePropertiesPanel={props.toggleProperties}
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
        canDeleteSelection={props.selectedInstancesCount !== 0}
        canRenameObject={props.canRenameObject}
        onRenameObject={props.onRenameObject}
      />
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-objects-panel-button"
          onClick={props.toggleObjectsList}
          selected={props.isObjectsListShown}
          tooltip={
            props.isObjectsListShown
              ? t`Close Objects Panel`
              : t`Open Objects Panel`
          }
        >
          <ObjectIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-object-groups-panel-button"
          onClick={props.toggleObjectGroupsList}
          selected={props.isObjectGroupsListShown}
          tooltip={
            props.isObjectGroupsListShown
              ? t`Close Object Groups Panel`
              : t`Open Object Groups Panel`
          }
        >
          <ObjectGroupIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-properties-panel-button"
          onClick={props.toggleProperties}
          selected={props.isPropertiesShown}
          tooltip={
            props.isPropertiesShown
              ? t`Close Properties Panel`
              : t`Open Properties Panel`
          }
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-instances-list-panel-button"
          onClick={props.toggleInstancesList}
          selected={props.isInstancesListShown}
          tooltip={
            props.isInstancesListShown
              ? t`Close Instances List Panel`
              : t`Open Instances List Panel`
          }
        >
          <InstancesListIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id="toolbar-open-layers-panel-button"
          onClick={props.toggleLayersList}
          selected={props.isLayersListShown}
          tooltip={
            props.isLayersListShown
              ? t`Close Layers Panel`
              : t`Open Layers Panel`
          }
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
              checked: props.isWindowMaskShown,
              click: () => props.toggleWindowMask(),
            },
            {
              type: 'checkbox',
              label: i18n._(t`Show grid`),
              checked: props.isGridShown,
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
          disabled={!props.selectedInstancesCount}
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
            {props.settingsIcon || <EditSceneIcon />}
          </IconButton>
        )}
      </ToolbarGroup>
    </>
  );
});

export default Toolbar;
