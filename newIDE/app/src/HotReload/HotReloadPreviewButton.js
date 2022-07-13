// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';

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
  return (
    <FlatButton
      leftIcon={
        hasPreviewsRunning ? <HotReloadPreviewIcon /> : <NewPreviewIcon />
      }
      label={
        hasPreviewsRunning ? (
          <Trans>Apply changes to preview</Trans>
        ) : (
          <Trans>Run a preview</Trans>
        )
      }
      onClick={() => launchProjectDataOnlyPreview()}
    />
  );
}
