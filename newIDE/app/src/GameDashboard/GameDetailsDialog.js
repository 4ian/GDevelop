// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import { format, formatISO } from 'date-fns';
import FlatButton from '../UI/FlatButton';
import { Line, Spacer } from '../UI/Grid';
import {
  type Game,
  updateGame,
  deleteGame,
  getPublicGame,
  setGameUserAcls,
  getAclsFromAuthorIds,
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
import PublicGamePropertiesDialog from '../ProjectManager/PublicGamePropertiesDialog';
import TextField from '../UI/TextField';

const styles = {
  tableRowStatColumn: {
    width: 100,
  },
};

export type GamesDetailsTab = 'details' | 'builds' | 'analytics';

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

  const updateGameFromProject = async () => {
    if (!project || !profile) return;
    const { id } = profile;

    try {
      // Set public game to null as it will be refetched automatically by the callback above.
      setPublicGame(null);
      const gameId = project.getProjectUuid();
      const updatedGame = await updateGame(getAuthorizationHeader, id, gameId, {
        authorName: project.getAuthor() || 'Unspecified publisher',
        gameName: project.getName() || 'Untitle game',
        description: project.getDescription() || '',
      });
      const authorAcls = getAclsFromAuthorIds(project.getAuthorIds());
      await setGameUserAcls(getAuthorizationHeader, id, gameId, authorAcls);
      onGameUpdated(updatedGame);
    } catch (error) {
      console.error('Unable to update the game:', error);
    }
  };

  const unregisterGame = async () => {
    if (!profile) return;
    const { id } = profile;

    try {
      await deleteGame(getAuthorizationHeader, id, game.id);
      onGameDeleted();
    } catch (error) {
      console.error('Unable to delete the game:', error);
    }
  };

  const unpublishGame = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;
      try {
        // Set public game to null as it will be refetched automatically by the callback above.
        setPublicGame(null);
        const updatedGame = await updateGame(
          getAuthorizationHeader,
          id,
          game.id,
          {
            publicWebBuildId: null,
          }
        );
        onGameUpdated(updatedGame);
      } catch (err) {
        console.error('Unable to update the game', err);
      }
    },
    [game, getAuthorizationHeader, profile, onGameUpdated]
  );

  const authorUsernames =
    publicGame && publicGame.authors
      ? publicGame.authors.map(author => author.username).filter(Boolean)
      : [];

  const isGameOpenedAsProject =
    !!project && project.getProjectUuid() === game.id;

  return (
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
      </Tabs>
      <Line>
        {currentTab === 'details' ? (
          publicGameError ? (
            <PlaceholderError onRetry={loadPublicGame}>
              <Trans>There was an issue getting the game details.</Trans>{' '}
              <Trans>Verify your internet connection or try again later.</Trans>
            </PlaceholderError>
          ) : !publicGame ? (
            <PlaceholderLoader />
          ) : (
            <ColumnStackLayout expand>
              {!isGameOpenedAsProject && (
                <AlertMessage kind="info">
                  <Trans>
                    In order to update these details you have to open the game's
                    project.
                  </Trans>
                </AlertMessage>
              )}
              <Line alignItems="center">
                <Line expand justifyContent="flex-start" alignItems="center">
                  {authorUsernames && (
                    <>
                      <Text>
                        <Trans>Authors:</Trans>
                      </Text>
                      <Line>
                        {authorUsernames.map((username, index) => (
                          <React.Fragment key={username}>
                            <Spacer />
                            <Chip
                              size="small"
                              label={username}
                              color={index === 0 ? 'primary' : 'default'}
                            />
                          </React.Fragment>
                        ))}
                      </Line>
                    </>
                  )}
                </Line>
                <Line expand justifyContent="flex-end">
                  <Text>
                    <Trans>
                      Created on{' '}
                      {format(game.createdAt * 1000 /* TODO */, 'yyyy-MM-dd')}
                    </Trans>
                  </Text>
                </Line>
              </Line>
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
                />
                <Spacer />
                {publicGame.publicWebBuildId && (
                  <>
                    <RaisedButton
                      onClick={() => {
                        const answer = Window.showConfirmDialog(
                          'Are you sure you want to unpublish this game? \n\nThis will make your Liluo unique game URL not accessible anymore. \n\nYou can decide anytime to publish it again.'
                        );

                        if (!answer) return;

                        unpublishGame();
                      }}
                      label={<Trans>Unpublish from Liluo</Trans>}
                    />
                    <Spacer />
                  </>
                )}
                <RaisedButton
                  primary
                  onClick={() => setIsPublicGamePropertiesDialogOpen(true)}
                  label={<Trans>Edit game details</Trans>}
                  disabled={!isGameOpenedAsProject}
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
              <Trans>Verify your internet connection or try again later.</Trans>
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
                      {publicGame &&
                      publicGame.metrics &&
                      publicGame.metrics.lastWeekSessionsCount
                        ? publicGame.metrics.lastWeekSessionsCount
                        : '-'}
                    </TableRowColumn>
                  </TableRow>
                  <TableRow>
                    <TableRowColumn>
                      <Trans>Last year sessions count</Trans>
                    </TableRowColumn>
                    <TableRowColumn style={styles.tableRowStatColumn}>
                      {publicGame &&
                      publicGame.metrics &&
                      publicGame.metrics.lastYearSessionsCount
                        ? publicGame.metrics.lastYearSessionsCount
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
                    value={formatISO(new Date(), { representation: 'date' })}
                    primaryText={t`Today (so far, in real time)`}
                  />
                </SelectField>
              </Line>
              {!isGameMetricsLoading && !gameRollingMetrics ? (
                <AlertMessage kind="warning">
                  <Trans>
                    There were no players or stored metrics for this day. Be
                    sure to publish your game and get players to try it to see
                    the collected anonymous analytics.
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
              (!gameRollingMetrics.retention || !gameRollingMetrics.players) ? (
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
      {publicGame && project && (
        <PublicGamePropertiesDialog
          open={isPublicGamePropertiesDialogOpen}
          project={project}
          game={publicGame}
          onApply={() => {
            setIsPublicGamePropertiesDialogOpen(false);
            updateGameFromProject();
          }}
          onClose={() => setIsPublicGamePropertiesDialogOpen(false)}
        />
      )}
    </Dialog>
  );
};
