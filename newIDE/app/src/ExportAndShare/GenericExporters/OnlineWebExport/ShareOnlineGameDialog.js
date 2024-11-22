// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import AlertMessage from '../../../UI/AlertMessage';
import ShareLink from '../../../UI/ShareDialog/ShareLink';
import SocialShareButtons from '../../../UI/ShareDialog/SocialShareButtons';
import ShareButton from '../../../UI/ShareDialog/ShareButton';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import CircularProgress from '../../../UI/CircularProgress';
import QrCode from '../../../UI/QrCode';
import { Column, Line } from '../../../UI/Grid';
import InfoBar from '../../../UI/Messages/InfoBar';
import FlatButton from '../../../UI/FlatButton';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import Text from '../../../UI/Text';
import { GameThumbnail } from '../../../GameDashboard/GameThumbnail';

const styles = {
  qrCodeAndShareContainer: {
    flex: 1,
    display: 'flex',
    gap: 8,
  },
};

type Props = {|
  buildOrGameUrl: ?string,
  gameThumbnailUrl: ?string,
  gameName: ?string,
  isBuildPublished: boolean,
  onOpenGameDashboard?: () => void,
  onClose: () => void,
  loadingText: ?React.Node,
|};

const ShareOnlineGameDialog = ({
  buildOrGameUrl,
  gameThumbnailUrl,
  gameName,
  onOpenGameDashboard,
  onClose,
  isBuildPublished,
  loadingText,
}: Props) => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );

  return (
    <Dialog
      title={<Trans>Share your game</Trans>}
      id="export-game-share-dialog"
      maxWidth={gameThumbnailUrl ? 'md' : 'sm'}
      actions={[
        <DialogPrimaryButton
          key="close"
          label={<Trans>Done</Trans>}
          primary
          onClick={onClose}
          disabled={!!loadingText}
        />,
      ]}
      secondaryActions={[
        buildOrGameUrl && !loadingText && onOpenGameDashboard ? (
          <FlatButton
            key="publish"
            primary
            label={<Trans>Open Game dashboard</Trans>}
            onClick={onOpenGameDashboard}
          />
        ) : null,
      ]}
      open
      onRequestClose={onClose}
      flexColumnBody
    >
      {buildOrGameUrl && !loadingText ? (
        <ColumnStackLayout noMargin expand>
          <Column noMargin>
            <ResponsiveLineStackLayout noMargin noResponsiveLandscape>
              {gameThumbnailUrl && gameName && (
                <GameThumbnail
                  background="light"
                  fullWidthOnMobile
                  thumbnailUrl={gameThumbnailUrl}
                  gameName={gameName}
                />
              )}
              <ColumnStackLayout noMargin expand noOverflowParent>
                <ShareLink url={buildOrGameUrl} withOpenButton />
                <div
                  style={{
                    ...styles.qrCodeAndShareContainer,
                    justifyContent:
                      isMobile && !isLandscape ? 'stretch' : 'space-between',
                    flexDirection:
                      isMobile && !isLandscape ? 'column-reverse' : 'row',
                    alignItems:
                      isMobile && !isLandscape ? 'stretch' : 'flex-end',
                  }}
                >
                  <Line noMargin justifyContent="center">
                    <QrCode url={buildOrGameUrl} size={100} />
                  </Line>

                  <Column
                    noMargin
                    alignItems={navigator.share ? 'stretch' : 'flex-end'}
                  >
                    {navigator.share ? (
                      <ShareButton url={buildOrGameUrl} />
                    ) : (
                      <SocialShareButtons url={buildOrGameUrl} />
                    )}
                  </Column>
                </div>
              </ColumnStackLayout>
            </ResponsiveLineStackLayout>
          </Column>

          {!isBuildPublished && (
            <AlertMessage kind="info">
              <Trans>
                This link is private. You can share it with collaborators,
                friends or testers.
                <br />
                When you're ready, go to the Game Dashboard and publish it on
                gd.games.
              </Trans>
            </AlertMessage>
          )}
        </ColumnStackLayout>
      ) : (
        <ColumnStackLayout alignItems="center" justifyContent="center" expand>
          <Line>
            <CircularProgress size={40} />
          </Line>
          <Text>{loadingText}</Text>
        </ColumnStackLayout>
      )}
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </Dialog>
  );
};

export default ShareOnlineGameDialog;
