import React from 'react';
import DragHandleIcon from '@material-ui/icons/DragHandle';
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
    <DragHandleIcon htmlColor={styles.handleColor} />
  </span>
));
export default DragHandle;
