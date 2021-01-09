/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace input {
      export let lastTouchId = 0;
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
        /*"Menu": sf::Keyboard::Menu ,
    "LBracket": sf::Keyboard::LBracket ,
    "RBracket": sf::Keyboard::RBracket ,
    "SemiColon": sf::Keyboard::SemiColon ,
    "Comma": sf::Keyboard::Comma ,
    "Period": sf::Keyboard::Period ,
    "Quote": sf::Keyboard::Quote ,
    "Slash": sf::Keyboard::Slash ,
    "BackSlash": sf::Keyboard::BackSlash ,
    "Tilde": sf::Keyboard::Tilde ,
    "Equal": sf::Keyboard::Equal ,
    "Dash": sf::Keyboard::Dash,*/
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
       * Return true if the specified key is pressed
       *
       */
      export const isKeyPressed = function (runtimeScene, key) {
        if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
          return runtimeScene
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
      export const wasKeyReleased = function (runtimeScene, key) {
        if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
          return runtimeScene
            .getGame()
            .getInputManager()
            .wasKeyReleased(gdjs.evtTools.input.keysNameToCode[key]);
        }
        return false;
      };

      /**
       * Return the name of the last key pressed in the game
       */
      export const lastPressedKey = function (runtimeScene) {
        const keyCode = runtimeScene
          .getGame()
          .getInputManager()
          .getLastPressedKey();
        if (keysCodeToName.hasOwnProperty(keyCode)) {
          return keysCodeToName[keyCode];
        }
        return '';
      };

      export const anyKeyPressed = function (runtimeScene) {
        return runtimeScene.getGame().getInputManager().anyKeyPressed();
      };
      export const isMouseButtonPressed = function (runtimeScene, button) {
        if (button === 'Left') {
          return runtimeScene
            .getGame()
            .getInputManager()
            .isMouseButtonPressed(0);
        }
        if (button === 'Right') {
          return runtimeScene
            .getGame()
            .getInputManager()
            .isMouseButtonPressed(1);
        }
        if (button === 'Middle') {
          return runtimeScene
            .getGame()
            .getInputManager()
            .isMouseButtonPressed(2);
        }
        return false;
      };
      export const isMouseButtonReleased = function (runtimeScene, button) {
        if (button === 'Left') {
          return runtimeScene
            .getGame()
            .getInputManager()
            .isMouseButtonReleased(0);
        }
        if (button === 'Right') {
          return runtimeScene
            .getGame()
            .getInputManager()
            .isMouseButtonReleased(1);
        }
        if (button === 'Middle') {
          return runtimeScene
            .getGame()
            .getInputManager()
            .isMouseButtonReleased(2);
        }
        return false;
      };
      export const hideCursor = function (runtimeScene) {
        runtimeScene.getRenderer().hideCursor();
      };
      export const showCursor = function (runtimeScene) {
        runtimeScene.getRenderer().showCursor();
      };
      export const getMouseWheelDelta = function (runtimeScene) {
        return runtimeScene.getGame().getInputManager().getMouseWheelDelta();
      };
      export const isScrollingUp = function (runtimeScene) {
        return runtimeScene.getGame().getInputManager().isScrollingUp();
      };
      export const isScrollingDown = function (runtimeScene) {
        return runtimeScene.getGame().getInputManager().isScrollingDown();
      };
      export const getMouseX = function (runtimeScene, layer, camera) {
        return runtimeScene
          .getLayer(layer)
          .convertCoords(
            runtimeScene.getGame().getInputManager().getMouseX(),
            runtimeScene.getGame().getInputManager().getMouseY()
          )[0];
      };
      export const getMouseY = function (runtimeScene, layer, camera) {
        return runtimeScene
          .getLayer(layer)
          .convertCoords(
            runtimeScene.getGame().getInputManager().getMouseX(),
            runtimeScene.getGame().getInputManager().getMouseY()
          )[1];
      };
      export const _cursorIsOnObject = function (obj, runtimeScene) {
        return obj.cursorOnObject(runtimeScene);
      };
      export const cursorOnObject = function (
        objectsLists,
        runtimeScene,
        accurate,
        inverted
      ) {
        return gdjs.evtTools.object.pickObjectsIf(
          gdjs.evtTools.input._cursorIsOnObject,
          objectsLists,
          inverted,
          runtimeScene
        );
      };
      export const getTouchX = function (
        runtimeScene,
        identifier,
        layer,
        camera
      ) {
        return runtimeScene
          .getLayer(layer)
          .convertCoords(
            runtimeScene.getGame().getInputManager().getTouchX(identifier),
            runtimeScene.getGame().getInputManager().getTouchY(identifier)
          )[0];
      };
      export const getTouchY = function (
        runtimeScene,
        identifier,
        layer,
        camera
      ) {
        return runtimeScene
          .getLayer(layer)
          .convertCoords(
            runtimeScene.getGame().getInputManager().getTouchX(identifier),
            runtimeScene.getGame().getInputManager().getTouchY(identifier)
          )[1];
      };
      export const getLastTouchId = function () {
        return gdjs.evtTools.input.lastTouchId || 0;
      };
      export const getLastEndedTouchId = function () {
        return gdjs.evtTools.input.lastEndedTouchId || 0;
      };
      export const popStartedTouch = function (runtimeScene) {
        const startedTouchId = runtimeScene
          .getGame()
          .getInputManager()
          .popStartedTouch();
        if (startedTouchId !== undefined) {
          gdjs.evtTools.input.lastTouchId = startedTouchId;
          return true;
        }
        return false;
      };
      export const popEndedTouch = function (runtimeScene) {
        const endedTouchId = runtimeScene
          .getGame()
          .getInputManager()
          .popEndedTouch();
        if (endedTouchId !== undefined) {
          gdjs.evtTools.input.lastEndedTouchId = endedTouchId;
          return true;
        }
        return false;
      };
      export const touchSimulateMouse = function (runtimeScene, enable) {
        runtimeScene.getGame().getInputManager().touchSimulateMouse(enable);
      };
    }
  }
}
