import { Component } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import MultiBackend, { TouchTransition } from 'react-dnd-multi-backend';
import { DragDropContext } from 'react-dnd';

// react-dnd-multi-backend/lib/HTML5toTouch is not used directly in order to
// be able to specify the delayTouchStart parameter of the TouchBackend.
const HTML5toTouch = {
  backends: [
    {
      backend: HTML5Backend,
    },
    {
      backend: TouchBackend({ delayTouchStart: 100 }),
      preview: true,
      transition: TouchTransition,
    },
  ],
};

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
