// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import IconButton from '../UI/IconButton';

export type HotReloadPreviewButtonProps = {|
  hasPreviewsRunning: boolean,
  launchProjectDataOnlyPreview: () => void,
  launchProjectWithLoadingScreenPreview: () => void,
|};

export const NewPreviewIcon = PlayCircleFilledIcon;
export const HotReloadPreviewIcon = OfflineBoltIcon;

export default function HotReloadPreviewButton({
  launchProjectDataOnlyPreview,
  hasPreviewsRunning,
}: HotReloadPreviewButtonProps) {
  const windowWidth = useResponsiveWindowWidth();
  const icon = hasPreviewsRunning ? (
    <HotReloadPreviewIcon />
  ) : (
    <NewPreviewIcon />
  );
  const label = hasPreviewsRunning ? (
    <Trans>Apply changes to preview</Trans>
  ) : (
    <Trans>Run a preview</Trans>
  );

  return windowWidth !== 'small' ? (
    <FlatButton
      leftIcon={icon}
      label={label}
      onClick={launchProjectDataOnlyPreview}
    />
  ) : (
    <IconButton onClick={launchProjectDataOnlyPreview} size="small">
      {icon}
    </IconButton>
  );
}
