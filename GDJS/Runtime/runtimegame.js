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
    this._defaultWidth = gdjs.projectData.properties.windowWidth; //Default size for scenes cameras
    this._defaultHeight = gdjs.projectData.properties.windowHeight;
    this._currentWidth = gdjs.projectData.properties.windowWidth; //Current size of the canvas
    this._currentHeight = gdjs.projectData.properties.windowHeight;
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
    this._pressedKeys = new Hashtable();
    this._lastPressedKey = 0;
    this._pressedMouseButtons = new Array(5);
    this._mouseX = 0;
    this._mouseY = 0;
    this._mouseWheelDelta = 0;
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
	return this._data.objects;
};

/**
 * Should be called whenever a key is pressed
 * @method onKeyPressed
 * @param keyCode {Number} The key code associated to the key press.
 */
gdjs.RuntimeGame.prototype.onKeyPressed = function(keyCode) {
	this._pressedKeys.put(keyCode, true);
    this._lastPressedKey = keyCode;
};

/**
 * Should be called whenever a key is released
 * @method onKeyReleased
 * @param keyCode {Number} The key code associated to the key release.
 */
gdjs.RuntimeGame.prototype.onKeyReleased = function(keyCode) {
	this._pressedKeys.put(keyCode, false);
};

/**
 * Return the code of the last key that was pressed.
 * @return {Number} The code of the last key pressed.
 * @method getLastPressedKey
 */
gdjs.RuntimeGame.prototype.getLastPressedKey = function() {
    return this._lastPressedKey;
};

/**
 * Return true if the key corresponding to keyCode is pressed.
 * @method isKeyPressed
 * @param keyCode {Number} The key code to be tested.
 */
gdjs.RuntimeGame.prototype.isKeyPressed = function(keyCode) {
	return this._pressedKeys.containsKey(keyCode) && this._pressedKeys.get(keyCode);
};

/**
 * Return true if any key is pressed
 * @method anyKeyPressed
 */
gdjs.RuntimeGame.prototype.anyKeyPressed = function() {
	var allKeys = this._pressedKeys.entries();

	for(var i = 0, len = allKeys.length;i < len;++i) {
		if (allKeys[i][1]) {
			return true;
		}
	}

	return false;
};

/**
 * Should be called when the mouse is moved.<br>
 * Please note that the coordinates must be expressed relative to the view position.
 *
 * @method onMouseMove
 * @param x {Number} The mouse new X position
 * @param y {Number} The mouse new Y position
 */
gdjs.RuntimeGame.prototype.onMouseMove = function(x,y) {
	this._mouseX = x;
	this._mouseY = y;
};

/**
 * Get the mouse X position
 *
 * @method getMouseX
 * @return the mouse X position, relative to the game view.
 */
gdjs.RuntimeGame.prototype.getMouseX = function() {
	return this._mouseX;
};

/**
 * Get the mouse Y position
 *
 * @method getMouseY
 * @return the mouse Y position, relative to the game view.
 */
gdjs.RuntimeGame.prototype.getMouseY = function() {
	return this._mouseY;
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
 * Should be called whenever a mouse button is pressed
 * @method onMouseButtonPressed
 * @param buttonCode {Number} The mouse button code associated to the event.<br>0: Left button<br>1: Right button
 */
gdjs.RuntimeGame.prototype.onMouseButtonPressed = function(buttonCode) {
	this._pressedMouseButtons[buttonCode] = true;
};

/**
 * Should be called whenever a mouse button is released
 * @method onMouseButtonReleased
 * @param buttonCode {Number} The mouse button code associated to the event. ( See onMouseButtonPressed )
 */
gdjs.RuntimeGame.prototype.onMouseButtonReleased = function(buttonCode) {
	this._pressedMouseButtons[buttonCode] = false;
};

/**
 * Return true if the mouse button corresponding to buttonCode is pressed.
 * @method isMouseButtonPressed
 * @param buttonCode {Number} The mouse button code.<br>0: Left button<br>1: Right button
 */
gdjs.RuntimeGame.prototype.isMouseButtonPressed = function(buttonCode) {
	return this._pressedMouseButtons[buttonCode] !== undefined && this._pressedMouseButtons[buttonCode];
};

/**
 * Should be called whenever the mouse wheel is used
 * @method onMouseWheel
 * @param wheelDelta {Number} The mouse wheel delta
 */
gdjs.RuntimeGame.prototype.onMouseWheel = function(wheelDelta) {
	this._mouseWheelDelta = wheelDelta;
};

/**
 * Return the mouse wheel delta
 * @method getMouseWheelDelta
 */
gdjs.RuntimeGame.prototype.getMouseWheelDelta = function() {
	return this._mouseWheelDelta;
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

    this._renderer.view.style.cssText="idtkscale:'ScaleAspectFill';"; //CocoonJS support

    var game = this;
    document.onkeydown = function(e) {
        game.onKeyPressed(e.keyCode);
    };
    document.onkeyup = function(e) {
        game.onKeyReleased(e.keyCode);
    };
    this._renderer.view.onmousemove = function(e){
        var pos = [0,0];
        if (e.pageX) {
            pos[0] = e.pageX-game._canvasArea.offsetLeft;
            pos[1] = e.pageY-game._canvasArea.offsetTop;
        }
        else {
            pos[0] = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft-game._canvasArea.offsetLeft;
            pos[1] = e.clientY + document.body.scrollTop + document.documentElement.scrollTop-game._canvasArea.offsetTop;
        }

        //Handle the fact that the game is stretched to fill the canvas.
        pos[0] *= game.getDefaultWidth()/game._renderer.view.width;
        pos[1] *= game.getDefaultHeight()/game._renderer.view.height;

        game.onMouseMove(pos[0], pos[1]);
    };
    this._renderer.view.onmousedown = function(e){
        game.onMouseButtonPressed(e.button === 2 ? 1 : 0);
        if (window.focus !== undefined) window.focus();
        return false;
    };
    this._renderer.view.onmouseup = function(e){
        game.onMouseButtonReleased(e.button === 2 ? 1 : 0);
        return false;
    };
    this._renderer.view.onmouseout = function(e){
        game.onMouseButtonReleased(0);
        game.onMouseButtonReleased(1);
        game.onMouseWheel(0);
        return false;
    };
    window.addEventListener('click', function(e) {
        if (window.focus !== undefined) window.focus();
        e.preventDefault();
        return false;
    }, false);
    this._renderer.view.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    this._renderer.view.onmousewheel = function (event){
        game.onMouseWheel(event.wheelDelta);
    };
    //Simulate mouse events when receiving touch events
    window.addEventListener('touchmove', function(e){
        e.preventDefault();
        if ( e.touches && e.touches.length > 0 ) {
            var pos = [0,0];
            if (e.touches[0].pageX) {
                pos[0] = e.touches[0].pageX-game._canvasArea.offsetLeft;
                pos[1] = e.touches[0].pageY-game._canvasArea.offsetTop;
            }
            else {
                pos[0] = e.touches[0].clientX + document.body.scrollLeft + document.documentElement.scrollLeft-game._canvasArea.offsetLeft;
                pos[1] = e.touches[0].clientY + document.body.scrollTop + document.documentElement.scrollTop-game._canvasArea.offsetTop;
            }

            //Handle the fact that the game is stretched to fill the canvas.
            pos[0] *= game.getDefaultWidth()/game._renderer.view.width;
            pos[1] *= game.getDefaultHeight()/game._renderer.view.height;

            game.onMouseMove(pos[0], pos[1]);
        }
    });
    window.addEventListener('touchstart', function(e){
        e.preventDefault();
        if ( e.touches && e.touches.length > 0 ) {
            var pos = [0,0];
            if (e.touches[0].pageX) {
                if ( isNaN(game._canvasArea.offsetLeft) ) {
                    game._canvasArea.offsetLeft = 0;
                    game._canvasArea.offsetTop = 0;
                }

                pos[0] = e.touches[0].pageX-game._canvasArea.offsetLeft;
                pos[1] = e.touches[0].pageY-game._canvasArea.offsetTop;
            }
            else {
                if ( isNaN(document.body.scrollLeft) ) {
                    document.body.scrollLeft = 0;
                    document.body.scrollTop = 0;
                }
                if ( document.documentElement === undefined || document.documentElement === null ) {
                    document.documentElement = {};
                }
                if ( isNaN(document.documentElement.scrollLeft) ) {
                    document.documentElement.scrollLeft = 0;
                    document.documentElement.scrollTop = 0;
                }
                if ( isNaN(game._canvasArea.offsetLeft) ) {
                    game._canvasArea.offsetLeft = 0;
                    game._canvasArea.offsetTop = 0;
                }
                pos[0] = e.touches[0].clientX + document.body.scrollLeft + document.documentElement.scrollLeft-game._canvasArea.offsetLeft;
                pos[1] = e.touches[0].clientY + document.body.scrollTop + document.documentElement.scrollTop-game._canvasArea.offsetTop;
            }

            //Handle the fact that the game is stretched to fill the canvas.
            pos[0] *= game.getDefaultWidth()/game._renderer.view.width;
            pos[1] *= game.getDefaultHeight()/game._renderer.view.height;

            game.onMouseMove(pos[0], pos[1]);
        }
        game.onMouseButtonPressed(0);
        return false;
    });
    window.addEventListener('touchend', function(e){
        e.preventDefault();
        if ( e.touches && e.touches.length > 0 ) {
            var pos = [0,0];
            if (e.touches[0].pageX) {
                pos[0] = e.touches[0].pageX-game._canvasArea.offsetLeft;
                pos[1] = e.touches[0].pageY-game._canvasArea.offsetTop;
            }
            else {
                pos[0] = e.touches[0].clientX + document.body.scrollLeft + document.documentElement.scrollLeft-game._canvasArea.offsetLeft;
                pos[1] = e.touches[0].clientY + document.body.scrollTop + document.documentElement.scrollTop-game._canvasArea.offsetTop;
            }

            //Handle the fact that the game is stretched to fill the canvas.
            pos[0] *= game.getDefaultWidth()/game._renderer.view.width;
            pos[1] *= game.getDefaultHeight()/game._renderer.view.height;

            game.onMouseMove(pos[0], pos[1]);
        }
        game.onMouseButtonReleased(0);
        return false;
    });
    //Hide the adress bar on handheld devices.
    window.addEventListener('load', function(e) {
        setTimeout(function() {
            if ( document.documentElement.clientWidth < 600 ) {
                window.scrollTo(0, 1);
            }
        }, 1);
    }, false);
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

    //Load all assets
    var loadingStage = new PIXI.Stage();
    var text = new PIXI.Text(" ", {font: "bold 60px Arial", fill: "#FFFFFF", align: "center"});
    loadingStage.addChild(text);
    text.position.x = this._renderer.width/2-50;
    text.position.y = this._renderer.height/2;
    var loadingCount = 0;

    var assets = [];
    gdjs.iterateOverArray(gdjs.projectData.resources.resources, function(res) {
        if ( res.file ) assets.push(res.file);
    });

    var game = this;
    if ( assets.length !== 0 ) {
        var assetLoader = new PIXI.AssetLoader(assets, true);
        assetLoader.onComplete = onAssetsLoaded;
        assetLoader.onProgress = onAssetsLoadingProgress;
        assetLoader.load();
    }
    else {
        onAssetsLoaded();
    }

    function onAssetsLoaded() {
        callback();
    }

    function onAssetsLoadingProgress() {
        game._renderer.render(loadingStage);
        loadingCount++;
        text.setText(Math.floor(loadingCount/assets.length*100) + "%");
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

    requestAnimFrame(gameLoop);

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
                requestAnimFrame( gameLoop );
            }
        }
        else {
            requestAnimFrame( gameLoop );
        }
    }
};
