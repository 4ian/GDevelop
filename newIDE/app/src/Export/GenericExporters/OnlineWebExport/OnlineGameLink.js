// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Text from '../../../UI/Text';
import { Column, Line } from '../../../UI/Grid';
import TextField from '../../../UI/TextField';
import {
  getBuildArtifactUrl,
  getWebBuildThumbnailUrl,
  type Build,
} from '../../../Utils/GDevelopServices/Build';
import { type BuildStep } from '../../Builds/BuildStepsProgress';
import RaisedButton from '../../../UI/RaisedButton';
import Window from '../../../Utils/Window';
import Copy from '../../../UI/CustomSvgIcons/Copy';
import Share from '@material-ui/icons/Share';
import InfoBar from '../../../UI/Messages/InfoBar';
import IconButton from '../../../UI/IconButton';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import FlatButton from '../../../UI/FlatButton';
import Dialog from '../../../UI/Dialog';
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
import { TextFieldWithButtonLayout } from '../../../UI/Layout';
import {
  getGame,
  getGameUrl,
  updateGame,
  type Game,
} from '../../../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import AlertMessage from '../../../UI/AlertMessage';
import OnlineGamePropertiesDialog from './OnlineGamePropertiesDialog';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { type PartialGameChange } from '../../../GameDashboard/PublicGamePropertiesDialog';

const styles = {
  icon: {
    padding: 5,
  },
};

type OnlineGameLinkProps = {|
  build: ?Build,
  project: gdProject,
  saveProject: () => Promise<void>,
  errored: boolean,
  exportStep: BuildStep,
|};

const OnlineGameLink = ({
  build,
  project,
  saveProject,
  errored,
  exportStep,
}: OnlineGameLinkProps) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState<boolean>(
    false
  );
  const [
    isOnlineGamePropertiesDialogOpen,
    setIsOnlineGamePropertiesDialogOpen,
  ] = React.useState<boolean>(false);
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
      } catch (err) {
        console.error('Unable to load the game', err);
      } finally {
        setIsGameLoading(false);
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

  const onGameUpdate = React.useCallback(
    async (
      partialGameChange: PartialGameChange,
      i18n: I18nType
    ): Promise<boolean> => {
      if (!profile || !game || !build) return false;

      const { id } = profile;
      try {
        setIsGameLoading(true);
        const updatedGame = await updateGame(
          getAuthorizationHeader,
          id,
          game.id,
          {
            gameName: project.getName(),
            description: project.getDescription(),
            categories: project.getCategories().toJSArray(),
            playWithGamepad: project.isPlayableWithGamepad(),
            playWithKeyboard: project.isPlayableWithKeyboard(),
            playWithMobile: project.isPlayableWithMobile(),
            orientation: project.getOrientation(),
            publicWebBuildId: build.id,
            thumbnailUrl: getWebBuildThumbnailUrl(project, build.id),
            discoverable: partialGameChange.discoverable,
          }
        );
        setGame(updatedGame);
      } catch (err) {
        showErrorBox({
          message: i18n._(
            t`There was an error updating your game. Verify that your internet connection is working or try again later.`
          ),
          rawError: err,
          errorId: 'update-game-error',
        });
        console.error('Unable to update the game', err);
        return false;
      } finally {
        setIsGameLoading(false);
      }

      return true;
    },
    [game, getAuthorizationHeader, profile, build, project]
  );

  if (!build && !exportStep) return null;

  const dialogActions = [
    <FlatButton
      key="close"
      label={<Trans>Close</Trans>}
      primary={false}
      onClick={() => setIsShareDialogOpen(false)}
    />,
    // Ensure there is a game loaded, meaning the user owns the game.
    game && buildUrl && !isBuildPublished && (
      <RaisedButton
        key="publish"
        label={<Trans>Verify and Publish to Liluo.io</Trans>}
        primary
        onClick={() => setIsOnlineGamePropertiesDialogOpen(true)}
      />
    ),
  ];
  return (
    <I18n>
      {({ i18n }) => (
        <>
          {exportPending && (
            <>
              <Text>
                <Trans>Just a few seconds while we generate the link...</Trans>
              </Text>
              <LinearProgress />
            </>
          )}
          {isShareDialogOpen && (
            <Dialog
              title={<Trans>Share your game</Trans>}
              actions={dialogActions}
              open
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
                          <IconButton
                            onClick={onCopy}
                            tooltip={t`Copy`}
                            edge="end"
                          >
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
                            Your game is published! Share it with the community!
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
                      <AlertMessage kind="info">
                        <Trans>
                          This link is private so you can share it with friends
                          and testers. When you're ready you can update your
                          Liluo.io game page.
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
          )}
          {game && build && isOnlineGamePropertiesDialogOpen && (
            <OnlineGamePropertiesDialog
              project={project}
              saveProject={saveProject}
              buildId={build.id}
              onClose={() => setIsOnlineGamePropertiesDialogOpen(false)}
              onApply={async partialGameChange => {
                const isGameUpdated = await onGameUpdate(
                  partialGameChange,
                  i18n
                );
                if (isGameUpdated) {
                  setIsOnlineGamePropertiesDialogOpen(false);
                }
              }}
              game={game}
              isLoading={isGameLoading}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default OnlineGameLink;
