import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapReverseFor } from '../Utils/MapFor';
import styles from './styles';
import LayerRow from './LayerRow';
import AddLayerRow from './AddLayerRow';

const SortableAddLayerRow = SortableElement(AddLayerRow);
const SortableLayerRow = SortableElement(LayerRow);

class LayersListBody extends Component {
  constructor() {
    super();
    this.state = {
      nameErrors: {},
    };
  }

  render() {
    const { layersContainer } = this.props;

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
              this.forceUpdate();
            });
          }}
          isVisible={layer.getVisibility()}
          onChangeVisibility={(e, visible) => {
            layer.setVisibility(visible);
            this.forceUpdate();
          }}
        />
      );
    });

    const addRow = (
      <SortableAddLayerRow
        index={layersContainer.getLayersCount()}
        key={'add-layer-row'}
        disabled
        onAdd={() => {
          const name = newNameGenerator('Layer', name =>
            layersContainer.hasLayerNamed(name)
          );
          layersContainer.insertNewLayer(
            name,
            layersContainer.getLayersCount()
          );
          this.forceUpdate();
        }}
      />
    );

    return (
      <TableBody
        displayRowCheckbox={false}
        deselectOnClickaway={true}
        showRowHover={true}
      >
        {containerLayersList.concat(addRow)}
      </TableBody>
    );
  }
}

const SortableLayersListBody = SortableContainer(LayersListBody);
SortableLayersListBody.muiName = 'TableBody';

export default class LayersList extends Component {
  shouldComponentUpdate(nextProps) {
    // Rendering the component can be costly as it iterates over
    // every layers, so the prop freezeUpdate allow to ask the component to stop
    // updating, for example when hidden.
    return !nextProps.freezeUpdate;
  }

  render() {
    // Force the list to be mounted again if layersContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = this.props.layersContainer.ptr;

    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={styles.handleColumn} />
            <TableHeaderColumn>Layer name</TableHeaderColumn>
            <TableHeaderColumn style={styles.visibleColumn}>
              Visible
            </TableHeaderColumn>
            <TableRowColumn style={styles.toolColumn} />
          </TableRow>
        </TableHeader>
        <SortableLayersListBody
          key={listKey}
          layersContainer={this.props.layersContainer}
          onRemoveLayer={this.props.onRemoveLayer}
          onRenameLayer={this.props.onRenameLayer}
          onSortEnd={({ oldIndex, newIndex }) => {
            const layersCount = this.props.layersContainer.getLayersCount();
            this.props.layersContainer.moveLayer(
              layersCount - 1 - oldIndex,
              layersCount - 1 - newIndex
            );
            this.forceUpdate();
          }}
          helperClass="sortable-helper"
          useDragHandle
          lockToContainerEdges
        />
      </Table>
    );
  }
}

LayersList.defaultProps = {
  onRemoveLayer: (layerName, cb) => cb(true),
  onRenameLayer: (oldName, newName, cb) => cb(true),
};
