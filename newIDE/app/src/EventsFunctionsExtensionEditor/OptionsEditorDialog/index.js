// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import HelpButton from '../../UI/HelpButton';
import EventsFunctionsExtensionsContext from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { ExtensionOptionsEditor } from './ExtensionOptionsEditor';
import { Tabs } from '../../UI/Tabs';
import { ExtensionDependenciesEditor } from './ExtensionDependenciesEditor';
import ExtensionExporterDialog from './ExtensionExporterDialog';
import { Line } from '../../UI/Grid';
import Upload from '../../UI/CustomSvgIcons/Upload';

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
      title={<Trans>{eventsFunctionsExtension.getName()} options</Trans>}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/extensions/create" />,
        eventsFunctionsExtensionWriter ? (
          <FlatButton
            leftIcon={<Upload />}
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
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              value: 'options',
              label: <Trans>Options</Trans>,
            },
            {
              value: 'dependencies',
              label: <Trans>Dependencies</Trans>,
            },
          ]}
        />
      }
      cannotBeDismissed={isLoading}
      onRequestClose={isLoading ? () => {} : onClose}
    >
      {currentTab === 'options' && (
        <Line>
          <ExtensionOptionsEditor
            eventsFunctionsExtension={eventsFunctionsExtension}
            onLoadChange={setIsLoading}
            isLoading={isLoading}
          />
        </Line>
      )}
      {currentTab === 'dependencies' && (
        <Line>
          <ExtensionDependenciesEditor
            eventsFunctionsExtension={eventsFunctionsExtension}
          />
        </Line>
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
