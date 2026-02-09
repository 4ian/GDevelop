// @flow

import * as React from 'react';

type Props = {|
  onChange: number => void,
  onGetInitialValue: () => number,
|};

const useClickDragAsControl = ({onChange, onGetInitialValue}: Props): {
  onMouseDown: (e: any) => void,
  onMouseMove: (e: any) => void,
  onMouseUp: () => void,
} => {
  const clickDragOrigin = React.useRef<?{|
    initialValue: number,
    accumulatedValue: number,
    previouslyChangedValue: ?number,
  |}>(null);

  const start = React.useCallback(
    // $FlowFixMe[cannot-resolve-name]
    (e: MouseEvent) => {
      const target = e.currentTarget;
      if (
        // $FlowFixMe[cannot-resolve-name]
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
    // $FlowFixMe[cannot-resolve-name]
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

  const clear = React.useCallback(() => {
    if (clickDragOrigin.current) {
      // $FlowFixMe[cannot-resolve-name]
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
