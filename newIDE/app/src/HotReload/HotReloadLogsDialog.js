// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { type HotReloaderLog } from '../ExportAndShare/PreviewLauncher.flow';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';

type Props = {|
  logs: Array<HotReloaderLog>,
  onClose: () => void,
  onLaunchNewPreview: () => void,
|};

const shouldDisplayDialogForLogs = logs =>
  logs.filter(log => log.kind === 'error' || log.kind === 'fatal').length > 0;

export default function HotReloadLogsDialog({
  onClose,
  onLaunchNewPreview,
  logs,
}: Props) {
  if (!shouldDisplayDialogForLogs(logs)) {
    return null;
  }

  return (
    <Dialog
      title={<Trans>Restarting the preview from scratch is required</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          icon={<PreviewIcon />}
          label={<Trans>Close and launch a new preview</Trans>}
          key="new-preview"
          primary
          onClick={onLaunchNewPreview}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/interface/preview'} />,
      ]}
      onRequestClose={onClose}
      open
    >
      <ColumnStackLayout noMargin>
        <Text>
          <Trans>
            Your latest changes could not be applied to the preview(s) being
            run. You should start a new preview instead to make sure that all
            your changes are reflected in the game.
          </Trans>
        </Text>
      </ColumnStackLayout>
    </Dialog>
  );
}
