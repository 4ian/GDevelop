// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import { Line, Spacer } from '../UI/Grid';
import {
  type Game,
  updateGame,
  deleteGame,
  getPublicGame,
  setGameUserAcls,
  setGameSlug,
  getAclsFromUserIds,
  getCategoryName,
} from '../Utils/GDevelopServices/Game';
import { type TabOptions } from '../UI/Tabs';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderError from '../UI/PlaceholderError';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Chip from '@material-ui/core/Chip';
import Builds from '../ExportAndShare/Builds';
import AlertMessage from '../UI/AlertMessage';
import RaisedButton from '../UI/RaisedButton';
import { type PublicGame } from '../Utils/GDevelopServices/Game';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import {
  PublicGamePropertiesDialog,
  type PartialGameChange,
} from './PublicGamePropertiesDialog';
import TextField from '../UI/TextField';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import Crown from '../UI/CustomSvgIcons/Crown';
import { showErrorBox } from '../UI/Messages/MessageBox';
import LeaderboardAdmin from './LeaderboardAdmin';
import { GameAnalyticsPanel } from './GameAnalyticsPanel';
import GameFeedback from './Feedbacks/GameFeedback';
import GameMonetization from './Monetization/GameMonetization';
import RouterContext from '../MainFrame/RouterContext';
import { sendGameDetailsOpened } from '../Utils/Analytics/EventSender';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import CreditsStatusBanner from '../Credits/CreditsStatusBanner';
import MarketingPlans from '../MarketingPlans/MarketingPlans';

export type GameDetailsTab =
  | 'details'
  | 'builds'
  | 'feedback'
  | 'analytics'
  | 'leaderboards'
  | 'marketing';

export const gameDetailsTabs: TabOptions<GameDetailsTab> = [
  {
    value: 'details',
    label: <Trans>Details</Trans>,
  },
  {
    value: 'builds',
    label: <Trans>Builds</Trans>,
  },
  {
    value: 'feedback',
    label: <Trans>Feedback</Trans>,
  },
  {
    value: 'analytics',
    label: <Trans>Analytics</Trans>,
  },
  {
    value: 'leaderboards',
    label: <Trans>Leaderboards</Trans>,
  },
  {
    value: 'marketing',
    label: <Trans>Marketing & Ads</Trans>,
  },
];

type Props = {|
  game: Game,
  project: ?gdProject,
  onGameUpdated: () => Promise<void>,
  onGameDeleted: () => void,
  onLoading: boolean => void,
  currentTab: GameDetailsTab,
  setCurrentTab: GameDetailsTab => void,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
|};

const GameDetails = ({
  game,
  project,
  onGameUpdated,
  onGameDeleted,
  onLoading,
  currentTab,
  setCurrentTab,
  analyticsSource,
}: Props) => {
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    gameUnregisterErrorText,
    setGameUnregisterErrorText,
  ] = React.useState<?string>(null);
  const [isGameUpdating, setIsGameUpdating] = React.useState(false);
  const { showConfirmation, showAlert } = useAlertDialog();

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [publicGame, setPublicGame] = React.useState<?PublicGame>(null);
  const [publicGameError, setPublicGameError] = React.useState<?Error>(null);
  const [
    isPublicGamePropertiesDialogOpen,
    setIsPublicGamePropertiesDialogOpen,
  ] = React.useState(false);

  // If a game dashboard tab is specified, switch to it.
  React.useEffect(
    () => {
      if (routeArguments['games-dashboard-tab']) {
        // Ensure that the tab is valid.
        const gameDetailsTab = gameDetailsTabs.find(
          gameDetailsTab =>
            gameDetailsTab.value === routeArguments['games-dashboard-tab']
        );
        if (gameDetailsTab) setCurrentTab(gameDetailsTab.value);
        // Cleanup once open, to ensure it is not opened again.
        removeRouteArguments(['games-dashboard-tab']);
      }
    },
    [routeArguments, removeRouteArguments, setCurrentTab]
  );

  const loadPublicGame = React.useCallback(
    async () => {
      setPublicGameError(null);
      try {
        const publicGameResponse = await getPublicGame(game.id);
        setPublicGame(publicGameResponse);
      } catch (err) {
        console.error(`Unable to load the game:`, err);
        setPublicGameError(err);
      }
    },
    [game]
  );

  React.useEffect(
    () => {
      loadPublicGame();
    },
    [loadPublicGame]
  );

  React.useEffect(
    () => {
      sendGameDetailsOpened({ from: analyticsSource });
    },
    [analyticsSource]
  );

  const handleGameUpdated = React.useCallback(
    () => {
      // Set Public Game to null to show the loader.
      // It will be refetched thanks to loadPublicGame, because Game is updated.
      setPublicGame(null);
      onGameUpdated();
    },
    [onGameUpdated]
  );

  const updateGameFromProject = async (
    partialGameChange: PartialGameChange,
    i18n: I18nType
  ): Promise<boolean> => {
    if (!project || !profile) return false;
    const { id } = profile;

    const ownerIds = partialGameChange.ownerIds;
    if (!ownerIds || !ownerIds.length) {
      await showAlert({
        title: t`Select an owner`,
        message: t`You must select at least one user to be the owner of the game.`,
      });
      return false;
    }

    try {
      setIsGameUpdating(true);
      const gameId = project.getProjectUuid();
      await updateGame(getAuthorizationHeader, id, gameId, {
        authorName: project.getAuthor() || 'Unspecified publisher',
        gameName: project.getName() || 'Untitled game',
        categories: project.getCategories().toJSArray() || [],
        description: project.getDescription() || '',
        playWithKeyboard: project.isPlayableWithKeyboard(),
        playWithGamepad: project.isPlayableWithGamepad(),
        playWithMobile: project.isPlayableWithMobile(),
        orientation: project.getOrientation(),
        discoverable: partialGameChange.discoverable,
      });
      if (
        partialGameChange.userSlug &&
        partialGameChange.gameSlug &&
        partialGameChange.userSlug === profile.username
      ) {
        try {
          await setGameSlug(
            getAuthorizationHeader,
            id,
            gameId,
            partialGameChange.userSlug,
            partialGameChange.gameSlug
          );
        } catch (error) {
          console.error(
            'Unable to update the game slug:',
            error.response || error.message
          );
          showErrorBox({
            message:
              i18n._(
                t`Unable to update the game slug. A slug must be 6 to 30 characters long and only contains letters, digits or dashes.`
              ) +
              ' ' +
              i18n._(t`Verify your internet connection or try again later.`),
            rawError: error,
            errorId: 'game-slug-update-error',
          });
          setIsGameUpdating(false);
          return false;
        }
      }
      try {
        const authorAcls = getAclsFromUserIds(
          project.getAuthorIds().toJSArray()
        );
        const ownerAcls = getAclsFromUserIds(ownerIds);
        await setGameUserAcls(getAuthorizationHeader, id, gameId, {
          ownership: ownerAcls,
          author: authorAcls,
        });
      } catch (error) {
        console.error(
          'Unable to update the game owners or authors:',
          error.response || error.message
        );
        showErrorBox({
          message:
            i18n._(
              t`Unable to update the game owners or authors. Have you removed yourself from the owners?`
            ) +
            ' ' +
            i18n._(t`Verify your internet connection or try again later.`),
          rawError: error,
          errorId: 'game-acls-update-error',
        });
        setIsGameUpdating(false);
        return false;
      }
      handleGameUpdated();
    } catch (error) {
      console.error(
        'Unable to update the game:',
        error.response || error.message
      );
      showErrorBox({
        message:
          i18n._(t`Unable to update the game details.`) +
          ' ' +
          i18n._(t`Verify your internet connection or try again later.`),
        rawError: error,
        errorId: 'game-details-update-error',
      });
      setIsGameUpdating(false);
      return false;
    }

    setIsGameUpdating(false);
    return true;
  };

  const unregisterGame = React.useCallback(
    async (i18n: I18nType) => {
      if (!profile) return;
      const { id } = profile;
      setGameUnregisterErrorText(null);
      onLoading(true);
      try {
        setIsGameUpdating(true);
        await deleteGame(getAuthorizationHeader, id, game.id);
        onGameDeleted();
      } catch (error) {
        console.error('Unable to delete the game:', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.code === 'game-deletion/leaderboards-exist'
        ) {
          setGameUnregisterErrorText(
            i18n._(
              t`You cannot unregister a game that has active leaderboards. To delete them, go in the Leaderboards tab, and delete them one by one.`
            )
          );
        }
      } finally {
        setIsGameUpdating(false);
        onLoading(false);
      }
    },
    [onLoading, game.id, profile, onGameDeleted, getAuthorizationHeader]
  );

  const unpublishGame = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;
      try {
        setIsGameUpdating(true);
        await updateGame(getAuthorizationHeader, id, game.id, {
          publicWebBuildId: null,
        });
        handleGameUpdated();
      } catch (err) {
        console.error('Unable to update the game', err);
      } finally {
        setIsGameUpdating(false);
      }
    },
    [game, getAuthorizationHeader, profile, handleGameUpdated]
  );

  const onClickUnregister = React.useCallback(
    async (i18n: I18nType) => {
      const answer = await showConfirmation({
        title: t`Unregister game`,
        message: t`Are you sure you want to unregister this game?${'\n\n'}It will disappear from your games dashboard and you won't get access to analytics, unless you register it again.`,
      });

      if (!answer) return;

      unregisterGame(i18n);
    },
    [unregisterGame, showConfirmation]
  );

  const onClickUnpublish = React.useCallback(
    async (i18n: I18nType) => {
      const answer = await showConfirmation({
        title: t`Unpublish game`,
        message: t`Are you sure you want to unpublish this game?${'\n\n'}This will make your gd.games unique game URL not accessible anymore.${'\n\n'}You can decide at any time to publish it again.`,
      });

      if (!answer) return;

      unpublishGame();
    },
    [unpublishGame, showConfirmation]
  );

  const authorUsernames =
    publicGame &&
    publicGame.authors.map(author => author.username).filter(Boolean);

  const ownerUsernames =
    publicGame &&
    publicGame.owners.map(owner => owner.username).filter(Boolean);

  const isGameOpenedAsProject =
    !!project && project.getProjectUuid() === game.id;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Line expand noMargin useFullHeight>
            {currentTab === 'leaderboards' ? (
              <LeaderboardAdmin gameId={game.id} onLoading={onLoading} />
            ) : null}
            {currentTab === 'details' ? (
              publicGameError ? (
                <PlaceholderError onRetry={loadPublicGame}>
                  <Trans>There was an issue getting the game details.</Trans>{' '}
                  <Trans>
                    Verify your internet connection or try again later.
                  </Trans>
                </PlaceholderError>
              ) : !publicGame ? (
                <PlaceholderLoader />
              ) : (
                <ColumnStackLayout expand noMargin>
                  {!isGameOpenedAsProject && (
                    <AlertMessage kind="info">
                      <Trans>
                        In order to update these details you have to open the
                        game's project.
                      </Trans>
                    </AlertMessage>
                  )}
                  <Line alignItems="center" noMargin>
                    <Line
                      expand
                      justifyContent="flex-start"
                      alignItems="center"
                      noMargin
                    >
                      {authorUsernames && (
                        <>
                          <Text>
                            <Trans>Authors:</Trans>
                          </Text>
                          <Line noMargin>
                            {authorUsernames.map((username, index) => (
                              <React.Fragment key={username}>
                                <Spacer />
                                <Chip
                                  size="small"
                                  icon={
                                    ownerUsernames &&
                                    ownerUsernames.includes(username) ? (
                                      <Crown />
                                    ) : (
                                      undefined
                                    )
                                  }
                                  className="notranslate"
                                  label={username}
                                  color={index === 0 ? 'primary' : 'default'}
                                />
                              </React.Fragment>
                            ))}
                          </Line>
                        </>
                      )}
                    </Line>
                    <Line expand justifyContent="flex-end" noMargin>
                      <Text>
                        <Trans>
                          Created on {i18n.date(game.createdAt * 1000)}
                        </Trans>
                      </Text>
                    </Line>
                  </Line>
                  {(publicGame.playWithKeyboard ||
                    publicGame.playWithGamepad ||
                    publicGame.playWithMobile ||
                    publicGame.categories) && (
                    <Line alignItems="center" noMargin>
                      <Line
                        expand
                        justifyContent="flex-start"
                        alignItems="center"
                        noMargin
                      >
                        {publicGame.categories &&
                          !!publicGame.categories.length && (
                            <>
                              <Text>
                                <Trans>Genres:</Trans>
                              </Text>
                              <Line noMargin>
                                {publicGame.categories.map(
                                  (category, index) => (
                                    <React.Fragment key={category}>
                                      <Spacer />
                                      <Chip
                                        size="small"
                                        label={getCategoryName(category, i18n)}
                                        color={
                                          index === 0 ? 'primary' : 'default'
                                        }
                                      />
                                    </React.Fragment>
                                  )
                                )}
                              </Line>
                            </>
                          )}
                      </Line>
                      <Line expand justifyContent="flex-end" noMargin>
                        {publicGame.playWithKeyboard && <KeyboardIcon />}
                        {publicGame.playWithGamepad && <SportsEsportsIcon />}
                        {publicGame.playWithMobile && <SmartphoneIcon />}
                      </Line>
                    </Line>
                  )}
                  <TextField
                    value={publicGame.gameName}
                    readOnly
                    fullWidth
                    floatingLabelText={<Trans>Game name</Trans>}
                    floatingLabelFixed={true}
                  />
                  <TextField
                    value={publicGame.description || ''}
                    readOnly
                    fullWidth
                    floatingLabelText={<Trans>Game description</Trans>}
                    floatingLabelFixed={true}
                    translatableHintText={t`No description set.`}
                    multiline
                    rows={5}
                  />
                  <SelectField
                    disabled
                    fullWidth
                    floatingLabelText={
                      <Trans>Device orientation (for mobile)</Trans>
                    }
                    value={publicGame.orientation}
                  >
                    <SelectOption value="default" label={t`Platform default`} />
                    <SelectOption value="landscape" label={t`Landscape`} />
                    <SelectOption value="portrait" label={t`Portrait`} />
                  </SelectField>
                  <ResponsiveLineStackLayout noMargin justifyContent="flex-end">
                    <FlatButton
                      onClick={() => onClickUnregister(i18n)}
                      label={<Trans>Unregister this game</Trans>}
                      disabled={isGameUpdating}
                    />
                    {publicGame.publicWebBuildId && (
                      <RaisedButton
                        onClick={() => onClickUnpublish(i18n)}
                        label={<Trans>Unpublish from gd.games</Trans>}
                        disabled={isGameUpdating}
                      />
                    )}
                    <RaisedButton
                      primary
                      onClick={() => setIsPublicGamePropertiesDialogOpen(true)}
                      label={<Trans>Edit game details</Trans>}
                      disabled={!isGameOpenedAsProject || isGameUpdating}
                    />
                  </ResponsiveLineStackLayout>
                  {gameUnregisterErrorText ? (
                    <PlaceholderError>
                      {gameUnregisterErrorText}
                    </PlaceholderError>
                  ) : null}
                </ColumnStackLayout>
              )
            ) : null}
            {currentTab === 'builds' ? (
              <Builds
                game={game}
                authenticatedUser={authenticatedUser}
                onGameUpdated={onGameUpdated}
              />
            ) : null}
            {currentTab === 'analytics' ? (
              <GameAnalyticsPanel game={game} />
            ) : null}
            {currentTab === 'feedback' ? (
              <GameFeedback
                i18n={i18n}
                authenticatedUser={authenticatedUser}
                game={game}
              />
            ) : null}
            {currentTab === 'marketing' ? (
              <ColumnStackLayout noMargin expand>
                <CreditsStatusBanner displayPurchaseAction />
                <Text size="sub-title">
                  <Trans>Marketing Campaigns</Trans>
                </Text>
                <MarketingPlans game={game} />
                <GameMonetization
                  game={game}
                  onGameUpdated={handleGameUpdated}
                />
              </ColumnStackLayout>
            ) : null}
          </Line>
          {publicGame && project && isPublicGamePropertiesDialogOpen && (
            <PublicGamePropertiesDialog
              project={project}
              publicGame={publicGame}
              onApply={async partialGameChange => {
                const isGameUpdated = await updateGameFromProject(
                  partialGameChange,
                  i18n
                );
                if (isGameUpdated) {
                  setIsPublicGamePropertiesDialogOpen(false);
                }
              }}
              onClose={() => setIsPublicGamePropertiesDialogOpen(false)}
              isLoading={isGameUpdating}
              i18n={i18n}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default GameDetails;
