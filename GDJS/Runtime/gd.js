/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * The `gdjs` namespace contains all classes and objects of the game engine.
 * @namespace
 */
window.gdjs = {
  objectsTypes: new Hashtable(),
  behaviorsTypes: new Hashtable(),
  /**
   * Contains functions used by events (this is a convention only, functions can actually
   * by anywhere).
   * @namespace
   * @memberof gdjs
   */
  evtTools: {},
  callbacksRuntimeSceneLoaded: [],
  callbacksRuntimeSceneUnloaded: [],
  callbacksObjectDeletedFromScene: [],
};

/**
 * Convert a rgb color value to a hex string.
 *
 * No "#" or "0x" are added.
 */
gdjs.rgbToHex = function(r, g, b) {
  return '' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Convert a rgb color value to a hex value.
 */
gdjs.rgbToHexNumber = function(r, g, b) {
  return (r << 16) + (g << 8) + b;
};

/**
 * Get a random integer between 0 and max.
 */
gdjs.random = function(max) {
  if (max <= 0) return 0;
  return Math.floor(Math.random() * (max + 1));
};

/**
 * Get a random integer between min and max
 */
gdjs.randomInRange = function(min, max) {
  return min + gdjs.random(max - min); // return min if min >= max
};

/**
 * Get a random float between 0 and max.
 */
gdjs.randomFloat = function(max) {
  if (max <= 0) return 0;
  return Math.random() * max;
};

/**
 * Get a random float between min and max
 */
gdjs.randomFloatInRange = function(min, max) {
  return min + gdjs.randomFloat(max - min); // return min if min >= max
};

/**
 * Get a random number between min and max in steps
 */
gdjs.randomWithStep = function(min, max, step) {
  if (step <= 0) return min + gdjs.random(max - min);
  return min + gdjs.random(Math.floor((max - min) / step)) * step; // return min if min >= max
};

/**
 * Convert an angle in degrees to radians.
 */
gdjs.toRad = function(angleInDegrees) {
  return (angleInDegrees / 180) * 3.14159;
};

/**
 * Convert an angle in radians to degrees.
 */
gdjs.toDegrees = function(angleInRadians) {
  return (angleInRadians * 180) / 3.14159;
};

/**
 * Register the runtime objects that can be used in runtimeScene.<br>
 * Objects must be part of gdjs and have their property "thisIsARuntimeObjectConstructor"
 * defined and set to the name of the type of the object so as to be recognized.
 * The name of the type of the object must be complete, with the namespace if any. For
 * example, if you are providing a Text object in the TextObject extension, the full name
 * of the type of the object is "TextObject::Text".
 */
gdjs.registerObjects = function() {
  gdjs.objectsTypes.clear();

  for (var p in this) {
    if (this.hasOwnProperty(p)) {
      if (gdjs[p].thisIsARuntimeObjectConstructor != undefined) {
        gdjs.objectsTypes.put(gdjs[p].thisIsARuntimeObjectConstructor, gdjs[p]);
      }
    }
  }
};

/**
 * Register the runtime behaviors that can be used bt runtimeObject.
 *
 * Behavior must be a property on gdjs (or on a inner object, but not on any object nested below)
 * and have a property "thisIsARuntimeBehaviorConstructor" defined and set
 * to the type of the behavior to be recognized.
 *
 * The type of the behavior must be complete, with the namespace of the extension. For
 * example, if you are providing a Draggable behavior in the DraggableBehavior extension,
 * the full name of the type of the behavior is "DraggableBehavior::Draggable".
 */
gdjs.registerBehaviors = function() {
  gdjs.behaviorsTypes.clear();

  for (var gdjsProperty in this) {
    if (this.hasOwnProperty(gdjsProperty)) {
      // Search in object inside gdjs.
      var innerObject = gdjs[gdjsProperty];
      if (innerObject.thisIsARuntimeBehaviorConstructor != undefined) {
        gdjs.behaviorsTypes.put(
          innerObject.thisIsARuntimeBehaviorConstructor,
          innerObject
        );
      } else if (
        Object.prototype.toString.call(innerObject) !== '[object Array]' &&
        typeof innerObject === 'object' &&
        innerObject !== null
      ) {
        // Also search inside objects contained in gdjs.
        for (var innerObjectProperty in innerObject) {
          if (innerObject.hasOwnProperty(innerObjectProperty)) {
            var innerInnerObject = innerObject[innerObjectProperty];
            if (
              innerInnerObject !== null &&
              typeof innerInnerObject === 'function' &&
              innerInnerObject.thisIsARuntimeBehaviorConstructor != undefined
            ) {
              gdjs.behaviorsTypes.put(
                innerInnerObject.thisIsARuntimeBehaviorConstructor,
                innerInnerObject
              );
            }
          }
        }
      }
    }
  }
};

/**
 * Register the callbacks that will be called when a runtimeScene is loaded/unloaded,
 * paused/resumed or when an object is deleted from a scene.
 *
 * Callbacks must be called respectively `gdjsCallbackRuntimeSceneLoaded`, `gdjsCallbackRuntimeSceneUnloaded`,
 * `callbacksRuntimeScenePaused`, `callbacksRuntimeSceneResumed` or `gdjsCallbackObjectDeletedFromScene`
 * and be part of a (nested) child object of gdjs.
 *
 * Arguments passed to the function are the runtimeScene and the object if applicable.
 */
gdjs.registerGlobalCallbacks = function() {
  gdjs.callbacksRuntimeSceneLoaded = [];
  gdjs.callbacksRuntimeSceneUnloaded = [];
  gdjs.callbacksRuntimeScenePaused = [];
  gdjs.callbacksRuntimeSceneResumed = [];
  gdjs.callbacksObjectDeletedFromScene = [];

  var totalprop = 0;

  innerRegisterGlobalCallbacks = function(obj, nestLevel) {
    for (var p in obj) {
      if (
        obj.hasOwnProperty(p) &&
        obj[p] !== null &&
        Object.prototype.toString.call(obj[p]) !== '[object Array]' &&
        typeof obj === 'object'
      ) {
        totalprop++;
        if (obj[p].gdjsCallbackRuntimeSceneLoaded !== undefined) {
          gdjs.callbacksRuntimeSceneLoaded.push(
            obj[p].gdjsCallbackRuntimeSceneLoaded
          );
        }
        if (obj[p].gdjsCallbackRuntimeSceneUnloaded !== undefined) {
          gdjs.callbacksRuntimeSceneUnloaded.push(
            obj[p].gdjsCallbackRuntimeSceneUnloaded
          );
        }
        if (obj[p].gdjsCallbackRuntimeScenePaused !== undefined) {
          gdjs.callbacksRuntimeScenePaused.push(
            obj[p].gdjsCallbackRuntimeScenePaused
          );
        }
        if (obj[p].gdjsCallbackRuntimeSceneResumed !== undefined) {
          gdjs.callbacksRuntimeSceneResumed.push(
            obj[p].gdjsCallbackRuntimeSceneResumed
          );
        }
        if (obj[p].gdjsCallbackObjectDeletedFromScene !== undefined) {
          gdjs.callbacksObjectDeletedFromScene.push(
            obj[p].gdjsCallbackObjectDeletedFromScene
          );
        }

        if (nestLevel <= 1) innerRegisterGlobalCallbacks(obj[p], nestLevel + 1);
      }
    }
  };

  innerRegisterGlobalCallbacks(this, 0);
};

/**
 * Get the constructor of an object.
 *
 * @param name {String} The name of the type of the object.
 */
gdjs.getObjectConstructor = function(name) {
  if (name !== undefined && gdjs.objectsTypes.containsKey(name))
    return gdjs.objectsTypes.get(name);

  console.warn('Object type "' + name + '" was not found.');
  return gdjs.objectsTypes.get(''); //Create a base empty runtime object.
};

/**
 * Get the constructor of a behavior.
 *
 * @param name {String} The name of the type of the behavior.
 */
gdjs.getBehaviorConstructor = function(name) {
  if (name !== undefined && gdjs.behaviorsTypes.containsKey(name))
    return gdjs.behaviorsTypes.get(name);

  console.warn('Behavior type "' + name + '" was not found.');
  return gdjs.behaviorsTypes.get(''); //Create a base empty runtime behavior.
};

/**
 * Create a static array that won't need a new allocation each time it's used.
 */
gdjs.staticArray = function(owner) {
  owner._staticArray = owner._staticArray || [];
  return owner._staticArray;
};

/**
 * Create a second static array that won't need a new allocation each time it's used.
 */
gdjs.staticArray2 = function(owner) {
  owner._staticArray2 = owner._staticArray2 || [];
  return owner._staticArray2;
};

/**
 * Create a static object that won't need a new allocation each time it's used.
 */
gdjs.staticObject = function(owner) {
  owner._staticObject = owner._staticObject || {};
  return owner._staticObject;
};

/**
 * Return a new array of objects that is the concatenation of all the objects passed
 * as parameters.
 * @param objectsLists
 */
gdjs.objectsListsToArray = function(objectsLists) {
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

Array.prototype.remove = function(from) {
  //Adapted from the nice article available at
  //https://www.scirra.com/blog/76/how-to-write-low-garbage-real-time-javascript
  for (var i = from, len = this.length - 1; i < len; i++) this[i] = this[i + 1];

  this.length = len;
};

Array.prototype.createFrom = function(arr) {
  var len = arr.length;
  for (var i = 0; i < len; ++i) {
    this[i] = arr[i];
  }
  this.length = len;
};

//Make sure console.warn and console.error are available.
console.warn = console.warn || console.log;
console.error = console.error || console.log;
