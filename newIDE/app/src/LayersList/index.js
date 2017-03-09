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
import IconButton from 'material-ui/IconButton';
import mapFor from '../Utils/MapFor';

const styles = {
  visibleColumn: {
    width: 48,
  },
  moveColumn: {
    width: 96,
  },
};

export default class InstancesList extends Component {
  shouldComponentUpdate() {
    // Rendering the component can be costly as it iterates over
    // every layers, so the prop freezeUpdate allow to ask the component to stop
    // updating, for example when hidden.
    return !this.props.freezeUpdate;
  }

  _renderVisibilityToogle(layer) {
    return (
      <Checkbox
        checked={layer.getVisibility()}
        checkedIcon={<Visibility />}
        uncheckedIcon={<VisibilityOff />}
        onCheck={(e, visible) => {
          layer.setVisibility(visible);
          this.forceUpdate(); //TODO: Should this be done by the parent component?
        }}
      />
    );
  }

  render() {
    const { layersContainer } = this.props;

    const containerLayersList = mapFor(
      0,
      layersContainer.getLayersCount(),
      i => {
        const layer = layersContainer.getLayerAt(i);
        const layerName = layer.getName() || 'Base layer';

        return (
          <TableRow key={layerName}>
            <TableRowColumn>{layerName}</TableRowColumn>
            <TableRowColumn style={styles.visibleColumn}>
              {this._renderVisibilityToogle(layer)}
            </TableRowColumn>
            <TableRowColumn style={styles.moveColumn}>
              <IconButton
                disabled={i === 0}
                onTouchTap={() => {
                  layersContainer.swapLayers(i, i - 1);
                  this.forceUpdate(); //TODO: Should this be done by the parent component?
                }}
              >
                <ArrowUpward />
              </IconButton>
              <IconButton
                disabled={i === layersContainer.getLayersCount() - 1}
                onTouchTap={() => {
                  layersContainer.swapLayers(i, i + 1);
                  this.forceUpdate(); //TODO: Should this be done by the parent component?
                }}
              >
                <ArrowDownward />
              </IconButton>
            </TableRowColumn>
          </TableRow>
        );
      }
    );

    return (
      <Table
        selectable={true}
        onRowSelection={selection => this.onRowSelection(selection)}
      >
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
        >
          {containerLayersList}
        </TableBody>
      </Table>
    );
  }
}
