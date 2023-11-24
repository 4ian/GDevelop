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
import { Column } from '../../../../UI/Grid';
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

const publishingWikiArticle = getHelpLink('/publishing/');

const styles = {
  notLoggedInMessage: { padding: 16 },
  buttonContainer: { minWidth: 150 },
};

type Props = {|
  project: ?gdProject,
  games: ?Array<Game>,
  onRefreshGames: () => Promise<void>,
  onGameUpdated: Game => void,
  gamesFetchingError: ?Error,
|};

const ManageSection = ({
  project,
  games,
  onRefreshGames,
  onGameUpdated,
  gamesFetchingError,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenCreateAccountDialog,
    onOpenLoginDialog,
  } = authenticatedUser;

  return (
    <SectionContainer flexBody title={<Trans>Manage Games</Trans>}>
      <SectionRow expand>
        {!profile ? (
          <Paper
            variant="outlined"
            background="dark"
            style={styles.notLoggedInMessage}
          >
            <ColumnStackLayout>
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
          <GamesList
            project={project}
            games={games}
            onRefreshGames={onRefreshGames}
            onGameUpdated={onGameUpdated}
          />
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
    componentTitle={<Trans>Team section</Trans>}
    scope="start-page-team"
  >
    <ManageSection {...props} />
  </ErrorBoundary>
);

export default ManageSectionWithErrorBoundary;
