// @flow
import * as React from 'react';
// Import the worker (will be handled by worker-loader)
import Resource3DPreviewWorker from './Resource3DPreview.worker';
import { checkIfCredentialsRequired } from '../../Utils/CrossOrigin';

type WorkerInitMessage = {|
  type: 'INIT',
|};

type WorkerRenderModelMessage = {|
  type: 'RENDER_MODEL',
  resourceUrl: string,
  resourceData: ArrayBuffer,
  basePath: string,
|};

type WorkerOutInitMessage = {|
  type: 'INIT',
  success: boolean,
|};

type WorkerOutRenderCompleteMessage = {|
  type: 'RENDER_COMPLETE',
  resourceUrl: string,
  screenshot: string,
|};

type WorkerOutRenderErrorMessage = {|
  type: 'RENDER_ERROR',
  resourceUrl: string,
  error: string,
|};

type WorkerOutMessage =
  | WorkerOutInitMessage
  | WorkerOutRenderCompleteMessage
  | WorkerOutRenderErrorMessage;

export type Resource3DPreviewState = {|
  getResourcePreview: (resourceUrl: string) => Promise<?string>,
|};

const initialResource3DPreviewState = {
  getResourcePreview: async (_resourceUrl: string) => null,
};

const Resource3DPreviewContext: React.Context<Resource3DPreviewState> = React.createContext<Resource3DPreviewState>(
  // $FlowFixMe[incompatible-type]
  initialResource3DPreviewState
);

export default Resource3DPreviewContext;

// Message types matching the worker's constants
const MESSAGE_TYPES = {
  RENDER_MODEL: 'RENDER_MODEL',
  RENDER_COMPLETE: 'RENDER_COMPLETE',
  RENDER_ERROR: 'RENDER_ERROR',
  INIT: 'INIT',
};

// Worker manager that handles initialization and communication
class Resource3DPreviewWorkerManager {
  worker: Worker;
  isInitialized: boolean = false;
  pendingPromises: Map<
    string,
    { resolve: (dataUrl: string) => void, reject: () => void }
  > = new Map();
  fallbackImagePath: string = 'JsPlatform/Extensions/3d_model.svg';

  constructor() {
    // $FlowFixMe[incompatible-type] - worker-loader types aren't recognized by Flow
    // $FlowFixMe[invalid-constructor]
    this.worker = new Resource3DPreviewWorker();
    this.setupMessageHandlers();
    this.initWorker();
  }

  setupMessageHandlers() {
    this.worker.onmessage = (event: MessageEvent) => {
      // $FlowFixMe[incompatible-type]
      const workerOutMessageData = (event.data: WorkerOutMessage);
      const type = workerOutMessageData.type;

      switch (type) {
        case MESSAGE_TYPES.INIT:
          const { success } =
            // $FlowFixMe[incompatible-type]
            (workerOutMessageData: WorkerOutInitMessage);
          this.isInitialized = success;
          break;

        case MESSAGE_TYPES.RENDER_COMPLETE:
          const { resourceUrl, screenshot } =
            // $FlowFixMe[incompatible-type]
            (workerOutMessageData: WorkerOutRenderCompleteMessage);
          const pendingPromise = this.pendingPromises.get(resourceUrl);
          if (pendingPromise) {
            pendingPromise.resolve(screenshot);
            this.pendingPromises.delete(resourceUrl);
          }
          break;

        case MESSAGE_TYPES.RENDER_ERROR:
          const { resourceUrl: errorResourceUrl, error } =
            // $FlowFixMe[incompatible-type]
            (workerOutMessageData: WorkerOutRenderErrorMessage);
          console.error('Worker error rendering 3D model:', error);
          const pendingErrorPromise = this.pendingPromises.get(
            errorResourceUrl
          );
          if (pendingErrorPromise) {
            pendingErrorPromise.resolve(this.fallbackImagePath);
            this.pendingPromises.delete(errorResourceUrl);
          }
          break;
        default:
          console.warn('Unknown message type from worker:', type);
          break;
      }
    };

    this.worker.onerror = error => {
      console.error('Worker error:', error);
      // Resolve any pending promises with the fallback image
      this.pendingPromises.forEach(promise => {
        promise.resolve(this.fallbackImagePath);
      });
      this.pendingPromises.clear();
    };
  }

  initWorker() {
    // $FlowFixMe[incompatible-type]
    const message: WorkerInitMessage = { type: MESSAGE_TYPES.INIT };
    this.worker.postMessage(message);
  }

  renderModel(
    resourceUrl: string,
    resourceData: ArrayBuffer,
    basePath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized) {
        resolve(this.fallbackImagePath);
        return;
      }

      this.pendingPromises.set(resourceUrl, { resolve, reject });
      const message: WorkerRenderModelMessage = {
        // $FlowFixMe[incompatible-type]
        type: MESSAGE_TYPES.RENDER_MODEL,
        resourceUrl,
        resourceData,
        basePath,
      };
      // Transfer the ArrayBuffer to avoid copying it across threads.
      this.worker.postMessage(message, [resourceData]);
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}

type Props = {|
  children: React.Node,
|};

export const Resource3DPreviewProvider = ({
  children,
}: Props): React.MixedElement => {
  const [currentResource, setCurrentResource] = React.useState<?string>(null);
  const queueRef = React.useRef<
    Array<{ url: string, resolve: (dataUrl: ?string) => void }>
  >([]);
  const previewCache = React.useRef<{ [url: string]: string }>({});
  const workerManagerRef = React.useRef<?Resource3DPreviewWorkerManager>(null);

  // Initialize the worker manager on mount
  React.useEffect(() => {
    workerManagerRef.current = new Resource3DPreviewWorkerManager();

    // Cleanup on unmount
    return () => {
      queueRef.current = [];
      previewCache.current = {};

      // Terminate the worker
      if (workerManagerRef.current) {
        workerManagerRef.current.terminate();
        workerManagerRef.current = null;
      }
    };
  }, []);

  const enqueueResource = React.useCallback((url: string): Promise<?string> => {
    return new Promise(resolve => {
      // If it's already in the cache, resolve immediately.
      if (previewCache.current[url]) {
        resolve(previewCache.current[url]);
        return;
      }

      // Add the item to the queue.
      queueRef.current.push({ url, resolve });
      // If the queue didn't have items before,
      // then process it immediately.
      // Otherwise, let the queue process handle it.
      if (queueRef.current.length === 1) {
        setCurrentResource(url);
      }
    });
  }, []);

  const renderModel = React.useCallback(async (url: string) => {
    const workerManager = workerManagerRef.current;
    if (!workerManager) {
      return null;
    }

    // Fetch the resource data on the main thread. Workers in Electron cannot
    // fetch file:// URLs because webSecurity:false only applies to the renderer
    // process, not the network service process used by workers.
    let resourceData: ArrayBuffer;
    try {
      const response = await fetch(url, {
        credentials: checkIfCredentialsRequired(url)
          ? 'include'
          : 'same-origin',
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      resourceData = await response.arrayBuffer();
    } catch (error) {
      console.error('Error fetching 3D model resource:', error);
      return 'JsPlatform/Extensions/3d_model.svg';
    }

    const basePath = url.substring(0, url.lastIndexOf('/') + 1);

    try {
      const dataUrl = await workerManager.renderModel(
        url,
        resourceData,
        basePath
      );
      return dataUrl;
    } catch (error) {
      console.error('Error rendering 3D model:', error);
      return 'JsPlatform/Extensions/3d_model.svg';
    }
  }, []);

  // Effect to process the current resource
  React.useEffect(
    () => {
      if (!currentResource) return;

      const processResource = async () => {
        const dataUrl = await renderModel(currentResource);

        // Handle the result
        if (dataUrl) {
          // Save it in the cache for future use
          previewCache.current[currentResource] = dataUrl;

          // Resolve all the requests made for that URL
          const queueItemsToResolve = queueRef.current.filter(
            item => item.url === currentResource
          );
          queueItemsToResolve.forEach(item => {
            const { resolve } = item;
            // $FlowFixMe[constant-condition]
            if (resolve) resolve(dataUrl);
          });

          // Remove the items from the queue
          queueRef.current = queueRef.current.filter(
            item => item.url !== currentResource
          );

          // And trigger the next item to be processed
          const nextItemToProcess = queueRef.current[0];
          if (nextItemToProcess) {
            setCurrentResource(nextItemToProcess.url);
          }
        }
      };

      processResource();
    },
    [currentResource, renderModel]
  );

  return (
    <Resource3DPreviewContext.Provider
      value={{ getResourcePreview: enqueueResource }}
    >
      {children}
    </Resource3DPreviewContext.Provider>
  );
};
