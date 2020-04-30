// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapReverseFor } from '../Utils/MapFor';
import LayerRow from './LayerRow';
import EffectsListDialog from '../EffectsList/EffectsListDialog';
import BackgroundColorRow from './BackgroundColorRow';
import { Column, Line } from '../UI/Grid';
import Add from '@material-ui/icons/Add';
import RaisedButton from '../UI/RaisedButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import ScrollView from '../UI/ScrollView';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';

const SortableLayerRow = SortableElement(LayerRow);

type LayersListBodyState = {|
  nameErrors: { [string]: boolean },
|};

class LayersListBody extends Component<*, LayersListBodyState> {
  state = {
    nameErrors: {},
  };

  _onLayerModified = () => {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  };

  render() {
    const { layersContainer, onEditEffects, width } = this.props;

    const layersCount = layersContainer.getLayersCount();
    const containerLayersList = mapReverseFor(0, layersCount, i => {
      const layer = layersContainer.getLayerAt(i);
      const layerName = layer.getName();

      return (
        <SortableLayerRow
          index={layersCount - 1 - i}
          key={'layer-' + layerName}
          layer={layer}
          layerName={layerName}
          nameError={this.state.nameErrors[layerName]}
          effectsCount={layer.getEffectsCount()}
          onEditEffects={() => onEditEffects(layer)}
          onBlur={event => {
            const newName = event.target.value;
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
      <Column noMargin expand>
        {containerLayersList}
        <BackgroundColorRow
          layout={layersContainer}
          onBackgroundColorChanged={() => this._onLayerModified()}
        />
      </Column>
    );
  }
}

const SortableLayersListBody = SortableContainer(LayersListBody);

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  layersContainer: gdLayout,
  onRemoveLayer: (layerName: string, cb: (done: boolean) => void) => void,
  onRenameLayer: (
    oldName: string,
    newName: string,
    cb: (done: boolean) => void
  ) => void,
  unsavedChanges?: UnsavedChanges,
|};

type State = {|
  effectsEditedLayer: ?gdLayer,
|};

export default class LayersList extends Component<Props, State> {
  state = {
    effectsEditedLayer: null,
  };

  _editEffects = (effectsEditedLayer: ?gdLayer) => {
    this.setState({
      effectsEditedLayer,
    });
  };

  _addLayer = () => {
    const { layersContainer } = this.props;
    const name = newNameGenerator('Layer', name =>
      layersContainer.hasLayerNamed(name)
    );
    layersContainer.insertNewLayer(name, layersContainer.getLayersCount());
    this._onLayerModified();
  };

  _onLayerModified = () => {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  };

  render() {
    const { project } = this.props;
    const { effectsEditedLayer } = this.state;

    // Force the list to be mounted again if layersContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = this.props.layersContainer.ptr;

    return (
      <Background>
        <ScrollView autoHideScrollbar>
          <FullSizeMeasurer>
            {({ width }) => (
              <SortableLayersListBody
                key={listKey}
                layersContainer={this.props.layersContainer}
                onEditEffects={layer => this._editEffects(layer)}
                onRemoveLayer={this.props.onRemoveLayer}
                onRenameLayer={this.props.onRenameLayer}
                onSortEnd={({ oldIndex, newIndex }) => {
                  const layersCount = this.props.layersContainer.getLayersCount();
                  this.props.layersContainer.moveLayer(
                    layersCount - 1 - oldIndex,
                    layersCount - 1 - newIndex
                  );
                  this._onLayerModified();
                }}
                helperClass="sortable-helper"
                useDragHandle
                unsavedChanges={this.props.unsavedChanges}
                width={width}
              />
            )}
          </FullSizeMeasurer>
          <Column>
            <Line justifyContent="flex-end" expand>
              <RaisedButton
                label={<Trans>Add a layer</Trans>}
                primary
                onClick={this._addLayer}
                icon={<Add />}
              />
            </Line>
          </Column>
          {effectsEditedLayer && (
            <EffectsListDialog
              project={project}
              resourceSources={this.props.resourceSources}
              onChooseResource={this.props.onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
              effectsContainer={effectsEditedLayer}
              onApply={() =>
                this.setState({
                  effectsEditedLayer: null,
                })
              }
            />
          )}
        </ScrollView>
      </Background>
    );
  }
}
