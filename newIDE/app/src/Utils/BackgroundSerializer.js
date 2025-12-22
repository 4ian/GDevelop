// @flow

import VersionMetadata from '../Version/VersionMetadata';
// Import the worker (handled by worker-loader)
import BackgroundSerializerWorker from './BackgroundSerializer.worker';

const gd: libGDevelop = global.gd;

type BackgroundSerializerWorkerOutMessage =
  | {| type: 'DONE', requestId: number, result: any |}
  | {| type: 'ERROR', requestId: number, message: string |};

let serializerWorker: ?Worker = null;
let nextRequestId = 1;
const pendingRequests: Map<
  number,
  { resolve: (result: any) => void, reject: (error: Error) => void }
> = new Map();

const log = (message: string) => {
  console.log(`[BackgroundSerializer] ${message}`);
};

const getOrCreateBackgroundSerializerWorker = (): Worker => {
  if (serializerWorker) {
    return serializerWorker;
  }

  // $FlowExpectedError - worker-loader types aren't recognized by Flow
  serializerWorker = new BackgroundSerializerWorker();

  // Set up message handler
  serializerWorker.onmessage = (event: MessageEvent) => {
    const data: BackgroundSerializerWorkerOutMessage = (event.data: any);

    const pending = pendingRequests.get(data.requestId);
    if (!pending) {
      console.warn(
        `[BackgroundSerializer] Received message for unknown request ID #${
          data.requestId
        }.`
      );
      return;
    }

    if (data.type === 'DONE') {
      pending.resolve(data.result);
      return;
    }
    pending.reject(new Error(data.message || 'Unknown error'));
  };

  serializerWorker.onerror = error => {
    console.error('[BackgroundSerializer] Worker sent an error.', error);
  };

  return serializerWorker;
};

const sendMessageToBackgroundSerializerWorker = (message: {|
  type: 'SERIALIZE_TO_JSON' | 'SERIALIZE_TO_JS_OBJECT',
  binary: Uint8Array,
  versionWithHash: string,
|}) => {
  const worker = getOrCreateBackgroundSerializerWorker();

  return new Promise((resolve, reject) => {
    const requestId = nextRequestId++;
    pendingRequests.set(requestId, { resolve, reject });
    worker.postMessage({ ...message, requestId });
  });
};

export async function serializeInBackground(
  type: 'SERIALIZE_TO_JSON' | 'SERIALIZE_TO_JS_OBJECT',
  serializable: gdSerializable
): Promise<any> {
  const startTime = Date.now();
  const serializedElement = new gd.SerializerElement();
  serializable.serializeTo(serializedElement);

  const serializeToEndTime = Date.now();

  let binaryPtr = 0;
  try {
    binaryPtr = gd.BinarySerializer.createBinarySnapshot(serializedElement);
    if (!binaryPtr) {
      throw new Error('Failed to create binary snapshot.');
    }

    const binarySize = gd.BinarySerializer.getLastBinarySnapshotSize();
    const binaryView = new Uint8Array(gd.HEAPU8.buffer, binaryPtr, binarySize);
    // Copy the buffer out of the WASM heap so it can be transferred.
    const binaryBuffer = binaryView.slice();

    const binaryBufferEndTime = Date.now();
    log(
      `Spent ${binaryBufferEndTime - startTime}ms on main thread (including ${serializeToEndTime - startTime}ms for SerializerElement serialization and ${binaryBufferEndTime - serializeToEndTime}ms for BinaryBuffer preparation).`
    );

    const result = await sendMessageToBackgroundSerializerWorker({
      type,
      binary: binaryBuffer,
      versionWithHash: VersionMetadata.versionWithHash,
    });

    const workerPromiseEndTime = Date.now();
    log(
      `The worker returned in ${workerPromiseEndTime - binaryBufferEndTime}ms.`
    );

    return result;
  } finally {
    if (binaryPtr) {
      gd.BinarySerializer.freeBinarySnapshot(binaryPtr);
    }
    serializedElement.delete();
  }
}

export const serializeToJSONInBackground = async (
  serializable: gdSerializable
): Promise<string> => {
  return serializeInBackground('SERIALIZE_TO_JSON', serializable);
};

export const serializeToJSObjectInBackground = async (
  serializable: gdSerializable
): Promise<Object> => {
  return serializeInBackground('SERIALIZE_TO_JS_OBJECT', serializable);
};
