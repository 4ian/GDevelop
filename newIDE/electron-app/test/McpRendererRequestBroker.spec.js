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

  const stalledRequests = [];
  const stalledWebContents = {
    isDestroyed: () => false,
    send: (channel, request) => stalledRequests.push({ channel, request }),
  };
  const stalledBroker = createMcpRendererRequestBroker({
    getWebContents: () => stalledWebContents,
    defaultReloadTimeoutMs: 100,
    minimumRequestTimeoutMs: 1,
    reloadOperationRetentionMs: 1000,
    reloadOperationInactivityTimeoutMs: 10,
  });
  const stalledError = await getRejectedError(
    stalledBroker.send(reloadRequest(100))
  );
  const stalledOperationId = stalledRequests[0].request.operationId;
  assert.strictEqual(stalledError.data.code, 'MCP_RELOAD_OPERATION_STALLED');
  assert.strictEqual(stalledError.data.reloadOperation.status, 'failed');
  assert.strictEqual(stalledError.data.reloadOperation.phase, 'request-sent');
  assert.strictEqual(
    stalledError.data.reloadOperation.retentionExpiresAtMs >
      stalledError.data.reloadOperation.completedAtMs,
    true
  );
  const stalledPollError = await getRejectedError(
    stalledBroker.send({
      method: 'tools/call',
      params: {
        name: 'reload_project',
        arguments: { operation_id: stalledOperationId },
      },
    })
  );
  assert.strictEqual(stalledPollError, stalledError);
  assert.strictEqual(stalledRequests.length, 1);

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
