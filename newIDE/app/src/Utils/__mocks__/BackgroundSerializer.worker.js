// @flow
// Mock for BackgroundSerializer.worker.js to prevent "self is not defined" errors in tests

// $FlowFixMe - Mock worker for tests
const MockWorker = jest.fn().mockImplementation(() => {
  return {
    postMessage: jest.fn(),
    onmessage: null,
    onerror: null,
    terminate: jest.fn(),
  };
});

export default MockWorker;
