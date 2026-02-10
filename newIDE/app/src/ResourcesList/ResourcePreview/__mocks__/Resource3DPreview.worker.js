// @flow
// Mock for Resource3DPreview.worker.js to prevent "self is not defined" errors in tests

// $FlowFixMe[incompatible-type] - Mock worker for tests
// $FlowFixMe[underconstrained-implicit-instantiation]
// $FlowFixMe[signature-verification-failure]
const MockWorker = jest.fn().mockImplementation(() => {
  return {
    postMessage: jest.fn(),
    onmessage: null,
    onerror: null,
    terminate: jest.fn(),
  };
});

export default MockWorker;
