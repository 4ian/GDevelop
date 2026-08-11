const assert = require('assert');

const {
  createMcpRendererRequestBroker,
} = require('../app/Mcp/McpRendererRequestBroker');

const delay = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

const toolResult = payload => ({
  content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  structuredContent: payload,
});

const reloadRequest = timeoutMs => ({
  method: 'tools/call',
  params: {
    name: 'reload_project',
    arguments: { timeout_ms: timeoutMs },
  },
});

const getRejectedError = async promise => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  assert.fail('Expected the promise to reject.');
};

const run = async () => {
  const sentRequests = [];
  const webContents = {
    isDestroyed: () => false,
    getOSProcessId: () => 4321,
    send: (channel, request) => sentRequests.push({ channel, request }),
  };
  const broker = createMcpRendererRequestBroker({
    getWebContents: () => webContents,
    defaultRequestTimeoutMs: 100,
    defaultReloadTimeoutMs: 20,
    minimumRequestTimeoutMs: 1,
    reloadOperationRetentionMs: 1000,
    reloadOperationInactivityTimeoutMs: 1000,
  });

  const firstWaiter = broker.send(reloadRequest(20));
  assert.strictEqual(sentRequests.length, 1);
  const firstRequest = sentRequests[0].request;
  const operationId = firstRequest.operationId;
  assert(operationId);
  assert.strictEqual(
    broker.handleProgress(webContents, {
      id: firstRequest.id,
      operationId,
      progress: { phase: 'renderer-acknowledged' },
    }),
    true
  );

  const timeoutError = await getRejectedError(firstWaiter);
  assert.strictEqual(timeoutError.data.code, 'MCP_RENDERER_TIMEOUT');
  assert.strictEqual(timeoutError.data.operationStatus, 'running');
  assert.strictEqual(timeoutError.data.operationId, operationId);
  assert.strictEqual(timeoutError.data.operation_id, operationId);
  assert.strictEqual(timeoutError.data.waiterDetached, true);
  assert.strictEqual(timeoutError.data.underlyingOperationContinues, true);
  assert.deepStrictEqual(timeoutError.data.status.arguments, {
    mode: 'status',
    operation_id: operationId,
  });
  assert.strictEqual(
    timeoutError.data.reloadOperation.correlationId,
    operationId
  );
  assert.strictEqual(
    timeoutError.data.reloadOperation.phase,
    'renderer-acknowledged'
  );
  assert.strictEqual(timeoutError.data.reloadOperation.rendererProcessId, 4321);
  assert.strictEqual(
    timeoutError.data.reloadOperation.rendererAcknowledged,
    true
  );
  assert.strictEqual(
    timeoutError.data.reloadOperation.inactivityDeadlineAtMs >
      timeoutError.data.reloadOperation.lastProgressAtMs,
    true
  );

  const retryPromise = broker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { operation_id: operationId, timeout_ms: 100 },
    },
  });
  assert.strictEqual(sentRequests.length, 1);
  for (const phase of [
    'editor-loading',
    'editor-loaded',
    'extensions-loading',
    'catalogs-generating',
    'catalog-project-serializing',
    'catalog-project-serialized',
    'catalog-instruction-signature-building',
    'catalog-instruction-signature-built',
    'catalog-instructions-building',
    'catalog-instructions-built',
    'catalog-instructions-writing',
    'catalog-instructions-written',
    'catalog-deprecated-instructions-building',
    'catalog-deprecated-instructions-built',
    'catalog-deprecated-instructions-writing',
    'catalog-deprecated-instructions-written',
    'catalog-settings-building',
    'catalog-settings-built',
    'catalog-settings-writing',
    'catalog-settings-written',
    'catalog-layout-building',
    'catalog-layout-built',
    'catalog-layout-writing',
    'catalog-layout-written',
    'catalog-javascript-api-building',
    'catalog-javascript-api-built',
    'catalog-runtime-api-writing',
    'catalog-runtime-api-written',
    'catalog-project-api-writing',
    'catalog-project-api-written',
    'catalogs-modification-time-reading',
    'catalogs-modification-time-acknowledged',
    'catalogs-complete',
    'receipt-persisting',
  ]) {
    assert.strictEqual(
      broker.handleProgress(webContents, {
        id: firstRequest.id,
        operationId,
        progress: { phase },
      }),
      true
    );
  }
  assert.strictEqual(
    broker.handleProgress(webContents, {
      id: firstRequest.id,
      operationId: 'reload-project-wrong',
      progress: { phase: 'should-not-be-recorded' },
    }),
    false
  );
  broker.handleResponse(webContents, {
    id: firstRequest.id,
    result: toolResult({ success: true, reloaded: true }),
  });
  const retryResult = await retryPromise;
  const retryMetadata = retryResult.structuredContent.reloadOperation;
  assert.strictEqual(retryResult.structuredContent.reloaded, true);
  assert.strictEqual(retryMetadata.id, operationId);
  assert.strictEqual(retryMetadata.status, 'completed');
  assert.strictEqual(retryMetadata.phase, 'completed');
  assert.strictEqual(retryMetadata.attachedToExistingOperation, true);
  assert.strictEqual(retryMetadata.projectLoadCompleted, true);
  assert.strictEqual(retryMetadata.catalogsGenerationStarted, true);
  assert.strictEqual(retryMetadata.catalogsGenerationCompleted, true);
  assert.strictEqual(retryMetadata.catalogGeneration.state, 'resolved');
  Object.values(retryMetadata.catalogGeneration.artifacts).forEach(artifact =>
    assert.strictEqual(artifact.status, 'completed')
  );
  assert.strictEqual(
    retryMetadata.catalogGeneration.completionProgressReceived,
    true
  );
  assert.strictEqual(retryMetadata.catalogGeneration.queue.lockReleased, true);
  assert.strictEqual(retryMetadata.receiptPersisting, true);
  assert(retryMetadata.retentionExpiresAtMs > retryMetadata.completedAtMs);

  const pollResult = await broker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { operation_id: operationId },
    },
  });
  assert.strictEqual(sentRequests.length, 1);
  assert.strictEqual(
    pollResult.structuredContent.reloadOperation.polledCompletedOperation,
    true
  );

  const listPromise = broker.send({ method: 'tools/list', params: {} });
  assert.strictEqual(sentRequests.length, 2);
  broker.handleResponse(webContents, {
    id: sentRequests[1].request.id,
    result: { tools: [] },
  });
  assert.deepStrictEqual(await listPromise, { tools: [] });

  const verificationRequests = [];
  const verificationWebContents = {
    isDestroyed: () => false,
    send: (channel, request) => verificationRequests.push({ channel, request }),
  };
  const verificationBroker = createMcpRendererRequestBroker({
    getWebContents: () => verificationWebContents,
    defaultRequestTimeoutMs: 10,
    defaultVerifyProjectChangeTimeoutMs: 100,
    minimumRequestTimeoutMs: 1,
  });
  const verificationPromise = verificationBroker.send({
    method: 'tools/call',
    params: {
      name: 'verify_project_change',
      arguments: { timeout_ms: 500 },
    },
  });
  assert.strictEqual(verificationRequests.length, 1);
  await delay(30);
  verificationBroker.handleResponse(verificationWebContents, {
    id: verificationRequests[0].request.id,
    result: toolResult({ success: true, runtimeVerified: true }),
  });
  const verificationResult = await verificationPromise;
  assert.strictEqual(
    verificationResult.structuredContent.runtimeVerified,
    true
  );

  const previewRequests = [];
  const previewWebContents = {
    isDestroyed: () => false,
    send: (channel, request) => previewRequests.push({ channel, request }),
  };
  const previewBroker = createMcpRendererRequestBroker({
    getWebContents: () => previewWebContents,
    defaultRequestTimeoutMs: 10,
    defaultPreviewOperationTimeoutMs: 100,
    minimumRequestTimeoutMs: 1,
  });
  const previewRequest = {
    method: 'tools/call',
    params: {
      name: 'launch_preview',
      arguments: { scene_name: 'Game', timeout_ms: 30000 },
    },
  };
  const previewPromise = previewBroker.send(previewRequest);
  await delay(30);
  assert.strictEqual(previewRequests.length, 1);
  previewBroker.handleResponse(previewWebContents, {
    id: previewRequests[0].request.id,
    result: toolResult({ success: true, actualScene: 'Game' }),
  });
  assert.strictEqual(
    (await previewPromise).structuredContent.actualScene,
    'Game'
  );

  const timedOutPreviewRequests = [];
  const timedOutPreviewWebContents = {
    isDestroyed: () => false,
    send: (channel, request) =>
      timedOutPreviewRequests.push({ channel, request }),
  };
  const timedOutPreviewBroker = createMcpRendererRequestBroker({
    getWebContents: () => timedOutPreviewWebContents,
    defaultPreviewOperationTimeoutMs: 10,
    minimumRequestTimeoutMs: 1,
  });
  const timedOutPreviewError = await getRejectedError(
    timedOutPreviewBroker.send(previewRequest)
  );
  assert.strictEqual(
    timedOutPreviewError.data.retryAttachesToExistingOperation,
    true
  );
  const attachedPreview = timedOutPreviewBroker.send(previewRequest);
  assert.strictEqual(timedOutPreviewRequests.length, 1);
  timedOutPreviewBroker.handleResponse(timedOutPreviewWebContents, {
    id: timedOutPreviewRequests[0].request.id,
    result: toolResult({ success: true, actualScene: 'Game' }),
  });
  assert.strictEqual(
    (await attachedPreview).structuredContent.actualScene,
    'Game'
  );

  const projectFilesRequests = [];
  const projectFilesWebContents = {
    isDestroyed: () => false,
    send: (channel, request) => projectFilesRequests.push({ channel, request }),
  };
  const projectFilesBroker = createMcpRendererRequestBroker({
    getWebContents: () => projectFilesWebContents,
    defaultRequestTimeoutMs: 10,
    defaultProjectFilesOperationTimeoutMs: 100,
    minimumRequestTimeoutMs: 1,
  });
  const validationRequest = {
    method: 'tools/call',
    params: { name: 'validate_project_files', arguments: {} },
  };
  const firstValidationWaiter = projectFilesBroker.send(validationRequest);
  await delay(30);
  assert.strictEqual(projectFilesRequests.length, 1);
  const secondValidationWaiter = projectFilesBroker.send(validationRequest);
  assert.strictEqual(
    projectFilesRequests.length,
    1,
    'an identical validation request should attach to the running operation'
  );
  projectFilesBroker.handleResponse(projectFilesWebContents, {
    id: projectFilesRequests[0].request.id,
    result: toolResult({ success: true, valid: true }),
  });
  const [firstValidationResult, secondValidationResult] = await Promise.all([
    firstValidationWaiter,
    secondValidationWaiter,
  ]);
  assert.strictEqual(firstValidationResult.structuredContent.valid, true);
  assert.strictEqual(secondValidationResult.structuredContent.valid, true);

  const openProjectRequest = {
    method: 'tools/call',
    params: {
      name: 'open_project',
      arguments: { project_path: 'C:\\Games\\Test\\project.gdevelop' },
    },
  };
  const openProjectPromise = projectFilesBroker.send(openProjectRequest);
  await delay(30);
  assert.strictEqual(
    projectFilesRequests.length,
    2,
    'open_project should use the longer project-files operation timeout'
  );
  projectFilesBroker.handleResponse(projectFilesWebContents, {
    id: projectFilesRequests[1].request.id,
    result: toolResult({ success: true, opened: true }),
  });
  assert.strictEqual(
    (await openProjectPromise).structuredContent.opened,
    true
  );

  const timedOutProjectFilesRequests = [];
  const timedOutProjectFilesWebContents = {
    isDestroyed: () => false,
    send: (channel, request) =>
      timedOutProjectFilesRequests.push({ channel, request }),
  };
  const timedOutProjectFilesBroker = createMcpRendererRequestBroker({
    getWebContents: () => timedOutProjectFilesWebContents,
    defaultProjectFilesOperationTimeoutMs: 10,
    minimumRequestTimeoutMs: 1,
  });
  const timedOutValidationError = await getRejectedError(
    timedOutProjectFilesBroker.send(validationRequest)
  );
  assert.strictEqual(timedOutValidationError.data.operationStatus, 'running');
  assert.strictEqual(timedOutValidationError.data.waiterDetached, true);
  assert.strictEqual(
    timedOutValidationError.data.underlyingOperationContinues,
    true
  );
  assert.strictEqual(
    timedOutValidationError.data.retryAttachesToExistingOperation,
    true
  );
  const attachedAfterTimeout = timedOutProjectFilesBroker.send(
    validationRequest
  );
  assert.strictEqual(timedOutProjectFilesRequests.length, 1);
  timedOutProjectFilesBroker.handleResponse(timedOutProjectFilesWebContents, {
    id: timedOutProjectFilesRequests[0].request.id,
    result: toolResult({ success: true, valid: true }),
  });
  assert.strictEqual(
    (await attachedAfterTimeout).structuredContent.valid,
    true
  );

  const coalescedFirst = broker.send(reloadRequest(100));
  const coalescedSecond = broker.send(reloadRequest(100));
  assert.strictEqual(sentRequests.length, 3);
  const coalescedRequest = sentRequests[2].request;
  broker.handleResponse(webContents, {
    id: coalescedRequest.id,
    result: toolResult({ success: true, reloaded: true }),
  });
  const [coalescedFirstResult, coalescedSecondResult] = await Promise.all([
    coalescedFirst,
    coalescedSecond,
  ]);
  assert.strictEqual(
    coalescedFirstResult.structuredContent.reloadOperation
      .attachedToExistingOperation,
    false
  );
  assert.strictEqual(
    coalescedSecondResult.structuredContent.reloadOperation
      .attachedToExistingOperation,
    true
  );

  const rendererErrorPromise = broker.send(reloadRequest(100));
  const rendererErrorRequest = sentRequests[3].request;
  broker.handleProgress(webContents, {
    id: rendererErrorRequest.id,
    operationId: rendererErrorRequest.operationId,
    progress: { phase: 'catalog-settings-writing' },
  });
  broker.handleResponse(webContents, {
    id: rendererErrorRequest.id,
    result: {
      isError: true,
      content: [{ type: 'text', text: 'settings write failed' }],
      structuredContent: {
        success: false,
        error: 'settings write failed',
        code: 'MCP_RELOAD_CATALOG_SUBPHASE_FAILED',
        catalogArtifact: 'settings',
      },
    },
  });
  const rendererErrorResult = await rendererErrorPromise;
  assert.strictEqual(rendererErrorResult.isError, true);
  assert.strictEqual(
    rendererErrorResult.structuredContent.reloadOperation.status,
    'failed'
  );
  assert.strictEqual(
    rendererErrorResult.structuredContent.reloadOperation.catalogGeneration
      .artifacts.settings.status,
    'failed'
  );

  const observableRequests = [];
  const observableWebContents = {
    isDestroyed: () => false,
    getOSProcessId: () => 9876,
    send: (channel, request) => observableRequests.push({ channel, request }),
  };
  const observableBroker = createMcpRendererRequestBroker({
    getWebContents: () => observableWebContents,
    defaultReloadTimeoutMs: 100,
    minimumRequestTimeoutMs: 1,
    reloadOperationRetentionMs: 1000,
    reloadOperationInactivityTimeoutMs: 1000,
  });
  const startResult = await observableBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { mode: 'start' },
    },
  });
  assert.strictEqual(observableRequests.length, 1);
  const observableOperationId =
    startResult.structuredContent.reloadOperation.id;
  assert(observableOperationId);
  assert.strictEqual(startResult.structuredContent.operationAccepted, true);
  assert.strictEqual(
    startResult.structuredContent.reloadOperation.status,
    'running'
  );
  assert.strictEqual(
    startResult.structuredContent.reloadOperation.rendererProcessId,
    9876
  );

  const discoveredStatus = await observableBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { mode: 'status' },
    },
  });
  assert.strictEqual(
    discoveredStatus.structuredContent.reloadOperation.id,
    observableOperationId
  );
  assert.strictEqual(observableRequests.length, 1);

  observableBroker.handleProgress(observableWebContents, {
    id: observableRequests[0].request.id,
    operationId: observableOperationId,
    progress: { phase: 'old-extensions-waiting' },
  });
  const explicitStatus = await observableBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: {
        mode: 'status',
        operation_id: observableOperationId,
      },
    },
  });
  assert.strictEqual(
    explicitStatus.structuredContent.reloadOperation.phase,
    'old-extensions-waiting'
  );

  const observableWaiter = observableBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: {
        mode: 'wait',
        operation_id: observableOperationId,
        timeout_ms: 100,
      },
    },
  });
  observableBroker.handleResponse(observableWebContents, {
    id: observableRequests[0].request.id,
    result: toolResult({ success: true, reloaded: true }),
  });
  const observableWaitResult = await observableWaiter;
  assert.strictEqual(observableWaitResult.structuredContent.reloaded, true);
  const retainedStatus = await observableBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { mode: 'status' },
    },
  });
  assert.strictEqual(
    retainedStatus.structuredContent.reloadOperation.status,
    'completed'
  );
  assert.strictEqual(
    retainedStatus.structuredContent.reloadOperation.polledCompletedOperation,
    true
  );

  const idleBroker = createMcpRendererRequestBroker({
    getWebContents: () => observableWebContents,
  });
  const idleStatus = await idleBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { mode: 'status' },
    },
  });
  assert.strictEqual(idleStatus.structuredContent.reloadOperation, null);
  assert.strictEqual(idleStatus.structuredContent.operationAccepted, false);

  const stalledRequests = [];
  const stalledWebContents = {
    isDestroyed: () => false,
    send: (channel, request) => stalledRequests.push({ channel, request }),
  };
  const stalledBroker = createMcpRendererRequestBroker({
    getWebContents: () => stalledWebContents,
    defaultReloadTimeoutMs: 250,
    minimumRequestTimeoutMs: 1,
    reloadOperationRetentionMs: 1000,
    reloadOperationInactivityTimeoutMs: 10,
  });
  const stalledPromise = stalledBroker.send(reloadRequest(250));
  const stalledOperationId = stalledRequests[0].request.operationId;
  await delay(30);
  const stalledStatus = await stalledBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { mode: 'status', operation_id: stalledOperationId },
    },
  });
  const stalledMetadata = stalledStatus.structuredContent.reloadOperation;
  assert.strictEqual(stalledMetadata.status, 'running');
  assert.strictEqual(stalledMetadata.phase, 'request-sent');
  assert.strictEqual(
    stalledMetadata.lastInactivityIncident.code,
    'MCP_RELOAD_OPERATION_STALLED'
  );
  assert.strictEqual(
    stalledMetadata.lastInactivityIncident.recoveredAtMs,
    null
  );
  assert.strictEqual(
    stalledMetadata.catalogGeneration.queue.lockReleased,
    false
  );
  assert.strictEqual(stalledRequests.length, 1);
  stalledBroker.handleResponse(stalledWebContents, {
    id: stalledRequests[0].request.id,
    result: toolResult({ success: true, reloaded: true }),
  });
  const stalledResult = await stalledPromise;
  assert.strictEqual(
    stalledResult.structuredContent.reloadOperation.status,
    'completed'
  );
  assert.strictEqual(
    stalledResult.structuredContent.reloadOperation.lastInactivityIncident
      .recoveredAtMs >=
      stalledResult.structuredContent.reloadOperation.lastInactivityIncident
        .detectedAtMs,
    true
  );
  assert.strictEqual(stalledRequests.length, 1);

  const catalogStalledRequests = [];
  const catalogStalledWebContents = {
    isDestroyed: () => false,
    getOSProcessId: () => 2468,
    send: (channel, request) =>
      catalogStalledRequests.push({ channel, request }),
  };
  const catalogStalledBroker = createMcpRendererRequestBroker({
    getWebContents: () => catalogStalledWebContents,
    defaultReloadTimeoutMs: 250,
    minimumRequestTimeoutMs: 1,
    reloadOperationRetentionMs: 1000,
    reloadOperationInactivityTimeoutMs: 1000,
    reloadCatalogSubphaseInactivityTimeoutMs: 10,
  });
  const catalogStalledPromise = catalogStalledBroker.send(reloadRequest(250));
  const catalogStalledRequest = catalogStalledRequests[0].request;
  catalogStalledBroker.handleProgress(catalogStalledWebContents, {
    id: catalogStalledRequest.id,
    operationId: catalogStalledRequest.operationId,
    progress: { phase: 'catalog-instructions-building' },
  });
  catalogStalledBroker.handleProgress(catalogStalledWebContents, {
    id: catalogStalledRequest.id,
    operationId: catalogStalledRequest.operationId,
    progress: { phase: 'catalog-instructions-writing' },
  });
  await delay(30);
  const catalogStalledStatus = await catalogStalledBroker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: {
        mode: 'status',
        operation_id: catalogStalledRequest.operationId,
      },
    },
  });
  const catalogStalledMetadata =
    catalogStalledStatus.structuredContent.reloadOperation;
  assert.strictEqual(
    catalogStalledMetadata.lastInactivityIncident.code,
    'MCP_RELOAD_CATALOG_SUBPHASE_STALLED'
  );
  assert.strictEqual(
    catalogStalledMetadata.lastInactivityIncident.catalogArtifact,
    'instructions'
  );
  assert.strictEqual(
    catalogStalledMetadata.phase,
    'catalog-instructions-writing'
  );
  assert.strictEqual(catalogStalledMetadata.inactivityTimeoutMs, 10);
  assert.strictEqual(
    catalogStalledMetadata.inactivityDeadlineAtMs,
    catalogStalledMetadata.lastProgressAtMs + 10
  );
  assert.strictEqual(catalogStalledMetadata.catalogGeneration.state, 'pending');
  assert.strictEqual(
    catalogStalledMetadata.catalogGeneration.currentArtifact,
    'instructions'
  );
  assert.strictEqual(
    catalogStalledMetadata.catalogGeneration.artifacts.instructions.status,
    'running'
  );
  assert.strictEqual(
    catalogStalledMetadata.catalogGeneration.lastRendererCatalogLog.subphase,
    'writing'
  );
  assert.strictEqual(
    catalogStalledMetadata.catalogGeneration.queue.lockReleased,
    false
  );
  catalogStalledBroker.handleResponse(catalogStalledWebContents, {
    id: catalogStalledRequest.id,
    result: toolResult({ success: true, reloaded: true }),
  });
  const catalogStalledResult = await catalogStalledPromise;
  assert.strictEqual(
    catalogStalledResult.structuredContent.reloadOperation.status,
    'completed'
  );

  const disconnectedRequests = [];
  let activeWebContents = {
    isDestroyed: () => false,
    send: (channel, request) => disconnectedRequests.push({ channel, request }),
  };
  const disconnectedBroker = createMcpRendererRequestBroker({
    getWebContents: () => activeWebContents,
    defaultReloadTimeoutMs: 100,
    minimumRequestTimeoutMs: 1,
    reloadOperationRetentionMs: 15,
    reloadOperationInactivityTimeoutMs: 1000,
  });
  const disconnectedWebContents = activeWebContents;
  const disconnectedPromise = disconnectedBroker.send(reloadRequest(100));
  const disconnectedOperationId = disconnectedRequests[0].request.operationId;
  disconnectedBroker.clearFor(disconnectedWebContents);
  const disconnectedError = await getRejectedError(disconnectedPromise);
  assert.strictEqual(disconnectedError.data.code, 'MCP_EDITOR_WINDOW_CLOSED');
  assert.strictEqual(
    disconnectedError.data.reloadOperation.rendererConnectionState,
    'disconnected'
  );

  const crashedRequests = [];
  const crashedWebContents = {
    isDestroyed: () => false,
    getOSProcessId: () => 1357,
    send: (channel, request) => crashedRequests.push({ channel, request }),
  };
  const crashedBroker = createMcpRendererRequestBroker({
    getWebContents: () => crashedWebContents,
    defaultRequestTimeoutMs: 100,
  });
  const crashedPromise = crashedBroker.send({
    method: 'tools/call',
    params: { name: 'gdevelop_get_editor_state', arguments: {} },
  });
  crashedBroker.clearFor(crashedWebContents, {
    code: 'MCP_RENDERER_PROCESS_GONE',
    message: 'The GDevelop editor renderer process exited (oom).',
    rendererProcessGone: { reason: 'oom', exitCode: 0 },
  });
  const crashedError = await getRejectedError(crashedPromise);
  assert.strictEqual(crashedError.data.code, 'MCP_RENDERER_PROCESS_GONE');
  assert.strictEqual(crashedError.data.rendererProcessGone.reason, 'oom');
  activeWebContents = { isDestroyed: () => false, send: () => {} };
  const retainedDisconnectError = await getRejectedError(
    disconnectedBroker.send({
      method: 'tools/call',
      params: {
        name: 'reload_project',
        arguments: { operation_id: disconnectedOperationId },
      },
    })
  );
  assert.strictEqual(retainedDisconnectError, disconnectedError);
  await delay(20);
  const expiredError = await getRejectedError(
    disconnectedBroker.send({
      method: 'tools/call',
      params: {
        name: 'reload_project',
        arguments: { operation_id: disconnectedOperationId },
      },
    })
  );
  assert.strictEqual(expiredError.data.code, 'MCP_RELOAD_OPERATION_NOT_FOUND');
  assert.strictEqual(
    expiredError.data.expiryReason,
    'retention-window-elapsed'
  );
  assert.strictEqual(
    expiredError.data.lastKnownReloadOperation.rendererConnectionState,
    'disconnected'
  );

  let throwOnSend = true;
  let recoveredRequest = null;
  const flakyWebContents = {
    isDestroyed: () => false,
    send: (channel, request) => {
      if (throwOnSend) throw new Error('IPC send failed.');
      recoveredRequest = { channel, request };
    },
  };
  const flakyBroker = createMcpRendererRequestBroker({
    getWebContents: () => flakyWebContents,
    defaultReloadTimeoutMs: 100,
    reloadOperationInactivityTimeoutMs: 1000,
  });
  await assert.rejects(flakyBroker.send(reloadRequest(100)), /IPC send failed/);
  throwOnSend = false;
  const recoveredReloadPromise = flakyBroker.send(reloadRequest(100));
  assert(recoveredRequest);
  flakyBroker.handleResponse(flakyWebContents, {
    id: recoveredRequest.request.id,
    result: toolResult({ success: true, reloaded: true }),
  });
  const recoveredReloadResult = await recoveredReloadPromise;
  assert.strictEqual(recoveredReloadResult.structuredContent.reloaded, true);
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
