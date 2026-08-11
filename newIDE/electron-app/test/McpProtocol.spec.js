const assert = require('assert');

const {
  createJsonRpcResult,
  createJsonRpcError,
  createTextToolResult,
  createErrorToolResult,
  getInitializeResult,
} = require('../app/Mcp/McpProtocol');

const run = () => {
  assert.deepStrictEqual(createJsonRpcResult(1, { ok: true }), {
    jsonrpc: '2.0',
    id: 1,
    result: { ok: true },
  });

  assert.deepStrictEqual(createJsonRpcError('abc', -32601, 'Unknown method'), {
    jsonrpc: '2.0',
    id: 'abc',
    error: {
      code: -32601,
      message: 'Unknown method',
    },
  });

  assert.deepStrictEqual(createTextToolResult({ hello: 'world' }), {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ hello: 'world' }, null, 2),
      },
    ],
    structuredContent: { hello: 'world' },
  });

  assert.deepStrictEqual(createErrorToolResult('No project opened.'), {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          { success: false, error: 'No project opened.' },
          null,
          2
        ),
      },
    ],
    structuredContent: {
      success: false,
      error: 'No project opened.',
    },
  });

  const initializeResult = getInitializeResult();
  assert.strictEqual(initializeResult.protocolVersion, '2025-06-18');
  assert.strictEqual(initializeResult.serverInfo.name, 'gdevelop-editor');
  assert.strictEqual(initializeResult.capabilities.tools.listChanged, true);
  assert.strictEqual(initializeResult.capabilities.resources.listChanged, true);
};

run();
