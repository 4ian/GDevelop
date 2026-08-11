// @flow

export type PreviewLaunchPhase = 'idle' | 'preparing' | 'launching';

export const beginPreviewFileWriting = ({
  isLaunchCancelled,
  onBeginWriting,
}: {|
  isLaunchCancelled: () => boolean,
  onBeginWriting: () => void,
|}): boolean => {
  if (isLaunchCancelled()) return false;

  onBeginWriting();
  return true;
};

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
