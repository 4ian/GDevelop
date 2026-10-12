// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type LaunchFunctionCollaborators } from '../EditorFunctions';
import { useEnsureExtensionInstalled } from './UseEnsureExtensionInstalled';
import { useGenerateEvents } from './UseGenerateEvents';
import { useSearchAndInstallAsset } from './UseSearchAndInstallAsset';
import { useSearchAndInstallResource } from './UseSearchAndInstallResource';
import { useAttachmentsForResources } from './AiAttachments/UseAttachmentsForResources';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { ObjectStoreContext } from '../AssetStore/ObjectStoreContext';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { enumerateObjectTypes } from '../ObjectsList/EnumerateObjects';
import {
  type FileMetadata,
  type StorageProvider,
  type SaveAsLocation,
} from '../ProjectsStorage';

export type EditorFunctionsServices = {|
  ...Pick<
    LaunchFunctionCollaborators,
    | 'ensureExtensionInstalled'
    | 'searchAndInstallAsset'
    | 'searchAndInstallEffectAsset'
    | 'searchAndInstallResources'
    | 'attachmentsForResources'
    | 'generateEvents'
    | 'getAssetStoreTagForNewObject'
  >,
  /** Load the object and extension stores, used by the services above. */
  prefetchStores: () => void,
|};

/**
 * The editor services the editor functions rely on (installing extensions,
 * assets and resources, generating events), shared by the AI agent and the
 * CLI so a function call behaves the same way from both.
 */
export const useEditorFunctionsServices = ({
  project,
  i18n,
  fileMetadata,
  resourceManagementProps,
  onWillInstallExtension,
  onExtensionInstalled,
  onSaveProjectAsWithStorageProvider,
}: {|
  project: ?gdProject,
  i18n: I18nType,
  fileMetadata: ?FileMetadata,
  resourceManagementProps: ResourceManagementProps,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  // Absent where the project can't be saved: the files attached by the user
  // can then only be kept in memory.
  onSaveProjectAsWithStorageProvider?: (
    options: ?{|
      requestedStorageProvider?: StorageProvider,
      forcedSavedAsLocation?: SaveAsLocation,
      createdProject?: gdProject,
    |}
  ) => Promise<?FileMetadata>,
|}): EditorFunctionsServices => {
  const { ensureExtensionInstalled } = useEnsureExtensionInstalled({
    project,
    i18n,
  });
  const {
    searchAndInstallAsset,
    searchAndInstallEffectAsset,
  } = useSearchAndInstallAsset({
    project,
    resourceManagementProps,
    onWillInstallExtension,
    onExtensionInstalled,
  });
  const { searchAndInstallResources } = useSearchAndInstallResource({
    project,
    resourceManagementProps,
  });
  const attachmentsForResources = useAttachmentsForResources({
    project,
    resourceManagementProps,
    fileMetadata,
    onSaveProjectAsWithStorageProvider,
  });
  const { generateEvents } = useGenerateEvents({ project });

  const { translatedObjectShortHeadersByType, fetchObjects } = React.useContext(
    ObjectStoreContext
  );
  const { fetchExtensionsAndFilters } = React.useContext(ExtensionStoreContext);

  const prefetchStores = React.useCallback(
    () => {
      fetchObjects();
      // Warm the extension registry so installs don't fail.
      fetchExtensionsAndFilters();
    },
    [fetchObjects, fetchExtensionsAndFilters]
  );

  const getAssetStoreTagForNewObject = React.useCallback(
    (objectType: string): string | null => {
      // Prefer the installed object metadata (same source as the
      // "New object" dialog in the editor).
      const installedObjectMetadata = project
        ? enumerateObjectTypes(project, null).find(
            enumeratedObjectMetadata =>
              enumeratedObjectMetadata.type === objectType
          )
        : null;
      if (installedObjectMetadata && installedObjectMetadata.assetStoreTag) {
        return installedObjectMetadata.assetStoreTag;
      }

      const header = translatedObjectShortHeadersByType[objectType];
      return (header && header.assetStoreTag) || null;
    },
    [project, translatedObjectShortHeadersByType]
  );

  return {
    ensureExtensionInstalled,
    searchAndInstallAsset,
    searchAndInstallEffectAsset,
    searchAndInstallResources,
    attachmentsForResources,
    generateEvents,
    getAssetStoreTagForNewObject,
    prefetchStores,
  };
};
