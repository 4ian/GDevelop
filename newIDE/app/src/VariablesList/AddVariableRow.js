import React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import styles from './styles';

const VariableRow = ({ onAdd }) => (
  <TreeTableRow key="add-row">
    <TreeTableCell />
    <TreeTableCell>
      <EmptyMessage style={styles.addVariableMessage}>
        Click to add a variable:
      </EmptyMessage>
    </TreeTableCell>
    <TreeTableCell style={styles.toolColumn}>
      <IconButton onClick={onAdd}>
        <Add />
      </IconButton>
    </TreeTableCell>
  </TreeTableRow>
);

export default VariableRow;
