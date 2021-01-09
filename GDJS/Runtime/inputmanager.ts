/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  type Touch = { x: float; y: float; justEnded: boolean };

  /**
   * Store input made on a canvas: mouse position, key pressed
   * and touches states.
   */
  export class InputManager {
    static MOUSE_LEFT_BUTTON: integer = 0;
    static MOUSE_RIGHT_BUTTON: integer = 1;
    static MOUSE_MIDDLE_BUTTON: integer = 2;

    /**
     * Holds the raw keyCodes of the keys which only have left/right
     * variants and should default to their left variant values
     * if location is not specified.
     */
    static _DEFAULT_LEFT_VARIANT_KEYS: integer[] = [16, 17, 18, 91];
    _pressedKeys: Hashtable<boolean>;
    _releasedKeys: Hashtable<boolean>;
    _lastPressedKey: float = 0;
    _pressedMouseButtons: Array<boolean>;
    _releasedMouseButtons: Array<boolean>;
    _mouseX: float = 0;
    _mouseY: float = 0;
    _mouseWheelDelta: float = 0;
    _touches: Hashtable<Touch>;
    //Identifiers of the touches that started during/before the frame.
    _startedTouches: Array<integer> = [];

    //Identifiers of the touches that ended during/before the frame.
    _endedTouches: Array<integer> = [];
    _touchSimulateMouse: boolean = true;

    constructor() {
      this._pressedKeys = new Hashtable();
      this._releasedKeys = new Hashtable();
      this._pressedMouseButtons = new Array(5);
      this._releasedMouseButtons = new Array(5);
      this._touches = new Hashtable();
    }

    /**
     * Returns the "location-aware" keyCode, given a raw keyCode
     * and location. The location corresponds to KeyboardEvent.location,
     * which should be 0 for standard keys, 1 for left keys,
     * 2 for right keys, and 3 for numpad keys.
     *
     * @param keyCode The raw key code
     * @param location The location
     */
    _getLocationAwareKeyCode(
      keyCode: number,
      location: number | null | undefined
    ) {
      if (location) {
        // If it is a numpad number, do not modify it.
        if (96 <= keyCode && keyCode <= 105) {
          return keyCode;
        }
        return keyCode + 1000 * location;
      }
      if (InputManager._DEFAULT_LEFT_VARIANT_KEYS.indexOf(keyCode) !== -1) {
        return keyCode + 1000;
      }
      return keyCode;
    }

    /**
     * Should be called whenever a key is pressed. The location corresponds to
     * KeyboardEvent.location, which should be 0 for standard keys, 1 for left keys,
     * 2 for right keys, and 3 for numpad keys.
     * @param keyCode The raw key code associated to the key press.
     * @param location The location of the event.
     */
    onKeyPressed(keyCode: number, location?: number) {
      const locationAwareKeyCode = this._getLocationAwareKeyCode(
        keyCode,
        location
      );
      this._pressedKeys.put(locationAwareKeyCode, true);
      this._lastPressedKey = locationAwareKeyCode;
    }

    /**
     * Should be called whenever a key is released. The location corresponds to
     * KeyboardEvent.location, which should be 0 for standard keys, 1 for left keys,
     * 2 for right keys, and 3 for numpad keys.
     * @param keyCode The raw key code associated to the key release.
     * @param location The location of the event.
     */
    onKeyReleased(keyCode: number, location?: number) {
      const locationAwareKeyCode = this._getLocationAwareKeyCode(
        keyCode,
        location
      );
      this._pressedKeys.put(locationAwareKeyCode, false);
      this._releasedKeys.put(locationAwareKeyCode, true);
    }

    /**
     * Return the location-aware code of the last key that was pressed.
     * @return The location-aware code of the last key pressed.
     */
    getLastPressedKey(): number {
      return this._lastPressedKey;
    }

    /**
     * Return true if the key corresponding to the location-aware keyCode is pressed.
     * @param locationAwareKeyCode The location-aware key code to be tested.
     */
    isKeyPressed(locationAwareKeyCode: number): boolean {
      return (
        this._pressedKeys.containsKey(locationAwareKeyCode) &&
        this._pressedKeys.get(locationAwareKeyCode)
      );
    }

    /**
     * Return true if the key corresponding to the location-aware keyCode was released during the last frame.
     * @param locationAwareKeyCode The location-aware key code to be tested.
     */
    wasKeyReleased(locationAwareKeyCode: number) {
      return (
        this._releasedKeys.containsKey(locationAwareKeyCode) &&
        this._releasedKeys.get(locationAwareKeyCode)
      );
    }

    /**
     * Return true if any key is pressed.
     * @return true if any key is pressed.
     */
    anyKeyPressed(): boolean {
      for (const keyCode in this._pressedKeys.items) {
        if (this._pressedKeys.items.hasOwnProperty(keyCode)) {
          if (this._pressedKeys.items[keyCode]) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * Should be called when the mouse is moved.
     *
     * Please note that the coordinates must be expressed relative to the view position.
     *
     * @param x The mouse new X position
     * @param y The mouse new Y position
     */
    onMouseMove(x: float, y: float) {
      this._mouseX = x;
      this._mouseY = y;
    }

    /**
     * Get the mouse X position.
     *
     * @return the mouse X position, relative to the game view.
     */
    getMouseX(): float {
      return this._mouseX;
    }

    /**
     * Get the mouse Y position.
     *
     * @return the mouse Y position, relative to the game view.
     */
    getMouseY(): float {
      return this._mouseY;
    }

    /**
     * Should be called whenever a mouse button is pressed.
     * @param buttonCode The mouse button code associated to the event.
     * See InputManager.MOUSE_LEFT_BUTTON, InputManager.MOUSE_RIGHT_BUTTON, InputManager.MOUSE_MIDDLE_BUTTON
     */
    onMouseButtonPressed(buttonCode: number) {
      this._pressedMouseButtons[buttonCode] = true;
      this._releasedMouseButtons[buttonCode] = false;
    }

    /**
     * Should be called whenever a mouse button is released.
     * @param buttonCode The mouse button code associated to the event. (see onMouseButtonPressed)
     */
    onMouseButtonReleased(buttonCode: number) {
      this._pressedMouseButtons[buttonCode] = false;
      this._releasedMouseButtons[buttonCode] = true;
    }

    /**
     * Return true if the mouse button corresponding to buttonCode is pressed.
     * @param buttonCode The mouse button code (0: Left button, 1: Right button).
     */
    isMouseButtonPressed(buttonCode: number): boolean {
      return (
        this._pressedMouseButtons[buttonCode] !== undefined &&
        this._pressedMouseButtons[buttonCode]
      );
    }

    /**
     * Return true if the mouse button corresponding to buttonCode was just released.
     * @param buttonCode The mouse button code (0: Left button, 1: Right button).
     */
    isMouseButtonReleased(buttonCode: number): boolean {
      return (
        this._releasedMouseButtons[buttonCode] !== undefined &&
        this._releasedMouseButtons[buttonCode]
      );
    }

    /**
     * Should be called whenever the mouse wheel is used
     * @param wheelDelta The mouse wheel delta
     */
    onMouseWheel(wheelDelta: number) {
      this._mouseWheelDelta = wheelDelta;
    }

    /**
     * Return the mouse wheel delta
     */
    getMouseWheelDelta() {
      return this._mouseWheelDelta;
    }

    /**
     * Get a touch X position.
     *
     * @return the touch X position, relative to the game view.
     */
    getTouchX(identifier: integer): float {
      if (!this._touches.containsKey(identifier)) {
        return 0;
      }
      return this._touches.get(identifier).x;
    }

    /**
     * Get a touch Y position.
     *
     * @return the touch Y position, relative to the game view.
     */
    getTouchY(identifier: integer): float {
      if (!this._touches.containsKey(identifier)) {
        return 0;
      }
      return this._touches.get(identifier).y;
    }

    /**
     * Update and return the array containing the identifiers of all touches.
     */
    getAllTouchIdentifiers(): Array<integer> {
      InputManager._allTouchIds.length = 0;
      for (const id in this._touches.items) {
        if (this._touches.items.hasOwnProperty(id)) {
          InputManager._allTouchIds.push(parseInt(id, 10));
        }
      }
      return InputManager._allTouchIds;
    }

    onTouchStart(identifier: integer, x, y) {
      this._startedTouches.push(identifier);
      this._touches.put(identifier, { x: x, y: y, justEnded: false });
      if (this._touchSimulateMouse) {
        this.onMouseMove(x, y);
        this.onMouseButtonPressed(InputManager.MOUSE_LEFT_BUTTON);
      }
    }

    onTouchMove(identifier: integer, x, y) {
      const touch = this._touches.get(identifier);
      if (!touch) {
        return;
      }
      touch.x = x;
      touch.y = y;
      if (this._touchSimulateMouse) {
        this.onMouseMove(x, y);
      }
    }

    onTouchEnd(identifier) {
      this._endedTouches.push(identifier);
      if (this._touches.containsKey(identifier)) {
        //Postpone deletion at the end of the frame
        this._touches.get(identifier).justEnded = true;
      }
      if (this._touchSimulateMouse) {
        this.onMouseButtonReleased(InputManager.MOUSE_LEFT_BUTTON);
      }
    }

    getStartedTouchIdentifiers() {
      return this._startedTouches;
    }

    popStartedTouch() {
      return this._startedTouches.shift();
    }

    popEndedTouch() {
      return this._endedTouches.shift();
    }

    /**
     * Set if touch events should simulate mouse events.
     *
     * If true, any touch will move the mouse position and set mouse buttons
     * as pressed/released.
     * @param enable true to simulate mouse events, false to disable it.
     */
    touchSimulateMouse(enable: boolean) {
      if (enable === undefined) {
        enable = true;
      }
      this._touchSimulateMouse = enable;
    }

    /**
     * Notify the input manager that the frame ended, so anything that last
     * only for one frame (started/ended touches) should be reset.
     *
     * This method should be called in the game loop (see `gdjs.RuntimeGame.startGameLoop`).
     * You don't need to call it otherwise.
     */
    onFrameEnded() {
      //Only clear the ended touches at the end of the frame.
      for (const id in this._touches.items) {
        if (this._touches.items.hasOwnProperty(id)) {
          const touch = this._touches.items[id];
          if (touch.justEnded) {
            this._touches.remove(id);
          }
        }
      }
      this._startedTouches.length = 0;
      this._endedTouches.length = 0;
      this._releasedKeys.clear();
      this._releasedMouseButtons.length = 0;
      this._mouseWheelDelta = 0;
    }

    /**
     * Return true if the mouse wheel scroll to up
     */
    isScrollingUp(): boolean {
      return this.getMouseWheelDelta() > 0;
    }

    /**
     * Return true if the mouse wheel scroll to down
     */
    isScrollingDown(): boolean {
      return this.getMouseWheelDelta() < 0;
    }

    static _allTouchIds: Array<integer> = [];
  }
}
