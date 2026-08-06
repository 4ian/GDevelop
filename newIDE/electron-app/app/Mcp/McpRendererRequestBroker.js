const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_RELOAD_TIMEOUT_MS = 120000;
const DEFAULT_VERIFY_PROJECT_CHANGE_TIMEOUT_MS = 180000;
const DEFAULT_PROJECT_FILES_OPERATION_TIMEOUT_MS = 180000;
const DEFAULT_PREVIEW_OPERATION_TIMEOUT_MS = 120000;
const MINIMUM_REQUEST_TIMEOUT_MS = 1000;
const MAXIMUM_REQUEST_TIMEOUT_MS = 600000;
const RELOAD_OPERATION_RETENTION_MS = 5 * 60 * 1000;
const RELOAD_OPERATION_INACTIVITY_TIMEOUT_MS = 60 * 1000;
const RELOAD_CATALOG_SUBPHASE_INACTIVITY_TIMEOUT_MS = 15 * 1000;

const CATALOG_ARTIFACT_NAMES = [
  'project-serialization',
  'instruction-signature',
  'instructions',
  'deprecated-instructions',
  'settings',
  'layout',
  'javascript-api',
  'runtime-api',
  'project-api',
  'modification-time-acknowledgement',
];

const getCatalogPhaseDetails = phase => {
  if (typeof phase !== 'string') return null;
  const exactPhases = {
    'catalog-project-serializing': ['project-serialization', 'serializing'],
    'catalog-project-serialized': ['project-serialization', 'completed'],
    'catalogs-modification-time-reading': [
      'modification-time-acknowledgement',
      'reading',
    ],
    'catalogs-modification-time-acknowledged': [
      'modification-time-acknowledgement',
      'completed',
    ],
  };
  if (exactPhases[phase]) {
    return {
      artifact: exactPhases[phase][0],
      subphase: exactPhases[phase][1],
      completed: exactPhases[phase][1] === 'completed',
    };
  }
  const match = /^catalog-(instruction-signature|instructions|deprecated-instructions|settings|layout|javascript-api|runtime-api|project-api)-(cache-hit|building|built|writing|written)$/.exec(
    phase
  );
  if (!match) return null;
  return {
    artifact: match[1],
    subphase: match[2],
    completed:
      match[2] === 'written' ||
      (match[1] === 'instruction-signature' && match[2] === 'built') ||
      (match[1] === 'javascript-api' && match[2] === 'built'),
  };
};

const isCatalogPhase = phase =>
  phase === 'catalogs-generating' ||
  (typeof phase === 'string' &&
    (phase.startsWith('catalog-') || phase.startsWith('catalogs-')));

const isReloadProjectRequest = request =>
  !!request &&
  request.method === 'tools/call' &&
  !!request.params &&
  request.params.name === 'reload_project';

const isVerifyProjectChangeRequest = request =>
  !!request &&
  request.method === 'tools/call' &&
  !!request.params &&
  request.params.name === 'verify_project_change';

const PROJECT_FILES_OPERATION_TOOL_NAMES = new Set([
  'open_project',
  'generate-catalogs',
  'validate_project_files',
]);

const PREVIEW_OPERATION_TOOL_NAMES = new Set(['launch_preview']);

const isProjectFilesOperationRequest = request =>
  !!request &&
  request.method === 'tools/call' &&
  !!request.params &&
  PROJECT_FILES_OPERATION_TOOL_NAMES.has(request.params.name);

const isPreviewOperationRequest = request =>
  !!request &&
  request.method === 'tools/call' &&
  !!request.params &&
  PREVIEW_OPERATION_TOOL_NAMES.has(request.params.name);

const getCoalescingKey = request => {
  if (
    !isProjectFilesOperationRequest(request) &&
    !isVerifyProjectChangeRequest(request) &&
    !isPreviewOperationRequest(request)
  ) {
    return null;
  }
  try {
    return JSON.stringify([
      request.params.name,
      request.params.arguments || {},
    ]);
  } catch (error) {
    return null;
  }
};

const getReloadArguments = request => {
  if (!isReloadProjectRequest(request)) return {};
  const args = request.params.arguments;
  return args && typeof args === 'object' ? args : {};
};

const getReloadMode = request => {
  const mode = getReloadArguments(request).mode;
  return mode === 'start' || mode === 'status' ? mode : 'wait';
};

const getRequestTimeout = ({
  request,
  defaultRequestTimeoutMs,
  defaultReloadTimeoutMs,
  defaultVerifyProjectChangeTimeoutMs,
  defaultProjectFilesOperationTimeoutMs,
  defaultPreviewOperationTimeoutMs,
  minimumRequestTimeoutMs,
  maximumRequestTimeoutMs,
}) => {
  // verify_project_change.timeout_ms bounds its launch and inspection stages,
  // not the aggregate validation/reload/preview workflow.
  const requestedTimeout = getReloadArguments(request).timeout_ms;
  const defaultTimeout = isReloadProjectRequest(request)
    ? defaultReloadTimeoutMs
    : isVerifyProjectChangeRequest(request)
    ? defaultVerifyProjectChangeTimeoutMs
    : isProjectFilesOperationRequest(request)
    ? defaultProjectFilesOperationTimeoutMs
    : isPreviewOperationRequest(request)
    ? defaultPreviewOperationTimeoutMs
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

const getCatalogGenerationMetadata = operation => {
  const artifacts = {};
  CATALOG_ARTIFACT_NAMES.forEach(artifactName => {
    const recordedArtifact = operation.catalogArtifacts[artifactName];
    const isFailedArtifact =
      operation.status === 'failed' &&
      operation.currentCatalogArtifact === artifactName;
    artifacts[artifactName] = recordedArtifact
      ? {
          ...recordedArtifact,
          status: isFailedArtifact ? 'failed' : recordedArtifact.status,
          failedAtMs: isFailedArtifact
            ? operation.completedAtMs
            : recordedArtifact.failedAtMs,
        }
      : { status: 'not-started' };
  });

  const generatorState = operation.catalogsGenerationCompleted
    ? 'resolved'
    : operation.status === 'failed' && operation.catalogsGenerationStarted
    ? 'failed'
    : operation.catalogsGenerationStarted
    ? 'pending'
    : 'not-started';
  const lastCatalogProgress = operation.catalogProgressHistory.length
    ? operation.catalogProgressHistory[
        operation.catalogProgressHistory.length - 1
      ]
    : null;
  return {
    state: generatorState,
    currentArtifact:
      generatorState === 'pending' || generatorState === 'failed'
        ? operation.currentCatalogArtifact
        : null,
    artifacts,
    progressHistory: operation.catalogProgressHistory.slice(),
    lastRendererCatalogLog: lastCatalogProgress,
    completionProgressReceived: operation.catalogsGenerationCompleted,
    queue: {
      strategy: 'single-active-reload-coalescing',
      ownerOperationId:
        operation.status === 'running' ? operation.operationId : null,
      lockReleased: operation.status !== 'running',
    },
  };
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
  inactivityTimeoutMs: operation.inactivityTimeoutMs,
  inactivityDeadlineAtMs: operation.inactivityDeadlineAtMs,
  inactivityIncidents: operation.inactivityIncidents.slice(),
  lastInactivityIncident: operation.inactivityIncidents.length
    ? operation.inactivityIncidents[operation.inactivityIncidents.length - 1]
    : null,
  startedAtMs: operation.startedAtMs,
  completedAtMs: operation.completedAtMs,
  retentionExpiresAtMs: operation.retentionExpiresAtMs,
  rendererProcessId: operation.rendererProcessId,
  rendererConnectionState: operation.rendererConnectionState,
  rendererAcknowledged: operation.rendererAcknowledged,
  projectLoadCompleted: operation.projectLoadCompleted,
  catalogsGenerationStarted: operation.catalogsGenerationStarted,
  catalogsGenerationCompleted: operation.catalogsGenerationCompleted,
  catalogGeneration: getCatalogGenerationMetadata(operation),
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

const makeReloadOperationSnapshot = (
  operation,
  { attachedToExistingOperation, polledCompletedOperation, mode }
) => {
  if (operation.status === 'completed' && operation.result) {
    return addReloadOperationMetadata(operation.result, operation, {
      attachedToExistingOperation,
      polledCompletedOperation,
    });
  }

  const reloadOperation = getReloadOperationMetadata(operation, {
    attachedToExistingOperation,
    polledCompletedOperation,
  });
  const payload = {
    success: operation.status !== 'failed',
    reloaded: false,
    operationAccepted: operation.status === 'running',
    mode,
    reloadOperation,
    error:
      operation.status === 'failed' && operation.error
        ? {
            message: operation.error.message,
            data: operation.error.data,
          }
        : undefined,
    nextAction:
      operation.status === 'running'
        ? `Call reload_project with {"mode":"status","operation_id":"${
            operation.operationId
          }"} for a non-blocking progress snapshot, or omit mode to wait for completion.`
        : operation.status === 'failed'
        ? 'The reload operation failed. Inspect error and reloadOperation before starting a fresh reload.'
        : 'The reload operation completed.',
  };
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
};

const makeIdleReloadStatus = () => {
  const payload = {
    success: true,
    reloaded: false,
    operationAccepted: false,
    mode: 'status',
    reloadOperation: null,
    nextAction:
      'No active or retained reload operation is available. Call reload_project with {"mode":"start"} to start one and receive its operation_id immediately.',
  };
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
};

const createMcpRendererRequestBroker = ({
  getWebContents,
  defaultRequestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  defaultReloadTimeoutMs = DEFAULT_RELOAD_TIMEOUT_MS,
  defaultVerifyProjectChangeTimeoutMs = DEFAULT_VERIFY_PROJECT_CHANGE_TIMEOUT_MS,
  defaultProjectFilesOperationTimeoutMs = DEFAULT_PROJECT_FILES_OPERATION_TIMEOUT_MS,
  defaultPreviewOperationTimeoutMs = DEFAULT_PREVIEW_OPERATION_TIMEOUT_MS,
  minimumRequestTimeoutMs = MINIMUM_REQUEST_TIMEOUT_MS,
  maximumRequestTimeoutMs = MAXIMUM_REQUEST_TIMEOUT_MS,
  reloadOperationRetentionMs = RELOAD_OPERATION_RETENTION_MS,
  reloadOperationInactivityTimeoutMs = RELOAD_OPERATION_INACTIVITY_TIMEOUT_MS,
  reloadCatalogSubphaseInactivityTimeoutMs = RELOAD_CATALOG_SUBPHASE_INACTIVITY_TIMEOUT_MS,
  now = () => Date.now(),
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
}) => {
  let nextRequestId = 0;
  let activeReloadOperation = null;
  let latestReloadOperation = null;
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
    const lastInactivityIncident = operation.inactivityIncidents.length
      ? operation.inactivityIncidents[operation.inactivityIncidents.length - 1]
      : null;
    if (lastInactivityIncident && !lastInactivityIncident.recoveredAtMs) {
      lastInactivityIncident.recoveredAtMs = progressAtMs;
    }
    const nextPhase =
      progress && typeof progress.phase === 'string' && progress.phase
        ? progress.phase
        : operation.phase;
    if (nextPhase !== operation.phase) {
      operation.phase = nextPhase;
      operation.phaseStartedAtMs = progressAtMs;
    }
    operation.lastProgressAtMs = progressAtMs;
    const catalogPhaseDetails = getCatalogPhaseDetails(nextPhase);
    if (catalogPhaseDetails) {
      const {
        artifact: artifactName,
        subphase,
        completed,
      } = catalogPhaseDetails;
      const existingArtifact = operation.catalogArtifacts[artifactName];
      operation.catalogArtifacts[artifactName] = {
        status: completed ? 'completed' : 'running',
        subphase,
        startedAtMs: existingArtifact
          ? existingArtifact.startedAtMs
          : progressAtMs,
        lastProgressAtMs: progressAtMs,
        completedAtMs: completed ? progressAtMs : null,
      };
      operation.currentCatalogArtifact = completed ? null : artifactName;
      operation.catalogProgressHistory.push({
        phase: nextPhase,
        artifact: artifactName,
        subphase,
        atMs: progressAtMs,
      });
      if (operation.catalogProgressHistory.length > 64) {
        operation.catalogProgressHistory.shift();
      }
    }
    operation.rendererAcknowledged =
      operation.rendererAcknowledged || nextPhase !== 'request-sent';
    operation.projectLoadCompleted =
      operation.projectLoadCompleted ||
      nextPhase === 'editor-loaded' ||
      nextPhase === 'extensions-loading' ||
      isCatalogPhase(nextPhase) ||
      nextPhase === 'receipt-persisting';
    operation.catalogsGenerationStarted =
      operation.catalogsGenerationStarted ||
      isCatalogPhase(nextPhase) ||
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
    const isCatalogSubphase = isCatalogPhase(nextPhase);
    operation.inactivityTimeoutMs = isCatalogSubphase
      ? reloadCatalogSubphaseInactivityTimeoutMs
      : reloadOperationInactivityTimeoutMs;
    operation.inactivityDeadlineAtMs =
      progressAtMs + operation.inactivityTimeoutMs;
    operation.inactivityTimeoutId = setTimeoutFn(() => {
      if (operation.status !== 'running') return;
      operation.inactivityTimeoutId = null;
      const catalogArtifact = operation.currentCatalogArtifact;
      const inactivityIncident = {
        code: isCatalogSubphase
          ? 'MCP_RELOAD_CATALOG_SUBPHASE_STALLED'
          : 'MCP_RELOAD_OPERATION_STALLED',
        timeoutMs: operation.inactivityTimeoutMs,
        operationId: operation.operationId,
        operation_id: operation.operationId,
        phase: operation.phase,
        catalogArtifact,
        detectedAtMs: now(),
        recoveredAtMs: null,
      };
      operation.inactivityIncidents.push(inactivityIncident);
      if (operation.inactivityIncidents.length > 16) {
        operation.inactivityIncidents.shift();
      }
      console.warn(
        isCatalogSubphase
          ? `Reload operation ${operation.operationId} made no progress for ${
              operation.inactivityTimeoutMs
            } ms in catalog subphase ${operation.phase}${
              catalogArtifact ? ` (artifact ${catalogArtifact})` : ''
            }. The renderer operation is still running and keeps the reload lock.`
          : `Reload operation ${operation.operationId} made no progress for ${
              operation.inactivityTimeoutMs
            } ms while in phase ${
              operation.phase
            }. The renderer operation is still running and keeps the reload lock.`
      );
    }, operation.inactivityTimeoutMs);
    if (
      operation.inactivityTimeoutId &&
      typeof operation.inactivityTimeoutId.unref === 'function'
    ) {
      operation.inactivityTimeoutId.unref();
    }
  };

  const settleOperation = (
    operation,
    result,
    error,
    rendererReportedToolError = false
  ) => {
    pendingRequests.delete(operation.requestId);
    operation.completedAtMs = now();
    const lastInactivityIncident = operation.inactivityIncidents.length
      ? operation.inactivityIncidents[operation.inactivityIncidents.length - 1]
      : null;
    if (lastInactivityIncident && !lastInactivityIncident.recoveredAtMs) {
      lastInactivityIncident.recoveredAtMs = operation.completedAtMs;
    }
    if (operation.inactivityTimeoutId) {
      clearTimeoutFn(operation.inactivityTimeoutId);
      operation.inactivityTimeoutId = null;
    }
    if (error || rendererReportedToolError) {
      operation.status = 'failed';
      operation.error =
        error ||
        makeRequestError(
          result && result.structuredContent && result.structuredContent.error
            ? result.structuredContent.error
            : 'The renderer reported a reload_project tool error.',
          result && result.structuredContent
            ? result.structuredContent
            : undefined
        );
    } else {
      operation.status = 'completed';
      operation.phase = 'completed';
      operation.phaseStartedAtMs = operation.completedAtMs;
      operation.result = result;
    }

    if (operation.operationId) {
      if (activeReloadOperation === operation) activeReloadOperation = null;
      retainCompletedReloadOperation(operation);
      if (operation.error) {
        operation.error.data = {
          ...(operation.error.data && typeof operation.error.data === 'object'
            ? operation.error.data
            : {}),
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
      coalescingKey: getCoalescingKey(request),
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
      catalogArtifacts: {},
      catalogProgressHistory: [],
      currentCatalogArtifact: null,
      receiptPersisting: false,
      result: null,
      error: null,
      retentionTimeoutId: null,
      inactivityTimeoutId: null,
      inactivityTimeoutMs: reloadOperationInactivityTimeoutMs,
      inactivityDeadlineAtMs: null,
      inactivityIncidents: [],
      promise,
      resolve,
      reject,
    };
    pendingRequests.set(requestId, operation);
    if (operation.operationId) {
      reloadOperations.set(operation.operationId, operation);
      activeReloadOperation = operation;
      latestReloadOperation = operation;
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
      defaultVerifyProjectChangeTimeoutMs,
      defaultProjectFilesOperationTimeoutMs,
      defaultPreviewOperationTimeoutMs,
      minimumRequestTimeoutMs,
      maximumRequestTimeoutMs,
    });
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeoutFn(() => {
        const isReload = !!operation.operationId;
        const canRetryByAttaching = !!operation.coalescingKey;
        const error = makeRequestError(
          isReload
            ? `Timed out after ${timeoutMs} ms waiting for reload_project. Reload operation ${
                operation.operationId
              } is still running; call reload_project again with this operation_id to attach to it.`
            : canRetryByAttaching
            ? `Timed out after ${timeoutMs} ms waiting for the GDevelop editor. The renderer operation is still running; retry the identical request to attach to it instead of starting duplicate work.`
            : `Timed out after ${timeoutMs} ms waiting for the GDevelop editor. The renderer operation may still be running because renderer-side MCP work cannot be cancelled safely.`,
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
            operationStatus: operation.status,
            waiterDetached: true,
            underlyingOperationContinues: operation.status === 'running',
            retryAttachesToExistingOperation: canRetryByAttaching,
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
            status: isReload
              ? {
                  toolName: 'reload_project',
                  arguments: {
                    mode: 'status',
                    operation_id: operation.operationId,
                  },
                }
              : null,
          }
        );
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
        const coalescingKey = getCoalescingKey(request);
        const currentWebContents = getWebContents();
        const existingOperation = coalescingKey
          ? Array.from(pendingRequests.values()).find(
              operation =>
                operation.status === 'running' &&
                operation.webContents === currentWebContents &&
                operation.coalescingKey === coalescingKey
            )
          : null;
        return waitForOperation(
          existingOperation || createOperation(request),
          request,
          {
            attachedToExistingOperation: !!existingOperation,
            polledCompletedOperation: false,
          }
        );
      }

      const reloadArguments = getReloadArguments(request);
      const requestedOperationId = reloadArguments.operation_id;
      const mode = getReloadMode(request);
      if (mode === 'status' && !requestedOperationId) {
        const operation =
          activeReloadOperation ||
          (latestReloadOperation &&
          reloadOperations.get(latestReloadOperation.operationId) ===
            latestReloadOperation
            ? latestReloadOperation
            : null);
        return Promise.resolve(
          operation
            ? makeReloadOperationSnapshot(operation, {
                attachedToExistingOperation: operation.status === 'running',
                polledCompletedOperation: operation.status !== 'running',
                mode,
              })
            : makeIdleReloadStatus()
        );
      }
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
        const waitOptions = {
          attachedToExistingOperation: operation.status === 'running',
          polledCompletedOperation: operation.status !== 'running',
        };
        if (mode === 'start' || mode === 'status') {
          return Promise.resolve(
            makeReloadOperationSnapshot(operation, {
              ...waitOptions,
              mode,
            })
          );
        }
        return waitForOperation(operation, request, waitOptions);
      }

      if (
        activeReloadOperation &&
        activeReloadOperation.webContents === getWebContents()
      ) {
        const waitOptions = {
          attachedToExistingOperation: true,
          polledCompletedOperation: false,
        };
        if (mode === 'start') {
          return Promise.resolve(
            makeReloadOperationSnapshot(activeReloadOperation, {
              ...waitOptions,
              mode,
            })
          );
        }
        return waitForOperation(activeReloadOperation, request, waitOptions);
      }

      const operation = createOperation(request);
      const waitOptions = {
        attachedToExistingOperation: false,
        polledCompletedOperation: false,
      };
      if (mode === 'start') {
        return Promise.resolve(
          makeReloadOperationSnapshot(operation, {
            ...waitOptions,
            mode,
          })
        );
      }
      return waitForOperation(operation, request, waitOptions);
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
      settleOperation(
        operation,
        response.result,
        null,
        !!(
          operation.operationId &&
          response.result &&
          response.result.isError === true
        )
      );
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

  const clearFor = (webContents, disconnectDetails = {}) => {
    for (const operation of pendingRequests.values()) {
      if (operation.webContents !== webContents) continue;
      operation.rendererConnectionState = 'disconnected';
      const error = makeRequestError(
        disconnectDetails.message || 'The GDevelop editor window was closed.',
        {
          ...disconnectDetails,
          code: disconnectDetails.code || 'MCP_EDITOR_WINDOW_CLOSED',
        }
      );
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
  DEFAULT_VERIFY_PROJECT_CHANGE_TIMEOUT_MS,
  DEFAULT_PROJECT_FILES_OPERATION_TIMEOUT_MS,
  DEFAULT_PREVIEW_OPERATION_TIMEOUT_MS,
  MINIMUM_REQUEST_TIMEOUT_MS,
  MAXIMUM_REQUEST_TIMEOUT_MS,
  RELOAD_OPERATION_INACTIVITY_TIMEOUT_MS,
  RELOAD_CATALOG_SUBPHASE_INACTIVITY_TIMEOUT_MS,
  createMcpRendererRequestBroker,
};
