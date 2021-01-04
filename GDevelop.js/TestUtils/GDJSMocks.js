
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

/** A minimal Hashtable as required by events generated code */
function Hashtable()
{
    /** @type {Object.<string, any>} */
    this.items = {};
}

/**
 * @param {Object.<string, any>} items The content of the Hashtable.
 * @returns {Hashtable} The new hashtable.
 * @static
 */
Hashtable.newFrom = function(items) {
    var hashtable = new Hashtable();
    hashtable.items = items;
    return hashtable;
}

/**
 * @param {string} key The key.
 * @param {any} value The value to associate to the key.
 */
Hashtable.prototype.put = function(key, value) {
    this.items[key] = value;
}

/**
 * @param {string} key The key associated to the value.
 */
Hashtable.prototype.get = function(key) {
    return this.items[key];
}

/**
 * @param {string} key The key to search in the Hashtable.
 * @returns {boolean} true if the key exists.
 */
Hashtable.prototype.containsKey = function(key) {
    return this.items.hasOwnProperty(key);
}

/**
 * @param {string} key The key to remove.
 */
Hashtable.prototype.remove = function(key) {
    delete this.items[key];
}

/**
 * @returns {?string} The first key of the Hashtable, or undefined if empty.
 */
Hashtable.prototype.firstKey = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            return k;
        }
    }

    return null;
}

Hashtable.prototype.clear = function() {
    for (var k in this.items) {
        if (this.items.hasOwnProperty(k)) {
            delete this.items[k];
        }
    }
}


/**
 * Create a minimal mock of GDJS with a RuntimeScene (`gdjs.RuntimeScene`),
 * supporting setting a variable and using "Trigger Once" conditions
 * (just enough to validate events logic).
 */
function makeMinimalGDJSMock() {
  const runtimeSceneVariables = {};
  const runtimeSceneOnceTriggers = new OnceTriggers();
  const behaviorCtors = {};

  return {
    gdjs: {
      evtTools: {
        common: { getVariableNumber: (variable) => variable.getAsNumber() },
      },
      registerBehavior: (behaviorTypeName, Ctor) => {
        behaviorCtors[behaviorTypeName] = Ctor;
      },
      RuntimeBehavior,
      OnceTriggers,
      Hashtable,
    },
    // A minimal implementation of `gdjs.RuntimeScene` and variables for testing:
    runtimeScene: {
      getVariables: () => ({
        get: (variableName) => ({
          add: (value) => {
            runtimeSceneVariables[variableName] =
              (runtimeSceneVariables[variableName] || 0) + value;
          },
          setNumber: (value) => {
            runtimeSceneVariables[variableName] = value;
          },
          getAsNumber: () => {
            return runtimeSceneVariables[variableName] || 0;
          },
        }),
        has: (variableName) =>
          runtimeSceneVariables.hasOwnProperty(variableName),
      }),
      getOnceTriggers: () => runtimeSceneOnceTriggers,
    },
  };
}

module.exports = {
  makeMinimalGDJSMock,
};
