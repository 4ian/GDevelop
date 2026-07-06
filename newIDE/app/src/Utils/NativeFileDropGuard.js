// @flow

/**
 * Installs a document-level guard that keeps the whole window a valid drop
 * target for native OS file drags.
 *
 * Why this is needed (and why native image drops onto the scene canvas worked
 * on macOS but silently failed on Windows):
 *
 * The scene canvas registers its own `dragover`/`drop` handlers, but only on
 * its wrapper element. On Windows, Chromium is strict about drag'n'drop:
 *  - The `drop` event only fires on an element if a `dragover` handler called
 *    `preventDefault()` along the *whole* drag path. When a file enters the
 *    window, the first `dragover` events land on the toolbar/panels (which
 *    have no handler), so Windows flags the drag as "not allowed" (the no-drop
 *    cursor) and then rejects the drop even once the pointer reaches the
 *    canvas.
 *  - A file dropped on any region that is not a valid drop target makes
 *    Chromium navigate to (open) that file by default, which unloads the app.
 *
 * macOS is far more forgiving, which is why the same code worked there.
 *
 * Calling `preventDefault()` at the document level for native file drags fixes
 * both problems: it marks the window as a valid drop target so the canvas
 * `drop` handler reliably fires, and it prevents the navigate-to-file default.
 *
 * The guard only acts on native *file* drags (`dataTransfer.types` contains
 * 'Files'), so it never interferes with in-app drag'n'drop (react-dnd, which
 * uses mouse/touch events, not HTML5 drag events) nor with legitimate drops of
 * text/selection into inputs.
 */

// A drop onto a native <input type="file"> is handled by the browser itself
// (it populates the input's files). We must NOT preventDefault such drops, or
// the input would never receive the files. Detect if the event happens on (or
// inside) a file input so we can leave it fully untouched.
// The event is typed as `any` because the DOM Flow lib types `event.target` as
// a bare EventTarget without `closest` (same approach as SpritesList.js).
const isEventOnFileInput = (event: any): boolean => {
  const target = event.target;
  if (!target || typeof target.closest !== 'function') return false;
  return !!target.closest('input[type="file"]');
};

const dragEventHasNativeFiles = (event: any): boolean => {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer || !dataTransfer.types) return false;
  const types = dataTransfer.types;

  // `types` is usually an array in Chromium, but can be a DOMStringList
  // depending on the platform/context: handle both.
  if (typeof types.includes === 'function') {
    return types.includes('Files');
  }
  if (typeof types.contains === 'function') {
    return types.contains('Files');
  }
  for (let index = 0; index < types.length; index++) {
    if (types[index] === 'Files') return true;
  }
  return false;
};

/**
 * @param targetDocument The document to protect (main window or a popped-out
 * editor window's document).
 * @returns A cleanup function removing the installed listeners.
 */
export const installNativeFileDropGuard = (
  targetDocument: any
): (() => void) => {
  const onDragOver = (event: any) => {
    if (!dragEventHasNativeFiles(event)) return;
    if (isEventOnFileInput(event)) return;
    // Required on Windows so the drop event is allowed to fire on the actual
    // drop targets (e.g. the scene canvas), and to stop navigate-to-file.
    event.preventDefault();
  };
  const onDrop = (event: any) => {
    if (!dragEventHasNativeFiles(event)) return;
    if (isEventOnFileInput(event)) return;
    // Prevent Chromium from navigating to / opening a file dropped outside a
    // drop target (which would unload the app). Specific drop targets such as
    // the scene canvas handle and stop propagation of the event before it
    // reaches here, so this only affects drops that nothing else consumed.
    event.preventDefault();
  };

  // Use the capture phase so `preventDefault()` is guaranteed to run for every
  // native file drag, regardless of where React attaches its own listeners.
  // We intentionally do not call `stopPropagation()`, so the canvas's own
  // handlers still receive the event and create the sprite.
  targetDocument.addEventListener('dragenter', onDragOver, true);
  targetDocument.addEventListener('dragover', onDragOver, true);
  targetDocument.addEventListener('drop', onDrop, true);

  return () => {
    targetDocument.removeEventListener('dragenter', onDragOver, true);
    targetDocument.removeEventListener('dragover', onDragOver, true);
    targetDocument.removeEventListener('drop', onDrop, true);
  };
};
