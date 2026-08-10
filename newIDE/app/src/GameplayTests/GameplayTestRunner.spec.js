// @flow
import {
  runGameplayTests,
  stopRunningGameplayTest,
} from './GameplayTestRunner';

jest.mock('./GameplayTestStateInspectors', () => ({
  enumerateGameplayTestStateInspectors: () => ({}),
}));
jest.mock('./GameplayTestFrame', () => ({
  clearGameplayTestFramePreview: () => {},
  setGameplayTestFrameRunStatus: () => {},
}));

describe('runGameplayTests', () => {
  it('provides the cancellation contract required by preview launchers', async () => {
    let launchOptions: any = null;
    const previewDebuggerServer: any = {
      sendMessage: () => {},
    };
    const previewLauncher: any = {
      launchPreview: async (previewOptions: any) => {
        launchOptions = previewOptions;
        expect(previewOptions.isLaunchCancelled()).toBe(false);
        expect(previewOptions.onWillWritePreviewFiles()).toBe(true);

        stopRunningGameplayTest(previewDebuggerServer);

        expect(previewOptions.isLaunchCancelled()).toBe(true);
        expect(previewOptions.onWillWritePreviewFiles()).toBe(false);
      },
    };
    const project: any = ({ getFirstLayout: () => 'Game' }: any);

    const results = await runGameplayTests({
      project,
      tests: [
        {
          scope: { type: 'project' },
          testName: 'Player can jump',
          source: 'gameplayTest.wait(1);',
        },
      ],
      previewLauncher,
      previewDebuggerServer,
      options: {},
    });

    expect(launchOptions).toEqual(
      expect.objectContaining({
        isLaunchCancelled: expect.any(Function),
        onWillWritePreviewFiles: expect.any(Function),
        displayCollisionShapes: false,
        displaySignalAnimations: false,
        forceAlwaysOnTopInPreview: false,
      })
    );
    expect(launchOptions.isLaunchCancelled()).toBe(true);
    expect(launchOptions.onWillWritePreviewFiles()).toBe(false);
    expect(results[0].status).toBe('stopped');
  });
});
