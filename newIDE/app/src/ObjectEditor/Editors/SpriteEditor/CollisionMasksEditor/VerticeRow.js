import React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import TextField from '../../../../UI/TextField';
import Warning from 'material-ui/svg-icons/alert/warning';
import styles from './styles';
import ThemeConsumer from '../../../../UI/Theme/ThemeConsumer';

const VerticeRow = ({
  hasWarning,
  canRemove,
  onRemove,
  verticeX,
  verticeY,
  onChangeVerticeX,
  onChangeVerticeY,
}) => (
  <ThemeConsumer>
    {muiTheme => (
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
            onChange={(e, value) =>
              onChangeVerticeX(parseFloat(value || 0, 10))
            }
          />
        </TableRowColumn>
        <TableRowColumn style={styles.coordinateColumn}>
          <TextField
            value={verticeY}
            type="number"
            id="vertice-y"
            onChange={(e, value) =>
              onChangeVerticeY(parseFloat(value || 0, 10))
            }
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
    )}
  </ThemeConsumer>
);

export default VerticeRow;
