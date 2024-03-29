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
  |}>(null);

  const start = React.useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget;
      if (target instanceof Element) {
        target.requestPointerLock();
        clickDragOrigin.current = {
          initialValue: onGetInitialValue(),
          accumulatedValue: 0,
        };
      }
    },
    [onGetInitialValue]
  );

  const onMove = React.useCallback(
    (e: MouseEvent) => {
      if (clickDragOrigin.current) {
        const { initialValue } = clickDragOrigin.current;
        clickDragOrigin.current.accumulatedValue +=
          e.movementX /
          // Sensitivity setting
          2;
        onChange(
          Math.round(clickDragOrigin.current.accumulatedValue) + initialValue
        );
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
