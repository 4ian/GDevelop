// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import InstancesEditor from '../../InstancesEditor';
import LayersList, { type LayersListInterface } from '../../LayersList';
import ObjectsList, { type ObjectsListInterface } from '../../ObjectsList';
import ObjectGroupsList, {
  type ObjectGroupsListInterface,
} from '../../ObjectGroupsList';
import InstancesList, {
  type InstancesListInterface,
} from '../../InstancesEditor/InstancesList';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';

import Rectangle from '../../Utils/Rectangle';
import SwipeableDrawer from './SwipeableDrawer';
import BottomToolbar from './BottomToolbar';
import { FullSizeMeasurer } from '../../UI/FullSizeMeasurer';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useScreenType } from '../../UI/Responsive/ScreenTypeMeasurer';
import Paper from '../../UI/Paper';
import { type EditorId } from '..';
import {
  type SceneEditorsDisplayInterface,
  type SceneEditorsDisplayProps,
} from '../EditorsDisplay.flow';
import ErrorBoundary from '../../UI/ErrorBoundary';
import CompactInstancePropertiesEditorContainer, {
  type CompactInstancePropertiesEditorInterface,
} from '../../InstancesEditor/CompactInstancePropertiesEditor';

export const swipeableDrawerContainerId = 'swipeable-drawer-container';

const editorTitleById = {
  'objects-list': <Trans>Objects</Trans>,
  properties: <Trans>Instance properties</Trans>,
  'object-groups-list': <Trans>Objects groups</Trans>,
  'instances-list': <Trans>Instances</Trans>,
  'layers-list': <Trans>Layers</Trans>,
};

const noop = () => {};

const styles = {
  container: { width: '100%' },
  bottomContainer: { position: 'absolute', bottom: 0, width: '100%' },
  instancesListContainer: { display: 'flex', flex: 1 },
};

// Forward ref to allow Scene editor to force update some editors
const SwipeableDrawerEditorsDisplay = React.forwardRef<
  SceneEditorsDisplayProps,
  SceneEditorsDisplayInterface
>((props, ref) => {
  const {
    project,
    layout,
    initialInstances,
    selectedLayer,
    onSelectInstances,
  } = props;
  const selectedInstances = props.instancesSelection.getSelectedInstances();
  const { values } = React.useContext(PreferencesContext);
  const screenType = useScreenType();

  const instancesPropertiesEditorRef = React.useRef<?CompactInstancePropertiesEditorInterface>(
    null
  );
  const layersListRef = React.useRef<?LayersListInterface>(null);
  const instancesListRef = React.useRef<?InstancesListInterface>(null);
  const editorRef = React.useRef<?InstancesEditor>(null);
  const objectsListRef = React.useRef<?ObjectsListInterface>(null);
  const objectGroupsListRef = React.useRef<?ObjectGroupsListInterface>(null);

  const [selectedEditorId, setSelectedEditorId] = React.useState<?EditorId>(
    null
  );

  const [drawerOpeningState, setDrawerOpeningState] = React.useState<
    'closed' | 'halfOpen' | 'open'
  >('closed');

  const halfOpenOrCloseDrawerOnEditor = React.useCallback(
    (editorId: ?EditorId) => {
      if (selectedEditorId === editorId) {
        if (drawerOpeningState === 'closed') {
          setDrawerOpeningState('halfOpen');
        } else {
          setDrawerOpeningState('closed');
        }
      } else {
        setSelectedEditorId(editorId || null);
        if (drawerOpeningState === 'closed') setDrawerOpeningState('halfOpen');
      }
    },
    [selectedEditorId, drawerOpeningState]
  );

  const forceUpdateInstancesPropertiesEditor = React.useCallback(() => {
    if (instancesPropertiesEditorRef.current)
      instancesPropertiesEditorRef.current.forceUpdate();
  }, []);
  const forceUpdateInstancesList = React.useCallback(() => {
    if (instancesListRef.current) instancesListRef.current.forceUpdate();
  }, []);
  const forceUpdateObjectsList = React.useCallback(() => {
    if (objectsListRef.current) objectsListRef.current.forceUpdateList();
  }, []);
  const forceUpdateObjectGroupsList = React.useCallback(() => {
    if (objectGroupsListRef.current) objectGroupsListRef.current.forceUpdate();
  }, []);
  const forceUpdateLayersList = React.useCallback(() => {
    if (layersListRef.current) layersListRef.current.forceUpdate();
  }, []);
  const getInstanceSize = React.useCallback((instance: gdInitialInstance) => {
    if (!editorRef.current) return [0, 0, 0];

    return editorRef.current.getInstanceSize(instance);
  }, []);
  const openNewObjectDialog = React.useCallback(() => {
    if (!objectsListRef.current) return;

    objectsListRef.current.openNewObjectDialog();
  }, []);
  const isEditorVisible = React.useCallback(
    (editorId: EditorId) => {
      return editorId === selectedEditorId && drawerOpeningState !== 'closed';
    },
    [selectedEditorId, drawerOpeningState]
  );
  const renameObjectFolderOrObjectWithContext = React.useCallback(
    objectWithContext => {
      if (objectsListRef.current)
        objectsListRef.current.renameObjectFolderOrObjectWithContext(
          objectWithContext
        );
    },
    []
  );

  const startSceneRendering = React.useCallback((start: boolean) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (start) editor.restartSceneRendering();
    else editor.pauseSceneRendering();
  }, []);

  React.useImperativeHandle(ref, () => {
    const { current: editor } = editorRef;

    return {
      getName: () => 'swipeableDrawer',
      forceUpdateInstancesList,
      forceUpdateInstancesPropertiesEditor,
      forceUpdateObjectsList,
      forceUpdateObjectGroupsList,
      forceUpdateLayersList,
      openNewObjectDialog,
      toggleEditorView: halfOpenOrCloseDrawerOnEditor,
      isEditorVisible,
      startSceneRendering,
      renameObjectFolderOrObjectWithContext,
      viewControls: {
        zoomBy: editor ? editor.zoomBy : noop,
        setZoomFactor: editor ? editor.setZoomFactor : noop,
        zoomToInitialPosition: editor ? editor.zoomToInitialPosition : noop,
        zoomToFitContent: editor ? editor.zoomToFitContent : noop,
        zoomToFitSelection: editor ? editor.zoomToFitSelection : noop,
        centerViewOnLastInstance: editor
          ? editor.centerViewOnLastInstance
          : noop,
        getLastCursorSceneCoordinates: editor
          ? editor.getLastCursorSceneCoordinates
          : () => [0, 0],
        getLastContextMenuSceneCoordinates: editor
          ? editor.getLastContextMenuSceneCoordinates
          : () => [0, 0],
        getViewPosition: editor ? editor.getViewPosition : noop,
      },
      instancesHandlers: {
        getSelectionAABB: editor
          ? editor.selectedInstances.getSelectionAABB
          : () => new Rectangle(),
        addInstances: editor ? editor.addInstances : () => [],
        clearHighlightedInstance: editor
          ? editor.clearHighlightedInstance
          : noop,
        resetInstanceRenderersFor: editor
          ? editor.resetInstanceRenderersFor
          : noop,
        forceRemountInstancesRenderers: editor ? editor.forceRemount : noop,
        addSerializedInstances: editor
          ? editor.addSerializedInstances
          : () => [],
      },
    };
  });

  const selectInstances = React.useCallback(
    (instances: Array<gdInitialInstance>, multiSelect: boolean) => {
      onSelectInstances(instances, multiSelect, 'upperCenter');
      forceUpdateInstancesList();
      forceUpdateInstancesPropertiesEditor();
    },
    [
      forceUpdateInstancesList,
      forceUpdateInstancesPropertiesEditor,
      onSelectInstances,
    ]
  );

  const selectedObjectNames = props.selectedObjectFolderOrObjectsWithContext
    .map(objectFolderOrObjectWithContext => {
      const { objectFolderOrObject } = objectFolderOrObjectWithContext;

      if (!objectFolderOrObject) return null; // Protect ourselves from an unexpected null value.

      if (objectFolderOrObject.isFolder()) return null;
      return objectFolderOrObject.getObject().getName();
    })
    .filter(Boolean);

  return (
    <FullSizeMeasurer>
      {({ width, height }) => (
        <div style={styles.container}>
          <ErrorBoundary
            componentTitle={<Trans>Instances editor.</Trans>}
            scope="scene-editor-canvas"
          >
            <InstancesEditor
              ref={editorRef}
              height={height}
              width={width}
              project={project}
              layout={layout}
              selectedLayer={selectedLayer}
              screenType={screenType}
              initialInstances={initialInstances}
              instancesEditorSettings={props.instancesEditorSettings}
              onInstancesEditorSettingsMutated={
                props.onInstancesEditorSettingsMutated
              }
              instancesSelection={props.instancesSelection}
              onInstancesAdded={props.onInstancesAdded}
              onInstancesSelected={props.onInstancesSelected}
              onInstanceDoubleClicked={props.onInstanceDoubleClicked}
              onInstancesMoved={props.onInstancesMoved}
              onInstancesResized={props.onInstancesResized}
              onInstancesRotated={props.onInstancesRotated}
              selectedObjectNames={selectedObjectNames}
              onContextMenu={props.onContextMenu}
              isInstanceOf3DObject={props.isInstanceOf3DObject}
              instancesEditorShortcutsCallbacks={
                props.instancesEditorShortcutsCallbacks
              }
              pauseRendering={!props.isActive}
              showObjectInstancesIn3D={values.use3DEditor}
            />
          </ErrorBoundary>
          <div style={styles.bottomContainer} id={swipeableDrawerContainerId}>
            <SwipeableDrawer
              maxHeight={height}
              title={
                selectedEditorId ? editorTitleById[selectedEditorId] : null
              }
              openingState={drawerOpeningState}
              setOpeningState={setDrawerOpeningState}
            >
              {selectedEditorId === 'objects-list' && (
                <I18n>
                  {({ i18n }) => (
                    <ObjectsList
                      getThumbnail={ObjectsRenderingService.getThumbnail.bind(
                        ObjectsRenderingService
                      )}
                      project={project}
                      objectsContainer={layout}
                      layout={layout}
                      initialInstances={initialInstances}
                      onSelectAllInstancesOfObjectInLayout={
                        props.onSelectAllInstancesOfObjectInLayout
                      }
                      resourceManagementProps={props.resourceManagementProps}
                      selectedObjectFolderOrObjectsWithContext={
                        props.selectedObjectFolderOrObjectsWithContext
                      }
                      canInstallPrivateAsset={props.canInstallPrivateAsset}
                      onEditObject={props.onEditObject}
                      onExportAssets={props.onExportAssets}
                      onDeleteObjects={(objectWithContext, cb) =>
                        props.onDeleteObjects(i18n, objectWithContext, cb)
                      }
                      getValidatedObjectOrGroupName={(newName, global) =>
                        props.getValidatedObjectOrGroupName(
                          newName,
                          global,
                          i18n
                        )
                      }
                      onObjectCreated={props.onObjectCreated}
                      onObjectFolderOrObjectWithContextSelected={
                        props.onObjectFolderOrObjectWithContextSelected
                      }
                      onRenameObjectFolderOrObjectWithContextFinish={
                        props.onRenameObjectFolderOrObjectWithContextFinish
                      }
                      onAddObjectInstance={objectName =>
                        props.onAddObjectInstance(objectName, 'upperCenter')
                      }
                      onObjectPasted={props.updateBehaviorsSharedData}
                      beforeSetAsGlobalObject={objectName =>
                        props.canObjectOrGroupBeGlobal(i18n, objectName)
                      }
                      ref={objectsListRef}
                      unsavedChanges={props.unsavedChanges}
                      hotReloadPreviewButtonProps={
                        props.hotReloadPreviewButtonProps
                      }
                    />
                  )}
                </I18n>
              )}
              {selectedEditorId === 'properties' && (
                <I18n>
                  {({ i18n }) => (
                    <CompactInstancePropertiesEditorContainer
                      i18n={i18n}
                      project={project}
                      layout={layout}
                      instances={selectedInstances}
                      editInstanceVariables={props.editInstanceVariables}
                      onEditObjectByName={props.editObjectByName}
                      onInstancesModified={forceUpdateInstancesList}
                      onGetInstanceSize={getInstanceSize}
                      ref={instancesPropertiesEditorRef}
                      unsavedChanges={props.unsavedChanges}
                      historyHandler={props.historyHandler}
                    />
                  )}
                </I18n>
              )}
              {selectedEditorId === 'object-groups-list' && (
                <I18n>
                  {({ i18n }) => (
                    <ObjectGroupsList
                      ref={objectGroupsListRef}
                      globalObjectGroups={project.getObjectGroups()}
                      objectGroups={layout.getObjectGroups()}
                      onEditGroup={props.onEditObjectGroup}
                      onDeleteGroup={props.onDeleteObjectGroup}
                      onRenameGroup={props.onRenameObjectGroup}
                      getValidatedObjectOrGroupName={(newName, global) =>
                        props.getValidatedObjectOrGroupName(
                          newName,
                          global,
                          i18n
                        )
                      }
                      beforeSetAsGlobalGroup={groupName =>
                        props.canObjectOrGroupBeGlobal(i18n, groupName)
                      }
                      unsavedChanges={props.unsavedChanges}
                    />
                  )}
                </I18n>
              )}
              {selectedEditorId === 'instances-list' && (
                <Paper
                  background="medium"
                  square
                  style={styles.instancesListContainer}
                >
                  <InstancesList
                    instances={initialInstances}
                    selectedInstances={selectedInstances}
                    onSelectInstances={selectInstances}
                    ref={instancesListRef}
                  />
                </Paper>
              )}
              {selectedEditorId === 'layers-list' && (
                <LayersList
                  project={project}
                  selectedLayer={selectedLayer}
                  onSelectLayer={props.onSelectLayer}
                  onEditLayerEffects={props.editLayerEffects}
                  onEditLayer={props.editLayer}
                  onRemoveLayer={props.onRemoveLayer}
                  onLayerRenamed={props.onLayerRenamed}
                  onCreateLayer={forceUpdateInstancesPropertiesEditor}
                  layersContainer={layout}
                  unsavedChanges={props.unsavedChanges}
                  ref={layersListRef}
                  hotReloadPreviewButtonProps={
                    props.hotReloadPreviewButtonProps
                  }
                />
              )}
            </SwipeableDrawer>
            <BottomToolbar
              selectedEditorId={
                drawerOpeningState === 'closed' ? null : selectedEditorId
              }
              onSelectEditor={halfOpenOrCloseDrawerOnEditor}
            />
          </div>
        </div>
      )}
    </FullSizeMeasurer>
  );
});

export default SwipeableDrawerEditorsDisplay;
