// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  getPrivateAsset,
  type AssetShortHeader,
  type Asset,
  type Environment,
} from '../../Utils/GDevelopServices/Asset';
import { getAuthorizationTokenForPrivateAssets } from '../../Utils/GDevelopServices/Shop';
import PrivateAssetsAuthorizationContext from './PrivateAssetsAuthorizationContext';

type Props = {| children: React.Node |};

const PrivateAssetsAuthorizationProvider = ({ children }: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [authorizationToken, setAuthorizationToken] = React.useState<?string>(
    null
  );
  const isLoading = React.useRef<boolean>(false);

  const fetchAuthorizationToken = React.useCallback(
    async (userId: string) => {
      const token = await getAuthorizationTokenForPrivateAssets(
        getAuthorizationHeader,
        {
          userId,
        }
      );
      // When a new token is fetched, always update it in the state.
      setAuthorizationToken(token);
      return token;
    },
    [getAuthorizationHeader]
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
      console.error(error);
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

    let token = authorizationToken;
    if (!token) {
      token = await fetchAuthorizationToken(userId);
    }

    try {
      const asset = await getPrivateAsset(assetShortHeader, token, {
        environment,
      });
      return asset;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the token is expired, fetch a new one and try again.
        token = await fetchAuthorizationToken(userId);
        const asset = getPrivateAsset(assetShortHeader, token, { environment });
        return asset;
      }
      throw error;
    }
  };

  return (
    <PrivateAssetsAuthorizationContext.Provider
      value={{
        authorizationToken,
        updateAuthorizationToken,
        fetchPrivateAsset,
      }}
    >
      {children}
    </PrivateAssetsAuthorizationContext.Provider>
  );
};

export default PrivateAssetsAuthorizationProvider;
