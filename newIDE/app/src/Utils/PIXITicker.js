import * as PIXI from 'pixi.js';

// PIXI has a ticker that is used by PIXI InteractionManager, and which
// frequently check if interaction happened. We may want to disable it
// when it's useless to do these interaction checks to save CPU usage.

/**
 *  Stop the PIXI Ticker used to monitor interactions
 */
export const stopPIXITicker = () => {
  const ticker = PIXI.ticker && PIXI.ticker.shared;
  if (ticker) ticker.stop();
};

/**
 * Start the PIXI Ticker used to monitor interactions
 */
export const startPIXITicker = () => {
  // Timeout ensure that the ticker is started even if other components
  // call stopPIXITicker during the same tick (for example, when switching
  // between SceneEditor tabs).
  setTimeout(() => {
    const ticker = PIXI.ticker && PIXI.ticker.shared;
    if (ticker) ticker.start();
  }, 50);
};
