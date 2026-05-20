// @flow
import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

const touchBackendOptions = {
  // A small delay lets the touch backend distinguish a tap from a drag
  // without requiring the user to hold perfectly still. 50ms is short enough
  // that any intentional drag gesture will still trigger reliably on iOS.
  delayTouchStart: 50,
  // Also handle mouse events so that Android Chrome's compatibility mouse
  // events (fired after touch events) can trigger drags with no delay,
  // making dragging feel instant on Android.
  enableMouseEvents: true,
};

type Props = {|
  children: React.Node,

  /**
   * Specify the window when this provider is used in a popped-out window.
   */
  window?: ?any,
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
  window,
}: Props): React.Node => {
  const backendContext = React.useMemo(
    () => (window ? { window, document: window.document } : undefined),
    [window]
  );
  // The root element must be the document of the window
  // (can't be the body, the drag'n'drop events would not work).
  const rootElement = React.useMemo(
    () => (window ? window.document : undefined),
    [window]
  );

  const backendOptions = React.useMemo(
    () =>
      rootElement
        ? {
            ...touchBackendOptions,
            rootElement,
          }
        : touchBackendOptions,
    [rootElement]
  );

  return (
    <DndProvider
      backend={TouchBackend}
      options={backendOptions}
      context={backendContext}
    >
      {children}
    </DndProvider>
  );
};

export default DragAndDropContextProvider;
