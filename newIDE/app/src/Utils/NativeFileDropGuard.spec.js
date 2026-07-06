/**
 * @jest-environment jsdom
 */
// @noflow
import { installNativeFileDropGuard } from './NativeFileDropGuard';

const makeDragEvent = (type, { types = [], items, files, target } = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  // jsdom does not attach a dataTransfer to Event, so provide a minimal stub.
  event.dataTransfer = { types, items, files };
  if (target) {
    Object.defineProperty(event, 'target', { value: target, writable: false });
  }
  return event;
};

describe('NativeFileDropGuard', () => {
  let cleanup;

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  test('prevents default for native file drags (so Windows fires the drop)', () => {
    cleanup = installNativeFileDropGuard(document);

    const dragOver = makeDragEvent('dragover', { types: ['Files'] });
    document.dispatchEvent(dragOver);
    expect(dragOver.defaultPrevented).toBe(true);

    const drop = makeDragEvent('drop', { types: ['Files'] });
    document.dispatchEvent(drop);
    expect(drop.defaultPrevented).toBe(true);
  });

  test('prevents default even when the type list is empty (protected mode)', () => {
    // On Windows the drag data can be in "protected mode" during dragover with
    // an empty type list; we must still preventDefault so the drop is allowed.
    cleanup = installNativeFileDropGuard(document);

    const dragOver = makeDragEvent('dragover', { types: [] });
    document.dispatchEvent(dragOver);
    expect(dragOver.defaultPrevented).toBe(true);
  });

  test('does not interfere with internal GDevelop drags', () => {
    cleanup = installNativeFileDropGuard(document);

    const dragOver = makeDragEvent('dragover', {
      types: ['application/x-gdevelop-project-file', 'text/plain'],
    });
    document.dispatchEvent(dragOver);
    expect(dragOver.defaultPrevented).toBe(false);
  });

  test('leaves drops onto a native file input to the browser', () => {
    const input = document.createElement('input');
    input.type = 'file';
    document.body.appendChild(input);

    cleanup = installNativeFileDropGuard(document);

    const drop = makeDragEvent('drop', { types: ['Files'], target: input });
    document.dispatchEvent(drop);
    expect(drop.defaultPrevented).toBe(false);

    document.body.removeChild(input);
  });

  test('leaves drops onto editable fields to the browser', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    cleanup = installNativeFileDropGuard(document);

    const drop = makeDragEvent('drop', {
      types: ['text/plain'],
      target: textarea,
    });
    document.dispatchEvent(drop);
    expect(drop.defaultPrevented).toBe(false);

    document.body.removeChild(textarea);
  });

  test('detects files via the items list when types is empty', () => {
    cleanup = installNativeFileDropGuard(document);

    const dragOver = makeDragEvent('dragover', {
      types: [],
      items: [{ kind: 'file', type: 'image/png' }],
    });
    let assignedDropEffect;
    dragOver.dataTransfer = {
      types: [],
      items: [{ kind: 'file', type: 'image/png' }],
      set dropEffect(value) {
        assignedDropEffect = value;
      },
      get dropEffect() {
        return assignedDropEffect;
      },
    };
    document.dispatchEvent(dragOver);
    expect(dragOver.defaultPrevented).toBe(true);
    expect(assignedDropEffect).toBe('copy');
  });

  test('handles a DOMStringList-like types object', () => {
    cleanup = installNativeFileDropGuard(document);

    const domStringListLike = {
      length: 1,
      0: 'Files',
      contains: value => value === 'Files',
    };
    const dragOver = makeDragEvent('dragover');
    dragOver.dataTransfer = { types: domStringListLike };
    document.dispatchEvent(dragOver);
    expect(dragOver.defaultPrevented).toBe(true);
  });

  test('cleanup removes the listeners', () => {
    const localCleanup = installNativeFileDropGuard(document);
    localCleanup();

    const dragOver = makeDragEvent('dragover', { types: ['Files'] });
    document.dispatchEvent(dragOver);
    expect(dragOver.defaultPrevented).toBe(false);
  });
});
