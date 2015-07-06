/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Store input made on a canvas: mouse position, key pressed
 * and touches states.
 *
 * See **bindStandardEvents** method for connecting the input
 * manager to a canvas and **onFrameEnded** for signaling the
 * end of a frame (necessary for proper touches events handling).
 *
 * @constructor
 * @namespace gdjs
 * @class InputManager
 */
gdjs.InputManager = function()
{
    this._pressedKeys = new Hashtable();
    this._releasedKeys = new Hashtable();
    this._lastPressedKey = 0;
    this._pressedMouseButtons = new Array(5);
    this._releasedMouseButtons = new Array(5);
    this._mouseX = 0;
    this._mouseY = 0;
    this._mouseWheelDelta = 0;
    this._touches = new Hashtable();
    this._startedTouches = []; //Identifiers of the touches that started during/before the frame.
    this._endedTouches = []; //Identifiers of the touches that ended during/before the frame.

    this._touchSimulateMouse = true;
};

/**
 * Should be called whenever a key is pressed
 * @method onKeyPressed
 * @param keyCode {Number} The key code associated to the key press.
 */
gdjs.InputManager.prototype.onKeyPressed = function(keyCode) {
    this._pressedKeys.put(keyCode, true);
    this._lastPressedKey = keyCode;
};

/**
 * Should be called whenever a key is released
 * @method onKeyReleased
 * @param keyCode {Number} The key code associated to the key release.
 */
gdjs.InputManager.prototype.onKeyReleased = function(keyCode) {
    this._pressedKeys.put(keyCode, false);
    this._releasedKeys.put(keyCode, true);
};

/**
 * Return the code of the last key that was pressed.
 * @return {Number} The code of the last key pressed.
 * @method getLastPressedKey
 */
gdjs.InputManager.prototype.getLastPressedKey = function() {
    return this._lastPressedKey;
};

/**
 * Return true if the key corresponding to keyCode is pressed.
 * @method isKeyPressed
 * @param keyCode {Number} The key code to be tested.
 */
gdjs.InputManager.prototype.isKeyPressed = function(keyCode) {
    return this._pressedKeys.containsKey(keyCode) && this._pressedKeys.get(keyCode);
};

/**
 * Return true if the key corresponding to keyCode was released during the last frame.
 * @method wasKeyReleased
 * @param keyCode {Number} The key code to be tested.
 */
gdjs.InputManager.prototype.wasKeyReleased = function(keyCode) {
    return this._releasedKeys.containsKey(keyCode) && this._releasedKeys.get(keyCode);
};

/**
 * Return true if any key is pressed
 * @method anyKeyPressed
 */
gdjs.InputManager.prototype.anyKeyPressed = function() {
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
gdjs.InputManager.prototype.onMouseMove = function(x,y) {
    this._mouseX = x;
    this._mouseY = y;
};

/**
 * Get the mouse X position
 *
 * @method getMouseX
 * @return the mouse X position, relative to the game view.
 */
gdjs.InputManager.prototype.getMouseX = function() {
    return this._mouseX;
};

/**
 * Get the mouse Y position
 *
 * @method getMouseY
 * @return the mouse Y position, relative to the game view.
 */
gdjs.InputManager.prototype.getMouseY = function() {
    return this._mouseY;
};

/**
 * Should be called whenever a mouse button is pressed
 * @method onMouseButtonPressed
 * @param buttonCode {Number} The mouse button code associated to the event.<br>0: Left button<br>1: Right button
 */
gdjs.InputManager.prototype.onMouseButtonPressed = function(buttonCode) {
    this._pressedMouseButtons[buttonCode] = true;
    this._releasedMouseButtons[buttonCode] = false;
};

/**
 * Should be called whenever a mouse button is released
 * @method onMouseButtonReleased
 * @param buttonCode {Number} The mouse button code associated to the event. ( See onMouseButtonPressed )
 */
gdjs.InputManager.prototype.onMouseButtonReleased = function(buttonCode) {
    this._pressedMouseButtons[buttonCode] = false;
    this._releasedMouseButtons[buttonCode] = true;
};

/**
 * Return true if the mouse button corresponding to buttonCode is pressed.
 * @method isMouseButtonPressed
 * @param buttonCode {Number} The mouse button code (0: Left button, 1: Right button).
 */
gdjs.InputManager.prototype.isMouseButtonPressed = function(buttonCode) {
    return this._pressedMouseButtons[buttonCode] !== undefined && this._pressedMouseButtons[buttonCode];
};

/**
 * Return true if the mouse button corresponding to buttonCode was just released.
 * @method isMouseButtonReleased
 * @param buttonCode {Number} The mouse button code (0: Left button, 1: Right button).
 */
gdjs.InputManager.prototype.isMouseButtonReleased = function(buttonCode) {
    return this._releasedMouseButtons[buttonCode] !== undefined && this._releasedMouseButtons[buttonCode];
};

/**
 * Should be called whenever the mouse wheel is used
 * @method onMouseWheel
 * @param wheelDelta {Number} The mouse wheel delta
 */
gdjs.InputManager.prototype.onMouseWheel = function(wheelDelta) {
    this._mouseWheelDelta = wheelDelta;
};

/**
 * Return the mouse wheel delta
 * @method getMouseWheelDelta
 */
gdjs.InputManager.prototype.getMouseWheelDelta = function() {
    return this._mouseWheelDelta;
};

/**
 * Get a touch X position
 *
 * @method getTouchX
 * @return the touch X position, relative to the game view.
 */
gdjs.InputManager.prototype.getTouchX = function(identifier) {
    if (!this._touches.containsKey(identifier))
        return 0;

    return this._touches.get(identifier).x;
};

/**
 * Get a touch Y position
 *
 * @method getTouchY
 * @return the touch Y position, relative to the game view.
 */
gdjs.InputManager.prototype.getTouchY = function(identifier) {
    if (!this._touches.containsKey(identifier))
        return 0;

    return this._touches.get(identifier).y;
};

/**
 * Return an array containing the identifiers of all touches.
 *
 * @method getAllTouchIdentifiers
 */
gdjs.InputManager.prototype.getAllTouchIdentifiers = function() {
    var touchIds = this._touches.keys();
    for(var i = 0;i<touchIds.length;++i) {
        touchIds[i] = parseInt(touchIds[i], 10);
    }

    return touchIds;
};

gdjs.InputManager.prototype.onTouchStart = function(identifier, x, y) {
    this._startedTouches.push(identifier);
    this._touches.put(identifier, {x: x, y: y});

    if (this._touchSimulateMouse) {
        this.onMouseMove(x, y);
        this.onMouseButtonPressed(0);
    }
};

gdjs.InputManager.prototype.onTouchMove = function(identifier, x, y) {
    var touch = this._touches.get(identifier);
    if (!touch) return;

    touch.x = x;
    touch.y = y;

    if (this._touchSimulateMouse) {
        this.onMouseMove(x, y);
    }
};

gdjs.InputManager.prototype.onTouchEnd = function(identifier) {
    this._endedTouches.push(identifier);
    if (this._touches.containsKey(identifier)) { //Postpone deletion at the end of the frame
        this._touches.get(identifier).justEnded = true;
    }

    if (this._touchSimulateMouse) {
        this.onMouseButtonReleased(0);
    }
};

gdjs.InputManager.prototype.getStartedTouchIdentifiers = function() {
    return this._startedTouches;
};

gdjs.InputManager.prototype.popStartedTouch = function() {
    return this._startedTouches.shift();
};

gdjs.InputManager.prototype.popEndedTouch = function() {
    return this._endedTouches.shift();
};

/**
 * Set if touch events should simulate mouse events.
 *
 * If true, any touch will move the mouse position and set mouse buttons
 * as pressed/released.
 * @method touchSimulateMouse
 * @param enable {Boolean} true to simulate mouse events, false to disable it.
 */
gdjs.InputManager.prototype.touchSimulateMouse = function(enable) {
    if (enable === undefined) enable = true;

    this._touchSimulateMouse = enable;
};

/**
 * Notify the input manager that the frame ended, so anything that last
 * only for one frame (started/ended touches) should be reset.
 *
 * This method should be called in the game loop (see gdjs.RuntimeGame.startStandardGameLoop).
 * @method onFrameEnded
 */
gdjs.InputManager.prototype.onFrameEnded = function() {
    //Only clear the ended touches at the end of the frame.
    var identifiers = this._touches.keys();
    for(var i = 0;i<identifiers.length;++i) {
        var touch = this._touches.get(identifiers[i]);
        if(touch.justEnded) {
            this._touches.remove(identifiers[i]);
        }
    }

    this._startedTouches.length = 0;
    this._endedTouches.length = 0;
    this._releasedKeys.clear();
    this._releasedMouseButtons.length = 0;
};

/**
 * Add the standard events handler.
 * @method bindStandardEvents
 */
gdjs.InputManager.prototype.bindStandardEvents = function(window, document, game, renderer, canvasArea) {

    //Translate an event (mouse or touch) made on the canvas on the page
    //to game coordinates.
    function getEventPosition(e) {
        var pos = [0,0];
        if (e.pageX) {
            pos[0] = e.pageX-canvasArea.offsetLeft;
            pos[1] = e.pageY-canvasArea.offsetTop;
        } else {
            pos[0] = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft-canvasArea.offsetLeft;
            pos[1] = e.clientY + document.body.scrollTop + document.documentElement.scrollTop-canvasArea.offsetTop;
        }

        //Handle the fact that the game is stretched to fill the canvas.
        pos[0] *= game.getDefaultWidth()/renderer.view.width;
        pos[1] *= game.getDefaultHeight()/renderer.view.height;

        return pos;
    }

    //Some browsers lacks definition of some variables used to do calculations
    //in getEventPosition. They are defined to 0 as they are useless.
    (function ensureOffsetsExistence() {
        if ( isNaN(canvasArea.offsetLeft) ) {
            canvasArea.offsetLeft = 0;
            canvasArea.offsetTop = 0;
        }
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
        if ( isNaN(canvasArea.offsetLeft) ) {
            canvasArea.offsetLeft = 0;
            canvasArea.offsetTop = 0;
        }
    })();

    var manager = this;
    //Keyboard
    document.onkeydown = function(e) {
        manager.onKeyPressed(e.keyCode);
    };
    document.onkeyup = function(e) {
        manager.onKeyReleased(e.keyCode);
    };
    //Mouse
    renderer.view.onmousemove = function(e){
        var pos = getEventPosition(e);
        manager.onMouseMove(pos[0], pos[1]);
    };
    renderer.view.onmousedown = function(e){
        manager.onMouseButtonPressed(e.button === 2 ? 1 : 0);
        if (window.focus !== undefined) window.focus();
        return false;
    };
    renderer.view.onmouseup = function(e){
        manager.onMouseButtonReleased(e.button === 2 ? 1 : 0);
        return false;
    };
    renderer.view.onmouseout = function(e){
        manager.onMouseButtonReleased(0);
        manager.onMouseButtonReleased(1);
        manager.onMouseWheel(0);
        return false;
    };
    window.addEventListener('click', function(e) {
        if (window.focus !== undefined) window.focus();
        e.preventDefault();
        return false;
    }, false);
    renderer.view.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    renderer.view.onmousewheel = function (event){
        manager.onMouseWheel(event.wheelDelta);
    };
    //Touches
    //Also simulate mouse events when receiving touch events
    window.addEventListener('touchmove', function(e){
        e.preventDefault();
        if (e.changedTouches) {
            for(var i = 0;i<e.changedTouches.length;++i) {
                var pos = getEventPosition(e.changedTouches[i]);
                manager.onTouchMove(e.changedTouches[i].identifier, pos[0], pos[1]);
            }
        }
    });
    window.addEventListener('touchstart', function(e){
        e.preventDefault();
        if (e.changedTouches) {
            for(var i = 0;i<e.changedTouches.length;++i) {
                var pos = getEventPosition(e.changedTouches[i]);
                manager.onTouchStart(e.changedTouches[i].identifier, pos[0], pos[1]);
            }
        }
        return false;
    });
    window.addEventListener('touchend', function(e){
        e.preventDefault();
        if (e.changedTouches) {
            for(var i = 0;i<e.changedTouches.length;++i) {
                var pos = getEventPosition(e.changedTouches[i]);
                manager.onTouchEnd(e.changedTouches[i].identifier);
            }
        }
        return false;
    });
};

