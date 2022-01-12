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
} from '../Utils/GDevelopServices/Game';
import Dialog from '../UI/Dialog';
import { Tab, Tabs } from '../UI/Tabs';
import SemiControlledTextField from '../UI/SemiControlledTextField';
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
import { CircularProgress } from '@material-ui/core';
import { Table, TableBody, TableRow, TableRowColumn } from '../UI/Table';
import Builds from '../Export/Builds';
import AlertMessage from '../UI/AlertMessage';
import subDays from 'date-fns/subDays';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';
import HelpButton from '../UI/HelpButton';

export type GamesDetailsTab =
  | 'details'
  | 'builds'
  | 'analytics'
  | 'monetization';

type Props = {|
  game: Game,
  project: ?gdProject,
  initialTab: GamesDetailsTab,
  onClose: () => void,
  onGameUpdated: (updatedGame: Game) => void,
  onGameDeleted: () => void,
|};

/** Check if the project has changes not refleted in the registered online game. */
const areProjectAndGameDiffering = (project: ?gdProject, game: Game) => {
  if (!project) return false;

  return (
    project.getAuthor() !== game.authorName ||
    project.getName() !== game.gameName
  );
};

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

  const updateGameFromProject = async () => {
    if (!project || !profile) return;
    const { id } = profile;

    try {
      const updatedGame = await updateGame(
        getAuthorizationHeader,
        id,
        project.getProjectUuid(),
        {
          authorName: project.getAuthor(),
          gameName: project.getName(),
        }
      );
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
          <ColumnStackLayout expand>
            <Text>
              <Trans>
                Created on{' '}
                {format(game.createdAt * 1000 /* TODO */, 'yyyy-MM-dd')}.
              </Trans>
            </Text>
            <SemiControlledTextField
              fullWidth
              disabled
              value={game.gameName}
              onChange={() => {}}
              floatingLabelText={<Trans>Game name</Trans>}
            />
            <SemiControlledTextField
              fullWidth
              disabled
              value={game.authorName}
              onChange={() => {}}
              floatingLabelText={<Trans>Publisher name</Trans>}
            />
            <Line noMargin justifyContent="space-between">
              <FlatButton
                onClick={() => {
                  const answer = Window.showConfirmDialog(
                    "Are you sure you want to unregister this game? You won't get access to analytics and metrics, unless you register it again."
                  );

                  if (!answer) return;

                  unregisterGame();
                }}
                label={<Trans>Unregister this game</Trans>}
              />
              {areProjectAndGameDiffering(project, game) ? (
                <RaisedButton
                  primary
                  onClick={() => {
                    updateGameFromProject();
                  }}
                  label={
                    <Trans>Update the game details from the project</Trans>
                  }
                />
              ) : null}
            </Line>
          </ColumnStackLayout>
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
              <Line noMargin alignItems="center">
                <Text size="title">
                  <Trans>Main metrics</Trans>
                </Text>
                <Spacer />
                {isGameMetricsLoading && <CircularProgress size={20} />}
              </Line>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableRowColumn>
                      <Trans>Players count</Trans>
                    </TableRowColumn>
                    <TableRowColumn>
                      {gameRollingMetrics && gameRollingMetrics.players
                        ? gameRollingMetrics.players.d0Players
                        : '-'}
                    </TableRowColumn>
                  </TableRow>
                  <TableRow>
                    <TableRowColumn>
                      <Trans>Sessions count</Trans>
                    </TableRowColumn>
                    <TableRowColumn>
                      {gameRollingMetrics && gameRollingMetrics.sessions
                        ? gameRollingMetrics.sessions.d0Sessions
                        : '-'}
                    </TableRowColumn>
                  </TableRow>
                  <TableRow>
                    <TableRowColumn>
                      <Trans>New players count</Trans>
                    </TableRowColumn>
                    <TableRowColumn>
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
              <Line noMargin alignItems="center">
                <Text size="title">
                  <Trans>Retention of players</Trans>
                </Text>
                <Spacer />
                {isGameMetricsLoading && <CircularProgress size={20} />}
              </Line>
              <Table>
                <TableBody>
                  {[1, 2, 3, 4, 5, 6, 7].map(dayIndex => (
                    <TableRow key={dayIndex}>
                      <TableRowColumn>
                        <Trans>Day {dayIndex} retained players</Trans>
                      </TableRowColumn>
                      <TableRowColumn>
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
    </Dialog>
  );
};
