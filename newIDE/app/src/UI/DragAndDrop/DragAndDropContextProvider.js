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
  /**
   * Optional root element for the TouchBackend to bind event listeners to.
   * When rendering in a popped-out window, pass the external window object
   * so that drag events are captured on the correct document.
   */
  rootElement?: ?EventTarget,
|};

/**
 * A react-dnd provider using react-dnd-touch-backend which supports
 * both touch and mouse events (with enableMouseEvents: true).
 *
 * HTML5 backend was removed because it doesn't work with the iframe
 * showing the embedded game.
 */
const DragAndDropContextProvider = ({
  children,
  rootElement,
}: Props): React.Node => {
  const options = React.useMemo(
    () =>
      rootElement
        ? { ...touchBackendOptions, rootElement }
        : touchBackendOptions,
    [rootElement]
  );

  return (
    <DndProvider backend={TouchBackend} options={options}>
      {children}
    </DndProvider>
  );
};

export default DragAndDropContextProvider;
