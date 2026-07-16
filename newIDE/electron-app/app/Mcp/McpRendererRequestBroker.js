const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_RELOAD_TIMEOUT_MS = 120000;
const MINIMUM_REQUEST_TIMEOUT_MS = 1000;
const MAXIMUM_REQUEST_TIMEOUT_MS = 600000;
const RELOAD_OPERATION_RETENTION_MS = 5 * 60 * 1000;
const RELOAD_OPERATION_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

const isReloadProjectRequest = request =>
  !!request &&
  request.method === 'tools/call' &&
  !!request.params &&
  request.params.name === 'reload_project';

const getReloadArguments = request => {
  if (!isReloadProjectRequest(request)) return {};
  const args = request.params.arguments;
  return args && typeof args === 'object' ? args : {};
};

const getRequestTimeout = ({
  request,
  defaultRequestTimeoutMs,
  defaultReloadTimeoutMs,
  minimumRequestTimeoutMs,
  maximumRequestTimeoutMs,
}) => {
  const requestedTimeout = getReloadArguments(request).timeout_ms;
  const defaultTimeout = isReloadProjectRequest(request)
    ? defaultReloadTimeoutMs
    : defaultRequestTimeoutMs;
  if (
    typeof requestedTimeout !== 'number' ||
    !Number.isFinite(requestedTimeout)
  ) {
    return defaultTimeout;
  }
  return Math.min(
    maximumRequestTimeoutMs,
    Math.max(minimumRequestTimeoutMs, Math.round(requestedTimeout))
  );
};

const makeRequestError = (message, data) => {
  const error = new Error(message);
  error.data = data;
  return error;
};

const getRendererProcessId = webContents => {
  if (!webContents || typeof webContents.getOSProcessId !== 'function') {
    return null;
  }
  try {
    return webContents.getOSProcessId();
  } catch (error) {
    return null;
  }
};

const getReloadOperationMetadata = (
  operation,
  { attachedToExistingOperation, polledCompletedOperation } = {}
) => ({
  id: operation.operationId,
  correlationId: operation.operationId,
  status: operation.status,
  phase: operation.phase,
  phaseStartedAtMs: operation.phaseStartedAtMs,
  lastProgressAtMs: operation.lastProgressAtMs,
  startedAtMs: operation.startedAtMs,
  completedAtMs: operation.completedAtMs,
  retentionExpiresAtMs: operation.retentionExpiresAtMs,
  rendererProcessId: operation.rendererProcessId,
  rendererConnectionState: operation.rendererConnectionState,
  rendererAcknowledged: operation.rendererAcknowledged,
  projectLoadCompleted: operation.projectLoadCompleted,
  catalogsGenerationStarted: operation.catalogsGenerationStarted,
  catalogsGenerationCompleted: operation.catalogsGenerationCompleted,
  receiptPersisting: operation.receiptPersisting,
  attachedToExistingOperation: !!attachedToExistingOperation,
  polledCompletedOperation: !!polledCompletedOperation,
});

const addReloadOperationMetadata = (
  result,
  operation,
  { attachedToExistingOperation, polledCompletedOperation }
) => {
  if (!result || typeof result !== 'object') return result;
  const reloadOperation = getReloadOperationMetadata(operation, {
    attachedToExistingOperation,
    polledCompletedOperation,
  });
  const structuredContent =
    result.structuredContent && typeof result.structuredContent === 'object'
      ? { ...result.structuredContent, reloadOperation }
      : { reloadOperation };
  let textReplaced = false;
  const content = Array.isArray(result.content)
    ? result.content.map(item => {
        if (!textReplaced && item && item.type === 'text') {
          textReplaced = true;
          return {
            ...item,
            text: JSON.stringify(structuredContent, null, 2),
          };
        }
        return item;
      })
    : result.content;
  return {
    ...result,
    content,
    structuredContent,
  };
};

const createMcpRendererRequestBroker = ({
  getWebContents,
  defaultRequestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  defaultReloadTimeoutMs = DEFAULT_RELOAD_TIMEOUT_MS,
  minimumRequestTimeoutMs = MINIMUM_REQUEST_TIMEOUT_MS,
  maximumRequestTimeoutMs = MAXIMUM_REQUEST_TIMEOUT_MS,
  reloadOperationRetentionMs = RELOAD_OPERATION_RETENTION_MS,
  reloadOperationInactivityTimeoutMs = RELOAD_OPERATION_INACTIVITY_TIMEOUT_MS,
  now = () => Date.now(),
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
}) => {
  let nextRequestId = 0;
  let activeReloadOperation = null;
  const pendingRequests = new Map();
  const reloadOperations = new Map();
  const expiredReloadOperations = new Map();

  const removeRetainedReloadOperation = operation => {
    if (reloadOperations.get(operation.operationId) === operation) {
      reloadOperations.delete(operation.operationId);
      const expiredAtMs = now();
      const tombstone = {
        ...getReloadOperationMetadata(operation),
        expiredAtMs,
        expiryReason: 'retention-window-elapsed',
      };
      expiredReloadOperations.set(operation.operationId, tombstone);
      const tombstoneTimeoutId = setTimeoutFn(() => {
        if (expiredReloadOperations.get(operation.operationId) === tombstone) {
          expiredReloadOperations.delete(operation.operationId);
        }
      }, reloadOperationRetentionMs);
      if (
        tombstoneTimeoutId &&
        typeof tombstoneTimeoutId.unref === 'function'
      ) {
        tombstoneTimeoutId.unref();
      }
    }
  };

  const retainCompletedReloadOperation = operation => {
    operation.retentionExpiresAtMs =
      operation.completedAtMs + reloadOperationRetentionMs;
    operation.retentionTimeoutId = setTimeoutFn(
      () => removeRetainedReloadOperation(operation),
      reloadOperationRetentionMs
    );
    if (
      operation.retentionTimeoutId &&
      typeof operation.retentionTimeoutId.unref === 'function'
    ) {
      operation.retentionTimeoutId.unref();
    }
  };

  const updateReloadOperationPhase = (operation, progress) => {
    if (!operation.operationId || operation.status !== 'running') return;
    const progressAtMs = now();
    const nextPhase =
      progress && typeof progress.phase === 'string' && progress.phase
        ? progress.phase
        : operation.phase;
    if (nextPhase !== operation.phase) {
      operation.phase = nextPhase;
      operation.phaseStartedAtMs = progressAtMs;
    }
    operation.lastProgressAtMs = progressAtMs;
    operation.rendererAcknowledged =
      operation.rendererAcknowledged || nextPhase !== 'request-sent';
    operation.projectLoadCompleted =
      operation.projectLoadCompleted ||
      nextPhase === 'editor-loaded' ||
      nextPhase === 'extensions-loading' ||
      nextPhase === 'catalogs-generating' ||
      nextPhase === 'catalogs-complete' ||
      nextPhase === 'receipt-persisting';
    operation.catalogsGenerationStarted =
      operation.catalogsGenerationStarted ||
      nextPhase === 'catalogs-generating' ||
      nextPhase === 'catalogs-complete' ||
      nextPhase === 'receipt-persisting';
    operation.catalogsGenerationCompleted =
      operation.catalogsGenerationCompleted ||
      nextPhase === 'catalogs-complete' ||
      nextPhase === 'receipt-persisting';
    operation.receiptPersisting =
      operation.receiptPersisting || nextPhase === 'receipt-persisting';

    if (operation.inactivityTimeoutId) {
      clearTimeoutFn(operation.inactivityTimeoutId);
    }
    operation.inactivityTimeoutId = setTimeoutFn(() => {
      if (operation.status !== 'running') return;
      const error = makeRequestError(
        `Reload operation ${
          operation.operationId
        } made no progress for ${reloadOperationInactivityTimeoutMs} ms while in phase ${
          operation.phase
        }.`,
        {
          code: 'MCP_RELOAD_OPERATION_STALLED',
          timeoutMs: reloadOperationInactivityTimeoutMs,
          operationId: operation.operationId,
          operation_id: operation.operationId,
        }
      );
      settleOperation(operation, null, error);
    }, reloadOperationInactivityTimeoutMs);
    if (
      operation.inactivityTimeoutId &&
      typeof operation.inactivityTimeoutId.unref === 'function'
    ) {
      operation.inactivityTimeoutId.unref();
    }
  };

  const settleOperation = (operation, result, error) => {
    pendingRequests.delete(operation.requestId);
    operation.completedAtMs = now();
    if (operation.inactivityTimeoutId) {
      clearTimeoutFn(operation.inactivityTimeoutId);
      operation.inactivityTimeoutId = null;
    }
    if (error) {
      operation.status = 'failed';
      operation.error = error;
    } else {
      operation.status = 'completed';
      operation.phase = 'completed';
      operation.phaseStartedAtMs = operation.completedAtMs;
      operation.result = result;
    }

    if (operation.operationId) {
      if (activeReloadOperation === operation) activeReloadOperation = null;
      retainCompletedReloadOperation(operation);
      if (error) {
        error.data = {
          ...(error.data && typeof error.data === 'object' ? error.data : {}),
          reloadOperation: getReloadOperationMetadata(operation),
        };
      }
    }
    if (error) {
      operation.reject(error);
    } else {
      operation.resolve(result);
    }
  };

  const createOperation = request => {
    const webContents = getWebContents();
    if (!webContents || webContents.isDestroyed()) {
      throw makeRequestError('No active GDevelop editor window is available.', {
        code: 'MCP_EDITOR_UNAVAILABLE',
      });
    }

    const requestId = ++nextRequestId;
    const startedAtMs = now();
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    const operation = {
      request,
      requestId,
      operationId: isReloadProjectRequest(request)
        ? `reload-project-${requestId}`
        : null,
      webContents,
      status: 'running',
      startedAtMs,
      phase: isReloadProjectRequest(request) ? 'request-sent' : null,
      phaseStartedAtMs: startedAtMs,
      lastProgressAtMs: startedAtMs,
      completedAtMs: null,
      retentionExpiresAtMs: null,
      rendererProcessId: getRendererProcessId(webContents),
      rendererConnectionState: 'connected',
      rendererAcknowledged: false,
      projectLoadCompleted: false,
      catalogsGenerationStarted: false,
      catalogsGenerationCompleted: false,
      receiptPersisting: false,
      result: null,
      error: null,
      retentionTimeoutId: null,
      inactivityTimeoutId: null,
      promise,
      resolve,
      reject,
    };
    pendingRequests.set(requestId, operation);
    if (operation.operationId) {
      reloadOperations.set(operation.operationId, operation);
      activeReloadOperation = operation;
      updateReloadOperationPhase(operation, { phase: 'request-sent' });
    }
    try {
      webContents.send('mcp-renderer-request', {
        id: requestId,
        operationId: operation.operationId,
        method: request.method,
        params: request.params,
      });
    } catch (error) {
      pendingRequests.delete(requestId);
      if (operation.inactivityTimeoutId) {
        clearTimeoutFn(operation.inactivityTimeoutId);
        operation.inactivityTimeoutId = null;
      }
      operation.status = 'failed';
      if (operation.operationId) {
        reloadOperations.delete(operation.operationId);
        if (activeReloadOperation === operation) activeReloadOperation = null;
      }
      throw error;
    }
    return operation;
  };

  const waitForOperation = (
    operation,
    request,
    { attachedToExistingOperation, polledCompletedOperation }
  ) => {
    if (operation.status === 'completed') {
      return Promise.resolve(
        addReloadOperationMetadata(operation.result, operation, {
          attachedToExistingOperation,
          polledCompletedOperation,
        })
      );
    }
    if (operation.status === 'failed') return Promise.reject(operation.error);

    const timeoutMs = getRequestTimeout({
      request,
      defaultRequestTimeoutMs,
      defaultReloadTimeoutMs,
      minimumRequestTimeoutMs,
      maximumRequestTimeoutMs,
    });
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeoutFn(() => {
        const isReload = !!operation.operationId;
        const error = makeRequestError(
          isReload
            ? `Timed out after ${timeoutMs} ms waiting for reload_project. Reload operation ${
                operation.operationId
              } is still running; call reload_project again with this operation_id to attach to it.`
            : 'Timed out waiting for the GDevelop editor.',
          {
            code: 'MCP_RENDERER_TIMEOUT',
            timeoutMs,
            method: request.method,
            toolName:
              request.method === 'tools/call' && request.params
                ? request.params.name
                : null,
            operationId: operation.operationId,
            operation_id: operation.operationId,
            operationStatus: isReload ? operation.status : 'abandoned',
            reloadOperation: isReload
              ? getReloadOperationMetadata(operation, {
                  attachedToExistingOperation,
                  polledCompletedOperation,
                })
              : null,
            retry: isReload
              ? {
                  toolName: 'reload_project',
                  arguments: {
                    operation_id: operation.operationId,
                    timeout_ms: timeoutMs,
                  },
                }
              : null,
          }
        );
        if (!isReload && operation.status === 'running') {
          settleOperation(operation, null, error);
        }
        reject(error);
      }, timeoutMs);

      operation.promise.then(
        result => {
          clearTimeoutFn(timeoutId);
          resolve(
            operation.operationId
              ? addReloadOperationMetadata(result, operation, {
                  attachedToExistingOperation,
                  polledCompletedOperation,
                })
              : result
          );
        },
        error => {
          clearTimeoutFn(timeoutId);
          reject(error);
        }
      );
    });
  };

  const send = request => {
    try {
      if (!isReloadProjectRequest(request)) {
        return waitForOperation(createOperation(request), request, {
          attachedToExistingOperation: false,
          polledCompletedOperation: false,
        });
      }

      const requestedOperationId = getReloadArguments(request).operation_id;
      if (requestedOperationId) {
        const operation = reloadOperations.get(requestedOperationId);
        const currentWebContents = getWebContents();
        if (!operation) {
          const expiredOperation = expiredReloadOperations.get(
            requestedOperationId
          );
          throw makeRequestError(
            `Unknown or expired reload operation: ${requestedOperationId}.`,
            {
              code: 'MCP_RELOAD_OPERATION_NOT_FOUND',
              operationId: requestedOperationId,
              operation_id: requestedOperationId,
              expiryReason: expiredOperation
                ? expiredOperation.expiryReason
                : 'operation-registry-unavailable-or-restarted',
              lastKnownReloadOperation: expiredOperation || undefined,
            }
          );
        }
        if (
          operation.status === 'running' &&
          operation.webContents !== currentWebContents
        ) {
          throw makeRequestError(
            `Reload operation ${requestedOperationId} belongs to a disconnected renderer.`,
            {
              code: 'MCP_RELOAD_RENDERER_DISCONNECTED',
              operationId: requestedOperationId,
              operation_id: requestedOperationId,
              reloadOperation: getReloadOperationMetadata(operation),
            }
          );
        }
        return waitForOperation(operation, request, {
          attachedToExistingOperation: operation.status === 'running',
          polledCompletedOperation: operation.status !== 'running',
        });
      }

      if (
        activeReloadOperation &&
        activeReloadOperation.webContents === getWebContents()
      ) {
        return waitForOperation(activeReloadOperation, request, {
          attachedToExistingOperation: true,
          polledCompletedOperation: false,
        });
      }

      return waitForOperation(createOperation(request), request, {
        attachedToExistingOperation: false,
        polledCompletedOperation: false,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleResponse = (webContents, response) => {
    const operation =
      response && typeof response.id === 'number'
        ? pendingRequests.get(response.id)
        : null;
    if (!operation || operation.webContents !== webContents) return false;

    if (response.error) {
      settleOperation(
        operation,
        null,
        makeRequestError(
          response.error && response.error.message
            ? response.error.message
            : String(response.error),
          response.error && response.error.data
        )
      );
    } else {
      settleOperation(operation, response.result, null);
    }
    return true;
  };

  const handleProgress = (webContents, response) => {
    const operation =
      response && typeof response.id === 'number'
        ? pendingRequests.get(response.id)
        : null;
    if (
      !operation ||
      !operation.operationId ||
      operation.webContents !== webContents ||
      (response.operationId && response.operationId !== operation.operationId)
    ) {
      return false;
    }
    updateReloadOperationPhase(operation, response.progress || {});
    return true;
  };

  const clearFor = webContents => {
    for (const operation of pendingRequests.values()) {
      if (operation.webContents !== webContents) continue;
      operation.rendererConnectionState = 'disconnected';
      const error = makeRequestError('The GDevelop editor window was closed.', {
        code: 'MCP_EDITOR_WINDOW_CLOSED',
      });
      settleOperation(operation, null, error);
    }
  };

  return {
    send,
    handleProgress,
    handleResponse,
    clearFor,
  };
};

module.exports = {
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RELOAD_TIMEOUT_MS,
  MINIMUM_REQUEST_TIMEOUT_MS,
  MAXIMUM_REQUEST_TIMEOUT_MS,
  RELOAD_OPERATION_INACTIVITY_TIMEOUT_MS,
  createMcpRendererRequestBroker,
};
