// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import SectionContainer, { SectionRow } from '../SectionContainer';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import GamesList from '../../../../GameDashboard/GamesList';
import { type Game } from '../../../../Utils/GDevelopServices/Game';
import PlaceholderMessage from '../../../../UI/PlaceholderMessage';
import PlaceholderError from '../../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { Column } from '../../../../UI/Grid';

const styles = {};

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
  const { profile } = authenticatedUser;

  return (
    <SectionContainer flexBody title={<Trans>Manage Games</Trans>}>
      <SectionRow expand>
        {!profile ? (
          <PlaceholderMessage>Salut</PlaceholderMessage>
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
