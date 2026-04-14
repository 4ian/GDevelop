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
        exactOrPartialAssetId,
        ...assetSearchOptions
      }: AssetSearchAndInstallOptions): Promise<AssetSearchAndInstallResult> => {
        if (!profile) throw new Error('User should be authenticated.');

        let assetShortHeader;
        if (exactOrPartialAssetId) {
          // If an exact or partial asset id is provided, first try to
          // fetch the asset directly by its id.
          const foundAssetShortHeader = getAssetShortHeaderFromId(
            exactOrPartialAssetId
          );
          if (foundAssetShortHeader) {
            if (
              objectType &&
              foundAssetShortHeader.objectType !== objectType
            ) {
              return {
                status: 'nothing-found',
                message: `Asset with id "${exactOrPartialAssetId}" has type "${
                  foundAssetShortHeader.objectType
                }", which does not match the requested type "${objectType}".`,
                createdObjects: [],
                assetShortHeader: null,
                isTheFirstOfItsTypeInProject: false,
              };
            }
            assetShortHeader = foundAssetShortHeader;
          }
          // If not found by id, fall through to the search below.
        }

        if (!assetShortHeader) {
          if (!objectType && !exactOrPartialAssetId) {
            return {
              status: 'error',
              message:
                'Cannot search for an asset without an object type. Specify either `object_type` or `exact_or_partial_asset_id`.',
              createdObjects: [],
              assetShortHeader: null,
              isTheFirstOfItsTypeInProject: false,
            };
          }
          const assetSearch: AssetSearch = await retryIfFailed(
            { times: 3, backoff: { initialDelay: 300, factor: 2 } },
            () =>
              createAssetSearch(getAuthorizationHeader, {
                userId: profile.id,
                objectType,
                exactOrPartialAssetId,
                ...assetSearchOptions,
              })
          );
          if (!assetSearch.results || assetSearch.results.length === 0) {
            return {
              status: 'nothing-found',
              message: 'No assets found.',
              createdObjects: [],
              assetShortHeader: null,
              isTheFirstOfItsTypeInProject: false,
            };
          }

          // In the future, we could ask the user to select the asset they want to use.
          // For now, we just return the first asset.
          const chosenResult = assetSearch.results[0];
          if (!chosenResult) throw new Error('No asset found.');
          assetShortHeader = chosenResult.asset;
        }

        // `installAsset` computes `isTheFirstOfItsTypeInProject` before
        // actually inserting the objects into the project, so it reflects
        // the state right before installation.
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
            isTheFirstOfItsTypeInProject: false,
          };
        }

        return {
          status: 'asset-installed',
          message: 'Asset installed successfully.',
          createdObjects: installOutput.createdObjects,
          assetShortHeader,
          isTheFirstOfItsTypeInProject:
            installOutput.isTheFirstOfItsTypeInProject,
        };
      },
      [installAsset, profile, getAuthorizationHeader, getAssetShortHeaderFromId]
    ),
  };
};
