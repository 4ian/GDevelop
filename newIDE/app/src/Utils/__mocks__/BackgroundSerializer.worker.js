// @flow
// Mock for BackgroundSerializer.worker.js to prevent "self is not defined" errors in tests

// $FlowFixMe[incompatible-type] - Mock worker for tests
// $FlowFixMe[underconstrained-implicit-instantiation]
const MockWorker: JestMockFn<any, any> = jest.fn().mockImplementation(() => {
  return {
    postMessage: jest.fn(),
    onmessage: null,
    onerror: null,
    terminate: jest.fn(),
  };
});

export default MockWorker;
