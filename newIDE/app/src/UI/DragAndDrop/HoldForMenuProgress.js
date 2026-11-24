// @flow
import * as React from 'react';
import classes from './HoldForMenuProgress.module.css';
import {
  getCurrentGestureStartPosition,
  LONG_PRESS_DELAY_ON_HELD_ITEM,
  TOUCH_DRAG_START_DELAY,
} from './TouchDragDelay';

// The circle only appears a moment after the item is ready to be dragged
// (when this is shown): someone who drags right away never sees it, only
// someone keeping the finger pressed gets the hint.
const delayInMs = 250;
// It is full when the long press opens the menu.
const durationInMs =
  LONG_PRESS_DELAY_ON_HELD_ITEM - TOUCH_DRAG_START_DELAY - delayInMs;

type RippleGeometry = {| x: number, y: number, diameter: number |};

/**
 * Show, on an item held by a finger and ready to be dragged, that keeping
 * the finger pressed will open the context menu. To render inside a
 * positioned element, while `isReadyToDrag` is true.
 */
const HoldForMenuProgress = (): React.Node => {
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const [geometry, setGeometry] = React.useState<?RippleGeometry>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const fingerPosition = getCurrentGestureStartPosition();
    if (!container || !fingerPosition) return;

    // Center the circle on the finger, large enough to cover the item.
    const rect = container.getBoundingClientRect();
    const x = fingerPosition.x - rect.left;
    const y = fingerPosition.y - rect.top;
    const radius = Math.hypot(
      Math.max(x, rect.width - x),
      Math.max(y, rect.height - y)
    );
    setGeometry({ x, y, diameter: radius * 2 });
  }, []);

  return (
    <div className={classes.container} ref={containerRef}>
      {geometry && (
        <div
          className={classes.ripple}
          style={{
            left: geometry.x,
            top: geometry.y,
            width: geometry.diameter,
            height: geometry.diameter,
            animationDelay: `${delayInMs}ms`,
            animationDuration: `${durationInMs}ms`,
          }}
        />
      )}
    </div>
  );
};

export default HoldForMenuProgress;
