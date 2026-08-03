// @flow

import { canReleaseCancelledPreviewPreparation } from './PreviewLaunchCancellation';

describe('PreviewLaunchCancellation', () => {
  it('allows a cancelled preparation to release a stale launch lock', () => {
    expect(
      canReleaseCancelledPreviewPreparation({
        launchInProgress: true,
        activePreviewLaunchId: 23,
        isActivePreviewLaunchCancelled: true,
        launchPhase: 'preparing',
      })
    ).toBe(true);
  });

  it('keeps the lock while the preview launcher may be writing files', () => {
    expect(
      canReleaseCancelledPreviewPreparation({
        launchInProgress: true,
        activePreviewLaunchId: 23,
        isActivePreviewLaunchCancelled: true,
        launchPhase: 'launching',
      })
    ).toBe(false);
  });

  it('does not release an active launch that was not cancelled', () => {
    expect(
      canReleaseCancelledPreviewPreparation({
        launchInProgress: true,
        activePreviewLaunchId: 23,
        isActivePreviewLaunchCancelled: false,
        launchPhase: 'preparing',
      })
    ).toBe(false);
  });
});
