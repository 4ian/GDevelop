/**
 * The renderer for a gdjs.RuntimeGame using Pixi.js.
 * @class RuntimeGamePixiRenderer
 * @memberof gdjs
 * @param {gdjs.RuntimeGame} game The game that is being rendered
 * @param {boolean} forceFullscreen If fullscreen should be always activated
 */
gdjs.RuntimeGamePixiRenderer = function(game, forceFullscreen) {
  this._game = game;

  this._isFullPage = true; //Used to track if the canvas is displayed on the full page.
  this._isFullscreen = false; //Used to track if the window is displayed as fullscreen (see setFullscreen method).
  this._forceFullscreen = forceFullscreen; //If set to true, the canvas will always be displayed as fullscreen, even if _isFullscreen == false.

  /** @type {PIXI.SystemRenderer} */
  this._pixiRenderer = null;
  this._canvasWidth = 0; // Current width of the canvas (might be scaled down/up compared to renderer)
  this._canvasHeight = 0; // Current height of the canvas (might be scaled down/up compared to renderer)
  this._keepRatio = true;
  this._marginLeft = this._marginTop = this._marginRight = this._marginBottom = 0;
};

gdjs.RuntimeGameRenderer = gdjs.RuntimeGamePixiRenderer; //Register the class to let the engine use it.

/**
 * Create a standard canvas inside canvasArea.
 *
 */
gdjs.RuntimeGamePixiRenderer.prototype.createStandardCanvas = function(
  parentElement
) {
  //This prevents flickering on some mobile devices
  PIXI.glCore.VertexArrayObject.FORCE_NATIVE = true;

  //Create the renderer and setup the rendering area
  //"preserveDrawingBuffer: true" is needed to avoid flickering and background issues on some mobile phones (see #585 #572 #566 #463)
  this._pixiRenderer = PIXI.autoDetectRenderer(
    this._game.getGameResolutionWidth(),
    this._game.getGameResolutionHeight(),
    {
      preserveDrawingBuffer: true,
      antialias: false,
    }
  );
  parentElement.appendChild(this._pixiRenderer.view); // add the renderer view element to the DOM
  this._pixiRenderer.view.style['position'] = 'absolute';
  this._pixiRenderer.view.tabindex = '1'; //Ensure that the canvas has the focus.
  this._resizeCanvas();

  // Handle scale mode
  if (this._game.getScaleMode() === 'nearest') {
    this._pixiRenderer.view.style['image-rendering'] = '-moz-crisp-edges';
    this._pixiRenderer.view.style['image-rendering'] =
      '-webkit-optimize-contrast';
    this._pixiRenderer.view.style['image-rendering'] = '-webkit-crisp-edges';
    this._pixiRenderer.view.style['image-rendering'] = 'pixelated';
  }

  //Handle resize
  var that = this;
  window.addEventListener('resize', function() {
    that._game.onWindowInnerSizeChanged();
    that._resizeCanvas();
    that._game._notifySceneForResize = true;
  });

  return this._pixiRenderer;
};

gdjs.RuntimeGamePixiRenderer.getWindowInnerWidth = function() {
  return typeof window !== 'undefined' ? window.innerWidth : 800;
};

gdjs.RuntimeGamePixiRenderer.getWindowInnerHeight = function() {
  return typeof window !== 'undefined' ? window.innerHeight : 800;
};

/**
 * Update the game renderer size according to the "game resolution".
 * Called when game resolution changes.
 *
 * Note that if the canvas is fullscreen, it won't be resized, but when going back to
 * non fullscreen mode, the requested size will be used.
 */
gdjs.RuntimeGamePixiRenderer.prototype.updateRendererSize = function() {
  this._resizeCanvas();
};

/**
 * Resize the renderer (the "game resolution") and the canvas (which can be larger
 * or smaller to fill the page, with optional margins).
 *
 * @private
 */
gdjs.RuntimeGamePixiRenderer.prototype._resizeCanvas = function() {
  // Set the Pixi renderer size to the game size.
  // There is no "smart" resizing to be done here: the rendering of the game
  // should be done with the size set on the game.
  if (
    this._pixiRenderer.width !== this._game.getGameResolutionWidth() ||
    this._pixiRenderer.height !== this._game.getGameResolutionHeight()
  ) {
    this._pixiRenderer.resize(
      this._game.getGameResolutionWidth(),
      this._game.getGameResolutionHeight()
    );
  }

  // Set the canvas size.
  // Resizing is done according to the settings. This is a "CSS" resize
  // only, so won't create visual artifacts during the rendering.
  var isFullPage =
    this._forceFullscreen || this._isFullPage || this._isFullscreen;
  var canvasWidth = this._game.getGameResolutionWidth();
  var canvasHeight = this._game.getGameResolutionHeight();
  var maxWidth = window.innerWidth - this._marginLeft - this._marginRight;
  var maxHeight = window.innerHeight - this._marginTop - this._marginBottom;
  if (maxWidth < 0) maxWidth = 0;
  if (maxHeight < 0) maxHeight = 0;

  if (isFullPage && !this._keepRatio) {
    canvasWidth = maxWidth;
    canvasHeight = maxHeight;
  } else if (
    (isFullPage && this._keepRatio) ||
    canvasWidth > maxWidth ||
    canvasHeight > maxHeight
  ) {
    var factor = maxWidth / canvasWidth;
    if (canvasHeight * factor > maxHeight) factor = maxHeight / canvasHeight;

    canvasWidth *= factor;
    canvasHeight *= factor;
  }

  this._pixiRenderer.view.style['top'] =
    this._marginTop + (maxHeight - canvasHeight) / 2 + 'px';
  this._pixiRenderer.view.style['left'] =
    this._marginLeft + (maxWidth - canvasWidth) / 2 + 'px';
  this._pixiRenderer.view.style.width = canvasWidth + 'px';
  this._pixiRenderer.view.style.height = canvasHeight + 'px';

  // Store the canvas size for fast access to it.
  this._canvasWidth = canvasWidth;
  this._canvasHeight = canvasHeight;
};

/**
 * Set if the aspect ratio must be kept when the game canvas is resized to fill
 * the page.
 */
gdjs.RuntimeGamePixiRenderer.prototype.keepAspectRatio = function(enable) {
  if (this._keepRatio === enable) return;

  this._keepRatio = enable;
  this._resizeCanvas();
  this._game._notifySceneForResize = true;
};

/**
 * Change the margin that must be preserved around the game canvas.
 */
gdjs.RuntimeGamePixiRenderer.prototype.setMargins = function(
  top,
  right,
  bottom,
  left
) {
  if (
    this._marginTop === top &&
    this._marginRight === right &&
    this._marginBottom === bottom &&
    this._marginLeft === left
  )
    return;

  this._marginTop = top;
  this._marginRight = right;
  this._marginBottom = bottom;
  this._marginLeft = left;
  this._resizeCanvas();
  this._game._notifySceneForResize = true;
};

/**
 * Update the window size, if possible.
 * @param {number} width The new width, in pixels.
 * @param {number} height The new height, in pixels.
 */
gdjs.RuntimeGamePixiRenderer.prototype.setWindowSize = function(width, height) {
  var electron = this.getElectron();
  if (electron) {
    // Use Electron BrowserWindow API
    var browserWindow = electron.remote.getCurrentWindow();
    if (browserWindow) {
      browserWindow.setContentSize(width, height);
    }
  } else {
    console.warn("Window size can't be changed on this platform.");
  }
};

/**
 * Center the window on screen.
 */
gdjs.RuntimeGamePixiRenderer.prototype.centerWindow = function() {
  var electron = this.getElectron();
  if (electron) {
    // Use Electron BrowserWindow API
    var browserWindow = electron.remote.getCurrentWindow();
    if (browserWindow) {
      browserWindow.center();
    }
  } else {
    // Not supported
  }
};

/**
 * De/activate fullscreen for the game.
 */
gdjs.RuntimeGamePixiRenderer.prototype.setFullScreen = function(enable) {
  if (this._forceFullscreen) return;

  if (this._isFullscreen !== enable) {
    this._isFullscreen = !!enable;

    var electron = this.getElectron();
    if (electron) {
      // Use Electron BrowserWindow API
      var browserWindow = electron.remote.getCurrentWindow();
      if (browserWindow) {
        browserWindow.setFullScreen(this._isFullscreen);
      }
    } else {
      // Use HTML5 Fullscreen API
      //TODO: Do this on a user gesture, otherwise most browsers won't activate fullscreen
      if (this._isFullscreen) {
        if (document.documentElement.requestFullScreen) {
          document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen();
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    }

    this._resizeCanvas();
    this._notifySceneForResize = true;
  }
};

/**
 * Add the standard events handler.
 */
gdjs.RuntimeGamePixiRenderer.prototype.bindStandardEvents = function(
  manager,
  window,
  document
) {
  var renderer = this._pixiRenderer;
  var canvas = renderer.view;

  //Translate an event (mouse or touch) made on the canvas on the page
  //to game coordinates.
  var that = this;
  function getEventPosition(e) {
    var pos = [0, 0];
    if (e.pageX) {
      pos[0] = e.pageX - canvas.offsetLeft;
      pos[1] = e.pageY - canvas.offsetTop;
    } else {
      pos[0] =
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft -
        canvas.offsetLeft;
      pos[1] =
        e.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop -
        canvas.offsetTop;
    }

    //Handle the fact that the game is stretched to fill the canvas.
    pos[0] *= that._game.getGameResolutionWidth() / (that._canvasWidth || 1);
    pos[1] *= that._game.getGameResolutionHeight() / (that._canvasHeight || 1);

    return pos;
  }

  //Some browsers lacks definition of some variables used to do calculations
  //in getEventPosition. They are defined to 0 as they are useless.
  (function ensureOffsetsExistence() {
    if (isNaN(canvas.offsetLeft)) {
      canvas.offsetLeft = 0;
      canvas.offsetTop = 0;
    }
    if (isNaN(document.body.scrollLeft)) {
      document.body.scrollLeft = 0;
      document.body.scrollTop = 0;
    }
    if (
      document.documentElement === undefined ||
      document.documentElement === null
    ) {
      document.documentElement = {};
    }
    if (isNaN(document.documentElement.scrollLeft)) {
      document.documentElement.scrollLeft = 0;
      document.documentElement.scrollTop = 0;
    }
    if (isNaN(canvas.offsetLeft)) {
      canvas.offsetLeft = 0;
      canvas.offsetTop = 0;
    }
  })();

  //Keyboard
  document.onkeydown = function(e) {
    manager.onKeyPressed(e.keyCode);
  };
  document.onkeyup = function(e) {
    manager.onKeyReleased(e.keyCode);
  };
  //Mouse
  renderer.view.onmousemove = function(e) {
    var pos = getEventPosition(e);
    manager.onMouseMove(pos[0], pos[1]);
  };
  renderer.view.onmousedown = function(e) {
    manager.onMouseButtonPressed(
      e.button === 2
        ? gdjs.InputManager.MOUSE_RIGHT_BUTTON
        : e.button === 1
        ? gdjs.InputManager.MOUSE_MIDDLE_BUTTON
        : gdjs.InputManager.MOUSE_LEFT_BUTTON
    );
    if (window.focus !== undefined) window.focus();
    return false;
  };
  renderer.view.onmouseup = function(e) {
    manager.onMouseButtonReleased(
      e.button === 2
        ? gdjs.InputManager.MOUSE_RIGHT_BUTTON
        : e.button === 1
        ? gdjs.InputManager.MOUSE_MIDDLE_BUTTON
        : gdjs.InputManager.MOUSE_LEFT_BUTTON
    );
    return false;
  };
  window.addEventListener(
    'click',
    function(e) {
      if (window.focus !== undefined) window.focus();
      e.preventDefault();
      return false;
    },
    false
  );
  renderer.view.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };
  renderer.view.onmousewheel = function(event) {
    manager.onMouseWheel(event.wheelDelta);
  };
  //Touches
  //Also simulate mouse events when receiving touch events
  window.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (e.changedTouches) {
      for (var i = 0; i < e.changedTouches.length; ++i) {
        var pos = getEventPosition(e.changedTouches[i]);
        manager.onTouchMove(e.changedTouches[i].identifier, pos[0], pos[1]);
      }
    }
  });
  window.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (e.changedTouches) {
      for (var i = 0; i < e.changedTouches.length; ++i) {
        var pos = getEventPosition(e.changedTouches[i]);
        manager.onTouchStart(e.changedTouches[i].identifier, pos[0], pos[1]);
      }
    }
    return false;
  });
  window.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (e.changedTouches) {
      for (var i = 0; i < e.changedTouches.length; ++i) {
        var pos = getEventPosition(e.changedTouches[i]);
        manager.onTouchEnd(e.changedTouches[i].identifier);
      }
    }
    return false;
  });
};

gdjs.RuntimeGamePixiRenderer.prototype.setWindowTitle = function(title) {
  if (typeof document !== 'undefined') document.title = title;
};

gdjs.RuntimeGamePixiRenderer.prototype.getWindowTitle = function() {
  return typeof document !== 'undefined' ? document.title : '';
};

gdjs.RuntimeGamePixiRenderer.prototype.startGameLoop = function(fn) {
  requestAnimationFrame(gameLoop);

  var oldTime = 0;
  function gameLoop(time) {
    var dt = oldTime ? time - oldTime : 0;
    oldTime = time;

    if (fn(dt)) requestAnimationFrame(gameLoop);
  }
};

gdjs.RuntimeGamePixiRenderer.prototype.getPIXIRenderer = function() {
  return this._pixiRenderer;
};

/**
 * Open the given URL in the system browser (or a new tab)
 */
gdjs.RuntimeGamePixiRenderer.prototype.openURL = function(url) {
  // Try to detect the environment to use the most adapted
  // way of opening an URL.
  if (typeof Cocoon !== 'undefined' && Cocoon.App && Cocoon.App.openURL) {
    Cocoon.App.openURL(url);
  } else if (typeof window !== 'undefined') {
    var target = window.cordova ? '_system' : '_blank';
    window.open(url, target);
  }
};

/**
 * Close the game, if applicable
 */
gdjs.RuntimeGamePixiRenderer.prototype.stopGame = function() {
  // Try to detect the environment to use the most adapted
  // way of closing the app
  var electron = this.getElectron();
  if (electron) {
    var browserWindow = electron.remote.getCurrentWindow();
    if (browserWindow) {
      browserWindow.close();
    }
  } else if (
    typeof navigator !== 'undefined' &&
    navigator.app &&
    navigator.app.exitApp
  ) {
    navigator.app.exitApp();
  }

  // HTML5 games on mobile/browsers don't have a way to close their window/page.
};

/**
 * Get the canvas DOM element.
 */
gdjs.RuntimeGamePixiRenderer.prototype.getCanvas = function() {
  return this._pixiRenderer.view;
};

/**
 * Check if the device supports WebGL.
 * @returns {boolean} true if WebGL is supported
 */
gdjs.RuntimeGamePixiRenderer.prototype.isWebGLSupported = function() {
  return this._pixiRenderer.type === PIXI.RENDERER_TYPE.WEBGL;
};

/**
 * Get the electron module, if running as a electron renderer process.
 */
gdjs.RuntimeGamePixiRenderer.prototype.getElectron = function() {
  if (typeof require !== 'undefined') {
    return require('electron');
  }

  return null;
};
