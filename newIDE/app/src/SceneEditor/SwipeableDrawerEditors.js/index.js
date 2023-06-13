// @flow

import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import InstancesEditor, {
  type InstancesEditorShortcutsCallbacks,
} from '../../InstancesEditor';
import InstancePropertiesEditor, {
  type InstancePropertiesEditorInterface,
} from '../../InstancesEditor/InstancePropertiesEditor';
import { type InstancesEditorSettings } from '../../InstancesEditor/InstancesEditorSettings';
import LayersList, { type LayersListInterface } from '../../LayersList';
import TagsButton from '../../UI/EditorMosaic/TagsButton';
import ObjectsList, { type ObjectsListInterface } from '../../ObjectsList';
import ObjectGroupsList from '../../ObjectGroupsList';
import InstancesSelection from '../../InstancesEditor/InstancesSelection';
import { type ObjectEditorTab } from '../../ObjectEditor/ObjectEditorDialog';
import InstancesList from '../../InstancesEditor/InstancesList';
import { type HistoryHandler } from '../../VariablesList/VariablesList';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../../HotReload/HotReloadPreviewButton';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';

import {
  getTagsFromString,
  buildTagsMenuTemplate,
  type SelectedTags,
} from '../../Utils/TagsHelper';
import {
  enumerateObjects,
  type GroupWithContext,
  type ObjectWithContext,
} from '../../ObjectsList/EnumerateObjects';
import Rectangle from '../../Utils/Rectangle';
import ViewPosition from '../../InstancesEditor/ViewPosition';
import { type EditorId } from '..';
import SwipeableDrawer from './SwipeableDrawer';
import BottomToolbar from './BottomToolbar';
import { FullSizeMeasurer } from '../../UI/FullSizeMeasurer';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useScreenType } from '../../UI/Reponsive/ScreenTypeMeasurer';
import Paper from '../../UI/Paper';

const editorTitleById = {
  'objects-list': <Trans>Objects</Trans>,
  properties: <Trans>Instance properties</Trans>,
  'object-groups-list': <Trans>Objects groups</Trans>,
  'instances-list': <Trans>Instances</Trans>,
  'layers-list': <Trans>Layers</Trans>,
};

const noop = () => {};

type Props = {|
  project: gdProject,
  layout: gdLayout,
  initialInstances: gdInitialInstancesContainer,
  instancesSelection: InstancesSelection,
  selectedLayer: string,
  onSelectInstances: (
    instances: Array<gdInitialInstance>,
    multiSelect: boolean
  ) => void,
  editInstanceVariables: (instance: ?gdInitialInstance) => void,
  editObjectByName: (objectName: string, initialTab?: ObjectEditorTab) => void,
  onEditObject: gdObject => void,
  selectedObjectNames: string[],
  renamedObjectWithContext: ?ObjectWithContext,
  onSelectLayer: (layerName: string) => void,
  editLayerEffects: (layer: ?gdLayer) => void,
  editLayer: (layer: ?gdLayer) => void,
  onRemoveLayer: (layerName: string, done: (boolean) => void) => void,
  onRenameLayer: (
    oldName: string,
    newName: string,
    done: (boolean) => void
  ) => void,
  onObjectCreated: gdObject => void,
  onObjectSelected: (?ObjectWithContext) => void,
  onExportObject: (object: ?gdObject) => void,
  onDeleteObject: (
    i18n: I18nType,
    objectWithContext: ObjectWithContext,
    cb: (boolean) => void
  ) => void,
  onAddObjectInstance: (objectName: string) => void,
  onRenameObjectStart: (?ObjectWithContext) => void,
  onRenameObjectFinish: (
    objectWithContext: ObjectWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  onEditObjectGroup: (?gdObjectGroup) => void,
  onDeleteObjectGroup: (
    groupWithContext: GroupWithContext,
    done: (boolean) => void
  ) => void,
  onRenameObjectGroup: (
    groupWithContext: GroupWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  canRenameObjectGroup: (
    newName: string,
    global: boolean,
    i18n: I18nType
  ) => boolean,
  canObjectOrGroupBeGlobal: (
    i18n: I18nType,
    objectOrGroupName: string
  ) => boolean,
  canObjectOrGroupUseNewName: (
    newName: string,
    global: boolean,
    i18n: I18nType
  ) => boolean,

  updateBehaviorsSharedData: () => void,
  onInstancesAdded: (Array<gdInitialInstance>) => void,
  onInstancesSelected: (Array<gdInitialInstance>) => void,
  onInstanceDoubleClicked: gdInitialInstance => void,
  onInstancesMoved: (Array<gdInitialInstance>) => void,
  onInstancesResized: (Array<gdInitialInstance>) => void,
  onInstancesRotated: (Array<gdInitialInstance>) => void,
  isInstanceOf3DObject: gdInitialInstance => boolean,
  onSelectAllInstancesOfObjectInLayout: string => void,

  canInstallPrivateAsset: () => boolean,

  instancesEditorSettings: InstancesEditorSettings,
  onInstancesEditorSettingsMutated: InstancesEditorSettings => void,

  historyHandler: HistoryHandler,
  unsavedChanges?: ?UnsavedChanges,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onContextMenu: (
    x: number,
    y: number,
    ignoreSelectedObjectsForContextMenu?: boolean
  ) => void,

  resourceManagementProps: ResourceManagementProps,
  isActive: boolean,
  instancesEditorShortcutsCallbacks: InstancesEditorShortcutsCallbacks,
  // Mosaic editor dedicated props
  onOpenedEditorsChanged: () => void,
|};

export type MosaicEditorsInterface = {|
  forceUpdateInstancesList: () => void,
  forceUpdateInstancesPropertiesEditor: () => void,
  forceUpdateObjectsList: () => void,
  forceUpdateObjectGroupsList: () => void,
  forceUpdateLayersList: () => void,
  openNewObjectDialog: () => void,
  toggleEditorView: (editorId: EditorId) => void,
  getOpenedEditorsNames: () => Array<string>,
  viewControls: {|
    zoomBy: (factor: number) => void,
    setZoomFactor: (factor: number) => void,
    zoomToInitialPosition: () => void,
    zoomToFitContent: () => void,
    zoomToFitSelection: (Array<gdInitialInstance>) => void,
    centerViewOnLastInstance: (Array<gdInitialInstance>) => void,
    getLastCursorSceneCoordinates: () => [number, number],
    getLastContextMenuSceneCoordinates: () => [number, number],
    getViewPosition: () => ?ViewPosition,
  |},
  instancesHandlers: {|
    getSelectionAABB: () => Rectangle,
    addInstances: (
      pos: [number, number],
      objectNames: Array<string>,
      layer: string
    ) => Array<gdInitialInstance>,
    clearHighlightedInstance: () => void,
    resetInstanceRenderersFor: (objectName: string) => void,
    forceRemountInstancesRenderers: () => void,
    addSerializedInstances: ({|
      position: [number, number],
      copyReferential: [number, number],
      serializedInstances: Array<Object>,
      preventSnapToGrid?: boolean,
      addInstancesInTheForeground?: boolean,
    |}) => Array<gdInitialInstance>,
  |},
|};

// Forward ref to allow Scene editor to force update some editors
const SwipeableDrawerEditors = React.forwardRef<Props, MosaicEditorsInterface>(
  (props, ref) => {
    const {
      project,
      layout,
      initialInstances,
      selectedLayer,
      onSelectInstances,
    } = props;
    const selectedInstances = props.instancesSelection.getSelectedInstances();
    const [
      selectedObjectTags,
      setSelectedObjectTags,
    ] = React.useState<SelectedTags>([]);
    const { values } = React.useContext(PreferencesContext);
    const screenType = useScreenType();

    const instancesPropertiesEditorRef = React.useRef<?InstancePropertiesEditorInterface>(
      null
    );
    const layersListRef = React.useRef<?LayersListInterface>(null);
    const instancesListRef = React.useRef<?InstancesList>(null);
    const editorRef = React.useRef<?InstancesEditor>(null);
    const objectsListRef = React.useRef<?ObjectsListInterface>(null);
    const objectGroupsListRef = React.useRef<?ObjectGroupsList>(null);

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
      if (objectGroupsListRef.current)
        objectGroupsListRef.current.forceUpdate();
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
    const toggleEditorView = React.useCallback((editorId: EditorId) => {}, []);
    const getOpenedEditorsNames = React.useCallback(() => {
      return [];
    }, []);
    const [drawerOpeningState, setDrawerOpeningState] = React.useState<
      'closed' | 'half-opened' | 'opened'
    >('closed');

    React.useImperativeHandle(ref, () => {
      const { current: editor } = editorRef;

      return {
        forceUpdateInstancesList,
        forceUpdateInstancesPropertiesEditor,
        forceUpdateObjectsList,
        forceUpdateObjectGroupsList,
        forceUpdateLayersList,
        openNewObjectDialog,
        toggleEditorView,
        getOpenedEditorsNames,
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
        onSelectInstances(instances, multiSelect);
        forceUpdateInstancesList();
        forceUpdateInstancesPropertiesEditor();
      },
      [
        forceUpdateInstancesList,
        forceUpdateInstancesPropertiesEditor,
        onSelectInstances,
      ]
    );

    const getAllObjectTags = React.useCallback(
      (): Array<string> => {
        const tagsSet: Set<string> = new Set();
        enumerateObjects(project, layout).allObjectsList.forEach(
          ({ object }) => {
            getTagsFromString(object.getTags()).forEach(tag =>
              tagsSet.add(tag)
            );
          }
        );

        return Array.from(tagsSet);
      },
      [project, layout]
    );

    const buildObjectTagsMenuTemplate = React.useCallback(
      (i18n: I18nType): Array<any> => {
        return buildTagsMenuTemplate({
          noTagLabel: i18n._(t`No tags - add a tag to an object first`),
          getAllTags: getAllObjectTags,
          selectedTags: selectedObjectTags,
          onChange: setSelectedObjectTags,
        });
      },
      [selectedObjectTags, getAllObjectTags]
    );
    const [selectedEditorId, setSelectedEditorId] = React.useState<
      | null
      | 'objects-list'
      | 'properties'
      | 'object-groups-list'
      | 'instances-list'
      | 'layers-list'
    >(null);

    return (
      <FullSizeMeasurer>
        {({ width, height }) => (
          <div style={{ width: '100%' }}>
            <InstancesEditor
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
              selectedObjectNames={props.selectedObjectNames}
              onContextMenu={props.onContextMenu}
              isInstanceOf3DObject={props.isInstanceOf3DObject}
              instancesEditorShortcutsCallbacks={
                props.instancesEditorShortcutsCallbacks
              }
              pauseRendering={!props.isActive}
              showObjectInstancesIn3D={values.showObjectInstancesIn3D}
            />
            <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
              <SwipeableDrawer
                maxHeight={height}
                title={
                  selectedEditorId ? editorTitleById[selectedEditorId] : null
                }
                openingState={drawerOpeningState}
                setOpeningState={setDrawerOpeningState}
                topBarControls={
                  selectedEditorId === 'objects-list'
                    ? [
                        <TagsButton
                          key="tags"
                          size="small"
                          buildMenuTemplate={buildObjectTagsMenuTemplate}
                        />,
                      ]
                    : null
                }
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
                        onSelectAllInstancesOfObjectInLayout={
                          props.onSelectAllInstancesOfObjectInLayout
                        }
                        resourceManagementProps={props.resourceManagementProps}
                        selectedObjectNames={props.selectedObjectNames}
                        canInstallPrivateAsset={props.canInstallPrivateAsset}
                        onEditObject={props.onEditObject}
                        onExportObject={props.onExportObject}
                        onDeleteObject={(objectWithContext, cb) =>
                          props.onDeleteObject(i18n, objectWithContext, cb)
                        }
                        canRenameObject={(newName, global) =>
                          props.canObjectOrGroupUseNewName(
                            newName,
                            global,
                            i18n
                          )
                        }
                        onObjectCreated={props.onObjectCreated}
                        onObjectSelected={props.onObjectSelected}
                        renamedObjectWithContext={
                          props.renamedObjectWithContext
                        }
                        onRenameObjectStart={props.onRenameObjectStart}
                        onRenameObjectFinish={props.onRenameObjectFinish}
                        onAddObjectInstance={props.onAddObjectInstance}
                        onObjectPasted={props.updateBehaviorsSharedData}
                        selectedObjectTags={selectedObjectTags}
                        beforeSetAsGlobalObject={objectName =>
                          props.canObjectOrGroupBeGlobal(i18n, objectName)
                        }
                        onChangeSelectedObjectTags={setSelectedObjectTags}
                        getAllObjectTags={getAllObjectTags}
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
                      <InstancePropertiesEditor
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
                        canRenameGroup={(newName, global) =>
                          props.canRenameObjectGroup(newName, global, i18n)
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
                    style={{ display: 'flex', flex: 1 }}
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
                    onRenameLayer={props.onRenameLayer}
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
                selectEditor={editorId => {
                  if (selectedEditorId === editorId) {
                    if (drawerOpeningState === 'closed') {
                      setDrawerOpeningState('half-opened');
                    } else {
                      setDrawerOpeningState('closed');
                    }
                  } else {
                    setSelectedEditorId(editorId || null);
                    setDrawerOpeningState('half-opened');
                  }
                }}
              />
            </div>
          </div>
        )}
      </FullSizeMeasurer>
    );
  }
);

export default SwipeableDrawerEditors;
