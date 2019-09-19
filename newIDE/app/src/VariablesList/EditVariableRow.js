import React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import Add from '@material-ui/icons/Add';
import IconButton from '../UI/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import Copy from '../UI/CustomSvgIcons/Copy';
import Paste from '../UI/CustomSvgIcons/Paste';
import Delete from '@material-ui/icons/Delete';

import styles from './styles';

const EditVariableRow = ({
  onAdd,
  onCopy,
  hasSelection,
  onPaste,
  hasClipboard,
  onDeleteSelection,
}) => (
  <TreeTableRow>
    <TreeTableCell style={styles.toolColumnHeader}>
      <IconButton onClick={onCopy} disabled={!hasSelection}>
        <Copy />
      </IconButton>
      <IconButton onClick={onPaste} disabled={!hasClipboard}>
        <Paste />
      </IconButton>
      <IconButton onClick={onDeleteSelection} disabled={!hasSelection}>
        <Delete />
      </IconButton>
    </TreeTableCell>

    <TreeTableCell>
      <EmptyMessage style={styles.addVariableMessage} />
    </TreeTableCell>

    <TreeTableCell style={styles.toolColumn}>
      <IconButton onClick={onAdd}>
        <Add />
      </IconButton>
    </TreeTableCell>
  </TreeTableRow>
);

export default EditVariableRow;
