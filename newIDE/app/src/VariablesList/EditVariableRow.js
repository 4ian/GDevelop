import React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import ContentCopy from 'material-ui/svg-icons/content/content-copy';
import ContentPaste from 'material-ui/svg-icons/content/content-paste';
import Delete from 'material-ui/svg-icons/action/delete';
import ObjectVar from 'material-ui/svg-icons/action/list';

import styles from './styles';

const EditVariableRow = ({
  onAdd,
  onCopy,
  hasSelection,
  onPaste,
  hasClipboard,
  onDeleteSelection,
  onEditObjectVariables,
}) => (
  <TreeTableRow key="add-row">
    <TreeTableCell style={styles.toolColumnHeader}>
      <IconButton onClick={onCopy} disabled={!hasSelection} tooltip={'Copy'}>
        <ContentCopy />
      </IconButton>
      <IconButton onClick={onPaste} disabled={!hasClipboard} tooltip={'Paste'}>
        <ContentPaste />
      </IconButton>
      <IconButton
        onClick={onDeleteSelection}
        disabled={!hasSelection}
        tooltip={'Delete'}
      >
        <Delete />
      </IconButton>
    </TreeTableCell>

    <TreeTableCell>
      <EmptyMessage style={styles.addVariableMessage} />
    </TreeTableCell>

    <TreeTableCell style={styles.toolColumn}>
      {onEditObjectVariables && (
        <IconButton
          onClick={onEditObjectVariables}
          tooltip={'Edit object variables'}
        >
          <ObjectVar />
        </IconButton>
      )}
      <IconButton onClick={onAdd} tooltip={'Add new variable'}>
        <Add />
      </IconButton>
    </TreeTableCell>
  </TreeTableRow>
);

export default EditVariableRow;
