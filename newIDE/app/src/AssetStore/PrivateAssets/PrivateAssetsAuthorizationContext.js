// @flow
import React from 'react';
import {
  type AssetShortHeader,
  type Asset,
  type Environment,
} from '../../Utils/GDevelopServices/Asset';

export type PrivateAssetsState = {|
  authorizationToken: ?string,
  updateAuthorizationToken: () => Promise<void>,
  fetchPrivateAsset: (
    assetShortHeader: AssetShortHeader,
    options: {| environment: Environment |}
  ) => Promise<?Asset>,
|};

const initialPrivateAssetsState = {
  authorizationToken: null,
  updateAuthorizationToken: async () => {},
  fetchPrivateAsset: async (assetShortHeader, options) => null,
};

const PrivateAssetsAuthorizationContext = React.createContext<PrivateAssetsState>(
  initialPrivateAssetsState
);

export default PrivateAssetsAuthorizationContext;
