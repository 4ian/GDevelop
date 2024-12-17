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
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';

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
  resourceManagementProps: ResourceManagementProps,
  layout?: ?gdLayout,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,
  lastSelectionType: 'instance' | 'object',

  // For objects:
  objects: Array<gdObject>,
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onUpdateBehaviorsSharedData: () => void,

  // For instances:
  instances: Array<gdInitialInstance>,
  editObjectInPropertiesPanel: (objectName: string) => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onGetInstanceSize: gdInitialInstance => [number, number, number],
  editInstanceVariables: gdInitialInstance => void,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,
|};

export type InstanceOrObjectPropertiesEditorInterface = {|
  forceUpdate: () => void,
  getEditorTitle: () => React.Node,
|};

export const InstanceOrObjectPropertiesEditorContainer = React.forwardRef<
  Props,
  InstanceOrObjectPropertiesEditorInterface
>((props, ref) => {
  const forceUpdate = useForceUpdate();
  React.useImperativeHandle(ref, () => ({
    forceUpdate,
    getEditorTitle: () =>
      lastSelectionType === 'instance' ? (
        <Trans>Instance properties</Trans>
      ) : (
        <Trans>Object properties</Trans>
      ),
  }));

  const {
    lastSelectionType,

    // For objects:
    objects,
    onEditObject,
    resourceManagementProps,
    eventsFunctionsExtension,
    onUpdateBehaviorsSharedData,

    // For instances:
    instances,
    editObjectInPropertiesPanel,
    onInstancesModified,
    onGetInstanceSize,
    editInstanceVariables,
    tileMapTileSelection,
    onSelectTileMapTile,
    ...commonProps
  } = props;

  return (
    <Paper background="dark" square style={styles.paper}>
      {!!instances.length && lastSelectionType === 'instance' ? (
        <CompactInstancePropertiesEditor
          instances={instances}
          editObjectInPropertiesPanel={editObjectInPropertiesPanel}
          onInstancesModified={onInstancesModified}
          onGetInstanceSize={onGetInstanceSize}
          editInstanceVariables={editInstanceVariables}
          tileMapTileSelection={tileMapTileSelection}
          onSelectTileMapTile={onSelectTileMapTile}
          {...commonProps}
        />
      ) : !!objects.length && lastSelectionType === 'object' ? (
        <CompactObjectPropertiesEditor
          objects={objects}
          onEditObject={onEditObject}
          resourceManagementProps={resourceManagementProps}
          eventsFunctionsExtension={eventsFunctionsExtension}
          onUpdateBehaviorsSharedData={onUpdateBehaviorsSharedData}
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
