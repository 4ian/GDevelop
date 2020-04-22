// @flow
import * as PIXI from 'pixi.js';

/**
 * Add a 'doubleclick' event to the given PIXI DisplayObject,
 * which is emitted when the object is double tapped in less than
 * 300ms (using touch or mouse).
 */
export const makeDoubleClickable = (pixiDisplayObject: PIXI.DisplayObject) => {
  let lastClickTime = 0;

  const handleTap = event => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 300) {
      pixiDisplayObject.emit('doubleclick', event);
    }
    lastClickTime = currentTime;
  };

  pixiDisplayObject.interactive = true;
  pixiDisplayObject.on('click', handleTap);
  pixiDisplayObject.on('touchend', handleTap);
};
