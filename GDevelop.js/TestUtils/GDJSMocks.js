/** A minimal RuntimeBehavior base class */
function RuntimeBehavior() {
  return this;
}

/** A minimal implementation of OnceTriggers */
function OnceTriggers() {
  this._triggers = {};
  this._lastFrameTriggers = {};
  return this;
}

OnceTriggers.prototype.startNewFrame = function () {
  this._lastFrameTriggers = {};
  for (var k in this._triggers) {
    if (this._triggers.hasOwnProperty(k)) {
      this._lastFrameTriggers[k] = this._triggers[k];
      delete this._triggers[k];
    }
  }
};

OnceTriggers.prototype.triggerOnce = function (triggerId) {
  this._triggers[triggerId] = true;

  return !this._lastFrameTriggers.hasOwnProperty(triggerId);
};

class VariablesContainer {
  constructor() {
    this._variables = {};
  }

  get(variableName) {
    return {
      add: (value) => {
        this._variables[variableName] =
          (this._variables[variableName] || 0) + value;
      },
      setNumber: (value) => {
        this._variables[variableName] = value;
      },
      getAsNumber: () => {
        return this._variables[variableName] || 0;
      },
    };
  }
  has(variableName) {
    return this._variables.hasOwnProperty(variableName);
  }
}

class RuntimeObject {
  constructor() {
    this._variables = new VariablesContainer();
  }

  getVariables() {
    return this._variables;
  }

  returnVariable(variable) {
    return variable;
  }

  getVariableNumber(variable) {
    return variable.getAsNumber();
  }
}

/**
 * A minimal Hashtable as required by events generated code
 * @template T
 */
class Hashtable {
  constructor() {
    /** @type {Object.<string, T>} */
    this.items = {};
  }

  /**
   * @param {Object.<string, T>} items The content of the Hashtable.
   * @returns {Hashtable} The new hashtable.
   * @static
   */
  static newFrom(items) {
    var hashtable = new Hashtable();
    hashtable.items = items;
    return hashtable;
  }

  /**
   * @param {string} key The key.
   * @param {T} value The value to associate to the key.
   */
  put(key, value) {
    this.items[key] = value;
  }

  /**
   * @param {string} key The key associated to the value.
   */
  get(key) {
    return this.items[key];
  }

  /**
   * @param {string} key The key to search in the Hashtable.
   * @returns {boolean} true if the key exists.
   */
  containsKey(key) {
    return this.items.hasOwnProperty(key);
  }

  /**
   * @param {string} key The key to remove.
   */
  remove(key) {
    delete this.items[key];
  }

  /**
   * @returns {?string} The first key of the Hashtable, or undefined if empty.
   */
  firstKey() {
    for (var k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        return k;
      }
    }

    return null;
  }

  /**
   * @param {Array<string>} result
   */
  keys(result) {
    result.length = 0;
    for (const k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        result.push(k);
      }
    }
  }

  /**
   * @param {Array<T>} result
   */
  values(result) {
    result.length = 0;
    for (const k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        result.push(this.items[k]);
      }
    }
  }

  clear() {
    for (var k in this.items) {
      if (this.items.hasOwnProperty(k)) {
        delete this.items[k];
      }
    }
  }
}

/**
 * @param {Hashtable<RuntimeObject>} objectsLists
 * @return {Array<RuntimeObject>}
 */
const objectsListsToArray = function (objectsLists) {
  const lists = [];
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
 * @template T
 * @param {Array<T>} src
 * @param {Array<T>} dst
 */
const copyArray = function (src, dst) {
  const len = src.length;
  for (let i = 0; i < len; ++i) {
    dst[i] = src[i];
  }
  dst.length = len;
};

const createObjectOnScene = (objectsContext, objectsLists, x, y, layer) => {
  const objectName = objectsLists.firstKey();
  const obj = objectsContext.createObject(objectName);
  if (obj !== null) {
    // Ignore position and layer set up of the object as we're in a minimal mock of GDJS.

    // Let the new object be picked by next actions/conditions.
    if (objectsLists.containsKey(objectName)) {
      objectsLists.get(objectName).push(obj);
    }
  }
};

/**
 * @param {any} objectsContext
 * @param {Hashtable<RuntimeObject[]>} objectsLists
 */
const sceneInstancesCount = (objectsContext, objectsLists) => {
  let count = 0;

  const objectNames = [];
  objectsLists.keys(objectNames);

  const uniqueObjectNames = new Set(objectNames);
  for (const objectName of uniqueObjectNames) {
    count += objectsContext.getInstancesCountOnScene(objectName);
  }
  return count;
}

/**
 * @param {Hashtable<RuntimeObject[]>} objectsLists
 */
const pickedInstancesCount = (objectsLists) => {
  let count = 0;
  const lists = [];
  objectsLists.values(lists);
  for (let i = 0, len = lists.length; i < len; ++i) {
    count += lists[i].length;
  }
  return count;
}

/** A minimal implementation of gdjs.RuntimeScene for testing. */
class RuntimeScene {
  constructor() {
    this._variablesContainer = new VariablesContainer();
    this._onceTriggers = new OnceTriggers();

    /** @type {Object.<string, RuntimeObject[]>} */
    this._instances = {};
  }

  createObject(objectName) {
    if (!this._instances[objectName]) this._instances[objectName] = [];

    const newObject = new RuntimeObject();
    this._instances[objectName].push(newObject);

    return newObject;
  }
  getObjects(objectName) {
    return this._instances[objectName] || [];
  }
  getVariables() {
    return this._variablesContainer;
  }
  getOnceTriggers() {
    return this._onceTriggers;
  }

  /** @param {string} objectName */
  getInstancesCountOnScene(objectName) {
    const instances = this._instances[objectName];
    if (instances) {
      return instances.length;
    }

    return 0;
  }
}

/**
 * Create a minimal mock of GDJS with a RuntimeScene (`gdjs.RuntimeScene`),
 * supporting setting a variable, using "Trigger Once" conditions
 * (just enough to validate events logic), registering a behavior and some
 * lifecycle callbacks.
 */
function makeMinimalGDJSMock() {
  const behaviorCtors = {};
  let runtimeScenePreEventsCallbacks = [];
  const runtimeScene = new RuntimeScene();

  return {
    gdjs: {
      evtTools: {
        variable: { getVariableNumber: (variable) => variable.getAsNumber() },
        object: { createObjectOnScene, sceneInstancesCount, pickedInstancesCount },
      },
      registerBehavior: (behaviorTypeName, Ctor) => {
        behaviorCtors[behaviorTypeName] = Ctor;
      },
      registerRuntimeScenePreEventsCallback: (cb) => {
        runtimeScenePreEventsCallbacks.push(cb);
      },
      _unregisterCallback: (unregisteredCb) => {
        runtimeScenePreEventsCallbacks = runtimeScenePreEventsCallbacks.filter(
          (cb) => cb !== unregisteredCb
        );
      },
      copyArray,
      objectsListsToArray,
      RuntimeBehavior,
      OnceTriggers,
      Hashtable,
    },
    mocks: {
      runRuntimeScenePreEventsCallbacks: () => {
        runtimeScenePreEventsCallbacks.forEach(cb => cb(runtimeScene))
      }
    },
    runtimeScene,
  };
}

module.exports = {
  makeMinimalGDJSMock,
};
