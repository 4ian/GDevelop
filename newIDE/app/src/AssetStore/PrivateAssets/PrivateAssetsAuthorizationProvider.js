// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { getAuthorizationTokenForPrivateAssets } from '../../Utils/GDevelopServices/Shop';
import PrivateAssetsAuthorizationContext from './PrivateAssetsAuthorizationContext';

type Props = {| children: React.Node |};

function PrivateAssetsAuthorizationProvider({ children }: Props) {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [authorizationToken, setAuthorizationToken] = React.useState<?string>(
    null
  );
  const isLoading = React.useRef<boolean>(false);

  const fetchAuthorizationToken = async () => {
    // If a request is already in progress, don't do anything.
    if (isLoading.current) return;

    if (!profile) return;
    const userId = profile.id;

    try {
      isLoading.current = true;
      const token = await getAuthorizationTokenForPrivateAssets(
        getAuthorizationHeader,
        {
          userId,
        }
      );
      setAuthorizationToken(token);
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.current = false;
    }
  };

  return (
    <PrivateAssetsAuthorizationContext.Provider
      value={{
        authorizationToken,
        fetchAuthorizationToken,
      }}
    >
      {children}
    </PrivateAssetsAuthorizationContext.Provider>
  );
}

export default PrivateAssetsAuthorizationProvider;
