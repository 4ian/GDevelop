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
import { serializeToJSObject } from '../../Utils/Serializer';

const gd: libGDevelop = global.gd;

const exportExtension = async (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState
) => {
  const requiredExtensions = gd.UsedExtensionsFinder.scanEventsFunctionsExtension(
    project,
    eventsFunctionsExtension
  )
    .getUsedExtensions()
    .toNewVectorString()
    .toJSArray()
    .filter(
      extensionName =>
        extensionName !== eventsFunctionsExtension.getName() &&
        project.hasEventsFunctionsExtensionNamed(extensionName)
    )
    .map(extensionName => ({
      extensionName,
      extensionVersion: project
        .getEventsFunctionsExtension(extensionName)
        .getVersion(),
    }));
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

  const serializedObject = serializeToJSObject(
    eventsFunctionsExtension,
    'serializeToExternal'
  );
  if (requiredExtensions.length > 0) {
    serializedObject.requiredExtensions = requiredExtensions;
  }
  await eventsFunctionsExtensionWriter.writeSerializedObject(
    serializedObject,
    pathOrUrl
  );
};

const openGitHubIssue = (isFromTheStore: boolean) => {
  Window.openExternalURL(
    'https://github.com/GDevelopApp/GDevelop-extensions/issues/new?template=' +
      (isFromTheStore ? 'extension-update.yml' : 'new-extension.yml')
  );
};

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onClose: () => void,
|};

const ExtensionExporterDialog = (props: Props) => {
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const isFromTheStore =
    props.eventsFunctionsExtension.getOriginName() ===
    'gdevelop-extension-store';

  return (
    <Dialog
      title={<Trans>Export extension</Trans>}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/extensions/share-extension/" />,
        <FlatButton
          label={
            isFromTheStore ? (
              <Trans>Submit an update</Trans>
            ) : (
              <Trans>Submit to the community</Trans>
            )
          }
          onClick={() => openGitHubIssue(isFromTheStore)}
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
              props.project,
              props.eventsFunctionsExtension,
              eventsFunctionsExtensionsState
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
