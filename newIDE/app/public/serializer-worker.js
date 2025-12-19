// serializer-worker.js
let Module = null;

// Helper to initialize libGD
async function initLibGD() {
  if (typeof initializeGDevelopJs !== 'undefined') {
    return initializeGDevelopJs();
  }
  if (typeof Module !== 'undefined' && Module) {
    return Module;
  }
  // Try importing if not available globally
  try {
    importScripts('libGD.js');
    if (typeof initializeGDevelopJs !== 'undefined') {
      return initializeGDevelopJs();
    }
  } catch (e) {
    console.error('Failed to load libGD.js', e);
  }
  throw new Error('Could not find initializeGDevelopJs');
}

self.addEventListener('message', async (e) => {
  if (e.data.type === 'serialize') {
    try {
      // Initialize WASM module on first use
      if (!Module) {
        // console.log('[Worker] Initializing libGD in worker...');
        Module = await initLibGD();
        // console.log('[Worker] libGD initialized');
      }
      
      const startTime = Date.now();
      
      // Copy binary snapshot into worker's WASM heap
      const binaryData = e.data.binary;
      const binarySize = binaryData.length;
      
      // Allocate memory in WASM heap
      const binaryPtr = Module._malloc(binarySize);
      if (!binaryPtr) throw new Error('Failed to allocate memory in worker');
      
      // Copy data to WASM heap
      Module.HEAPU8.set(binaryData, binaryPtr);
      
      // const copyTime = Date.now();
      // console.log('[Worker] Binary copy took', copyTime - startTime, 'ms');
      
      // Deserialize binary to SerializerElement
      const elementPtr = Module._deserializeBinarySnapshot(binaryPtr, binarySize);
      
      if (!elementPtr) {
        Module._free(binaryPtr);
        self.postMessage({
          type: 'error',
          message: 'Failed to deserialize binary snapshot'
        });
        return;
      }
      
      // const deserializeTime = Date.now();
      // console.log('[Worker] Deserialize took', deserializeTime - copyTime, 'ms');
      
      // Serialize to JSON using C++ helper to avoid JS object wrapping issues
      const jsonPtr = Module._serializeElementToJSON(elementPtr);
      
      // Convert C string to JS string
      let json;
      if (Module.UTF8ToString) {
        json = Module.UTF8ToString(jsonPtr);
      } else {
        // Fallback if UTF8ToString is not exported
        let len = 0;
        while(Module.HEAPU8[jsonPtr + len] !== 0) len++;
        json = new TextDecoder('utf-8').decode(new Uint8Array(Module.HEAPU8.buffer, jsonPtr, len));
      }
      
      // Cleanup
      Module._free(jsonPtr);
      Module._deleteSerializerElement(elementPtr);
      
      // console.log('[Worker] Total time:', parseTime - startTime, 'ms');
      
      // Send result back
      self.postMessage({
        type: 'serialized',
        object: object
      });
      
    } catch (error) {
      console.error('[Worker] Serialization error:', error);
      self.postMessage({
        type: 'error',
        message: error.message
      });
    }
  }
});
