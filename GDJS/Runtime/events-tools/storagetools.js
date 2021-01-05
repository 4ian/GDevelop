// @ts-check
/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Functions to store and load basic values (strings or numbers), organized
 * into objects:
 * * Each object has a name
 * * Each value can be accessed using a path-like string
 *   (for example: `Root/Some folder/MyValueName`), where each segment is
 *   separated by a slash.
 *
 * These objects are persisted into the environment `localStorage` - which
 * might not always be available (if not, objects won't be persisted).
 *
 * @memberof gdjs.evtTools
 * @namespace storage
 * @private
 */
gdjs.evtTools.storage = (function () {
  /** @type {?Storage} */
  let localStorage = null;
  try {
    // @ts-ignore
    if (typeof cc !== 'undefined') {
      // @ts-ignore
      localStorage = cc.sys.localStorage;
    } else if (typeof window !== 'undefined') {
      localStorage = window.localStorage;
    }
  } catch (error) {
    console.warn('Unable to get access to the localStorage: ', error);
  }
  if (!localStorage) {
    console.warn("Storage actions won't work as no localStorage was found.");
  }

  /** The stored objects that are loaded in memory */
  const loadedObjects = new Hashtable();

  /**
   * Load into memory a JSON serialized object, from the local storage
   * provided by the browser/environment.
   *
   * The object name is prefixed with `GDJS_` in `localStorage`.
   *
   * @param {string} name The name of the object to load
   */
  const loadJSONFileFromStorage = (name) => {
    if (loadedObjects.containsKey(name)) return; // Already loaded.

    let serializedString = null;
    try {
      if (localStorage) {
        serializedString = localStorage.getItem('GDJS_' + name);
      }
    } catch (error) {
      console.warn(
        'Unable to load data from localStorage for "' + name + '":',
        error
      );
    }

    let jsObject = {};
    try {
      if (serializedString) jsObject = JSON.parse(serializedString);
    } catch (error) {
      console.warn(
        'Unable to load data from "' + name + '" - data is not valid JSON:',
        error
      );
    }

    loadedObjects.put(name, jsObject);
  };

  /**
   * Unload from memory an object, which is then serialized as JSON and
   * stored in the local storage provided by the browser/environment.
   *
   * The object name is prefixed with `GDJS_` in `localStorage`.
   *
   * @param {string} name The name of the object to load
   */
  const unloadJSONFile = (name) => {
    if (!loadedObjects.containsKey(name)) return; // Not loaded.

    const jsObject = loadedObjects.get(name);
    const serializedString = JSON.stringify(jsObject);

    try {
      if (localStorage) localStorage.setItem('GDJS_' + name, serializedString);
    } catch (error) {
      console.warn(
        'Unable to save data to localStorage for "' + name + '":',
        error
      );
    }

    loadedObjects.remove(name);
  };

  /**
   * @param {*} name
   * @param {Function} cb
   */
  const loadObject = (name, cb) => {
    let notPermanentlyLoaded = false;
    if (!loadedObjects.containsKey(name)) {
      notPermanentlyLoaded = true;
      loadJSONFileFromStorage(name);
    }

    const returnValue = cb(loadedObjects.get(name));
    if (notPermanentlyLoaded) unloadJSONFile(name);
    return returnValue;
  };

  /**
   * @param {string} name
   */
  const clearJSONFile = (name) => {
    return loadObject(name, (jsObject) => {
      for (var p in jsObject) {
        if (jsObject.hasOwnProperty(p)) delete jsObject[p];
      }
      return true;
    });
  };

  /**
   * @param {string} name
   * @param {string} elementPath
   */
  const elementExistsInJSONFile = (name, elementPath) => {
    return loadObject(name, (jsObject) => {
      const pathSegments = elementPath.split('/');
      let currentElem = jsObject;
      for (var i = 0; i < pathSegments.length; ++i) {
        if (!currentElem[pathSegments[i]]) {
          return false;
        }

        currentElem = currentElem[pathSegments[i]];
      }

      return true;
    });
  };

  /**
   * @param {string} name
   * @param {string} elementPath
   */
  const deleteElementFromJSONFile = (name, elementPath) => {
    return loadObject(name, (jsObject) => {
      const pathSegments = elementPath.split('/');
      let currentElem = jsObject;
      for (var i = 0; i < pathSegments.length; ++i) {
        if (!currentElem[pathSegments[i]]) {
          return false;
        }

        if (i === pathSegments.length - 1) delete currentElem[pathSegments[i]];
        else currentElem = currentElem[pathSegments[i]];
      }

      return true;
    });
  };

  /**
   * @param {string} name
   * @param {string} elementPath
   * @param {any} val
   */
  const writeNumberInJSONFile = (name, elementPath, val) => {
    return loadObject(name, (jsObject) => {
      const pathSegments = elementPath.split('/');
      let currentElem = jsObject;
      for (var i = 0; i < pathSegments.length; ++i) {
        if (!currentElem[pathSegments[i]]) currentElem[pathSegments[i]] = {};

        if (i === pathSegments.length - 1)
          currentElem[pathSegments[i]].value = val;
        else currentElem = currentElem[pathSegments[i]];
      }

      return true;
    });
  };

  /**
   * @param {string} name
   * @param {string} elementPath
   * @param {any} str
   */
  const writeStringInJSONFile = (name, elementPath, str) => {
    return loadObject(name, (jsObject) => {
      const pathSegments = elementPath.split('/');
      let currentElem = jsObject;
      for (var i = 0; i < pathSegments.length; ++i) {
        if (!currentElem[pathSegments[i]]) currentElem[pathSegments[i]] = {};

        if (i === pathSegments.length - 1)
          currentElem[pathSegments[i]].str = str;
        else currentElem = currentElem[pathSegments[i]];
      }

      return true;
    });
  };

  /**
   * @param {string} name
   * @param {string} elementPath
   * @param {?gdjs.RuntimeScene} runtimeScene
   * @param {gdjs.Variable} variable
   */
  const readNumberFromJSONFile = (
    name,
    elementPath,
    runtimeScene,
    variable
  ) => {
    return loadObject(name, (jsObject) => {
      const pathSegments = elementPath.split('/');
      let currentElem = jsObject;
      for (var i = 0; i < pathSegments.length; ++i) {
        if (!currentElem[pathSegments[i]]) {
          return false;
        }

        if (
          i === pathSegments.length - 1 &&
          typeof currentElem[pathSegments[i]].value !== 'undefined'
        )
          variable.setNumber(currentElem[pathSegments[i]].value);
        else currentElem = currentElem[pathSegments[i]];
      }

      return true;
    });
  };

  /**
   * @param {string} name
   * @param {string} elementPath
   * @param {?gdjs.RuntimeScene} runtimeScene
   * @param {gdjs.Variable} variable
   */
  const readStringFromJSONFile = (
    name,
    elementPath,
    runtimeScene,
    variable
  ) => {
    return loadObject(name, (jsObject) => {
      const pathSegments = elementPath.split('/');
      let currentElem = jsObject;
      for (var i = 0; i < pathSegments.length; ++i) {
        if (!currentElem[pathSegments[i]]) {
          return false;
        }

        if (
          i === pathSegments.length - 1 &&
          typeof currentElem[pathSegments[i]].str !== 'undefined'
        )
          variable.setString(currentElem[pathSegments[i]].str);
        else currentElem = currentElem[pathSegments[i]];
      }

      return true;
    });
  };

  return {
    // TODO: All methods are using "JSONFile" in their name, but this could be replaced
    // by "data" or "object".
    loadJSONFileFromStorage: loadJSONFileFromStorage,
    unloadJSONFile: unloadJSONFile,
    clearJSONFile: clearJSONFile,
    elementExistsInJSONFile: elementExistsInJSONFile,
    deleteElementFromJSONFile: deleteElementFromJSONFile,
    writeNumberInJSONFile: writeNumberInJSONFile,
    writeStringInJSONFile: writeStringInJSONFile,
    readNumberFromJSONFile: readNumberFromJSONFile,
    readStringFromJSONFile: readStringFromJSONFile,
  };
})();
