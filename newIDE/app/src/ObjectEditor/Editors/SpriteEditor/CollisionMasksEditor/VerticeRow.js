import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import TextField from 'material-ui/TextField';
import Warning from 'material-ui/svg-icons/alert/warning';
import muiThemeable from 'material-ui/styles/muiThemeable';
import styles from './styles';

const ThemableVerticeRow = ({
  hasWarning,
  canRemove,
  onRemove,
  verticeX,
  verticeY,
  onChangeVerticeX,
  onChangeVerticeY,
  muiTheme,
}) => (
  <TableRow
    style={{
      backgroundColor: muiTheme.list.itemsBackgroundColor,
    }}
  >
    <TableRowColumn style={styles.handleColumn}>
      {/* <DragHandle /> Reordering vertices is not supported for now */}
    </TableRowColumn>
    <TableRowColumn>{hasWarning && <Warning />}</TableRowColumn>
    <TableRowColumn style={styles.coordinateColumn}>
      <TextField
        value={verticeX}
        type="number"
        id="vertice-x"
        onChange={(e, value) => onChangeVerticeX(parseFloat(value || 0, 10))}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.coordinateColumn}>
      <TextField
        value={verticeY}
        type="number"
        id="vertice-y"
        onChange={(e, value) => onChangeVerticeY(parseFloat(value || 0, 10))}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.toolColumn}>
      {!!onRemove && (
        <IconButton onClick={onRemove} disabled={!canRemove}>
          <Delete />
        </IconButton>
      )}
    </TableRowColumn>
  </TableRow>
);

const PointRow = muiThemeable()(ThemableVerticeRow);
export default PointRow;
