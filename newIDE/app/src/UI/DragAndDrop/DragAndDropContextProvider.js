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
   *
   * When set, a separate react-dnd manager is created (via a unique
   * `context` passed to DndProvider) so that it doesn't conflict with the
   * main window's manager.
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

  // When a rootElement is provided (i.e. for a popped-out window), we pass
  // a unique `context` object to DndProvider so that it creates its own
  // DragDropManager instead of reusing the singleton stored on the global
  // object. The context is also forwarded to the TouchBackend's
  // OptionsReader, which reads `context.window` and `context.document`
  // from it to scope element-from-point lookups correctly.
  const dndContext = React.useMemo(() => {
    if (!rootElement) return undefined;
    // $FlowFixMe - rootElement is the external Window object here.
    const externalWindow = rootElement;
    return { window: externalWindow, document: externalWindow.document };
  }, [rootElement]);

  return (
    <DndProvider
      backend={TouchBackend}
      options={options}
      context={dndContext}
    >
      {children}
    </DndProvider>
  );
};

export default DragAndDropContextProvider;
