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
      export const keysNameToCode: { [keyName: string]: number } = {};
      ((gdjs as any).keyboardKeyDefinitions || []).forEach((definition) => {
        if (
          definition.gdevelopKeyName &&
          typeof definition.runtimeKeyCode === 'number'
        ) {
          keysNameToCode[definition.gdevelopKeyName] =
            definition.runtimeKeyCode;
        }
      });

      /**
       * Normalize user-facing aliases such as "1" and "Digit1" to the
       * canonical GDevelop name "Num1".
       */
      export const normalizeKeyName = (key: string): string =>
        typeof (gdjs as any).normalizeKeyboardKeyName === 'function'
          ? (gdjs as any).normalizeKeyboardKeyName(key)
          : key;

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
       * Return true if the specified key is pressed (i.e: just pressed or held down).
       *
       */
      export const isKeyPressed = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        key: string
      ) {
        key = normalizeKeyName(key);
        if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
          return instanceContainer
            .getGame()
            .getInputManager()
            .isKeyPressed(gdjs.evtTools.input.keysNameToCode[key]);
        }
        return false;
      };

      /**
       * Return true if the specified key was just pressed (i.e: it started being pressed
       * during this frame).
       */
      export const wasKeyJustPressed = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        key: string
      ) {
        key = normalizeKeyName(key);
        if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
          return instanceContainer
            .getGame()
            .getInputManager()
            .wasKeyJustPressed(gdjs.evtTools.input.keysNameToCode[key]);
        }
        return false;
      };

      /**
       * Return true if the specified key was just released (i.e: it stopped being pressed
       * during this frame).
       */
      export const wasKeyReleased = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        key: string
      ) {
        key = normalizeKeyName(key);
        if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
          return instanceContainer
            .getGame()
            .getInputManager()
            .wasKeyReleased(gdjs.evtTools.input.keysNameToCode[key]);
        }
        return false;
      };

      /**
       * Return the name of the last key pressed in the game.
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

      const _cursorIsOnObject = function (obj: gdjs.RuntimeObject) {
        return obj.cursorOnObject();
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
          null
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
        return (
          instanceContainer
            .getGame()
            .getInputManager()
            .getStartedTouchIdentifiers()[index] || 0
        );
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

      /**
       * Request browser pointer lock through the supported game renderer API.
       * This keeps extension code away from DOM globals and renderer-private
       * fields.
       */
      export const requestPointerLock = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        reason: string = 'javascript-event'
      ): boolean => {
        const renderer = instanceContainer.getGame().getRenderer() as any;
        return !!(
          renderer &&
          typeof renderer.requestPointerLock === 'function' &&
          renderer.requestPointerLock(reason)
        );
      };

      /**
       * Exit browser pointer lock through the supported game renderer API.
       */
      export const exitPointerLock = (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        reason: string = 'javascript-event'
      ): void => {
        const renderer = instanceContainer.getGame().getRenderer() as any;
        if (renderer && typeof renderer.exitPointerLock === 'function') {
          renderer.exitPointerLock(reason);
        }
      };

      /**
       * Return whether the game canvas currently owns pointer lock.
       */
      export const isPointerLocked = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean => {
        const renderer = instanceContainer.getGame().getRenderer() as any;
        return !!(
          renderer &&
          typeof renderer.isPointerLocked === 'function' &&
          renderer.isPointerLocked()
        );
      };

      /**
       * Return the horizontal pointer movement accumulated during this frame.
       *
       * This is exposed through the input tools so pointer-lock extensions do
       * not need to install their own DOM listeners or keep a private global
       * movement accumulator.
       */
      export const getPointerMovementX = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): number =>
        instanceContainer.getGame().getInputManager().getMouseMovementX();

      /**
       * Return the vertical pointer movement accumulated during this frame.
       */
      export const getPointerMovementY = (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): number =>
        instanceContainer.getGame().getInputManager().getMouseMovementY();
    }

    export namespace scene3d {
      export type RaycastResult = {
        object: gdjs.RuntimeObject;
        objectIndex: number;
        distance: number;
        pointX: number;
        pointY: number;
        pointZ: number;
      };

      /**
       * Raycast against 3D renderer objects and return bounded plain data.
       * Three.js objects and intersections never escape this public facade.
       */
      export const raycastObjects = (
        originX: number,
        originY: number,
        originZ: number,
        directionX: number,
        directionY: number,
        directionZ: number,
        objects: gdjs.RuntimeObject[],
        near: number = 0,
        far: number = Infinity,
        recursive: boolean = true
      ): RaycastResult[] => {
        if (
          !Number.isFinite(originX) ||
          !Number.isFinite(originY) ||
          !Number.isFinite(originZ) ||
          !Number.isFinite(directionX) ||
          !Number.isFinite(directionY) ||
          !Number.isFinite(directionZ)
        ) {
          return [];
        }
        const direction = new THREE.Vector3(directionX, directionY, directionZ);
        if (direction.lengthSq() === 0) return [];
        direction.normalize();
        const raycaster = new THREE.Raycaster(
          new THREE.Vector3(originX, originY, originZ),
          direction,
          Number.isFinite(near) && near >= 0 ? near : 0,
          Number.isFinite(far) && far >= 0 ? far : Infinity
        );
        const results: RaycastResult[] = [];
        objects.slice(0, 1000).forEach((object, objectIndex) => {
          const rendererObject =
            object && typeof (object as any).get3DRendererObject === 'function'
              ? (object as any).get3DRendererObject()
              : null;
          if (!rendererObject) return;
          raycaster
            .intersectObject(rendererObject, recursive)
            .slice(0, 16)
            .forEach((intersection) => {
              if (results.length >= 256) return;
              results.push({
                object,
                objectIndex,
                distance: intersection.distance,
                pointX: intersection.point.x,
                pointY: intersection.point.y,
                pointZ: intersection.point.z,
              });
            });
        });
        return results.sort((left, right) => left.distance - right.distance);
      };
    }
  }
}
