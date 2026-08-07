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

export const useInstallExtensionWithDependencies = (): (({
  project: gdProject,
  extensionShortHeader: ExtensionShortHeader,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
}) => Promise<boolean>) => {
  const installExtension = useInstallExtension();
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);

  return async ({
    project,
    extensionShortHeader,
    onWillInstallExtension,
    onExtensionInstalled,
  }: {
    project: gdProject,
    extensionShortHeader: ExtensionShortHeader,
    onWillInstallExtension: (extensionNames: Array<string>) => void,
    onExtensionInstalled: (extensionNames: Array<string>) => void,
  }): Promise<boolean> => {
    const extensionShortHeaders: Array<ExtensionShortHeader> = [
      extensionShortHeader,
    ];
    const requiredExtensionInstallation = await checkRequiredExtensionsUpdate({
      requiredExtensions: getRequiredExtensions(extensionShortHeaders),
      project,
      extensionShortHeadersByName,
    });
    if (
      !requiredExtensionInstallation.missingExtensionShortHeaders.includes(
        extensionShortHeader
      )
    ) {
      // The extension chosen by users is not part of `requiredExtensions`
      // but should always be installed. This is true even if the versions
      // are matching to allow to reinstall the extension.
      requiredExtensionInstallation.missingExtensionShortHeaders.push(
        extensionShortHeader
      );
    }
    return await installExtension({
      project,
      requiredExtensionInstallation,
      importedSerializedExtensions: [],
      onWillInstallExtension,
      onExtensionInstalled,
      updateMode: 'all',
      reason: 'extension',
    });
  };
};

type Props = {|
  project: gdProject,
  onClose: () => void,
  extensionShortHeader: ExtensionShortHeader,
  extensionName: string,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onOpenEventsFunctionsExtension: string => void,
|};

function InstalledExtensionDetails({
  project,
  onClose,
  extensionShortHeader,
  extensionName,
  onWillInstallExtension,
  onExtensionInstalled,
  onOpenEventsFunctionsExtension,
}: Props): React.Node {
  const [isInstalling, setIsInstalling] = React.useState<boolean>(false);
  const installExtensionWithDependencies = useInstallExtensionWithDependencies();

  const installOrUpdateExtensionAndChangeState = async (i18n: I18nType) => {
    setIsInstalling(true);
    try {
      await installExtensionWithDependencies({
        project,
        extensionShortHeader,
        onWillInstallExtension,
        onExtensionInstalled,
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
          onInstall={() => installOrUpdateExtensionAndChangeState(i18n)}
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
