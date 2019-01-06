// @flow
import * as React from 'react';
import {
  Table,
  TableRow,
  TableRowColumn,
  TableBody,
  TableHeader,
  TableHeaderColumn,
} from 'material-ui/Table';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import Warning from 'material-ui/svg-icons/alert/warning';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import Delete from 'material-ui/svg-icons/action/delete';

export type Vertex = {|
  x: number,
  y: number,
|};

type Props = {|
  vertices: Array<Vertex>,
  onChangeVertexX: (newValue: number, index: number) => void,
  onChangeVertexY: (newValue: number, index: number) => void,
  onAdd: () => void,
  onRemove: (index: number) => void,
|};

export default class PolygonEditor extends React.Component<Props> {
  _isPolygonConvex(vertices: Array<Vertex>) {
    // Get edges
    let edges = [];
    let v1 = null;
    let v2 = null;
    for (let i = 0; i < vertices.length; i++) {
      v1 = vertices[i];
      if (i + 1 >= vertices.length) v2 = vertices[0];
      else v2 = vertices[i + 1];
      edges.push({ x: v2.x - v1.x, y: v2.y - v1.y });
    }

    // Check convexity
    if (edges.length < 3) return false;

    const zProductIsPositive =
      edges[0].x * edges[0 + 1].y - edges[0].y * edges[0 + 1].x > 0;

    for (let i = 1; i < edges.length - 1; ++i) {
      let zCrossProduct =
        edges[i].x * edges[i + 1].y - edges[i].y * edges[i + 1].x;
      let zCrossProductIsPositive = zCrossProduct > 0;
      if (zCrossProductIsPositive !== zProductIsPositive) return false;
    }

    let lastZCrossProduct =
      edges[edges.length - 1].x * edges[0].y -
      edges[edges.length - 1].y * edges[0].x;
    let lastZCrossProductIsPositive = lastZCrossProduct > 0;
    if (lastZCrossProductIsPositive !== zProductIsPositive) return false;

    // Check for repeated vertices (would crash Box2D during the game)
    for (let i = 0; i < vertices.length - 1; ++i) {
      for (let j = i + 1; j < vertices.length; ++j) {
        if (vertices[i].x === vertices[j].x && vertices[i].y === vertices[j].y)
          return false;
      }
    }

    // Check if all vertices are aligned (would crash Box2D during the game)
    let alignedX = true;
    let alignedY = true;
    for (let i = 0; i < vertices.length - 1; ++i) {
      if (vertices[i].x !== vertices[i + 1].x) alignedX = false;
      if (vertices[i].y !== vertices[i + 1].y) alignedY = false;
    }
    if (alignedX || alignedY) return false;

    return true;
  }

  render() {
    const {
      vertices,
      onChangeVertexX,
      onChangeVertexY,
      onAdd,
      onRemove,
    } = this.props;

    return (
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn />
            <TableHeaderColumn>X</TableHeaderColumn>
            <TableHeaderColumn>Y</TableHeaderColumn>
            <TableRowColumn />
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          deselectOnClickaway={true}
          showRowHover={false}
        >
          {vertices.map((value, index) => {
            return (
              <TableRow key={`vertexRow${index}`}>
                <TableRowColumn>
                  {!this._isPolygonConvex(vertices) && <Warning />}
                </TableRowColumn>
                <TableRowColumn>
                  <SemiControlledTextField
                    value={value.x.toString(10)}
                    onChange={newValue =>
                      onChangeVertexX(parseFloat(newValue) || 0, index)
                    }
                    type="number"
                  />
                </TableRowColumn>
                <TableRowColumn>
                  <SemiControlledTextField
                    value={value.y.toString(10)}
                    onChange={newValue =>
                      onChangeVertexY(parseFloat(newValue) || 0, index)
                    }
                    type="number"
                  />
                </TableRowColumn>
                <TableRowColumn>
                  <IconButton onClick={() => onRemove(index)}>
                    <Delete />
                  </IconButton>
                </TableRowColumn>
              </TableRow>
            );
          })}
          <TableRow>
            <TableRowColumn />
            <TableRowColumn />
            <TableRowColumn />
            <TableRowColumn>
              <IconButton onClick={onAdd}>
                <AddCircle />
              </IconButton>
            </TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
}
