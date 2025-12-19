// @flow

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

// Worker management
let serializerWorker: Worker | null = null;

function getOrCreateSerializerWorker(): Worker {
  if (!serializerWorker) {
    serializerWorker = new Worker('serializer-worker.js');
  }
  return serializerWorker;
}

export async function serializeToJSObjectInBackground(
  serializable: gdSerializable,
  methodName: string = 'serializeTo'
) {
  // console.log('Background serialization started');
  // const startTime = Date.now();
  
  // Step 1: Build SerializerElement tree (fast, on main thread)
  const serializedElement = new gd.SerializerElement();
  serializable[methodName](serializedElement);
  // const serializationTime = Date.now();
  // console.log('serializeTo took', serializationTime - startTime, 'ms');
  
  if (!gd._createBinarySnapshot) {
    console.warn("Background serialization not supported (missing _createBinarySnapshot). Falling back to sync serialization.");
    const json = gd.Serializer.toJSON(serializedElement);
    try {
      const object = JSON.parse(json);
      serializedElement.delete();
      return object;
    } catch (error) {
      serializedElement.delete();
      throw error;
    }
  }

  try {
    // Step 2: Create binary snapshot
    const sizePtr = gd._malloc(4);
    // Note: serializedElement.ptr should be the raw pointer. 
    // If it's not available, we might need a workaround, but Emscripten usually exposes it.
    // However, for opaque objects, we might need `getPointer()`.
    // Let's assume `ptr` property works as it is standard in Emscripten bindings.
    // If not, we might need to cast or use a helper.
    const elementPtr = serializedElement.ptr; 
    
    const binaryPtr = gd._createBinarySnapshot(
      elementPtr, 
      sizePtr
    );
    const binarySize = gd.HEAPU32[sizePtr >> 2];
    // const snapshotTime = Date.now();
    // console.log('Binary snapshot took', snapshotTime - serializationTime, 'ms');
    
    // Step 3: Copy to transferable buffer
    const binaryBuffer = new Uint8Array(
      gd.HEAPU8.buffer,
      binaryPtr,
      binarySize
    ).slice(); // Create copy outside WASM heap
    
    // const copyTime = Date.now();
    // console.log('Buffer copy took', copyTime - snapshotTime, 'ms');
    
    // Cleanup main thread
    gd._freeBinarySnapshot(binaryPtr);
    gd._free(sizePtr);
    serializedElement.delete();
    
    // Step 4: Send to worker
    const object = await new Promise((resolve, reject) => {
      const worker = getOrCreateSerializerWorker();
      
      const messageHandler = (e) => {
        if (e.data.type === 'serialized') {
          worker.removeEventListener('message', messageHandler);
          resolve(e.data.object);
        } else if (e.data.type === 'error') {
          worker.removeEventListener('message', messageHandler);
          reject(new Error(e.data.message));
        }
      };
      
      worker.addEventListener('message', messageHandler);
      worker.postMessage({
        type: 'serialize',
        binary: binaryBuffer
      }, [binaryBuffer.buffer]); // Transfer ownership
    });
    
    // const totalTime = Date.now();
    // console.log('Total background serialization:', totalTime - startTime, 'ms');
    
    return object;
  } catch (err) {
    console.error("Error in background serialization:", err);
    throw err;
  }
}
