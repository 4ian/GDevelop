// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import CloudDownload from '@material-ui/icons/CloudDownload';
import { ExtensionStore } from '.';
import EventsFunctionsExtensionsContext from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import HelpButton from '../../UI/HelpButton';
import { importExtension, installExtension } from './InstallExtension';
import InfoBar from '../../UI/Messages/InfoBar';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';

type Props = {|
  project: gdProject,
  onClose: () => void,
  onInstallExtension: ExtensionShortHeader => void,
|};

/**
 * Allows to browse and install events based extensions.
 */
export default function ExtensionsSearchDialog({
  project,
  onClose,
  onInstallExtension,
}: Props): React.Node {
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [extensionWasInstalled, setExtensionWasInstalled] = React.useState(
    false
  );
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Search for New Extensions</Trans>}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary
              onClick={onClose}
              disabled={isInstalling}
            />,
          ]}
          secondaryActions={[
            <HelpButton key="help" helpPagePath="/extensions/search" />,
            eventsFunctionsExtensionOpener ? (
              <FlatButton
                icon={<CloudDownload />}
                key="import"
                label={<Trans>Import extension</Trans>}
                onClick={() => {
                  (async () => {
                    setIsInstalling(true);
                    const wasExtensionImported = await importExtension(
                      i18n,
                      eventsFunctionsExtensionsState,
                      project
                    );
                    setExtensionWasInstalled(wasExtensionImported);
                    setIsInstalling(false);
                  })();
                }}
                disabled={isInstalling}
              />
            ) : null,
          ]}
          cannotBeDismissed={true}
          flexBody
          open
          noMargin
          onRequestClose={onClose}
        >
          <ExtensionStore
            isInstalling={isInstalling}
            onInstall={async extensionShortHeader => {
              setIsInstalling(true);
              onInstallExtension(extensionShortHeader);
              const wasExtensionInstalled = await installExtension(
                i18n,
                project,
                eventsFunctionsExtensionsState,
                extensionShortHeader
              );

              setExtensionWasInstalled(wasExtensionInstalled);
              setIsInstalling(false);
            }}
            project={project}
            showOnlyWithBehaviors={false}
          />
          <InfoBar
            identifier="extension-installed-explanation"
            message={
              <Trans>
                The extension was added to the project. You can now use it in
                the list of actions/conditions and, if it's a behavior, in the
                list of behaviors for an object.
              </Trans>
            }
            show={extensionWasInstalled}
          />
        </Dialog>
      )}
    </I18n>
  );
}
