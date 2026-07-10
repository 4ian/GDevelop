const MCP_PROTOCOL_VERSION = '2025-06-18';

const JSON_RPC_ERROR_CODES = {
  parseError: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internalError: -32603,
};

const createJsonRpcResult = (id, result) => ({
  jsonrpc: '2.0',
  id,
  result,
});

const createJsonRpcError = (id, code, message, data) => {
  const error = {
    code,
    message,
  };
  if (data !== undefined) error.data = data;

  return {
    jsonrpc: '2.0',
    id,
    error,
  };
};

const stringifyToolPayload = payload =>
  typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);

const createTextToolResult = payload => ({
  content: [
    {
      type: 'text',
      text: stringifyToolPayload(payload),
    },
  ],
  ...(payload && typeof payload === 'object' && !Array.isArray(payload)
    ? { structuredContent: payload }
    : {}),
});

const createErrorToolResult = message => {
  const payload = {
    success: false,
    error: String(message),
  };
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
};

const getInitializeResult = () => ({
  protocolVersion: MCP_PROTOCOL_VERSION,
  capabilities: {
    tools: {
      listChanged: true,
    },
    resources: {
      listChanged: true,
    },
    prompts: {
      listChanged: true,
    },
  },
  serverInfo: {
    name: 'gdevelop-editor',
    version: '1.0.0',
  },
});

const validateBearerToken = (authorizationHeader, expectedToken) => {
  if (!expectedToken) return false;
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return false;
  }

  return authorizationHeader === `Bearer ${expectedToken}`;
};

module.exports = {
  MCP_PROTOCOL_VERSION,
  JSON_RPC_ERROR_CODES,
  createJsonRpcResult,
  createJsonRpcError,
  createTextToolResult,
  createErrorToolResult,
  getInitializeResult,
  validateBearerToken,
};
