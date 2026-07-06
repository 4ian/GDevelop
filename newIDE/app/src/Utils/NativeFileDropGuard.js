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
 * Calling `preventDefault()` at the document level fixes both problems: it
 * marks the window as a valid drop target so the canvas `drop` handler reliably
 * fires, and it prevents the navigate-to-file default.
 *
 * Robustness note: we deliberately do NOT rely on positively detecting
 * `dataTransfer.types` containing 'Files' during `dragover`. On some Windows
 * configurations the drag data is in "protected mode" during `dragover` and the
 * type list is not reliably populated, so gating `preventDefault()` on it would
 * bring back the no-drop cursor. Instead we prevent the default for every drag
 * that is not explicitly one we must leave to the browser:
 *  - drags over a native <input type="file"> (the browser fills its files),
 *  - drags over an editable field (text can be dropped into it),
 *  - internal GDevelop drags (e.g. project files moved in the resources panel).
 *
 * This is safe because in-app drag'n'drop uses react-dnd's Touch backend, which
 * relies on mouse/touch events, not HTML5 drag events — so it produces no
 * `dragover`/`drop` events here at all.
 */

// Internal GDevelop drags (e.g. dragging a project file in the resources panel)
// set this custom MIME type. We must not interfere with them.
const internalDragDataType = 'application/x-gdevelop-project-file';

// The event is typed as `any` because the DOM Flow lib types `event.target` as
// a bare EventTarget without `closest` (same approach as SpritesList.js).
const isEventOnUninterceptableTarget = (event: any): boolean => {
  const target = event.target;
  if (!target || typeof target.closest !== 'function') return false;
  // A drop onto a native file input is handled by the browser itself (it
  // populates the input's files); an editable field can legitimately receive a
  // dropped text/selection. Leave both untouched.
  return !!target.closest(
    'input[type="file"], input, textarea, [contenteditable="true"]'
  );
};

const typesInclude = (types: any, value: string): boolean => {
  if (!types) return false;
  if (typeof types.includes === 'function') return types.includes(value);
  if (typeof types.contains === 'function') return types.contains(value);
  for (let index = 0; index < types.length; index++) {
    if (types[index] === value) return true;
  }
  return false;
};

const isInternalDrag = (event: any): boolean => {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return false;
  return typesInclude(dataTransfer.types, internalDragDataType);
};

const dragEventHasNativeFiles = (event: any): boolean => {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return false;
  if (typesInclude(dataTransfer.types, 'Files')) return true;
  // Fallback: inspect the items list, which can expose file entries even when
  // the type list does not during a drag.
  const items = dataTransfer.items;
  if (items && items.length) {
    for (let index = 0; index < items.length; index++) {
      if (items[index] && items[index].kind === 'file') return true;
    }
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
  // TEMPORARY DIAGNOSTIC LOGGING (remove once the Windows drop is confirmed).
  // Proves whether this guard is actually loaded and whether its handlers run.
  // eslint-disable-next-line no-console
  console.info('[NativeFileDropGuard] installed on', targetDocument);
  let loggedOnce = false;

  const onDragOverOrEnter = (event: any) => {
    if (!loggedOnce) {
      loggedOnce = true;
      let types: Array<string> = [];
      try {
        types = Array.from(
          (event.dataTransfer && event.dataTransfer.types) || []
        );
      } catch (error) {
        /* ignore */
      }
      // eslint-disable-next-line no-console
      console.info('[NativeFileDropGuard] first drag event', {
        type: event.type,
        types,
        internal: isInternalDrag(event),
        onUninterceptable: isEventOnUninterceptableTarget(event),
      });
    }

    // Leave internal GDevelop drags and browser-native targets alone.
    if (isInternalDrag(event)) return;
    if (isEventOnUninterceptableTarget(event)) return;

    // Required on Windows so the drop event is allowed to fire on the actual
    // drop targets (e.g. the scene canvas), and to stop navigate-to-file.
    event.preventDefault();
    // Show the "copy" cursor when we can tell files are being dragged.
    if (event.dataTransfer && dragEventHasNativeFiles(event)) {
      try {
        event.dataTransfer.dropEffect = 'copy';
      } catch (error) {
        // Some browsers disallow setting dropEffect in certain phases; ignore.
      }
    }
  };
  const onDrop = (event: any) => {
    if (isInternalDrag(event)) return;
    if (isEventOnUninterceptableTarget(event)) return;

    // Prevent Chromium from navigating to / opening a file dropped outside a
    // drop target (which would unload the app). Specific drop targets such as
    // the scene canvas handle the event and create the sprite; we do not call
    // stopPropagation(), so they still receive it.
    event.preventDefault();
  };

  // Use the capture phase so `preventDefault()` is guaranteed to run for every
  // drag, regardless of where React attaches its own listeners. We intentionally
  // do not call `stopPropagation()`, so the canvas's own handlers still receive
  // the event and create the sprite.
  targetDocument.addEventListener('dragenter', onDragOverOrEnter, true);
  targetDocument.addEventListener('dragover', onDragOverOrEnter, true);
  targetDocument.addEventListener('drop', onDrop, true);

  return () => {
    targetDocument.removeEventListener('dragenter', onDragOverOrEnter, true);
    targetDocument.removeEventListener('dragover', onDragOverOrEnter, true);
    targetDocument.removeEventListener('drop', onDrop, true);
  };
};
