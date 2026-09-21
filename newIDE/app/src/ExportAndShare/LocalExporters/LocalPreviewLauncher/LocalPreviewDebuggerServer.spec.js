// @flow
import { type PreviewDebuggerServerCallbacks } from '../../PreviewLauncher.flow';

const mockIpcRendererListeners: Map<string, Array<Function>> = new Map();
const mockIpcRenderer = {
  on: jest.fn<[string, Function], void>(),
  removeAllListeners: jest.fn<[string], void>(),
  send: jest.fn<Array<any>, void>(),
};

jest.mock('../../../Utils/OptionalRequire', () =>
  jest.fn((moduleName: string) =>
    moduleName === 'electron' ? { ipcRenderer: mockIpcRenderer } : null
  )
);

/** Simulate a message sent by the Electron main process. */
const emitFromMainProcess = (channel: string, payload: any) =>
  (mockIpcRendererListeners.get(channel) || []).forEach(listener =>
    listener({}, payload)
  );

/**
 * The debugger server keeps its state at the module level, so each test must
 * start from a freshly loaded module.
 */
const loadDebuggerServer = () => {
  jest.resetModules();
  // $FlowFixMe[unsupported-syntax] - required to get a fresh module state.
  return require('./LocalPreviewDebuggerServer').localPreviewDebuggerServer;
};

const makeCallbacks = (): PreviewDebuggerServerCallbacks => ({
  onErrorReceived: jest.fn<Array<any>, void>(),
  onServerStateChanged: jest.fn<Array<any>, void>(),
  onConnectionClosed: jest.fn<Array<any>, void>(),
  onConnectionOpened: jest.fn<Array<any>, void>(),
  onConnectionErrored: jest.fn<Array<any>, void>(),
  onHandleParsedMessage: jest.fn<Array<any>, void>(),
});

describe('LocalPreviewDebuggerServer', () => {
  beforeEach(() => {
    // The server registers a listener for the embedded game frames on the window.
    global.window = { addEventListener: jest.fn() };
    mockIpcRendererListeners.clear();
    // `resetMocks` is enabled, so the implementations are set for each test.
    mockIpcRenderer.on.mockImplementation(
      (channel: string, listener: Function) => {
        mockIpcRendererListeners.set(channel, [
          ...(mockIpcRendererListeners.get(channel) || []),
          listener,
        ]);
      }
    );
    mockIpcRenderer.removeAllListeners.mockImplementation((channel: string) => {
      mockIpcRendererListeners.delete(channel);
    });
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    delete global.window;
  });

  it('is stopped until the server is started', () => {
    const debuggerServer = loadDebuggerServer();

    expect(debuggerServer.getServerState()).toBe('stopped');
  });

  it('is starting while waiting for the server to listen', () => {
    const debuggerServer = loadDebuggerServer();
    const callbacks = makeCallbacks();
    debuggerServer.registerCallbacks(callbacks);

    const startPromise = debuggerServer.startServer({});
    startPromise.catch(() => {});

    expect(debuggerServer.getServerState()).toBe('starting');
    expect(callbacks.onServerStateChanged).toHaveBeenCalledTimes(1);
  });

  it('is started once the server is listening', () => {
    const debuggerServer = loadDebuggerServer();
    const callbacks = makeCallbacks();
    debuggerServer.registerCallbacks(callbacks);

    debuggerServer.startServer({}).catch(() => {});
    emitFromMainProcess('debugger-start-server-done', {
      address: { address: '127.0.0.1', port: 3030 },
    });

    expect(debuggerServer.getServerState()).toBe('started');
    expect(callbacks.onServerStateChanged).toHaveBeenCalledTimes(2);
  });

  it('goes back to stopped if the server does not start in time', async () => {
    const debuggerServer = loadDebuggerServer();
    const callbacks = makeCallbacks();
    debuggerServer.registerCallbacks(callbacks);

    const startPromise = debuggerServer.startServer({});
    const startError = startPromise.catch(error => error);
    jest.advanceTimersByTime(5000);

    expect(await startError).toEqual(expect.any(Error));
    expect(debuggerServer.getServerState()).toBe('stopped');
  });

  it('stays started when the start timeout is reached after the server started', () => {
    const debuggerServer = loadDebuggerServer();
    const callbacks = makeCallbacks();
    debuggerServer.registerCallbacks(callbacks);

    debuggerServer.startServer({}).catch(() => {});
    emitFromMainProcess('debugger-start-server-done', {
      address: { address: '127.0.0.1', port: 3030 },
    });
    jest.advanceTimersByTime(5000);

    expect(debuggerServer.getServerState()).toBe('started');
  });

  it('goes back to stopped when the server errors', () => {
    const debuggerServer = loadDebuggerServer();
    const callbacks = makeCallbacks();
    debuggerServer.registerCallbacks(callbacks);

    debuggerServer.startServer({}).catch(() => {});
    emitFromMainProcess('debugger-error-received', new Error('Some error'));

    expect(debuggerServer.getServerState()).toBe('stopped');
    expect(callbacks.onErrorReceived).toHaveBeenCalledTimes(1);
  });

  it('does not send messages to a server that is not started yet', () => {
    const debuggerServer = loadDebuggerServer();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const startPromise = debuggerServer.startServer({});
    startPromise.catch(() => {});
    debuggerServer.sendMessage('preview-ws-0', { command: 'play' });

    expect(mockIpcRenderer.send).not.toHaveBeenCalledWith(
      'debugger-send-message',
      expect.anything()
    );
  });
});
