// @flow

import {
  beginPreviewFileWriting,
  canReleaseCancelledPreviewPreparation,
} from './PreviewLaunchCancellation';

describe('PreviewLaunchCancellation', () => {
  it('does not let a released, cancelled launcher start writing preview files', () => {
    let beginWritingCallCount = 0;
    const onBeginWriting = () => {
      beginWritingCallCount++;
    };

    expect(
      beginPreviewFileWriting({
        isLaunchCancelled: () => true,
        onBeginWriting,
      })
    ).toBe(false);
    expect(beginWritingCallCount).toBe(0);
  });

  it('marks an active launcher as writing at the file-write boundary', () => {
    let beginWritingCallCount = 0;
    const onBeginWriting = () => {
      beginWritingCallCount++;
    };

    expect(
      beginPreviewFileWriting({
        isLaunchCancelled: () => false,
        onBeginWriting,
      })
    ).toBe(true);
    expect(beginWritingCallCount).toBe(1);
  });

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
