import React from 'react';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import { SortableHandle } from 'react-sortable-hoc';

const styles = {
  handle: {
    display: 'flex',
    cursor: 'move',
  },
  disabledHandle: {
    display: 'flex',
    opacity: 0.4,
  },
  handleColor: '#DDD',
};

const DragHandle = SortableHandle(props => (
  <span style={props.disabled ? styles.disabledHandle : styles.handle}>
    <DragHandleIcon htmlColor={styles.handleColor} />
  </span>
));
export default DragHandle;
