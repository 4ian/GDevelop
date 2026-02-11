/* eslint-env worker */
// @flow

let modulePromise /*: ?Promise<libGDevelop>*/ = null;

const log = (message /*: string */) => {
  console.log(`[BackgroundSerializerWorker] ${message}`);
};

const getLibGDevelop = (versionWithHash /*: string */) => {
  if (modulePromise) return modulePromise;

  modulePromise = new Promise((resolve, reject) => {
    try {
      const url = `/libGD.js?cache-buster=${versionWithHash}`;
      // Load libGD.js in the worker context.
      // eslint-disable-next-line no-undef
      importScripts(url);

      // eslint-disable-next-line no-undef
      // $FlowFixMe
      if (typeof initializeGDevelopJs !== 'function') {
        reject(new Error('Missing initializeGDevelopJs in worker'));
        return;
      }

      // eslint-disable-next-line no-undef
      initializeGDevelopJs({
        // Override the resolved URL for the .wasm file,
        // to ensure a new version is fetched when the version changes.
        locateFile: (path /*: string */, prefix /*: string */) => {
          // This function is called by Emscripten to locate the .wasm file only.
          // As the wasm is at the root of the public folder, we can just return
          // the path to the file.
          // Plus, on Electron, the prefix seems to be pointing to the root of the
          // app.asar archive, which is completely wrong.
          return path + `?cache-buster=${versionWithHash}`;
        },
      })
        .then(module => {
          resolve(module);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
      return;
    }
  });

  return modulePromise;
};

const unserializeBinarySnapshotToJson = (
  gd /*: libGDevelop */,
  binary /*: Uint8Array */
) => {
  const binaryArray =
    binary instanceof Uint8Array ? binary : new Uint8Array(binary);
  const binarySize = binaryArray.byteLength || binaryArray.length;

  // Allocate memory in Emscripten heap and copy binary data
  const binaryPtr = gd._malloc(binarySize);
  gd.HEAPU8.set(binaryArray, binaryPtr);

  const element = gd.BinarySerializer.deserializeBinarySnapshot(
    binaryPtr,
    binarySize
  );

  // Free the input buffer
  gd._free(binaryPtr);

  if (element.ptr === 0) {
    throw new Error('Failed to deserialize binary snapshot.');
  }

  const json = gd.Serializer.toJSON(element);
  element.delete();
  return json;
};

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (event /*: MessageEvent */) => {
  // $FlowExpectedError
  const { type, binary, requestId, versionWithHash } = event.data || {};

  const startTime = Date.now();

  log(`Request #${requestId} received (${type}).`);
  if (type !== 'SERIALIZE_TO_JSON' && type !== 'SERIALIZE_TO_JS_OBJECT') return;

  try {
    const gd = await getLibGDevelop(versionWithHash);

    const json = unserializeBinarySnapshotToJson(gd, binary);
    const result = type === 'SERIALIZE_TO_JSON' ? json : JSON.parse(json);

    log(`Request #${requestId} done in ${Date.now() - startTime}ms.`);

    // eslint-disable-next-line no-restricted-globals
    self.postMessage({
      type: 'DONE',
      result,
      requestId,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    // eslint-disable-next-line no-restricted-globals
    self.postMessage({
      type: 'ERROR',
      requestId,
      message: error.message,
    });
  }
};
