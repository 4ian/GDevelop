// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import Paper from '../UI/Paper';
import EmptyMessage from '../UI/EmptyMessage';
import useForceUpdate from '../Utils/UseForceUpdate';
import { CompactInstancePropertiesEditor } from '../InstancesEditor/CompactInstancePropertiesEditor';
import { Trans } from '@lingui/macro';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HistoryHandler } from '../VariablesList/VariablesList';
import { type TileMapTileSelection } from '../InstancesEditor/TileSetVisualizer';
import { CompactObjectPropertiesEditor } from '../ObjectEditor/CompactObjectPropertiesEditor';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';

export const styles = {
  paper: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
  },
};

type Props = {|
  project: gdProject,
  layout?: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,

  // For objects:
  objects: Array<gdObject>,
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,

  // For instances:
  instances: Array<gdInitialInstance>,
  onEditObjectByName: string => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onGetInstanceSize: gdInitialInstance => [number, number, number],
  editInstanceVariables: gdInitialInstance => void,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,
|};

export type InstanceOrObjectPropertiesEditorInterface = {|
  forceUpdate: () => void,
|};

export const InstanceOrObjectPropertiesEditorContainer = React.forwardRef<
  Props,
  InstanceOrObjectPropertiesEditorInterface
>((props, ref) => {
  const forceUpdate = useForceUpdate();
  React.useImperativeHandle(ref, () => ({
    forceUpdate,
  }));

  const {
    // For objects:
    objects,
    onEditObject,

    // For instances:
    instances,
    onEditObjectByName,
    onInstancesModified,
    onGetInstanceSize,
    editInstanceVariables,
    tileMapTileSelection,
    onSelectTileMapTile,
    ...commonProps
  } = props;

  return (
    <Paper background="dark" square style={styles.paper}>
      {!!instances.length ? (
        <CompactInstancePropertiesEditor
          instances={instances}
          onEditObjectByName={onEditObjectByName}
          onInstancesModified={onInstancesModified}
          onGetInstanceSize={onGetInstanceSize}
          editInstanceVariables={editInstanceVariables}
          tileMapTileSelection={tileMapTileSelection}
          onSelectTileMapTile={onSelectTileMapTile}
          {...commonProps}
        />
      ) : !!objects.length ? (
        <CompactObjectPropertiesEditor
          objects={objects}
          onEditObject={onEditObject}
          {...commonProps}
        />
      ) : (
        <EmptyMessage>
          <Trans>
            Click on an instance on the canvas or an object in the list to
            display their properties.
          </Trans>
        </EmptyMessage>
      )}
    </Paper>
  );
});
