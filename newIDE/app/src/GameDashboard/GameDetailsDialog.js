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
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import Dialog from '../UI/Dialog';
import { Tab, Tabs } from '../UI/Tabs';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ColumnStackLayout } from '../UI/Layout';
import EmptyMessage from '../UI/EmptyMessage';
import Text from '../UI/Text';
import {
  type GameMetrics,
  getGameMetrics,
} from '../Utils/GDevelopServices/Analytics';
import {
  type Build,
  getBuilds,
  getBuildArtifactUrl,
} from '../Utils/GDevelopServices/Build';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderError from '../UI/PlaceholderError';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import {
  Card,
  CardActions,
  CardHeader,
  CircularProgress,
} from '@material-ui/core';
import { Table, TableBody, TableRow, TableRowColumn } from '../UI/Table';
import AlertMessage from '../UI/AlertMessage';
import subDays from 'date-fns/subDays';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';
import HelpButton from '../UI/HelpButton';
import PlayArrow from '@material-ui/icons/PlayArrow';

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

const styles = {
  bigIcon: {
    width: 48,
    height: 48,
    marginTop: 8,
  },
};

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

  const [gameBuilds, setGameBuilds] = React.useState<?(Build[])>(null);
  const [isGameBuildsLoading, setIsGameBuildsLoading] = React.useState(false);
  const [gameBuildsError, setGameBuildsError] = React.useState<?Error>(null);

  const yesterdayIsoDate = formatISO(subDays(new Date(), 1), {
    representation: 'date',
  });
  const [analyticsDate, setAnalyticsDate] = React.useState(yesterdayIsoDate);

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

  const loadGameBuilds = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;

      setIsGameBuildsLoading(true);
      setGameBuildsError(null);
      try {
        const builds = await getBuilds(getAuthorizationHeader, id, game.id);
        setGameBuilds(builds);
      } catch (err) {
        console.error(`Unable to load game builds:`, err);
        setGameBuildsError(err);
      }
      setIsGameBuildsLoading(false);
    },
    [getAuthorizationHeader, profile, game]
  );

  React.useEffect(
    () => {
      loadGameBuilds();
    },
    [loadGameBuilds]
  );

  const updateGameFromProject = async () => {
    if (!project) return;
    if (!profile) return;
    const { id } = profile;

    try {
      const game = await updateGame(getAuthorizationHeader, id, {
        authorName: project.getAuthor(),
        gameId: project.getProjectUuid(),
        gameName: project.getName(),
      });
      onGameUpdated(game);
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

  const openBuildUrl = build => {
    const url = getBuildArtifactUrl(build, 's3Key');
    if (url) Window.openExternalURL(url);
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
        <Tab label={<Trans>Monetization</Trans>} value="monetization" />
      </Tabs>
      <Line>
        {currentTab === 'details' ? (
          <ColumnStackLayout expand>
            <Text>
              <Trans>
                Registered on{' '}
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
              floatingLabelText={<Trans>Author name</Trans>}
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
          <ColumnStackLayout expand>
            <Line noMargin alignItems="center">
              <Text size="title">
                <Trans>Game builds</Trans>
              </Text>
            </Line>
            {isGameBuildsLoading && (
              <Line alignItems="center">
                <CircularProgress size={20} />
              </Line>
            )}
            {gameBuildsError && (
              <PlaceholderError
                onRetry={() => {
                  loadGameBuilds();
                }}
              >
                <Trans>There was an issue getting the game builds.</Trans>{' '}
                <Trans>
                  Verify your internet connection or try again later.
                </Trans>
              </PlaceholderError>
            )}
            {!isGameBuildsLoading && (!gameBuilds || !gameBuilds.length) && (
              <ColumnStackLayout expand>
                <AlertMessage kind="warning">
                  <Trans>
                    You haven't created any builds for this game yet.
                  </Trans>
                </AlertMessage>
              </ColumnStackLayout>
            )}
            {!isGameBuildsLoading && gameBuilds && gameBuilds.length && (
              <ColumnStackLayout expand>
                {gameBuilds.map(build => (
                  <Card key={build.id}>
                    <CardHeader
                      title={build.id}
                      subheader={
                        <Line alignItems="center" noMargin>
                          <Trans>
                            Built on{' '}
                            {format(build.updatedAt * 1000, 'yyyy-MM-dd')}
                          </Trans>
                        </Line>
                      }
                    />
                    <CardActions>
                      <Line expand noMargin justifyContent="flex-end">
                        <RaisedButton
                          primary
                          icon={<PlayArrow />}
                          label={<Trans>Open</Trans>}
                          onClick={() => openBuildUrl(build)}
                        />
                      </Line>
                    </CardActions>
                  </Card>
                ))}
              </ColumnStackLayout>
            )}
          </ColumnStackLayout>
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
        {currentTab === 'monetization' ? (
          <ColumnStackLayout expand>
            <Line noMargin justifyContent="center">
              <MonetizationOnIcon color="disabled" style={styles.bigIcon} />
            </Line>
            <EmptyMessage>
              Services to help monetization of your game will be added later in
              this panel.
            </EmptyMessage>
          </ColumnStackLayout>
        ) : null}
      </Line>
    </Dialog>
  );
};
