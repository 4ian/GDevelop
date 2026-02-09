// @flow
import React from 'react';
import {
  type AssetShortHeader,
  type Asset,
  type Environment,
} from '../../Utils/GDevelopServices/Asset';
import { type AddAssetOutput, type InstallAssetArgs } from '../InstallAsset';

export type PrivateAssetsState = {|
  authorizationToken: ?string,
  updateAuthorizationToken: () => Promise<void>,
  fetchPrivateAsset: (
    assetShortHeader: AssetShortHeader,
    options: {| environment: Environment |}
  ) => Promise<?Asset>,
  installPrivateAsset: (options: InstallAssetArgs) => Promise<?AddAssetOutput>,
  getPrivateAssetPackAudioArchiveUrl: (
    privateAssetPackId: string
  ) => Promise<string | null>,
|};

const initialPrivateAssetsState = {
  authorizationToken: null,
  updateAuthorizationToken: async () => {},
  // $FlowFixMe[missing-local-annot]
  fetchPrivateAsset: async (assetShortHeader, options) => null,
  // $FlowFixMe[missing-local-annot]
  installPrivateAsset: async options => null,
  // $FlowFixMe[missing-local-annot]
  getPrivateAssetPackAudioArchiveUrl: async id => null,
};

const PrivateAssetsAuthorizationContext: React.Context<PrivateAssetsState> = React.createContext<PrivateAssetsState>(
  // $FlowFixMe[incompatible-type]
  initialPrivateAssetsState
);

export default PrivateAssetsAuthorizationContext;
