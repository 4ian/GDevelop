// @flow
import * as React from 'react';
import {
  type AssetSearchAndInstallOptions,
  type AssetSearchAndInstallResult,
} from '../EditorFunctions';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  createAssetSearch,
  type AssetSearch,
} from '../Utils/GDevelopServices/Generation';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { useInstallAsset } from '../AssetStore/NewObjectDialog';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';

export const useSearchAndInstallAsset = ({
  project,
  resourceManagementProps,
  onWillInstallExtension,
  onExtensionInstalled,
}: {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|}) => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const installAsset = useInstallAsset({
    project,
    resourceManagementProps,
    onWillInstallExtension,
    onExtensionInstalled,
  });

  return {
    searchAndInstallAsset: React.useCallback(
      async ({
        objectsContainer,
        objectName,
        ...assetSearchOptions
      }: AssetSearchAndInstallOptions): Promise<AssetSearchAndInstallResult> => {
        if (!profile) throw new Error('User should be authenticated.');

        const assetSearch: AssetSearch = await retryIfFailed(
          { times: 3, backoff: { initialDelay: 300, factor: 2 } },
          () =>
            createAssetSearch(getAuthorizationHeader, {
              userId: profile.id,
              ...assetSearchOptions,
            })
        );
        if (!assetSearch.results || assetSearch.results.length === 0) {
          return {
            status: 'nothing-found',
            message: 'No assets found.',
            createdObjects: [],
            assetShortHeader: null,
          };
        }

        // In the future, we could ask the user to select the asset they want to use.
        // For now, we just return the first asset.
        const chosenResult = assetSearch.results[0];
        if (!chosenResult) throw new Error('No asset found.');
        const assetShortHeader = chosenResult.asset;

        const installOutput = await installAsset({
          assetShortHeader,
          objectsContainer,
          requestedObjectName: objectName,
          setIsAssetBeingInstalled: () => {},
        });

        if (!installOutput) {
          return {
            status: 'error',
            message: 'Asset found but failed to install asset.',
            createdObjects: [],
            assetShortHeader: null,
          };
        }

        return {
          status: 'asset-installed',
          message: 'Asset installed successfully.',
          createdObjects: installOutput.createdObjects,
          assetShortHeader,
        };
      },
      [installAsset, profile, getAuthorizationHeader]
    ),
  };
};
