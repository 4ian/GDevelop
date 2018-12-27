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
 * @param {Object} spec Optional object for specifiying additional options: {forceFullscreen: ...}
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
  this._minFPS = data ? parseInt(data.properties.minFPS, 10) : 15;

  this._defaultWidth = data.properties.windowWidth; //Default size for scenes cameras
  this._defaultHeight = data.properties.windowHeight;
  this._originalWidth = data.properties.windowWidth; //Original size of the game, won't be changed.
  this._originalHeight = data.properties.windowHeight;
  /** @type {string} */
  this._scaleMode = data.properties.scaleMode || 'linear';
  this._renderer = new gdjs.RuntimeGameRenderer(
    this,
    this._defaultWidth,
    this._defaultHeight,
    spec.forceFullscreen || false
  );

  //Game loop management (see startGameLoop method)
  this._sceneStack = new gdjs.SceneStack(this);
  this._notifySceneForResize = false; //When set to true, the current scene is notified that canvas size changed.
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
 * Get the default width of the game: canvas is created with this width,
 * and cameras of layers are created using this width when a scene is started.
 * @returns {number} The default width for cameras of layers
 */
gdjs.RuntimeGame.prototype.getDefaultWidth = function() {
  return this._defaultWidth;
};

/**
 * Get the default height of the game: canvas is created with this height,
 * and cameras of layers are created using this height when a scene is started.
 * @returns {number} The default height for cameras of layers
 */
gdjs.RuntimeGame.prototype.getDefaultHeight = function() {
  return this._defaultHeight;
};

/**
 * Change the default width of the game: It won't affect the canvas size, but
 * new scene cameras will be created with this size.
 * @param {number} width The new default width
 */
gdjs.RuntimeGame.prototype.setDefaultWidth = function(width) {
  this._defaultWidth = width;
};

/**
 * Change the default height of the game: It won't affect the canvas size, but
 * new scene cameras will be created with this size.
 * @param {number} height The new default height
 */
gdjs.RuntimeGame.prototype.setDefaultHeight = function(height) {
  this._defaultHeight = height;
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
          loadingScreen.render(
            Math.floor(((texturesTotalCount + count) / allAssetsTotal) * 100)
          );
        },
        function(audioTotalCount) {
          that._fontManager.loadFonts(
            function(count, total) {
              loadingScreen.render(
                Math.floor(
                  ((texturesTotalCount + audioTotalCount + count) /
                    allAssetsTotal) *
                    100
                )
              );
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
};

/**
 * Start the game loop, to be called once assets are loaded.
 */
gdjs.RuntimeGame.prototype.startGameLoop = function() {
  if (!this.hasScene()) {
    console.log('The game has no scene.');
    return;
  }

  this.adaptRendererSizeToFillScreen();

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
  this._renderer.startGameLoop(function(elapsedTime) {
    if (that._paused) return true;

    //Manage resize events.
    if (that._notifySceneForResize) {
      that._sceneStack.onRendererResized();
      that._notifySceneForResize = false;
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
 * Enlarge/reduce the width (or the height) of the game to fill the screen.
 * @param {?string} mode `adaptWidth` to change the width, `adaptHeight` to change the height. If not defined, will use the game "sizeOnStartupMode" .
 */
gdjs.RuntimeGame.prototype.adaptRendererSizeToFillScreen = function(mode) {
  if (
    !gdjs.RuntimeGameRenderer ||
    !gdjs.RuntimeGameRenderer.getScreenWidth ||
    !gdjs.RuntimeGameRenderer.getScreenHeight
  )
    return;

  newMode =
    mode !== undefined ? mode : this._data.properties.sizeOnStartupMode || '';

  var screenWidth = gdjs.RuntimeGameRenderer.getScreenWidth();
  var screenHeight = gdjs.RuntimeGameRenderer.getScreenHeight();

  // Enlarge either the width or the eight to fill the screen
  var renderer = this.getRenderer();
  var width = renderer.getCurrentWidth();
  var height = renderer.getCurrentHeight();
  if (newMode === 'adaptWidth') {
    width = (height * screenWidth) / screenHeight;
  } else if (newMode === 'adaptHeight') {
    height = (width * screenHeight) / screenWidth;
  }

  // Update the renderer size, and also the default size of the game so that
  // camera of scenes uses this size (otherwise, the rendering would be stretched)
  renderer.setSize(width, height);
  this.setDefaultWidth(width);
  this.setDefaultHeight(height);
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
