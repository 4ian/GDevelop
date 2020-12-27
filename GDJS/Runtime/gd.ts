/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The `gdjs` namespace contains all classes and objects of the game engine.
 * @namespace gdjs
 */
namespace gdjs {
  /**
   * Contains functions used by events (this is a convention only, functions can actually
   * be anywhere).
   * @namespace
   * @memberOf gdjs
   */
  export namespace evtTools {
    const thisIsUnusedButEnsureTheNamespaceIsDeclared = true;
  }

  export const objectsTypes = new Hashtable<typeof gdjs.RuntimeObject>();
  export const behaviorsTypes = new Hashtable<typeof gdjs.RuntimeBehavior>();

  type RuntimeSceneCallback = (runtimeScene: gdjs.RuntimeScene) => void;
  type RuntimeSceneRuntimeObjectCallback = (
    runtimeScene: gdjs.RuntimeScene,
    runtimeObject: gdjs.RuntimeObject
  ) => void;

  export const callbacksFirstRuntimeSceneLoaded: Array<RuntimeSceneCallback> = [];
  export const callbacksRuntimeSceneLoaded: Array<RuntimeSceneCallback> = [];
  export const callbacksRuntimeScenePreEvents: Array<RuntimeSceneCallback> = [];
  export const callbacksRuntimeScenePostEvents: Array<RuntimeSceneCallback> = [];
  export const callbacksRuntimeScenePaused: Array<RuntimeSceneCallback> = [];
  export const callbacksRuntimeSceneResumed: Array<RuntimeSceneCallback> = [];
  export const callbacksRuntimeSceneUnloading: Array<RuntimeSceneCallback> = [];
  export const callbacksRuntimeSceneUnloaded: Array<RuntimeSceneCallback> = [];
  export const callbacksObjectDeletedFromScene: Array<RuntimeSceneRuntimeObjectCallback> = [];

  /**
   * Convert a rgb color value to a hex string.
   *
   * No "#" or "0x" are added.
   * @param r Red
   * @param g Green
   * @param b Blue
   */
  export const rgbToHex = function (
    r: integer,
    g: integer,
    b: integer
  ): string {
    return '' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  /**
   * Convert a rgb color value to a hex value.
   * @param r Red
   * @param g Green
   * @param b Blue
   */
  export const rgbToHexNumber = function (
    r: integer,
    g: integer,
    b: integer
  ): integer {
    return (r << 16) + (g << 8) + b;
  };

  /**
   * Get a random integer between 0 and max.
   * @param max The maximum value (inclusive).
   */
  export const random = function (max: float): float {
    if (max <= 0) return 0;
    return Math.floor(Math.random() * (max + 1));
  };

  /**
 * Get a random integer between min and max.
 * @param min The minimum value (inclusive).
 * @param max The maximum value (inclusive).

 */
  export const randomInRange = function (min: float, max: float): float {
    return min + gdjs.random(max - min); // return min if min >= max
  };

  /**
   * Get a random float in the range 0 to less than max (inclusive of 0, but not max).
   * @param max The maximum value (exclusive).
   */
  export const randomFloat = function (max: float): float {
    if (max <= 0) return 0;
    return Math.random() * max;
  };

  /**
   * Get a random float between min and max
   * @param min The minimum value (inclusive).
   * @param max The maximum value (exclusive).
   * @returns {number}
   */
  export const randomFloatInRange = function (min: float, max: float): float {
    return min + gdjs.randomFloat(max - min); // return min if min >= max
  };

  /**
   * Get a random number between min and max in steps
   * @param min The minimum value (inclusive).
   * @param max The maximum value (inclusive).
   * @param step The interval between each value.
   * @returns {number}
   */
  export const randomWithStep = function (
    min: float,
    max: float,
    step: float
  ): float {
    if (step <= 0) return min + gdjs.random(max - min);
    return min + gdjs.random(Math.floor((max - min) / step)) * step; // return min if min >= max
  };

  /**
   * Convert an angle in degrees to radians.
   * @param angleInDegrees The angle in degrees.
   */
  export const toRad = function (angleInDegrees: float): float {
    return (angleInDegrees / 180) * 3.14159;
  };

  /**
   * Convert an angle in radians to degrees.
   * @param angleInRadians The angle in radians.
   */
  export const toDegrees = function (angleInRadians: float): float {
    return (angleInRadians * 180) / 3.14159;
  };

  /**
   * Register a runtime object (class extending {@link gdjs.RuntimeObject}) that can be used in a scene.
   *
   * The name of the type of the object must be complete, with the namespace if any. For
   * example, if you are providing a Text object in the TextObject extension, the full name
   * of the type of the object is "TextObject::Text".
   *
   * @param objectTypeName The name of the type of the Object.
   * @param Ctor The constructor of the Object.
   */
  export const registerObject = function (
    objectTypeName: string,
    Ctor: typeof gdjs.RuntimeObject
  ) {
    gdjs.objectsTypes.put(objectTypeName, Ctor);
  };

  /**
   * Register a runtime behavior (class extending {@link gdjs.RuntimeBehavior}) that can be used by a
   * {@link gdjs.RuntimeObject}.
   *
   * The type of the behavior must be complete, with the namespace of the extension. For
   * example, if you are providing a Draggable behavior in the DraggableBehavior extension,
   * the full name of the type of the behavior is "DraggableBehavior::Draggable".
   *
   * @param behaviorTypeName The name of the type of the behavior.
   * @param Ctor The constructor of the Object.
   */
  export const registerBehavior = function (
    behaviorTypeName: string,
    Ctor: typeof gdjs.RuntimeBehavior
  ) {
    gdjs.behaviorsTypes.put(behaviorTypeName, Ctor);
  };

  /**
   * Register a function to be called when the first {@link gdjs.RuntimeScene} is loaded, after
   * resources loading is done. This can be considered as the "start of the game".
   *
   * @param callback The function to be called.
   */
  export const registerFirstRuntimeSceneLoadedCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksFirstRuntimeSceneLoaded.push(callback);
  };

  /**
   * Register a function to be called when a scene is loaded.
   * @param callback The function to be called.
   */
  export const registerRuntimeSceneLoadedCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksRuntimeSceneLoaded.push(callback);
  };

  /**
   * Register a function to be called each time a scene is stepped (i.e: at every frame),
   * before events are run.
   * @param callback The function to be called.
   */
  export const registerRuntimeScenePreEventsCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksRuntimeScenePreEvents.push(callback);
  };

  /**
   * Register a function to be called each time a scene is stepped (i.e: at every frame),
   * after events are run and before rendering.
   * @param callback The function to be called.
   */
  export const registerRuntimeScenePostEventsCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksRuntimeScenePostEvents.push(callback);
  };

  /**
   * Register a function to be called when a scene is paused.
   * @param callback The function to be called.
   */
  export const registerRuntimeScenePausedCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksRuntimeScenePaused.push(callback);
  };

  /**
   * Register a function to be called when a scene is resumed.
   * @param callback The function to be called.
   */
  export const registerRuntimeSceneResumedCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksRuntimeSceneResumed.push(callback);
  };

  /**
   * Register a function to be called when a scene unload started. This is
   * before the object deletion and renderer destruction. It is safe to
   * manipulate these. It is **not** be safe to release resources as other
   * callbacks might do operations on objects or the scene.
   *
   * @param callback The function to be called.
   */
  export const registerRuntimeSceneUnloadingCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksRuntimeSceneUnloading.push(callback);
  };

  /**
   * Register a function to be called when a scene is unloaded. The objects
   * and renderer are now destroyed - it is **not** safe to do anything apart
   * from releasing resources.
   *
   * @param callback The function to be called.
   */
  export const registerRuntimeSceneUnloadedCallback = function (
    callback: RuntimeSceneCallback
  ) {
    gdjs.callbacksRuntimeSceneUnloaded.push(callback);
  };

  /**
   * Register a function to be called when an object is deleted from a scene.
   * @param callback The function to be called.
   */
  export const registerObjectDeletedFromSceneCallback = function (
    callback: RuntimeSceneRuntimeObjectCallback
  ) {
    gdjs.callbacksObjectDeletedFromScene.push(callback);
  };

  /**
   * Keep this function until we're sure now client is using it anymore.
   * @deprecated
   * @private
   */
  export const registerGlobalCallbacks = function () {
    console.warn(
      "You're calling gdjs.registerGlobalCallbacks. This method is now useless and you must not call it anymore."
    );
  };

  /**
   * Remove all the global callbacks that were registered previously.
   *
   * Should only be used for testing - this should never be used at runtime.
   */
  export const clearGlobalCallbacks = function () {
    gdjs.callbacksFirstRuntimeSceneLoaded.length = 0;
    gdjs.callbacksRuntimeSceneLoaded.length = 0;
    gdjs.callbacksRuntimeScenePreEvents.length = 0;
    gdjs.callbacksRuntimeScenePostEvents.length = 0;
    gdjs.callbacksRuntimeScenePaused.length = 0;
    gdjs.callbacksRuntimeSceneResumed.length = 0;
    gdjs.callbacksRuntimeSceneUnloading.length = 0;
    gdjs.callbacksRuntimeSceneUnloaded.length = 0;
    gdjs.callbacksObjectDeletedFromScene.length = 0;
  };

  /**
   * Get the constructor of an object.
   *
   * @param name The name of the type of the object.
   */
  export const getObjectConstructor = function (
    name: string
  ): typeof gdjs.RuntimeObject {
    if (name !== undefined && gdjs.objectsTypes.containsKey(name))
      return gdjs.objectsTypes.get(name);

    console.warn('Object type "' + name + '" was not found.');
    return gdjs.objectsTypes.get(''); //Create a base empty runtime object.
  };

  /**
   * Get the constructor of a behavior.
   *
   * @param name The name of the type of the behavior.
   */
  export const getBehaviorConstructor = function (
    name: string
  ): typeof gdjs.RuntimeBehavior {
    if (name !== undefined && gdjs.behaviorsTypes.containsKey(name))
      return gdjs.behaviorsTypes.get(name);

    console.warn('Behavior type "' + name + '" was not found.');
    return gdjs.behaviorsTypes.get(''); //Create a base empty runtime behavior.
  };

  /**
   * Create a static array that won't need a new allocation each time it's used.
   * @param owner The owner of the Array.
   */
  export const staticArray = function (owner: any): Array<any> {
    owner._staticArray = owner._staticArray || [];
    return owner._staticArray;
  };

  /**
   * Create a second static array that won't need a new allocation each time it's used.
   * @param owner The owner of the Array.
   */
  export const staticArray2 = function (owner: any): Array<any> {
    owner._staticArray2 = owner._staticArray2 || [];
    return owner._staticArray2;
  };

  /**
   * Create a static object that won't need a new allocation each time it's used.
   * @param owner The owner of the Array.
   */
  export const staticObject = function (owner: any): Object {
    owner._staticObject = owner._staticObject || {};
    return owner._staticObject;
  };

  /**
   * Return a new array of objects that is the concatenation of all the objects passed
   * as parameters.
   * @param objectsLists
   * @returns {Array}
   */
  export const objectsListsToArray = function (
    objectsLists: Hashtable<RuntimeObject>
  ): Array<RuntimeObject> {
    var lists = gdjs.staticArray(gdjs.objectsListsToArray);
    objectsLists.values(lists);

    var result: Array<RuntimeObject> = [];
    for (var i = 0; i < lists.length; ++i) {
      var arr = lists[i];
      for (var k = 0; k < arr.length; ++k) {
        result.push(arr[k]);
      }
    }
    return result;
  };

  /**
   * Copy the element for the first array into the second array, so that
   * both array contains the same elements.
   * @param src The source array
   * @param dst The destination array
   */
  export const copyArray = function <T>(src: Array<T>, dst: Array<T>) {
    var len = src.length;
    for (var i = 0; i < len; ++i) {
      dst[i] = src[i];
    }
    dst.length = len;
  };

  /**
   * Generate a UUID v4.
   * @returns The generated UUID.
   */
  export const makeUuid = function (): string {
    // Fallback to non cryptographically secure UUIDs if not supported
    if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
      const makeMathRandomUuid = (a?: any) => {
        return a
          ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
          : ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(
              /[018]/g,
              makeMathRandomUuid
            );
      };

      return makeMathRandomUuid();
    }

    // @ts-ignore - TS does not like properties added on functions
    if (!gdjs.makeUuid.hex) {
      // @ts-ignore - TS does not like properties added on functions
      gdjs.makeUuid.hex = [];

      for (var i = 0; i < 256; i++) {
        // @ts-ignore - TS does not like properties added on functions
        gdjs.makeUuid.hex[i] = (i < 16 ? '0' : '') + i.toString(16);
      }
    }
    // @ts-ignore - TS does not like properties added on functions
    const hex = gdjs.makeUuid.hex;

    var r = crypto.getRandomValues(new Uint8Array(16));
    r[6] = (r[6] & 0x0f) | 0x40;
    r[8] = (r[8] & 0x3f) | 0x80;

    return (
      hex[r[0]] +
      hex[r[1]] +
      hex[r[2]] +
      hex[r[3]] +
      '-' +
      hex[r[4]] +
      hex[r[5]] +
      '-' +
      hex[r[6]] +
      hex[r[7]] +
      '-' +
      hex[r[8]] +
      hex[r[9]] +
      '-' +
      hex[r[10]] +
      hex[r[11]] +
      hex[r[12]] +
      hex[r[13]] +
      hex[r[14]] +
      hex[r[15]]
    );
  };
}

//Make sure console.warn and console.error are available.
console.warn = console.warn || console.log;
console.error = console.error || console.log;
