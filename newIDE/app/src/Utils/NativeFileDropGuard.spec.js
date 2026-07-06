/**
 * @jest-environment jsdom
 */
// @noflow
import { installNativeFileDropGuard } from './NativeFileDropGuard';

const makeDragEvent = (
  type: string,
  { types, target }: { types: Array<string>, target?: any } = { types: [] }
) => {
  const event: any = new Event(type, { bubbles: true, cancelable: true });
  // jsdom does not attach a dataTransfer to Event, so provide a minimal stub.
  event.dataTransfer = { types };
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

  test('does not interfere with non-file drags (in-app drag and drop)', () => {
    cleanup = installNativeFileDropGuard(document);

    const dragOver = makeDragEvent('dragover', { types: ['text/plain'] });
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

  test('handles a DOMStringList-like types object', () => {
    cleanup = installNativeFileDropGuard(document);

    const domStringListLike: any = {
      length: 1,
      0: 'Files',
      contains: (value: string) => value === 'Files',
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
