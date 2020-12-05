/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

// Import all the types as global typedefs so that they can be used
// in any JS file of the game engine/extensions/tests.

/** @typedef { import("./project-data").ProjectData } ProjectData */
/** @typedef { import("./project-data").ProjectPropertiesData } ProjectPropertiesData */
/** @typedef { import("./project-data").LoadingScreenData } LoadingScreenData */
/** @typedef { import("./project-data").LayoutData } LayoutData */
/** @typedef { import("./project-data").ExternalLayoutData } ExternalLayoutData */
/** @typedef { import("./project-data").InstanceData } InstanceData */
/** @typedef { import("./project-data").LayerData } LayerData */
/** @typedef { import("./project-data").CameraData } CameraData */
/** @typedef { import("./project-data").EffectData } EffectData */
/** @typedef { import("./project-data").ResourceData } ResourceData */
/** @typedef { import("./project-data").ResourcesData } ResourcesData */
/** @typedef { import("./project-data").BehaviorSharedData } BehaviorSharedData */

/** @typedef { import("pixi.js") } PIXI */

// Also declare the context that is passed to JavaScript functions in events:

/**
 * Function returning the list of instances of the specified object.
 *
 * @callback GetObjectsFunction
 * @param {string} objectName The name of the object for which instances must be returned.
 * @return {gdjs.RuntimeObject[]} Instances of the specified object.
 * @see EventsFunctionContext
 */

/**
 * Function returning the Hashtable containing the lists of instances of the specified object.
 *
 * You can alter the list and this will alter the objects picked for the next conditions/actions/events.
 * If you don't need this, prefer using `getObjects`.
 *
 * @callback GetObjectsListsFunction
 * @param {string} objectName The name of the object for which instances must be returned.
 * @return {?Hashtable} Hashtable containing the lists of instances (keys are object names in the current context), or `null` if not found
 * @see EventsFunctionContext
 */

/**
 * Function creating a new object from its name. The object is added to the instances
 * living on the scene.
 *
 * @callback CreateObjectFunction
 * @param {string} objectName The name of the object to be created
 * @return {gdjs.RuntimeObject} The created object
 * @see EventsFunctionContext
 */

/**
 * Function to get the "real" behavior name, that can be used with `getBehavior`. For example:
 * `object.getBehavior(eventsFunctionContext.getBehaviorName("MyBehavior"))`
 *
 * @callback GetBehaviorNameFunction
 * @param {string} behaviorName The name of the behavior, as specified in the parameters of the function.
 * @return {string} The name that can be passed to `getBehavior`.
 * @see EventsFunctionContext
 */

/**
 * Function returning the value (string or number) of an argument that was passed to the events function.
 * To get objects, use `getObjects`.
 *
 * @callback GetArgumentFunction
 * @param {string} argumentName The name of the argument, as specified in the parameters of the function.
 * @return {string|number} The string or number passed for this argument
 * @see EventsFunctionContext
 */

/**
 * Function returning the layer with the given name
 *
 * @callback GetLayerFunction
 * @param {string} name The name of the layer.
 * @return {gdjs.Layer} The layer with the given name, or the base layer if not found.
 * @see EventsFunctionContext
 */

/**
 * Represents the context of the events function (or the behavior method),
 * if any. If the JavaScript code is running in a scene, this will be undefined (so you can't use this in a scene).
 *
 * @typedef {Object} EventsFunctionContext
 * @property {GetObjectsFunction} getObjects Get the list of instances of the specified object.
 * @property {GetLayerFunction} getLayer Use `runtimeScene.getLayer` instead.
 * @property {GetObjectsListsFunction} getObjectsLists Get the Hashtable containing the lists of instances of the specified object.
 *
 * You can alter the list and this will alter the objects picked for the next conditions/actions/events.
 * If you don't need this, prefer using `getObjects`.
 * @property {GetBehaviorNameFunction} getBehaviorName Get the "real" behavior name, that can be used with `getBehavior`. For example: `object.getBehavior(eventsFunctionContext.getBehaviorName("MyBehavior"))`
 * @property {CreateObjectFunction} createObject Create a new object from its name. The object is added to the instances living on the scene.
 * @property {GetArgumentFunction} getArgument Get the value (string or number) of an argument that was passed to the events function. To get objects, use `getObjects`.
 * @property {boolean | number | string} returnValue The return value that should be returned by the expression or the condition.
 */
