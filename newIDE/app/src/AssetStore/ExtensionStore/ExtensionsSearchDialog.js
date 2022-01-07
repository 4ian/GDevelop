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
import DismissableInfoBar from '../../UI/Messages/DismissableInfoBar';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_EXTENSION,
} from '../../Utils/GDevelopServices/Badge';

type Props = {|
  project: gdProject,
  onClose: () => void,
  onInstallExtension: ExtensionShortHeader => void,
  onExtensionInstalled?: (extensionShortHeader?: ExtensionShortHeader) => void,
|};

/**
 * Allows to browse and install events based extensions.
 */
export default function ExtensionsSearchDialog({
  project,
  onClose,
  onInstallExtension,
  onExtensionInstalled,
}: Props) {
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [extensionWasInstalled, setExtensionWasInstalled] = React.useState(
    false
  );
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const installDisplayedExtension = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_EXTENSION,
    installExtension
  );

  const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          fullHeight
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
                    if (wasExtensionImported && onExtensionInstalled)
                      onExtensionInstalled();

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
              const wasExtensionInstalled = await installDisplayedExtension(
                i18n,
                project,
                eventsFunctionsExtensionsState,
                extensionShortHeader
              );
              if (wasExtensionInstalled && onExtensionInstalled)
                onExtensionInstalled(extensionShortHeader);

              setExtensionWasInstalled(wasExtensionInstalled);
              setIsInstalling(false);
            }}
            project={project}
            showOnlyWithBehaviors={false}
          />
          <DismissableInfoBar
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
