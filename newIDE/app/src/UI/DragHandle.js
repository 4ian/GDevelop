import React from 'react';
import DragHandleIcon from 'material-ui/svg-icons/editor/drag-handle';
import { SortableHandle } from 'react-sortable-hoc';

const styles = {
  handle: {
    cursor: 'move',
    marginRight: 4,
  },
  handleColor: '#DDD',
};

const DragHandle = SortableHandle(() => (
  <span style={styles.handle}>
    <DragHandleIcon color={styles.handleColor} />
  </span>
));
export default DragHandle;
