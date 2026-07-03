/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * @category Utils > IndexedDB
   */
  export namespace indexedDb {
    export const loadFromIndexedDB = async function (
      dbName: string,
      objectStoreName: string,
      key: string
    ): Promise<any> {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(dbName, 1);
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
              console.error(
                'Error loading data from IndexedDB:',
                getRequest.error
              );
              reject(getRequest.error);
            };
          };

          request.onerror = function () {
            console.error('Error opening IndexedDB:', request.error);
            reject(request.error);
          };
        } catch (err) {
          console.error('Exception thrown while opening IndexedDB:', err);
          reject(err);
          return;
        }
      });
    };

    export const saveToIndexedDB = async function (
      dbName: string,
      objectStoreName: string,
      key: string,
      data: any
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(dbName, 1);
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
              console.error(
                'Error saving data to IndexedDB:',
                putRequest.error
              );
              reject(putRequest.error);
            };
          };

          request.onerror = function () {
            console.error('Error opening IndexedDB:', request.error);
            reject(request.error);
          };
        } catch (err) {
          console.error('Exception thrown while opening IndexedDB:', err);
          reject(err);
          return;
        }
      });
    };

    export const deleteFromIndexedDB = async function (
      dbName: string,
      objectStoreName: string,
      key: string
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(dbName, 1);
          request.onupgradeneeded = function () {
            const db = request.result;
            if (!db.objectStoreNames.contains(objectStoreName)) {
              db.createObjectStore(objectStoreName);
            }
          };
          request.onsuccess = function () {
            const db = request.result;
            const tx = db.transaction(objectStoreName, 'readwrite');
            const store = tx.objectStore(objectStoreName);
            const deleteRequest = store.delete(key);

            deleteRequest.onsuccess = function () {
              resolve();
            };

            deleteRequest.onerror = function () {
              console.error(
                'Error deleting data from IndexedDB:',
                deleteRequest.error
              );
              reject(deleteRequest.error);
            };
          };

          request.onerror = function () {
            console.error('Error opening IndexedDB:', request.error);
            reject(request.error);
          };
        } catch (err) {
          console.error('Exception thrown while opening IndexedDB:', err);
          reject(err);
          return;
        }
      });
    };

    export const keyExistsInIndexedDB = async function (
      dbName: string,
      objectStoreName: string,
      key: string
    ): Promise<boolean> {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(dbName, 1);
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
            // Only look up the single key instead of materializing every key.
            const countRequest = store.count(key);

            countRequest.onsuccess = function () {
              resolve(countRequest.result > 0);
            };

            countRequest.onerror = function () {
              console.error(
                'Error checking key existence in IndexedDB:',
                countRequest.error
              );
              reject(countRequest.error);
            };
          };

          request.onerror = function () {
            console.error('Error opening IndexedDB:', request.error);
            reject(request.error);
          };
        } catch (err) {
          console.error('Exception thrown while opening IndexedDB:', err);
          reject(err);
          return;
        }
      });
    };

    export const getAllKeysFromIndexedDB = async function (
      dbName: string,
      objectStoreName: string
    ): Promise<IDBValidKey[]> {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(dbName, 1);
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
            const getKeysRequest = store.getAllKeys();

            getKeysRequest.onsuccess = function () {
              resolve(getKeysRequest.result || []);
            };

            getKeysRequest.onerror = function () {
              console.error(
                'Error listing keys from IndexedDB:',
                getKeysRequest.error
              );
              reject(getKeysRequest.error);
            };
          };

          request.onerror = function () {
            console.error('Error opening IndexedDB:', request.error);
            reject(request.error);
          };
        } catch (err) {
          console.error('Exception thrown while opening IndexedDB:', err);
          reject(err);
          return;
        }
      });
    };

    export const getAllFromIndexedDB = async function (
      dbName: string,
      objectStoreName: string
    ): Promise<{ key: IDBValidKey; value: any }[]> {
      return new Promise((resolve, reject) => {
        try {
          const request = indexedDB.open(dbName, 1);
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
            // Read keys and values in the same transaction so they stay aligned.
            const getKeysRequest = store.getAllKeys();
            const getValuesRequest = store.getAll();

            tx.oncomplete = function () {
              const keys = getKeysRequest.result || [];
              const values = getValuesRequest.result || [];
              resolve(
                keys.map((key, index) => ({ key, value: values[index] }))
              );
            };

            tx.onerror = function () {
              console.error('Error reading all data from IndexedDB:', tx.error);
              reject(tx.error);
            };
          };

          request.onerror = function () {
            console.error('Error opening IndexedDB:', request.error);
            reject(request.error);
          };
        } catch (err) {
          console.error('Exception thrown while opening IndexedDB:', err);
          reject(err);
          return;
        }
      });
    };
  }
}
