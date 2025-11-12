// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import {
  useInstallExtension,
  checkRequiredExtensionsUpdate,
  getRequiredExtensions,
  getExtensionHeader,
} from '../AssetStore/ExtensionStore/InstallExtension';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';

type EnsureExtensionInstalledOptions = {|
  extensionName: string,
|};

export const useEnsureExtensionInstalled = ({
  project,
  i18n,
}: {|
  project: ?gdProject,
  i18n: I18nType,
|}) => {
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  return {
    ensureExtensionInstalled: React.useCallback(
      async ({ extensionName }: EnsureExtensionInstalledOptions) => {
        if (!project) return;

        const extensionShortHeader = getExtensionHeader(
          extensionShortHeadersByName,
          extensionName
        );
        const extensionShortHeaders: Array<ExtensionShortHeader> = [
          extensionShortHeader,
        ];
        const requiredExtensions = getRequiredExtensions(extensionShortHeaders);
        requiredExtensions.push({
          extensionName: extensionShortHeader.name,
          extensionVersion: extensionShortHeader.version,
        });
        const requiredExtensionInstallation = await checkRequiredExtensionsUpdate(
          {
            requiredExtensions,
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
          updateMode: 'safeOnly',
          reason: 'extension',
        });
      },
      [extensionShortHeadersByName, installExtension, project]
    ),
  };
};
