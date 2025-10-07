// @flow

/**
 * A utility module for managing local game preview files in IndexedDB.
 * This provides a clean, promise-based interface for storing and retrieving
 * game files that will be served by the service worker.
 */

const DB_NAME = 'gdevelop-local-preview-vfs';
const STORE_NAME = 'files';
const DB_VERSION = 1;

export type FileRecord = {|
  bytes: ArrayBuffer,
  contentType: string,
|};

let dbInstance: ?IDBDatabase = null;

/**
 * Opens or returns the existing IndexedDB database connection.
 * Handles database upgrades and version management.
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  if (dbInstance && dbInstance.version === DB_VERSION) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        const error = request.error || new Error('Failed to open IndexedDB');
        console.error('[LocalFileIndexedDB] Error opening database:', error);
        reject(error);
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        console.log('[LocalFileIndexedDB] Database opened successfully');
        
        // Handle unexpected close
        dbInstance.onclose = () => {
          console.warn('[LocalFileIndexedDB] Database connection closed unexpectedly');
          dbInstance = null;
        };

        // Handle version change (e.g., if another tab upgrades the DB)
        dbInstance.onversionchange = () => {
          console.warn('[LocalFileIndexedDB] Database version changed, closing connection');
          if (dbInstance) {
            dbInstance.close();
            dbInstance = null;
          }
        };

        resolve(dbInstance);
      };

      request.onupgradeneeded = (event) => {
        console.log('[LocalFileIndexedDB] Upgrading database schema...');
        const db = request.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME);
          console.log('[LocalFileIndexedDB] Created object store:', STORE_NAME);
        }
      };

      request.onblocked = () => {
        console.warn('[LocalFileIndexedDB] Database upgrade blocked by another connection');
        reject(new Error('Database upgrade blocked. Please close other tabs using this application.'));
      };
    } catch (error) {
      console.error('[LocalFileIndexedDB] Exception while opening database:', error);
      reject(error);
    }
  });
};

/**
 * Stores a file in IndexedDB.
 * @param path - The virtual path of the file (e.g., '/local_sw_preview/session-123/index.html')
 * @param bytes - The file content as ArrayBuffer
 * @param contentType - The MIME type of the file
 */
export const putFile = async (
  path: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<void> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        
        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error('[LocalFileIndexedDB] Transaction error while putting file:', path, error);
          reject(error);
        };

        transaction.oncomplete = () => {
          console.log('[LocalFileIndexedDB] File stored successfully:', path);
          resolve();
        };

        const objectStore = transaction.objectStore(STORE_NAME);
        const record: FileRecord = { bytes, contentType };
        
        const request = objectStore.put(record, path);
        
        request.onerror = () => {
          const error = request.error || new Error('Put operation failed');
          console.error('[LocalFileIndexedDB] Error storing file:', path, error);
          reject(error);
        };
      } catch (error) {
        console.error('[LocalFileIndexedDB] Exception during put operation:', path, error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('[LocalFileIndexedDB] Failed to put file:', path, error);
    throw error;
  }
};

/**
 * Retrieves a file from IndexedDB.
 * @param path - The virtual path of the file
 * @returns The file record or null if not found
 */
export const getFile = async (path: string): Promise<?FileRecord> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        
        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error('[LocalFileIndexedDB] Transaction error while getting file:', path, error);
          reject(error);
        };

        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(path);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            console.log('[LocalFileIndexedDB] File retrieved:', path);
          } else {
            console.warn('[LocalFileIndexedDB] File not found:', path);
          }
          resolve(result || null);
        };

        request.onerror = () => {
          const error = request.error || new Error('Get operation failed');
          console.error('[LocalFileIndexedDB] Error retrieving file:', path, error);
          reject(error);
        };
      } catch (error) {
        console.error('[LocalFileIndexedDB] Exception during get operation:', path, error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('[LocalFileIndexedDB] Failed to get file:', path, error);
    throw error;
  }
};

/**
 * Deletes a file from IndexedDB.
 * @param path - The virtual path of the file to delete
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        
        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error('[LocalFileIndexedDB] Transaction error while deleting file:', path, error);
          reject(error);
        };

        transaction.oncomplete = () => {
          console.log('[LocalFileIndexedDB] File deleted successfully:', path);
          resolve();
        };

        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(path);

        request.onerror = () => {
          const error = request.error || new Error('Delete operation failed');
          console.error('[LocalFileIndexedDB] Error deleting file:', path, error);
          reject(error);
        };
      } catch (error) {
        console.error('[LocalFileIndexedDB] Exception during delete operation:', path, error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('[LocalFileIndexedDB] Failed to delete file:', path, error);
    throw error;
  }
};

/**
 * Deletes all files with a given path prefix.
 * Useful for cleaning up old preview sessions.
 * @param pathPrefix - The path prefix to match (e.g., '/local_sw_preview/session-123/')
 */
export const deleteFilesWithPrefix = async (pathPrefix: string): Promise<number> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        let deletedCount = 0;
        
        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error('[LocalFileIndexedDB] Transaction error while deleting files with prefix:', pathPrefix, error);
          reject(error);
        };

        transaction.oncomplete = () => {
          console.log('[LocalFileIndexedDB] Deleted', deletedCount, 'files with prefix:', pathPrefix);
          resolve(deletedCount);
        };

        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const key = cursor.key;
            if (typeof key === 'string' && key.startsWith(pathPrefix)) {
              cursor.delete();
              deletedCount++;
            }
            cursor.continue();
          }
        };

        request.onerror = () => {
          const error = request.error || new Error('Cursor operation failed');
          console.error('[LocalFileIndexedDB] Error during cursor operation:', error);
          reject(error);
        };
      } catch (error) {
        console.error('[LocalFileIndexedDB] Exception during delete with prefix:', pathPrefix, error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('[LocalFileIndexedDB] Failed to delete files with prefix:', pathPrefix, error);
    throw error;
  }
};

/**
 * Gets all file paths stored in the database.
 * Useful for debugging and cleanup operations.
 */
export const getAllFilePaths = async (): Promise<Array<string>> => {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const paths: Array<string> = [];
        
        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error('[LocalFileIndexedDB] Transaction error while getting all paths:', error);
          reject(error);
        };

        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAllKeys();

        request.onsuccess = () => {
          const keys = request.result;
          keys.forEach(key => {
            if (typeof key === 'string') {
              paths.push(key);
            }
          });
          console.log('[LocalFileIndexedDB] Retrieved', paths.length, 'file paths');
          resolve(paths);
        };

        request.onerror = () => {
          const error = request.error || new Error('getAllKeys operation failed');
          console.error('[LocalFileIndexedDB] Error getting all keys:', error);
          reject(error);
        };
      } catch (error) {
        console.error('[LocalFileIndexedDB] Exception during getAllKeys:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('[LocalFileIndexedDB] Failed to get all file paths:', error);
    throw error;
  }
};

/**
 * Closes the database connection.
 * Should be called when the application is shutting down.
 */
export const closeDatabase = (): void => {
  if (dbInstance) {
    console.log('[LocalFileIndexedDB] Closing database connection');
    dbInstance.close();
    dbInstance = null;
  }
};