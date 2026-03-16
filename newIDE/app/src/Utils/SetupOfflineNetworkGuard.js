// @flow
import { OFFLINE_MODE, isLocalOrRelativeUrl } from './OfflineMode';

let guardInstalled = false;

export const setupOfflineNetworkGuard = () => {
  if (!OFFLINE_MODE || guardInstalled) return;
  guardInstalled = true;

  // Guard fetch requests.
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo, init?: RequestInit) => {
      const url =
        typeof input === 'string' ? input : input && input.url ? input.url : '';
      if (!isLocalOrRelativeUrl(url)) {
        return Promise.reject(
          new Error('Offline mode: remote network requests are blocked.')
        );
      }
      return originalFetch(input, init);
    };
  }

  // Guard XMLHttpRequest requests.
  if (typeof XMLHttpRequest !== 'undefined') {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    // $FlowFixMe[prop-missing]
    XMLHttpRequest.prototype.open = function(
      method: string,
      url: string,
      ...rest: any[]
    ) {
      // $FlowFixMe[prop-missing]
      this.__offlineBlocked = !isLocalOrRelativeUrl(String(url || ''));
      // $FlowFixMe[prop-missing]
      return originalOpen.call(this, method, url, ...rest);
    };

    // $FlowFixMe[prop-missing]
    XMLHttpRequest.prototype.send = function(...args: any[]) {
      // $FlowFixMe[prop-missing]
      if (this.__offlineBlocked) {
        try {
          this.abort();
        } catch {}
        const error = new Error(
          'Offline mode: remote network requests are blocked.'
        );
        setTimeout(() => {
          try {
            if (typeof this.onerror === 'function') this.onerror(error);
            this.dispatchEvent(new Event('error'));
          } catch {}
        }, 0);
        return;
      }
      // $FlowFixMe[prop-missing]
      return originalSend.apply(this, args);
    };
  }

  // Guard WebSocket connections.
  if (typeof window !== 'undefined' && window.WebSocket) {
    const OriginalWebSocket = window.WebSocket;
    // $FlowFixMe[incompatible-type]
    window.WebSocket = function(url: string, protocols?: string | string[]) {
      if (!isLocalOrRelativeUrl(String(url || ''))) {
        throw new Error(
          'Offline mode: remote WebSocket connections are blocked.'
        );
      }
      // $FlowFixMe[incompatible-call]
      return new OriginalWebSocket(url, protocols);
    };
    // $FlowFixMe[prop-missing]
    window.WebSocket.prototype = OriginalWebSocket.prototype;
  }
};
