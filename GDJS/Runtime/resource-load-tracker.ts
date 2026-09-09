/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * What triggered the loading of a resource.
   * @category Resources > Debugging
   */
  export type ResourceLoadOrigin =
    /** Loaded when the game started (`sceneName` is null for global resources). */
    | { type: 'startup'; sceneName: string | null }
    /** Loaded by the scenes queue, in background or behind a loading screen. */
    | { type: 'scene'; sceneName: string; foreground: boolean }
    /** Loaded lazily when an object needing it was created. */
    | { type: 'object'; sceneName: string; objectName: string }
    /** Loaded by the in-game editor. */
    | { type: 'editor' };

  /**
   * @category Resources > Debugging
   */
  export type ResourceLoadStatus =
    'not-loaded' | 'loading' | 'loaded' | 'processing' | 'ready' | 'error';

  /**
   * Everything the debugger knows about one resource.
   * @category Resources > Debugging
   */
  export type ResourceLoadRecord = {
    name: string;
    kind: ResourceKind;
    file: string;
    status: ResourceLoadStatus;
    errorMessage?: string;
    /** How many times the download was attempted. */
    attempts: integer;
    /** The first request that triggered the download, or null if never loaded. */
    origin: ResourceLoadOrigin | null;
    /** Every scene or object referencing the resource. */
    requesters: Array<ResourceLoadOrigin>;
    /** Milliseconds since the game started. */
    loadStartedAtMs?: float;
    loadedAtMs?: float;
    readyAtMs?: float;
    unloadHistory: Array<{ unloadedAtMs: float; reloadedAtMs?: float }>;
    /** Bytes transferred over the network, or null when unknown. */
    transferBytes: integer | null;
    /** Bytes of the decoded file, or null when unknown. */
    decodedBytes: integer | null;
    /** Estimated bytes used in memory once loaded, or null when unknown. */
    estimatedMemoryBytes: integer | null;
    metrics: ResourceDebugMetrics | null;
  };

  /**
   * The snapshot of the resources sent to the debugger.
   * @category Resources > Debugging
   */
  export type ResourcesDebugState = {
    generatedAtMs: float;
    currentSceneName: string | null;
    sceneChanges: Array<{ atMs: float; sceneName: string }>;
    device: {
      deviceMemoryBytes: integer | null;
      jsHeapSizeLimit: integer | null;
      usedJSHeapSize: integer | null;
    };
    totals: {
      byStatus: Record<ResourceLoadStatus, integer>;
      byKind: Record<string, integer>;
      estimatedMemoryBytes: integer;
      transferBytes: integer;
    };
    resources: Array<ResourceLoadRecord>;
  };

  type TrackedResource = {
    status: ResourceLoadStatus;
    errorMessage?: string;
    attempts: integer;
    origin: ResourceLoadOrigin | null;
    loadStartedAtMs?: float;
    loadedAtMs?: float;
    readyAtMs?: float;
    unloadHistory: Array<{ unloadedAtMs: float; reloadedAtMs?: float }>;
    transferBytes: integer | null;
    decodedBytes: integer | null;
  };

  const RESOURCE_TIMING_BUFFER_SIZE = 4096;

  /**
   * Remembers, for the debugger, when and why each resource was loaded, and
   * in which state it is. It is the source of truth of the status of the
   * resources, whatever the managers do.
   * @category Resources > Debugging
   */
  export class ResourceLoadTracker {
    private _getGameTimeMs: () => float;
    private _trackedResources = new Map<string, TrackedResource>();
    private _sceneChanges: Array<{ atMs: float; sceneName: string }> = [];

    constructor(getGameTimeMs: () => float) {
      this._getGameTimeMs = getGameTimeMs;
      if (
        typeof performance !== 'undefined' &&
        typeof performance.setResourceTimingBufferSize === 'function'
      ) {
        // The browser drops the timing entries when its buffer is full: make
        // room for the resources of a whole game.
        performance.setResourceTimingBufferSize(RESOURCE_TIMING_BUFFER_SIZE);
      }
    }

    /** Forget everything (used when the resources are replaced by a hot-reload). */
    reset(): void {
      this._trackedResources.clear();
    }

    recordSceneChange(sceneName: string): void {
      this._sceneChanges.push({ atMs: this._getGameTimeMs(), sceneName });
    }

    getSceneChanges(): Array<{ atMs: float; sceneName: string }> {
      return this._sceneChanges;
    }

    private _getOrCreate(resourceName: string): TrackedResource {
      let trackedResource = this._trackedResources.get(resourceName);
      if (!trackedResource) {
        trackedResource = {
          status: 'not-loaded',
          attempts: 0,
          origin: null,
          unloadHistory: [],
          transferBytes: null,
          decodedBytes: null,
        };
        this._trackedResources.set(resourceName, trackedResource);
      }
      return trackedResource;
    }

    onLoadStarted(resourceName: string, origin: ResourceLoadOrigin): void {
      const trackedResource = this._getOrCreate(resourceName);
      // Managers return immediately when the content is already downloaded:
      // only a resource that has nothing yet really starts loading.
      if (
        trackedResource.status !== 'not-loaded' &&
        trackedResource.status !== 'error'
      ) {
        return;
      }
      const now = this._getGameTimeMs();
      trackedResource.status = 'loading';
      trackedResource.attempts++;
      trackedResource.errorMessage = undefined;
      trackedResource.loadStartedAtMs = now;
      trackedResource.loadedAtMs = undefined;
      trackedResource.readyAtMs = undefined;
      if (!trackedResource.origin) {
        trackedResource.origin = origin;
      }
      const lastUnload =
        trackedResource.unloadHistory[trackedResource.unloadHistory.length - 1];
      if (lastUnload && lastUnload.reloadedAtMs === undefined) {
        lastUnload.reloadedAtMs = now;
      }
    }

    onLoaded(resourceName: string, fullUrl: string): void {
      const trackedResource = this._getOrCreate(resourceName);
      if (trackedResource.status !== 'loading') {
        return;
      }
      trackedResource.status = 'loaded';
      trackedResource.loadedAtMs = this._getGameTimeMs();
      const sizes = ResourceLoadTracker._readNetworkSizes(fullUrl);
      trackedResource.transferBytes = sizes.transferBytes;
      trackedResource.decodedBytes = sizes.decodedBytes;
      if (trackedResource.decodedBytes === null) {
        // Local files and some servers report nothing: ask the file itself.
        ResourceLoadTracker._fetchFileSize(fullUrl).then((fileSize) => {
          if (fileSize !== null && trackedResource.decodedBytes === null) {
            trackedResource.decodedBytes = fileSize;
          }
        });
      }
    }

    /**
     * Read the size of a file, when the Resource Timing API reported nothing:
     * from the `Content-Length` of a HEAD request, or by reading the file
     * (served from the cache after its download, for local files).
     * Never throws: unknown stays unknown.
     */
    private static async _fetchFileSize(fullUrl: string): Promise<integer | null> {
      if (typeof fetch !== 'function') return null;
      try {
        const headResponse = await fetch(fullUrl, { method: 'HEAD' });
        const contentLength = headResponse.headers.get('Content-Length');
        if (headResponse.ok && contentLength) {
          const bytes = parseInt(contentLength, 10);
          if (Number.isFinite(bytes) && bytes > 0) return bytes;
        }
      } catch (error) {
        // HEAD is not supported by every server or protocol: read the file.
      }
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) return null;
        const blob = await response.blob();
        return blob.size > 0 ? blob.size : null;
      } catch (error) {
        return null;
      }
    }

    onLoadFailed(resourceName: string, error: unknown): void {
      const trackedResource = this._getOrCreate(resourceName);
      trackedResource.status = 'error';
      trackedResource.errorMessage = ResourceLoadTracker._describeError(error);
    }

    onProcessingStarted(resourceName: string): void {
      const trackedResource = this._getOrCreate(resourceName);
      if (trackedResource.status === 'ready') {
        return;
      }
      trackedResource.status = 'processing';
    }

    onReady(resourceName: string): void {
      const trackedResource = this._getOrCreate(resourceName);
      if (trackedResource.status === 'ready') {
        return;
      }
      trackedResource.status = 'ready';
      trackedResource.readyAtMs = this._getGameTimeMs();
    }

    onProcessFailed(resourceName: string, error: unknown): void {
      this.onLoadFailed(resourceName, error);
    }

    onUnloaded(resourceName: string): void {
      const trackedResource = this._trackedResources.get(resourceName);
      if (!trackedResource || trackedResource.status === 'not-loaded') {
        return;
      }
      trackedResource.status = 'not-loaded';
      trackedResource.unloadHistory.push({
        unloadedAtMs: this._getGameTimeMs(),
      });
    }

    /**
     * Build the snapshot sent to the debugger.
     * @param resources Every resource of the game.
     * @param getRequesters The scenes and objects referencing a resource.
     * @param getMetrics The metrics known by the manager of a resource.
     * @param currentSceneName The scene running now.
     */
    buildDebugState(
      resources: Iterable<ResourceData>,
      getRequesters: (resourceName: string) => Array<ResourceLoadOrigin>,
      getMetrics: (resource: ResourceData) => ResourceDebugMetrics | null,
      currentSceneName: string | null
    ): ResourcesDebugState {
      const byStatus: Record<ResourceLoadStatus, integer> = {
        'not-loaded': 0,
        loading: 0,
        loaded: 0,
        processing: 0,
        ready: 0,
        error: 0,
      };
      const byKind: Record<string, integer> = {};
      let totalEstimatedMemoryBytes = 0;
      let totalTransferBytes = 0;
      const records: Array<ResourceLoadRecord> = [];

      for (const resource of resources) {
        const trackedResource = this._trackedResources.get(resource.name);
        let metrics: ResourceDebugMetrics | null = null;
        try {
          metrics = getMetrics(resource);
        } catch (error) {
          metrics = null;
        }

        let status: ResourceLoadStatus = trackedResource
          ? trackedResource.status
          : 'not-loaded';
        if (status === 'not-loaded' && metrics) {
          // Loaded on the fly by a manager, without going through the loader
          // (for example `ImageManager.getOrLoadPIXITexture`).
          status = 'ready';
        }

        const decodedBytes = trackedResource
          ? trackedResource.decodedBytes
          : null;
        const estimatedMemoryBytes =
          metrics && metrics.estimatedMemoryBytes !== undefined
            ? metrics.estimatedMemoryBytes
            : status === 'not-loaded' || status === 'error'
              ? null
              : decodedBytes;

        byStatus[status]++;
        byKind[resource.kind] = (byKind[resource.kind] || 0) + 1;
        if (estimatedMemoryBytes !== null) {
          totalEstimatedMemoryBytes += estimatedMemoryBytes;
        }
        if (trackedResource && trackedResource.transferBytes !== null) {
          totalTransferBytes += trackedResource.transferBytes;
        }

        const record: ResourceLoadRecord = {
          name: resource.name,
          kind: resource.kind,
          file: resource.file,
          status,
          errorMessage: trackedResource
            ? trackedResource.errorMessage
            : undefined,
          attempts: trackedResource ? trackedResource.attempts : 0,
          origin: trackedResource ? trackedResource.origin : null,
          requesters: getRequesters(resource.name),
          loadStartedAtMs: trackedResource
            ? trackedResource.loadStartedAtMs
            : undefined,
          loadedAtMs: trackedResource ? trackedResource.loadedAtMs : undefined,
          readyAtMs: trackedResource ? trackedResource.readyAtMs : undefined,
          unloadHistory: trackedResource ? trackedResource.unloadHistory : [],
          transferBytes: trackedResource ? trackedResource.transferBytes : null,
          decodedBytes,
          estimatedMemoryBytes,
          metrics,
        };
        // Keep the payload small and stable once serialized to JSON.
        for (const key of Object.keys(record)) {
          if (record[key] === undefined) delete record[key];
        }
        records.push(record);
      }

      return {
        generatedAtMs: this._getGameTimeMs(),
        currentSceneName,
        sceneChanges: this._sceneChanges,
        device: ResourceLoadTracker.readDeviceMemory(),
        totals: {
          byStatus,
          byKind,
          estimatedMemoryBytes: totalEstimatedMemoryBytes,
          transferBytes: totalTransferBytes,
        },
        resources: records,
      };
    }

    static readDeviceMemory(): ResourcesDebugState['device'] {
      const deviceMemoryGigabytes: number | undefined =
        typeof navigator !== 'undefined'
          ? (navigator as any).deviceMemory
          : undefined;
      const performanceMemory: {
        usedJSHeapSize?: number;
        jsHeapSizeLimit?: number;
      } | null =
        typeof performance !== 'undefined' && (performance as any).memory
          ? (performance as any).memory
          : null;
      return {
        deviceMemoryBytes:
          typeof deviceMemoryGigabytes === 'number'
            ? deviceMemoryGigabytes * 1024 * 1024 * 1024
            : null,
        jsHeapSizeLimit:
          performanceMemory && performanceMemory.jsHeapSizeLimit !== undefined
            ? performanceMemory.jsHeapSizeLimit
            : null,
        usedJSHeapSize:
          performanceMemory && performanceMemory.usedJSHeapSize !== undefined
            ? performanceMemory.usedJSHeapSize
            : null,
      };
    }

    /**
     * Read the sizes of a downloaded file from the Resource Timing API.
     * They are 0 for `file://` URLs and cross-origin responses without the
     * `Timing-Allow-Origin` header: reported as unknown (null) then.
     */
    private static _readNetworkSizes(fullUrl: string): {
      transferBytes: integer | null;
      decodedBytes: integer | null;
    } {
      if (
        typeof performance === 'undefined' ||
        typeof performance.getEntriesByName !== 'function'
      ) {
        return { transferBytes: null, decodedBytes: null };
      }
      let entries = performance.getEntriesByName(
        fullUrl,
        'resource'
      ) as Array<PerformanceResourceTiming>;
      if (entries.length === 0) {
        // The URL requested by the manager may differ by its query string
        // (cache burst, tokens): match the URL without it.
        const urlWithoutQuery = fullUrl.split('?')[0];
        entries = (
          performance.getEntriesByType(
            'resource'
          ) as Array<PerformanceResourceTiming>
        ).filter(
          (candidate) => candidate.name.split('?')[0] === urlWithoutQuery
        );
      }
      const entry = entries[entries.length - 1];
      if (!entry) {
        return { transferBytes: null, decodedBytes: null };
      }
      // A file served from the browser cache has a transfer size of 0 but
      // still reports the size of its body.
      return {
        transferBytes: entry.transferSize > 0 ? entry.transferSize : null,
        decodedBytes:
          entry.decodedBodySize > 0
            ? entry.decodedBodySize
            : entry.encodedBodySize > 0
              ? entry.encodedBodySize
              : null,
      };
    }

    private static _describeError(error: unknown): string {
      if (error instanceof Error) {
        return error.message || error.toString();
      }
      if (typeof error === 'string') {
        return error;
      }
      try {
        return JSON.stringify(error);
      } catch (jsonError) {
        return String(error);
      }
    }
  }
}
