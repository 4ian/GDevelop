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
   * Optional context providing the window/document for the TouchBackend.
   * When rendering in a popped-out window, pass the external window so that
   * event listeners and element-from-point lookups are scoped to that window.
   *
   * When set, a separate react-dnd manager is created (via a unique
   * `context` passed to DndProvider) so that it doesn't conflict with the
   * main window's manager.
   */
  externalWindow?: ?any,
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
  externalWindow,
}: Props): React.Node => {
  // When an externalWindow is provided (i.e. for a popped-out window), we
  // pass a unique `context` object to DndProvider so that:
  // 1. It creates its own DragDropManager instead of reusing the singleton.
  // 2. The TouchBackend's OptionsReader reads context.window and
  //    context.document, so rootElement defaults to the external Document
  //    (matching the main window's pattern) and elementFromPoint calls
  //    are scoped to the correct document.
  const dndContext = React.useMemo(() => {
    if (!externalWindow) return undefined;
    return {
      window: externalWindow,
      document: externalWindow.document,
    };
  }, [externalWindow]);

  return (
    <DndProvider
      backend={TouchBackend}
      options={touchBackendOptions}
      context={dndContext}
    >
      {children}
    </DndProvider>
  );
};

export default DragAndDropContextProvider;
