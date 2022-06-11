// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { Column, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import Text from '../../UI/Text';
import { ColumnStackLayout } from '../../UI/Layout';
import { BuildCard } from './BuildCard';
import PlaceholderError from '../../UI/PlaceholderError';

type Props = {|
  builds: ?Array<Build>,
  authenticatedUser: AuthenticatedUser,
  error: ?Error,
  loadBuilds: () => void,
  game: Game,
  onGameUpdated?: Game => void,
|};

const BuildsList = ({
  builds,
  authenticatedUser,
  error,
  loadBuilds,
  game,
  onGameUpdated,
}: Props) => {
  const [gameUpdating, setGameUpdating] = React.useState(false);
  return (
    <Column noMargin expand>
      <Line>
        <Column>
          <EmptyMessage>
            <Trans>
              This is the list of builds that you've done for this game. Note
              that builds for mobile and desktop are available for 7 days, after
              which they are removed.
            </Trans>
          </EmptyMessage>
        </Column>
      </Line>
      <Line>
        {!authenticatedUser.authenticated && (
          <EmptyMessage>
            <Trans>You need to login first to see your builds.</Trans>
          </EmptyMessage>
        )}
        {authenticatedUser.authenticated && !builds && !error && (
          <PlaceholderLoader />
        )}
        {authenticatedUser.authenticated && error && (
          <PlaceholderError onRetry={loadBuilds}>
            <Text>{error.message}</Text>
          </PlaceholderError>
        )}
        {authenticatedUser.authenticated && builds && builds.length === 0 && (
          <EmptyMessage>
            <Trans>You don't have any builds for this game.</Trans>
          </EmptyMessage>
        )}
        {authenticatedUser.authenticated && builds && builds.length !== 0 && (
          <ColumnStackLayout expand>
            {builds.map((build: Build) => (
              <BuildCard
                build={build}
                key={build.id}
                game={game}
                onGameUpdated={onGameUpdated}
                gameUpdating={gameUpdating}
                setGameUpdating={setGameUpdating}
              />
            ))}
          </ColumnStackLayout>
        )}
      </Line>
    </Column>
  );
};

export default BuildsList;
