import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward';
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward';
import Delete from 'material-ui/svg-icons/action/delete';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import newNameGenerator from '../Utils/NewNameGenerator';
import { mapReverseFor } from '../Utils/MapFor';

const styles = {
  visibleColumn: {
    width: 48,
  },
  toolColumn: {
    width: 144,
  },
};

const LayerRow = (
  {
    layerName,
    nameError,
    onBlur,
    onMoveUp,
    onMoveDown,
    onRemove,
    canMoveDown,
    canMoveUp,
    isVisible,
    onChangeVisibility,
  }
) => (
  <TableRow>
    <TableRowColumn>
      <TextField
        defaultValue={layerName}
        id={layerName}
        errorText={nameError ? 'This name is already taken' : undefined}
        disabled={!layerName}
        onBlur={onBlur}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.visibleColumn}>
      <Checkbox
        checked={isVisible}
        checkedIcon={<Visibility />}
        uncheckedIcon={<VisibilityOff />}
        onCheck={onChangeVisibility}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.toolColumn}>
      <IconButton disabled={canMoveUp} onTouchTap={onMoveUp}>
        <ArrowUpward />
      </IconButton>
      <IconButton disabled={canMoveDown} onTouchTap={onMoveDown}>
        <ArrowDownward />
      </IconButton>
      <IconButton onTouchTap={onRemove}>
        <Delete />
      </IconButton>
    </TableRowColumn>
  </TableRow>
);

export default class LayersList extends Component {
  constructor() {
    super();
    this.state = {
      nameErrors: {},
    };
  }

  shouldComponentUpdate() {
    // Rendering the component can be costly as it iterates over
    // every layers, so the prop freezeUpdate allow to ask the component to stop
    // updating, for example when hidden.
    return !this.props.freezeUpdate;
  }

  render() {
    const { layersContainer } = this.props;

    const containerLayersList = mapReverseFor(
      0,
      layersContainer.getLayersCount(),
      i => {
        const layer = layersContainer.getLayerAt(i);
        const layerName = layer.getName() || 'Base layer';

        return (
          <LayerRow
            key={layerName}
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
            onMoveDown={() => {
              layersContainer.swapLayers(i, i - 1);
              this.forceUpdate();
            }}
            canMoveDown={i === 0}
            canMoveUp={i === layersContainer.getLayersCount() - 1}
            onMoveUp={() => {
              layersContainer.swapLayers(i, i + 1);
              this.forceUpdate();
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
      }
    );

    const addRow = (
      <TableRow key="add-row">
        <TableRowColumn />
        <TableRowColumn />
        <TableRowColumn style={styles.toolColumn}>
          <IconButton
            onTouchTap={() => {
              const name = newNameGenerator('Layer', name =>
                layersContainer.hasLayerNamed(name));
              layersContainer.insertNewLayer(
                name,
                layersContainer.getLayersCount()
              );
              this.forceUpdate();
            }}
          >
            <Add />
          </IconButton>
        </TableRowColumn>
      </TableRow>
    );

    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Layer name</TableHeaderColumn>
            <TableHeaderColumn style={styles.visibleColumn}>
              Visible
            </TableHeaderColumn>
            <TableRowColumn />
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          deselectOnClickaway={true}
          showRowHover={true}
          style={{
            backgroundColor: 'white',
          }}
        >
          {[addRow].concat(containerLayersList)}
        </TableBody>
      </Table>
    );
  }
}

LayersList.defaultProps = {
  onRemoveLayer: (layerName, cb) => cb(true),
  onRenameLayer: (oldName, newName, cb) => cb(true),
};
