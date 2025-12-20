/* eslint-env worker */
// @flow

let modulePromise /*: ?Promise<any>*/ = null;

const ensureLibGD = (cacheBuster /*: ?string*/) => {
  if (modulePromise) return modulePromise;

  modulePromise = new Promise((resolve, reject) => {
    try {
      const libGDUrl = cacheBuster
        ? `/libGD.js?cache-buster=${cacheBuster}`
        : '/libGD.js';
      // Load libGD.js in the worker context.
      // eslint-disable-next-line no-undef
      importScripts(libGDUrl);

      // eslint-disable-next-line no-undef
      if (typeof initializeGDevelopJs !== 'function') {
        reject(new Error('Missing initializeGDevelopJs in worker'));
        return;
      }

      // eslint-disable-next-line no-undef
      initializeGDevelopJs({
        locateFile: (path /*: string*/) =>
          cacheBuster ? `/${path}?cache-buster=${cacheBuster}` : `/${path}`,
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

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (event /*: MessageEvent*/) => {
  const { type, binary, cacheBuster } = event.data || {};

  if (type !== 'serialize') return;

  // TODO: handle request ids

  try {
    console.log('Serializer worker: serialize started');
    const gd = await ensureLibGD(cacheBuster);
    console.log('Serializer worker: libGD initialized');

    const binaryArray =
      binary instanceof Uint8Array ? binary : new Uint8Array(binary);
    const binarySize = binaryArray.byteLength || binaryArray.length;

    const startTime = Date.now();

    const binaryPtr = gd._malloc(binarySize);
    gd.HEAPU8.set(binaryArray, binaryPtr);

    const elementPtr = gd._deserializeBinarySnapshot(binaryPtr, binarySize);
    if (!elementPtr) {
      gd._free(binaryPtr);
      // eslint-disable-next-line no-restricted-globals
      self.postMessage({
        type: 'error',
        message: 'Failed to deserialize binary snapshot',
      });
      return;
    }

    const element =
      typeof gd.wrapPointer === 'function'
        ? gd.wrapPointer(elementPtr, gd.SerializerElement)
        : new gd.SerializerElement(elementPtr);

    const json = gd.Serializer.toJSON(element);
    const object = JSON.parse(json);

    gd._free(binaryPtr);
    element.delete();

    console.log(
      'Serializer worker: serialize finished in',
      Date.now() - startTime,
      'ms'
    );
    // eslint-disable-next-line no-restricted-globals
    self.postMessage({
      type: 'serialized',
      object,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    // eslint-disable-next-line no-restricted-globals
    self.postMessage({
      type: 'error',
      message: error.message,
    });
  }
};
