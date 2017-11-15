import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import TextField from 'material-ui/TextField';
import DragHandle from '../../../../UI/DragHandle';
import styles from './styles';

const PointRow = ({
  pointName,
  nameError,
  onBlur,
  onRemove,
  pointX,
  pointY,
  onChangePointX,
  onChangePointY,
}) => (
  <TableRow
    style={{
      /* TODO */
      backgroundColor: 'white',
    }}
  >
    <TableRowColumn style={styles.handleColumn}>
      <DragHandle />
    </TableRowColumn>
    <TableRowColumn>
      <TextField
        defaultValue={pointName || 'Base layer'}
        id={pointName}
        fullWidth
        errorText={nameError ? 'This name is already taken' : undefined}
        disabled={!onBlur}
        onBlur={onBlur}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.coordinateColumn}>
      <TextField
        value={pointX}
        id="point-x"
        onChange={(e, value) =>
          onChangePointX(parseFloat(value, 10))}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.coordinateColumn}>
      <TextField
        value={pointY}
        id="point-y"
        onChange={(e, value) =>
          onChangePointY(parseFloat(value, 10))}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.toolColumn}>
      {!!onRemove && (
        <IconButton onTouchTap={onRemove}>
          <Delete />
        </IconButton>
      )}
    </TableRowColumn>
  </TableRow>
);

export default PointRow;
