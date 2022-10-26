// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapReverseFor } from '../Utils/MapFor';
import LayerRow, { styles } from './LayerRow';
import BackgroundColorRow from './BackgroundColorRow';
import { Column, Line } from '../UI/Grid';
import Add from '@material-ui/icons/Add';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import ScrollView from '../UI/ScrollView';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import useForceUpdate from '../Utils/UseForceUpdate';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';

type LayersListBodyState = {|
  nameErrors: { [string]: boolean },
|};

class LayersListBody extends React.Component<*, LayersListBodyState> {
  state = {
    nameErrors: {},
  };
  draggedLayerIndex: number | null = null;

  _onLayerModified = () => {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  };

  _onDropLayer = (targetIndex: number) => {
    const { draggedLayerIndex } = this;
    if (draggedLayerIndex === null) return;

    if (targetIndex !== draggedLayerIndex) {
      this.props.layersContainer.moveLayer(
        draggedLayerIndex,
        targetIndex < draggedLayerIndex ? targetIndex + 1 : targetIndex
      );
      this._onLayerModified();
    }
    this.draggedLayerIndex = null;
  };

  render() {
    const { layersContainer, onEditEffects, onEdit, width } = this.props;

    const DropTarget = makeDropTarget('layers-list');

    const layersCount = layersContainer.getLayersCount();
    const containerLayersList = mapReverseFor(0, layersCount, i => {
      const layer = layersContainer.getLayerAt(i);
      const layerName = layer.getName();
      const isLightingLayer = layer.isLightingLayer();

      return (
        <LayerRow
          key={'layer-' + layerName}
          layer={layer}
          layerName={layerName}
          isLightingLayer={isLightingLayer}
          nameError={this.state.nameErrors[layerName]}
          effectsCount={layer.getEffects().getEffectsCount()}
          onEditEffects={() => onEditEffects(layer)}
          onEdit={() => onEdit(layer)}
          onBeginDrag={() => {
            this.draggedLayerIndex = i;
          }}
          onDrop={() => this._onDropLayer(i)}
          onBlur={event => {
            const newName = event.currentTarget.value;
            if (layerName === newName) return;

            let success = true;
            if (layersContainer.hasLayerNamed(newName)) {
              success = false;
            } else {
              this.props.onRenameLayer(layerName, newName, doRename => {
                if (doRename)
                  layersContainer.getLayer(layerName).setName(newName);
              });
            }

            this.setState({
              nameErrors: {
                ...this.state.nameErrors,
                [layerName]: !success,
              },
            });
          }}
          onRemove={() => {
            this.props.onRemoveLayer(layerName, doRemove => {
              if (!doRemove) return;

              layersContainer.removeLayer(layerName);
              this._onLayerModified();
            });
          }}
          isVisible={layer.getVisibility()}
          onChangeVisibility={visible => {
            layer.setVisibility(visible);
            this._onLayerModified();
          }}
          width={width}
        />
      );
    });

    return (
      <ThemeConsumer>
        {gdevelopTheme => (
          <Column noMargin expand>
            {containerLayersList}
            <DropTarget
              canDrop={() => true}
              drop={() => {
                this._onDropLayer(-1);
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
                    <BackgroundColorRow
                      layout={layersContainer}
                      onBackgroundColorChanged={() => this._onLayerModified()}
                    />
                  </div>
                )
              }
            </DropTarget>
          </Column>
        )}
      </ThemeConsumer>
    );
  }
}

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  layersContainer: gdLayout,
  onEditLayerEffects: (layer: ?gdLayer) => void,
  onEditLayer: (layer: ?gdLayer) => void,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onRenameLayer: (
    oldName: string,
    newName: string,
    cb: (done: boolean) => void
  ) => void,
  onCreateLayer: () => void,
  unsavedChanges?: ?UnsavedChanges,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

export type LayersListInterface = {
  forceUpdate: () => void,
};

const hasLightingLayer = (layout: gdLayout) => {
  const layersCount = layout.getLayersCount();
  return (
    mapReverseFor(0, layersCount, i =>
      layout.getLayerAt(i).isLightingLayer()
    ).filter(Boolean).length > 0
  );
};

const LayersList = React.forwardRef<Props, LayersListInterface>(
  (props, ref) => {
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
                layersContainer={props.layersContainer}
                onEditEffects={props.onEditLayerEffects}
                onEdit={props.onEditLayer}
                onRemoveLayer={props.onRemoveLayer}
                onRenameLayer={props.onRenameLayer}
                unsavedChanges={props.unsavedChanges}
                width={width}
              />
            )}
          </FullSizeMeasurer>
          <Column>
            <Line justifyContent="flex-end" expand>
              <RaisedButtonWithSplitMenu
                label={<Trans>Add a layer</Trans>}
                primary
                onClick={addLayer}
                icon={<Add />}
                buildMenuTemplate={i18n => [
                  {
                    label: i18n._(t`Add lighting layer`),
                    enabled: !isLightingLayerPresent,
                    click: addLightingLayer,
                  },
                ]}
              />
            </Line>
          </Column>
        </ScrollView>
      </Background>
    );
  }
);

export default LayersList;
