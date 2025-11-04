// @flow

import React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import ExtensionInstallDialog from '../AssetStore/ExtensionStore/ExtensionInstallDialog';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import {
  checkRequiredExtensionsUpdate,
  useInstallExtension,
  getRequiredExtensions,
} from '../AssetStore/ExtensionStore/InstallExtension';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';

type Props = {|
  project: gdProject,
  onClose: () => void,
  extensionShortHeader: ExtensionShortHeader,
  extensionName: string,
  onInstallExtension: (extensionName: string) => void,
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
  const installExtension = useInstallExtension();
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);

  const installOrUpdateExtension = async (i18n: I18nType) => {
    setIsInstalling(true);
    try {
      onInstallExtension(extensionShortHeader.name);
      const extensionShortHeaders: Array<ExtensionShortHeader> = [
        extensionShortHeader,
      ];
      const requiredExtensionInstallation = await checkRequiredExtensionsUpdate(
        {
          requiredExtensions: getRequiredExtensions(extensionShortHeaders),
          project,
          extensionShortHeadersByName,
        }
      );
      await installExtension({
        project,
        requiredExtensionInstallation,
        userSelectedExtensionNames: [],
        importedSerializedExtensions: [],
        // TODO
        onExtensionInstalled: () => {},
        updateMode: 'all',
      });
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
