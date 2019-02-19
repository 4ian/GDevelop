import React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import ContentPaste from 'material-ui/svg-icons/content/content-paste';
import Delete from 'material-ui/svg-icons/action/delete';

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
        <ContentCopy />
      </IconButton>
      <IconButton onClick={onPaste} disabled={!hasClipboard}>
        <ContentPaste />
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
