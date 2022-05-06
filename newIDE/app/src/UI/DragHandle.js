// @flow
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

type Props = {|
  disabled: boolean,
  color?: string,
|};

const DragHandle = SortableHandle((props: Props) => (
  <span style={props.disabled ? styles.disabledHandle : styles.handle}>
    <DragHandleIcon htmlColor={props.color || styles.handleColor} />
  </span>
));

export default DragHandle;
