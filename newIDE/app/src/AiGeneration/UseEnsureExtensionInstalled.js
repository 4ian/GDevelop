// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import {
  useInstallExtension,
  checkRequiredExtensionsUpdate,
  ensureExtensionsRegistryLoaded,
  getRequiredExtensions,
  getExtensionHeader,
} from '../AssetStore/ExtensionStore/InstallExtension';
import {
  getExtension,
  type ExtensionShortHeader,
  type SerializedExtension,
} from '../Utils/GDevelopServices/Extension';
import { retryIfFailed } from '../Utils/RetryIfFailed';

export type EnsureExtensionInstalledOptions = {|
  extensionName: string,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  preflightExtension?: ({
    serializedExtension: SerializedExtension,
    registryHeader: ExtensionShortHeader,
  }) => Promise<Object>,
|};

type _UseEnsureExtensionInstalledReturnType = {
  ensureExtensionInstalled: EnsureExtensionInstalledOptions => Promise<Object>,
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
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  return {
    ensureExtensionInstalled: React.useCallback(
      async ({
        extensionName,
        onExtensionInstalled,
        onWillInstallExtension,
        preflightExtension,
      }: EnsureExtensionInstalledOptions) => {
        if (!project) return { installed: false, reason: 'no-project' };
        if (project.getCurrentPlatform().isExtensionLoaded(extensionName))
          return { installed: false, alreadyInstalled: true };

        const availableExtensionShortHeadersByName = await ensureExtensionsRegistryLoaded(
          extensionShortHeadersByName[extensionName]
            ? extensionShortHeadersByName
            : {}
        );
        const extensionShortHeader = getExtensionHeader(
          availableExtensionShortHeadersByName,
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
            extensionShortHeadersByName: availableExtensionShortHeadersByName,
          }
        );
        const preflightReceipts: Array<Object> = [];
        if (preflightExtension) {
          const headersByName: {
            [string]: ExtensionShortHeader,
          } = {};
          [
            ...requiredExtensionInstallation.missingExtensionShortHeaders,
            ...requiredExtensionInstallation.safeToUpdateExtensions,
          ].forEach(header => {
            headersByName[header.name] = header;
          });
          const headers = Object.keys(headersByName).map(
            name => headersByName[name]
          );
          for (const registryHeader of headers) {
            const serializedExtension = await retryIfFailed({ times: 3 }, () =>
              getExtension(registryHeader)
            );
            const receipt = await preflightExtension({
              serializedExtension,
              registryHeader,
            });
            preflightReceipts.push(receipt);
            if (!receipt || receipt.valid !== true) {
              const error: any = new Error(
                `Extension "${
                  registryHeader.name
                }" is incompatible with the strict JavaScript authoring policy.`
              );
              error.code = 'EXTENSION_STRICT_API_INCOMPATIBLE';
              error.extensionCompatibility = receipt;
              throw error;
            }
          }
        }
        const installed = await installExtension({
          project,
          requiredExtensionInstallation,
          importedSerializedExtensions: [],
          onWillInstallExtension,
          onExtensionInstalled,
          updateMode: 'safeOnly',
          reason: 'extension',
        });
        return { installed, preflightReceipts };
      },
      [extensionShortHeadersByName, installExtension, project]
    ),
  };
};
