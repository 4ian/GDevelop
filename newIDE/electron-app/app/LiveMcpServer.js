const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * A Model Context Protocol server (the "Streamable HTTP" transport) letting an
 * AI agent (Claude Code, Cursor...) edit the project opened in a running
 * editor window, with the editor functions also served by `--mcp` (see
 * `CliMcpServer.js` in the app, which handles the messages).
 *
 * Opt-in, on 127.0.0.1 only, with a bearer token. Each agent session is bound
 * to the editor window focused when it connected: its messages are sent to
 * this window (`mcp-live-message`), which answers with `mcp-live-send`.
 */

const DEFAULT_PORT = 52520;
const PORT_ATTEMPTS = 10;
const MAX_BODY_BYTES = 10 * 1024 * 1024;
const MCP_PATH = '/mcp';

const makeJsonRpcError = (id, code, message) => ({
  jsonrpc: '2.0',
  id: id === undefined ? null : id,
  error: { code, message },
});

const isLoopbackHost = hostHeader => {
  if (!hostHeader) return false;
  const hostname = hostHeader.replace(/:\d+$/, '');
  return (
    hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]'
  );
};

// A browser page can reach a local server: only requests without an origin
// (agents are not browsers) or from a local page are accepted.
const isAllowedOrigin = origin => {
  if (!origin) return true;
  try {
    return isLoopbackHost(new URL(origin).host);
  } catch (error) {
    return false;
  }
};

const isTokenValid = (authorizationHeader, token) => {
  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader || '');
  if (!match) return false;
  const received = Buffer.from(match[1].trim());
  const expected = Buffer.from(token);
  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

/**
 * @param {{
 *   getTargetWindow: () => ?{ id: number, isDestroyed: () => boolean, webContents: { send: (channel: string, payload: any) => void } },
 *   log: { info: Function, warn: Function, error: Function },
 * }} options
 */
const createLiveMcpServer = ({ getTargetWindow, log }) => {
  let server = null;
  let listeningPort = null;
  let token = null;
  // sessionId -> { window }
  const sessions = new Map();
  // `${sessionId} ${JSON id}` -> { resolve, windowId }
  const pendingResponses = new Map();

  const getPendingKey = (sessionId, id) => `${sessionId} ${JSON.stringify(id)}`;

  const sendToWindow = (session, sessionId, message) => {
    if (session.window.isDestroyed()) return false;
    session.window.webContents.send('mcp-live-message', {
      sessionId,
      line: JSON.stringify(message),
    });
    return true;
  };

  const forwardRequest = (session, sessionId, message) =>
    new Promise(resolve => {
      const pendingKey = getPendingKey(sessionId, message.id);
      pendingResponses.set(pendingKey, {
        resolve,
        windowId: session.window.id,
      });
      if (!sendToWindow(session, sessionId, message)) {
        pendingResponses.delete(pendingKey);
        resolve(
          makeJsonRpcError(
            message.id,
            -32000,
            'The GDevelop window of this session was closed. Reconnect to use the window now opened.'
          )
        );
      }
    });

  /** Called with what a window sent on `mcp-live-send`. */
  const onWindowResponse = ({ sessionId, text }) => {
    let response;
    try {
      response = JSON.parse(text);
    } catch (error) {
      return;
    }
    if (!response || response.id === undefined || response.id === null) return;
    const pendingKey = getPendingKey(sessionId, response.id);
    const pending = pendingResponses.get(pendingKey);
    if (!pending) return;
    pendingResponses.delete(pendingKey);
    pending.resolve(response);
  };

  /** Fails the calls waiting for a closed window, and forgets its sessions. */
  const onWindowClosed = windowId => {
    pendingResponses.forEach((pending, pendingKey) => {
      if (pending.windowId !== windowId) return;
      pendingResponses.delete(pendingKey);
      const id = JSON.parse(pendingKey.slice(pendingKey.indexOf(' ') + 1));
      pending.resolve(
        makeJsonRpcError(
          id,
          -32000,
          'The GDevelop window of this session was closed.'
        )
      );
    });
    sessions.forEach((session, sessionId) => {
      if (session.window.id === windowId) sessions.delete(sessionId);
    });
  };

  const sendJson = (res, statusCode, body, headers = {}) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      ...headers,
    });
    res.end(JSON.stringify(body));
  };

  const readBody = req =>
    new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          reject(new Error('Request too large.'));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });

  const handlePost = async (req, res) => {
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch (error) {
      sendJson(res, 400, makeJsonRpcError(null, -32700, 'Parse error.'));
      return;
    }
    const messages = Array.isArray(body) ? body : [body];
    if (
      !messages.length ||
      messages.some(message => !message || typeof message !== 'object')
    ) {
      sendJson(res, 400, makeJsonRpcError(null, -32600, 'Invalid request.'));
      return;
    }

    const isInitialization = messages.some(
      message => message.method === 'initialize'
    );
    let sessionId = req.headers['mcp-session-id'];
    let session = sessionId ? sessions.get(sessionId) : null;
    const responseHeaders = {};
    if (isInitialization) {
      const window = getTargetWindow();
      if (!window) {
        sendJson(
          res,
          503,
          makeJsonRpcError(null, -32000, 'No GDevelop window is opened.')
        );
        return;
      }
      sessionId = crypto.randomUUID();
      session = { window };
      sessions.set(sessionId, session);
      responseHeaders['Mcp-Session-Id'] = sessionId;
      log.info(
        `[MCP] Agent session ${sessionId} bound to the window ${window.id}.`
      );
    } else if (!sessionId) {
      sendJson(
        res,
        400,
        makeJsonRpcError(null, -32000, 'Missing Mcp-Session-Id header.')
      );
      return;
    } else if (!session) {
      sendJson(res, 404, makeJsonRpcError(null, -32001, 'Session not found.'));
      return;
    }

    const requests = messages.filter(
      message =>
        typeof message.method === 'string' &&
        message.id !== undefined &&
        message.id !== null
    );
    // Notifications (and responses) are delivered without waiting.
    messages
      .filter(message => !requests.includes(message))
      .forEach(message => sendToWindow(session, sessionId, message));
    if (!requests.length) {
      res.writeHead(202, responseHeaders);
      res.end();
      return;
    }

    const responses = await Promise.all(
      requests.map(message => forwardRequest(session, sessionId, message))
    );
    if (res.destroyed) return;
    sendJson(
      res,
      200,
      Array.isArray(body) ? responses : responses[0],
      responseHeaders
    );
  };

  const handleRequest = (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (url.pathname !== MCP_PATH) {
      sendJson(res, 404, { error: 'Not found.' });
      return;
    }
    if (
      !isLoopbackHost(req.headers.host) ||
      !isAllowedOrigin(req.headers.origin)
    ) {
      sendJson(res, 403, { error: 'Forbidden.' });
      return;
    }
    if (!token || !isTokenValid(req.headers.authorization, token)) {
      sendJson(
        res,
        401,
        makeJsonRpcError(null, -32000, 'Invalid or missing bearer token.'),
        { 'WWW-Authenticate': 'Bearer' }
      );
      return;
    }

    if (req.method === 'POST') {
      handlePost(req, res).catch(error => {
        log.error('[MCP] Error while handling a request:', error);
        if (!res.headersSent)
          sendJson(res, 500, makeJsonRpcError(null, -32603, 'Internal error.'));
      });
      return;
    }
    if (req.method === 'DELETE') {
      const sessionId = req.headers['mcp-session-id'];
      const session = sessionId ? sessions.get(sessionId) : null;
      if (!session) {
        sendJson(
          res,
          404,
          makeJsonRpcError(null, -32001, 'Session not found.')
        );
        return;
      }
      sessions.delete(sessionId);
      if (!session.window.isDestroyed())
        session.window.webContents.send('mcp-live-session-closed', {
          sessionId,
        });
      res.writeHead(204);
      res.end();
      return;
    }
    // No stream of messages initiated by the server.
    res.writeHead(405, { Allow: 'POST, DELETE' });
    res.end();
  };

  const listen = port =>
    new Promise((resolve, reject) => {
      const newServer = http.createServer(handleRequest);
      // A tool call (like a gameplay test) can take minutes.
      newServer.requestTimeout = 0;
      newServer.once('error', reject);
      newServer.listen(port, '127.0.0.1', () => {
        newServer.removeListener('error', reject);
        resolve(newServer);
      });
    });

  const start = async ({ port, token: newToken }) => {
    await stop();
    token = newToken;
    let lastError = null;
    for (let attempt = 0; attempt < PORT_ATTEMPTS; attempt++) {
      try {
        server = await listen(port + attempt);
        listeningPort = server.address().port;
        log.info(
          `[MCP] Live editor server listening on port ${listeningPort}.`
        );
        return listeningPort;
      } catch (error) {
        lastError = error;
        if (error.code !== 'EADDRINUSE') break;
      }
    }
    throw lastError || new Error('Could not start the server.');
  };

  const stop = () =>
    new Promise(resolve => {
      sessions.forEach((session, sessionId) => {
        if (!session.window.isDestroyed())
          session.window.webContents.send('mcp-live-session-closed', {
            sessionId,
          });
      });
      sessions.clear();
      pendingResponses.forEach((pending, pendingKey) => {
        const id = JSON.parse(pendingKey.slice(pendingKey.indexOf(' ') + 1));
        pending.resolve(
          makeJsonRpcError(id, -32000, 'The GDevelop MCP server was stopped.')
        );
      });
      pendingResponses.clear();
      listeningPort = null;
      if (!server) return resolve();
      const stoppedServer = server;
      server = null;
      stoppedServer.close(() => resolve());
      if (stoppedServer.closeAllConnections)
        stoppedServer.closeAllConnections();
    });

  return {
    start,
    stop,
    onWindowResponse,
    onWindowClosed,
    getPort: () => listeningPort,
    getSessionsCount: () => sessions.size,
  };
};

/** The settings (enabled, port, token), kept in the user data folder. */
const makeLiveMcpServerSettingsStore = userDataPath => {
  const settingsPath = path.join(userDataPath, 'mcp-live-server.json');
  const read = () => {
    let settings = {};
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) || {};
    } catch (error) {}
    return {
      enabled: !!settings.enabled,
      port:
        Number.isInteger(settings.port) && settings.port > 0
          ? settings.port
          : DEFAULT_PORT,
      token:
        typeof settings.token === 'string' && settings.token.length >= 32
          ? settings.token
          : null,
    };
  };
  const write = settings => {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), {
      mode: 0o600,
    });
  };
  const readOrCreate = () => {
    const settings = read();
    if (settings.token) return settings;
    const newSettings = {
      ...settings,
      token: crypto.randomBytes(32).toString('hex'),
    };
    write(newSettings);
    return newSettings;
  };
  return { read: readOrCreate, write };
};

module.exports = {
  createLiveMcpServer,
  makeLiveMcpServerSettingsStore,
  DEFAULT_PORT,
};
