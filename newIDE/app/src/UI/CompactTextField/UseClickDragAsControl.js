// @flow

import * as React from 'react';

type Props = {|
  onChange: number => void,
  onGetInitialValue: () => number,
|};

const useClickDragAsControl = ({ onChange, onGetInitialValue }: Props) => {
  const clickDragOrigin = React.useRef<?{|
    initialValue: number,
    accumulatedValue: number,
    previouslyChangedValue: ?number,
  |}>(null);

  const start = React.useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget;
      if (
        target instanceof Element &&
        // requestPointerLock does not exist no mobile devices.
        target.requestPointerLock
      ) {
        target.requestPointerLock();
        clickDragOrigin.current = {
          initialValue: onGetInitialValue(),
          accumulatedValue: 0,
          previouslyChangedValue: null,
        };
      }
    },
    [onGetInitialValue]
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
      if (newValue !== previouslyChangedValue) {
        if (!clickDragOrigin.current) return;
        clickDragOrigin.current.previouslyChangedValue = newValue;
        onChange(newValue);
      }
    },
    [onChange]
  );

  const clear = React.useCallback(() => {
    if (clickDragOrigin.current) {
      document.exitPointerLock();
      clickDragOrigin.current = null;
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseMove: onMove,
    onMouseUp: clear,
  };
};

export default useClickDragAsControl;
