// @flow
import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { usePreviewDebuggerServerWatcher } from './PreviewState';

const makePreviewDebuggerServer = () => {
  let callbacks = null;
  let debuggerIds = [];

  return {
    setDebuggerIds: (ids: Array<string>) => {
      debuggerIds = ids;
    },
    getCallbacks: () => {
      if (!callbacks) throw new Error('Callbacks were not registered.');
      return callbacks;
    },
    server: {
      registerCallbacks: registeredCallbacks => {
        callbacks = registeredCallbacks;
        return () => {
          callbacks = null;
        };
      },
      getExistingDebuggerIds: () => debuggerIds,
      getExistingEmbeddedGameFrameDebuggerIds: () =>
        debuggerIds.filter(id => id === 'embedded-game-frame'),
      getExistingPreviewDebuggerIds: () =>
        debuggerIds.filter(id => id !== 'embedded-game-frame'),
      sendMessage: jest.fn(),
      startServer: jest.fn(),
      stopServer: jest.fn(),
      registerEmbeddedGameFrame: jest.fn(),
      unregisterEmbeddedGameFrame: jest.fn(),
      closeAllPreviewConnections: jest.fn(),
      closeAllConnections: jest.fn(),
    },
  };
};

describe('usePreviewDebuggerServerWatcher', () => {
  it('clears stale native preview statuses when the preview window is closed', () => {
    const previewDebuggerServer = makePreviewDebuggerServer();
    let latestResults = null;
    let renderer = null;

    const HookCapture = () => {
      latestResults = usePreviewDebuggerServerWatcher(
        previewDebuggerServer.server
      );
      return null;
    };

    act(() => {
      renderer = TestRenderer.create(<HookCapture />);
    });

    act(() => {
      previewDebuggerServer.setDebuggerIds([
        'preview-ws-1',
        'embedded-game-frame',
      ]);
      const callbacks = previewDebuggerServer.getCallbacks();
      callbacks.onHandleParsedMessage({
        id: 'preview-ws-1',
        parsedMessage: {
          command: 'status',
          payload: {
            isPaused: false,
            isInGameEdition: false,
            sceneName: 'Game Scene',
          },
        },
      });
      callbacks.onHandleParsedMessage({
        id: 'embedded-game-frame',
        parsedMessage: {
          command: 'status',
          payload: {
            isPaused: false,
            isInGameEdition: true,
            sceneName: 'Game Scene',
          },
        },
      });
    });

    expect(latestResults.hasNonEditionPreviewsRunning).toBe(true);
    expect(latestResults.hasInGameEditionPreviewRunning).toBe(true);

    act(() => {
      previewDebuggerServer.setDebuggerIds(['embedded-game-frame']);
      latestResults.clearPreviewDebuggerStatuses();
    });

    expect(latestResults.hasNonEditionPreviewsRunning).toBe(false);
    expect(latestResults.nonEditionPreviewsCount).toBe(0);
    expect(latestResults.hasInGameEditionPreviewRunning).toBe(true);

    act(() => {
      if (renderer) renderer.unmount();
    });
  });

  it('ignores status messages from debugger ids that are already closed', () => {
    const previewDebuggerServer = makePreviewDebuggerServer();
    let latestResults = null;
    let renderer = null;
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const HookCapture = () => {
      latestResults = usePreviewDebuggerServerWatcher(
        previewDebuggerServer.server
      );
      return null;
    };

    act(() => {
      renderer = TestRenderer.create(<HookCapture />);
    });

    act(() => {
      previewDebuggerServer.setDebuggerIds([]);
      previewDebuggerServer.getCallbacks().onHandleParsedMessage({
        id: 'preview-ws-1',
        parsedMessage: {
          command: 'status',
          payload: {
            isPaused: false,
            isInGameEdition: false,
            sceneName: 'Game Scene',
          },
        },
      });
    });

    expect(latestResults.hasNonEditionPreviewsRunning).toBe(false);
    expect(latestResults.nonEditionPreviewsCount).toBe(0);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Ignoring status from closed or unknown preview debugger id "preview-ws-1".'
    );
    consoleWarnSpy.mockRestore();

    act(() => {
      if (renderer) renderer.unmount();
    });
  });

  it('does not update state when clearing already synchronized preview statuses', () => {
    const previewDebuggerServer = makePreviewDebuggerServer();
    let latestResults = null;
    let renderer = null;
    let renderCount = 0;

    const HookCapture = () => {
      renderCount++;
      latestResults = usePreviewDebuggerServerWatcher(
        previewDebuggerServer.server
      );
      return null;
    };

    act(() => {
      renderer = TestRenderer.create(<HookCapture />);
    });

    expect(renderCount).toBe(1);

    act(() => {
      latestResults.clearPreviewDebuggerStatuses();
      latestResults.clearPreviewDebuggerStatuses();
      latestResults.clearPreviewDebuggerStatuses();
    });

    expect(renderCount).toBe(1);

    act(() => {
      previewDebuggerServer.getCallbacks().onConnectionClosed({
        id: 'preview-ws-already-closed',
        debuggerIds: [],
      });
    });

    expect(renderCount).toBe(1);

    act(() => {
      if (renderer) renderer.unmount();
    });
  });
});
