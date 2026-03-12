// @flow
import { t, Trans } from '@lingui/macro';
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
import SceneIcon from '../../UI/CustomSvgIcons/Scene';
import ExtensionIcon from '../../UI/CustomSvgIcons/Extension';
import EditIcon from '../../UI/CustomSvgIcons/Edit';
import InstancesListIcon from '../../UI/CustomSvgIcons/InstancesList';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import ProjectResourcesIcon from '../../UI/CustomSvgIcons/ProjectResources';
import ConsoleIcon from '../../UI/CustomSvgIcons/Console';
import BuildIcon from '../../UI/CustomSvgIcons/Hammer';
import UndoIcon from '../../UI/CustomSvgIcons/Undo';
import RedoIcon from '../../UI/CustomSvgIcons/Redo';
import TrashIcon from '../../UI/CustomSvgIcons/Trash';
import GridIcon from '../../UI/CustomSvgIcons/Grid';
import ZoomInIcon from '../../UI/CustomSvgIcons/ZoomIn';
import EditSceneIcon from '../../UI/CustomSvgIcons/EditScene';
import {
  OPEN_INSTANCES_PANEL_BUTTON_ID,
  OPEN_LAYERS_PANEL_BUTTON_ID,
  OPEN_PROJECT_PANEL_BUTTON_ID,
  OPEN_CONSOLE_PANEL_BUTTON_ID,
  OPEN_BUILD_PANEL_BUTTON_ID,
  OPEN_SCENES_MANAGER_BUTTON_ID,
  OPEN_EXTENSIONS_MANAGER_BUTTON_ID,
  OPEN_OBJECT_GROUPS_PANEL_BUTTON_ID,
  OPEN_OBJECTS_PANEL_BUTTON_ID,
  OPEN_PROPERTIES_PANEL_BUTTON_ID,
} from '../utils';
import CompactToggleButtons from '../../UI/CompactToggleButtons';
import Grid2d from '../../UI/CustomSvgIcons/Grid2d';
import Grid3d from '../../UI/CustomSvgIcons/Grid3d';

type Props = {|
  gameEditorMode: 'embedded-game' | 'instances-editor',
  setGameEditorMode: ('embedded-game' | 'instances-editor') => void,
  toggleObjectsList: () => void,
  isObjectsListShown: boolean,
  toggleObjectGroupsList: () => void,
  isObjectGroupsListShown: boolean,
  onOpenScenesManager: () => void,
  onOpenExtensionsManager: () => void,
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
  toggleProjectPanel: () => void,
  isProjectPanelShown: boolean,
  toggleConsolePanel: () => void,
  isConsolePanelShown: boolean,
  toggleBuildPanel: () => void,
  isBuildPanelShown: boolean,
  isWindowMaskShown: boolean,
  toggleWindowMask: () => void,
  isGridShown: boolean,
  toggleGrid: () => void,
  openSetupGrid: () => void,
  getContextMenuZoomItems: I18nType => Array<MenuItemTemplate>,
  setZoomFactor: number => void,
  onOpenSettings?: ?() => void,
  settingsIcon?: React.Node,
  onOpenSceneVariables: () => void,
|};

const Toolbar: React.ComponentType<Props> = React.memo<Props>(function Toolbar(
  props
) {
  return (
    <>
      <ToolbarCommands
        toggleObjectsList={props.toggleObjectsList}
        toggleObjectGroupsList={props.toggleObjectGroupsList}
        togglePropertiesPanel={props.toggleProperties}
        toggleInstancesList={props.toggleInstancesList}
        toggleLayersList={props.toggleLayersList}
        toggleProjectPanel={props.toggleProjectPanel}
        toggleConsolePanel={props.toggleConsolePanel}
        toggleBuildPanel={props.toggleBuildPanel}
        undo={props.undo}
        canUndo={props.canUndo}
        redo={props.redo}
        canRedo={props.canRedo}
        deleteSelection={props.deleteSelection}
        toggleWindowMask={props.toggleWindowMask}
        toggleGrid={props.toggleGrid}
        setupGrid={props.openSetupGrid}
        canDeleteSelection={props.selectedInstancesCount !== 0}
        onOpenSceneVariables={props.onOpenSceneVariables}
      />
      <ToolbarGroup firstChild>
        <CompactToggleButtons
          id="game-editor-toggle"
          noSeparator
          buttons={[
            {
              id: '2d-instances-editor',
              renderIcon: className => <Grid2d className={className} />,
              tooltip: <Trans>Top-down, classic editor</Trans>,
              label: '2D',
              onClick: () => {
                props.setGameEditorMode('instances-editor');
              },
              isActive: props.gameEditorMode === 'instances-editor',
            },
            {
              id: '3d-game-editor',
              renderIcon: className => <Grid3d className={className} />,
              tooltip: <Trans>3D, real-time editor (new)</Trans>,
              label: '3D',
              onClick: () => {
                props.setGameEditorMode('embedded-game');
              },
              isActive: props.gameEditorMode === 'embedded-game',
            },
          ]}
        />
        <IconButton
          size="small"
          color="default"
          id={OPEN_INSTANCES_PANEL_BUTTON_ID}
          onClick={props.toggleInstancesList}
          selected={props.isInstancesListShown}
          tooltip={
            props.isInstancesListShown
              ? t`Close Scene Objects Panel`
              : t`Open Scene Objects Panel`
          }
        >
          <InstancesListIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id={OPEN_LAYERS_PANEL_BUTTON_ID}
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
        <IconButton
          size="small"
          color="default"
          id={OPEN_PROJECT_PANEL_BUTTON_ID}
          onClick={props.toggleProjectPanel}
          selected={props.isProjectPanelShown}
          tooltip={
            props.isProjectPanelShown
              ? t`Close Project Panel`
              : t`Open Project Panel`
          }
        >
          <ProjectResourcesIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id={OPEN_CONSOLE_PANEL_BUTTON_ID}
          onClick={props.toggleConsolePanel}
          selected={props.isConsolePanelShown}
          tooltip={
            props.isConsolePanelShown
              ? t`Close Console Panel`
              : t`Open Console Panel`
          }
        >
          <ConsoleIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id={OPEN_BUILD_PANEL_BUTTON_ID}
          onClick={props.toggleBuildPanel}
          selected={props.isBuildPanelShown}
          tooltip={
            props.isBuildPanelShown
              ? t`Close Build Panel`
              : t`Open Build Panel`
          }
        >
          <BuildIcon />
        </IconButton>
        <ToolbarSeparator />
      </ToolbarGroup>
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          id={OPEN_OBJECTS_PANEL_BUTTON_ID}
          onClick={props.toggleObjectsList}
          selected={props.isObjectsListShown}
          tooltip={
            props.isObjectsListShown
              ? t`Close Hierarchy Panel`
              : t`Open Hierarchy Panel`
          }
        >
          <ObjectIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id={OPEN_OBJECT_GROUPS_PANEL_BUTTON_ID}
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
          id={OPEN_SCENES_MANAGER_BUTTON_ID}
          onClick={props.onOpenScenesManager}
          tooltip={t`Open Scenes Manager`}
        >
          <SceneIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id={OPEN_EXTENSIONS_MANAGER_BUTTON_ID}
          onClick={props.onOpenExtensionsManager}
          tooltip={t`Open Extensions Manager`}
        >
          <ExtensionIcon />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          id={OPEN_PROPERTIES_PANEL_BUTTON_ID}
          onClick={props.toggleProperties}
          selected={props.isPropertiesShown}
          tooltip={
            props.isPropertiesShown
              ? t`Close Inspector Panel`
              : t`Open Inspector Panel`
          }
        >
          <EditIcon />
        </IconButton>
        <ToolbarSeparator />
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
