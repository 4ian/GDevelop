// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import { Column, Line } from '../UI/Grid';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import Window from '../Utils/Window';
import { mapFor } from '../Utils/MapFor';
import Upload from '../UI/CustomSvgIcons/Upload';

const exportObjectAsset = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  customObject: gdObject
) => {
  await exportObjectsAssets(
    eventsFunctionsExtensionsState,
    project,
    [customObject],
    customObject.getName()
  );
};

const exportLayoutObjectAssets = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  layout: gdLayout
) => {
  await exportObjectsAssets(
    eventsFunctionsExtensionsState,
    project,
    mapFor(0, layout.getObjectsCount(), i => layout.getObjectAt(i)),
    layout.getName()
  );
};

const exportObjectsAssets = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  objects: gdObject[],
  defaultName: string
) => {
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();
  if (!eventsFunctionsExtensionWriter) {
    // This won't happen in practice because this view can't be reached from the web-app.
    throw new Error(
      "The object can't be exported because it's not supported by the web-app."
    );
  }
  const pathOrUrl = await eventsFunctionsExtensionWriter.chooseObjectAssetFile(
    defaultName
  );

  if (!pathOrUrl) return;

  await eventsFunctionsExtensionWriter.writeObjectsAssets(
    project,
    objects,
    pathOrUrl
  );
};

const openGitHubIssue = () => {
  Window.openExternalURL(
    'https://github.com/4ian/GDevelop/issues/new?assignees=&labels=%F0%9F%93%A6+Asset+Store+submission&template=--asset-store-submission.md&title='
  );
};

type Props = {|
  project: gdProject,
  layout: gdLayout,
  object: gdObject,
  onClose: () => void,
|};

const ObjectExporterDialog = (props: Props) => {
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  return (
    <Dialog
      title={<Trans>Export {props.object.getName()}</Trans>}
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
      maxWidth="sm"
    >
      <Column expand>
        <Line>
          <Text>
            <Trans>
              You can export the object to a file to submit it to the asset
              store.
            </Trans>
          </Text>
        </Line>
        <ResponsiveLineStackLayout>
          <RaisedButton
            icon={<Upload />}
            primary
            label={<Trans>Export to a file</Trans>}
            onClick={() =>
              exportObjectAsset(
                eventsFunctionsExtensionsState,
                props.project,
                props.object
              )
            }
          />
          <FlatButton
            label={<Trans>Submit objects to the community</Trans>}
            onClick={openGitHubIssue}
          />
          <FlatButton
            label={<Trans>Export all scene objects</Trans>}
            onClick={() =>
              exportLayoutObjectAssets(
                eventsFunctionsExtensionsState,
                props.project,
                props.layout
              )
            }
          />
        </ResponsiveLineStackLayout>
      </Column>
    </Dialog>
  );
};

export default ObjectExporterDialog;
