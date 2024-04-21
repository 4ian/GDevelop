/** A minimal RuntimeBehavior base class */
class RuntimeBehavior {
  /**
   * @param {RuntimeScene} instanceContainer The container owning the object of the behavior
   * @param {any} behaviorData The properties used to setup the behavior
   * @param {RuntimeObject} owner The object owning the behavior
   */
  constructor(runtimeScene, behaviorData, owner) {
    this.name = behaviorData.name || '';
    this.type = behaviorData.type || '';
    this.owner = owner;
  }
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

class FakeAsyncTasksManager {
  constructor() {
    /** @type {Map<FakeAsyncTask, (runtimeScene: RuntimeScene) => void>()>} */
    this.tasks = new Map();
  }

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   */
  processTasks(runtimeScene) {
    for (const task of this.tasks.keys()) {
      if (task.update(runtimeScene)) {
        // The task has finished, run the callback and remove it.
        this.tasks.get(task)(runtimeScene);
        this.tasks.delete(task);
      }
    }
  }

  /**
   * @param {FakeAsyncTask} task The {@link AsyncTask} to run.
   * @param {(runtimeScene: RuntimeScene) => void} then The callback to execute once the task is finished.
   */
  addTask(task, then) {
    this.tasks.set(task, then);
  }

  markAllFakeAsyncTasksAsFinished() {
    for (const task of this.tasks.keys()) {
      task.markAsFinished();
    }
  }
}

class FakeAsyncTask {
  constructor() {
    this._finished = false;
  }

  /** @param {RuntimeScene} runtimeScene */
  update(runtimeScene) {
    return this._finished;
  }

  markAsFinished() {
    this._finished = true;
  }
}

class ManuallyResolvableTask extends FakeAsyncTask {
  resolve() {
    this._finished = true;
  }
}

class TaskGroup {
  constructor() {
    /** @type {FakeAsyncTask[]} */
    this._tasks = [];
  }

  /** @param {FakeAsyncTask} task */
  addTask(task) {
    this._tasks.push(task);
  }

  /** @param {RuntimeScene} runtimeScene */
  update(runtimeScene) {
    for (let i = 0; i < this._tasks.length; i++) {
      const task = this._tasks[i];
      if (task.update(runtimeScene)) this._tasks.splice(i--, 1);
    }

    return this._tasks.length === 0;
  }
}

class Variable {
  constructor() {
    /** @type {string|number} */
    this._value = 0;
    this._children = {};
  }

  add(value) {
    this._value = this.getAsNumber() + value;
  }

  setNumber(value) {
    this._value = value;
  }

  getAsNumber() {
    return Number(this._value) || 0;
  }

  getValue() {
    return this.getAsNumber();
  }

  setValue(value) {
    this.setNumber(value);
  }

  /**
   * @param {string} childName
   * @returns {Variable}
   */
  getChild(childName) {
    if (
      this._children[childName] === undefined ||
      this._children[childName] === null
    )
      this._children[childName] = new Variable();
    return this._children[childName];
  }

  getAllChildren() {
    return this._children;
  }

  getAllChildrenArray() {
    return Object.values(this._children);
  }

  castTo() {}

  isPrimitive() {
    return this.getAllChildrenArray().length === 0;
  }

  getType() {
    return this.isPrimitive() ? 'number' : 'structure';
  }

  clearChildren() {
    this._children = {};
    this._childrenArray = [];
  }

  clone() {
    return Variable.copy(this, new Variable());
  }

  setString(value) {
    this._value = value;
  }

  getAsString() {
    return ('' + this._value) || '';
  }

  concatenateString(str) {
    this.setString(this.getAsString() + str);
  }

  getAsNumberOrString() {
    return this._value;
  }

  addChild(childName, childVariable) {
    // Make sure this is a structure
    this.castTo('structure');
    this._children[childName] = childVariable;
    return this;
  }

  /**
   *
   * @param {Variable} source
   * @param {Variable} target
   * @param {?boolean} merge
   * @returns {Variable}
   */
  static copy(source, target, merge) {
    if (!merge) target.clearChildren();
    target.castTo(source.getType());
    if (source.isPrimitive()) {
      target.setValue(source.getValue());
    } else if (source.getType() === 'structure') {
      const children = source.getAllChildren();
      for (const p in children) {
        if (children.hasOwnProperty(p)) target.addChild(p, children[p].clone());
      }
    } else if (source.getType() === 'array') {
      for (const p of source.getAllChildrenArray()) target.pushVariableCopy(p);
    }
    return target;
  }
}

class VariablesContainer {
  constructor(initialVariablesData) {
    this._variables = new Hashtable();
    this._indexedVariables = [];

    if (initialVariablesData !== undefined) {
      const setupVariableFromVariableData = (variable, variableData) => {
        if (variableData.type === 'number') {
          variable.setNumber(variableData.value);
        } else if (variableData.type === 'string') {
          variable.setString(variableData.value);
        } else if (variableData.type === 'structure') {
          variableData.children.forEach((childVariableData) => {
            const childVariable = variable.getChild(childVariableData.name);
            setupVariableFromVariableData(childVariable, childVariableData);
          });
          variable.setString(variableData.value);
        } else {
          throw new Error(
            'Unsupported variable type in GDJS Mock:',
            variableData.type
          );
        }
      };

      initialVariablesData.forEach((variableData) => {
        const newVariable = new Variable();
        setupVariableFromVariableData(newVariable, variableData);

        this._variables.put(variableData.name, newVariable);
        this._indexedVariables.push(newVariable);
      });
    }
  }

  /**
   * @param {string} name
   * @returns {Variable}
   */
  get(name) {
    let variable = this._variables.get(name);
    if (!variable) {
      variable = new Variable();
      this._variables.put(name, variable);
    }
    return variable;
  }

  /**
   * @param {number} index
   * @returns {Variable}
   */
  getFromIndex(index) {
    if (!this._indexedVariables[index]) {
      throw new Error(
        'Trying to access to an indexed variable that does not exist.'
      );
    }
    return this._indexedVariables[index];
  }

  has(variableName) {
    return this._variables.containsKey(variableName);
  }
}

class RuntimeObject {
  constructor(runtimeScene, objectData) {
    this.name = objectData.name || '';
    this._variables = new VariablesContainer();
    this._livingOnScene = true;
    this._behaviors = new Map();
    this._x = 0;
    this._y = 0;

    /** @type {Set<() => void>} */
    this.destroyCallbacks = new Set();
  }

  setX(x) {
    this._x = x;
  }
  getX() {
    return this._x;
  }

  setY(y) {
    this._y = y;
  }
  getY() {
    return this._x;
  }

  getName() {
    return this.name;
  }

  getVariables() {
    return this._variables;
  }

  returnVariable(variable) {
    return variable;
  }

  static getVariableNumber(variable) {
    return variable.getAsNumber();
  }

  getVariableNumber(variable) {
    return variable.getAsNumber();
  }

  /** @param {RuntimeScene} runtimeScene */
  deleteFromScene(runtimeScene) {
    if (this._livingOnScene) {
      runtimeScene.markObjectForDeletion(this);
      this._livingOnScene = false;
    }
  }

  /** @param {RuntimeScene} runtimeScene */
  onDestroyFromScene(runtimeScene) {
    // Note: these mocks don't support behaviors nor layers or effects.

    this.destroyCallbacks.forEach((c) => c());
  }

  registerDestroyCallback(callback) {
    this.destroyCallbacks.add(callback);
  }

  unregisterDestroyCallback(callback) {
    this.destroyCallbacks.delete(callback);
  }

  doFakeAsyncAction() {
    this._task = new FakeAsyncTask();
    return this._task;
  }

  /** @param {RuntimeBehavior} behavior */
  addBehavior(behavior) {
    this._behaviors.set(behavior.name, behavior);
  }

  /** @param {string} behaviorName */
  getBehavior(behaviorName) {
    const behavior = this._behaviors.get(behaviorName);
    if (!behavior) throw new Error(`No behavior called ${behaviorName} found.`);
    return behavior;
  }

  noop() {}

  markFakeAsyncActionAsFinished() {
    if (this._task) this._task.markAsFinished();
  }
}

class CustomRuntimeObject2D extends RuntimeObject {
  constructor(parentInstanceContainer, objectData) {
    super(parentInstanceContainer, objectData);
    this._instanceContainer = parentInstanceContainer;
  }
  onCreated() {}
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
const getSceneInstancesCount = (objectsContext, objectsLists) => {
  let count = 0;

  const objectNames = [];
  objectsLists.keys(objectNames);

  const uniqueObjectNames = new Set(objectNames);
  for (const objectName of uniqueObjectNames) {
    count += objectsContext.getInstancesCountOnScene(objectName);
  }
  return count;
};

/**
 * @param {Hashtable<RuntimeObject[]>} objectsLists
 */
const getPickedInstancesCount = (objectsLists) => {
  let count = 0;
  const lists = [];
  objectsLists.values(lists);
  for (let i = 0, len = lists.length; i < len; ++i) {
    count += lists[i].length;
  }
  return count;
};

/** A minimal implementation of gdjs.RuntimeScene for testing. */
class RuntimeScene {
  constructor(sceneData) {
    this._variablesContainer = new VariablesContainer(
      sceneData && sceneData.variables
    );
    this._onceTriggers = new OnceTriggers();
    this._asyncTasksManager = new FakeAsyncTasksManager();

    /** @type {Object.<string, RuntimeObject[]>} */
    this._instances = {};
  }

  createObject(objectName) {
    if (!this._instances[objectName]) this._instances[objectName] = [];

    const fakeObjectData = { name: objectName };
    const newObject = new RuntimeObject(this, fakeObjectData);
    this._instances[objectName].push(newObject);

    return newObject;
  }

  /** @param {RuntimeObject} obj */
  markObjectForDeletion(obj) {
    // Delete from the living instances.
    const instances = this._instances[obj.getName()];
    if (instances) {
      for (let i = 0, len = instances.length; i < len; ++i) {
        if (instances == obj) {
          allInstances.splice(i, 1);
          break;
        }
      }
    }

    //Notify the object it was removed from the scene
    obj.onDestroyFromScene(this);
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

  getAsyncTasksManager() {
    return this._asyncTasksManager;
  }

  /** @param {string} objectName */
  getInstancesCountOnScene(objectName) {
    const instances = this._instances[objectName];
    if (instances) {
      return instances.length;
    }

    return 0;
  }

  getInitialSharedDataForBehavior(name) {
    return {};
  }

  getScene() {
    return this;
  }
}

/**
 * A container for objects lists that should last more than the current frame.
 * It automatically removes objects that were destroyed from the objects lists.
 */
class LongLivedObjectsList {
  constructor() {
    /** @type {Map<string, Array<RuntimeObject>>} */
    this.objectsLists = new Map();
    /** @type {Map<RuntimeObject, () => void>} */
    this.callbacks = new Map();
    /** @type {LongLivedObjectsList | null} */
    this.parent = null;
  }

  /** @param {LongLivedObjectsList} parent */
  static from(parent) {
    const newList = new LongLivedObjectsList();
    newList.parent = parent;
    return newList;
  }

  /** @param {string} objectName */
  getOrCreateList(objectName) {
    if (!this.objectsLists.has(objectName))
      this.objectsLists.set(objectName, []);
    return this.objectsLists.get(objectName);
  }

  /** @param {string} objectName */
  getObjects(objectName) {
    if (!this.objectsLists.has(objectName) && this.parent)
      return this.parent.getObjects(objectName);
    return this.objectsLists.get(objectName) || [];
  }

  /**
   * @param {string} objectName
   * @param {gdjs.RuntimeObject} runtimeObject
   */
  addObject(objectName, runtimeObject) {
    const list = this.getOrCreateList(objectName);
    if (list.includes(runtimeObject)) return;
    list.push(runtimeObject);

    // Register callbacks for when the object is destroyed
    const onDestroy = () => this.removeObject(objectName, runtimeObject);
    this.callbacks.set(runtimeObject, onDestroy);
    runtimeObject.registerDestroyCallback(onDestroy);
  }

  /**
   * @param {string} objectName
   * @param {gdjs.RuntimeObject} runtimeObject
   */
  removeObject(objectName, runtimeObject) {
    const list = this.getOrCreateList(objectName);
    const index = list.indexOf(runtimeObject);
    if (index === -1) return;
    list.splice(index, 1);

    // Properly remove callbacks to not leak the object
    runtimeObject.unregisterDestroyCallback(this.callbacks.get(runtimeObject));
    this.callbacks.delete(runtimeObject);
  }
}

/**
 * Create a minimal mock of GDJS with a RuntimeScene (`gdjs.RuntimeScene`),
 * supporting setting a variable, using "Trigger Once" conditions
 * (just enough to validate events logic), registering a behavior and some
 * lifecycle callbacks.
 */
function makeMinimalGDJSMock(options) {
  const behaviorCtors = {};
  const customObjectsCtors = {};
  let runtimeScenePreEventsCallbacks = [];
  const runtimeScene = new RuntimeScene(options && options.sceneData);

  return {
    gdjs: {
      evtTools: {
        variable: {
          getVariableNumber: (variable) => variable.getAsNumber(),
          getVariableString: (variable) => variable.getAsString()
        },
        object: {
          createObjectOnScene,
          getSceneInstancesCount,
          getPickedInstancesCount,
        },
        runtimeScene: {
          wait: () => new FakeAsyncTask(),
          noop: () => {},
        },
        common: {
          resolveAsyncEventsFunction: ({ task }) => task.resolve(),
        },
      },
      registerBehavior: (behaviorTypeName, Ctor) => {
        behaviorCtors[behaviorTypeName] = Ctor;
      },
      registerObject: (objectTypeName, Ctor) => {
        customObjectsCtors[objectTypeName] = Ctor;
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
      RuntimeObject,
      OnceTriggers,
      Hashtable,
      LongLivedObjectsList,
      TaskGroup,
      CustomRuntimeObject2D,
      ManuallyResolvableTask,
      Variable,
    },
    mocks: {
      runRuntimeScenePreEventsCallbacks: () => {
        runtimeScenePreEventsCallbacks.forEach((cb) => cb(runtimeScene));
      },
    },
    runtimeScene,
  };
}

module.exports = {
  makeMinimalGDJSMock,
};
