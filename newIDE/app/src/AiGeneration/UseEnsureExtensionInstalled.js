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
import {
  getExtensionsRegistry,
  type ExtensionShortHeader,
} from '../Utils/GDevelopServices/Extension';
import { retryIfFailed } from '../Utils/RetryIfFailed';

export type EnsureExtensionInstalledOptions = {|
  extensionName: string,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

type _UseEnsureExtensionInstalledReturnType = {
  ensureExtensionInstalled: EnsureExtensionInstalledOptions => Promise<void>,
};
export const useEnsureExtensionInstalled = ({
  project,
  i18n,
}: {|
  project: ?gdProject,
  i18n: I18nType,
|}): _UseEnsureExtensionInstalledReturnType => {
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
    fetchExtensionsAndFilters,
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  return {
    ensureExtensionInstalled: React.useCallback(
      async ({
        extensionName,
        onExtensionInstalled,
        onWillInstallExtension,
      }: EnsureExtensionInstalledOptions) => {
        if (!project) return;
        if (project.getCurrentPlatform().isExtensionLoaded(extensionName))
          return;

        // If the registry was never loaded in this session, fetch it directly
        // so we can tell a network issue apart from a missing extension.
        let extensionShortHeadersByNameToUse = extensionShortHeadersByName;
        const isRegistryLoaded =
          Object.keys(extensionShortHeadersByNameToUse).length > 0;
        if (!isRegistryLoaded) {
          fetchExtensionsAndFilters();

          let extensionsRegistry;
          try {
            extensionsRegistry = await retryIfFailed({ times: 3 }, () =>
              getExtensionsRegistry()
            );
          } catch (error) {
            throw new Error(
              `The extension registry could not be loaded (${
                error.message
              }). This is likely a temporary network issue - try again.`
            );
          }
          const freshHeadersByName: {
            [name: string]: ExtensionShortHeader,
          } = {};
          extensionsRegistry.headers.forEach(header => {
            freshHeadersByName[header.name] = header;
          });
          extensionShortHeadersByNameToUse = freshHeadersByName;
        }

        if (!extensionShortHeadersByNameToUse[extensionName]) {
          throw new Error(
            `Extension "${extensionName}" does not exist in the extension registry. Use a different extension or behavior.`
          );
        }

        const extensionShortHeader = getExtensionHeader(
          extensionShortHeadersByNameToUse,
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
            extensionShortHeadersByName: extensionShortHeadersByNameToUse,
          }
        );
        await installExtension({
          project,
          requiredExtensionInstallation,
          importedSerializedExtensions: [],
          onWillInstallExtension,
          onExtensionInstalled,
          updateMode: 'safeOnly',
          reason: 'extension',
        });
      },
      [
        extensionShortHeadersByName,
        fetchExtensionsAndFilters,
        installExtension,
        project,
      ]
    ),
  };
};
