// @flow

export type PreviewLaunchPhase = 'idle' | 'preparing' | 'launching';

export const canReleaseCancelledPreviewPreparation = ({
  launchInProgress,
  activePreviewLaunchId,
  isActivePreviewLaunchCancelled,
  launchPhase,
}: {|
  launchInProgress: boolean,
  activePreviewLaunchId: ?number,
  isActivePreviewLaunchCancelled: boolean,
  launchPhase: PreviewLaunchPhase,
|}): boolean =>
  launchInProgress &&
  activePreviewLaunchId != null &&
  isActivePreviewLaunchCancelled &&
  launchPhase === 'preparing';
