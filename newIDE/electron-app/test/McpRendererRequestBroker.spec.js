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

const run = async () => {
  const sentRequests = [];
  const webContents = {
    isDestroyed: () => false,
    send: (channel, request) => sentRequests.push({ channel, request }),
  };
  const broker = createMcpRendererRequestBroker({
    getWebContents: () => webContents,
    defaultRequestTimeoutMs: 50,
    defaultReloadTimeoutMs: 5,
    minimumRequestTimeoutMs: 1,
    reloadOperationRetentionMs: 1000,
  });
  const reloadRequest = {
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { timeout_ms: 5 },
    },
  };

  let timeoutError = null;
  try {
    await broker.send(reloadRequest);
  } catch (error) {
    timeoutError = error;
  }
  assert(timeoutError);
  assert.strictEqual(timeoutError.data.code, 'MCP_RENDERER_TIMEOUT');
  assert.strictEqual(timeoutError.data.operationStatus, 'running');
  const operationId = timeoutError.data.operationId;
  assert(operationId);
  assert.strictEqual(timeoutError.data.operation_id, operationId);
  assert.strictEqual(sentRequests.length, 1);

  const retryPromise = broker.send({
    method: 'tools/call',
    params: {
      name: 'reload_project',
      arguments: { operation_id: operationId, timeout_ms: 100 },
    },
  });
  await delay(1);
  assert.strictEqual(sentRequests.length, 1);
  broker.handleResponse(webContents, {
    id: sentRequests[0].request.id,
    result: toolResult({ success: true, reloaded: true }),
  });
  const retryResult = await retryPromise;
  assert.strictEqual(retryResult.structuredContent.reloaded, true);
  assert.strictEqual(
    retryResult.structuredContent.reloadOperation.id,
    operationId
  );
  assert.strictEqual(
    retryResult.structuredContent.reloadOperation.attachedToExistingOperation,
    true
  );

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
  });
  await assert.rejects(flakyBroker.send(reloadRequest), /IPC send failed/);
  throwOnSend = false;
  const recoveredReloadPromise = flakyBroker.send(reloadRequest);
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
