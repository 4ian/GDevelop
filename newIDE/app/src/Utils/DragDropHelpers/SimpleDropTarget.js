import { Component } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropTarget } from 'react-dnd';

class SimpleDropTarget extends Component {
  render() {
    const { connectDropTarget } = this.props;
    return connectDropTarget(this.props.children);
  }
}

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType(),
  };
}
const spec = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      // If you want, you can check whether some nested
      // target already handled drop
      return;
    }

    const item = monitor.getItem();
    return { item };
  },
};

export default DropTarget(NativeTypes.TEXT, spec, collect)(SimpleDropTarget);
