// @flow
import React from 'react';

export type PrivateAssetsState = {|
  authorizationToken: ?string,
  fetchAuthorizationToken: () => Promise<void>,
|};

const initialPrivateAssetsState = {
  authorizationToken: null,
  fetchAuthorizationToken: async () => {},
};

const PrivateAssetsAuthorizationContext = React.createContext<PrivateAssetsState>(
  initialPrivateAssetsState
);

export default PrivateAssetsAuthorizationContext;
