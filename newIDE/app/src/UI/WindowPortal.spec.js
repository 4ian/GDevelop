/**
 * @jest-environment jsdom
 * @jest-environment-options {"url":"http://localhost/"}
 */
// @flow
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import WindowPortal from './WindowPortal';

jest.mock('../Utils/Window', () => ({
  __esModule: true,
  default: { setUpContextMenu: jest.fn() },
  registerDocumentTargetId: jest.fn(),
  unregisterDocumentTargetId: jest.fn(),
}));

jest.mock('./Theme', () => ({
  getThemeWindowBackgroundColor: () => '#202020',
}));

jest.mock('../Utils/SilenceBenignResizeObserverError', () => ({
  silenceBenignResizeObserverError: jest.fn(),
}));

jest.mock('../Utils/ElectronConflictingOperationsMutex', () => ({
  notifyWindowClosed: jest.fn(),
  startWindowClosingIfSafe: () => true,
  waitToSafelyStartWindowClosing: () => Promise.resolve(),
}));

class FakeResizeObserver {
  _callback: Function;

  constructor(callback: Function) {
    this._callback = callback;
  }

  observe() {
    this._callback([{ contentRect: { width: 800, height: 600 } }]);
  }

  disconnect() {}
}

describe('WindowPortal', () => {
  let originalResizeObserver;
  let originalWindowOpen;
  let previousActEnvironment;

  beforeEach(() => {
    jest.useFakeTimers();
    originalResizeObserver = (global: any).ResizeObserver;
    originalWindowOpen = window.open;
    previousActEnvironment = (global: any).IS_REACT_ACT_ENVIRONMENT;
    (global: any).IS_REACT_ACT_ENVIRONMENT = true;
    (global: any).ResizeObserver = FakeResizeObserver;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    (global: any).ResizeObserver = originalResizeObserver;
    (global: any).IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    window.open = originalWindowOpen;
  });

  test('unmounts portal content synchronously before the child window unloads', () => {
    const externalDocument = document.implementation.createHTMLDocument(
      'GDevelop pop-out'
    );
    const eventListeners: { [string]: Function } = {};
    const closeExternalWindow: () => void = jest.fn();
    const focusExternalWindow: () => void = jest.fn();
    const externalWindow = {
      closed: false,
      close: closeExternalWindow,
      document: externalDocument,
      addEventListener: jest.fn((type: string, listener: Function) => {
        eventListeners[type] = listener;
      }),
      focus: focusExternalWindow,
    };
    window.open = jest.fn(() => externalWindow);

    const portalContentUnmounted: () => void = jest.fn();
    const PortalContent = () => {
      React.useLayoutEffect(() => portalContentUnmounted, []);
      return <div id="portal-test-content">Portal content</div>;
    };

    const mainContainer = document.createElement('div');
    const body = document.body;
    if (!body) throw new Error('Document body not found.');
    body.appendChild(mainContainer);
    const root = createRoot(mainContainer);

    act(() => {
      root.render(
        <WindowPortal
          title="Test pop-out"
          renderContent={() => <PortalContent />}
          onClose={() => {}}
          initialWidth={800}
          initialHeight={600}
          onWindowReady={() => {}}
        />
      );
    });

    expect(externalDocument.getElementById('portal-test-content')).not.toBe(
      null
    );
    expect(eventListeners.beforeunload).toBeDefined();

    // This callback returns control to the browser immediately. The portal
    // cleanup must already have committed before that happens.
    act(() => {
      eventListeners.beforeunload({
        preventDefault: jest.fn(),
        returnValue: '',
      });
    });

    expect(portalContentUnmounted).toHaveBeenCalledTimes(1);
    expect(externalDocument.getElementById('portal-test-content')).toBe(null);

    act(() => root.unmount());
    mainContainer.remove();
  });
});
