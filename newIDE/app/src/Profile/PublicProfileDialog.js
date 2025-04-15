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
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { useStableUpToDateCallback } from '../Utils/UseStableUpToDateCallback';
import { gamesPlatformEmbeddedVersion } from '../MainFrame/EditorContainers/HomePage/PlaySection/GamesPlatformFrame.js';

type Props = {|
  userId: string,
  onClose: () => void,
  onAssetPackOpen?: (
    privateAssetPackListingData: PrivateAssetPackListingData
  ) => void,
  onGameTemplateOpen?: (
    privateAssetPackListingData: PrivateGameTemplateListingData
  ) => void,
  onGameOpen?: (gameId: string) => void,
  onExampleOpen?: (exampleShortHeader: ExampleShortHeader) => void,
|};

const PublicProfileDialog = ({
  userId,
  onClose,
  onAssetPackOpen,
  onGameTemplateOpen,
  onGameOpen,
  onExampleOpen,
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
      openGame: onGameOpen
        ? (data: GdGamesMessageEventData) => {
            if (data.gameId) {
              onGameOpen(data.gameId);
            }
          }
        : null,
      openExample: onExampleOpen
        ? (data: GdGamesMessageEventData) => {
            if (data.exampleShortHeader) {
              onExampleOpen(data.exampleShortHeader);
            }
          }
        : null,
    }),
    [onAssetPackOpen, onGameTemplateOpen, onGameOpen, onExampleOpen]
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
        path={`/app-embedded/${gamesPlatformEmbeddedVersion}/user/${userId}`}
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
