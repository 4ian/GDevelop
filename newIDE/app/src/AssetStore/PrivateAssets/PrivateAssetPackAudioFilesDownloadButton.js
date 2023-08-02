// @flow
import * as React from 'react';
import PrivateAssetsAuthorizationContext from './PrivateAssetsAuthorizationContext';
import { type PrivateAssetPack } from '../../Utils/GDevelopServices/Asset';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import Music from '../../UI/CustomSvgIcons/Music';
import Window from '../../Utils/Window';

const PrivateAssetPackAudioFilesDownloadButton = ({
  assetPack,
}: {|
  assetPack: PrivateAssetPack,
|}) => {
  const { getPrivateAssetPackAudioArchiveUrl } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const [
    isAudioArchiveUrlLoading,
    setIsAudioArchiveUrlLoading,
  ] = React.useState(false);

  return (
    <RaisedButton
      primary
      label={
        isAudioArchiveUrlLoading ? (
          <Trans>Loading...</Trans>
        ) : (
          <Trans>Download pack sounds</Trans>
        )
      }
      icon={<Music />}
      disabled={isAudioArchiveUrlLoading}
      onClick={async () => {
        setIsAudioArchiveUrlLoading(true);
        const url = await getPrivateAssetPackAudioArchiveUrl(assetPack.id);
        setIsAudioArchiveUrlLoading(false);
        if (!url) {
          console.error(
            `Could not generate url for premium asset pack with name ${
              assetPack.name
            }`
          );
          return;
        }
        Window.openExternalURL(url);
      }}
    />
  );
};

export default PrivateAssetPackAudioFilesDownloadButton;
