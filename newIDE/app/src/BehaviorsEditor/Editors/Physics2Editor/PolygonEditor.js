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

type Vertex = {
  x: number,
  y: number,
};

type Props = {|
  vertices: Array<Vertex>,
  onChangeVertexX: (newValue: number, index: number) => void,
  onChangeVertexY: (newValue: number, index: number) => void,
  onAdd: () => void,
  onRemove: (index: number) => void,
  hasWarning: boolean,
|};

export default class PolygonEditor extends React.Component<Props> {
  render() {
    const {
      vertices,
      onChangeVertexX,
      onChangeVertexY,
      onAdd,
      onRemove,
      hasWarning,
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
                <TableRowColumn>{hasWarning && <Warning />}</TableRowColumn>
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
