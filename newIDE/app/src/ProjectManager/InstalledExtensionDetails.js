// @flow

import React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import ExtensionInstallDialog from '../AssetStore/ExtensionStore/ExtensionInstallDialog';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import { installExtension } from '../AssetStore/ExtensionStore/InstallExtension';

type Props = {|
  project: gdProject,
  onClose: () => void,
  extensionShortHeader: ExtensionShortHeader,
  extensionName: string,
  onInstallExtension: ExtensionShortHeader => void,
  onOpenEventsFunctionsExtension: string => void,
|};

function InstalledExtensionDetails({
  project,
  onClose,
  extensionShortHeader,
  extensionName,
  onInstallExtension,
  onOpenEventsFunctionsExtension,
}: Props) {
  const [isInstalling, setIsInstalling] = React.useState<boolean>(false);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const installOrUpdateExtension = async (i18n: I18nType) => {
    setIsInstalling(true);
    try {
      onInstallExtension(extensionShortHeader);
      await installExtension(
        i18n,
        project,
        eventsFunctionsExtensionsState,
        extensionShortHeader
      );
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <ExtensionInstallDialog
          project={project}
          isInstalling={isInstalling}
          onClose={onClose}
          onInstall={() => installOrUpdateExtension(i18n)}
          extensionShortHeader={extensionShortHeader}
          onEdit={() => {
            onOpenEventsFunctionsExtension(extensionName);
            onClose();
          }}
        />
      )}
    </I18n>
  );
}

export default InstalledExtensionDetails;
