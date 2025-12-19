/* eslint-env worker */
// @flow
/**
 * Web Worker for background JSON serialization.
 *
 * This worker receives a binary snapshot of a SerializerElement tree,
 * deserializes it, converts it to JSON, and returns the parsed JS object.
 *
 * The heavy work (toJSON + JSON.parse) happens in this worker,
 * keeping the main thread responsive.
 */

// Worker message types
const MESSAGE_TYPES = {
  INIT: 'INIT',
  INIT_COMPLETE: 'INIT_COMPLETE',
  INIT_ERROR: 'INIT_ERROR',
  SERIALIZE: 'SERIALIZE',
  SERIALIZE_COMPLETE: 'SERIALIZE_COMPLETE',
  SERIALIZE_ERROR: 'SERIALIZE_ERROR',
};

let gd = null;
let initPromise = null;

/**
 * Initialize libGD in the worker.
 * This needs to be called before any serialization can happen.
 */
const initializeGD = async (
  gdevelopJsInitPath /*: string */,
  gdevelopJsPath /*: string */
) => {
  if (gd) return gd;

  try {
    // Dynamic import of the initialization function
    // The paths are provided by the main thread to handle different environments
    importScripts(gdevelopJsPath);

    // initializeGDevelopJs is the global function defined by the WASM module
    // @ts-ignore - initializeGDevelopJs is defined by the imported script
    const initializeGDevelopJs = self.initializeGDevelopJs;
    if (!initializeGDevelopJs) {
      throw new Error('initializeGDevelopJs not found after importing script');
    }

    gd = await initializeGDevelopJs();
    return gd;
  } catch (error) {
    console.error('[SerializerWorker] Failed to initialize libGD:', error);
    throw error;
  }
};

/**
 * Deserialize binary snapshot and convert to JSON.
 */
const deserializeAndConvertToJSON = (
  binaryBuffer /*: Uint8Array */
) /*: Object */ => {
  if (!gd) {
    throw new Error('libGD not initialized');
  }

  // Deserialize the binary snapshot back to a SerializerElement
  const element = gd.deserializeBinarySnapshot(binaryBuffer);

  try {
    // Convert to JSON string (this is the slow part we moved to the worker)
    const json = gd.Serializer.toJSON(element);

    // Parse JSON to JS object
    const object = JSON.parse(json);

    return object;
  } finally {
    // Always clean up the element
    element.delete();
  }
};

// Handle messages from the main thread
// eslint-disable-next-line no-restricted-globals
self.onmessage = async (event /*: MessageEvent */) => {
  const { type } = event.data;

  try {
    switch (type) {
      case MESSAGE_TYPES.INIT: {
        const { gdevelopJsInitPath, gdevelopJsPath } = event.data;

        if (!initPromise) {
          initPromise = initializeGD(gdevelopJsInitPath, gdevelopJsPath);
        }

        await initPromise;

        // eslint-disable-next-line no-restricted-globals
        self.postMessage({
          type: MESSAGE_TYPES.INIT_COMPLETE,
        });
        break;
      }

      case MESSAGE_TYPES.SERIALIZE: {
        const { requestId, binaryBuffer } = event.data;

        if (!gd) {
          throw new Error('Worker not initialized. Call INIT first.');
        }

        const object = deserializeAndConvertToJSON(binaryBuffer);

        // eslint-disable-next-line no-restricted-globals
        self.postMessage({
          type: MESSAGE_TYPES.SERIALIZE_COMPLETE,
          requestId,
          object,
        });
        break;
      }

      default:
        console.warn('[SerializerWorker] Unknown message type:', type);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // eslint-disable-next-line no-restricted-globals
    self.postMessage({
      type:
        event.data.type === MESSAGE_TYPES.INIT
          ? MESSAGE_TYPES.INIT_ERROR
          : MESSAGE_TYPES.SERIALIZE_ERROR,
      requestId: event.data.requestId,
      error: errorMessage,
    });
  }
};

// Required for Create React App to correctly bundle this worker
// eslint-disable-next-line import/no-anonymous-default-export
export default {};
