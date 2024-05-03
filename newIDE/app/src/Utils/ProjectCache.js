// @flow

import { serializeToJSON } from './Serializer';

const CLOUD_PROJECT_AUTOSAVE_CACHE_KEY = 'gdevelop-cloud-project-autosave';
const objectStoreScope = 'cloud-project-autosaves';
const keyName = 'userProjectKey';

type ProjectCacheKey = {| userId: string, cloudProjectId: string |};

class ProjectCache {
  databasePromise: Promise<IDBDatabase> | null;

  static isAvailable() {
    return (
      typeof window !== 'undefined' &&
      'indexedDB' in window &&
      // Firefox <= 125 does not support the `databases()` method that is necessary to
      // fix the issue of corrupted databases (that do not contain the object store `objectStoreScope`).
      'databases' in window.indexedDB &&
      typeof window.indexedDB.databases === 'function'
    );
  }

  static async burst() {
    if (!ProjectCache.isAvailable()) return;
    const databases = await window.indexedDB.databases();
    if (
      !databases.find(
        database => database.name === CLOUD_PROJECT_AUTOSAVE_CACHE_KEY
      )
    ) {
      // The database does not exist so there is nothing to clear.
      return;
    }
    return new Promise(resolve => {
      const request = window.indexedDB.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
      request.onsuccess = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(objectStoreScope)) {
          // The database does not contain the object store so there is nothing to clear.
          // This situation will be fixed by the next database initialization.
          resolve();
        }
        try {
          const transaction = db.transaction(objectStoreScope, 'readwrite');
          transaction.objectStore(objectStoreScope).clear();
        } catch (error) {
          console.warn(
            'An error occurred while clearing the cloud project autosave indexedDB:',
            error
          );
        }
        resolve();
      };
    });
  }

  static _stringifyCacheKey(cacheKey: ProjectCacheKey): string {
    return `${cacheKey.userId}/${cacheKey.cloudProjectId}`;
  }

  static async _removeDatabaseIfCorrupt(): Promise<void> {
    const databases = await window.indexedDB.databases();
    if (
      !databases.find(
        database => database.name === CLOUD_PROJECT_AUTOSAVE_CACHE_KEY
      )
    ) {
      // The database does not exist so it cannot be corrupt.
      return;
    }
    // Check that the database is not in a corrupt state where the object store does
    // not exist. If it does not exist, the autosave feature won't work and the database
    // needs to be removed and recreated.
    await new Promise((resolve, reject) => {
      const request = window.indexedDB.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
      request.onsuccess = event => {
        const db = event.target.result;
        if (db.objectStoreNames.contains(objectStoreScope)) {
          // The object store exists, there is nothing else to do.
          resolve();
        } else {
          console.warn(
            'The cloud project autosave indexed db exist but the object store is not available. Deleting the indexedDB...'
          );
          db.close();
          const req = window.indexedDB.deleteDatabase(
            CLOUD_PROJECT_AUTOSAVE_CACHE_KEY
          );

          req.onsuccess = function() {
            console.warn('Deleted indexedDB successfully!');
            resolve();
          };
          req.onerror = function(event) {
            console.error("Couldn't delete indexedDB: ", event);
            reject();
          };
          req.onblocked = function() {
            console.error(
              "Couldn't delete indexedDB due to the operation being blocked."
            );
            reject();
          };
        }
      };
    });
  }

  _initializeDatabase() {
    if (!this.databasePromise) {
      this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        ProjectCache._removeDatabaseIfCorrupt().then(
          () => {
            const request = window.indexedDB.open(
              CLOUD_PROJECT_AUTOSAVE_CACHE_KEY
            );
            request.onsuccess = event => {
              const db = event.target.result;
              if (!db.objectStoreNames.contains(objectStoreScope)) {
                // The onUpgradeNeeded is called before the success event so the object
                // store should exist.
                console.error(
                  `Couldn't find the object store ${objectStoreScope}. An issue must have happened when creating the database.`
                );
              }
              resolve(db);
            };
            request.onerror = event => {
              console.error('IndexedDB could not be opened:', event);
              reject(event);
            };
            request.onupgradeneeded = event => {
              const db = event.target.result;

              if (!db.objectStoreNames.contains(objectStoreScope)) {
                db.createObjectStore(objectStoreScope, { keyPath: keyName });
              }
            };
          },
          error => {
            console.error(
              'An error occurred while clearing a corrupt database.',
              error
            );
          }
        );
      });
    }
    return this.databasePromise;
  }

  async _getEntry(cacheKey: ProjectCacheKey) {
    const database = await this._initializeDatabase();
    return new Promise((resolve, reject) => {
      try {
        const transaction = database.transaction(objectStoreScope, 'readonly');
        const key = ProjectCache._stringifyCacheKey(cacheKey);
        const request = transaction.objectStore(objectStoreScope).get(key);
        request.onsuccess = event => {
          resolve(event.target.result);
        };
        request.onerror = event => {
          console.error(
            'An error occurred while reading from indexedDB:',
            event
          );
          reject(event);
        };
      } catch (error) {
        // An error might occur when opening the transaction (if the object store
        // does not exist for instance).
        console.error('An error occurred while reading from indexedDB:', error);
        reject(error);
      }
    });
  }

  async get(cacheKey: ProjectCacheKey): Promise<string | null> {
    const entry = await this._getEntry(cacheKey);
    if (!entry) return null;
    const serializedProject = entry.project;
    return serializedProject;
  }

  async getCreationDate(cacheKey: ProjectCacheKey): Promise<number | null> {
    const entry = await this._getEntry(cacheKey);
    if (!entry) return null;
    const entryCreationDate = entry.createdAt;
    return entryCreationDate;
  }

  async put(cacheKey: ProjectCacheKey, project: gdProject): Promise<void> {
    const database = await this._initializeDatabase();

    return new Promise((resolve, reject) => {
      try {
        const transaction = database.transaction(objectStoreScope, 'readwrite');
        const key = ProjectCache._stringifyCacheKey(cacheKey);
        transaction.oncomplete = event => {
          resolve();
        };
        transaction.onerror = event => {
          console.error('An error occurred while writing to indexedDB:', event);
          reject(event);
        };
        transaction.objectStore(objectStoreScope).put({
          [keyName]: key,
          project: serializeToJSON(project),
          createdAt: Date.now(),
        });
      } catch (error) {
        // An error might occur when opening the transaction (if the object store
        // does not exist for instance).
        console.error('An error occurred while writing to indexedDB:', error);
        reject(error);
      }
    });
  }
}

export default ProjectCache;
