// @flow
import * as React from "react";
import { type I18n as I18nType } from '@lingui/core';
import { ExtensionStoreContext } from "../AssetStore/ExtensionStore/ExtensionStoreContext";
import EventsFunctionsExtensionsContext from "../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext";
import { installExtension } from "../AssetStore/ExtensionStore/InstallExtension";

export const useEnsureExtensionInstalled = ({
    project,
    i18n,
  }: {|
    project: ?gdProject,
    i18n: I18nType,
  |}) => {
    const { translatedExtensionShortHeadersByName } = React.useContext(
      ExtensionStoreContext
    );
    const eventsFunctionsExtensionsState = React.useContext(
      EventsFunctionsExtensionsContext
    );

    return {
      ensureExtensionInstalled: React.useCallback(
        async (extensionName: string) => {
          if (!project) return;
          if (project.getCurrentPlatform().isExtensionLoaded(extensionName))
            return;

          const extensionShortHeader =
            translatedExtensionShortHeadersByName[extensionName];
          if (!extensionShortHeader) {
            throw new Error("Can't find extension with the required name.");
          }

          await installExtension(
            i18n,
            project,
            eventsFunctionsExtensionsState,
            extensionShortHeader
          );
        },
        [
          eventsFunctionsExtensionsState,
          i18n,
          project,
          translatedExtensionShortHeadersByName,
        ]
      ),
    };
  };
