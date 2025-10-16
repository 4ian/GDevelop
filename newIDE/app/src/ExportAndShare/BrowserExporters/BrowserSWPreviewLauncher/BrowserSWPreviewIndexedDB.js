// @flow

// If updated, also update the service worker template.
const DB_NAME = 'gdevelop-browser-sw-preview';
const STORE_NAME = 'files';
const INSTANCES_STORE_NAME = 'instances';
const DB_VERSION = 2;

const INSTANCE_CLEANUP_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours.
const INSTANCE_HEARTBEAT_INTERVAL_MS = 60 * 1000; // 1 minute.

type FileRecord = {|
  bytes: ArrayBuffer,
  contentType: string,
|};

let dbInstance: ?IDBDatabase = null;
let currentInstanceId: ?string = null;
let initializationPromise: ?Promise<void> = null;
let heartbeatIntervalId: ?IntervalID = null;

const requestToPromise = (request: IDBRequest): Promise<any> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      const error = request.error || new Error('Request failed');
      reject(error);
    };
  });
};

const transactionToPromise = (transaction: IDBTransaction): Promise<void> => {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      const error = transaction.error || new Error('Transaction failed');
      reject(error);
    };
    transaction.onabort = () => {
      const error = transaction.error || new Error('Transaction aborted');
      reject(error);
    };
  });
};

export const getBrowserSWPreviewRootUrl = (): string => {
  const origin = window.location.origin;
  return `${origin}/browser_sw_preview`;
};

/**
 * Gets the base URL for browser service worker previews.
 * This URL should be handled by the service worker to serve files from IndexedDB.
 */
export const getBrowserSWPreviewBaseUrl = (): string => {
  if (!currentInstanceId) {
    throw new Error(
      'Browser SW preview instance not initialised. Call ensureBrowserSWPreviewSession() first.'
    );
  }

  return `${getBrowserSWPreviewRootUrl()}/${currentInstanceId}`;
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

      request.onupgradeneeded = _event => {
        console.log('[BrowserSWIndexedDB] Upgrading database schema...');
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
          console.log('[BrowserSWIndexedDB] Created object store:', STORE_NAME);
        }

        if (!db.objectStoreNames.contains(INSTANCES_STORE_NAME)) {
          db.createObjectStore(INSTANCES_STORE_NAME);
          console.log(
            '[BrowserSWIndexedDB] Created object store:',
            INSTANCES_STORE_NAME
          );
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

        transaction.onabort = () => {
          const error = transaction.error || new Error('Transaction aborted');
          console.error(
            '[BrowserSWIndexedDB] Transaction aborted while putting file:',
            path,
            error
          );
          reject(error);
        };

        transaction.oncomplete = () => {
          resolve();
        };

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

const findUnusedInstanceId = (usedIds: Array<number>): number => {
  const usedIdsSet = new Set(usedIds);
  let candidate = 1;

  while (usedIdsSet.has(candidate)) {
    candidate++;
  }

  return candidate;
};

const acquireInstanceIdAndCleanup = async (
  cleanInstanceRelatedFiles: (instanceId: string) => Promise<void>
) => {
  const db = await openBrowserSWPreviewIndexedDB();
  const now = Date.now();
  const expiredInstanceIds: Array<string> = [];
  let acquiredInstanceId: ?string = null;

  // First transaction: identify expired instances and acquire new ID
  const transaction = db.transaction(INSTANCES_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(INSTANCES_STORE_NAME);

  const [keys, records] = await Promise.all([
    // $FlowFixMe - outdated Flow types.
    requestToPromise(store.getAllKeys()),
    // $FlowFixMe - outdated Flow types.
    requestToPromise(store.getAll()),
  ]);

  const usedIds: Array<number> = [];

  keys.forEach((key, index) => {
    if (typeof key !== 'string') return;
    const record = records[index];
    const lastUsed =
      record && typeof record.lastUsed === 'number' ? record.lastUsed : 0;

    if (now - lastUsed > INSTANCE_CLEANUP_THRESHOLD_MS) {
      expiredInstanceIds.push(key);
      return;
    }

    const parsedId = parseInt(key, 10);
    if (!isNaN(parsedId)) {
      usedIds.push(parsedId);
    }
  });

  const newId = findUnusedInstanceId(usedIds);
  acquiredInstanceId = String(newId);
  store.put({ lastUsed: now }, acquiredInstanceId);

  await transactionToPromise(transaction);

  // Clean up expired instances one by one: only delete instance record if cleanup succeeds
  for (const expiredId of expiredInstanceIds) {
    try {
      console.log(
        `[BrowserSWIndexedDB] Cleaning up expired instance #${expiredId} files...`
      );
      await cleanInstanceRelatedFiles(expiredId);

      // Only delete the instance record if the cleanup succeeds.
      const cleanupTransaction = db.transaction(
        INSTANCES_STORE_NAME,
        'readwrite'
      );
      const cleanupStore = cleanupTransaction.objectStore(INSTANCES_STORE_NAME);
      cleanupStore.delete(expiredId);
      await transactionToPromise(cleanupTransaction);
    } catch (error) {
      console.error(
        '[BrowserSWIndexedDB] Failed to clean up expired instance, keeping instance record:',
        expiredId,
        error
      );
      // Continue with next instance - we still want to clean up what we can
    }
  }

  return acquiredInstanceId;
};

const updateInstanceLastUsed = async (instanceId: string) => {
  try {
    const db = await openBrowserSWPreviewIndexedDB();
    const transaction = db.transaction(INSTANCES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(INSTANCES_STORE_NAME);
    store.put({ lastUsed: Date.now() }, instanceId);
    await transactionToPromise(transaction);
  } catch (error) {
    console.error(
      '[BrowserSWIndexedDB] Failed to update instance heartbeat:',
      instanceId,
      error
    );
  }
};

const startHeartbeat = (instanceId: string) => {
  if (heartbeatIntervalId) {
    clearInterval(heartbeatIntervalId);
  }

  const runHeartbeat = () => {
    updateInstanceLastUsed(instanceId);
  };

  heartbeatIntervalId = setInterval(
    runHeartbeat,
    INSTANCE_HEARTBEAT_INTERVAL_MS
  );
};

export const ensureBrowserSWPreviewSession = async (): Promise<void> => {
  if (currentInstanceId) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  console.info(
    '[BrowserSWIndexedDB] Acquiring a Browser SW preview instance...'
  );
  initializationPromise = (async () => {
    try {
      const acquiredInstanceId = await acquireInstanceIdAndCleanup(
        async (expiredId: string) => {
          await deleteFilesWithPrefix(`/${expiredId}/`);
        }
      );

      if (!acquiredInstanceId) {
        throw new Error(
          'Unable to acquire a Browser SW preview instance identifier'
        );
      }

      console.info(
        `This session is now using the Browser SW preview instance #${acquiredInstanceId}.`
      );
      currentInstanceId = acquiredInstanceId;

      startHeartbeat(acquiredInstanceId);
    } catch (error) {
      currentInstanceId = null;
      console.error(
        '[BrowserSWIndexedDB] Failed to initialise Browser SW preview session:',
        error
      );
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};
