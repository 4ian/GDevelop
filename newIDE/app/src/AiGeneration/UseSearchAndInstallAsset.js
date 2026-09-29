// @flow
import * as React from 'react';
import {
  type AssetSearchAndInstallOptions,
  type AssetSearchAndInstallResult,
  type EffectAssetSearchAndInstallOptions,
  type EffectAssetSearchAndInstallResult,
} from '../EditorFunctions';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  createAssetSearch,
  type AssetSearch,
} from '../Utils/GDevelopServices/Generation';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import {
  useInstallAsset,
  useInstallEffectAsset,
} from '../AssetStore/NewObjectDialog';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { AssetStoreContext } from '../AssetStore/AssetStoreContext';
import { toAssetStoreType } from '../AssetStore/AssetStoreSearchFilter';
import { isEffectAsset } from '../Utils/GDevelopServices/Asset';

type _FuncReturnType = {
  searchAndInstallAsset: AssetSearchAndInstallOptions => Promise<AssetSearchAndInstallResult>,
  searchAndInstallEffectAsset: EffectAssetSearchAndInstallOptions => Promise<EffectAssetSearchAndInstallResult>,
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
  const installEffectAsset = useInstallEffectAsset({
    project,
    resourceManagementProps,
  });

  const searchAndInstallEffectAsset = React.useCallback(
    async ({
      effectsContainer,
      effectName,
      effectType,
      exactOrPartialAssetId,
      ...assetSearchOptions
    }: EffectAssetSearchAndInstallOptions): Promise<EffectAssetSearchAndInstallResult> => {
      if (!profile) throw new Error('User should be authenticated.');

      let assetShortHeader = getAssetShortHeaderFromId(exactOrPartialAssetId);
      if (!assetShortHeader) {
        const assetSearch: AssetSearch = await retryIfFailed(
          { times: 3, backoff: { initialDelay: 300, factor: 2 } },
          () =>
            createAssetSearch(getAuthorizationHeader, {
              userId: profile.id,
              objectType: effectType || '',
              exactOrPartialAssetId,
              searchTerms: '',
              description: '',
              twoDimensionalViewKind: '',
              ...assetSearchOptions,
            })
        );
        const chosenResult = assetSearch.results
          ? assetSearch.results[0]
          : null;
        if (!chosenResult) {
          return {
            status: 'nothing-found',
            message: `No asset found with id "${exactOrPartialAssetId}".`,
            effect: null,
            assetShortHeader: null,
          };
        }
        assetShortHeader = chosenResult.asset;
      }

      if (!isEffectAsset(assetShortHeader)) {
        return {
          status: 'nothing-found',
          message: `Asset with id "${exactOrPartialAssetId}" is a "${
            assetShortHeader.objectType
          }" object, not an effect.`,
          effect: null,
          assetShortHeader: null,
        };
      }
      if (effectType && assetShortHeader.objectType !== effectType) {
        return {
          status: 'nothing-found',
          message: `Asset with id "${exactOrPartialAssetId}" is a "${
            assetShortHeader.objectType
          }" effect, not a "${effectType}": leave the effect type out or give the one of the asset.`,
          effect: null,
          assetShortHeader: null,
        };
      }

      const effect = await installEffectAsset({
        assetShortHeader,
        effectsContainer,
        effectName,
      });
      if (!effect) {
        return {
          status: 'error',
          message: 'Asset found but failed to install it.',
          effect: null,
          assetShortHeader: null,
        };
      }
      return {
        status: 'asset-installed',
        message: 'Asset installed successfully.',
        effect,
        assetShortHeader,
      };
    },
    [
      installEffectAsset,
      profile,
      getAuthorizationHeader,
      getAssetShortHeaderFromId,
    ]
  );

  return {
    searchAndInstallEffectAsset,
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
            if (isEffectAsset(foundAssetShortHeader)) {
              return {
                status: 'nothing-found',
                message: `Asset with id "${exactOrPartialAssetId}" is a "${
                  foundAssetShortHeader.objectType
                }" effect, not an object: it is added as an effect of a layer.`,
                createdObjects: [],
                assetShortHeader: null,
                isTheFirstOfItsTypeInProject: false,
              };
            }
            if (
              objectType &&
              foundAssetShortHeader.objectType !== toAssetStoreType(objectType)
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
          if (!assetSearchOptions.searchTerms && !exactOrPartialAssetId) {
            return {
              status: 'error',
              message:
                'Cannot search for an asset without either `searchTerms` or `exactOrPartialAssetId`.',
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
