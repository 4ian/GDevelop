// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { ToolbarGroup } from '../../UI/Toolbar';
import ToolbarSeparator from '../../UI/ToolbarSeparator';
import IconButton from '../../UI/IconButton';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import ToolbarCommands from '../ToolbarCommands';
import ShowAllPanelsIcon from '../../UI/CustomSvgIcons/ShowAllPanels';
import GridIcon from '../../UI/CustomSvgIcons/Grid';
import EditSceneIcon from '../../UI/CustomSvgIcons/EditScene';
import EventsIcon from '../../UI/CustomSvgIcons/Events';
import Add from '../../UI/CustomSvgIcons/Add';
import { TOGGLE_ALL_PANELS_BUTTON_ID } from '../utils';
import CompactToggleButtons from '../../UI/CompactToggleButtons';
import Grid2d from '../../UI/CustomSvgIcons/Grid2d';
import Grid3d from '../../UI/CustomSvgIcons/Grid3d';
import {
  getShortcutDisplayName,
  useShortcutMap,
} from '../../KeyboardShortcuts';

type Props = {|
  gameEditorMode: 'embedded-game' | 'instances-editor',
  setGameEditorMode: ('embedded-game' | 'instances-editor') => void,
  onAddObject: () => void,
  canAddObject: boolean,
  toggleObjectsList: () => void,
  toggleObjectGroupsList: () => void,
  toggleProperties: () => void,
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  deleteSelection: () => void,
  selectedInstancesCount: number,
  toggleInstancesList: () => void,
  toggleLayersList: () => void,
  toggleAllPanels: () => void,
  areAllPanelsShown: boolean,
  isWindowMaskShown: boolean,
  toggleWindowMask: () => void,
  isGridShown: boolean,
  toggleGrid: () => void,
  openSetupGrid: () => void,
  onOpenEvents?: ?() => void,
  openEventsTooltip?: MessageDescriptor,
  onOpenSettings?: ?() => void,
  settingsIcon?: React.Node,
  onOpenSceneVariables: () => void,
|};

const Toolbar: React.ComponentType<Props> = React.memo<Props>(function Toolbar(
  props
) {
  const shortcutMap = useShortcutMap();

  return (
    <>
      <ToolbarCommands
        addObject={props.onAddObject}
        canAddObject={props.canAddObject}
        toggleObjectsList={props.toggleObjectsList}
        toggleObjectGroupsList={props.toggleObjectGroupsList}
        togglePropertiesPanel={props.toggleProperties}
        toggleAllPanels={props.toggleAllPanels}
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
        onOpenSceneVariables={props.onOpenSceneVariables}
      />
      <ToolbarGroup lastChild>
        <IconButton
          size="small"
          color="default"
          id="toolbar-add-object-button"
          onClick={props.onAddObject}
          disabled={!props.canAddObject}
          tooltip={t`Add object`}
          acceleratorString={getShortcutDisplayName(shortcutMap['ADD_OBJECT'])}
        >
          <Add />
        </IconButton>
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
        <ToolbarSeparator />
        <IconButton
          size="small"
          color="default"
          id={TOGGLE_ALL_PANELS_BUTTON_ID}
          onClick={props.toggleAllPanels}
          selected={props.areAllPanelsShown}
          tooltip={
            props.areAllPanelsShown ? t`Hide all panels` : t`Show all panels`
          }
          acceleratorString={getShortcutDisplayName(
            shortcutMap['TOGGLE_ALL_PANELS']
          )}
        >
          <ShowAllPanelsIcon />
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
        {(props.onOpenEvents || props.onOpenSettings) && <ToolbarSeparator />}
        {props.onOpenEvents && (
          <IconButton
            size="small"
            color="default"
            onClick={props.onOpenEvents}
            tooltip={props.openEventsTooltip || t`Open scene events`}
            id="toolbar-open-scene-events-button"
          >
            <EventsIcon />
          </IconButton>
        )}
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
