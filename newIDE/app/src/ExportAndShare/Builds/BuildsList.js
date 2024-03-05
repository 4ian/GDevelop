// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';

import { Column, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import PlaceholderError from '../../UI/PlaceholderError';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

import { BuildCard } from './BuildCard';

import { type Build } from '../../Utils/GDevelopServices/Build';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type BuildType } from '../../Utils/GDevelopServices/Build';

const styles = {
  emptyMessageStyle: { textAlign: 'left' },
};
type Props = {|
  builds: ?Array<Build>,
  authenticatedUser: AuthenticatedUser,
  error: ?Error,
  loadBuilds: () => void,
  game: Game,
  onGameUpdated?: () => Promise<void>,
  onBuildUpdated: Build => void,
  onBuildDeleted: Build => void,
|};

type BuildFilter = BuildType | 'all-build';

const buildFilterOptions: Array<{
  key: BuildFilter,
  value: BuildFilter,
  label: React.Node,
}> = [
  {
    key: 'all-build',
    value: 'all-build',
    label: t`All builds`,
  },

  {
    key: 'web-build',
    value: 'web-build',
    label: t`Web builds`,
  },

  {
    key: 'cordova-build',
    value: 'cordova-build',
    label: t`Android builds`,
  },

  {
    key: 'cordova-ios-build',
    value: 'cordova-ios-build',
    label: t`iOS builds`,
  },

  {
    key: 'electron-build',
    value: 'electron-build',
    label: t`Desktop builds`,
  },
];

const filterBuilds = (builds: ?Array<Build>, buildFilter: BuildFilter) => {
  if (!builds) return;
  switch (buildFilter) {
    case 'web-build':
      return builds.filter(build => build.type === 'web-build');
    case 'cordova-build':
      return builds.filter(build => build.type === 'cordova-build');
    case 'cordova-ios-build':
      return builds.filter(build => build.type === 'cordova-ios-build');
    case 'electron-build':
      return builds.filter(build => build.type === 'electron-build');
    default:
      return builds;
  }
};

const emptyBuildMessage = {
  'web-build': <Trans>You don't have any web builds for this game.</Trans>,
  'cordova-build': (
    <Trans>You don't have any Android builds for this game.</Trans>
  ),
  'cordova-ios-build': (
    <Trans>You don't have any iOS builds for this game.</Trans>
  ),
  'electron-build': (
    <Trans>You don't have any desktop builds for this game.</Trans>
  ),
  'all-build': <Trans>You don't have any builds for this game.</Trans>,
};

const BuildsList = ({
  builds,
  authenticatedUser,
  error,
  loadBuilds,
  game,
  onGameUpdated,
  onBuildUpdated,
  onBuildDeleted,
}: Props) => {
  const [gameUpdating, setGameUpdating] = React.useState(false);
  const [buildFilter, setBuildFilter] = React.useState<BuildFilter>(
    'all-build'
  );
  const displayedBuilds = filterBuilds(builds, buildFilter);

  return (
    <Column noMargin expand>
      <ResponsiveLineStackLayout justifyContent="space-between">
        <Column noMargin>
          <EmptyMessage messageStyle={styles.emptyMessageStyle}>
            <Trans>
              This is the list of builds that you've done for this game. <br />
              Note that builds for mobile and desktop are available for 7 days,
              after which they are removed.
            </Trans>
          </EmptyMessage>
        </Column>
        <Column noMargin>
          <SelectField
            floatingLabelText={<Trans>Show</Trans>}
            value={buildFilter}
            onChange={(e, i, value) => {
              // $FlowFixMe - We are confident that the selected option's value is of type BuildFilter.
              setBuildFilter(value);
            }}
          >
            {buildFilterOptions.map(({ key, value, label }) => (
              <SelectOption key={key} value={value} label={label} />
            ))}
          </SelectField>
        </Column>
      </ResponsiveLineStackLayout>
      <Line>
        {!authenticatedUser.authenticated && (
          <EmptyMessage>
            <Trans>You need to login first to see your builds.</Trans>
          </EmptyMessage>
        )}
        {authenticatedUser.authenticated && !displayedBuilds && !error && (
          <PlaceholderLoader />
        )}
        {authenticatedUser.authenticated && error && (
          <PlaceholderError onRetry={loadBuilds}>
            {error.message}
          </PlaceholderError>
        )}
        {authenticatedUser.authenticated &&
          displayedBuilds &&
          displayedBuilds.length === 0 && (
            <EmptyMessage>{emptyBuildMessage[buildFilter]}</EmptyMessage>
          )}
        {authenticatedUser.authenticated &&
          displayedBuilds &&
          displayedBuilds.length !== 0 && (
            <ColumnStackLayout expand noMargin>
              {displayedBuilds.map((build: Build) => (
                <BuildCard
                  build={build}
                  key={build.id}
                  game={game}
                  onGameUpdated={onGameUpdated}
                  gameUpdating={gameUpdating}
                  setGameUpdating={setGameUpdating}
                  onBuildUpdated={onBuildUpdated}
                  onBuildDeleted={onBuildDeleted}
                  authenticatedUser={authenticatedUser}
                />
              ))}
            </ColumnStackLayout>
          )}
      </Line>
    </Column>
  );
};

export default BuildsList;
