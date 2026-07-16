// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import Paper from '../UI/Paper';
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
import { CompactLayerPropertiesEditor } from '../LayersList/CompactLayerPropertiesEditor';
import { CompactEventsBasedObjectVariantPropertiesEditor } from '../SceneEditor/CompactEventsBasedObjectVariantPropertiesEditor';
import { CompactScenePropertiesEditor } from './CompactScenePropertiesEditor';
import Rectangle from '../Utils/Rectangle';
import { type LastSelectionType } from './EditorsDisplay.flow';
import { CompactObjectGroupPropertiesEditor } from '../ObjectGroupEditor/CompactObjectGroupPropertiesEditor';
import { type ObjectGroupEditorTab } from '../ObjectGroupEditor/EditedObjectGroupEditorDialog';

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
  initialInstances: gdInitialInstancesContainer,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  lastSelectionType: LastSelectionType,
  historyHandler?: HistoryHandler,
  isVariableListLocked: boolean,
  layout?: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,

  // For objects:
  objects: Array<gdObject>,
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onObjectsModified: (objects: Array<gdObject>) => void,
  onEffectAdded: () => void,
  onUpdateBehaviorsSharedData: () => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onDeleteEventsBasedObjectVariant: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
  isBehaviorListLocked: boolean,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,

  // For instances:
  instances: Array<gdInitialInstance>,
  editObjectInPropertiesPanel: (objectName: string) => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onGetInstanceSize: gdInitialInstance => [number, number, number],
  editInstanceVariables: gdInitialInstance => void,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,

  // For layers:
  layer: gdLayer | null,
  onEditLayer: (layer: gdLayer) => void,
  onEditLayerEffects: (layer: gdLayer) => void,
  onLayersModified: (layers: Array<gdLayer>) => void,

  // For event-based object variants:
  eventsBasedObject: gdEventsBasedObject | null,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant | null,
  getContentAABB: () => Rectangle | null,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,

  // For scenes
  onBackgroundColorChanged: () => void,
  onRenderer3DWorldScaleFieldChanged: () => void,
  openSceneVariables: () => void,

  // For object groups
  objectGroup: gdObjectGroup | null,
  isObjectGroupObjectListLocked: boolean,
  onEditObjectGroup: (
    objectGroup: gdObjectGroup,
    initialTab: ?ObjectGroupEditorTab
  ) => void,
|};

export type InstanceOrObjectPropertiesEditorInterface = {|
  forceUpdate: () => void,
  getEditorTitle: () => React.Node,
|};

export const InstanceOrObjectPropertiesEditorContainer: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<InstanceOrObjectPropertiesEditorInterface>,
}> = React.forwardRef<Props, InstanceOrObjectPropertiesEditorInterface>(
  (props, ref) => {
    const forceUpdate = useForceUpdate();
    React.useImperativeHandle<InstanceOrObjectPropertiesEditorInterface>(
      ref,
      () => ({
        forceUpdate,
        getEditorTitle: () =>
          lastSelectionType === 'instance' ? (
            <Trans>Instance properties</Trans>
          ) : lastSelectionType === 'object' ? (
            <Trans>Object properties</Trans>
          ) : lastSelectionType === 'layer' ? (
            <Trans>Layer properties</Trans>
          ) : lastSelectionType === 'objectGroup' ? (
            <Trans>Object group properties</Trans>
          ) : (
            <Trans>Scene properties</Trans>
          ),
      })
    );

    const {
      project,
      layersContainer,
      initialInstances,
      projectScopedContainersAccessor,
      unsavedChanges,
      i18n,
      lastSelectionType,

      // For objects:
      objects,
      onEditObject,
      onObjectsModified,
      onEffectAdded,
      resourceManagementProps,
      eventsFunctionsExtension,
      onUpdateBehaviorsSharedData,
      onWillInstallExtension,
      onExtensionInstalled,
      onOpenEventBasedObjectVariantEditor,
      onDeleteEventsBasedObjectVariant,
      isBehaviorListLocked,

      // For instances:
      instances,
      editObjectInPropertiesPanel,
      onInstancesModified,
      onGetInstanceSize,
      editInstanceVariables,
      tileMapTileSelection,
      onSelectTileMapTile,

      // For layers
      layer,
      onEditLayer,
      onEditLayerEffects,
      onLayersModified,

      // For event-based object variants
      eventsBasedObject,
      eventsBasedObjectVariant,
      getContentAABB,
      onEventsBasedObjectChildrenEdited,

      // For objects or instances:
      historyHandler,
      isVariableListLocked,
      layout,
      objectsContainer,
      globalObjectsContainer,

      // For scenes
      onBackgroundColorChanged,
      onRenderer3DWorldScaleFieldChanged,
      openSceneVariables,

      // For object groups
      objectGroup,
      isObjectGroupObjectListLocked,
      onEditObjectGroup,
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
            historyHandler={historyHandler}
            layout={layout}
            objectsContainer={objectsContainer}
            globalObjectsContainer={globalObjectsContainer}
            layersContainer={layersContainer}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            resourceManagementProps={resourceManagementProps}
            unsavedChanges={unsavedChanges}
            i18n={i18n}
          />
        ) : !!objects.length && lastSelectionType === 'object' ? (
          <CompactObjectPropertiesEditor
            objects={objects}
            onEditObject={onEditObject}
            onObjectsModified={onObjectsModified}
            onEffectAdded={onEffectAdded}
            resourceManagementProps={resourceManagementProps}
            eventsFunctionsExtension={eventsFunctionsExtension}
            // This EventsBasedObject is used to refactor variables in all
            // variants when editing the default variant.
            eventsBasedObject={
              eventsBasedObject &&
              eventsBasedObject.getDefaultVariant() === eventsBasedObjectVariant
                ? eventsBasedObject
                : null
            }
            onUpdateBehaviorsSharedData={onUpdateBehaviorsSharedData}
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
            isBehaviorListLocked={isBehaviorListLocked}
            onOpenEventBasedObjectVariantEditor={
              onOpenEventBasedObjectVariantEditor
            }
            onDeleteEventsBasedObjectVariant={onDeleteEventsBasedObjectVariant}
            historyHandler={historyHandler}
            isVariableListLocked={isVariableListLocked}
            layout={layout}
            objectsContainer={objectsContainer}
            globalObjectsContainer={globalObjectsContainer}
            initialInstances={initialInstances}
            layersContainer={layersContainer}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            unsavedChanges={unsavedChanges}
            i18n={i18n}
          />
        ) : objectGroup && lastSelectionType === 'objectGroup' ? (
          <CompactObjectGroupPropertiesEditor
            project={project}
            resourceManagementProps={resourceManagementProps}
            layout={layout}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedObject={eventsBasedObject}
            objectsContainer={objectsContainer}
            globalObjectsContainer={globalObjectsContainer}
            initialInstances={initialInstances}
            layersContainer={layersContainer}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            unsavedChanges={unsavedChanges}
            historyHandler={historyHandler}
            objectGroup={objectGroup}
            isObjectListLocked={isObjectGroupObjectListLocked}
            isBehaviorListLocked={isBehaviorListLocked}
            isVariableListLocked={isVariableListLocked}
            onEditObjectGroup={onEditObjectGroup}
            onUpdateBehaviorsSharedData={onUpdateBehaviorsSharedData}
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
          />
        ) : layer && lastSelectionType === 'layer' ? (
          <CompactLayerPropertiesEditor
            layer={layer}
            onEditLayer={onEditLayer}
            onEditLayerEffects={onEditLayerEffects}
            onLayersModified={onLayersModified}
            onEffectAdded={onEffectAdded}
            resourceManagementProps={resourceManagementProps}
            layersContainer={layersContainer}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            unsavedChanges={unsavedChanges}
            i18n={i18n}
          />
        ) : eventsBasedObject && eventsBasedObjectVariant ? (
          <CompactEventsBasedObjectVariantPropertiesEditor
            eventsBasedObject={eventsBasedObject}
            eventsBasedObjectVariant={eventsBasedObjectVariant}
            getContentAABB={getContentAABB}
            onEventsBasedObjectChildrenEdited={() =>
              onEventsBasedObjectChildrenEdited(eventsBasedObject)
            }
            unsavedChanges={unsavedChanges}
            i18n={i18n}
          />
        ) : layout ? (
          <CompactScenePropertiesEditor
            scene={layout}
            resourceManagementProps={resourceManagementProps}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            unsavedChanges={unsavedChanges}
            i18n={i18n}
            onBackgroundColorChanged={onBackgroundColorChanged}
            onRenderer3DWorldScaleFieldChanged={
              onRenderer3DWorldScaleFieldChanged
            }
            openSceneVariables={openSceneVariables}
          />
        ) : null}
      </Paper>
    );
  }
);
