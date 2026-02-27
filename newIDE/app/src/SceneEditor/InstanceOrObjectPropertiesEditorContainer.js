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
import { CompactLayerPropertiesEditor } from '../LayersList/CompactLayerPropertiesEditor';
import { CompactEventsBasedObjectVariantPropertiesEditor } from '../SceneEditor/CompactEventsBasedObjectVariantPropertiesEditor';
import Rectangle from '../Utils/Rectangle';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

const SCROLL_SAVE_DELAY = 500;

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
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  lastSelectionType: 'instance' | 'object' | 'layer',
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
    const {
      setEditorStateForProject,
      getEditorStateForProject,
    } = React.useContext(PreferencesContext);

    const {
      project,
      layersContainer,
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
    } = props;

    // $FlowFixMe[incompatible-type]
    React.useImperativeHandle(ref, () => ({
      forceUpdate,
      getEditorTitle: () =>
        lastSelectionType === 'instance' ? (
          <Trans>Instance properties</Trans>
        ) : (
          <Trans>Object properties</Trans>
        ),
    }));

    // Scroll position save/restore for properties panel.
    const scrollContainerRef = React.useRef<?HTMLDivElement>(null);
    const saveTimeoutRef = React.useRef<?TimeoutID>(null);

    const uniqueId =
      instances.length > 0 && lastSelectionType === 'instance'
        ? instances[0].getPersistentUuid()
        : objects.length > 0 && lastSelectionType === 'object'
        ? objects[0].getPersistentUuid()
        : null;
    const projectId = project.getProjectUuid();

    // Find the first scrollable child element (the ScrollView div).
    const findScrollableChild = React.useCallback(
      (container: ?HTMLDivElement): ?HTMLElement => {
        if (!container) return null;
        const children = container.getElementsByTagName('*');
        for (let i = 0; i < children.length; i++) {
          const el = children[i];
          if (
            el instanceof HTMLElement &&
            (el.style.overflowY === 'auto' || el.style.overflowY === 'scroll')
          ) {
            return el;
          }
        }
        return null;
      },
      []
    );

    // Set up scroll listener and restore scroll position when entity changes.
    React.useLayoutEffect(
      () => {
        if (!uniqueId) return;

        const scrollable = findScrollableChild(scrollContainerRef.current);
        if (!scrollable) return;

        // Restore saved scroll position.
        const editorState = getEditorStateForProject(projectId);
        const savedScroll =
          editorState &&
          editorState.propertiesPanelScroll &&
          editorState.propertiesPanelScroll[uniqueId];
        if (savedScroll != null) {
          scrollable.scrollTop = savedScroll;
        }

        // Save scroll position on scroll events.
        const handleScroll = () => {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => {
            const currentEditorState = getEditorStateForProject(projectId);
            const currentScrolls =
              (currentEditorState &&
                currentEditorState.propertiesPanelScroll) ||
              {};
            setEditorStateForProject(projectId, {
              propertiesPanelScroll: {
                ...currentScrolls,
                [uniqueId]: scrollable.scrollTop,
              },
            });
          }, SCROLL_SAVE_DELAY);
        };

        scrollable.addEventListener('scroll', handleScroll);
        return () => {
          scrollable.removeEventListener('scroll', handleScroll);
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [uniqueId]
    );

    return (
      <Paper background="dark" square style={styles.paper}>
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            flex: 1,
            minWidth: 0,
            flexDirection: 'column',
          }}
        >
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
            canOverrideBehaviorProperties={!!eventsFunctionsExtension}
          />
        ) : !!objects.length && lastSelectionType === 'object' ? (
          <CompactObjectPropertiesEditor
            objects={objects}
            onEditObject={onEditObject}
            onObjectsModified={onObjectsModified}
            onEffectAdded={onEffectAdded}
            resourceManagementProps={resourceManagementProps}
            eventsFunctionsExtension={eventsFunctionsExtension}
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
            layersContainer={layersContainer}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            unsavedChanges={unsavedChanges}
            i18n={i18n}
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
        ) : (
          <EmptyMessage>
            <Trans>
              Click on an instance on the canvas or an object in the list to
              display their properties.
            </Trans>
          </EmptyMessage>
        )}
        </div>
      </Paper>
    );
  }
);
