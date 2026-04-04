// @flow
import { t, Trans } from '@lingui/macro';
import React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import {
  type ExtensionShortHeader,
  type BehaviorShortHeader,
  type ObjectShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import LeftLoader from '../../UI/LeftLoader';
import HelpButton from '../../UI/HelpButton';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import ExtensionDetailPanel, {
  useExtensionDetail,
} from './ExtensionDetailPanel';

export const useOutOfDateAlertDialog = (): (() => Promise<boolean>) => {
  const { showConfirmation } = useAlertDialog();
  return async (): Promise<boolean> => {
    return await showConfirmation({
      title: t`Outdated extension`,
      message: t`The extension installed in this project is not up to date.
      Consider upgrading it before reporting any issue.`,
      confirmButtonLabel: t`Close`,
      dismissButtonLabel: t`Report anyway`,
    });
  };
};

type Props = {|
  extensionShortHeader:
    | ExtensionShortHeader
    | BehaviorShortHeader
    | ObjectShortHeader,
  isInstalling: boolean,
  onClose: () => void,
  onInstall?: () => Promise<void>,
  onEdit?: () => void,
  project: gdProject,
|};

const ExtensionInstallDialog = ({
  extensionShortHeader,
  isInstalling,
  onClose,
  onInstall,
  onEdit,
  project,
}: Props): React.Node => {
  const extensionDetail = useExtensionDetail({
    extensionShortHeader,
    isInstalling,
    onInstall,
    project,
  });
  const {
    isAlreadyInstalled,
    canInstallExtension,
    extensionHeader,
    onInstallExtension,
    onUserReportIssue,
    renderInstallButtonLabel,
  } = extensionDetail;

  return (
    <Dialog
      title={extensionShortHeader.fullName}
      id="install-extension-dialog"
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Back</Trans>}
          primary={false}
          onClick={onClose}
          disabled={isInstalling}
        />,
        onInstall ? (
          <LeftLoader isLoading={isInstalling} key="install">
            <DialogPrimaryButton
              id="install-extension-button"
              label={renderInstallButtonLabel()}
              primary
              onClick={onInstallExtension}
              disabled={!canInstallExtension}
            />
          </LeftLoader>
        ) : null,
      ]}
      // $FlowFixMe[incompatible-type]
      secondaryActions={[
        onEdit ? (
          <FlatButton
            key="edit-extension"
            label={<Trans>Open in editor</Trans>}
            onClick={onEdit}
          />
        ) : (
          undefined
        ),
        isAlreadyInstalled ? (
          <FlatButton
            key="report-extension"
            label={<Trans>Report an issue</Trans>}
            onClick={() => onUserReportIssue()}
          />
        ) : (
          undefined
        ),
        extensionHeader && extensionHeader.helpPath ? (
          <HelpButton
            key="help-button"
            helpPagePath={extensionHeader.helpPath}
          />
        ) : (
          undefined
        ),
      ].filter(Boolean)}
      open
      cannotBeDismissed={isInstalling}
      onRequestClose={onClose}
      onApply={onInstall ? onInstallExtension : onClose}
    >
      <ExtensionDetailPanel
        extensionShortHeader={extensionShortHeader}
        isInstalling={isInstalling}
        onInstall={onInstall}
        extensionDetail={extensionDetail}
        shouldDisplayButtons={false}
      />
    </Dialog>
  );
};

export default ExtensionInstallDialog;
