import { RuntimeObject, Hashtable, Layer, RuntimeGameOptions } from '..';

declare global {
  /** An integer. Use this instead of `number` to ease future optimizations. */
  type integer = number;

  /** A floating point number. Use this instead of `number` to ease future optimizations. */
  type float = number;

  /** A point in cartesian space. */
  type FloatPoint = [number, number];

  /** A Hastable with the picked objects lists. */
  type ObjectsLists = Hashtable<RuntimeObject[]>;

  /**
   * Represents the context of the events function (or the behavior method),
   * if any. If the JavaScript code is running in a scene, this will be undefined (so you can't use this in a scene).
   */
  type EventsFunctionContext = {
    /**  Get the list of instances of the specified object. */
    getObjects: (objectName: string) => Array<RuntimeObject>;

    /**
     * Get the Hashtable containing the lists of instances of the specified object.
     * You can alter the list and this will alter the objects picked for the next conditions/actions/events.
     * If you don't need this, prefer using `getObjects`.
     */
    getObjectsLists: (objectName: string) => ObjectsLists | null;

    /**  Get the "real" behavior name, that can be used with `getBehavior`. For example: `object.getBehavior(eventsFunctionContext.getBehaviorName("MyBehavior"))` */
    getBehaviorName: (behaviorName: string) => string;

    /**  Create a new object from its name. The object is added to the instances living on the scene. */
    createObject: (objectName: string) => RuntimeObject;

    /**  Get the value (string or number) of an argument that was passed to the events function. To get objects, use `getObjects`. */
    getArgument: (argumentName: string) => string | number;

    /** The return value that should be returned by the expression or the condition. */
    returnValue: boolean | number | string;

    /**  Do not use this. Use `runtimeScene.getLayer` instead. */
    getLayer: (layerName: string) => Layer;
  };

  /** The global cc object from Cocos2D-Js. */
  var cc: any;

  const gdevelopLogo: string;
}

declare module '..' {
  var projectData: ProjectData;
  var runtimeGameOptions: RuntimeGameOptions;
}
