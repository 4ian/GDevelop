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
    static MOUSE_BACK_BUTTON: integer = 3;
    static MOUSE_FORWARD_BUTTON: integer = 4;
    static MOUSE_TOUCH_ID: integer = 1;

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
    /**
     * The cursor X position (moved by mouse and touch events).
     */
    _cursorX: float = 0;
    /**
     * The cursor Y position (moved by mouse and touch events).
     */
    _cursorY: float = 0;
    /**
     * The mouse X position (only moved by mouse events).
     */
    _mouseX: float = 0;
    /**
     * The mouse Y position (only moved by mouse events).
     */
    _mouseY: float = 0;
    _isMouseInsideCanvas: boolean = true;
    _mouseWheelDelta: float = 0;
    // TODO Remove _touches when there is no longer SpritePanelButton 1.2.0
    // extension in the wild.
    _touches = {
      firstKey: (): string | number | null => {
        for (const key in this._mouseOrTouches.items) {
          // Exclude mouse key.
          if (key !== '1') {
            return key;
          }
        }
        return null;
      },
    };
    _mouseOrTouches: Hashtable<Touch>;
    //Identifiers of the touches that started during/before the frame.
    _startedTouches: Array<integer> = [];

    //Identifiers of the touches that ended during/before the frame.
    _endedTouches: Array<integer> = [];
    _touchSimulateMouse: boolean = true;

    /**
     * @deprecated
     */
    _lastStartedTouchIndex = 0;
    /**
     * @deprecated
     */
    _lastEndedTouchIndex = 0;

    constructor() {
      this._pressedKeys = new Hashtable();
      this._releasedKeys = new Hashtable();
      this._pressedMouseButtons = new Array(5);
      this._releasedMouseButtons = new Array(5);
      this._mouseOrTouches = new Hashtable();
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
    ): integer {
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
    onKeyPressed(keyCode: number, location?: number): void {
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
    onKeyReleased(keyCode: number, location?: number): void {
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
     * Return true if any key is released.
     * @return true if any key is released.
     */
    anyKeyReleased(): boolean {
      for (const keyCode in this._releasedKeys.items) {
        if (this._releasedKeys.items.hasOwnProperty(keyCode)) {
          if (this._releasedKeys.items[keyCode]) {
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
    onMouseMove(x: float, y: float): void {
      this._setCursorPosition(x, y);
      this._mouseX = x;
      this._mouseY = y;
      if (this.isMouseButtonPressed(InputManager.MOUSE_LEFT_BUTTON)) {
        this._moveTouch(
          InputManager.MOUSE_TOUCH_ID,
          this.getCursorX(),
          this.getCursorY()
        );
      }
    }

    _setCursorPosition(x: float, y: float): void {
      this._cursorX = x;
      this._cursorY = y;
    }

    /**
     * Get the cursor X position.
     * The cursor is moved by mouse and touch events.
     *
     * @return the cursor X position, relative to the game view.
     */
    getCursorX(): float {
      return this._cursorX;
    }

    /**
     * Get the cursor Y position.
     * The cursor is moved by mouse and touch events.
     *
     * @return the cursor Y position, relative to the game view.
     */
    getCursorY(): float {
      return this._cursorY;
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
     * Should be called when the mouse leave the canvas.
     */
    onMouseLeave(): void {
      this._isMouseInsideCanvas = false;
    }

    /**
     * Should be called when the mouse enter the canvas.
     */
    onMouseEnter(): void {
      this._isMouseInsideCanvas = true;
    }

    /**
     * @return true when the mouse is inside the canvas.
     */
    isMouseInsideCanvas(): boolean {
      return this._isMouseInsideCanvas;
    }

    /**
     * Should be called whenever a mouse button is pressed.
     * @param buttonCode The mouse button code associated to the event.
     * See InputManager.MOUSE_LEFT_BUTTON, InputManager.MOUSE_RIGHT_BUTTON, InputManager.MOUSE_MIDDLE_BUTTON
     */
    onMouseButtonPressed(buttonCode: number): void {
      this._setMouseButtonPressed(buttonCode);
      if (buttonCode === InputManager.MOUSE_LEFT_BUTTON) {
        this._addTouch(
          InputManager.MOUSE_TOUCH_ID,
          this.getCursorX(),
          this.getCursorY()
        );
      }
    }

    _setMouseButtonPressed(buttonCode: number): void {
      this._pressedMouseButtons[buttonCode] = true;
      this._releasedMouseButtons[buttonCode] = false;
    }

    /**
     * Should be called whenever a mouse button is released.
     * @param buttonCode The mouse button code associated to the event. (see onMouseButtonPressed)
     */
    onMouseButtonReleased(buttonCode: number): void {
      this._setMouseButtonReleased(buttonCode);
      if (buttonCode === InputManager.MOUSE_LEFT_BUTTON) {
        this._removeTouch(InputManager.MOUSE_TOUCH_ID);
      }
    }

    _setMouseButtonReleased(buttonCode: number): void {
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
    onMouseWheel(wheelDelta: number): void {
      this._mouseWheelDelta = wheelDelta;
    }

    /**
     * Return the mouse wheel delta
     */
    getMouseWheelDelta(): float {
      return this._mouseWheelDelta;
    }

    /**
     * Get a touch X position.
     *
     * @return the touch X position, relative to the game view.
     */
    getTouchX(publicIdentifier: integer): float {
      if (!this._mouseOrTouches.containsKey(publicIdentifier)) {
        return 0;
      }
      return this._mouseOrTouches.get(publicIdentifier).x;
    }

    /**
     * Get a touch Y position.
     *
     * @return the touch Y position, relative to the game view.
     */
    getTouchY(publicIdentifier: integer): float {
      if (!this._mouseOrTouches.containsKey(publicIdentifier)) {
        return 0;
      }
      return this._mouseOrTouches.get(publicIdentifier).y;
    }

    /**
     * @param publicIdentifier the touch identifier
     * @returns true if the touch has just ended.
     */
    hasTouchEnded(publicIdentifier: integer): boolean {
      return (
        this._endedTouches.includes(publicIdentifier) &&
        // A touch that end then start in one frame is ignored
        // because it's probably noise.
        this._mouseOrTouches.get(publicIdentifier).justEnded
      );
    }

    /**
     * Update and return the array containing the identifiers of all touches.
     */
    getAllTouchIdentifiers(): Array<integer> {
      InputManager._allTouchIds.length = 0;
      for (const id in this._mouseOrTouches.items) {
        if (this._mouseOrTouches.items.hasOwnProperty(id)) {
          InputManager._allTouchIds.push(parseInt(id, 10));
        }
      }
      return InputManager._allTouchIds;
    }

    onTouchStart(rawIdentifier: integer, x: float, y: float): void {
      this._addTouch(this.getPublicTouchIdentifier(rawIdentifier), x, y);
      if (this._touchSimulateMouse) {
        this._setCursorPosition(x, y);
        this._setMouseButtonPressed(InputManager.MOUSE_LEFT_BUTTON);
      }
    }

    _addTouch(publicIdentifier: integer, x: float, y: float): void {
      // A touch that end then start in one frame is ignored
      // because it's probably noise.
      if (!this._endedTouches.includes(publicIdentifier)) {
        this._startedTouches.push(publicIdentifier);
        this._mouseOrTouches.put(publicIdentifier, {
          x: x,
          y: y,
          justEnded: false,
        });
      }
    }

    onTouchMove(rawIdentifier: integer, x: float, y: float): void {
      this._moveTouch(this.getPublicTouchIdentifier(rawIdentifier), x, y);
      if (this._touchSimulateMouse) {
        this._setCursorPosition(x, y);
      }
    }

    _moveTouch(publicIdentifier: integer, x: float, y: float): void {
      const touch = this._mouseOrTouches.get(publicIdentifier);
      if (!touch) {
        return;
      }
      touch.x = x;
      touch.y = y;
    }

    onTouchEnd(rawIdentifier: number): void {
      this._removeTouch(this.getPublicTouchIdentifier(rawIdentifier));
      if (this._touchSimulateMouse) {
        this._setMouseButtonReleased(InputManager.MOUSE_LEFT_BUTTON);
      }
    }

    onTouchCancel(rawIdentifier: number): void {
      // Don't do anything specific for canceled touches to avoid to make
      // touches handling more complex for users.
      this.onTouchEnd(rawIdentifier);
    }

    _removeTouch(publicIdentifier: number): void {
      this._endedTouches.push(publicIdentifier);
      if (this._mouseOrTouches.containsKey(publicIdentifier)) {
        //Postpone deletion at the end of the frame
        this._mouseOrTouches.get(publicIdentifier).justEnded = true;
      }
    }

    /**
     * Add 2 to the identifier to avoid identifiers taking the GDevelop default
     * variable value which is 0 and reserve 1 for the mouse.
     * @param rawIdentifier The identifier given by the browser.
     * @returns The identifier used in events.
     */
    private getPublicTouchIdentifier(rawIdentifier: integer): integer {
      return rawIdentifier + 2;
    }

    getStartedTouchIdentifiers(): integer[] {
      return this._startedTouches;
    }

    /**
     * @deprecated
     */
    popStartedTouch(): integer | undefined {
      const publicIdentifier = this._startedTouches[
        this._lastStartedTouchIndex
      ];
      this._lastStartedTouchIndex++;
      return publicIdentifier;
    }

    /**
     * @deprecated
     */
    popEndedTouch(): integer | undefined {
      const publicIdentifier = this._endedTouches[this._lastEndedTouchIndex];
      this._lastEndedTouchIndex++;
      return publicIdentifier;
    }

    /**
     * Set if touch events should simulate mouse events.
     *
     * If true, any touch will move the mouse position and set mouse buttons
     * as pressed/released.
     * @param enable true to simulate mouse events, false to disable it.
     */
    touchSimulateMouse(enable: boolean): void {
      if (enable === undefined) {
        enable = true;
      }
      this._touchSimulateMouse = enable;
    }

    /**
     * @returns true if the touch events are used to simulate mouse events.
     */
    isSimulatingMouseWithTouch(): boolean {
      return this._touchSimulateMouse;
    }

    /**
     * Notify the input manager that the frame ended, so anything that last
     * only for one frame (started/ended touches) should be reset.
     *
     * This method should be called in the game loop (see `gdjs.RuntimeGame.startGameLoop`).
     * You don't need to call it otherwise.
     */
    onFrameEnded(): void {
      //Only clear the ended touches at the end of the frame.
      for (const id in this._mouseOrTouches.items) {
        if (this._mouseOrTouches.items.hasOwnProperty(id)) {
          const touch = this._mouseOrTouches.items[id];
          if (touch.justEnded) {
            this._mouseOrTouches.remove(id);
          }
        }
      }
      this._startedTouches.length = 0;
      this._endedTouches.length = 0;
      this._releasedKeys.clear();
      this._releasedMouseButtons.length = 0;
      this._mouseWheelDelta = 0;
      this._lastStartedTouchIndex = 0;
      this._lastEndedTouchIndex = 0;
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
