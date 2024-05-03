// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  getPrivateAsset,
  type AssetShortHeader,
  type Asset,
  type Environment,
  getPrivateAssetPackAudioFilesArchiveUrl,
} from '../../Utils/GDevelopServices/Asset';
import {
  addAssetToProject,
  type InstallAssetOutput,
  type InstallAssetArgs,
} from '../InstallAsset';
import {
  createProductAuthorizedUrl,
  getAuthorizationTokenForPrivateAssets,
} from '../../Utils/GDevelopServices/Shop';
import PrivateAssetsAuthorizationContext from './PrivateAssetsAuthorizationContext';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';

type Props = {| children: React.Node |};

const enrichAssetWithAuthorizedResourceUrls = (
  asset: Asset,
  authorizationToken: string
): Asset => {
  const objectAssets = asset.objectAssets;
  return {
    ...asset,
    objectAssets: objectAssets.map(objectAsset => ({
      ...objectAsset,
      resources: objectAsset.resources.map(resource => ({
        ...resource,
        file: createProductAuthorizedUrl(resource.file, authorizationToken),
      })),
    })),
  };
};

const PrivateAssetsAuthorizationProvider = ({ children }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const profile = authenticatedUser.profile;
  const [authorizationToken, setAuthorizationToken] = React.useState<?string>(
    null
  );
  const isLoading = React.useRef<boolean>(false);

  const fetchAuthorizationToken = React.useCallback(
    async (userId: string) => {
      const token = await getAuthorizationTokenForPrivateAssets(
        authenticatedUser.getAuthorizationHeader,
        {
          userId,
        }
      );
      // When a new token is fetched, always update it in the state.
      setAuthorizationToken(token);
      return token;
    },
    [authenticatedUser.getAuthorizationHeader]
  );

  const updateAuthorizationToken = async () => {
    if (!profile) return;
    const userId = profile.id;

    // If a request is already in progress, don't do anything.
    if (isLoading.current) return;

    try {
      isLoading.current = true;
      await fetchAuthorizationToken(userId);
    } catch (error) {
      console.error('Could not fetch the authorization token', error);
    } finally {
      isLoading.current = false;
    }
  };

  const fetchPrivateAsset = async (
    assetShortHeader: AssetShortHeader,
    { environment }: {| environment: Environment |}
  ): Promise<?Asset> => {
    if (!profile) return;
    const userId = profile.id;

    let token =
      authorizationToken || (await fetchAuthorizationToken(profile.id));

    try {
      const asset = await getPrivateAsset(assetShortHeader, token, {
        environment,
      });
      return asset;
    } catch (error) {
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
        // If the token is expired, fetch a new one and try again.
        token = await fetchAuthorizationToken(userId);
        const asset = await getPrivateAsset(assetShortHeader, token, {
          environment,
        });
        return asset;
      }
      throw error;
    }
  };

  const installPrivateAsset = async ({
    asset,
    project,
    objectsContainer,
  }: InstallAssetArgs): Promise<?InstallAssetOutput> => {
    if (!profile) {
      throw new Error(
        'Unable to install the asset because no profile was found.'
      );
    }

    const token =
      authorizationToken || (await fetchAuthorizationToken(profile.id));

    const assetWithAuthorizedResourceUrls = enrichAssetWithAuthorizedResourceUrls(
      asset,
      token
    );

    return addAssetToProject({
      asset: assetWithAuthorizedResourceUrls,
      project,
      objectsContainer,
    });
  };

  // This URL is only valid for a limited time, so this function needs to be called
  // every time the user wants to download the audio files.
  const getPrivateAssetPackAudioArchiveUrl = async (
    privateAssetPackId: string
  ): Promise<string | null> => {
    if (!profile) return null;

    // Always fetch a new token, as the URL is only valid for a limited time.
    const token = await fetchAuthorizationToken(profile.id);

    return getPrivateAssetPackAudioFilesArchiveUrl(privateAssetPackId, token);
  };

  return (
    <PrivateAssetsAuthorizationContext.Provider
      value={{
        authorizationToken,
        updateAuthorizationToken,
        fetchPrivateAsset,
        installPrivateAsset,
        getPrivateAssetPackAudioArchiveUrl,
      }}
    >
      {children}
    </PrivateAssetsAuthorizationContext.Provider>
  );
};

export default PrivateAssetsAuthorizationProvider;
