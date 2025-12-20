// @flow

import VersionMetadata from '../Version/VersionMetadata';
// Import the worker (handled by worker-loader)
import SerializerWorker from './Serializer.worker';

const gd: libGDevelop = global.gd;

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
  const startTime = Date.now();
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  const serializeToTime = Date.now();
  console.log(
    '[Main thread] serializeTo done in: ',
    serializeToTime - startTime,
    'ms'
  );

  // JSON.parse + toJSON is 30% faster than gd.Serializer.toJSObject.
  const toJSONStartTime = Date.now();
  const json = gd.Serializer.toJSON(serializedElement);
  const toJSONTime = Date.now();
  console.log(
    '[Main thread] toJSON done in: ',
    toJSONTime - toJSONStartTime,
    'ms'
  );

  try {
    const object = JSON.parse(json);
    const parseTime = Date.now();
    console.log('[Main thread] parse done in: ', parseTime - toJSONTime, 'ms');

    serializedElement.delete();
    console.log(
      '[Main thread] serializeToJSObject done in: ',
      Date.now() - startTime,
      'ms'
    );
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
  const startTime = Date.now();
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  const serializeToTime = Date.now();
  console.log(
    '[Main thread] serializeTo done in: ',
    serializeToTime - startTime,
    'ms'
  );

  // toJSON is 20% faster than gd.Serializer.toJSObject + JSON.stringify.
  const json = gd.Serializer.toJSON(serializedElement);
  serializedElement.delete();
  const toJSONTime = Date.now();
  console.log(
    '[Main thread] toJSON done in: ',
    toJSONTime - serializeToTime,
    'ms'
  );

  return json;
}

type SerializerWorkerOutMessage =
  | {| type: 'serialized', object: any |}
  | {| type: 'error', message: string |};

let serializerWorker: ?Worker = null;

const getOrCreateSerializerWorker = (): Worker => {
  if (!serializerWorker) {
    // $FlowExpectedError - worker-loader types aren't recognized by Flow
    serializerWorker = new SerializerWorker();
  }

  return serializerWorker;
};

export function terminateSerializerWorkerForTests() {
  if (serializerWorker) {
    serializerWorker.terminate();
    serializerWorker = null;
  }
}

/**
 * Serialize a gdSerializable into a JS object while keeping the slowest parts
 * off the main thread.
 */
export async function serializeToJSObjectInBackground(
  serializable: gdSerializable,
  methodName: string = 'serializeTo'
): Promise<any> {
  const startTime = Date.now();
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  const serializeToTime = Date.now();
  console.log(
    '[Main thread] serializeTo done in: ',
    serializeToTime - startTime,
    'ms'
  );

  // Allocate space for the output size in WASM heap.
  // $FlowExpectedError - accessing emscripten memory helpers.
  const sizePtr = gd._malloc(4);
  if (!sizePtr) {
    serializedElement.delete();
    throw new Error('Failed to allocate memory for serialization size.');
  }

  let binaryPtr = 0;
  try {
    // $FlowExpectedError - accessing emscripten exports.
    binaryPtr = gd._createBinarySnapshot(serializedElement.ptr, sizePtr);
    if (!binaryPtr) {
      throw new Error('Failed to create binary snapshot.');
    }

    const createBinarySnapshotTime = Date.now();
    console.log(
      '[Main thread] createBinarySnapshot done in: ',
      createBinarySnapshotTime - serializeToTime,
      'ms'
    );

    // $FlowExpectedError - accessing emscripten memory helpers.
    const binarySize = gd.HEAPU32[sizePtr >> 2];
    // $FlowExpectedError - accessing emscripten memory helpers.
    const binaryView = new Uint8Array(gd.HEAPU8.buffer, binaryPtr, binarySize);
    // Copy the buffer out of the WASM heap so it can be transferred.
    const binaryBuffer = binaryView.slice();

    const binaryBufferTime = Date.now();
    console.log(
      '[Main thread] BinaryBuffer copied/prepared in: ',
      binaryBufferTime - createBinarySnapshotTime,
      'ms'
    );

    const worker = getOrCreateSerializerWorker();
    const cacheBuster = VersionMetadata.versionWithHash;

    const workerPromiseStartTime = Date.now();
    const object = await new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent) => {
        const data: SerializerWorkerOutMessage = event.data;
        if (data.type === 'serialized') {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          resolve(data.object);
        } else if (data.type === 'error') {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          reject(new Error(data.message));
        }
      };

      const handleError = (error: any) => {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        reject(error);
      };

      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', handleError);
      worker.postMessage(
        {
          type: 'serialize',
          binary: binaryBuffer,
          cacheBuster,
        },
        [binaryBuffer.buffer]
      );
      console.log(
        '[Main thread] main thread work done in: ',
        Date.now() - startTime,
        'ms'
      );
    });

    const workerPromiseTime = Date.now();
    console.log(
      '[Main thread] The worker promise (doing JSON serialization from the binary buffer) returned in: ',
      workerPromiseTime - workerPromiseStartTime,
      'ms'
    );

    return object;
  } finally {
    if (binaryPtr) {
      // $FlowExpectedError - accessing emscripten exports.
      gd._freeBinarySnapshot(binaryPtr);
    }
    // $FlowExpectedError - accessing emscripten exports.
    gd._free(sizePtr);
    serializedElement.delete();
  }
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
