const assert = require('assert');
const http = require('http');

const {
  handleMcpJsonRpcRequest,
  startMcpServer,
  stopMcpServer,
} = require('../app/Mcp/McpServer');

const request = ({ port, body }) =>
  new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        });
      }
    );
    req.on('error', reject);
    req.end(JSON.stringify(body));
  });

const run = async () => {
  const initializeResponse = await handleMcpJsonRpcRequest({
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {},
    },
    sendRendererRequest: async () => {
      throw new Error('Renderer should not be called for initialize');
    },
  });
  assert.strictEqual(
    initializeResponse.result.serverInfo.name,
    'gdevelop-editor'
  );

  const forwarded = [];
  const toolsResponse = await handleMcpJsonRpcRequest({
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/list',
    },
    sendRendererRequest: async rendererRequest => {
      forwarded.push(rendererRequest);
      return { tools: [{ name: 'gdevelop_get_editor_state' }] };
    },
  });
  assert.deepStrictEqual(forwarded, [{ method: 'tools/list', params: {} }]);
  assert.deepStrictEqual(toolsResponse.result.tools, [
    { name: 'gdevelop_get_editor_state' },
  ]);

  const unknownMethodResponse = await handleMcpJsonRpcRequest({
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'not/a-method',
    },
    sendRendererRequest: async () => ({ ok: true }),
  });
  assert.strictEqual(unknownMethodResponse.error.code, -32601);

  const rendererError = new Error('Renderer timed out.');
  rendererError.data = {
    code: 'MCP_RENDERER_TIMEOUT',
    operationId: 'reload-project-1',
  };
  const rendererFailureResponse = await handleMcpJsonRpcRequest({
    request: {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: { name: 'reload_project', arguments: {} },
    },
    sendRendererRequest: async () => {
      throw rendererError;
    },
  });
  assert.strictEqual(rendererFailureResponse.error.code, -32603);
  assert.deepStrictEqual(
    rendererFailureResponse.error.data,
    rendererError.data
  );

  const server = await startMcpServer({
    port: 0,
    sendRendererRequest: async rendererRequest => {
      if (rendererRequest.method === 'tools/list') {
        return { tools: [{ name: 'read_scene_events' }] };
      }
      return {};
    },
  });

  try {
    assert.strictEqual(server.url, `http://127.0.0.1:${server.port}/mcp`);
    const response = await request({
      port: server.port,
      body: {
        jsonrpc: '2.0',
        id: 'http-tools',
        method: 'tools/list',
      },
    });
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.body.result.tools, [
      { name: 'read_scene_events' },
    ]);
  } finally {
    await stopMcpServer(server);
  }
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
