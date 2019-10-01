import { Component } from 'react';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
import { DragDropContext } from 'react-dnd';

class DragAndDropContextProvider extends Component {
  render() {
    return this.props.children;
  }
}

/**
 * A react-dnd provider that automatically switch to react-dnd-touch-backend
 * when a touch event is recognized (react-dnd-html5-backend won't work on
 * touch devices like phones).
 *
 * When doing the switch from HTML5 backend to Touch backend, the existing events
 * are passed to the new backend. Unsure if this is necessary in GDevelop case.
 */
export default DragDropContext(MultiBackend(HTML5toTouch))(
  DragAndDropContextProvider
);
