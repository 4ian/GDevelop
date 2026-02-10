// @flow
import React from 'react';
import MUIDragHandleIcon from '@material-ui/icons/DragHandle';
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
  disabled?: boolean,
  color?: string,
|};

// $FlowFixMe[signature-verification-failure]
export const DragHandleIcon = (props: Props) => (
  <span style={props.disabled ? styles.disabledHandle : styles.handle}>
    <MUIDragHandleIcon htmlColor={props.color || styles.handleColor} />
  </span>
);

// $FlowFixMe[signature-verification-failure]
const DragHandle = SortableHandle(DragHandleIcon);

export default DragHandle;
