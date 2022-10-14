// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import { Column, Line } from '../UI/Grid';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { LineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import Window from '../Utils/Window';

const exportCustomObject = (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  customObject: gdObject
) => {
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();
  if (!eventsFunctionsExtensionWriter)
    return Promise.reject(new Error('Not supported'));

  return eventsFunctionsExtensionWriter
    .chooseCustomObjectFile(customObject.getName())
    .then(pathOrUrl => {
      if (!pathOrUrl) return;

      eventsFunctionsExtensionWriter
        .writeCustomObject(customObject, pathOrUrl)
        .then();
    });
};

const openGitHubIssue = () => {
  Window.openExternalURL(
    'https://github.com/4ian/GDevelop/issues/new?assignees=&labels=%F0%9F%93%A6+Asset+Store+submission&template=--asset-store-submission.md&title='
  );
};

type Props = {|
  object: gdObject,
  onClose: () => void,
|};

const ObjectExporterDialog = (props: Props) => {
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  return (
    <Dialog
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/community/contribute-to-the-assets-store"
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
      ]}
      open
      onRequestClose={() => {
        props.onClose();
      }}
    >
      <Column expand>
        <Line>
          <Text>
            <Trans>
              You can export the object to a file to submit it for the asset
              store.
            </Trans>
          </Text>
        </Line>
        <LineStackLayout>
          <RaisedButton
            icon={<CloudUpload />}
            primary
            label={<Trans>Export to a file</Trans>}
            onClick={() => {
              exportCustomObject(eventsFunctionsExtensionsState, props.object);
            }}
          />
          <FlatButton
            label={<Trans>Submit objects to the community</Trans>}
            onClick={openGitHubIssue}
          />
        </LineStackLayout>
      </Column>
    </Dialog>
  );
};

export default ObjectExporterDialog;
