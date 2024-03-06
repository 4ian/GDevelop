// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';
import UpdateIcon from '../UI/CustomSvgIcons/Update';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import IconButton from '../UI/IconButton';

export type HotReloadPreviewButtonProps = {|
  hasPreviewsRunning: boolean,
  launchProjectDataOnlyPreview: () => void,
  launchProjectWithLoadingScreenPreview: () => void,
|};

export default function HotReloadPreviewButton({
  launchProjectDataOnlyPreview,
  hasPreviewsRunning,
}: HotReloadPreviewButtonProps) {
  const { isMobile } = useResponsiveWindowSize();
  const icon = hasPreviewsRunning ? <UpdateIcon /> : <PreviewIcon />;
  const label = hasPreviewsRunning ? (
    <Trans>Apply changes to preview</Trans>
  ) : (
    <Trans>Run a preview</Trans>
  );

  // Hide the text on mobile, to avoid taking too much space.
  return !isMobile ? (
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
