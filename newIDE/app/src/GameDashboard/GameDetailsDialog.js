// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { formatISO } from 'date-fns';
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
import Dialog from '../UI/Dialog';
import { Tab, Tabs } from '../UI/Tabs';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import {
  type GameMetrics,
  getGameMetrics,
} from '../Utils/GDevelopServices/Analytics';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderError from '../UI/PlaceholderError';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { Chip, CircularProgress } from '@material-ui/core';
import { Table, TableBody, TableRow, TableRowColumn } from '../UI/Table';
import Builds from '../Export/Builds';
import AlertMessage from '../UI/AlertMessage';
import subDays from 'date-fns/subDays';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';
import HelpButton from '../UI/HelpButton';
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
import { showErrorBox, showWarningBox } from '../UI/Messages/MessageBox';
import LeaderboardAdmin from './LeaderboardAdmin';

const styles = {
  tableRowStatColumn: {
    width: 100,
  },
};

export type GamesDetailsTab =
  | 'details'
  | 'builds'
  | 'analytics'
  | 'leaderboards';

type Props = {|
  game: Game,
  project: ?gdProject,
  initialTab: GamesDetailsTab,
  onClose: () => void,
  onGameUpdated: (updatedGame: Game) => void,
  onGameDeleted: () => void,
|};

export const GameDetailsDialog = ({
  game,
  project,
  initialTab,
  onClose,
  onGameUpdated,
  onGameDeleted,
}: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [currentTab, setCurrentTab] = React.useState(initialTab);
  const [gameRollingMetrics, setGameMetrics] = React.useState<?GameMetrics>(
    null
  );
  const [gameRollingMetricsError, setGameMetricsError] = React.useState<?Error>(
    null
  );
  const [isGameMetricsLoading, setIsGameMetricsLoading] = React.useState(false);
  const [isGameUpdating, setIsGameUpdating] = React.useState(false);

  const yesterdayIsoDate = formatISO(subDays(new Date(), 1), {
    representation: 'date',
  });
  const [analyticsDate, setAnalyticsDate] = React.useState(yesterdayIsoDate);

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [publicGame, setPublicGame] = React.useState<?PublicGame>(null);
  const [publicGameError, setPublicGameError] = React.useState<?Error>(null);
  const [
    isPublicGamePropertiesDialogOpen,
    setIsPublicGamePropertiesDialogOpen,
  ] = React.useState(false);

  const loadGameMetrics = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;

      setIsGameMetricsLoading(true);
      setGameMetricsError(null);
      try {
        const gameRollingMetrics = await getGameMetrics(
          getAuthorizationHeader,
          id,
          game.id,
          analyticsDate
        );
        setGameMetrics(gameRollingMetrics);
      } catch (err) {
        console.error(`Unable to load game rolling metrics:`, err);
        setGameMetricsError(err);
      }
      setIsGameMetricsLoading(false);
    },
    [getAuthorizationHeader, profile, game, analyticsDate]
  );

  React.useEffect(
    () => {
      loadGameMetrics();
    },
    [loadGameMetrics]
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

  const handleGameUpdated = React.useCallback(
    (updatedGame: Game) => {
      // Set Public Game to null to show the loader.
      // It will be refetched thanks to loadPublicGame, because Game is updated.
      setPublicGame(null);
      onGameUpdated(updatedGame);
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
      showWarningBox(
        i18n._(
          t`You must select at least one user to be the owner of the game.`
        ),
        { delayToNextTick: true }
      );
      return false;
    }

    try {
      setIsGameUpdating(true);
      const gameId = project.getProjectUuid();
      const updatedGame = await updateGame(getAuthorizationHeader, id, gameId, {
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
      handleGameUpdated(updatedGame);
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

  const unregisterGame = async () => {
    if (!profile) return;
    const { id } = profile;

    try {
      setIsGameUpdating(true);
      await deleteGame(getAuthorizationHeader, id, game.id);
      onGameDeleted();
    } catch (error) {
      console.error('Unable to delete the game:', error);
    } finally {
      setIsGameUpdating(false);
    }
  };

  const unpublishGame = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;
      try {
        setIsGameUpdating(true);
        const updatedGame = await updateGame(
          getAuthorizationHeader,
          id,
          game.id,
          {
            publicWebBuildId: null,
          }
        );
        handleGameUpdated(updatedGame);
      } catch (err) {
        console.error('Unable to update the game', err);
      } finally {
        setIsGameUpdating(false);
      }
    },
    [game, getAuthorizationHeader, profile, handleGameUpdated]
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
        <Dialog
          title={
            <span>
              {game.gameName}
              {' - '}
              <Trans>Dashboard</Trans>
            </span>
          }
          open
          noMargin
          onRequestClose={onClose}
          maxWidth="md"
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              onClick={onClose}
              key="close"
            />,
          ]}
          secondaryActions={[
            <HelpButton key="help" helpPagePath="/interface/games-dashboard" />,
          ]}
        >
          <Tabs value={currentTab} onChange={setCurrentTab}>
            <Tab label={<Trans>Details</Trans>} value="details" />
            <Tab label={<Trans>Builds</Trans>} value="builds" />
            <Tab label={<Trans>Analytics</Trans>} value="analytics" />
            <Tab label={<Trans>Leaderboards</Trans>} value="leaderboards" />
          </Tabs>
          <Line>
            {currentTab === 'leaderboards' ? (
              <LeaderboardAdmin gameId={game.id} />
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
                <ColumnStackLayout expand>
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
                    hintText={t`No description set.`}
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
                    <SelectOption
                      value="default"
                      primaryText={t`Platform default`}
                    />
                    <SelectOption
                      value="landscape"
                      primaryText={t`Landscape`}
                    />
                    <SelectOption value="portrait" primaryText={t`Portrait`} />
                  </SelectField>
                  <Line noMargin justifyContent="flex-end">
                    <FlatButton
                      onClick={() => {
                        const answer = Window.showConfirmDialog(
                          "Are you sure you want to unregister this game? \n\nIt will disappear from your games dashboard and you won't get access to analytics, unless you register it again."
                        );

                        if (!answer) return;

                        unregisterGame();
                      }}
                      label={<Trans>Unregister this game</Trans>}
                      disabled={isGameUpdating}
                    />
                    <Spacer />
                    {publicGame.publicWebBuildId && (
                      <>
                        <RaisedButton
                          onClick={() => {
                            const answer = Window.showConfirmDialog(
                              'Are you sure you want to unpublish this game? \n\nThis will make your Liluo.io unique game URL not accessible anymore. \n\nYou can decide at any time to publish it again.'
                            );

                            if (!answer) return;

                            unpublishGame();
                          }}
                          label={<Trans>Unpublish from Liluo.io</Trans>}
                          disabled={isGameUpdating}
                        />
                        <Spacer />
                      </>
                    )}
                    <RaisedButton
                      primary
                      onClick={() => setIsPublicGamePropertiesDialogOpen(true)}
                      label={<Trans>Edit game details</Trans>}
                      disabled={!isGameOpenedAsProject || isGameUpdating}
                    />
                  </Line>
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
              gameRollingMetricsError ? (
                <PlaceholderError
                  onRetry={() => {
                    loadGameMetrics();
                  }}
                >
                  <Trans>There was an issue getting the game analytics.</Trans>{' '}
                  <Trans>
                    Verify your internet connection or try again later.
                  </Trans>
                </PlaceholderError>
              ) : (
                <ColumnStackLayout expand>
                  <Line noMargin alignItems="center">
                    <Text size="title">
                      <Trans>Consolidated metrics</Trans>
                    </Text>
                    <Spacer />
                    {!publicGame && <CircularProgress size={20} />}
                  </Line>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableRowColumn>
                          <Trans>Last week sessions count</Trans>
                        </TableRowColumn>
                        <TableRowColumn style={styles.tableRowStatColumn}>
                          {publicGame && publicGame.cachedLastWeekSessionsCount
                            ? publicGame.cachedLastWeekSessionsCount
                            : '-'}
                        </TableRowColumn>
                      </TableRow>
                      <TableRow>
                        <TableRowColumn>
                          <Trans>Last year sessions count</Trans>
                        </TableRowColumn>
                        <TableRowColumn style={styles.tableRowStatColumn}>
                          {publicGame && publicGame.cachedLastYearSessionsCount
                            ? publicGame.cachedLastYearSessionsCount
                            : '-'}
                        </TableRowColumn>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Line noMargin alignItems="center">
                    <Text size="title">
                      <Trans>Daily metrics</Trans>
                    </Text>
                    <Spacer />
                    {isGameMetricsLoading && <CircularProgress size={20} />}
                  </Line>
                  <Line noMargin>
                    <SelectField
                      fullWidth
                      floatingLabelText={<Trans>Day</Trans>}
                      value={analyticsDate}
                      onChange={(_, _index, newIsoDate) => {
                        setAnalyticsDate(newIsoDate);
                      }}
                    >
                      {Array(5)
                        .fill('')
                        .map((_, index) => {
                          const isoDate = formatISO(
                            subDays(new Date(), index + 2),
                            {
                              representation: 'date',
                            }
                          );
                          return (
                            <SelectOption
                              key={isoDate}
                              value={isoDate}
                              primaryText={isoDate}
                            />
                          );
                        })
                        .reverse()}
                      <SelectOption
                        value={yesterdayIsoDate}
                        primaryText={t`Yesterday`}
                      />
                      <SelectOption
                        value={formatISO(new Date(), {
                          representation: 'date',
                        })}
                        primaryText={t`Today (so far, in real time)`}
                      />
                    </SelectField>
                  </Line>
                  {!isGameMetricsLoading && !gameRollingMetrics ? (
                    <AlertMessage kind="warning">
                      <Trans>
                        There were no players or stored metrics for this day. Be
                        sure to publish your game and get players to try it to
                        see the collected anonymous analytics.
                      </Trans>
                    </AlertMessage>
                  ) : null}
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableRowColumn>
                          <Trans>Players count</Trans>
                        </TableRowColumn>
                        <TableRowColumn style={styles.tableRowStatColumn}>
                          {gameRollingMetrics && gameRollingMetrics.players
                            ? gameRollingMetrics.players.d0Players
                            : '-'}
                        </TableRowColumn>
                      </TableRow>
                      <TableRow>
                        <TableRowColumn>
                          <Trans>Sessions count</Trans>
                        </TableRowColumn>
                        <TableRowColumn style={styles.tableRowStatColumn}>
                          {gameRollingMetrics && gameRollingMetrics.sessions
                            ? gameRollingMetrics.sessions.d0Sessions
                            : '-'}
                        </TableRowColumn>
                      </TableRow>
                      <TableRow>
                        <TableRowColumn>
                          <Trans>New players count</Trans>
                        </TableRowColumn>
                        <TableRowColumn style={styles.tableRowStatColumn}>
                          {gameRollingMetrics && gameRollingMetrics.players
                            ? gameRollingMetrics.players.d0NewPlayers
                            : '-'}
                        </TableRowColumn>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {gameRollingMetrics &&
                  (!gameRollingMetrics.retention ||
                    !gameRollingMetrics.players) ? (
                    <AlertMessage kind="info">
                      Upgrade your account with a subscription to unlock all the
                      metrics for your game.
                    </AlertMessage>
                  ) : null}
                  <Table>
                    <TableBody>
                      {[1, 2, 3, 4, 5, 6, 7].map(dayIndex => (
                        <TableRow key={dayIndex}>
                          <TableRowColumn>
                            <Trans>Day {dayIndex} retained players</Trans>
                          </TableRowColumn>
                          <TableRowColumn style={styles.tableRowStatColumn}>
                            {gameRollingMetrics &&
                            gameRollingMetrics.retention &&
                            gameRollingMetrics.retention[
                              `d${dayIndex}RetainedPlayers`
                            ] != null
                              ? gameRollingMetrics.retention[
                                  `d${dayIndex}RetainedPlayers`
                                ]
                              : '-'}
                          </TableRowColumn>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ColumnStackLayout>
              )
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
            />
          )}
        </Dialog>
      )}
    </I18n>
  );
};
