import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import TextField from 'material-ui/TextField';
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
  onEdit,
  isAutomatic,
}) => (
  <TableRow style={styles.pointRow}>
    <TableRowColumn style={styles.handleColumn}>
      {/* <DragHandle /> Reordering point is not supported for now */}
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
      {!isAutomatic ? (
        <TextField
          value={pointX}
          type="number"
          id="point-x"
          onChange={(e, value) => onChangePointX(parseFloat(value || 0, 10))}
        />
      ) : (
        <p>(auto)</p>
      )}
    </TableRowColumn>
    <TableRowColumn style={styles.coordinateColumn}>
      {!isAutomatic ? (
        <TextField
          value={pointY}
          type="number"
          id="point-y"
          onChange={(e, value) => onChangePointY(parseFloat(value || 0, 10))}
        />
      ) : (
        <p>(auto)</p>
      )}
    </TableRowColumn>
    <TableRowColumn style={styles.toolColumn}>
      {!!onRemove && (
        <IconButton onTouchTap={onRemove}>
          <Delete />
        </IconButton>
      )}
      {!!onEdit && (
        <IconButton onTouchTap={onEdit}>
          <ModeEdit />
        </IconButton>
      )}
    </TableRowColumn>
  </TableRow>
);

export default PointRow;
