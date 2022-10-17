// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import CloudUpload from '@material-ui/icons/CloudUpload';
import HelpButton from '../../UI/HelpButton';
import EventsFunctionsExtensionsContext from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { ExtensionOptionsEditor } from './ExtensionOptionsEditor';
import { Tab, Tabs } from '../../UI/Tabs';
import { ExtensionDependenciesEditor } from './ExtensionDependenciesEditor';
import ExtensionExporterDialog from './ExtensionExporterDialog';

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
        <ExtensionExporterDialog
          eventsFunctionsExtension={eventsFunctionsExtension}
          onClose={() => setExportDialogOpen(false)}
        />
      )}
    </Dialog>
  );
}
