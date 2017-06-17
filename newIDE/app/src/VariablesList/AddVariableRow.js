import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import styles from './styles';

const VariableRow = ({ onAdd }) => (
  <TableRow key="add-row">
    <TableRowColumn />
    <TableRowColumn />
    <TableRowColumn style={styles.toolColumn}>
      <IconButton onTouchTap={onAdd}>
        <Add />
      </IconButton>
    </TableRowColumn>
  </TableRow>
);

export default VariableRow;
