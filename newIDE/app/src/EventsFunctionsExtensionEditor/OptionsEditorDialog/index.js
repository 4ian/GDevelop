// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { Column, Line } from '../../UI/Grid';
import HelpButton from '../../UI/HelpButton';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import Text from '../../UI/Text';
import { ExtensionOptionsEditor } from './ExtensionOptionsEditor';
import { Tab, Tabs } from '../../UI/Tabs';
import { ExtensionDependenciesEditor } from './ExtensionDependenciesEditor';
import { LineStackLayout } from '../../UI/Layout';

const exportExtension = (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => {
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();
  if (!eventsFunctionsExtensionWriter)
    return Promise.reject(new Error('Not supported'));

  return eventsFunctionsExtensionWriter
    .chooseEventsFunctionExtensionFile(eventsFunctionsExtension.getName())
    .then(pathOrUrl => {
      if (!pathOrUrl) return;

      eventsFunctionsExtensionWriter
        .writeEventsFunctionsExtension(eventsFunctionsExtension, pathOrUrl)
        .then();
    });
};

const openGitHubIssue = () => {
  Window.openExternalURL(
    'https://github.com/GDevelopApp/GDevelop-extensions/issues/new?assignees=&labels=%E2%9C%A8+New+extension&template=new-extension.yml&title=New+extension%3A+%3Ctitle%3E'
  );
};

type TabName = 'options' | 'dependencies';

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onClose: () => void,
  open: boolean,
|};

export default function OptionsEditorDialog({
  eventsFunctionsExtension,
  onClose,
  open,
}: Props) {
  const [currentTab, setCurrentTab] = React.useState<TabName>('options');
  const [isLoading, setIsLoading] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();

  return (
    <Dialog
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/extensions/create" />,
        eventsFunctionsExtensionWriter ? (
          <FlatButton
            leftIcon={<CloudUpload />}
            key="export"
            label={<Trans>Export extension</Trans>}
            onClick={() => {
              setExportDialogOpen(true);
            }}
            disabled={isLoading}
          />
        ) : null,
      ]}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          primary={true}
          keyboardFocused={true}
          onClick={onClose}
          disabled={isLoading}
          key={'close'}
        />,
      ]}
      open={open}
      noTitleMargin
      title={
        <Tabs value={currentTab} onChange={setCurrentTab}>
          <Tab label={<Trans>Options</Trans>} value="options" />
          <Tab label={<Trans>Dependencies</Trans>} value="dependencies" />
        </Tabs>
      }
      cannotBeDismissed={isLoading}
      onRequestClose={isLoading ? () => {} : onClose}
    >
      {currentTab === 'options' && (
        <ExtensionOptionsEditor
          eventsFunctionsExtension={eventsFunctionsExtension}
          onLoadChange={setIsLoading}
          isLoading={isLoading}
        />
      )}
      {currentTab === 'dependencies' && (
        <ExtensionDependenciesEditor
          eventsFunctionsExtension={eventsFunctionsExtension}
        />
      )}
      {exportDialogOpen && (
        <Dialog
          secondaryActions={[
            <HelpButton key="help" helpPagePath="/extensions/share" />,
          ]}
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              keyboardFocused={true}
              onClick={() => {
                setExportDialogOpen(false);
              }}
              key="close"
            />,
          ]}
          open
          onRequestClose={() => {
            setExportDialogOpen(false);
          }}
        >
          <Column expand>
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
            <LineStackLayout>
              <RaisedButton
                icon={<CloudUpload />}
                primary
                label={<Trans>Export to a file</Trans>}
                onClick={() => {
                  exportExtension(
                    eventsFunctionsExtensionsState,
                    eventsFunctionsExtension
                  );
                }}
              />
              <FlatButton
                label={<Trans>Submit extension to the community</Trans>}
                onClick={openGitHubIssue}
              />
            </LineStackLayout>
          </Column>
        </Dialog>
      )}
    </Dialog>
  );
}
