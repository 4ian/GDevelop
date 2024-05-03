// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
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
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Download from '../../UI/CustomSvgIcons/Download';
import Add from '../../UI/CustomSvgIcons/Add';
import ErrorBoundary from '../../UI/ErrorBoundary';

type Props = {|
  project: gdProject,
  onClose: () => void,
  onInstallExtension: ExtensionShortHeader => void,
  onExtensionInstalled?: (extensionShortHeader?: ExtensionShortHeader) => void,
  onCreateNew?: () => void,
|};

/**
 * Allows to browse and install events based extensions.
 */
const ExtensionsSearchDialog = ({
  project,
  onClose,
  onInstallExtension,
  onExtensionInstalled,
  onCreateNew,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
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

  const installOrImportExtension = async (
    i18n: I18nType,
    extensionShortHeader?: ExtensionShortHeader
  ) => {
    setIsInstalling(true);
    try {
      let wasExtensionInstalledOrImported;
      if (!!extensionShortHeader) {
        onInstallExtension(extensionShortHeader);
        wasExtensionInstalledOrImported = await installDisplayedExtension(
          i18n,
          project,
          eventsFunctionsExtensionsState,
          extensionShortHeader
        );
      } else {
        wasExtensionInstalledOrImported = await importExtension(
          i18n,
          eventsFunctionsExtensionsState,
          project
        );
      }

      if (wasExtensionInstalledOrImported) {
        setExtensionWasInstalled(true);
        if (onExtensionInstalled) onExtensionInstalled();
        return true;
      }

      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Search for New Extensions</Trans>}
          id="extension-search-dialog"
          fullHeight
          actions={[
            <FlatButton
              id="close-button"
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
                leftIcon={<Download />}
                key="import"
                label={
                  isMobile ? (
                    <Trans>Import</Trans>
                  ) : (
                    <Trans>Import extension</Trans>
                  )
                }
                onClick={() => {
                  installOrImportExtension(i18n);
                }}
                disabled={isInstalling}
              />
            ) : null,
            onCreateNew ? (
              <FlatButton
                key="create-new"
                onClick={onCreateNew}
                label={
                  isMobile ? (
                    <Trans>Create</Trans>
                  ) : (
                    <Trans>Create a new extension</Trans>
                  )
                }
                leftIcon={<Add />}
              />
            ) : null,
          ]}
          flexBody
          open
          cannotBeDismissed={isInstalling}
          onRequestClose={onClose}
        >
          <ExtensionStore
            isInstalling={isInstalling}
            onInstall={async extensionShortHeader =>
              installOrImportExtension(i18n, extensionShortHeader)
            }
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
};

const ExtensionsSearchDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Extensions search</Trans>}
    scope="extensions-search-dialog"
    onClose={props.onClose}
  >
    <ExtensionsSearchDialog {...props} />
  </ErrorBoundary>
);

export default ExtensionsSearchDialogWithErrorBoundary;
