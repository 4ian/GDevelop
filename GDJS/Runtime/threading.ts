namespace gdjs {
  export type ThreadingMode = 'auto' | 'force' | 'off';

  /**
   * @category Core Engine > Game
   */
  export type ThreadingOptions = {
    /** If false, all threaded features are disabled. */
    enabled?: boolean;
    /** Number of workers to spawn for the pool. */
    workerCount?: integer;
    /** Whether to use SharedArrayBuffer (requires COOP/COEP). */
    useSharedArrayBuffer?: ThreadingMode;
    /**
     * If true (default), tasks will be executed on the main thread when
     * workers are unavailable or fail.
     */
    fallbackToMainThread?: boolean;
    /** Maximum queued tasks to avoid memory spikes. */
    maxQueuedTasks?: integer;
    /** Reserved for future physics modes. */
    physicsMode?: 'compatible';
  };

  /**
   * @category Core Engine > Game
   */
  export type ThreadingCapabilities = {
    hasWorker: boolean;
    hasSharedArrayBuffer: boolean;
    hasAtomics: boolean;
    isCrossOriginIsolated: boolean;
  };

  export type ThreadedTaskType = 'ping' | 'transformVertices';

  export type ThreadedTaskPayloads = {
    ping: null;
    transformVertices: {
      /** Column-major 4x4 matrix (compatible with THREE.Matrix4.elements). */
      matrix: Float32Array;
      /** Vertex list as [x0,y0,z0,x1,y1,z1,...]. */
      vertices: Float32Array;
      /** If true, mutate the input array in place. */
      inPlace?: boolean;
    };
  };

  export type ThreadedTaskResults = {
    ping: string;
    transformVertices: Float32Array;
  };

  type ThreadedTaskOptions = {
    transfer?: Transferable[];
    /** Optional timeout for the task in milliseconds. */
    timeoutMs?: integer;
    /** Abort signal to cancel the task. */
    signal?: AbortSignal;
  };

  type ThreadingMetrics = {
    totalMs: float;
    byType: Record<string, float>;
    countByType: Record<string, integer>;
  };

  type WorkerTaskRecord = {
    id: integer;
    type: ThreadedTaskType;
    resolve: (result: any) => void;
    reject: (error: Error) => void;
    startTime: float;
    slot: WorkerSlot;
    timeoutId: ReturnType<typeof setTimeout> | null;
    signal: AbortSignal | null;
    abortListener: (() => void) | null;
  };

  type QueuedTask = {
    id: integer;
    type: ThreadedTaskType;
    payload: any;
    options?: ThreadedTaskOptions;
    resolve: (result: any) => void;
    reject: (error: Error) => void;
    signal: AbortSignal | null;
    abortListener: (() => void) | null;
  };

  type WorkerSlot = {
    worker: Worker;
    busy: boolean;
    currentTaskId: integer | null;
  };

  class WorkerPool {
    private _workers: Array<WorkerSlot> = [];
    private _queue: Array<QueuedTask> = [];
    private _tasks: Map<integer, WorkerTaskRecord> = new Map();
    private _nextTaskId: integer = 1;
    private _workerScriptUrl: string | null = null;
    private _getTimeNow: () => float;
    private _disposed = false;
    private _maxQueuedTasks: integer | null;

    constructor(
      workerCount: integer,
      private _recordMetric: (type: ThreadedTaskType, durationMs: float) => void,
      private _logger: gdjs.Logger,
      maxQueuedTasks?: integer
    ) {
      this._maxQueuedTasks =
        typeof maxQueuedTasks === 'number' ? Math.max(0, maxQueuedTasks) : null;
      this._getTimeNow =
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
          ? performance.now.bind(performance)
          : Date.now;

      if (workerCount <= 0) return;
      try {
        const workerSource = WorkerPool._getWorkerSource();
        const blob = new Blob([workerSource], {
          type: 'application/javascript',
        });
        this._workerScriptUrl = URL.createObjectURL(blob);
        for (let i = 0; i < workerCount; i++) {
          this._workers.push(this._createWorker());
        }
      } catch (err) {
        this._logger.warn(
          'Unable to initialize worker pool. Threading disabled.',
          err
        );
        this.dispose();
      }
    }

    private static _getWorkerSource(): string {
      return `
const getNow = () => (self.performance && self.performance.now ? self.performance.now() : Date.now());
const transformVertices = (payload) => {
  if (!payload || !payload.vertices || !payload.matrix) {
    throw new Error('Invalid payload for transformVertices.');
  }
  const vertices = payload.vertices;
  const matrix = payload.matrix;
  if (vertices.length % 3 !== 0) {
    throw new Error('Invalid vertices length for transformVertices.');
  }
  if (matrix.length < 16) {
    throw new Error('Invalid matrix length for transformVertices.');
  }
  const inPlace = !!payload.inPlace;
  const out = inPlace ? vertices : new Float32Array(vertices.length);
  const m = matrix;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    const nx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const ny = m[1] * x + m[5] * y + m[9] * z + m[13];
    const nz = m[2] * x + m[6] * y + m[10] * z + m[14];
    out[i] = nx;
    out[i + 1] = ny;
    out[i + 2] = nz;
  }
  return out;
};
self.onmessage = (event) => {
  const data = event.data || {};
  const id = data.id;
  const type = data.type;
  const payload = data.payload;
  try {
    let result;
    if (type === 'ping') {
      result = 'pong';
    } else if (type === 'transformVertices') {
      result = transformVertices(payload);
    } else {
      throw new Error('Unknown task type: ' + type);
    }
    const transfer = [];
    const isShared =
      typeof SharedArrayBuffer !== 'undefined' &&
      result &&
      result.buffer &&
      result.buffer instanceof SharedArrayBuffer;
    if (result && result.buffer && !isShared) {
      transfer.push(result.buffer);
    }
    self.postMessage({ id, ok: true, result: result, type: type }, transfer);
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    self.postMessage({ id, ok: false, error: message, type: type });
  }
};
`;
    }

    private _createWorker(): WorkerSlot {
      const worker = this._instantiateWorker();
      const slot: WorkerSlot = { worker, busy: false, currentTaskId: null };
      worker.onmessage = (event) => {
        const data = event.data || {};
        const taskId = data.id;
        const task = this._tasks.get(taskId);
        if (!task) {
          this._releaseWorker(slot);
          return;
        }
        this._tasks.delete(taskId);
        this._detachAbortListener(task.signal, task.abortListener);
        if (task.timeoutId !== null) {
          clearTimeout(task.timeoutId);
        }
        const duration = this._getTimeNow() - task.startTime;
        this._recordMetric(task.type, duration);
        if (data.ok === false) {
          task.reject(new Error(data.error || 'Threaded task failed'));
        } else {
          task.resolve(data.result);
        }
        this._releaseWorker(slot);
      };
      worker.onerror = (err) => {
        this._handleWorkerFailure(slot, err);
      };
      worker.onmessageerror = (err) => {
        this._handleWorkerFailure(slot, err);
      };
      return slot;
    }

    private _instantiateWorker(): Worker {
      if (!this._workerScriptUrl) {
        throw new Error('Worker pool not initialized.');
      }
      return new Worker(this._workerScriptUrl);
    }

    private _handleWorkerFailure(slot: WorkerSlot, err: unknown) {
      const taskId = slot.currentTaskId;
      if (taskId !== null) {
        const task = this._tasks.get(taskId);
        if (task) {
          if (task.timeoutId !== null) {
            clearTimeout(task.timeoutId);
          }
          this._detachAbortListener(task.signal, task.abortListener);
          task.reject(err instanceof Error ? err : new Error(String(err)));
          this._tasks.delete(taskId);
        }
      }
      try {
        slot.worker.terminate();
      } catch (_err) {}
      if (this._disposed) {
        this._releaseWorker(slot);
        return;
      }
      try {
        slot.worker = this._instantiateWorker();
        slot.worker.onmessage = (event) => {
          const data = event.data || {};
          const currentTaskId = data.id;
          const task = this._tasks.get(currentTaskId);
          if (!task) {
            this._releaseWorker(slot);
            return;
          }
          this._tasks.delete(currentTaskId);
          this._detachAbortListener(task.signal, task.abortListener);
          if (task.timeoutId !== null) {
            clearTimeout(task.timeoutId);
          }
          const duration = this._getTimeNow() - task.startTime;
          this._recordMetric(task.type, duration);
          if (data.ok === false) {
            task.reject(new Error(data.error || 'Threaded task failed'));
          } else {
            task.resolve(data.result);
          }
          this._releaseWorker(slot);
        };
        slot.worker.onerror = (error) => {
          this._handleWorkerFailure(slot, error);
        };
        slot.worker.onmessageerror = (error) => {
          this._handleWorkerFailure(slot, error);
        };
      } catch (workerError) {
        this._logger.warn(
          'Worker crashed and could not be restarted.',
          workerError
        );
        this._removeWorker(slot);
      }
      this._releaseWorker(slot);
    }

    private _removeWorker(slot: WorkerSlot) {
      const index = this._workers.indexOf(slot);
      if (index >= 0) {
        this._workers.splice(index, 1);
      }
    }

    runTask<T extends ThreadedTaskType>(
      type: T,
      payload: ThreadedTaskPayloads[T],
      options?: ThreadedTaskOptions
    ): Promise<ThreadedTaskResults[T]> {
      return new Promise((resolve, reject) => {
        if (this._disposed) {
          reject(new Error('Threading worker pool is disposed.'));
          return;
        }
        const signal =
          options && typeof options.signal !== 'undefined'
            ? options.signal
            : null;
        if (signal && signal.aborted) {
          reject(new Error('Threaded task aborted.'));
          return;
        }
        if (
          this._maxQueuedTasks !== null &&
          this._maxQueuedTasks > 0 &&
          this._queue.length >= this._maxQueuedTasks
        ) {
          reject(new Error('Threading queue is full.'));
          return;
        }
        const id = this._nextTaskId++;
        const queuedTask: QueuedTask = {
          id,
          type,
          payload,
          options,
          resolve,
          reject,
          signal,
          abortListener: null,
        };
        if (signal && typeof signal.addEventListener === 'function') {
          const onAbort = () => {
            this._abortTask(id, new Error('Threaded task aborted.'));
          };
          queuedTask.abortListener = onAbort;
          signal.addEventListener('abort', onAbort);
        }
        this._queue.push(queuedTask);
        this._dispatchNext();
      });
    }

    private _dispatchNext() {
      if (this._disposed) return;
      while (true) {
        const slot = this._workers.find((worker) => !worker.busy);
        if (!slot) return;
        const task = this._queue.shift();
        if (!task) return;
        if (task.signal && task.signal.aborted) {
          this._detachAbortListener(task.signal, task.abortListener);
          task.reject(new Error('Threaded task aborted.'));
          continue;
        }

        slot.busy = true;
        slot.currentTaskId = task.id;
        const timeoutMs = task.options?.timeoutMs || 0;
        const timeoutId =
          timeoutMs > 0 && typeof setTimeout === 'function'
            ? setTimeout(() => {
                const record = this._tasks.get(task.id);
                if (!record) return;
                this._tasks.delete(task.id);
                this._detachAbortListener(record.signal, record.abortListener);
                record.reject(new Error('Threaded task timed out.'));
                this._handleWorkerFailure(slot, new Error('Worker timeout'));
              }, timeoutMs)
            : null;
        this._tasks.set(task.id, {
          id: task.id,
          type: task.type,
          resolve: task.resolve,
          reject: task.reject,
          startTime: this._getTimeNow(),
          slot,
          timeoutId,
          signal: task.signal,
          abortListener: task.abortListener,
        });
        const transferables = task.options?.transfer || [];
        try {
          slot.worker.postMessage(
            {
              id: task.id,
              type: task.type,
              payload: task.payload,
            },
            transferables
          );
        } catch (err) {
          const record = this._tasks.get(task.id);
          if (record) {
            if (record.timeoutId !== null) {
              clearTimeout(record.timeoutId);
            }
            this._detachAbortListener(record.signal, record.abortListener);
            record.reject(err instanceof Error ? err : new Error(String(err)));
            this._tasks.delete(task.id);
          }
          this._releaseWorker(slot);
        }
      }
    }

    private _releaseWorker(slot: WorkerSlot) {
      slot.busy = false;
      slot.currentTaskId = null;
      this._dispatchNext();
    }

    dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      for (const task of this._tasks.values()) {
        if (task.timeoutId !== null) {
          clearTimeout(task.timeoutId);
        }
        this._detachAbortListener(task.signal, task.abortListener);
        task.reject(new Error('Threading worker pool disposed.'));
      }
      this._tasks.clear();
      for (const queued of this._queue) {
        this._detachAbortListener(queued.signal, queued.abortListener);
        queued.reject(new Error('Threading worker pool disposed.'));
      }
      this._queue.length = 0;
      for (const slot of this._workers) {
        try {
          slot.worker.terminate();
        } catch (_err) {}
      }
      this._workers.length = 0;
      if (this._workerScriptUrl) {
        URL.revokeObjectURL(this._workerScriptUrl);
        this._workerScriptUrl = null;
      }
    }

    private _abortTask(taskId: integer, error: Error) {
      const record = this._tasks.get(taskId);
      if (record) {
        if (record.timeoutId !== null) {
          clearTimeout(record.timeoutId);
        }
        this._tasks.delete(taskId);
        this._detachAbortListener(record.signal, record.abortListener);
        record.reject(error);
        this._handleWorkerFailure(record.slot, error);
        return;
      }
      const queuedIndex = this._queue.findIndex((task) => task.id === taskId);
      if (queuedIndex >= 0) {
        const [queuedTask] = this._queue.splice(queuedIndex, 1);
        this._detachAbortListener(
          queuedTask.signal,
          queuedTask.abortListener
        );
        queuedTask.reject(error);
      }
    }

    private _detachAbortListener(
      signal: AbortSignal | null,
      listener: (() => void) | null
    ) {
      if (!signal || !listener) return;
      try {
        signal.removeEventListener('abort', listener);
      } catch (_err) {}
    }
  }

  /**
   * Manages the runtime worker pool and exposes multithreading capabilities.
   * @category Core Engine > Game
   */
  export class ThreadingManager {
    private _options: ThreadingOptions;
    private _capabilities: ThreadingCapabilities;
    private _workerPool: WorkerPool | null = null;
    private _logger = new gdjs.Logger('Threading');
    private _pendingMetrics: ThreadingMetrics = {
      totalMs: 0,
      byType: {},
      countByType: {},
    };
    private _lastFrameMetrics: ThreadingMetrics = {
      totalMs: 0,
      byType: {},
      countByType: {},
    };
    private _warnedAboutSharedArrayBuffer = false;

    constructor(options?: ThreadingOptions) {
      this._options = options || {};
      this._capabilities = ThreadingManager.getCapabilities();
    }

    static getCapabilities(): ThreadingCapabilities {
      const hasWorker = typeof Worker !== 'undefined';
      const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
      const hasAtomics = typeof Atomics !== 'undefined';
      const isCrossOriginIsolated =
        typeof crossOriginIsolated !== 'undefined'
          ? !!crossOriginIsolated
          : false;
      return {
        hasWorker,
        hasSharedArrayBuffer,
        hasAtomics,
        isCrossOriginIsolated,
      };
    }

    static getDefaultWorkerCount(): integer {
      const cores =
        typeof navigator !== 'undefined' && navigator.hardwareConcurrency
          ? navigator.hardwareConcurrency
          : 4;
      return Math.max(1, Math.floor(cores) - 1);
    }

    static canUseWasmThreads(): boolean {
      const capabilities = ThreadingManager.getCapabilities();
      return (
        capabilities.hasWorker &&
        capabilities.hasSharedArrayBuffer &&
        capabilities.hasAtomics &&
        capabilities.isCrossOriginIsolated
      );
    }

    getOptions(): ThreadingOptions {
      return this._options;
    }

    getCapabilities(): ThreadingCapabilities {
      return this._capabilities;
    }

    isEnabled(): boolean {
      if (this._options.enabled === false) return false;
      if (!this._capabilities.hasWorker) return false;
      const count = this.getWorkerCount();
      return count > 0;
    }

    shouldUseSharedArrayBuffer(): boolean {
      const mode = this._options.useSharedArrayBuffer || 'auto';
      if (mode === 'off') return false;
      if (!ThreadingManager.canUseWasmThreads()) {
        if (mode === 'force' && !this._warnedAboutSharedArrayBuffer) {
          this._warnedAboutSharedArrayBuffer = true;
          this._logger.warn(
            'SharedArrayBuffer requested but not available (COOP/COEP missing).'
          );
        }
        return false;
      }
      return true;
    }

    getWorkerCount(): integer {
      const count =
        typeof this._options.workerCount === 'number'
          ? Math.floor(this._options.workerCount)
          : ThreadingManager.getDefaultWorkerCount();
      return Math.max(0, count);
    }

    getWorkerPool(): WorkerPool | null {
      if (!this.isEnabled()) return null;
      if (!this._workerPool) {
        this._workerPool = new WorkerPool(
          this.getWorkerCount(),
          (type, durationMs) => this._recordMetric(type, durationMs),
          this._logger,
          this._options.maxQueuedTasks
        );
      }
      return this._workerPool;
    }

    runTask<T extends ThreadedTaskType>(
      type: T,
      payload: ThreadedTaskPayloads[T],
      options?: ThreadedTaskOptions
    ): Promise<ThreadedTaskResults[T]> {
      const pool = this.getWorkerPool();
      if (pool) {
        return pool.runTask(type, payload, options).catch((err) => {
          if (this._shouldFallbackToMainThread()) {
            try {
              return this._executeTaskOnMainThread(type, payload);
            } catch (fallbackError) {
              return Promise.reject(
                fallbackError instanceof Error
                  ? fallbackError
                  : new Error(String(fallbackError))
              );
            }
          }
          return Promise.reject(err);
        });
      }
      if (this._shouldFallbackToMainThread()) {
        try {
          return Promise.resolve(this._executeTaskOnMainThread(type, payload));
        } catch (err) {
          return Promise.reject(err instanceof Error ? err : new Error(String(err)));
        }
      }
      return Promise.reject(new Error('Threading is disabled.'));
    }

    flushFrameProfile(profiler?: gdjs.Profiler | null): void {
      const metrics = this._consumeMetrics();
      if (metrics.totalMs <= 0) return;
      this._lastFrameMetrics = metrics;
      if (profiler) {
        profiler.addExternalTime('threading', metrics.totalMs);
        for (const type in metrics.byType) {
          if (!metrics.byType.hasOwnProperty(type)) continue;
          profiler.addExternalTime('threading/' + type, metrics.byType[type]);
        }
      }
    }

    clearFrameMetrics(): void {
      this._consumeMetrics();
    }

    getLastFrameMetrics(): ThreadingMetrics {
      return this._lastFrameMetrics;
    }

    dispose(): void {
      if (this._workerPool) {
        this._workerPool.dispose();
        this._workerPool = null;
      }
    }

    private _shouldFallbackToMainThread(): boolean {
      return this._options.fallbackToMainThread !== false;
    }

    private _executeTaskOnMainThread<T extends ThreadedTaskType>(
      type: T,
      payload: ThreadedTaskPayloads[T]
    ): ThreadedTaskResults[T] {
      if (type === 'ping') {
        return 'pong' as ThreadedTaskResults[T];
      }
      if (type === 'transformVertices') {
        const data = payload as ThreadedTaskPayloads['transformVertices'];
        if (!data || !data.vertices || !data.matrix) {
          throw new Error('Invalid payload for transformVertices.');
        }
        const vertices = data.vertices;
        const matrix = data.matrix;
        if (vertices.length % 3 !== 0) {
          throw new Error('Invalid vertices length for transformVertices.');
        }
        if (matrix.length < 16) {
          throw new Error('Invalid matrix length for transformVertices.');
        }
        const inPlace = !!data.inPlace;
        const out = inPlace ? vertices : new Float32Array(vertices.length);
        const m = matrix;
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const y = vertices[i + 1];
          const z = vertices[i + 2];
          const nx = m[0] * x + m[4] * y + m[8] * z + m[12];
          const ny = m[1] * x + m[5] * y + m[9] * z + m[13];
          const nz = m[2] * x + m[6] * y + m[10] * z + m[14];
          out[i] = nx;
          out[i + 1] = ny;
          out[i + 2] = nz;
        }
        return out as ThreadedTaskResults[T];
      }
      throw new Error('Unknown threaded task: ' + type);
    }

    private _recordMetric(type: ThreadedTaskType, durationMs: float): void {
      this._pendingMetrics.totalMs += durationMs;
      this._pendingMetrics.byType[type] =
        (this._pendingMetrics.byType[type] || 0) + durationMs;
      this._pendingMetrics.countByType[type] =
        (this._pendingMetrics.countByType[type] || 0) + 1;
    }

    private _consumeMetrics(): ThreadingMetrics {
      const metrics: ThreadingMetrics = {
        totalMs: this._pendingMetrics.totalMs,
        byType: { ...this._pendingMetrics.byType },
        countByType: { ...this._pendingMetrics.countByType },
      };
      this._pendingMetrics.totalMs = 0;
      this._pendingMetrics.byType = {};
      this._pendingMetrics.countByType = {};
      return metrics;
    }
  }
}
