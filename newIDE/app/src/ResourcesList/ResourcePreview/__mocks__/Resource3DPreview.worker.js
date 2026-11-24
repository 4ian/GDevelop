// @flow
// Mock for Resource3DPreview.worker.js to prevent "self is not defined" errors in tests

// $FlowFixMe[incompatible-type] - Mock worker for tests
// $FlowFixMe[underconstrained-implicit-instantiation]
const MockWorker: JestMockFn<any, any> = jest.fn().mockImplementation(() => {
  // $FlowFixMe[unclear-type] - Mock worker for tests
  const mockWorker: any = {
    postMessage: jest.fn(),
    onmessage: null,
    onerror: null,
    terminate: jest.fn(),
  };

  mockWorker.postMessage.mockImplementation(message => {
    // Answer that the worker could not be initialized, so that the previews
    // fall back to a generic image instead of waiting for the worker.
    if (message && message.type === 'INIT') {
      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage({ data: { type: 'INIT', success: false } });
        }
      }, 0);
    }
  });

  return mockWorker;
});

export default MockWorker;
