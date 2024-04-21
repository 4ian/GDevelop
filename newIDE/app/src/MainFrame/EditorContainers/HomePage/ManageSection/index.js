// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import SectionContainer, { SectionRow } from '../SectionContainer';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import GamesList from '../../../../GameDashboard/GamesList';
import { type Game } from '../../../../Utils/GDevelopServices/Game';
import PlaceholderError from '../../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { Column, LargeSpacer, Line } from '../../../../UI/Grid';
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
import GameDetails, {
  gameDetailsTabs,
  type GameDetailsTab,
} from '../../../../GameDashboard/GameDetails';
import { Tabs } from '../../../../UI/Tabs';
import Text from '../../../../UI/Text';

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
  gamesFetchingError: ?Error,
  openedGame: ?Game,
  setOpenedGame: (?Game) => void,
  currentTab: GameDetailsTab,
  setCurrentTab: GameDetailsTab => void,
|};

const ManageSection = ({
  project,
  games,
  onRefreshGames,
  gamesFetchingError,
  openedGame,
  setOpenedGame,
  currentTab,
  setCurrentTab,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenCreateAccountDialog,
    onOpenLoginDialog,
  } = authenticatedUser;

  React.useEffect(
    () => {
      onRefreshGames();
    },
    // Refresh the games when the section is opened, useful when a game gets registered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onBack = React.useCallback(
    () => {
      setCurrentTab('details');
      setOpenedGame(null);
    },
    [setCurrentTab, setOpenedGame]
  );

  if (openedGame) {
    return (
      <SectionContainer
        flexBody
        title={null} // Use a smaller title below
        backAction={onBack}
      >
        <Text size="title" allowSelection>
          {openedGame.gameName}
        </Text>
        <LargeSpacer />
        <SectionRow expand>
          <Paper
            background="dark"
            square={false}
            style={styles.gameDetailsContainer}
          >
            <ColumnStackLayout noMargin expand noOverflowParent>
              <Tabs
                value={currentTab}
                onChange={setCurrentTab}
                options={gameDetailsTabs}
              />
              <GameDetails
                game={openedGame}
                project={project}
                onGameUpdated={onRefreshGames}
                onGameDeleted={() => {
                  onBack();
                  onRefreshGames();
                }}
                onLoading={() => {}}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                analyticsSource="homepage"
              />
            </ColumnStackLayout>
          </Paper>
        </SectionRow>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer flexBody title={<Trans>Manage Games</Trans>}>
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
              onOpenGame={setOpenedGame}
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
