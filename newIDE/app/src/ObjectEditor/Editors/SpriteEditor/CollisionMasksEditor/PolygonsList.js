// @flow
import React, { Component } from 'react';
import flatten from 'lodash/flatten';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapVector } from '../../../../Utils/MapFor';
import styles from './styles';
import VerticeRow from './VerticeRow';
import PolygonRow from './PolygonRow';
import AddVerticeRow from './AddVerticeRow';
import AddPolygonRow from './AddPolygonRow';
const gd = global.gd;

const SortableAddPolygonRow = SortableElement(AddPolygonRow);
const SortableAddVerticeRow = SortableElement(AddVerticeRow);
const SortableVerticeRow = SortableElement(VerticeRow);
const SortablePolygonRow = SortableElement(PolygonRow);

type PolygonsListBodyProps = {|
  polygons: gdVectorPolygon2d,
  onPolygonsUpdated: () => void,

  // Sprite size is useful to make sure polygon vertices
  // are not put outside the sprite bounding box, which is not supported:
  spriteWidth: number,
  spriteHeight: number,
|};

class PolygonsListBody extends Component<PolygonsListBodyProps, void> {
  _onPolygonUpdated() {
    this.forceUpdate();
    this.props.onPolygonsUpdated();
  }

  updateVerticeX = (vertice, newValue) => {
    // Ensure vertice stays inside the sprite bounding box.
    vertice.set_x(Math.min(this.props.spriteWidth, Math.max(newValue, 0)));
    this._onPolygonUpdated();
  };

  updateVerticeY = (vertice, newValue) => {
    // Ensure vertice stays inside the sprite bounding box.
    vertice.set_y(Math.min(this.props.spriteHeight, Math.max(newValue, 0)));
    this._onPolygonUpdated();
  };

  render() {
    const { polygons } = this.props;

    const polygonRows = flatten(
      mapVector(polygons, (polygon, i) => {
        const vertices = polygon.getVertices();
        const isConvex = polygon.isConvex();

        return [
          <SortablePolygonRow
            index={i}
            disabled
            key={'polygon-' + i}
            polygon={polygon}
            onRemove={() => {
              gd.removeFromVectorPolygon2d(polygons, i);
              this._onPolygonUpdated();
            }}
            isConvex={isConvex}
            verticesCount={vertices.size()}
          />,
          mapVector(vertices, (vertice, j) => (
            <SortableVerticeRow
              index={i}
              disabled
              key={`polygon-${i}-vertice-${j}`}
              verticeX={vertice.get_x()}
              verticeY={vertice.get_y()}
              onChangeVerticeX={newValue =>
                this.updateVerticeX(vertice, newValue)
              }
              onChangeVerticeY={newValue =>
                this.updateVerticeY(vertice, newValue)
              }
              onRemove={() => {
                gd.removeFromVectorVector2f(polygon.getVertices(), j);
                this._onPolygonUpdated();
              }}
              canRemove={vertices.size() > 3}
              hasWarning={!isConvex}
            />
          )),
          <SortableAddVerticeRow
            index={0}
            key={`polygon-${i}-add-vertice-row`}
            disabled
            onAdd={() => {
              const newVertice = new gd.Vector2f();
              polygon.getVertices().push_back(newVertice);
              newVertice.delete();

              this._onPolygonUpdated();
            }}
          />,
        ];
      })
    );

    const addRow = (
      <SortableAddPolygonRow
        index={0}
        key={'add-polygon-row'}
        disabled
        onAdd={() => {
          const newPolygon = gd.Polygon2d.createRectangle(32, 32);
          newPolygon.move(
            this.props.spriteWidth / 2,
            this.props.spriteHeight / 2
          );
          polygons.push_back(newPolygon);

          this._onPolygonUpdated();
        }}
      />
    );

    return (
      <TableBody
        displayRowCheckbox={false}
        deselectOnClickaway={true}
        showRowHover={true}
      >
        {[...polygonRows, addRow]}
      </TableBody>
    );
  }
}

const SortablePolygonsListBody = SortableContainer(PolygonsListBody);
SortablePolygonsListBody.muiName = 'TableBody';

type Props = {|
  polygons: gdVectorPolygon2d,
  onPolygonsUpdated: () => void,
  spriteWidth: number,
  spriteHeight: number,
|};

export default class PolygonsList extends Component<Props, void> {
  render() {
    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={styles.handleColumn} />
            <TableHeaderColumn>Polygon</TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn}>
              X
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn}>
              Y
            </TableHeaderColumn>
            <TableRowColumn style={styles.toolColumn} />
          </TableRow>
        </TableHeader>
        <SortablePolygonsListBody
          polygons={this.props.polygons}
          onPolygonsUpdated={this.props.onPolygonsUpdated}
          spriteWidth={this.props.spriteWidth}
          spriteHeight={this.props.spriteHeight}
          onSortEnd={({ oldIndex, newIndex }) => {
            // Reordering polygons is not supported for now
          }}
          helperClass="sortable-helper"
          useDragHandle
          lockToContainerEdges
        />
      </Table>
    );
  }
}
