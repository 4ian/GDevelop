import React from 'react';
import { SortableHandle } from 'react-sortable-hoc';

const styles = {
  handle: {
    color: '#BBB',
    fontSize: 15,
    cursor: 'move',
  },
};

const DragHandle = SortableHandle(() => <span style={styles.handle}>::</span>);
export default DragHandle;
