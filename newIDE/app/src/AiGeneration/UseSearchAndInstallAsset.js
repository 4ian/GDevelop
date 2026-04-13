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
import { AssetStoreContext } from '../AssetStore/AssetStoreContext';

type _FuncReturnType = {
  searchAndInstallAsset: AssetSearchAndInstallOptions => Promise<AssetSearchAndInstallResult>,
};

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
|}): _FuncReturnType => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const { getAssetShortHeaderFromId } = React.useContext(AssetStoreContext);
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
        objectType,
        exactAssetId,
        ...assetSearchOptions
      }: AssetSearchAndInstallOptions): Promise<AssetSearchAndInstallResult> => {
        if (!profile) throw new Error('User should be authenticated.');

        let assetShortHeader;
        if (exactAssetId) {
          // If an exact asset id is provided, fetch the asset directly
          // instead of searching for it.
          const foundAssetShortHeader = getAssetShortHeaderFromId(exactAssetId);
          if (!foundAssetShortHeader) {
            return {
              status: 'nothing-found',
              message: `No asset found with id "${exactAssetId}".`,
              createdObjects: [],
              assetShortHeader: null,
            };
          }
          if (
            objectType &&
            foundAssetShortHeader.objectType !== objectType
          ) {
            return {
              status: 'nothing-found',
              message: `Asset with id "${exactAssetId}" has type "${
                foundAssetShortHeader.objectType
              }", which does not match the requested type "${objectType}".`,
              createdObjects: [],
              assetShortHeader: null,
            };
          }
          assetShortHeader = foundAssetShortHeader;
        } else {
          const assetSearch: AssetSearch = await retryIfFailed(
            { times: 3, backoff: { initialDelay: 300, factor: 2 } },
            () =>
              createAssetSearch(getAuthorizationHeader, {
                userId: profile.id,
                objectType,
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
          assetShortHeader = chosenResult.asset;
        }

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
      [
        installAsset,
        profile,
        getAuthorizationHeader,
        getAssetShortHeaderFromId,
      ]
    ),
  };
};
