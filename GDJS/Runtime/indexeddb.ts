/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export const loadFromIndexedDB = async function (
    dbName: string,
    objectStoreName: string,
    key: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let request: IDBOpenDBRequest;

      try {
        request = indexedDB.open(dbName, 1);
      } catch (err) {
        console.error('Exception thrown while opening IndexedDB:', err);
        reject(err);
        return;
      }

      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(objectStoreName)) {
          db.createObjectStore(objectStoreName);
        }
      };

      request.onsuccess = function () {
        const db = request.result;

        const tx = db.transaction(objectStoreName, 'readonly');
        const store = tx.objectStore(objectStoreName);
        const getRequest = store.get(key);

        getRequest.onsuccess = function () {
          if (getRequest.result !== undefined) {
            resolve(getRequest.result);
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = function () {
          console.error('Error loading game from IndexedDB:', getRequest.error);
          reject(getRequest.error);
        };
      };

      request.onerror = function () {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };
    });
  };

  export const saveToIndexedDB = async function (
    dbName: string,
    objectStoreName: string,
    key: string,
    data: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(dbName, 1);
      } catch (err) {
        console.error('Exception thrown while opening IndexedDB:', err);
        reject(err);
        return;
      }

      request.onupgradeneeded = function (event) {
        const db = request.result;
        if (!db.objectStoreNames.contains(objectStoreName)) {
          db.createObjectStore(objectStoreName);
        }
      };
      request.onsuccess = function () {
        const db = request.result;
        const tx = db.transaction(objectStoreName, 'readwrite');
        const store = tx.objectStore(objectStoreName);
        const putRequest = store.put(data, key);

        putRequest.onsuccess = function () {
          resolve();
        };

        putRequest.onerror = function () {
          console.error('Error saving game in IndexedDB:', putRequest.error);
          reject(putRequest.error);
        };
      };

      request.onerror = function () {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };
    });
  };
}
