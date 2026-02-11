// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';
import UpdateIcon from '../UI/CustomSvgIcons/Update';
import ResponsiveFlatButton from '../UI/ResponsiveFlatButton';

export type HotReloadPreviewButtonProps = {|
  hasPreviewsRunning: boolean,
  launchProjectDataOnlyPreview: () => Promise<void>,
  launchProjectWithLoadingScreenPreview: () => Promise<void>,
  launchProjectCodeAndDataPreview: () => Promise<void>,
  isCodeGenerationRequired?: boolean,
|};

export default function HotReloadPreviewButton({
  launchProjectDataOnlyPreview,
  launchProjectCodeAndDataPreview,
  hasPreviewsRunning,
  isCodeGenerationRequired,
}: HotReloadPreviewButtonProps) {
  const icon = hasPreviewsRunning ? <UpdateIcon /> : <PreviewIcon />;
  const label = hasPreviewsRunning ? (
    <Trans>Apply changes to preview</Trans>
  ) : (
    <Trans>Run a preview</Trans>
  );
  const launchProjectPreview = isCodeGenerationRequired
    ? launchProjectCodeAndDataPreview
    : launchProjectDataOnlyPreview;

  // Hide the text on mobile, to avoid taking too much space.
  return (
    <ResponsiveFlatButton
      label={label}
      onClick={launchProjectPreview}
      leftIcon={icon}
    />
  );
}
