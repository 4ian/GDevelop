// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import Window from '../../Utils/Window';
import Upload from '../../UI/CustomSvgIcons/Upload';

const exportExtension = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => {
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();
  if (!eventsFunctionsExtensionWriter) {
    // This won't happen in practice because this view can't be reached from the web-app.
    throw new Error(
      "The extension can't be exported because it's not supported by the web-app."
    );
  }
  const pathOrUrl = await eventsFunctionsExtensionWriter.chooseEventsFunctionExtensionFile(
    eventsFunctionsExtension.getName()
  );

  if (!pathOrUrl) return;

  await eventsFunctionsExtensionWriter.writeEventsFunctionsExtension(
    eventsFunctionsExtension,
    pathOrUrl
  );
};

const openGitHubIssue = () => {
  Window.openExternalURL(
    'https://github.com/GDevelopApp/GDevelop-extensions/issues/new?assignees=&labels=%E2%9C%A8+New+extension&template=new-extension.yml&title=New+extension%3A+%3Ctitle%3E'
  );
};

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onClose: () => void,
|};

const ExtensionExporterDialog = (props: Props) => {
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  return (
    <Dialog
      title={<Trans>Export extension</Trans>}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/extensions/share-extension/" />,
        <FlatButton
          label={<Trans>Submit to the community</Trans>}
          onClick={openGitHubIssue}
        />,
      ]}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          keyboardFocused={true}
          onClick={() => {
            props.onClose();
          }}
          key="close"
        />,
        <DialogPrimaryButton
          key="export"
          icon={<Upload />}
          primary
          label={<Trans>Export to a file</Trans>}
          onClick={() => {
            exportExtension(
              eventsFunctionsExtensionsState,
              props.eventsFunctionsExtension
            );
          }}
        />,
      ]}
      open
      onRequestClose={props.onClose}
      maxWidth="sm"
    >
      <Column expand noMargin>
        <Line>
          <Text>
            <Trans>
              You can export the extension to a file to easily import it in
              another project. If your extension is providing useful and
              reusable functions or behaviors, consider sharing it with the
              GDevelop community!
            </Trans>
          </Text>
        </Line>
      </Column>
    </Dialog>
  );
};

export default ExtensionExporterDialog;
