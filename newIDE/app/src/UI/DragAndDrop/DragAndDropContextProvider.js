// @flow
import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

const touchBackendOptions = {
  delayTouchStart: 100,
  enableMouseEvents: true,
};

type Props = {|
  children: React.Node,
|};

/**
 * A react-dnd provider using react-dnd-touch-backend which supports
 * both touch and mouse events (with enableMouseEvents: true).
 *
 * HTML5 backend was removed because it doesn't work with the iframe
 * showing the embedded game.
 */
const DragAndDropContextProvider = ({ children }: Props): React.Node => (
  <DndProvider backend={TouchBackend} options={touchBackendOptions}>
    {children}
  </DndProvider>
);

export default DragAndDropContextProvider;
