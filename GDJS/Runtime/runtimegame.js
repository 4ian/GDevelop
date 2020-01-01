/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Represents a game being played.
 *
 * @memberof gdjs
 * @class RuntimeGame
 * @param {Object} data The object (usually stored in data.json) containing the full project data
 * @param {Object=} spec Optional object for specifiying additional options: {forceFullscreen: ...}
 */
gdjs.RuntimeGame = function(data, spec) {
  spec = spec || {};

  this._variables = new gdjs.VariablesContainer(data.variables);
  this._data = data;
  this._imageManager = new gdjs.ImageManager(
    data.resources ? data.resources.resources : undefined
  );
  this._soundManager = new gdjs.SoundManager(
    data.resources ? data.resources.resources : undefined
  );
  this._fontManager = new gdjs.FontManager(
    data.resources ? data.resources.resources : undefined
  );
  this._jsonManager = new gdjs.JsonManager(
    data.resources ? data.resources.resources : undefined
  );
  this._maxFPS = data ? parseInt(data.properties.maxFPS, 10) : 60;
  this._minFPS = data ? parseInt(data.properties.minFPS, 10) : 15;

  this._gameResolutionWidth = data.properties.windowWidth;
  this._gameResolutionHeight = data.properties.windowHeight;
  this._originalWidth = this._gameResolutionWidth;
  this._originalHeight = this._gameResolutionHeight;
  this._resizeMode = data.properties.sizeOnStartupMode;
  this._adaptGameResolutionAtRuntime =
    data.properties.adaptGameResolutionAtRuntime;
  /** @type {string} */
  this._scaleMode = data.properties.scaleMode || 'linear';
  this._renderer = new gdjs.RuntimeGameRenderer(
    this,
    spec.forceFullscreen || false
  );

  //Game loop management (see startGameLoop method)
  this._sceneStack = new gdjs.SceneStack(this);
  this._notifyScenesForGameResolutionResize = false; // When set to true, the scenes are notified that gamre resolution size changed.
  this._paused = false;

  //Inputs :
  this._inputManager = new gdjs.InputManager();

  //Allow to specify an external layout to insert in the first scene:
  this._injectExternalLayout = spec.injectExternalLayout || '';

  //Optional client to connect to a debugger:
  this._debuggerClient = gdjs.DebuggerClient
    ? new gdjs.DebuggerClient(this)
    : null;
};

gdjs.RuntimeGame.prototype.getRenderer = function() {
  return this._renderer;
};

/**
 * Get the variables of the RuntimeGame.
 * @return {gdjs.VariablesContainer} The global variables
 */
gdjs.RuntimeGame.prototype.getVariables = function() {
  return this._variables;
};

/**
 * Get the gdjs.SoundManager of the RuntimeGame.
 * @return {gdjs.SoundManager} The sound manager.
 */
gdjs.RuntimeGame.prototype.getSoundManager = function() {
  return this._soundManager;
};

/**
 * Get the gdjs.ImageManager of the RuntimeGame.
 * @return {gdjs.ImageManager} The image manager.
 */
gdjs.RuntimeGame.prototype.getImageManager = function() {
  return this._imageManager;
};

/**
 * Get the gdjs.FontManager of the RuntimeGame.
 * @return {gdjs.FontManager} The font manager.
 */
gdjs.RuntimeGame.prototype.getFontManager = function() {
  return this._fontManager;
};

/**
 * Get the input manager of the game, storing mouse, keyboard
 * and touches states.
 * @return {gdjs.InputManager} The input manager owned by the game
 */
gdjs.RuntimeGame.prototype.getInputManager = function() {
  return this._inputManager;
};

/**
 * Get the JSON manager of the game, used to load JSON from game
 * resources.
 * @return {gdjs.JsonManager} The json manager for the game
 */
gdjs.RuntimeGame.prototype.getJsonManager = function() {
  return this._jsonManager;
};

/**
 * Get the object containing the game data
 * @return {Object} The object associated to the game.
 */
gdjs.RuntimeGame.prototype.getGameData = function() {
  return this._data;
};

/**
 * Get the data associated to a scene.
 *
 * @param {string} sceneName The name of the scene. If not defined, the first scene will be returned.
 * @return The data associated to the scene.
 */
gdjs.RuntimeGame.prototype.getSceneData = function(sceneName) {
  var scene = undefined;
  for (var i = 0, len = this._data.layouts.length; i < len; ++i) {
    var sceneData = this._data.layouts[i];

    if (sceneName === undefined || sceneData.name === sceneName) {
      scene = sceneData;
      break;
    }
  }

  if (scene === undefined)
    console.warn('The game has no scene called "' + sceneName + '"');

  return scene;
};

/**
 * Check if a scene exists
 *
 * @param {string} sceneName The name of the scene to search.
 * @return {boolean} true if the scene exists. If sceneName is undefined, true if the game has a scene.
 */
gdjs.RuntimeGame.prototype.hasScene = function(sceneName) {
  var isTrue = false;
  for (var i = 0, len = this._data.layouts.length; i < len; ++i) {
    var sceneData = this._data.layouts[i];

    if (sceneName === undefined || sceneData.name == sceneName) {
      isTrue = true;
      break;
    }
  }

  return isTrue;
};

/**
 * Get the data associated to an external layout.
 *
 * @param {string} name The name of the external layout.
 * @return {Object} The data associated to the external layout or null if not found.
 */
gdjs.RuntimeGame.prototype.getExternalLayoutData = function(name) {
  var externalLayout = null;
  for (var i = 0, len = this._data.externalLayouts.length; i < len; ++i) {
    var layoutData = this._data.externalLayouts[i];

    if (layoutData.name === name) {
      externalLayout = layoutData;
      break;
    }
  }

  return externalLayout;
};

/**
 * Get the data representing all the global objects of the game.
 * @return {Object} The data associated to the global objects.
 */
gdjs.RuntimeGame.prototype.getInitialObjectsData = function() {
  return this._data.objects || [];
};

/**
 * Get the original width of the game, as set on the startup of the game.
 *
 * This is guaranteed to never change, even if the size of the game is changed afterwards.
 */
gdjs.RuntimeGame.prototype.getOriginalWidth = function() {
  return this._originalWidth;
};

/**
 * Get the original height of the game, as set on the startup of the game.
 *
 * This is guaranteed to never change, even if the size of the game is changed afterwards.
 */
gdjs.RuntimeGame.prototype.getOriginalHeight = function() {
  return this._originalHeight;
};

/**
 * Get the game resolution (the size at which the game is played and rendered) width.
 * @returns {number} The game resolution width, in pixels.
 */
gdjs.RuntimeGame.prototype.getGameResolutionWidth = function() {
  return this._gameResolutionWidth;
};

/**
 * Get the game resolution (the size at which the game is played and rendered) height.
 * @returns {number} The game resolution height, in pixels.
 */
gdjs.RuntimeGame.prototype.getGameResolutionHeight = function() {
  return this._gameResolutionHeight;
};

/**
 * Change the game resolution.
 *
 * @param {number} width The new width
 * @param {number} height The new height
 */
gdjs.RuntimeGame.prototype.setGameResolutionSize = function(width, height) {
  this._gameResolutionWidth = width;
  this._gameResolutionHeight = height;

  if (this._adaptGameResolutionAtRuntime) {
    if (
      gdjs.RuntimeGameRenderer &&
      gdjs.RuntimeGameRenderer.getWindowInnerWidth &&
      gdjs.RuntimeGameRenderer.getWindowInnerHeight
    ) {
      var windowInnerWidth = gdjs.RuntimeGameRenderer.getWindowInnerWidth();
      var windowInnerHeight = gdjs.RuntimeGameRenderer.getWindowInnerHeight();

      // Enlarge either the width or the eight to fill the inner window space.
      var width = this._gameResolutionWidth;
      var height = this._gameResolutionHeight;
      if (this._resizeMode === 'adaptWidth') {
        this._gameResolutionWidth =
          (this._gameResolutionHeight * windowInnerWidth) / windowInnerHeight;
      } else if (this._resizeMode === 'adaptHeight') {
        this._gameResolutionHeight =
          (this._gameResolutionWidth * windowInnerHeight) / windowInnerWidth;
      }
    }
  } else {
    // Don't alter the game resolution. The renderer
    // will maybe adapt the size of the canvas or whatever is used to render the
    // game in the window, but this does not change the "game resolution".
  }

  // Notify the renderer that game resolution changed (so that the renderer size
  // can be updated, and maybe other things like the canvas size), and let the
  // scenes know too.
  this._renderer.updateRendererSize();
  this._notifyScenesForGameResolutionResize = true;
};

/**
 * Set if the width or the height of the game resolution
 * should be changed to fit the game window - or if the game
 * resolution should not be updated automatically.
 *
 * @param {string} resizeMode Either "" (don't change game resolution), "adaptWidth" or "adaptHeight".
 */
gdjs.RuntimeGame.prototype.setGameResolutionResizeMode = function(resizeMode) {
  this._resizeMode = resizeMode;
  this._forceGameResolutionUpdate();
};

/**
 * Returns if the width or the height of the game resolution
 * should be changed to fit the game window - or if the game
 * resolution should not be updated automatically (empty string).
 *
 * @returns {string} Either "" (don't change game resolution), "adaptWidth" or "adaptHeight".
 */
gdjs.RuntimeGame.prototype.getGameResolutionResizeMode = function() {
  return this._resizeMode;
};

/**
 * Set if the game resolution should be automatically adapted
 * when the game window or screen size change. This will only
 * be the case if the game resolution resize mode is
 * configured to adapt the width or the height of the game.
 * @param {boolean} enable true to change the game resolution according to the window/screen size.
 */
gdjs.RuntimeGame.prototype.setAdaptGameResolutionAtRuntime = function(enable) {
  this._adaptGameResolutionAtRuntime = enable;
  this._forceGameResolutionUpdate();
};

/**
 * Returns if the game resolution should be automatically adapted
 * when the game window or screen size change. This will only
 * be the case if the game resolution resize mode is
 * configured to adapt the width or the height of the game.
 * @returns {boolean} true if the game resolution is automatically changed according to the window/screen size.
 */
gdjs.RuntimeGame.prototype.getAdaptGameResolutionAtRuntime = function() {
  return this._adaptGameResolutionAtRuntime;
};

/**
 * Return the minimal fps that must be guaranteed by the game
 * (otherwise, game is slowed down).
 */
gdjs.RuntimeGame.prototype.getMinimalFramerate = function() {
  return this._minFPS;
};

/**
 * Return the scale mode of the game ("linear" or "nearest").
 */
gdjs.RuntimeGame.prototype.getScaleMode = function() {
  return this._scaleMode;
};

/**
 * Set or unset the game as paused.
 * When paused, the game won't step and will be freezed. Useful for debugging.
 * @param {boolean} enable true to pause the game, false to unpause
 */
gdjs.RuntimeGame.prototype.pause = function(enable) {
  this._paused = enable;
};

/**
 * Load all assets, displaying progress in renderer.
 */
gdjs.RuntimeGame.prototype.loadAllAssets = function(
  callback,
  progressCallback
) {
  var loadingScreen = new gdjs.LoadingScreenRenderer(
    this.getRenderer(),
    this._data.properties.loadingScreen
  );
  var allAssetsTotal = this._data.resources.resources.length;

  var that = this;
  this._imageManager.loadTextures(
    function(count, total) {
      var percent = Math.floor((count / allAssetsTotal) * 100);
      loadingScreen.render(percent);
      if (progressCallback) progressCallback(percent);
    },
    function(texturesTotalCount) {
      that._soundManager.preloadAudio(
        function(count, total) {
          var percent = Math.floor(
            ((texturesTotalCount + count) / allAssetsTotal) * 100
          );
          loadingScreen.render(percent);
          if (progressCallback) progressCallback(percent);
        },
        function(audioTotalCount) {
          that._fontManager.loadFonts(
            function(count, total) {
              var percent = Math.floor(
                ((texturesTotalCount + audioTotalCount + count) /
                  allAssetsTotal) *
                  100
              );
              loadingScreen.render(percent);
              if (progressCallback) progressCallback(percent);
            },
            function(fontTotalCount) {
              that._jsonManager.preloadJsons(
                function(count, total) {
                  var percent = Math.floor(
                    ((texturesTotalCount +
                      audioTotalCount +
                      fontTotalCount +
                      count) /
                      allAssetsTotal) *
                      100
                  );
                  loadingScreen.render(percent);
                  if (progressCallback) progressCallback(percent);
                },
                function() {
                  loadingScreen.unload();
                  callback();
                }
              );
            }
          );
        }
      );
    }
  );
};

/**
 * Start the game loop, to be called once assets are loaded.
 */
gdjs.RuntimeGame.prototype.startGameLoop = function() {
  if (!this.hasScene()) {
    console.log('The game has no scene.');
    return;
  }

  this._forceGameResolutionUpdate();

  //Load the first scene
  var firstSceneName = this._data.firstLayout;
  this._sceneStack.push(
    this.hasScene(firstSceneName) ? firstSceneName : this.getSceneData().name,
    this._injectExternalLayout
  );

  //Uncomment to profile the first x frames of the game.
  // var x = 500;
  // var startTime = Date.now();
  // console.profile("Stepping for " + x + " frames")
  // for(var i = 0; i < x; ++i) {
  //     this._sceneStack.step(16);
  // }
  // console.profileEnd();
  // var time = Date.now() - startTime;
  // console.log("Took", time, "ms");
  // return;

  //The standard game loop
  var that = this;
  var accumulatedElapsedTime = 0;
  this._renderer.startGameLoop(function(lastCallElapsedTime) {
    if (that._paused) return true;

    // Skip the frame if we rendering frames too fast
    accumulatedElapsedTime += lastCallElapsedTime;
    if (
      that._maxFPS > 0 &&
      1000.0 / accumulatedElapsedTime > that._maxFPS + 7
    ) {
      // Only skip frame if the framerate is 7 frames above the maximum framerate.
      // Most browser/engines will try to run at slightly more than 60 frames per second.
      // If game is set to have a maximum FPS to 60, then one out of two frames will be dropped.
      // Hence, we use a 7 frames margin to ensure that we're not skipping frames too much.
      return true;
    }
    var elapsedTime = accumulatedElapsedTime;
    accumulatedElapsedTime = 0;

    //Manage resize events.
    if (that._notifyScenesForGameResolutionResize) {
      that._sceneStack.onGameResolutionResized();
      that._notifyScenesForGameResolutionResize = false;
    }

    //Render and step the scene.
    if (that._sceneStack.step(elapsedTime)) {
      that.getInputManager().onFrameEnded();
      return true;
    }

    return false;
  });
};

/**
 * Called by the game renderer when the window containing the game
 * has changed size (this can result from a resize of the window,
 * but also other factors like a device orientation change on mobile).
 */
gdjs.RuntimeGame.prototype.onWindowInnerSizeChanged = function() {
  this._forceGameResolutionUpdate();
};

/**
 * Enlarge/reduce the width (or the height) of the game to fill the inner window.
 */
gdjs.RuntimeGame.prototype._forceGameResolutionUpdate = function() {
  this.setGameResolutionSize(
    this._gameResolutionWidth,
    this._gameResolutionHeight
  );
};

/**
 * Start a profiler for the currently running scene.
 * @param {Function} onProfilerStopped Function to be called when the profiler is stopped. Will be passed the profiler as argument.
 */
gdjs.RuntimeGame.prototype.startCurrentSceneProfiler = function(
  onProfilerStopped
) {
  var currentScene = this._sceneStack.getCurrentScene();
  if (!currentScene) return false;

  currentScene.startProfiler(onProfilerStopped);
  return true;
};

/**
 * Stop the profiler for the currently running scene.
 */
gdjs.RuntimeGame.prototype.stopCurrentSceneProfiler = function() {
  var currentScene = this._sceneStack.getCurrentScene();
  if (!currentScene) return null;

  currentScene.stopProfiler();
};
