// @flow
import React from 'react';
import {
  type AssetShortHeader,
  type Asset,
  type Environment,
} from '../../Utils/GDevelopServices/Asset';
import {
  type InstallAssetOutput,
  type InstallAssetShortHeaderArgs,
} from '../InstallAsset';

export type PrivateAssetsState = {|
  authorizationToken: ?string,
  updateAuthorizationToken: () => Promise<void>,
  fetchPrivateAsset: (
    assetShortHeader: AssetShortHeader,
    options: {| environment: Environment |}
  ) => Promise<?Asset>,
  installPrivateAsset: (
    options: InstallAssetShortHeaderArgs
  ) => Promise<?InstallAssetOutput>,
|};

const initialPrivateAssetsState = {
  authorizationToken: null,
  updateAuthorizationToken: async () => {},
  fetchPrivateAsset: async (assetShortHeader, options) => null,
  installPrivateAsset: async options => null,
};

const PrivateAssetsAuthorizationContext = React.createContext<PrivateAssetsState>(
  initialPrivateAssetsState
);

export default PrivateAssetsAuthorizationContext;
