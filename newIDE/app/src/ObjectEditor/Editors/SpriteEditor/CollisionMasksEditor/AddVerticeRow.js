import React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import IconButton from '../../../../UI/IconButton';
import styles from './styles';

const AddVerticeRow = ({ onAdd }) => (
  <TableRow>
    <TableRowColumn style={styles.handleColumn} />
    <TableRowColumn />
    <TableRowColumn style={styles.coordinateColumn} />
    <TableRowColumn style={styles.coordinateColumn} />
    <TableRowColumn style={styles.toolColumn}>
      <IconButton onClick={onAdd}>
        <AddCircle />
      </IconButton>
    </TableRowColumn>
  </TableRow>
);

export default AddVerticeRow;
