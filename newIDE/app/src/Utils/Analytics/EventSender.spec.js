// @flow
import posthog from 'posthog-js';
import {
  installAnalyticsEvents,
  releaseSessionRecordingOfPreviousIframeDocuments,
} from './EventSender';

jest.mock('../Window', () => ({
  __esModule: true,
  default: { isDev: () => false },
}));

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    init: jest.fn((token, options) => options.loaded()),
    sessionRecordingStarted: jest.fn(),
    stopSessionRecording: jest.fn(),
    startSessionRecording: jest.fn(),
  },
}));

describe('EventSender', () => {
  describe('releaseSessionRecordingOfPreviousIframeDocuments', () => {
    beforeAll(() => {
      // The GDevelop editor analytics script can't be loaded in tests.
      jest.spyOn(console, 'error').mockImplementation(() => {});
      installAnalyticsEvents();
    });

    afterAll(() => {
      // $FlowFixMe[prop-missing] - mocked.
      console.error.mockRestore();
    });

    beforeEach(() => {
      // $FlowFixMe[prop-missing] - mocked.
      posthog.stopSessionRecording.mockClear();
      // $FlowFixMe[prop-missing] - mocked.
      posthog.startSessionRecording.mockClear();
    });

    it('restarts the session recording when it is running', () => {
      // $FlowFixMe[prop-missing] - mocked.
      posthog.sessionRecordingStarted.mockReturnValue(true);

      releaseSessionRecordingOfPreviousIframeDocuments();

      expect(posthog.stopSessionRecording).toHaveBeenCalledTimes(1);
      expect(posthog.startSessionRecording).toHaveBeenCalledTimes(1);
      // The recording must be stopped first, so that the documents it holds are released.
      expect(
        // $FlowFixMe[prop-missing] - mocked.
        posthog.stopSessionRecording.mock.invocationCallOrder[0]
      ).toBeLessThan(
        // $FlowFixMe[prop-missing] - mocked.
        posthog.startSessionRecording.mock.invocationCallOrder[0]
      );
    });

    it('does not start a session recording that is not running', () => {
      // $FlowFixMe[prop-missing] - mocked.
      posthog.sessionRecordingStarted.mockReturnValue(false);

      releaseSessionRecordingOfPreviousIframeDocuments();

      expect(posthog.stopSessionRecording).not.toHaveBeenCalled();
      expect(posthog.startSessionRecording).not.toHaveBeenCalled();
    });
  });
});
