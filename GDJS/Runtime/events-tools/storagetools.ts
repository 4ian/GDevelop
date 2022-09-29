/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Storage');
  export namespace evtTools {
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
     */
    export namespace storage {
      let localStorage: Storage | null = null;
      try {
        // @ts-ignore
        if (typeof cc !== 'undefined') {
          // @ts-ignore
          localStorage = cc.sys.localStorage;
        } else {
          if (typeof window !== 'undefined') {
            // @ts-ignore
            localStorage = window.localStorage;
          }
        }
      } catch (error) {
        logger.error('Unable to get access to the localStorage: ' + error);
      }
      if (!localStorage) {
        logger.error(
          "Storage actions won't work as no localStorage was found."
        );
      }

      /** The stored objects that are loaded in memory */
      const loadedObjects = new Hashtable();

      /**
       * Load into memory a JSON serialized object, from the local storage
       * provided by the browser/environment.
       *
       * The object name is prefixed with `GDJS_` in `localStorage`.
       *
       * @param name The name of the object to load
       */
      export const loadJSONFileFromStorage = (name: string) => {
        if (
          loadedObjects.containsKey(
            // Already loaded.
            name
          )
        ) {
          return;
        }
        let serializedString: string | null = null;
        try {
          if (localStorage) {
            serializedString = localStorage.getItem('GDJS_' + name);
          }
        } catch (error) {
          logger.error(
            'Unable to load data from localStorage for "' + name + '": ' + error
          );
        }
        let jsObject = {};
        try {
          if (serializedString) {
            jsObject = JSON.parse(serializedString);
          }
        } catch (error) {
          logger.error(
            'Unable to load data from "' +
              name +
              '" - data is not valid JSON: ' +
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
       * @param name The name of the object to load
       */
      export const unloadJSONFile = (name: string) => {
        if (
          !loadedObjects.containsKey(
            // Not loaded.
            name
          )
        ) {
          return;
        }
        const jsObject = loadedObjects.get(name);
        const serializedString = JSON.stringify(jsObject);
        try {
          if (localStorage) {
            localStorage.setItem('GDJS_' + name, serializedString);
          }
        } catch (error) {
          logger.error(
            'Unable to save data to localStorage for "' + name + '": ' + error
          );
        }
        loadedObjects.remove(name);
      };
      const loadObject = (name: string, cb: Function) => {
        let notPermanentlyLoaded = false;
        if (!loadedObjects.containsKey(name)) {
          notPermanentlyLoaded = true;
          loadJSONFileFromStorage(name);
        }
        const returnValue = cb(loadedObjects.get(name));
        if (notPermanentlyLoaded) {
          unloadJSONFile(name);
        }
        return returnValue;
      };

      export const clearJSONFile = (name: string) => {
        return loadObject(name, (jsObject) => {
          for (const p in jsObject) {
            if (jsObject.hasOwnProperty(p)) {
              delete jsObject[p];
            }
          }
          return true;
        });
      };

      export const elementExistsInJSONFile = (
        name: string,
        elementPath: string
      ) => {
        return loadObject(name, (jsObject) => {
          const pathSegments = elementPath.split('/');
          let currentElem = jsObject;
          for (let i = 0; i < pathSegments.length; ++i) {
            if (!currentElem[pathSegments[i]]) {
              return false;
            }
            currentElem = currentElem[pathSegments[i]];
          }
          return true;
        });
      };

      export const deleteElementFromJSONFile = (
        name: string,
        elementPath: string
      ) => {
        return loadObject(name, (jsObject) => {
          const pathSegments = elementPath.split('/');
          let currentElem = jsObject;
          for (let i = 0; i < pathSegments.length; ++i) {
            if (!currentElem[pathSegments[i]]) {
              return false;
            }
            if (i === pathSegments.length - 1) {
              delete currentElem[pathSegments[i]];
            } else {
              currentElem = currentElem[pathSegments[i]];
            }
          }
          return true;
        });
      };

      export const writeNumberInJSONFile = (
        name: string,
        elementPath: string,
        val: any
      ) => {
        return loadObject(name, (jsObject) => {
          const pathSegments = elementPath.split('/');
          let currentElem = jsObject;
          for (let i = 0; i < pathSegments.length; ++i) {
            if (!currentElem[pathSegments[i]]) {
              currentElem[pathSegments[i]] = {};
            }
            if (i === pathSegments.length - 1) {
              currentElem[pathSegments[i]].value = val;
            } else {
              currentElem = currentElem[pathSegments[i]];
            }
          }
          return true;
        });
      };

      export const writeStringInJSONFile = (
        name: string,
        elementPath: string,
        str: any
      ) => {
        return loadObject(name, (jsObject) => {
          const pathSegments = elementPath.split('/');
          let currentElem = jsObject;
          for (let i = 0; i < pathSegments.length; ++i) {
            if (!currentElem[pathSegments[i]]) {
              currentElem[pathSegments[i]] = {};
            }
            if (i === pathSegments.length - 1) {
              currentElem[pathSegments[i]].str = str;
            } else {
              currentElem = currentElem[pathSegments[i]];
            }
          }
          return true;
        });
      };

      export const readNumberFromJSONFile = (
        name: string,
        elementPath: string,
        instanceContainer: gdjs.RuntimeInstanceContainer | null,
        variable: gdjs.Variable
      ) => {
        return loadObject(name, (jsObject) => {
          const pathSegments = elementPath.split('/');
          let currentElem = jsObject;
          for (let i = 0; i < pathSegments.length; ++i) {
            if (!currentElem[pathSegments[i]]) {
              return false;
            }
            if (
              i === pathSegments.length - 1 &&
              typeof currentElem[pathSegments[i]].value !== 'undefined'
            ) {
              variable.setNumber(currentElem[pathSegments[i]].value);
            } else {
              currentElem = currentElem[pathSegments[i]];
            }
          }
          return true;
        });
      };

      export const readStringFromJSONFile = (
        name: string,
        elementPath: string,
        instanceContainer: gdjs.RuntimeInstanceContainer | null,
        variable: gdjs.Variable
      ) => {
        return loadObject(name, (jsObject) => {
          const pathSegments = elementPath.split('/');
          let currentElem = jsObject;
          for (let i = 0; i < pathSegments.length; ++i) {
            if (!currentElem[pathSegments[i]]) {
              return false;
            }
            if (
              i === pathSegments.length - 1 &&
              typeof currentElem[pathSegments[i]].str !== 'undefined'
            ) {
              variable.setString(currentElem[pathSegments[i]].str);
            } else {
              currentElem = currentElem[pathSegments[i]];
            }
          }
          return true;
        });
      };
    }
  }
}
