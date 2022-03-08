// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import TextField from '../../UI/TextField';
import {
  getBuildArtifactUrl,
  type Build,
} from '../../Utils/GDevelopServices/Build';
import { type BuildStep } from '../Builds/BuildStepsProgress';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import Copy from '../../UI/CustomSvgIcons/Copy';
import Share from '@material-ui/icons/Share';
import InfoBar from '../../UI/Messages/InfoBar';
import IconButton from '../../UI/IconButton';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import FlatButton from '../../UI/FlatButton';
import Dialog from '../../UI/Dialog';
import {
  EmailShareButton,
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  RedditIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import {
  getGame,
  getGameUrl,
  updateGame,
  type Game,
} from '../../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../UI/AlertMessage';

const styles = {
  icon: {
    padding: 5,
  },
};

export const ExplanationHeader = () => (
  <Column noMargin alignItems="center" justifyContent="center">
    <Line>
      <Text align="center">
        <Trans>
          Generate a unique link, playable from any computer or mobile phone's
          browser.
        </Trans>
      </Text>
    </Line>
  </Column>
);

type WebProjectLinkProps = {|
  build: ?Build,
  errored: boolean,
  exportStep: BuildStep,
  getGameThumbnailUrl: (buildId: string) => ?string,
|};

export const WebProjectLink = ({
  build,
  errored,
  exportStep,
  getGameThumbnailUrl,
}: WebProjectLinkProps) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState<boolean>(
    false
  );
  const [game, setGame] = React.useState<?Game>(null);
  const [isGameLoading, setIsGameLoading] = React.useState<boolean>(false);
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const exportPending = !errored && exportStep !== '' && exportStep !== 'done';
  const isBuildComplete = build && build.status === 'complete';
  const isBuildPublished = build && game && build.id === game.publicWebBuildId;
  const gameUrl = getGameUrl(game);
  const buildUrl =
    exportPending || !isBuildComplete
      ? null
      : isBuildPublished
      ? gameUrl
      : getBuildArtifactUrl(build, 's3Key');

  const loadGame = React.useCallback(
    async () => {
      const gameId = build && build.gameId;
      if (!profile || !gameId) return;

      const { id } = profile;
      try {
        setIsGameLoading(true);
        const game = await getGame(getAuthorizationHeader, id, gameId);
        setGame(game);
        setIsGameLoading(false);
      } catch (err) {
        setIsGameLoading(false);
        console.error('Unable to load the game', err);
      }
    },
    [build, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      // Load game only once
      if (!game && isBuildComplete) {
        loadGame();
      }
    },
    [game, loadGame, isBuildComplete]
  );

  const onOpen = () => {
    if (!buildUrl) return;
    Window.openExternalURL(buildUrl);
  };

  const onCopy = () => {
    if (!buildUrl) return;
    // TODO: use Clipboard.js, after it's been reworked to use this API and handle text.
    navigator.clipboard.writeText(buildUrl);
    setShowCopiedInfoBar(true);
  };

  const onShare = async () => {
    if (!buildUrl || !navigator.share) return;

    // We are on mobile (or on browsers supporting sharing using the system dialog).
    const shareData = {
      title: 'My GDevelop game',
      text: 'Try the game I just created with #gdevelop',
      url: buildUrl,
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Couldn't share the game", err);
    }
  };

  React.useEffect(
    () => {
      if (exportStep === 'done') {
        setIsShareDialogOpen(true);
      }
    },
    [exportStep]
  );

  const onUpdatePublicBuild = React.useCallback(
    async () => {
      if (!profile || !game || !build) return;

      const { id } = profile;
      try {
        setIsGameLoading(true);
        const updatedGame = await updateGame(
          getAuthorizationHeader,
          id,
          game.id,
          {
            publicWebBuildId: build.id,
            thumbnailUrl: build.id ? getGameThumbnailUrl(build.id) : undefined,
          }
        );
        setGame(updatedGame);
        setIsGameLoading(false);
      } catch (err) {
        console.error('Unable to update the game', err);
        setIsGameLoading(false);
      }
    },
    [game, getAuthorizationHeader, profile, build, getGameThumbnailUrl]
  );

  if (!build && !exportStep) return null;

  return (
    <>
      {exportPending && (
        <>
          <Text>
            <Trans>Just a few seconds while we generate the link...</Trans>
          </Text>
          <LinearProgress />
        </>
      )}
      <Dialog
        title={<Trans>Share your game</Trans>}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Back</Trans>}
            primary={false}
            onClick={() => setIsShareDialogOpen(false)}
          />,
        ]}
        open={isShareDialogOpen}
        onRequestClose={() => setIsShareDialogOpen(false)}
      >
        {buildUrl && !isGameLoading ? (
          <Column noMargin>
            <TextFieldWithButtonLayout
              noFloatingLabelText
              renderTextField={() => (
                <TextField
                  value={buildUrl}
                  readOnly
                  fullWidth
                  endAdornment={
                    <IconButton onClick={onCopy} tooltip={t`Copy`} edge="end">
                      <Copy />
                    </IconButton>
                  }
                />
              )}
              renderButton={style => (
                <RaisedButton
                  primary
                  label={<Trans>Open</Trans>}
                  onClick={onOpen}
                  style={style}
                />
              )}
            />
            {isBuildPublished && navigator.share && (
              <Line justifyContent="flex-end">
                <FlatButton
                  label={<Trans>Share</Trans>}
                  onClick={onShare}
                  icon={<Share />}
                />
              </Line>
            )}
            {isBuildPublished && !navigator.share && (
              <Line justifyContent="space-between">
                <Column justifyContent="center">
                  <AlertMessage kind="info">
                    <Trans>
                      This link is unique to your game. Show what you made to
                      the community!
                    </Trans>
                  </AlertMessage>
                </Column>
                <Column justifyContent="flex-end">
                  <Line>
                    <FacebookShareButton
                      url={buildUrl}
                      style={styles.icon}
                      quote={`Try the game I just created with GDevelop.io`}
                      hashtag="#gdevelop"
                    >
                      <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    <RedditShareButton
                      url={buildUrl}
                      title={`Try the game I just created with r/gdevelop`}
                      style={styles.icon}
                    >
                      <RedditIcon size={32} round />
                    </RedditShareButton>
                    <TwitterShareButton
                      title={`Try the game I just created with GDevelop.io`}
                      hashtags={['gdevelop']}
                      url={buildUrl}
                      style={styles.icon}
                    >
                      <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <WhatsappShareButton
                      title={`Try the game I just created with GDevelop.io`}
                      url={buildUrl}
                      style={styles.icon}
                    >
                      <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                    <EmailShareButton
                      subject="My GDevelop game"
                      body="Try the game I just created with GDevelop.io"
                      url={buildUrl}
                      style={styles.icon}
                    >
                      <EmailIcon size={32} round />
                    </EmailShareButton>
                  </Line>
                </Column>
              </Line>
            )}
            {!isBuildPublished && game && (
              <Line>
                <AlertMessage
                  kind="info"
                  renderRightButton={() => (
                    <RaisedButton
                      label={<Trans>Update your game</Trans>}
                      onClick={onUpdatePublicBuild}
                    />
                  )}
                >
                  <Trans>
                    This link is private so you can share it with friends and
                    testers. When you're ready you can update your Liluo.io game
                    page.
                  </Trans>
                </AlertMessage>
              </Line>
            )}
          </Column>
        ) : (
          <Column alignItems="center">
            <CircularProgress />
          </Column>
        )}
        <InfoBar
          message={<Trans>Copied to clipboard!</Trans>}
          visible={showCopiedInfoBar}
          hide={() => setShowCopiedInfoBar(false)}
        />
      </Dialog>
    </>
  );
};

export const onlineWebExporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: <Trans>Web</Trans>,
  helpPage: '/publishing/web',
};
