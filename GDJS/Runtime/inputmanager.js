/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
 * @memberof gdjs
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
 * @param {number} keyCode The key code associated to the key press.
 */
gdjs.InputManager.prototype.onKeyPressed = function(keyCode) {
    this._pressedKeys.put(keyCode, true);
    this._lastPressedKey = keyCode;
};

/**
 * Should be called whenever a key is released
 * @param {number} keyCode The key code associated to the key release.
 */
gdjs.InputManager.prototype.onKeyReleased = function(keyCode) {
    this._pressedKeys.put(keyCode, false);
    this._releasedKeys.put(keyCode, true);
};

/**
 * Return the code of the last key that was pressed.
 * @return {number} The code of the last key pressed.
 */
gdjs.InputManager.prototype.getLastPressedKey = function() {
    return this._lastPressedKey;
};

/**
 * Return true if the key corresponding to keyCode is pressed.
 * @param {number} keyCode The key code to be tested.
 */
gdjs.InputManager.prototype.isKeyPressed = function(keyCode) {
    return this._pressedKeys.containsKey(keyCode) && this._pressedKeys.get(keyCode);
};

/**
 * Return true if the key corresponding to keyCode was released during the last frame.
 * @param {number} keyCode The key code to be tested.
 */
gdjs.InputManager.prototype.wasKeyReleased = function(keyCode) {
    return this._releasedKeys.containsKey(keyCode) && this._releasedKeys.get(keyCode);
};

/**
 * Return true if any key is pressed
 */
gdjs.InputManager.prototype.anyKeyPressed = function() {
    for(var keyCode in this._pressedKeys.items) {
        if (this._pressedKeys.items.hasOwnProperty(keyCode)) {
            if (this._pressedKeys.items[keyCode]) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Should be called when the mouse is moved.<br>
 * Please note that the coordinates must be expressed relative to the view position.
 *
 * @param {number} x The mouse new X position
 * @param {number} y The mouse new Y position
 */
gdjs.InputManager.prototype.onMouseMove = function(x,y) {
    this._mouseX = x;
    this._mouseY = y;
};

/**
 * Get the mouse X position
 *
 * @return the mouse X position, relative to the game view.
 */
gdjs.InputManager.prototype.getMouseX = function() {
    return this._mouseX;
};

/**
 * Get the mouse Y position
 *
 * @return the mouse Y position, relative to the game view.
 */
gdjs.InputManager.prototype.getMouseY = function() {
    return this._mouseY;
};

/**
 * Should be called whenever a mouse button is pressed
 * @param {number} buttonCode The mouse button code associated to the event.<br>0: Left button<br>1: Right button
 */
gdjs.InputManager.prototype.onMouseButtonPressed = function(buttonCode) {
    this._pressedMouseButtons[buttonCode] = true;
    this._releasedMouseButtons[buttonCode] = false;
};

/**
 * Should be called whenever a mouse button is released
 * @param {number} buttonCode The mouse button code associated to the event. ( See onMouseButtonPressed )
 */
gdjs.InputManager.prototype.onMouseButtonReleased = function(buttonCode) {
    this._pressedMouseButtons[buttonCode] = false;
    this._releasedMouseButtons[buttonCode] = true;
};

/**
 * Return true if the mouse button corresponding to buttonCode is pressed.
 * @param {number} buttonCode The mouse button code (0: Left button, 1: Right button).
 */
gdjs.InputManager.prototype.isMouseButtonPressed = function(buttonCode) {
    return this._pressedMouseButtons[buttonCode] !== undefined && this._pressedMouseButtons[buttonCode];
};

/**
 * Return true if the mouse button corresponding to buttonCode was just released.
 * @param {number} buttonCode The mouse button code (0: Left button, 1: Right button).
 */
gdjs.InputManager.prototype.isMouseButtonReleased = function(buttonCode) {
    return this._releasedMouseButtons[buttonCode] !== undefined && this._releasedMouseButtons[buttonCode];
};

/**
 * Should be called whenever the mouse wheel is used
 * @param {number} wheelDelta The mouse wheel delta
 */
gdjs.InputManager.prototype.onMouseWheel = function(wheelDelta) {
    this._mouseWheelDelta = wheelDelta;
};

/**
 * Return the mouse wheel delta
 */
gdjs.InputManager.prototype.getMouseWheelDelta = function() {
    return this._mouseWheelDelta;
};

/**
 * Get a touch X position
 *
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
 * @return the touch Y position, relative to the game view.
 */
gdjs.InputManager.prototype.getTouchY = function(identifier) {
    if (!this._touches.containsKey(identifier))
        return 0;

    return this._touches.get(identifier).y;
};

/**
 * Update and return the array containing the identifiers of all touches.
 *
 */
gdjs.InputManager.prototype.getAllTouchIdentifiers = function() {
    gdjs.InputManager._allTouchIds = gdjs.InputManager._allTouchIds || [];
    gdjs.InputManager._allTouchIds.length = 0;

    for(var id in this._touches.items) {
        if (this._touches.items.hasOwnProperty(id)) {
            gdjs.InputManager._allTouchIds.push(parseInt(id, 10));
        }
    }

    return gdjs.InputManager._allTouchIds;
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
 * This method should be called in the game loop (see gdjs.RuntimeGame.startGameLoop).
 */
gdjs.InputManager.prototype.onFrameEnded = function() {
    //Only clear the ended touches at the end of the frame.
    for(var id in this._touches.items) {
        if (this._touches.items.hasOwnProperty(id)) {
            var touch = this._touches.items[id];
            if(touch.justEnded) {
                this._touches.remove(id);
            }
        }
    }

    this._startedTouches.length = 0;
    this._endedTouches.length = 0;
    this._releasedKeys.clear();
    this._releasedMouseButtons.length = 0;
};
