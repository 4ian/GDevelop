/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/** An integer. Use this instead of `number` to ease future optimizations. */
declare type integer = number;

/** A floating point number. Use this instead of `number` to ease future optimizations. */
declare type float = number;

/** A point in cartesian space. */
declare type FloatPoint = [number, number];

/** A Hastable with the picked objects lists. */
declare type ObjectsLists = Hashtable<gdjs.RuntimeObject[]>;

/**
 * Represents the context of the events function (or the behavior method),
 * if any. If the JavaScript code is running in a scene, this will be undefined (so you can't use this in a scene).
 */
declare type EventsFunctionContext = {
  task?: gdjs.ManuallyResolvableTask;

  /**  Get the list of instances of the specified object. */
  getObjects: (objectName: string) => Array<gdjs.RuntimeObject>;

  /**
   * Get the Hashtable containing the lists of instances of the specified object.
   * You can alter the list and this will alter the objects picked for the next conditions/actions/events.
   * If you don't need this, prefer using `getObjects`.
   */
  getObjectsLists: (objectName: string) => ObjectsLists | null;

  /**  Get the "real" behavior name, that can be used with `getBehavior`. For example: `object.getBehavior(eventsFunctionContext.getBehaviorName("MyBehavior"))` */
  getBehaviorName: (behaviorName: string) => string;

  /**  Create a new object from its name. The object is added to the instances living on the scene. */
  createObject: (objectName: string) => gdjs.RuntimeObject;

  /** Return the number of instances of the specified object on the scene. */
  getInstancesCountOnScene: (objectName: string) => integer;

  /**  Get the value (string or number) of an argument that was passed to the events function. To get objects, use `getObjects`. */
  getArgument: (argumentName: string) => string | number;

  /** The return value that should be returned by the expression or the condition. */
  returnValue: boolean | number | string;

  /**  Do not use this. Use `runtimeScene.getLayer` instead. */
  getLayer: (layerName: string) => gdjs.Layer;
};

declare namespace gdjs {
  var projectData: ProjectData;
  var runtimeGameOptions: gdjs.RuntimeGameOptions;
}

/** The global cc object from Cocos2D-Js. */
declare var cc: any;
