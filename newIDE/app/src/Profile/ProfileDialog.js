// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import { Tabs, Tab } from '../UI/Tabs';
import Dialog from '../UI/Dialog';
import { Column, Line } from '../UI/Grid';
import CreateProfile from './CreateProfile';
import AuthenticatedUserProfileDetails from './AuthenticatedUserProfileDetails';
import EmptyMessage from '../UI/EmptyMessage';
import HelpButton from '../UI/HelpButton';
import UsagesDetails from './UsagesDetails';
import SubscriptionDetails from './SubscriptionDetails';
import ContributionsDetails from './ContributionsDetails';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import { GamesList } from '../GameDashboard/GamesList';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  currentProject: ?gdProject,
  open: boolean,
  onClose: () => void,
  onChangeSubscription: () => void,
  initialTab: 'profile' | 'games-dashboard',
|};

const ProfileDialog = ({
  currentProject,
  open,
  onClose,
  onChangeSubscription,
  initialTab,
}: Props) => {
  const [currentTab, setCurrentTab] = React.useState<string>(initialTab);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const _onChangeTab = React.useCallback(
    (newTab: string) => {
      setCurrentTab(newTab);
    },
    [setCurrentTab]
  );

  React.useEffect(
    () => {
      if (open) authenticatedUser.onRefreshUserProfile();
    },
    // We don't want to fetch again when authenticatedUser changes,
    // just the first time this page opens.
    [authenticatedUser.onRefreshUserProfile, open] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Dialog
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath={
            currentTab === 'games-dashboard'
              ? '/interface/games-dashboard'
              : '/interface/profile'
          }
        />,
        authenticatedUser.authenticated && authenticatedUser.profile && (
          <FlatButton
            label={<Trans>Logout</Trans>}
            key="logout"
            onClick={authenticatedUser.onLogout}
          />
        ),
      ]}
      onRequestClose={onClose}
      cannotBeDismissed={false}
      open={open}
      noMargin
      noTitleMargin
      title={
        <Tabs value={currentTab} onChange={_onChangeTab}>
          <Tab label={<Trans>My Profile</Trans>} value="profile" />
          <Tab label={<Trans>Games Dashboard</Trans>} value="games-dashboard" />
          <Tab label={<Trans>Services Usage</Trans>} value="usage" />
        </Tabs>
      }
    >
      {currentTab === 'profile' &&
        (authenticatedUser.authenticated && authenticatedUser.profile ? (
          <Column noMargin>
            <AuthenticatedUserProfileDetails
              authenticatedUser={authenticatedUser}
              onEditProfile={authenticatedUser.onEdit}
              onChangeEmail={authenticatedUser.onChangeEmail}
            />
            <SubscriptionDetails
              subscription={authenticatedUser.subscription}
              onChangeSubscription={onChangeSubscription}
            />
            <ContributionsDetails userId={authenticatedUser.profile.id} />
          </Column>
        ) : (
          <Column>
            <CreateProfile
              onLogin={authenticatedUser.onLogin}
              onCreateAccount={authenticatedUser.onCreateAccount}
            />
          </Column>
        ))}
      {currentTab === 'games-dashboard' &&
        (authenticatedUser.authenticated ? (
          <Line>
            <ColumnStackLayout expand>
              <GamesList project={currentProject} />
            </ColumnStackLayout>
          </Line>
        ) : (
          <Column>
            <CreateProfile
              onLogin={authenticatedUser.onLogin}
              onCreateAccount={authenticatedUser.onCreateAccount}
              message={
                <Trans>
                  Create an account to register your games and to get access to
                  metrics collected anonymously, like the number of daily
                  players and retention of the players after a few days.
                </Trans>
              }
            />
          </Column>
        ))}
      {currentTab === 'usage' &&
        (authenticatedUser.authenticated ? (
          <Column noMargin>
            <UsagesDetails usages={authenticatedUser.usages} />
          </Column>
        ) : (
          <EmptyMessage>
            <Trans>
              Register to see the usage that you've made of the online services
            </Trans>
          </EmptyMessage>
        ))}
    </Dialog>
  );
};

export default ProfileDialog;
