// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapReverseFor } from '../Utils/MapFor';
import LayerRow, { styles } from './LayerRow';
import BackgroundColorRow from './BackgroundColorRow';
import { Column } from '../UI/Grid';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import ScrollView from '../UI/ScrollView';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import useForceUpdate from '../Utils/UseForceUpdate';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Add from '../UI/CustomSvgIcons/Add';
import { addDefaultLightToLayer } from '../ProjectCreation/CreateProject';
import { getEffects2DCount, getEffects3DCount } from '../EffectsList';
import ErrorBoundary from '../UI/ErrorBoundary';
import IconButton from '../UI/IconButton';
import LightbulbIcon from '../UI/CustomSvgIcons/Lightbulb';
import { LineStackLayout } from '../UI/Layout';

const gd: libGDevelop = global.gd;

const DropTarget = makeDropTarget('layers-list');

type LayersListBodyProps = {|
  project: gdProject,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  layersContainer: gdLayersContainer,
  selectedLayer: string,
  onSelectLayer: string => void,
  unsavedChanges?: ?UnsavedChanges,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onLayerRenamed: () => void,
  onEditLayerEffects: (layer: ?gdLayer) => void,
  onEdit: (layer: ?gdLayer) => void,
  onLayersModified: () => void,
  onBackgroundColorChanged: () => void,
  width: number,
|};

const getEffectsCount = (platform: gdPlatform, layer: gdLayer) => {
  const effectsContainer = layer.getEffects();
  return layer.getRenderingType() === '2d'
    ? getEffects2DCount(platform, effectsContainer)
    : layer.getRenderingType() === '3d'
    ? getEffects3DCount(platform, effectsContainer)
    : effectsContainer.getEffectsCount();
};

const LayersListBody = ({
  project,
  layout,
  eventsFunctionsExtension,
  eventsBasedObject,
  layersContainer,
  onEditLayerEffects,
  onEdit,
  width,
  onLayerRenamed,
  onRemoveLayer,
  unsavedChanges,
  selectedLayer,
  onSelectLayer,
  onLayersModified,
  onBackgroundColorChanged,
}: LayersListBodyProps) => {
  const forceUpdate = useForceUpdate();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [nameErrors, setNameErrors] = React.useState<{
    [key: string]: React.Node,
  }>({});
  const draggedLayerIndexRef = React.useRef<number | null>(null);

  const triggerOnLayersModified = React.useCallback(
    () => {
      onLayersModified();
      if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      forceUpdate();
    },
    [forceUpdate, onLayersModified, unsavedChanges]
  );

  const triggerOnBackgroundColorChanged = React.useCallback(
    () => {
      onBackgroundColorChanged();
      if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      forceUpdate();
    },
    [forceUpdate, onBackgroundColorChanged, unsavedChanges]
  );

  const onDropLayer = React.useCallback(
    (targetIndex: number) => {
      const { current: draggedLayerIndex } = draggedLayerIndexRef;
      if (draggedLayerIndex === null) return;

      if (targetIndex !== draggedLayerIndex) {
        layersContainer.moveLayer(
          draggedLayerIndex,
          targetIndex < draggedLayerIndex ? targetIndex + 1 : targetIndex
        );
        triggerOnLayersModified();
      }
      draggedLayerIndexRef.current = null;
    },
    [layersContainer, triggerOnLayersModified]
  );

  const layersCount = layersContainer.getLayersCount();
  const containerLayersList = mapReverseFor(0, layersCount, i => {
    const layer = layersContainer.getLayerAt(i);
    const layerName = layer.getName();

    return (
      <LayerRow
        key={`layer-${layer.ptr}`}
        id={`layer-${i}`}
        layer={layer}
        isSelected={selectedLayer === layerName}
        onSelect={() => onSelectLayer(layerName)}
        nameError={nameErrors[layerName]}
        effectsCount={getEffectsCount(project.getCurrentPlatform(), layer)}
        onEditLayerEffects={() => onEditLayerEffects(layer)}
        onEdit={() => onEdit(layer)}
        onBeginDrag={() => {
          draggedLayerIndexRef.current = i;
        }}
        onDrop={() => onDropLayer(i)}
        onBlur={newName => {
          setNameErrors(currentValue => ({
            ...currentValue,
            [layerName]: null,
          }));

          if (layerName === newName) return;

          const isNameAlreadyTaken = layersContainer.hasLayerNamed(newName);
          if (isNameAlreadyTaken) {
            setNameErrors(currentValue => ({
              ...currentValue,
              [layerName]: <Trans>The name {newName} is already taken</Trans>,
            }));
          } else {
            layersContainer.getLayer(layerName).setName(newName);
            if (layout) {
              gd.WholeProjectRefactorer.renameLayerInScene(
                project,
                layout,
                layerName,
                newName
              );
            } else if (eventsFunctionsExtension && eventsBasedObject) {
              gd.WholeProjectRefactorer.renameLayerInEventsBasedObject(
                project,
                eventsFunctionsExtension,
                eventsBasedObject,
                layerName,
                newName
              );
            }
            onLayerRenamed();
            triggerOnLayersModified();
          }
        }}
        onRemove={() => {
          onRemoveLayer(layerName, doRemove => {
            if (!doRemove) return;

            layersContainer.removeLayer(layerName);
            triggerOnLayersModified();
          });
        }}
        isVisible={layer.getVisibility()}
        onChangeVisibility={visible => {
          layer.setVisibility(visible);
          triggerOnLayersModified();
        }}
        isLocked={layer.isLocked()}
        onChangeLockState={isLocked => {
          layer.setLocked(isLocked);
          triggerOnLayersModified();
        }}
        width={width}
      />
    );
  });

  return (
    <Column noMargin expand>
      {containerLayersList}
      <DropTarget
        canDrop={() => true}
        drop={() => {
          onDropLayer(-1);
        }}
      >
        {({ connectDropTarget, isOver, canDrop }) =>
          connectDropTarget(
            <div>
              {isOver && (
                <div
                  style={{
                    ...styles.dropIndicator,
                    outlineColor: gdevelopTheme.dropIndicator.canDrop,
                  }}
                />
              )}
              {layout && (
                <BackgroundColorRow
                  layout={layout}
                  onBackgroundColorChanged={triggerOnBackgroundColorChanged}
                />
              )}
            </div>
          )
        }
      </DropTarget>
    </Column>
  );
};

type Props = {|
  project: gdProject,
  selectedLayer: string,
  onSelectLayer: string => void,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  layersContainer: gdLayersContainer,
  onEditLayerEffects: (layer: ?gdLayer) => void,
  onEditLayer: (layer: ?gdLayer) => void,
  onLayersModified: () => void,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onLayerRenamed: () => void,
  onCreateLayer: () => void,
  onLayersVisibilityInEditorChanged: () => void,
  onBackgroundColorChanged: () => void,
  unsavedChanges?: ?UnsavedChanges,
  gameEditorMode: 'embedded-game' | 'instances-editor',

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

export type LayersListInterface = {|
  forceUpdate: () => void,
|};

const hasLightingLayer = (layersContainer: gdLayersContainer) => {
  const layersCount = layersContainer.getLayersCount();
  return (
    mapReverseFor(0, layersCount, i =>
      layersContainer.getLayerAt(i).isLightingLayer()
    ).filter(Boolean).length > 0
  );
};

const LayersList = React.forwardRef<Props, LayersListInterface>(
  (props, ref) => {
    const { eventsFunctionsExtension, eventsBasedObject, project } = props;
    const forceUpdate = useForceUpdate();

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    const addLayer = () => {
      const { layersContainer } = props;
      const name = newNameGenerator('Layer', name =>
        layersContainer.hasLayerNamed(name)
      );
      layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
      const newLayer = layersContainer.getLayer(name);
      addDefaultLightToLayer(newLayer);

      onLayerModified();
      props.onCreateLayer();
    };

    const addLightingLayer = () => {
      const { layersContainer } = props;
      const name = newNameGenerator('Lighting', name =>
        layersContainer.hasLayerNamed(name)
      );
      layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
      const layer = layersContainer.getLayer(name);
      layer.setLightingLayer(true);
      layer.setFollowBaseLayerCamera(true);
      layer.setAmbientLightColor(200, 200, 200);
      onLayerModified();
      props.onCreateLayer();
    };

    const onLayerModified = () => {
      if (props.unsavedChanges) props.unsavedChanges.triggerUnsavedChanges();
      props.onLayersModified();
      forceUpdate();
    };

    // Force the list to be mounted again if layersContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = props.layersContainer.ptr;
    const isLightingLayerPresent = hasLightingLayer(props.layersContainer);

    return (
      <Background>
        <ScrollView autoHideScrollbar>
          <FullSizeMeasurer>
            {({ width }) => (
              // TODO: The list is costly to render when there are many layers, consider
              // using SortableVirtualizedItemList.
              <LayersListBody
                key={listKey}
                selectedLayer={props.selectedLayer}
                onSelectLayer={props.onSelectLayer}
                project={props.project}
                layout={props.layout}
                eventsFunctionsExtension={eventsFunctionsExtension}
                eventsBasedObject={eventsBasedObject}
                layersContainer={props.layersContainer}
                onEditLayerEffects={props.onEditLayerEffects}
                onEdit={props.onEditLayer}
                onLayersModified={props.onLayersModified}
                onRemoveLayer={props.onRemoveLayer}
                onLayerRenamed={props.onLayerRenamed}
                onBackgroundColorChanged={props.onBackgroundColorChanged}
                unsavedChanges={props.unsavedChanges}
                width={width}
              />
            )}
          </FullSizeMeasurer>
          <Column>
            <LineStackLayout justifyContent="flex-end" expand>
              {props.gameEditorMode === 'embedded-game' && (
                <IconButton
                  size="small"
                  color="default"
                  id={'show-effects-button'}
                  onClick={() => {
                    project.setEffectsHiddenInEditor(
                      !project.areEffectsHiddenInEditor()
                    );
                    props.onLayersVisibilityInEditorChanged();
                    forceUpdate();
                  }}
                  selected={!project.areEffectsHiddenInEditor()}
                  tooltip={
                    !project.areEffectsHiddenInEditor()
                      ? t`Disable effects/lighting in the editor`
                      : t`Display effects/lighting in the editor`
                  }
                >
                  <LightbulbIcon />
                </IconButton>
              )}
              <RaisedButtonWithSplitMenu
                label={<Trans>Add a layer</Trans>}
                id="add-layer-button"
                primary
                onClick={addLayer}
                icon={<Add />}
                buildMenuTemplate={i18n => [
                  {
                    label: i18n._(t`Add 2D lighting layer`),
                    enabled: !isLightingLayerPresent,
                    click: addLightingLayer,
                  },
                ]}
              />
            </LineStackLayout>
          </Column>
        </ScrollView>
      </Background>
    );
  }
);

const LayersListWithErrorBoundary = React.forwardRef<
  Props,
  LayersListInterface
>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Layers list</Trans>}
    scope="scene-editor-layers-list"
  >
    <LayersList ref={ref} {...props} />
  </ErrorBoundary>
));

export default LayersListWithErrorBoundary;
