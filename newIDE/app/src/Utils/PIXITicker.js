import * as PIXI from 'pixi.js-legacy';

// PIXI has a ticker that is used by PIXI InteractionManager, and which
// frequently check if interaction happened. We may want to disable it
// when it's useless to do these interaction checks to save CPU usage.
// TODO: We might not need this anymore since PIXI v7 dropped the use of
// InteractionManager in favor of EventSystem that does not seem
// to use a ticker.

/**
 *  Stop the PIXI Ticker used to monitor interactions
 */
export const stopPIXITicker = () => {
  const ticker = PIXI.Ticker && PIXI.Ticker.shared;
  if (ticker) ticker.stop();
  // TODO: same for the PIXI.Ticker.system
};

/**
 * Start the PIXI Ticker used to monitor interactions
 */
export const startPIXITicker = () => {
  // Timeout ensure that the ticker is started even if other components
  // call stopPIXITicker during the same tick (for example, when switching
  // between SceneEditor tabs).
  setTimeout(() => {
    const ticker = PIXI.Ticker && PIXI.Ticker.shared;
    if (ticker) ticker.start();
    // TODO: same for the PIXI.Ticker.system
  }, 50);
};
