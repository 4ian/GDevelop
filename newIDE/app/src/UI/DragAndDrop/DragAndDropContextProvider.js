import { Component } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

class DragAndDropContextProvider extends Component {
  render() {
    return this.props.children;
  }
}

export default DragDropContext(HTML5Backend)(DragAndDropContextProvider);
