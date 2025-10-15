// @flow

// If updated, also update the service worker template.
const DB_NAME = 'gdevelop-browser-sw-preview';
const STORE_NAME = 'files';
const DB_VERSION = 1;

type FileRecord = {|
  bytes: ArrayBuffer,
  contentType: string,
|};

let dbInstance: ?IDBDatabase = null;

/**
 * Gets the base URL for browser service worker previews.
 * This URL should be handled by the service worker to serve files from IndexedDB.
 */
export const getBrowserSWPreviewBaseUrl = (): string => {
  // Use the current origin to ensure the service worker can intercept requests
  const origin = window.location.origin;
  return `${origin}/browser_sw_preview`;
};

/**
 * Opens or returns the existing IndexedDB database connection.
 * Handles database upgrades and version management.
 */
const openBrowserSWPreviewIndexedDB = (): Promise<IDBDatabase> => {
  if (dbInstance && dbInstance.version === DB_VERSION) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    try {
      // $FlowFixMe - indexedDB is available in all browsers
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        const error = request.error || new Error('Failed to open IndexedDB');
        console.error('[BrowserSWIndexedDB] Error opening database:', error);
        reject(error);
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        console.log('[BrowserSWIndexedDB] Database opened successfully');

        // Handle unexpected close
        dbInstance.onclose = () => {
          console.warn(
            '[BrowserSWIndexedDB] Database connection closed unexpectedly'
          );
          dbInstance = null;
        };

        // Handle version change (e.g., if another tab upgrades the DB)
        dbInstance.onversionchange = () => {
          console.warn(
            '[BrowserSWIndexedDB] Database version changed, closing connection'
          );
          if (dbInstance) {
            dbInstance.close();
            dbInstance = null;
          }
        };

        resolve(dbInstance);
      };

      request.onupgradeneeded = event => {
        console.log('[BrowserSWIndexedDB] Upgrading database schema...');
        const db = request.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
          console.log('[BrowserSWIndexedDB] Created object store:', STORE_NAME);
        }
      };

      request.onblocked = () => {
        console.warn(
          '[BrowserSWIndexedDB] Database upgrade blocked by another connection'
        );
        reject(
          new Error(
            'Database upgrade blocked. Please close other tabs using this application.'
          )
        );
      };
    } catch (error) {
      console.error(
        '[BrowserSWIndexedDB] Exception while opening database:',
        error
      );
      reject(error);
    }
  });
};

/**
 * Stores a "file" in IndexedDB.
 */
export const putFile = async (
  path: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<void> => {
  try {
    const db = await openBrowserSWPreviewIndexedDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');

        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error(
            '[BrowserSWIndexedDB] Transaction error while putting file:',
            path,
            error
          );
          reject(error);
        };

        transaction.oncomplete = () => {
          resolve();
        };

        // TODO: add onabort?

        const objectStore = transaction.objectStore(STORE_NAME);
        const record: FileRecord = { bytes, contentType };

        const request = objectStore.put(record, path);

        request.onerror = () => {
          const error = request.error || new Error('Put operation failed');
          console.error(
            '[BrowserSWIndexedDB] Error storing file:',
            path,
            error
          );
          reject(error);
        };
      } catch (error) {
        console.error(
          '[BrowserSWIndexedDB] Exception during put operation:',
          path,
          error
        );
        reject(error);
      }
    });
  } catch (error) {
    console.error('[BrowserSWIndexedDB] Failed to put file:', path, error);
    throw error;
  }
};

/**
 * Deletes all "files" stored in IndexedDB with a given path prefix.
 *
 * @param pathPrefix - The path prefix to match.
 */
export const deleteFilesWithPrefix = async (
  pathPrefix: string
): Promise<number> => {
  try {
    const db = await openBrowserSWPreviewIndexedDB();

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        let deletedCount = 0;

        transaction.onerror = () => {
          const error = transaction.error || new Error('Transaction failed');
          console.error(
            '[BrowserSWIndexedDB] Transaction error while deleting files with prefix:',
            pathPrefix,
            error
          );
          reject(error);
        };

        transaction.oncomplete = () => {
          resolve(deletedCount);
        };

        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.openCursor();

        request.onsuccess = event => {
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
          console.error(
            '[BrowserSWIndexedDB] Error during cursor operation:',
            error
          );
          reject(error);
        };
      } catch (error) {
        console.error(
          '[BrowserSWIndexedDB] Exception during delete with prefix:',
          pathPrefix,
          error
        );
        reject(error);
      }
    });
  } catch (error) {
    console.error(
      '[BrowserSWIndexedDB] Failed to delete files with prefix:',
      pathPrefix,
      error
    );
    throw error;
  }
};
