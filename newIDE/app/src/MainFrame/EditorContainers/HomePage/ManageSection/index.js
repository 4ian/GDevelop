// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';

import SectionContainer, { SectionRow } from '../SectionContainer';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import GamesList from '../../../../GameDashboard/GamesList';
import {
  registerGame,
  type Game,
} from '../../../../Utils/GDevelopServices/Game';
import PlaceholderError from '../../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { Column, Line } from '../../../../UI/Grid';
import Paper from '../../../../UI/Paper';
import BackgroundText from '../../../../UI/BackgroundText';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import RaisedButton from '../../../../UI/RaisedButton';
import FlatButton from '../../../../UI/FlatButton';
import Link from '../../../../UI/Link';
import Window from '../../../../Utils/Window';
import { getHelpLink } from '../../../../Utils/HelpLink';
import { type GameDetailsTab } from '../../../../GameDashboard/GameDetails';
import GameOverview from '../../../../GameOverview';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import RouterContext from '../../../RouterContext';
import { getDefaultRegisterGamePropertiesFromProject } from '../../../../Utils/UseGameAndBuildsManager';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
import { GameRegistration } from '../../../../GameDashboard/GameRegistration';

const publishingWikiArticle = getHelpLink('/publishing/');

const styles = {
  backgroundMessage: { padding: 16 },
  buttonContainer: { minWidth: 150 },
  gameDetailsContainer: { padding: 8, flex: 1, display: 'flex' },
};

type Props = {|
  project: ?gdProject,
  games: ?Array<Game>,
  onRefreshGames: () => Promise<void>,
  onGameUpdated: (game: Game) => void,
  gamesFetchingError: ?Error,
  openedGame: ?Game,
  setOpenedGameId: (gameId: ?string) => void,
  currentTab: GameDetailsTab,
  setCurrentTab: GameDetailsTab => void,
|};

const ManageSection = ({
  project,
  games,
  onRefreshGames,
  onGameUpdated,
  gamesFetchingError,
  openedGame,
  setOpenedGameId,
  currentTab,
  setCurrentTab,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenCreateAccountDialog,
    onOpenLoginDialog,
    getAuthorizationHeader,
  } = authenticatedUser;
  const { showAlert, showConfirmation } = useAlertDialog();
  const [isRegisteringGame, setIsRegisteringGame] = React.useState(false);
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );

  React.useEffect(
    () => {
      onRefreshGames();
    },
    // Refresh the games when the callback changes (defined in useGamesList), that's
    // to say when the user profile changes.
    [onRefreshGames]
  );

  React.useEffect(
    () => {
      if (openedGame && !profile) {
        setOpenedGameId(null);
      }
    },
    // Close game view is user logs out.
    [profile, openedGame, setOpenedGameId]
  );

  const onRegisterGame = React.useCallback(
    async () => {
      if (!profile || !project) return;

      const { id } = profile;
      try {
        setIsRegisteringGame(true);
        await registerGame(
          getAuthorizationHeader,
          id,
          getDefaultRegisterGamePropertiesFromProject({ project })
        );
        await onRefreshGames();
      } catch (error) {
        console.error('Unable to register the game.', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
          await showAlert({
            title: t`Game already registered`,
            message: t`The project currently opened is registered online but you don't have
          access to it. Ask the original owner of the game to share it with you
          to be able to manage it.`,
          });
        } else {
          await showAlert({
            title: t`Unable to register the game`,
            message: t`An error happened while registering the game. Verify your internet connection
          or retry later.`,
          });
        }
      } finally {
        setIsRegisteringGame(false);
      }
    },
    [getAuthorizationHeader, profile, project, showAlert, onRefreshGames]
  );

  React.useEffect(
    () => {
      const loadInitialGame = async () => {
        // When games are loaded and we have an initial game id, try to open it.
        const initialGameId = routeArguments['game-id'];
        if (games && initialGameId) {
          const game = games.find(game => game.id === initialGameId);
          removeRouteArguments(['game-id']);
          if (game) {
            setOpenedGameId(game.id);
          } else {
            // If the game is not in the list, then either
            // - allow to register it, if it's the current project.
            // - suggest to open the file before continuing, if it's not the current project.
            if (project && project.getProjectUuid() === initialGameId) {
              const answer = await showConfirmation({
                title: t`Game not found`,
                message: t`This project is not registered online. Register it now
              to get access to leaderboards, player accounts, analytics and more!`,
                confirmButtonLabel: t`Register`,
              });
              if (!answer) return;

              await onRegisterGame();
            } else {
              await showAlert({
                title: t`Game not found`,
                message: t`The game you're trying to open is not registered online. Open the project
              file, then register it before continuing.`,
              });
            }
          }
        }
      };
      loadInitialGame();
    },
    [
      games,
      routeArguments,
      removeRouteArguments,
      onRegisterGame,
      showConfirmation,
      showAlert,
      project,
      setOpenedGameId,
    ]
  );

  const onBack = React.useCallback(
    () => {
      setCurrentTab('details');
      setOpenedGameId(null);
    },
    [setCurrentTab, setOpenedGameId]
  );

  if (openedGame) {
    return (
      <SectionContainer flexBody>
        {!isRegisteringGame && (
          <GameRegistration
            project={project}
            hideLoader
            onGameRegistered={onRefreshGames}
          />
        )}
        <GameOverview
          currentView={currentTab}
          setCurrentView={setCurrentTab}
          game={openedGame}
          analyticsSource="homepage"
          onBack={onBack}
          onGameUpdated={onGameUpdated}
        />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <SectionRow expand>
        {!profile ? (
          <Paper
            variant="outlined"
            background="dark"
            style={styles.backgroundMessage}
          >
            <ColumnStackLayout noMargin>
              <BackgroundText>
                <Trans>
                  Log-in or create an account to access your{' '}
                  <Link
                    href={publishingWikiArticle}
                    onClick={() =>
                      Window.openExternalURL(publishingWikiArticle)
                    }
                  >
                    published games
                  </Link>{' '}
                  retention metrics, and player feedback.
                </Trans>
              </BackgroundText>
              <ResponsiveLineStackLayout
                noMargin
                noColumnMargin
                justifyContent="center"
              >
                <div style={styles.buttonContainer}>
                  <FlatButton
                    fullWidth
                    primary
                    label={<Trans>Login</Trans>}
                    onClick={onOpenLoginDialog}
                  />
                </div>
                <div style={styles.buttonContainer}>
                  <RaisedButton
                    fullWidth
                    primary
                    label={<Trans>Create an account</Trans>}
                    onClick={onOpenCreateAccountDialog}
                  />
                </div>
              </ResponsiveLineStackLayout>
            </ColumnStackLayout>
          </Paper>
        ) : games ? (
          games.length === 0 ? (
            <Paper
              variant="outlined"
              background="dark"
              style={styles.backgroundMessage}
            >
              <ColumnStackLayout noMargin>
                <Column noMargin>
                  <Line noMargin justifyContent="center">
                    <BackgroundText>
                      <Trans>
                        Learn how many users are playing your game, control
                        published versions, and collect feedback from play
                        testers.
                      </Trans>
                    </BackgroundText>
                  </Line>

                  <Line noMargin justifyContent="center">
                    <BackgroundText>
                      <Trans>
                        <Link
                          href={publishingWikiArticle}
                          onClick={() =>
                            Window.openExternalURL(publishingWikiArticle)
                          }
                        >
                          Share a project
                        </Link>{' '}
                        to get started.
                      </Trans>
                    </BackgroundText>
                  </Line>
                </Column>
              </ColumnStackLayout>
            </Paper>
          ) : (
            <GamesList
              project={project}
              games={games}
              onRefreshGames={onRefreshGames}
              onOpenGameId={setOpenedGameId}
            />
          )
        ) : gamesFetchingError ? (
          <PlaceholderError onRetry={onRefreshGames}>
            <Trans>
              Can't load the games. Verify your internet connection or retry
              later.
            </Trans>
          </PlaceholderError>
        ) : (
          <Column expand justifyContent="center">
            <PlaceholderLoader />
          </Column>
        )}
      </SectionRow>
    </SectionContainer>
  );
};

const ManageSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Manage section</Trans>}
    scope="start-page-manage"
  >
    <ManageSection {...props} />
  </ErrorBoundary>
);

export default ManageSectionWithErrorBoundary;
