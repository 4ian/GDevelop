// @flow

import { serializeToJSON } from './Serializer';

const CLOUD_PROJECT_AUTOSAVE_CACHE_KEY = 'gdevelop-cloud-project-autosave';
const objectStoreScope = 'cloud-project-autosaves';
const keyName = 'userProjectKey';

type ProjectCacheKey = {| userId: string, cloudProjectId: string |};

class ProjectCache {
  databasePromise: Promise<IDBDatabase> | null;

  static isAvailable() {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  static async burst() {
    if (!ProjectCache.isAvailable()) return;
    return new Promise(resolve => {
      const request = window.indexedDB.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
      request.onsuccess = event => {
        const db = event.target.result;
        const transaction = db.transaction(objectStoreScope, 'readwrite');
        transaction.objectStore(objectStoreScope).clear();
        resolve();
      };
    });
  }

  static _stringifyCacheKey(cacheKey: ProjectCacheKey): string {
    return `${cacheKey.userId}/${cacheKey.cloudProjectId}`;
  }

  _initializeDatabase() {
    if (!this.databasePromise) {
      this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
        request.onsuccess = event => {
          if (
            !event.target.result.objectStoreNames.contains(objectStoreScope)
          ) {
            // The onUpgradeNeeded is called before the success event so the object
            // store should exist.
            console.error(
              `Couldn't find the object store ${objectStoreScope}. An issue must have happened when creating the database.`
            );
          }
          resolve(event.target.result);
        };
        request.onerror = event => {
          console.error('IndexedDB could not be opened:', event);
          reject(event);
        };
        request.onupgradeneeded = event => {
          const db = event.target.result;

          if (!db.objectStoreNames.contains(objectStoreScope)) {
            // The object store can only be created in the onUpgradeNeeded event.
            // This event is called after the database is created and before the success event.
            // If, for some reason, the object store creation failed at the time the
            // database was created, the database will be in a transition state and
            // ProjectCache instances will always fail.
            db.createObjectStore(objectStoreScope, { keyPath: keyName });
          }
        };
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
