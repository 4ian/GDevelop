// @flow

import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import EditorMosaic, {
  type EditorMosaicInterface,
} from '../../UI/EditorMosaic';
import InstancesEditor from '../../InstancesEditor';
import LayersList, { type LayersListInterface } from '../../LayersList';
import FullSizeInstancesEditorWithScrollbars from '../../InstancesEditor/FullSizeInstancesEditorWithScrollbars';
import CloseButton from '../../UI/EditorMosaic/CloseButton';
import ObjectsList, { type ObjectsListInterface } from '../../ObjectsList';
import ObjectGroupsList, {
  type ObjectGroupsListInterface,
} from '../../ObjectGroupsList';
import InstancesList, {
  type InstancesListInterface,
} from '../../InstancesEditor/InstancesList';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';

import Rectangle from '../../Utils/Rectangle';
import { type EditorId } from '..';
import {
  type SceneEditorsDisplayProps,
  type SceneEditorsDisplayInterface,
} from '../EditorsDisplay.flow';
import {
  InstanceOrObjectPropertiesEditorContainer,
  type InstanceOrObjectPropertiesEditorInterface,
} from '../../SceneEditor/InstanceOrObjectPropertiesEditorContainer';
import { useDoNowOrAfterRender } from '../../Utils/UseDoNowOrAfterRender';

const initialMosaicEditorNodes = {
  direction: 'row',
  first: 'properties',
  splitPercentage: 23,
  second: {
    direction: 'row',
    first: 'instances-editor',
    second: 'objects-list',
    splitPercentage: 77,
  },
};

const noop = () => {};

const defaultPanelConfigByEditor = {
  'objects-list': {
    position: 'end',
    splitPercentage: 75,
    direction: 'column',
  },
  properties: {
    position: 'start',
    splitPercentage: 25,
    direction: 'column',
  },
  'object-groups-list': {
    position: 'end',
    splitPercentage: 75,
    direction: 'column',
  },
  'instances-list': {
    position: 'end',
    splitPercentage: 75,
    direction: 'row',
  },
  'layers-list': {
    position: 'end',
    splitPercentage: 75,
    direction: 'row',
  },
};

// Forward ref to allow Scene editor to force update some editors
const MosaicEditorsDisplay = React.forwardRef<
  SceneEditorsDisplayProps,
  SceneEditorsDisplayInterface
>((props, ref) => {
  const {
    project,
    resourceManagementProps,
    layout,
    eventsFunctionsExtension,
    eventsBasedObject,
    updateBehaviorsSharedData,
    layersContainer,
    globalObjectsContainer,
    objectsContainer,
    projectScopedContainersAccessor,
    initialInstances,
    selectedLayer,
    onSelectInstances,
  } = props;
  const { isMobile } = useResponsiveWindowSize();
  const {
    getDefaultEditorMosaicNode,
    setDefaultEditorMosaicNode,
  } = React.useContext(PreferencesContext);
  const selectedInstances = props.instancesSelection.getSelectedInstances();

  const instanceOrObjectPropertiesEditorRef = React.useRef<?InstanceOrObjectPropertiesEditorInterface>(
    null
  );
  const layersListRef = React.useRef<?LayersListInterface>(null);
  const instancesListRef = React.useRef<?InstancesListInterface>(null);
  const editorRef = React.useRef<?InstancesEditor>(null);
  const objectsListRef = React.useRef<?ObjectsListInterface>(null);
  const editorMosaicRef = React.useRef<?EditorMosaicInterface>(null);
  const objectGroupsListRef = React.useRef<?ObjectGroupsListInterface>(null);
  const objectsListDoNowOrAfterRender = useDoNowOrAfterRender<?ObjectsListInterface>(
    objectsListRef
  );

  const forceUpdatePropertiesEditor = React.useCallback(() => {
    if (instanceOrObjectPropertiesEditorRef.current)
      instanceOrObjectPropertiesEditorRef.current.forceUpdate();
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
  const scrollObjectGroupsListToObjectGroup = React.useCallback(
    (objectGroup: gdObjectGroup) => {
      if (objectGroupsListRef.current)
        objectGroupsListRef.current.scrollToObjectGroup(objectGroup);
    },
    []
  );
  const forceUpdateLayersList = React.useCallback(() => {
    if (layersListRef.current) layersListRef.current.forceUpdate();
  }, []);
  const getInstanceSize = React.useCallback((instance: gdInitialInstance) => {
    if (!editorRef.current) return [0, 0, 0];

    return editorRef.current.getInstanceSize(instance);
  }, []);
  const toggleEditorView = React.useCallback((editorId: EditorId) => {
    if (!editorMosaicRef.current) return;
    const config = defaultPanelConfigByEditor[editorId];
    editorMosaicRef.current.toggleEditor(
      editorId,
      config.position,
      config.splitPercentage,
      config.direction
    );
  }, []);
  const isEditorVisible = React.useCallback((editorId: EditorId) => {
    if (!editorMosaicRef.current) return false;
    return editorMosaicRef.current.getOpenedEditorNames().includes(editorId);
  }, []);

  const startSceneRendering = React.useCallback((start: boolean) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (start) editor.restartSceneRendering();
    else editor.pauseSceneRendering();
  }, []);
  const openNewObjectDialog = React.useCallback(
    () => {
      if (!isEditorVisible('objects-list')) {
        // Objects list is not opened. Open it now.
        toggleEditorView('objects-list');
      }

      // Open the new object dialog when the objects list is opened.
      objectsListDoNowOrAfterRender((objectsList: ?ObjectsListInterface) => {
        if (objectsList) objectsList.openNewObjectDialog();
      });
    },
    [isEditorVisible, toggleEditorView, objectsListDoNowOrAfterRender]
  );

  React.useImperativeHandle(ref, () => {
    const { current: editor } = editorRef;
    return {
      getName: () => 'mosaic',
      forceUpdateInstancesList,
      forceUpdatePropertiesEditor,
      forceUpdateObjectsList,
      forceUpdateObjectGroupsList,
      scrollObjectGroupsListToObjectGroup,
      forceUpdateLayersList,
      openNewObjectDialog,
      toggleEditorView,
      isEditorVisible,
      startSceneRendering,
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
        getContentAABB: editor ? editor.getContentAABB : () => null,
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
      onSelectInstances(instances, multiSelect);
      forceUpdateInstancesList();
      forceUpdatePropertiesEditor();
    },
    [forceUpdateInstancesList, forceUpdatePropertiesEditor, onSelectInstances]
  );

  const selectedObjects = props.selectedObjectFolderOrObjectsWithContext
    .map(objectFolderOrObjectWithContext => {
      const { objectFolderOrObject } = objectFolderOrObjectWithContext;
      if (!objectFolderOrObject) return null; // Protect ourselves from an unexpected null value.
      if (objectFolderOrObject.isFolder()) return null;
      return objectFolderOrObject.getObject();
    })
    .filter(Boolean);

  const selectedObjectNames = selectedObjects.map(object => object.getName());

  const editors = {
    properties: {
      type: 'secondary',
      title: t`Properties`,
      renderEditor: () => (
        <I18n>
          {({ i18n }) => (
            <InstanceOrObjectPropertiesEditorContainer
              i18n={i18n}
              project={project}
              resourceManagementProps={resourceManagementProps}
              layout={layout}
              eventsFunctionsExtension={eventsFunctionsExtension}
              onUpdateBehaviorsSharedData={updateBehaviorsSharedData}
              objectsContainer={objectsContainer}
              globalObjectsContainer={globalObjectsContainer}
              layersContainer={layersContainer}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              instances={selectedInstances}
              objects={selectedObjects}
              editInstanceVariables={props.editInstanceVariables}
              editObjectInPropertiesPanel={props.editObjectInPropertiesPanel}
              onEditObject={props.onEditObject}
              onInstancesModified={forceUpdateInstancesList}
              onGetInstanceSize={getInstanceSize}
              ref={instanceOrObjectPropertiesEditorRef}
              unsavedChanges={props.unsavedChanges}
              historyHandler={props.historyHandler}
              tileMapTileSelection={props.tileMapTileSelection}
              onSelectTileMapTile={props.onSelectTileMapTile}
              lastSelectionType={props.lastSelectionType}
            />
          )}
        </I18n>
      ),
    },
    'layers-list': {
      type: 'secondary',
      title: t`Layers`,
      renderEditor: () => (
        <LayersList
          project={project}
          layout={layout}
          eventsFunctionsExtension={eventsFunctionsExtension}
          eventsBasedObject={eventsBasedObject}
          selectedLayer={selectedLayer}
          onSelectLayer={props.onSelectLayer}
          onEditLayerEffects={props.editLayerEffects}
          onEditLayer={props.editLayer}
          onRemoveLayer={props.onRemoveLayer}
          onLayerRenamed={props.onLayerRenamed}
          onCreateLayer={forceUpdatePropertiesEditor}
          layersContainer={layersContainer}
          unsavedChanges={props.unsavedChanges}
          ref={layersListRef}
          hotReloadPreviewButtonProps={props.hotReloadPreviewButtonProps}
        />
      ),
    },
    'instances-list': {
      type: 'secondary',
      title: t`Instances List`,
      renderEditor: () => (
        <InstancesList
          instances={initialInstances}
          selectedInstances={selectedInstances}
          onSelectInstances={selectInstances}
          ref={instancesListRef}
        />
      ),
    },
    'instances-editor': {
      type: 'primary',
      noTitleBar: true,
      noSoftKeyboardAvoidance: true,
      renderEditor: () => (
        <FullSizeInstancesEditorWithScrollbars
          project={project}
          layout={layout}
          eventsBasedObject={eventsBasedObject}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          layersContainer={layersContainer}
          selectedLayer={selectedLayer}
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
          wrappedEditorRef={editor => {
            editorRef.current = editor;
          }}
          pauseRendering={!props.isActive}
          tileMapTileSelection={props.tileMapTileSelection}
          onSelectTileMapTile={props.onSelectTileMapTile}
        />
      ),
    },
    'objects-list': {
      type: 'secondary',
      title: t`Objects`,
      toolbarControls: [<CloseButton key="close" />],
      renderEditor: () => (
        <I18n>
          {({ i18n }) => (
            <ObjectsList
              getThumbnail={ObjectsRenderingService.getThumbnail.bind(
                ObjectsRenderingService
              )}
              project={project}
              layout={layout}
              eventsBasedObject={eventsBasedObject}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              globalObjectsContainer={globalObjectsContainer}
              objectsContainer={objectsContainer}
              initialInstances={initialInstances}
              onSelectAllInstancesOfObjectInLayout={
                props.onSelectAllInstancesOfObjectInLayout
              }
              resourceManagementProps={props.resourceManagementProps}
              selectedObjectFolderOrObjectsWithContext={
                props.selectedObjectFolderOrObjectsWithContext
              }
              onEditObject={props.onEditObject}
              onOpenEventBasedObjectEditor={props.onOpenEventBasedObjectEditor}
              onExportAssets={props.onExportAssets}
              onDeleteObjects={(objectWithContext, cb) =>
                props.onDeleteObjects(i18n, objectWithContext, cb)
              }
              getValidatedObjectOrGroupName={(newName, global) =>
                props.getValidatedObjectOrGroupName(newName, global, i18n)
              }
              onObjectCreated={props.onObjectCreated}
              onObjectEdited={props.onObjectEdited}
              onObjectFolderOrObjectWithContextSelected={
                props.onObjectFolderOrObjectWithContextSelected
              }
              onRenameObjectFolderOrObjectWithContextFinish={
                props.onRenameObjectFolderOrObjectWithContextFinish
              }
              onAddObjectInstance={props.onAddObjectInstance}
              onObjectPasted={props.updateBehaviorsSharedData}
              beforeSetAsGlobalObject={objectName =>
                props.canObjectOrGroupBeGlobal(i18n, objectName)
              }
              ref={objectsListRef}
              unsavedChanges={props.unsavedChanges}
              hotReloadPreviewButtonProps={props.hotReloadPreviewButtonProps}
            />
          )}
        </I18n>
      ),
    },
    'object-groups-list': {
      type: 'secondary',
      title: t`Object Groups`,
      renderEditor: () => (
        <I18n>
          {({ i18n }) => (
            <ObjectGroupsList
              ref={objectGroupsListRef}
              globalObjectGroups={
                globalObjectsContainer &&
                globalObjectsContainer.getObjectGroups()
              }
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              objectGroups={objectsContainer.getObjectGroups()}
              onCreateGroup={props.onCreateObjectGroup}
              onEditGroup={props.onEditObjectGroup}
              onDeleteGroup={props.onDeleteObjectGroup}
              onRenameGroup={props.onRenameObjectGroup}
              getValidatedObjectOrGroupName={(newName, global) =>
                props.getValidatedObjectOrGroupName(newName, global, i18n)
              }
              beforeSetAsGlobalGroup={groupName =>
                props.canObjectOrGroupBeGlobal(i18n, groupName)
              }
              unsavedChanges={props.unsavedChanges}
            />
          )}
        </I18n>
      ),
    },
  };
  return (
    <EditorMosaic
      editors={editors}
      limitToOneSecondaryEditor={isMobile}
      initialNodes={
        getDefaultEditorMosaicNode('scene-editor') || initialMosaicEditorNodes
      }
      onOpenedEditorsChanged={props.onOpenedEditorsChanged}
      onPersistNodes={node => setDefaultEditorMosaicNode('scene-editor', node)}
      ref={editorMosaicRef}
    />
  );
});

export default MosaicEditorsDisplay;
