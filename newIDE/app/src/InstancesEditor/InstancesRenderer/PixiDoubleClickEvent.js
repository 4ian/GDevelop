// @flow
import * as PIXI from 'pixi.js-legacy';

const moveTolerance = 10; // px
const doubleClickDelay = 500; //ms

/**
 * Add a 'doubleclick' event to the given PIXI DisplayObject,
 * which is emitted when the object is double tapped in less than
 * 500ms (using touch or mouse) on the same position (with a small tolerance).
 */
export const makeDoubleClickable = (pixiDisplayObject: PIXI.DisplayObject) => {
  let lastClickTime = 0;
  let lastClickGlobalX = 0;
  let lastClickGlobalY = 0;

  const handleTap = (event: PIXI.InteractionEvent) => {
    const { x, y } = event.data.global;
    const currentTime = Date.now();

    if (
      currentTime - lastClickTime < doubleClickDelay &&
      Math.abs(x - lastClickGlobalX) <= moveTolerance &&
      Math.abs(y - lastClickGlobalY) <= moveTolerance
    ) {
      // Wait for the next event cycle, as otherwise the "touchend"
      // event could be catched by a dialog/another component shown
      // as a result of the double click.
      setTimeout(() => {
        pixiDisplayObject.emit('doubleclick', event);
      });
    }

    lastClickTime = currentTime;
    lastClickGlobalX = x;
    lastClickGlobalY = y;
  };

  pixiDisplayObject.eventMode = 'static';
  pixiDisplayObject.addEventListener('click', handleTap);
  pixiDisplayObject.addEventListener('touchend', handleTap);
};
