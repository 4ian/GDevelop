// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  getPrivateAsset,
  type AssetShortHeader,
  type Asset,
  type Environment,
} from '../../Utils/GDevelopServices/Asset';
import {
  installAsset,
  type InstallAssetOutput,
  type InstallAssetShortHeaderArgs,
} from '../InstallAsset';
import {
  createProductAuthorizedUrl,
  getAuthorizationTokenForPrivateAssets,
} from '../../Utils/GDevelopServices/Shop';
import PrivateAssetsAuthorizationContext from './PrivateAssetsAuthorizationContext';

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
      if (error.response && error.response.status === 404) {
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
    assetShortHeader,
    eventsFunctionsExtensionsState,
    project,
    objectsContainer,
    environment,
  }: InstallAssetShortHeaderArgs): Promise<?InstallAssetOutput> => {
    if (!profile) {
      throw new Error(
        'Unable to install the asset because no profile was found.'
      );
    }

    const asset: ?Asset = await fetchPrivateAsset(assetShortHeader, {
      environment,
    });

    if (!asset) {
      throw new Error(
        'Unable to install the asset because it could not be fetched.'
      );
    }

    const token =
      authorizationToken || (await fetchAuthorizationToken(profile.id));

    const assetWithAuthorizedResourceUrls = enrichAssetWithAuthorizedResourceUrls(
      asset,
      token
    );

    return installAsset({
      asset: assetWithAuthorizedResourceUrls,
      eventsFunctionsExtensionsState,
      project,
      objectsContainer,
      environment,
    });
  };

  return (
    <PrivateAssetsAuthorizationContext.Provider
      value={{
        authorizationToken,
        updateAuthorizationToken,
        fetchPrivateAsset,
        installPrivateAsset,
      }}
    >
      {children}
    </PrivateAssetsAuthorizationContext.Provider>
  );
};

export default PrivateAssetsAuthorizationProvider;
