// @flow
import { Trans } from '@lingui/macro';
import React from 'react';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { GdGamesFrame, type GdGamesMessageEventData } from '../UI/GdGamesFrame';
import {
  type PrivateGameTemplateListingData,
  type PrivateAssetPackListingData,
} from '../Utils/GDevelopServices/Shop';
import { useStableUpToDateCallback } from '../Utils/UseStableUpToDateCallback';

type Props = {|
  userId: string,
  onClose: () => void,
  onAssetPackOpen?: (
    privateAssetPackListingData: PrivateAssetPackListingData
  ) => void,
  onGameTemplateOpen?: (
    privateAssetPackListingData: PrivateGameTemplateListingData
  ) => void,
|};

const PublicProfileDialog = ({
  userId,
  onClose,
  onAssetPackOpen,
  onGameTemplateOpen,
}: Props) => {
  const callbacks = React.useMemo(
    () => ({
      openAssetPack: onAssetPackOpen
        ? (data: GdGamesMessageEventData) => {
            if (data.privateAssetPackListingData) {
              onAssetPackOpen(data.privateAssetPackListingData);
            }
          }
        : null,
      openGameTemplate: onGameTemplateOpen
        ? (data: GdGamesMessageEventData) => {
            if (data.privateGameTemplateListingData) {
              onGameTemplateOpen(data.privateGameTemplateListingData);
            }
          }
        : null,
    }),
    [onAssetPackOpen, onGameTemplateOpen]
  );

  const onMessageReceived = React.useCallback(
    (data: GdGamesMessageEventData) => {
      if (data.id && callbacks[data.id]) {
        callbacks[data.id](data);
      }
    },
    [callbacks]
  );

  const stableOnMessageReceived = useStableUpToDateCallback(onMessageReceived);

  return (
    <Dialog
      title={null} // Specific case where the title is handled by the content.
      open
      fullHeight
      maxWidth={'md'}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
      flexColumnBody
      onRequestClose={onClose}
    >
      <GdGamesFrame
        path={`/embedded/user/${userId}`}
        loadErrorMessage={
          <Trans>
            Can't load the profile. Verify your internet connection or try again
            later.
          </Trans>
        }
        supportedMessageIds={Object.entries(callbacks)
          .filter(([key, value]) => !!value)
          .map(([key]) => key)}
        onMessageReceived={stableOnMessageReceived}
      />
    </Dialog>
  );
};

export default PublicProfileDialog;
