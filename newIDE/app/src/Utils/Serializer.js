// @flow

const gd: libGDevelop = global.gd;

// Worker message types - must match SerializerWorker.worker.js
const MESSAGE_TYPES = {
  INIT: 'INIT',
  INIT_COMPLETE: 'INIT_COMPLETE',
  INIT_ERROR: 'INIT_ERROR',
  SERIALIZE: 'SERIALIZE',
  SERIALIZE_COMPLETE: 'SERIALIZE_COMPLETE',
  SERIALIZE_ERROR: 'SERIALIZE_ERROR',
};

// Singleton worker instance
let serializerWorker: Worker | null = null;
let workerInitPromise: Promise<void> | null = null;
let requestIdCounter = 0;
const pendingRequests: Map<
  number,
  { resolve: (result: Object) => void, reject: (error: Error) => void }
> = new Map();

/**
 * Get or create the serializer worker.
 * The worker is created lazily on first use.
 */
const getSerializerWorker = (): Worker => {
  if (!serializerWorker) {
    // Create worker using webpack worker-loader syntax
    // $FlowFixMe - worker-loader syntax not understood by Flow
    serializerWorker = new Worker(
      new URL('./SerializerWorker.worker.js', import.meta.url)
    );

    // Set up message handler
    serializerWorker.onmessage = (event: MessageEvent) => {
      const data = (event.data: any);

      switch (data.type) {
        case MESSAGE_TYPES.INIT_COMPLETE:
          // Handled by initWorker promise
          break;

        case MESSAGE_TYPES.INIT_ERROR:
          console.error('[Serializer] Worker initialization failed:', data.error);
          break;

        case MESSAGE_TYPES.SERIALIZE_COMPLETE: {
          const pending = pendingRequests.get(data.requestId);
          if (pending) {
            pendingRequests.delete(data.requestId);
            pending.resolve(data.object);
          }
          break;
        }

        case MESSAGE_TYPES.SERIALIZE_ERROR: {
          const pending = pendingRequests.get(data.requestId);
          if (pending) {
            pendingRequests.delete(data.requestId);
            pending.reject(new Error(data.error));
          }
          break;
        }

        default:
          console.warn('[Serializer] Unknown message from worker:', data.type);
      }
    };

    serializerWorker.onerror = (error: ErrorEvent) => {
      console.error('[Serializer] Worker error:', error);
    };
  }

  return serializerWorker;
};

/**
 * Initialize the serializer worker with libGD.
 * This is called automatically before the first async serialization.
 */
const initSerializerWorker = async (): Promise<void> => {
  if (workerInitPromise) {
    return workerInitPromise;
  }

  const worker = getSerializerWorker();

  workerInitPromise = new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const data = (event.data: any);
      if (data.type === MESSAGE_TYPES.INIT_COMPLETE) {
        worker.removeEventListener('message', handleMessage);
        resolve();
      } else if (data.type === MESSAGE_TYPES.INIT_ERROR) {
        worker.removeEventListener('message', handleMessage);
        reject(new Error(data.error));
      }
    };

    worker.addEventListener('message', handleMessage);

    // Determine the path to libGD.js
    // In production, it's typically at the root; in dev, it might be elsewhere
    const gdevelopJsPath =
      typeof window !== 'undefined' && window.libGDevelopJsPath
        ? window.libGDevelopJsPath
        : './libGD.js';

    worker.postMessage({
      type: MESSAGE_TYPES.INIT,
      gdevelopJsPath,
      gdevelopJsInitPath: gdevelopJsPath,
    });
  });

  return workerInitPromise;
};

/**
 * Tool function to save a serializable object to a JS object.
 * Most gd.* objects are "serializable", meaning they have a serializeTo
 * and unserializeFrom method.
 *
 * @param {*} serializable
 * @param {*} methodName The name of the serialization method. "serializeTo" by default
 */
export function serializeToJSObject(
  serializable: gdSerializable,
  methodName: string = 'serializeTo'
) {
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);

  // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
  const json = gd.Serializer.toJSON(serializedElement);
  try {
    const object = JSON.parse(json);

    serializedElement.delete();
    return object;
  } catch (error) {
    serializedElement.delete();
    console.error(
      'Invalid JSON when serializing to JS object. toJSON should always return a valid JSON string.',
      { json, error }
    );
    throw error;
  }
}

/**
 * Asynchronously serialize a serializable object to a JS object using a web worker.
 *
 * This function moves the expensive JSON conversion to a background worker,
 * reducing main thread blocking from ~350ms to ~120ms for large projects.
 *
 * The serialization process:
 * 1. Main thread: Build SerializerElement tree (fast, <100ms)
 * 2. Main thread: Create binary snapshot (fast, ~20-40ms)
 * 3. Worker: Deserialize binary + toJSON + JSON.parse (slow, ~270ms, but off main thread)
 *
 * @param serializable The object to serialize
 * @param methodName The name of the serialization method. "serializeTo" by default
 * @returns Promise that resolves to the serialized JS object
 */
export async function serializeToJSObjectAsync(
  serializable: gdSerializable,
  methodName: string = 'serializeTo'
): Promise<Object> {
  // Check if gd.createBinarySnapshot is available
  if (typeof gd.createBinarySnapshot !== 'function') {
    console.warn(
      '[Serializer] Binary snapshot not available, falling back to sync serialization'
    );
    return serializeToJSObject(serializable, methodName);
  }

  // Step 1: Build SerializerElement tree (fast, on main thread)
  const serializedElement = new gd.SerializerElement();
  try {
    serializable[methodName](serializedElement);
  } catch (error) {
    serializedElement.delete();
    throw error;
  }

  // Step 2: Create binary snapshot (fast, mostly memcpy)
  let binaryBuffer: Uint8Array;
  try {
    binaryBuffer = gd.createBinarySnapshot(serializedElement);
  } catch (error) {
    serializedElement.delete();
    throw error;
  }

  // Clean up the SerializerElement on main thread - we have the binary snapshot now
  serializedElement.delete();

  // Step 3: Initialize worker if needed
  try {
    await initSerializerWorker();
  } catch (error) {
    console.warn(
      '[Serializer] Worker initialization failed, falling back to sync:',
      error
    );
    // Fall back to synchronous serialization using the binary buffer
    const element = gd.deserializeBinarySnapshot(binaryBuffer);
    try {
      const json = gd.Serializer.toJSON(element);
      return JSON.parse(json);
    } finally {
      element.delete();
    }
  }

  // Step 4: Send to worker for JSON conversion
  const worker = getSerializerWorker();
  const requestId = ++requestIdCounter;

  return new Promise((resolve, reject) => {
    pendingRequests.set(requestId, { resolve, reject });

    // Transfer the buffer to the worker (zero-copy)
    worker.postMessage(
      {
        type: MESSAGE_TYPES.SERIALIZE,
        requestId,
        binaryBuffer,
      },
      [binaryBuffer.buffer]
    );
  });
}

/**
 * Terminate the serializer worker and clean up resources.
 * Call this when the application is shutting down or when you want to
 * force the worker to be recreated on next use.
 */
export function terminateSerializerWorker(): void {
  if (serializerWorker) {
    serializerWorker.terminate();
    serializerWorker = null;
    workerInitPromise = null;

    // Reject any pending requests
    pendingRequests.forEach(({ reject }) => {
      reject(new Error('Worker terminated'));
    });
    pendingRequests.clear();
  }
}

export function serializeObjectWithCleanDefaultBehaviorFlags(object: gdObject) {
  const serializedElement = new gd.SerializerElement();
  gd.BehaviorDefaultFlagClearer.serializeObjectWithCleanDefaultBehaviorFlags(
    object,
    serializedElement
  );

  // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
  const json = gd.Serializer.toJSON(serializedElement);
  try {
    const object = JSON.parse(json);

    serializedElement.delete();
    return object;
  } catch (error) {
    serializedElement.delete();
    console.error(
      'Invalid JSON when serializing to JS object. toJSON should always return a valid JSON string.',
      { json, error }
    );
    throw error;
  }
}

export function serializeToObjectAsset(
  project: gdProject,
  object: gdObject,
  objectFullName: string,
  usedResourceNames: Array<string>
) {
  const usedResourceNamesVector = new gd.VectorString();
  const serializedElement = new gd.SerializerElement();
  gd.ObjectAssetSerializer.serializeTo(
    project,
    object,
    objectFullName,
    serializedElement,
    usedResourceNamesVector
  );
  usedResourceNames.push.apply(
    usedResourceNames,
    usedResourceNamesVector.toJSArray()
  );
  usedResourceNamesVector.delete();

  // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
  const objectAsset = JSON.parse(gd.Serializer.toJSON(serializedElement));
  serializedElement.delete();

  return objectAsset;
}

/**
 * Tool function to save a serializable object to a JSON.
 * Most gd.* objects are "serializable", meaning they have a serializeTo
 * and unserializeFrom method.
 *
 * @param {*} serializable
 * @param {*} methodName The name of the serialization method. "unserializeFrom" by default
 */
export function serializeToJSON(
  serializable: gdSerializable,
  methodName: string = 'serializeTo'
): string {
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);

  // toJSON is 20% faster than gd.Serializer.toJSObject + JSON.stringify.
  const json = gd.Serializer.toJSON(serializedElement);
  serializedElement.delete();

  return json;
}

/**
 * Tool function to restore a serializable object from a JS object.
 * Most gd.* objects are "serializable", meaning they have a serializeTo
 * and unserializeFrom method.
 * @param {*} serializable A gd.* object to restore
 * @param {*} object The JS object to be used to restore the serializable.
 * @param {*} methodName The name of the unserialization method. "unserializeFrom" by default
 * @param {*} optionalProject The project to pass as argument for unserialization
 */
export function unserializeFromJSObject(
  serializable: gdSerializable,
  object: Object,
  methodName: string = 'unserializeFrom',
  optionalProject: ?gdProject = undefined
) {
  const serializedElement = gd.Serializer.fromJSObject(object);
  if (!optionalProject) {
    serializable[methodName](serializedElement);
  } else {
    // It's not uncommon for unserializeFrom methods of gd.* classes
    // to require the project to be passed as first argument.
    serializable[methodName](optionalProject, serializedElement);
  }
  serializedElement.delete();
}
