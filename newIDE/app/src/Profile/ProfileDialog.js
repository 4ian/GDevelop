// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import { Tabs, Tab } from '../UI/Tabs';
import Dialog from '../UI/Dialog';
import { Column, Line } from '../UI/Grid';
import CreateProfile from './CreateProfile';
import AuthenticatedUserProfileDetails from './AuthenticatedUserProfileDetails';
import HelpButton from '../UI/HelpButton';
import SubscriptionDetails from './SubscriptionDetails';
import ContributionsDetails from './ContributionsDetails';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import { GamesList } from '../GameDashboard/GamesList';
import { ColumnStackLayout } from '../UI/Layout';
import { getRedirectToSubscriptionPortalUrl } from '../Utils/GDevelopServices/Usage';
import Window from '../Utils/Window';
import { showErrorBox } from '../UI/Messages/MessageBox';

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

  const [
    isManageSubscriptionLoading,
    setIsManageSubscriptionLoading,
  ] = React.useState(false);
  const onManageSubscription = React.useCallback(
    async () => {
      const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
      if (!firebaseUser) return;

      try {
        setIsManageSubscriptionLoading(true);
        const url = await getRedirectToSubscriptionPortalUrl(
          getAuthorizationHeader,
          firebaseUser.uid
        );
        Window.openExternalURL(url);
      } catch (error) {
        showErrorBox({
          message: 'Unable to load the portal to manage your subscription. Please contact us on billing@gdevelop.io',
          rawError: error,
          errorId: 'subscription-portal-error',
        });
      } finally {
        setIsManageSubscriptionLoading(false);
      }
    },
    [authenticatedUser]
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
      open={open}
      noMargin
      fullHeight
      noTitleMargin
      title={
        <Tabs value={currentTab} onChange={setCurrentTab}>
          <Tab label={<Trans>My Profile</Trans>} value="profile" />
          <Tab label={<Trans>Games Dashboard</Trans>} value="games-dashboard" />
        </Tabs>
      }
      flexColumnBody
    >
      {currentTab === 'profile' &&
        (authenticatedUser.authenticated && authenticatedUser.profile ? (
          <Line>
            <Column expand>
              <AuthenticatedUserProfileDetails
                authenticatedUser={authenticatedUser}
                onEditProfile={authenticatedUser.onEdit}
                onChangeEmail={authenticatedUser.onChangeEmail}
              />
              <SubscriptionDetails
                subscription={authenticatedUser.subscription}
                onChangeSubscription={onChangeSubscription}
                onManageSubscription={onManageSubscription}
                isManageSubscriptionLoading={isManageSubscriptionLoading}
              />
              <ContributionsDetails userId={authenticatedUser.profile.id} />
            </Column>
          </Line>
        ) : (
          <Column noMargin expand justifyContent="center">
            <CreateProfile
              onLogin={authenticatedUser.onLogin}
              onCreateAccount={authenticatedUser.onCreateAccount}
            />
          </Column>
        ))}
      {currentTab === 'games-dashboard' &&
        (authenticatedUser.authenticated ? (
          <Line>
            <ColumnStackLayout expand noOverflowParent>
              <GamesList project={currentProject} />
            </ColumnStackLayout>
          </Line>
        ) : (
          <Column noMargin expand justifyContent="center">
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
    </Dialog>
  );
};

export default ProfileDialog;
