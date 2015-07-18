/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Represents a game being played.
 *
 * @constructor
 * @namespace gdjs
 * @class RuntimeGame
 * @param data The object (usually stored in data.json) containing the full project data
 * @param spec Optional object for specifiying additional options: {forceFullscreen: ...}
 */
gdjs.RuntimeGame = function(data, spec)
{
    spec = spec || {};

    //Safety check: Do gdjs initialization if not already done
    if ( gdjs.objectsTypes.keys.length === 0)
        gdjs.registerObjects();
    if ( gdjs.automatismsTypes.keys.length === 0)
        gdjs.registerAutomatisms();
    if ( gdjs.callbacksRuntimeSceneLoaded.length === 0 &&
         gdjs.callbacksRuntimeSceneUnloaded.length === 0 &&
         gdjs.callbacksObjectDeletedFromScene.length === 0)
        gdjs.registerGlobalCallbacks();

    this._variables = new gdjs.VariablesContainer(data.variables);
    this._data = data;
    this._imageManager = new gdjs.ImageManager(this);
    this._minFPS = data ? parseInt(data.properties.minFPS, 10) : 15;

    //Game loop management (see startStandardGameLoop method)
    this._notifySceneForResize = false; //When set to true, the current scene is notified that canvas size changed.

    //Rendering (see createStandardCanvas method)
    this._isFullscreen = true; //Used to track if the canvas is displayed as fullscreen (see setFullscreen method).
    this._forceFullscreen = spec.forceFullscreen || false; //If set to true, the canvas will always be displayed as fullscreen, even if _isFullscreen == false.
    this._renderer = null;
    this._canvasArea = null;
    this._defaultWidth = data.properties.windowWidth; //Default size for scenes cameras
    this._defaultHeight = data.properties.windowHeight;
    this._currentWidth = data.properties.windowWidth; //Current size of the canvas
    this._currentHeight = data.properties.windowHeight;
    this._keepRatio = true;
    this._reduceIfNeed = true;
    this._marginLeft = this._marginTop = this._marginRight = this._marginBottom = 0;

    if (navigator.isCocoonJS && !this._forceFullscreen) {
        this._forceFullscreen = true;
        console.log("Forcing fullscreen for CocoonJS.");
    }
    if ( typeof intel != "undefined" ) {
        this._forceFullscreen = true;
        console.log("Forcing fullscreen for Intel XDK.");
    }

    //Inputs :
    this._inputManager = new gdjs.InputManager();
};

/**
 * Get the variables of the runtimeGame.
 * @method getVariables
 * @return a variablesContainer object.
 */
gdjs.RuntimeGame.prototype.getVariables = function() {
	return this._variables;
};

gdjs.RuntimeGame.prototype.getImageManager = function() {
	return this._imageManager;
};

/**
 * Get the input manager of the game, storing mouse, keyboard
 * and touches states.
 * @return The input manager owned by the game
 */
gdjs.RuntimeGame.prototype.getInputManager = function() {
    return this._inputManager;
}

/**
 * Get the object containing the game data
 * @method getGameData
 * @return The object associated to the game.
 */
gdjs.RuntimeGame.prototype.getGameData = function() {
	return this._data;
};

/**
 * Get the data associated to a scene.
 *
 * @method getSceneData
 * @param sceneName The name of the scene. If not defined, the first scene will be returned.
 * @return The data associated to the scene.
 */
gdjs.RuntimeGame.prototype.getSceneData = function(sceneName) {
	var scene = undefined;
	gdjs.iterateOverArray(this._data.layouts, function(sceneData) {
		if ( sceneName === undefined || sceneData.name === sceneName ) {
			scene = sceneData;
			return false;
		}
	});

	if ( scene === undefined )
		console.warn("The game has no scene called \""+sceneName+"\"");

	return scene;
};

/**
 * Check if a scene exists
 *
 * @method hasScene
 * @param sceneName The name of the scene to search.
 * @return true if the scene exists. If sceneName is undefined, true if the game has a scene.
 */
gdjs.RuntimeGame.prototype.hasScene = function(sceneName) {
	var isTrue = false;
	gdjs.iterateOverArray(this._data.layouts, function(sceneData) {
		if ( sceneName === undefined || sceneData.name == sceneName ) {
			isTrue = true;
			return false;
		}
	});

	return isTrue;
};

/**
 * Get the data associated to an external layout.
 *
 * @method getExternalLayoutData
 * @param name The name of the external layout.
 * @return The data associated to the external layout or null if not found.
 */
gdjs.RuntimeGame.prototype.getExternalLayoutData = function(name) {
    var externalLayout = null;
    gdjs.iterateOverArray(this._data.externalLayouts, function(layoutData) {
        if ( layoutData.name === name ) {
            externalLayout = layoutData;
            return false;
        }
    });

    return externalLayout;
};

/**
 * Get the data representing all the global objects of the game.
 * @method getInitialObjectsData
 * @return The data associated to the global objects.
 */
gdjs.RuntimeGame.prototype.getInitialObjectsData = function() {
	return this._data.objects || [];
};

/**
 * Get the default width of the game: canvas is created with this width,
 * and cameras are created using this width.
 * @method getDefaultWidth
 */
gdjs.RuntimeGame.prototype.getDefaultWidth = function() {
    return this._defaultWidth;
};

/**
 * Get the default height of the game: canvas is created with this height,
 * and cameras are created using this height.
 * @method getDefaultHeight
 */
gdjs.RuntimeGame.prototype.getDefaultHeight = function() {
    return this._defaultHeight;
};

/**
 * Change the default width of the game: It won't affect the canvas size, but
 * new scene cameras will be created with this size.
 * @method setDefaultWidth
 * @param width {Number} The new default width
 */
gdjs.RuntimeGame.prototype.setDefaultWidth = function(width) {
    this._defaultWidth = width;
};

/**
 * Change the default height of the game: It won't affect the canvas size, but
 * new scene cameras will be created with this size.
 * @method setDefaultHeight
 * @param height {Number} The new default height
 */
gdjs.RuntimeGame.prototype.setDefaultHeight = function(height) {
    this._defaultHeight = height;
};


/**
 * Get the current width of the canvas.
 * @method getCurrentWidth
 */
gdjs.RuntimeGame.prototype.getCurrentWidth = function() {
    return this._currentWidth;
};

/**
 * Get the current height of the canvas.
 * @method getCurrentHeight
 */
gdjs.RuntimeGame.prototype.getCurrentHeight = function() {
    return this._currentHeight;
};

/**
 * Change the size of the canvas displaying the game.
 * Note that if the canvas is fullscreen, it won't be resized, but when going back to
 * non fullscreen mode, the requested size will be used.
 *
 * @method setCanvasSize
 * @param width {Number} The new width
 * @param height {Number} The new height
 */
gdjs.RuntimeGame.prototype.setCanvasSize = function(width, height) {
    this._currentWidth = width;
    this._currentHeight = height;

    this._resizeCanvas(this._renderer, this._canvasArea, this._isFullscreen,
        this._currentWidth, this._currentHeight);
    this._notifySceneForResize = true;
};

/**
 * Return the minimal fps that must be guaranteed by the game.
 * ( Otherwise, game is slowed down ).
 * @method getMinimalFramerate
 */
gdjs.RuntimeGame.prototype.getMinimalFramerate = function() {
	return this._minFPS;
};

/**
 * Add the standard events handler.
 * Be sure that the game has a renderer (See createStandardRenderer).
 * @method bindStandardEvents
 */
gdjs.RuntimeGame.prototype.bindStandardEvents = function(window, document) {
    if (!this._renderer || !this._canvasArea) {
        console.log("Unable to bind events to the game! Be sure that there is a renderer and a canvas area associated to the game.");
        return;
    }

    this._inputManager.bindStandardEvents(window, document, this, this._renderer, this._canvasArea);
};

/**
 * Set if the aspect ratio must be kept when the game canvas is resized.
 */
gdjs.RuntimeGame.prototype.keepAspectRatio = function(enable) {
    if (this._keepRatio === enable) return;

    this._keepRatio = enable;
    this._resizeCanvas();
    this._notifySceneForResize = true;
};

/**
 * Change the margin that must be preserved around the game canvas.
 */
gdjs.RuntimeGame.prototype.setMargins = function(top, right, bottom, left) {
    if (this._marginTop === top && this._marginRight === right && this._marginBottom === bottom &&
        this._marginLeft === left)
        return;

    this._marginTop = top;
    this._marginRight = right;
    this._marginBottom = bottom;
    this._marginLeft = left;
    this._resizeCanvas();
    this._notifySceneForResize = true;
};

/**
 * De/activate fullscreen for the canvas rendering the game.
 * @method setFullScreen
 */
gdjs.RuntimeGame.prototype.setFullScreen = function(enable) {
    if (this._forceFullscreen) return;

    if (this._isFullscreen !== enable) {
        this._isFullscreen = !!enable;
        this._resizeCanvas();
        this._notifySceneForResize = true;

        if (this._isFullscreen) {
            if(document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
            } else if(document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if(document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen();
            }
        }
        else {
            if(document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }
};

/**
 * Create a standard canvas inside canvasArea.
 * The game keep a reference to this canvas and will renderer in it.
 *
 * @method createStandardCanvas
 */
gdjs.RuntimeGame.prototype.createStandardCanvas = function(canvasArea) {
    this._canvasArea = canvasArea;

    //Create the renderer and setup the rendering area
    this._renderer = PIXI.autoDetectRenderer(this._defaultWidth, this._defaultHeight);
    canvasArea.style["position"] = "absolute";
    canvasArea.appendChild(this._renderer.view); // add the renderer view element to the DOM
    canvasArea.tabindex="1"; //Ensure that the canvas has the focus.
    canvasArea.style.overflow="hidden"; //No scrollbar in any case.
    this._resizeCanvas();

    //Handle resize
    var game = this;
    window.addEventListener("resize", function() {
        game._resizeCanvas();
        game._notifySceneForResize = true;
    });

    return this._renderer;
};

/**
 * Resize the canvas, according to _isFullscreen, _forceFullscreen, _currentWidth,
 * _currentHeight, _marginTop, _marginLeft, _marginRight, _marginBottom, _keepRatio.
 *
 * @method _resizeCanvas
 * @private
 */
gdjs.RuntimeGame.prototype._resizeCanvas = function() {
    var keepRatio = this._keepRatio;

    var reduceIfNeed = this._reduceIfNeed;
    var isFullscreen = this._forceFullscreen || this._isFullscreen;
    var width = this._currentWidth;
    var height = this._currentHeight;
    var marginLeft = this._marginLeft;
    var marginTop = this._marginTop;
    var marginRight = this._marginRight;
    var marginBottom = this._marginBottom;
    var maxWidth = window.innerWidth-marginLeft-marginRight;
    var maxHeight = window.innerHeight-marginTop-marginBottom;
    if (maxWidth < 0) maxWidth = 0;
    if (maxHeight < 0) maxHeight = 0;

    if (isFullscreen && !keepRatio) {
        width = maxWidth;
        height = maxHeight;
    } else if (isFullscreen && keepRatio ||
        (reduceIfNeed && (width > maxWidth || height > maxHeight))) {
        var factor = maxWidth/width;
        if (height*factor > maxHeight) factor = maxHeight/height;

        width *= factor;
        height *= factor;
    }

    if (this._renderer.width !== width || this._renderer.height !== height)
        this._renderer.resize(width, height);

    this._canvasArea.style["top"] = ((marginTop+(maxHeight-height)/2)+"px");
    this._canvasArea.style["left"] = ((marginLeft+(maxWidth-width)/2)+"px");
    this._canvasArea.style.width = width+"px";
    this._canvasArea.style.height = height+"px";
};

/**
 * Load all assets, displaying progress in renderer.
 * @method loadAllAssets
 */
gdjs.RuntimeGame.prototype.loadAllAssets = function(callback) {

    //Prepare the progress text
    var loadingScreen = new PIXI.Container();
    var text = new PIXI.Text(" ", {font: "bold 60px Arial", fill: "#FFFFFF", align: "center"});
    loadingScreen.addChild(text);
    text.position.x = this._renderer.width/2-50;
    text.position.y = this._renderer.height/2;
    var loadingCount = 0;

    //Load all assets
    var assets = [];
    gdjs.iterateOverArray(gdjs.projectData.resources.resources, function(res) {
        if ( res.file && assets.indexOf(res.file) === -1 )
            assets.push(res.file);
    });

    var game = this;
    if ( assets.length !== 0 ) {
        var loader = PIXI.loader;
        loader.once('complete', callback);
        loader.on('progress', onAssetsLoadingProgress);

        for(var i = 0;i < assets.length; ++i) {
            loader.add(assets[i], assets[i]);
        }

        loader.load();
    }
    else {
        callback();
    }

    function onAssetsLoadingProgress() {
        game._renderer.render(loadingScreen);
        loadingCount++;
        text.text = Math.floor(loadingCount/assets.length*100) + "%";
    }
};

/**
 * Launch the game, displayed in the renderer associated to the game (see createStandardCanvas).<br>
 * The method returns when the game is closed.
 * @method startStandardGameLoop
 */
gdjs.RuntimeGame.prototype.startStandardGameLoop = function() {

    if ( !this.hasScene() ) {
        console.log("The game has no scene.");
        return;
    }

    //Create the scene to be played
    var currentScene = new gdjs.RuntimeScene(this, this._renderer);
    var firstSceneName = gdjs.projectData.firstLayout;
    var firstsceneData = this.hasScene(firstSceneName) ? this.getSceneData(firstSceneName) : this.getSceneData();

    currentScene.loadFromScene(firstsceneData);

    //Uncomment to profile the first x frames of the game.
    /*var x = 250;
    console.profile("Stepping for " + x + " frames")
    for(var i = 0; i < x; ++i) {
        currentScene.renderAndStep();
    }
    console.profileEnd();
    return;*/

    requestAnimationFrame(gameLoop);

    //The standard game loop
    var game = this;
    function gameLoop() {

        //Manage resize events.
        if ( game._notifySceneForResize ) {
            currentScene.onCanvasResized();
            game._notifySceneForResize = false;
        }

        //Render and step the scene.
        if ( !currentScene.renderAndStep() ) {
            //Something special was requested by the current scene.
            if ( currentScene.gameStopRequested() )
                postGameScreen();
            else {
                var nextSceneName = currentScene.getRequestedScene();
                currentScene = new gdjs.RuntimeScene(game, game._renderer);
                currentScene.loadFromScene(game.getSceneData(nextSceneName));
                requestAnimationFrame(gameLoop);
                game.getInputManager().onFrameEnded();
            }
        }
        else {
            requestAnimationFrame(gameLoop);
            game.getInputManager().onFrameEnded();
        }
    }
};
