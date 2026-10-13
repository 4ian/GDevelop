// @flow

import * as React from 'react';

type Props = {|
  onChange: number => void,
  onGetInitialValue: () => number,
|};

const useClickDragAsControl = ({
  onChange,
  onGetInitialValue,
}: Props): {
  onMouseDown: (e: MouseEvent) => void,
  onMouseMove: (e: MouseEvent) => void,
  onMouseUp: () => void,
} => {
  const clickDragOrigin = React.useRef<?{|
    initialValue: number,
    accumulatedValue: number,
    previouslyChangedValue: ?number,
  |}>(null);
  // The element for which the pointer lock was requested. The lock is granted
  // asynchronously by the browser, so it can be granted after the drag ended
  // (in case of a quick click), or never be granted at all.
  const lockTarget = React.useRef<?Element>(null);
  // Listeners attached to the document while a drag is in progress.
  const removeDocumentListeners = React.useRef<?() => void>(null);

  const exitPointerLockIfOwned = React.useCallback(() => {
    const target = lockTarget.current;
    if (target && target.ownerDocument.pointerLockElement === target) {
      target.ownerDocument.exitPointerLock();
    }
  }, []);

  const stop = React.useCallback(
    () => {
      clickDragOrigin.current = null;
      exitPointerLockIfOwned();
      if (removeDocumentListeners.current) {
        removeDocumentListeners.current();
        removeDocumentListeners.current = null;
      }
    },
    [exitPointerLockIfOwned]
  );

  const addDocumentListeners = React.useCallback(
    () => {
      if (removeDocumentListeners.current) return;

      const ownerDocument = lockTarget.current
        ? lockTarget.current.ownerDocument
        : null;
      if (!ownerDocument) return;

      // The mouse up can happen outside of the element (for example if the
      // pointer lock was not granted and the cursor left the element), so
      // listen on the whole document. Listeners are kept until the pointer
      // lock is released or fails, as the lock can be granted after the mouse up.
      const onDocumentMouseUp = () => {
        clickDragOrigin.current = null;
        exitPointerLockIfOwned();
      };

      const onPointerLockChange = () => {
        if (!lockTarget.current) return;

        if (ownerDocument.pointerLockElement === lockTarget.current) {
          // The lock was granted. If the drag already ended (quick click),
          // release the lock immediately: otherwise, it would stay active and
          // hijack all mouse events in the window (the cursor is hidden and
          // the canvas or any other element never receive clicks).
          if (!clickDragOrigin.current) {
            ownerDocument.exitPointerLock();
          }
        } else {
          // The lock was released (mouse up, Escape key pressed, window
          // blurred...): ensure the drag is ended.
          lockTarget.current = null;
          stop();
        }
      };

      const onPointerLockError = () => {
        // Keep the drag going without pointer lock, but forget the target
        // so that we don't try to exit a lock we don't own.
        lockTarget.current = null;
        if (!clickDragOrigin.current) stop();
      };

      ownerDocument.addEventListener('mouseup', onDocumentMouseUp);
      ownerDocument.addEventListener('pointerlockchange', onPointerLockChange);
      ownerDocument.addEventListener('pointerlockerror', onPointerLockError);
      removeDocumentListeners.current = () => {
        ownerDocument.removeEventListener('mouseup', onDocumentMouseUp);
        ownerDocument.removeEventListener(
          'pointerlockchange',
          onPointerLockChange
        );
        ownerDocument.removeEventListener(
          'pointerlockerror',
          onPointerLockError
        );
      };
    },
    [stop, exitPointerLockIfOwned]
  );

  const start = React.useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget;
      if (
        target instanceof Element &&
        // requestPointerLock does not exist no mobile devices.
        // $FlowFixMe[method-unbinding]
        target.requestPointerLock
      ) {
        lockTarget.current = target;
        clickDragOrigin.current = {
          initialValue: onGetInitialValue(),
          accumulatedValue: 0,
          previouslyChangedValue: null,
        };
        addDocumentListeners();
        try {
          // Can return a promise (rejected if the lock is denied) in recent browsers.
          const maybePromise: any = target.requestPointerLock();
          if (maybePromise && typeof maybePromise.catch === 'function') {
            maybePromise.catch(() => {});
          }
        } catch (error) {
          // Ignore: the control will still work using mouse movements, just
          // without the cursor being hidden.
        }
      }
    },
    [onGetInitialValue, addDocumentListeners]
  );

  const onMove = React.useCallback(
    (e: MouseEvent) => {
      if (!clickDragOrigin.current) return;

      const { initialValue, previouslyChangedValue } = clickDragOrigin.current;
      clickDragOrigin.current.accumulatedValue +=
        e.movementX /
        // Sensitivity setting
        2;
      const newValue =
        Math.round(clickDragOrigin.current.accumulatedValue) + initialValue;
      const numberOfDecimalPlaces = (
        initialValue.toString().split('.')[1] || ''
      ).length;
      const newValueWithRightDecimalPlaces = parseFloat(
        newValue.toFixed(numberOfDecimalPlaces)
      );
      if (newValueWithRightDecimalPlaces !== previouslyChangedValue) {
        if (!clickDragOrigin.current) return;
        clickDragOrigin.current.previouslyChangedValue = newValueWithRightDecimalPlaces;
        onChange(newValueWithRightDecimalPlaces);
      }
    },
    [onChange]
  );

  const clear = React.useCallback(
    () => {
      // Keep the lock target until the pointer lock is actually released: the
      // lock can still be granted after this (quick click), in which case it
      // must be released as soon as it's granted (see onPointerLockChange).
      clickDragOrigin.current = null;
      exitPointerLockIfOwned();
    },
    [exitPointerLockIfOwned]
  );

  // Never leave a pointer lock active or document listeners attached after
  // the field is unmounted (for example, if the selection changed while
  // dragging).
  React.useEffect(
    () => () => {
      stop();
      lockTarget.current = null;
    },
    [stop]
  );

  return {
    onMouseDown: start,
    onMouseMove: onMove,
    onMouseUp: clear,
  };
};

export default useClickDragAsControl;
