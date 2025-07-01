// @ts-check
/**
 * Vitest setup file for GDJS tests.
 * This replaces the initialization that was done by Karma configuration.
 */

// Import expect.js for compatibility with existing tests
import expect from 'expect.js';

// Make expect available globally for compatibility with existing tests
globalThis.expect = expect;
window.expect = expect;

// Make mocha globals available for compatibility
globalThis.describe = globalThis.describe || describe;
globalThis.it = globalThis.it || it;
globalThis.beforeEach = globalThis.beforeEach || beforeEach;
globalThis.afterEach = globalThis.afterEach || afterEach;
// Vitest doesn't have before/after hooks, so we create them as aliases to beforeEach/afterEach
globalThis.before = globalThis.before || beforeEach;
globalThis.after = globalThis.after || afterEach;

// Add performance polyfill if needed
if (typeof performance === 'undefined') {
  globalThis.performance = {
    now: () => Date.now()
  };
}

// Create a simple sinon mock for compatibility
if (typeof sinon === 'undefined') {
  globalThis.sinon = {
    spy: (obj, method) => {
      const original = obj[method];
      const spy = function(...args) {
        spy.callCount++;
        spy.calledWith = args;
        return original?.apply(this, args);
      };
      spy.callCount = 0;
      spy.restore = () => { obj[method] = original; };
      obj[method] = spy;
      return spy;
    },
    stub: (obj, method) => {
      const original = obj[method];
      const stub = function(...args) {
        stub.callCount++;
        stub.calledWith = args;
        return stub.returnValue;
      };
      stub.callCount = 0;
      stub.returns = (value) => { stub.returnValue = value; return stub; };
      stub.restore = () => { obj[method] = original; };
      obj[method] = stub;
      return stub;
    }
  };
}