// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import Window from '../../Utils/Window';
import Upload from '../../UI/CustomSvgIcons/Upload';
import { type ExtensionHeader } from '../../Utils/GDevelopServices/Extension';
import AlertMessage from '../../UI/AlertMessage';

const openGitHubIssue = extensionName => {
  Window.openExternalURL(
    `https://github.com/GDevelopApp/GDevelop-extensions/issues/new` +
      `?assignees=&labels=&template=bug-report.md&title=[${extensionName}] Issue short description`
  );
};

type Props = {|
  extensionHeader: ExtensionHeader,
  isExtensionUpToDate: boolean,
  onClose: () => void,
|};

const ExtensionIssueReportDialog = (props: Props) => {
  const { extensionHeader, isExtensionUpToDate, onClose } = props;
  return (
    <Dialog
      title={<Trans>Report extension issue</Trans>}
      secondaryActions={[
        extensionHeader && extensionHeader.helpPath ? (
          <HelpButton
            key="help-button"
            helpPagePath={extensionHeader.helpPath}
          />
        ) : (
          undefined
        ),
      ]}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          keyboardFocused={true}
          onClick={() => {
            onClose();
          }}
          key="close"
        />,
        <DialogPrimaryButton
          key="export"
          icon={<Upload />}
          primary
          label={<Trans>Report an issue</Trans>}
          onClick={() => openGitHubIssue(extensionHeader.name)}
        />,
      ]}
      open
      onRequestClose={onClose}
      maxWidth="sm"
    >
      <Column expand noMargin>
        <Line>
          <Text>
            <Trans>
              Extensions are updated by the community and GDevelop developers.
              Reports with clear explanations are more likely to be answered
              quickly.
            </Trans>
          </Text>
        </Line>
        {isExtensionUpToDate ? null : (
          <AlertMessage kind="warning">
            <Text>
              <Trans>
                The extension installed in this project is not up to date.
                Consider upgrading it before reporting any issue.
              </Trans>
            </Text>
          </AlertMessage>
        )}
      </Column>
    </Dialog>
  );
};

export default ExtensionIssueReportDialog;
