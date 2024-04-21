/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace input {
      /**
       * @deprecated
       */
      export let lastTouchId = 0;
      /**
       * @deprecated
       */
      export let lastEndedTouchId = 0;

      /**
       * Hashmap associated each name of a key to its location-aware keyCode.
       * @memberof gdjs.evtTools
       */
      export const keysNameToCode = {
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        Num0: 48,
        Num1: 49,
        Num2: 50,
        Num3: 51,
        Num4: 52,
        Num5: 53,
        Num6: 54,
        Num7: 55,
        Num8: 56,
        Num9: 57,
        Numpad0: 96,
        Numpad1: 97,
        Numpad2: 98,
        Numpad3: 99,
        Numpad4: 100,
        Numpad5: 101,
        Numpad6: 102,
        Numpad7: 103,
        Numpad8: 104,
        Numpad9: 105,
        LShift: 1016,
        RShift: 2016,
        LControl: 1017,
        RControl: 2017,
        LAlt: 1018,
        RAlt: 2018,
        LSystem: 1091,
        RSystem: 2091,
        SemiColon: 186,
        Comma: 188,
        Period: 190,
        Quote: 222,
        Slash: 191,
        BackSlash: 220,
        Equal: 187,
        Dash: 189,
        Menu: 93,
        LBracket: 219,
        RBracket: 221,
        Tilde: 192,
        Space: 32,
        Back: 8,
        Tab: 9,
        Delete: 46,
        Insert: 45,
        Escape: 27,
        PageUp: 33,
        PageDown: 34,
        End: 35,
        Home: 36,
        Return: 13,
        NumpadPageUp: 3033,
        NumpadPageDown: 3034,
        NumpadEnd: 3035,
        NumpadHome: 3036,
        NumpadReturn: 3013,
        Add: 107,
        Subtract: 109,
        Multiply: 106,
        Divide: 111,
        NumpadAdd: 3107,
        NumpadSubtract: 3109,
        NumpadMultiply: 3106,
        NumpadDivide: 3111,
        Left: 37,
        Up: 38,
        Right: 39,
        Down: 40,
        NumpadLeft: 3037,
        NumpadUp: 3038,
        NumpadRight: 3039,
        NumpadDown: 3040,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        Pause: 19,
      };

      const keysCodeToName = {};
      for (const p in keysNameToCode) {
        if (keysNameToCode.hasOwnProperty(p)) {
          keysCodeToName[keysNameToCode[p]] = p;
        }
      }

      /**
       * A hashmap associates each name of a mouse button with its respective code.
       * @memberof gdjs.evtTools
       */
      export const mouseButtonsNameToCode = {
        Left: gdjs.InputManager.MOUSE_LEFT_BUTTON,
        Right: gdjs.InputManager.MOUSE_RIGHT_BUTTON,
        Middle: gdjs.InputManager.MOUSE_MIDDLE_BUTTON,
        Back: gdjs.InputManager.MOUSE_BACK_BUTTON,
        Forward: gdjs.InputManager.MOUSE_FORWARD_BUTTON,
      };

      /**
       * Return true if the specified key is pressed
       *
       */
      export const isKeyPressed = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        key: string
      ) {
        if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
          return instanceContainer
            .getGame()
            .getInputManager()
            .isKeyPressed(gdjs.evtTools.input.keysNameToCode[key]);
        }
        return false;
      };

      /**
       * Return true if the specified key was just released
       *
       */
      export const wasKeyReleased = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        key: string
      ) {
        if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
          return instanceContainer
            .getGame()
            .getInputManager()
            .wasKeyReleased(gdjs.evtTools.input.keysNameToCode[key]);
        }
        return false;
      };

      /**
       * Return the name of the last key pressed in the game
       */
      export const lastPressedKey = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        const keyCode = instanceContainer
          .getGame()
          .getInputManager()
          .getLastPressedKey();
        if (keysCodeToName.hasOwnProperty(keyCode)) {
          return keysCodeToName[keyCode];
        }
        return '';
      };

      export const anyKeyPressed = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        return instanceContainer.getGame().getInputManager().anyKeyPressed();
      };

      export const anyKeyReleased = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        return instanceContainer.getGame().getInputManager().anyKeyReleased();
      };

      export const isMouseButtonPressed = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        button: string
      ) {
        if (gdjs.evtTools.input.mouseButtonsNameToCode.hasOwnProperty(button)) {
          return instanceContainer
            .getGame()
            .getInputManager()
            .isMouseButtonPressed(
              gdjs.evtTools.input.mouseButtonsNameToCode[button]
            );
        }
        return false;
      };

      export const isMouseButtonReleased = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        button: string
      ) {
        if (gdjs.evtTools.input.mouseButtonsNameToCode.hasOwnProperty(button)) {
          return instanceContainer
            .getGame()
            .getInputManager()
            .isMouseButtonReleased(
              gdjs.evtTools.input.mouseButtonsNameToCode[button]
            );
        }
        return false;
      };

      export const hideCursor = function (
        instanceContainer: gdjs.RuntimeScene
      ) {
        instanceContainer.getScene().getRenderer().hideCursor();
      };

      export const showCursor = function (
        instanceContainer: gdjs.RuntimeScene
      ) {
        instanceContainer.getScene().getRenderer().showCursor();
      };

      export const getMouseWheelDelta = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        return instanceContainer
          .getGame()
          .getInputManager()
          .getMouseWheelDelta();
      };

      export const isScrollingUp = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        return instanceContainer.getGame().getInputManager().isScrollingUp();
      };

      export const isScrollingDown = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        return instanceContainer.getGame().getInputManager().isScrollingDown();
      };

      /**
       * @deprecated Use getCursorX instead.
       */
      export const getMouseX = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        camera: integer
      ) {
        return getCursorX(instanceContainer, layer, camera);
      };

      /**
       * @deprecated Use getCursorY instead.
       */
      export const getMouseY = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        camera: integer
      ) {
        return getCursorY(instanceContainer, layer, camera);
      };

      export const getCursorX = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        camera: integer
      ) {
        const workingPoint: FloatPoint = gdjs.staticArray(
          gdjs.evtTools.input.getCursorX
        ) as FloatPoint;
        return instanceContainer
          .getLayer(layer)
          .convertCoords(
            instanceContainer.getGame().getInputManager().getCursorX(),
            instanceContainer.getGame().getInputManager().getCursorY(),
            0,
            workingPoint
          )[0];
      };

      export const getCursorY = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        camera: integer
      ) {
        const workingPoint: FloatPoint = gdjs.staticArray(
          gdjs.evtTools.input.getCursorY
        ) as FloatPoint;
        return instanceContainer
          .getLayer(layer)
          .convertCoords(
            instanceContainer.getGame().getInputManager().getCursorX(),
            instanceContainer.getGame().getInputManager().getCursorY(),
            0,
            workingPoint
          )[1];
      };

      export const getMouseOnlyCursorX = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        camera: integer
      ) {
        const workingPoint: FloatPoint = gdjs.staticArray(
          gdjs.evtTools.input.getMouseOnlyCursorX
        ) as FloatPoint;
        return instanceContainer
          .getLayer(layer)
          .convertCoords(
            instanceContainer.getGame().getInputManager().getMouseX(),
            instanceContainer.getGame().getInputManager().getMouseY(),
            0,
            workingPoint
          )[0];
      };

      export const getMouseOnlyCursorY = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        layer: string,
        camera: integer
      ) {
        const workingPoint: FloatPoint = gdjs.staticArray(
          gdjs.evtTools.input.getMouseOnlyCursorY
        ) as FloatPoint;
        return instanceContainer
          .getLayer(layer)
          .convertCoords(
            instanceContainer.getGame().getInputManager().getMouseX(),
            instanceContainer.getGame().getInputManager().getMouseY(),
            0,
            workingPoint
          )[1];
      };

      export const isMouseInsideCanvas = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        return instanceContainer
          .getGame()
          .getInputManager()
          .isMouseInsideCanvas();
      };

      const _cursorIsOnObject = function (
        obj: gdjs.RuntimeObject,
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        return obj.cursorOnObject(instanceContainer);
      };

      export const cursorOnObject = function (
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        instanceContainer: gdjs.RuntimeInstanceContainer,
        accurate: boolean,
        inverted: boolean
      ) {
        return gdjs.evtTools.object.pickObjectsIf(
          _cursorIsOnObject,
          objectsLists,
          inverted,
          instanceContainer
        );
      };

      export const getTouchX = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        identifier: integer,
        layer: string,
        camera: integer
      ) {
        const workingPoint: FloatPoint = gdjs.staticArray(
          gdjs.evtTools.input.getTouchX
        ) as FloatPoint;
        return instanceContainer
          .getLayer(layer)
          .convertCoords(
            instanceContainer.getGame().getInputManager().getTouchX(identifier),
            instanceContainer.getGame().getInputManager().getTouchY(identifier),
            0,
            workingPoint
          )[0];
      };

      export const getTouchY = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        identifier: integer,
        layer: string,
        camera: integer
      ) => {
        const workingPoint: FloatPoint = gdjs.staticArray(
          gdjs.evtTools.input.getTouchY
        ) as FloatPoint;
        return instanceContainer
          .getLayer(layer)
          .convertCoords(
            instanceContainer.getGame().getInputManager().getTouchX(identifier),
            instanceContainer.getGame().getInputManager().getTouchY(identifier),
            0,
            workingPoint
          )[1];
      };

      /**
       * @deprecated
       */
      export const hasAnyTouchStarted = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean => {
        const startedTouchIdentifiers = instanceContainer
          .getGame()
          .getInputManager()
          .getStartedTouchIdentifiers();
        return (
          startedTouchIdentifiers.length > 1 ||
          (startedTouchIdentifiers.length > 0 &&
            startedTouchIdentifiers[0] !== gdjs.InputManager.MOUSE_TOUCH_ID)
        );
      };

      /**
       * @deprecated
       */
      export const getStartedTouchCount = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): integer => {
        const startedTouchIdentifiers = instanceContainer
          .getGame()
          .getInputManager()
          .getStartedTouchIdentifiers();
        return (
          startedTouchIdentifiers.length +
          (startedTouchIdentifiers.includes(gdjs.InputManager.MOUSE_TOUCH_ID)
            ? -1
            : 0)
        );
      };

      /**
       * @deprecated
       */
      export const getStartedTouchIdentifier = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        index: integer
      ): integer => {
        const startedTouchIdentifiers = instanceContainer
          .getGame()
          .getInputManager()
          .getStartedTouchIdentifiers();
        const mouseIndex = startedTouchIdentifiers.indexOf(
          gdjs.InputManager.MOUSE_TOUCH_ID
        );
        return mouseIndex < 0
          ? startedTouchIdentifiers[index]
          : startedTouchIdentifiers[index < mouseIndex ? index : index + 1];
      };

      export const hasAnyTouchOrMouseStarted = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean => {
        return (
          instanceContainer
            .getGame()
            .getInputManager()
            .getStartedTouchIdentifiers().length > 0
        );
      };

      export const getStartedTouchOrMouseCount = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): integer => {
        return instanceContainer
          .getGame()
          .getInputManager()
          .getStartedTouchIdentifiers().length;
      };

      export const getStartedTouchOrMouseIdentifier = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        index: integer
      ): integer => {
        return instanceContainer
          .getGame()
          .getInputManager()
          .getStartedTouchIdentifiers()[index];
      };

      export const hasTouchEnded = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        identifier: integer
      ): boolean => {
        return instanceContainer
          .getGame()
          .getInputManager()
          .hasTouchEnded(identifier);
      };

      /**
       * @deprecated
       */
      export const getLastTouchId = function () {
        return gdjs.evtTools.input.lastTouchId || 0;
      };

      /**
       * @deprecated
       */
      export const getLastEndedTouchId = function () {
        return gdjs.evtTools.input.lastEndedTouchId || 0;
      };

      /**
       * @deprecated
       */
      export const popStartedTouch = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        const startedTouchId = instanceContainer
          .getGame()
          .getInputManager()
          .popStartedTouch();
        if (startedTouchId !== undefined) {
          gdjs.evtTools.input.lastTouchId = startedTouchId;
          return true;
        }
        return false;
      };

      /**
       * @deprecated
       */
      export const popEndedTouch = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        const endedTouchId = instanceContainer
          .getGame()
          .getInputManager()
          .popEndedTouch();
        if (endedTouchId !== undefined) {
          gdjs.evtTools.input.lastEndedTouchId = endedTouchId;
          return true;
        }
        return false;
      };

      export const touchSimulateMouse = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        enable: boolean
      ) {
        instanceContainer
          .getGame()
          .getInputManager()
          .touchSimulateMouse(enable);
      };
    }
  }
}
