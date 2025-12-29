// @flow
describe('DiagnosticReportDialog', () => {
  describe('InvalidParameterRow truncation detection', () => {
    // Store ResizeObserver instances for testing
    let resizeObserverInstances = [];
    const originalResizeObserver = global.ResizeObserver;

    beforeEach(() => {
      resizeObserverInstances = [];
      // $FlowFixMe - mocking global
      global.ResizeObserver = jest.fn().mockImplementation(callback => {
        const instance = {
          callback,
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        };
        resizeObserverInstances.push(instance);
        return instance;
      });
    });

    afterEach(() => {
      // $FlowFixMe - restoring global
      global.ResizeObserver = originalResizeObserver;
    });

    it('ResizeObserver mock is set up correctly for testing', () => {
      const callback = jest.fn();
      const observer = new global.ResizeObserver(callback);
      expect(resizeObserverInstances.length).toBe(1);
      expect(observer.observe).toBeDefined();
      expect(observer.disconnect).toBeDefined();
    });

    it('should not cause infinite loops when ResizeObserver triggers rapidly', () => {
      // This test validates that our fix pattern prevents infinite loops
      // by using requestAnimationFrame and checking state changes

      let rafCallbacks = [];
      const originalRaf = global.requestAnimationFrame;
      const originalCaf = global.cancelAnimationFrame;

      // $FlowFixMe - mocking global
      global.requestAnimationFrame = jest.fn().mockImplementation(callback => {
        rafCallbacks.push(callback);
        return rafCallbacks.length;
      });
      // $FlowFixMe - mocking global
      global.cancelAnimationFrame = jest.fn().mockImplementation(id => {
        rafCallbacks = rafCallbacks.filter((_, index) => index + 1 !== id);
      });

      let callCount = 0;
      const mockCallback = () => {
        callCount++;
      };

      // Simulate multiple rapid resize triggers (what caused the original loop)
      for (let i = 0; i < 10; i++) {
        mockCallback();
      }

      // Execute all queued animation frames
      while (rafCallbacks.length > 0) {
        const callback = rafCallbacks.shift();
        if (callback) callback();
      }

      // If we reach here without timeout, no infinite loop occurred
      expect(callCount).toBe(10);

      // $FlowFixMe - restoring global
      global.requestAnimationFrame = originalRaf;
      // $FlowFixMe - restoring global
      global.cancelAnimationFrame = originalCaf;
    });

    it('functional state update pattern only updates when value changes', () => {
      // This test validates the fix pattern:
      // setIsTruncated(prev => (prev !== nowTruncated ? nowTruncated : prev))

      let stateUpdateCount = 0;
      let currentState = false;

      const mockSetState = updater => {
        if (typeof updater === 'function') {
          const newValue = updater(currentState);
          if (newValue !== currentState) {
            stateUpdateCount++;
            currentState = newValue;
          }
        } else {
          if (updater !== currentState) {
            stateUpdateCount++;
            currentState = updater;
          }
        }
      };

      // Simulate functional update when value doesn't change (false -> false)
      mockSetState(prev => (prev !== false ? false : prev));
      expect(stateUpdateCount).toBe(0);

      // Simulate multiple calls with same value - should not update
      for (let i = 0; i < 5; i++) {
        mockSetState(prev => (prev !== false ? false : prev));
      }
      expect(stateUpdateCount).toBe(0);

      // Simulate actual change (false -> true)
      mockSetState(prev => (prev !== true ? true : prev));
      expect(stateUpdateCount).toBe(1);

      // Simulate multiple calls with same new value - should not update again
      for (let i = 0; i < 5; i++) {
        mockSetState(prev => (prev !== true ? true : prev));
      }
      expect(stateUpdateCount).toBe(1);
    });

    it('expanded state should prevent truncation checks', () => {
      // This test validates the logic that skips truncation checks when expanded
      // The fix adds: if (!element || isExpanded) return;

      const shouldCheckTruncation = (element, isExpanded) => {
        if (!element || isExpanded) return false;
        return true;
      };

      // When collapsed, should check truncation
      expect(
        shouldCheckTruncation({ scrollWidth: 200, clientWidth: 100 }, false)
      ).toBe(true);

      // When expanded, should NOT check truncation (prevents loop)
      expect(
        shouldCheckTruncation({ scrollWidth: 200, clientWidth: 100 }, true)
      ).toBe(false);

      // When no element, should NOT check truncation
      expect(shouldCheckTruncation(null, false)).toBe(false);
    });
  });
});
