// @flow
import * as React from 'react';
// Import the worker (will be handled by worker-loader)
import Resource3DPreviewWorker from './Resource3DPreview.worker';
import { checkIfCredentialsRequired } from '../../Utils/CrossOrigin';
import {
  loadDracoDecoderFiles,
  type DracoDecoderFiles,
} from '../../Utils/DracoDecoder';
import {
  getCachedResource3DPreview,
  setCachedResource3DPreview,
  setResource3DPreviewRequester,
  subscribeToResource3DPreviewRendered,
  type EmbeddedTextureUrls,
} from './Resource3DPreviewCache';

type WorkerInitMessage = {|
  type: 'INIT',
  // The Draco decoder files are read by the main thread, because a worker can't
  // read them by itself in the desktop app (`file://` URLs can't be fetched by
  // workers).
  dracoDecoderFiles: ?DracoDecoderFiles,
|};

type EmbeddedTexturesData = { [filePath: string]: ArrayBuffer };

type WorkerRenderModelMessage = {|
  type: 'RENDER_MODEL',
  resourceUrl: string,
  resourceData: ArrayBuffer,
  basePath: string,
  // For models keeping their textures in separate files, the content of these
  // files (which the worker can't read by itself), indexed by the path written
  // inside the model.
  embeddedTextures: ?EmbeddedTexturesData,
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
  getResourcePreview: (
    resourceUrl: string,
    embeddedTextureUrls?: ?EmbeddedTextureUrls
  ) => Promise<?string>,
|};

const initialResource3DPreviewState = {
  getResourcePreview: async (
    _resourceUrl: string,
    _embeddedTextureUrls?: ?EmbeddedTextureUrls
  ) => null,
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
  initializationPromise: Promise<boolean>;
  _onInitialized: (isInitialized: boolean) => void = () => {};
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
    this.initializationPromise = this.initWorker();
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
          this._onInitialized(success);
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
      // In case the worker crashed before answering the initialization
      // message, consider it not initialized (so that renders requests
      // are not waiting forever and get the fallback image instead).
      this._onInitialized(false);
      // Resolve any pending promises with the fallback image
      this.pendingPromises.forEach(promise => {
        promise.resolve(this.fallbackImagePath);
      });
      this.pendingPromises.clear();
    };
  }

  async initWorker(): Promise<boolean> {
    const initializedPromise: Promise<boolean> = new Promise(resolve => {
      this._onInitialized = resolve;
    });

    // Read the Draco decoder files so that the worker can render the models
    // compressed with Draco.
    let dracoDecoderFiles = null;
    try {
      dracoDecoderFiles = await loadDracoDecoderFiles();
    } catch (error) {
      // Without the decoder files, only the models that are not compressed
      // with Draco can be rendered.
      console.error("Can't read the Draco decoder files:", error);
    }

    const message: WorkerInitMessage = {
      // $FlowFixMe[incompatible-type]
      type: MESSAGE_TYPES.INIT,
      dracoDecoderFiles,
    };
    this.worker.postMessage(
      message,
      dracoDecoderFiles
        ? // Transfer the ArrayBuffers to avoid copying them across threads.
          [
            dracoDecoderFiles.dracoWasmWrapperJs,
            dracoDecoderFiles.dracoDecoderWasm,
          ]
        : []
    );

    return initializedPromise;
  }

  async renderModel(
    resourceUrl: string,
    resourceData: ArrayBuffer,
    basePath: string,
    embeddedTextures: ?EmbeddedTexturesData
  ): Promise<string> {
    const isInitialized = await this.initializationPromise;
    if (!isInitialized) {
      return this.fallbackImagePath;
    }

    return new Promise((resolve, reject) => {
      this.pendingPromises.set(resourceUrl, { resolve, reject });
      const message: WorkerRenderModelMessage = {
        // $FlowFixMe[incompatible-type]
        type: MESSAGE_TYPES.RENDER_MODEL,
        resourceUrl,
        resourceData,
        basePath,
        embeddedTextures,
      };
      // Transfer the ArrayBuffers to avoid copying them across threads.
      this.worker.postMessage(message, [
        resourceData,
        ...(embeddedTextures ? Object.values(embeddedTextures) : []),
      ]);
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

export const useOnResource3DPreviewRendered = (listener: () => void) => {
  React.useEffect(() => subscribeToResource3DPreviewRendered(listener), [
    listener,
  ]);
};

// The resource data is fetched on the main thread. Workers in Electron cannot
// fetch file:// URLs because webSecurity:false only applies to the renderer
// process, not the network service process used by workers.
const fetchResourceData = async (url: string): Promise<?ArrayBuffer> => {
  try {
    const response = await fetch(url, {
      credentials: checkIfCredentialsRequired(url) ? 'include' : 'same-origin',
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching resource of a 3D model:', error);
    return null;
  }
};

/**
 * Fetch the textures that a model keeps in separate files. A texture that
 * can't be fetched is skipped: the model is still worth showing without it.
 */
const fetchEmbeddedTextures = async (
  embeddedTextureUrls: ?EmbeddedTextureUrls
): Promise<?EmbeddedTexturesData> => {
  if (!embeddedTextureUrls) return null;

  const embeddedTextures: EmbeddedTexturesData = {};
  await Promise.all(
    Object.keys(embeddedTextureUrls).map(async filePath => {
      const textureData = await fetchResourceData(
        embeddedTextureUrls[filePath]
      );
      if (textureData) embeddedTextures[filePath] = textureData;
    })
  );
  return embeddedTextures;
};

type QueueItem = {|
  url: string,
  embeddedTextureUrls: ?EmbeddedTextureUrls,
  resolve: (dataUrl: ?string) => void,
|};

export const Resource3DPreviewProvider = ({
  children,
}: Props): React.MixedElement => {
  const queueRef = React.useRef<Array<QueueItem>>([]);
  const workerManagerRef = React.useRef<?Resource3DPreviewWorkerManager>(null);

  // Initialize the worker manager on mount
  React.useEffect(() => {
    workerManagerRef.current = new Resource3DPreviewWorkerManager();

    // Cleanup on unmount
    return () => {
      queueRef.current = [];

      // Terminate the worker
      if (workerManagerRef.current) {
        workerManagerRef.current.terminate();
        workerManagerRef.current = null;
      }
    };
  }, []);

  // The next model of the queue is fetched while the current one is rendered.
  const prefetchedModelRef = React.useRef<?{
    url: string,
    resourceDataPromise: Promise<?ArrayBuffer>,
  }>(null);

  const renderModel = React.useCallback(async (item: QueueItem) => {
    const { url, embeddedTextureUrls } = item;
    const workerManager = workerManagerRef.current;
    if (!workerManager) {
      return 'JsPlatform/Extensions/3d_model.svg';
    }

    const prefetchedModel = prefetchedModelRef.current;
    prefetchedModelRef.current = null;
    const resourceDataPromise =
      prefetchedModel && prefetchedModel.url === url
        ? prefetchedModel.resourceDataPromise
        : fetchResourceData(url);

    const nextItem = queueRef.current.find(item => item.url !== url);
    if (nextItem && !getCachedResource3DPreview(nextItem.url)) {
      prefetchedModelRef.current = {
        url: nextItem.url,
        resourceDataPromise: fetchResourceData(nextItem.url),
      };
    }

    const embeddedTexturesPromise = fetchEmbeddedTextures(embeddedTextureUrls);
    const resourceData = await resourceDataPromise;
    const embeddedTextures = await embeddedTexturesPromise;
    if (!resourceData) {
      return 'JsPlatform/Extensions/3d_model.svg';
    }

    const basePath = url.substring(0, url.lastIndexOf('/') + 1);

    try {
      const dataUrl = await workerManager.renderModel(
        url,
        resourceData,
        basePath,
        embeddedTextures
      );
      return dataUrl;
    } catch (error) {
      console.error('Error rendering 3D model:', error);
      return 'JsPlatform/Extensions/3d_model.svg';
    }
  }, []);

  // The models are rendered one after the other, until the queue is empty.
  const processQueue = React.useCallback(
    async () => {
      while (queueRef.current.length) {
        const queueItem = queueRef.current[0];
        const url = queueItem.url;
        const dataUrl = await renderModel(queueItem);
        setCachedResource3DPreview(url, dataUrl);

        // Resolve all the requests made for that URL and remove them from the queue.
        queueRef.current
          .filter(item => item.url === url)
          .forEach(item => item.resolve(dataUrl));
        queueRef.current = queueRef.current.filter(item => item.url !== url);
      }
    },
    [renderModel]
  );

  const enqueueResource = React.useCallback(
    (
      url: string,
      embeddedTextureUrls?: ?EmbeddedTextureUrls
    ): Promise<?string> => {
      return new Promise(resolve => {
        // If it's already in the cache, resolve immediately.
        const cachedPreview = getCachedResource3DPreview(url);
        if (cachedPreview) {
          resolve(cachedPreview);
          return;
        }

        queueRef.current.push({ url, embeddedTextureUrls, resolve });
        // Unless the queue is already being processed.
        if (queueRef.current.length === 1) processQueue();
      });
    },
    [processQueue]
  );

  React.useEffect(
    () => {
      setResource3DPreviewRequester(enqueueResource);
      return () => setResource3DPreviewRequester(null);
    },
    [enqueueResource]
  );

  const contextValue = React.useMemo(
    () => ({ getResourcePreview: enqueueResource }),
    [enqueueResource]
  );

  return (
    <Resource3DPreviewContext.Provider value={contextValue}>
      {children}
    </Resource3DPreviewContext.Provider>
  );
};
