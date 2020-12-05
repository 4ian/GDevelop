// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The `gdjs` namespace contains all classes and objects of the game engine.
 * @namespace gdjs
 */
// @ts-ignore - creating the global object acting as a namespace
window.gdjs = {};

/**
 * Contains functions used by events (this is a convention only, functions can actually
 * be anywhere).
 * @namespace
 * @memberOf gdjs
 */
gdjs.evtTools = {};

gdjs.objectsTypes = new Hashtable();
gdjs.behaviorsTypes = new Hashtable();

/** @type {Function[]} */ gdjs.callbacksFirstRuntimeSceneLoaded = [];
/** @type {Function[]} */ gdjs.callbacksRuntimeSceneLoaded = [];
/** @type {Function[]} */ gdjs.callbacksRuntimeScenePreEvents = [];
/** @type {Function[]} */ gdjs.callbacksRuntimeScenePostEvents = [];
/** @type {Function[]} */ gdjs.callbacksRuntimeScenePaused = [];
/** @type {Function[]} */ gdjs.callbacksRuntimeSceneResumed = [];
/** @type {Function[]} */ gdjs.callbacksRuntimeSceneUnloading = [];
/** @type {Function[]} */ gdjs.callbacksRuntimeSceneUnloaded = [];
/** @type {Function[]} */ gdjs.callbacksObjectDeletedFromScene = [];

/**
 * Convert a rgb color value to a hex string.
 *
 * No "#" or "0x" are added.
 * @param {number} r Red
 * @param {number} g Green
 * @param {number} b Blue
 * @returns {string}
 */
gdjs.rgbToHex = function (r, g, b) {
  return '' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Convert a rgb color value to a hex value.
 * @param {number} r Red
 * @param {number} g Green
 * @param {number} b Blue
 * @returns {number}
 */
gdjs.rgbToHexNumber = function (r, g, b) {
  return (r << 16) + (g << 8) + b;
};

/**
 * Get a random integer between 0 and max.
 * @param {number} max The maximum value (inclusive).
 * @returns {number}
 */
gdjs.random = function (max) {
  if (max <= 0) return 0;
  return Math.floor(Math.random() * (max + 1));
};

/**
 * Get a random integer between min and max.
 * @param {number} min The minimum value (inclusive).
 * @param {number} max The maximum value (inclusive).
 * @returns {number}
 */
gdjs.randomInRange = function (min, max) {
  return min + gdjs.random(max - min); // return min if min >= max
};

/**
 *  Get a random float in the range 0 to less than max (inclusive of 0, but not max).
 * @param {number} max The maximum value (exclusive).
 * @returns {number}
 */
gdjs.randomFloat = function (max) {
  if (max <= 0) return 0;
  return Math.random() * max;
};

/**
 * Get a random float between min and max
 * @param {number} min The minimum value (inclusive).
 * @param {number} max The maximum value (exclusive).
 * @returns {number}
 */
gdjs.randomFloatInRange = function (min, max) {
  return min + gdjs.randomFloat(max - min); // return min if min >= max
};

/**
 * Get a random number between min and max in steps
 * @param {number} min The minimum value (inclusive).
 * @param {number} max The maximum value (inclusive).
 * @param {number} step The interval between each value.
 * @returns {number}
 */
gdjs.randomWithStep = function (min, max, step) {
  if (step <= 0) return min + gdjs.random(max - min);
  return min + gdjs.random(Math.floor((max - min) / step)) * step; // return min if min >= max
};

/**
 * Convert an angle in degrees to radians.
 * @param {number} angleInDegrees The angle in degrees.
 * @returns {number}
 */
gdjs.toRad = function (angleInDegrees) {
  return (angleInDegrees / 180) * 3.14159;
};

/**
 * Convert an angle in radians to degrees.
 * @param {number} angleInRadians The angle in radians.
 * @returns {number}
 */
gdjs.toDegrees = function (angleInRadians) {
  return (angleInRadians * 180) / 3.14159;
};

/**
 * Register a runtime object (class extending {@link gdjs.RuntimeObject}) that can be used in a scene.
 *
 * The name of the type of the object must be complete, with the namespace if any. For
 * example, if you are providing a Text object in the TextObject extension, the full name
 * of the type of the object is "TextObject::Text".
 *
 * @param {string} objectTypeName The name of the type of the Object.
 * @param {typeof gdjs.RuntimeObject} Ctor The constructor of the Object.
 */
gdjs.registerObject = function (objectTypeName, Ctor) {
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
 * @param {string} behaviorTypeName The name of the type of the behavior.
 * @param {typeof gdjs.RuntimeBehavior} Ctor The constructor of the Object.
 */
gdjs.registerBehavior = function (behaviorTypeName, Ctor) {
  gdjs.behaviorsTypes.put(behaviorTypeName, Ctor);
};

/**
 * Register a function to be called when the first {@link gdjs.RuntimeScene} is loaded, after
 * resources loading is done. This can be considered as the "start of the game".
 *
 * @param {Function} callback The function to be called.
 */
gdjs.registerFirstRuntimeSceneLoadedCallback = function (callback) {
  gdjs.callbacksFirstRuntimeSceneLoaded.push(callback);
};

/**
 * Register a function to be called when a scene is loaded.
 * @param {Function} callback The function to be called.
 */
gdjs.registerRuntimeSceneLoadedCallback = function (callback) {
  gdjs.callbacksRuntimeSceneLoaded.push(callback);
};

/**
 * Register a function to be called each time a scene is stepped (i.e: at every frame),
 * before events are run.
 * @param {Function} callback The function to be called.
 */
gdjs.registerRuntimeScenePreEventsCallback = function (callback) {
  gdjs.callbacksRuntimeScenePreEvents.push(callback);
};

/**
 * Register a function to be called each time a scene is stepped (i.e: at every frame),
 * after events are run and before rendering.
 * @param {Function} callback The function to be called.
 */
gdjs.registerRuntimeScenePostEventsCallback = function (callback) {
  gdjs.callbacksRuntimeScenePostEvents.push(callback);
};

/**
 * Register a function to be called when a scene is paused.
 * @param {Function} callback The function to be called.
 */
gdjs.registerRuntimeScenePausedCallback = function (callback) {
  gdjs.callbacksRuntimeScenePaused.push(callback);
};

/**
 * Register a function to be called when a scene is resumed.
 * @param {Function} callback The function to be called.
 */
gdjs.registerRuntimeSceneResumedCallback = function (callback) {
  gdjs.callbacksRuntimeSceneResumed.push(callback);
};

/**
 * Register a function to be called when a scene unload started. This is
 * before the object deletion and renderer destruction. It is safe to
 * manipulate these. It is **not** be safe to release resources as other
 * callbacks might do operations on objects or the scene.
 *
 * @param {Function} callback The function to be called.
 */
gdjs.registerRuntimeSceneUnloadingCallback = function (callback) {
  gdjs.callbacksRuntimeSceneUnloading.push(callback);
};

/**
 * Register a function to be called when a scene is unloaded. The objects
 * and renderer are now destroyed - it is **not** safe to do anything apart
 * from releasing resources.
 *
 * @param {Function} callback The function to be called.
 */
gdjs.registerRuntimeSceneUnloadedCallback = function (callback) {
  gdjs.callbacksRuntimeSceneUnloaded.push(callback);
};

/**
 * Register a function to be called when an object is deleted from a scene.
 * @param {Function} callback The function to be called.
 */
gdjs.registerObjectDeletedFromSceneCallback = function (callback) {
  gdjs.callbacksObjectDeletedFromScene.push(callback);
};

/**
 * Keep this function until we're sure now client is using it anymore.
 * @deprecated
 * @private
 */
gdjs.registerGlobalCallbacks = function () {
  console.warn(
    "You're calling gdjs.registerGlobalCallbacks. This method is now useless and you must not call it anymore."
  );
};

/**
 * Remove all the global callbacks that were registered previously.
 *
 * Should only be used for testing - this should never be used at runtime.
 */
gdjs.clearGlobalCallbacks = function () {
  gdjs.callbacksFirstRuntimeSceneLoaded = [];
  gdjs.callbacksRuntimeSceneLoaded = [];
  gdjs.callbacksRuntimeScenePreEvents = [];
  gdjs.callbacksRuntimeScenePostEvents = [];
  gdjs.callbacksRuntimeScenePaused = [];
  gdjs.callbacksRuntimeSceneResumed = [];
  gdjs.callbacksRuntimeSceneUnloading = [];
  gdjs.callbacksRuntimeSceneUnloaded = [];
  gdjs.callbacksObjectDeletedFromScene = [];
};

/**
 * Get the constructor of an object.
 *
 * @param {string} name The name of the type of the object.
 * @returns {typeof gdjs.RuntimeObject}
 */
gdjs.getObjectConstructor = function (name) {
  if (name !== undefined && gdjs.objectsTypes.containsKey(name))
    return gdjs.objectsTypes.get(name);

  console.warn('Object type "' + name + '" was not found.');
  return gdjs.objectsTypes.get(''); //Create a base empty runtime object.
};

/**
 * Get the constructor of a behavior.
 *
 * @param {string} name The name of the type of the behavior.
 * @returns {typeof gdjs.RuntimeBehavior}
 */
gdjs.getBehaviorConstructor = function (name) {
  if (name !== undefined && gdjs.behaviorsTypes.containsKey(name))
    return gdjs.behaviorsTypes.get(name);

  console.warn('Behavior type "' + name + '" was not found.');
  return gdjs.behaviorsTypes.get(''); //Create a base empty runtime behavior.
};

/**
 * Create a static array that won't need a new allocation each time it's used.
 * @param {any} owner The owner of the Array.
 * @returns {Array<any>}
 */
gdjs.staticArray = function (owner) {
  owner._staticArray = owner._staticArray || [];
  return owner._staticArray;
};

/**
 * Create a second static array that won't need a new allocation each time it's used.
 * @param {any} owner The owner of the Array.
 * @returns {Array<any>}
 */
gdjs.staticArray2 = function (owner) {
  owner._staticArray2 = owner._staticArray2 || [];
  return owner._staticArray2;
};

/**
 * Create a static object that won't need a new allocation each time it's used.
 * @param {any} owner The owner of the Array.
 * @returns {Object}
 */
gdjs.staticObject = function (owner) {
  owner._staticObject = owner._staticObject || {};
  return owner._staticObject;
};

/**
 * Return a new array of objects that is the concatenation of all the objects passed
 * as parameters.
 * @param objectsLists
 * @returns {Array}
 */
gdjs.objectsListsToArray = function (objectsLists) {
  var lists = gdjs.staticArray(gdjs.objectsListsToArray);
  objectsLists.values(lists);

  var result = [];
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
 * @param {Array<any>} src The source array
 * @param {Array<any>} dst The destination array
 */
gdjs.copyArray = function (src, dst) {
  var len = src.length;
  for (var i = 0; i < len; ++i) {
    dst[i] = src[i];
  }
  dst.length = len;
};

/**
 * Generate a UUID v4.
 * @returns {string} The generated UUID.
 */
gdjs.makeUuid = function () {
  // Fallback to non cryptographically secure UUIDs if not supported
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    const makeMathRandomUuid = (a) => {
      return a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : (""+ 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(
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

//Make sure console.warn and console.error are available.
console.warn = console.warn || console.log;
console.error = console.error || console.log;
