// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import { Tabs } from '../UI/Tabs';
import Dialog from '../UI/Dialog';
import { Column, Line } from '../UI/Grid';
import AuthenticatedUserProfileDetails from './AuthenticatedUserProfileDetails';
import HelpButton from '../UI/HelpButton';
import SubscriptionDetails from './Subscription/SubscriptionDetails';
import ContributionsDetails from './ContributionsDetails';
import UserAchievements from './Achievement/UserAchievements';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import { GamesList } from '../GameDashboard/GamesList';
import { getRedirectToSubscriptionPortalUrl } from '../Utils/GDevelopServices/Usage';
import Window from '../Utils/Window';
import { showErrorBox } from '../UI/Messages/MessageBox';
import CreateProfile from './CreateProfile';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RouterContext from '../MainFrame/RouterContext';
import useIsElementVisibleInScroll from '../Utils/UseIsElementVisibleInScroll';
import { markBadgesAsSeen as doMarkBadgesAsSeen } from '../Utils/GDevelopServices/Badge';
import ErrorBoundary from '../UI/ErrorBoundary';

export type ProfileTab = 'profile' | 'games-dashboard';

type Props = {|
  currentProject: ?gdProject,
  open: boolean,
  onClose: () => void,
|};

const ProfileDialog = ({ currentProject, open, onClose }: Props) => {
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );
  const badgesSeenNotificationTimeoutRef = React.useRef<?TimeoutID>(null);
  const badgesSeenNotificationSentRef = React.useRef<boolean>(false);

  const [currentTab, setCurrentTab] = React.useState<ProfileTab>('profile');
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const isUserLoading = authenticatedUser.loginState !== 'done';
  const userAchievementsContainerRef = React.useRef<?HTMLDivElement>(null);

  React.useEffect(
    () => {
      if (routeArguments['initial-dialog'] === 'games-dashboard') {
        setCurrentTab('games-dashboard');
        removeRouteArguments(['initial-dialog']);
      }
    },
    [routeArguments, removeRouteArguments]
  );

  const markBadgesAsSeen = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!(authenticatedUser.authenticated && authenticatedUser.profile)) {
        // If not connected (or loading), do nothing.
        return;
      }
      if (badgesSeenNotificationSentRef.current) {
        // If already marked as seen, do nothing.
        return;
      }
      if (
        !entries[0].isIntersecting &&
        badgesSeenNotificationTimeoutRef.current
      ) {
        // If not visible, clear timeout.
        clearTimeout(badgesSeenNotificationTimeoutRef.current);
        badgesSeenNotificationTimeoutRef.current = null;
        return;
      }
      if (entries[0].isIntersecting) {
        // If visible
        if (badgesSeenNotificationTimeoutRef.current) {
          // If timeout already set, do nothing.
          return;
        } else {
          // Set timeout to mark badges as seen in the future.
          badgesSeenNotificationTimeoutRef.current = setTimeout(() => {
            doMarkBadgesAsSeen(authenticatedUser);
            badgesSeenNotificationSentRef.current = true;
          }, 5000);
        }
      }
    },
    [authenticatedUser]
  );

  useIsElementVisibleInScroll(
    userAchievementsContainerRef.current,
    markBadgesAsSeen
  );

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
          message:
            'Unable to load the portal to manage your subscription. Please contact us on billing@gdevelop.io',
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

  const onLogout = React.useCallback(
    async () => {
      await authenticatedUser.onLogout();
      onClose();
    },
    [authenticatedUser, onClose]
  );

  const isConnected =
    authenticatedUser.authenticated && authenticatedUser.profile;

  return (
    <Dialog
      title={isConnected ? <Trans>My profile</Trans> : null}
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
        isConnected && (
          <FlatButton
            label={<Trans>Logout</Trans>}
            key="logout"
            onClick={onLogout}
            disabled={isUserLoading}
          />
        ),
      ]}
      onRequestClose={onClose}
      open={open}
      fullHeight={!!isConnected}
      maxWidth={isConnected ? 'md' : 'sm'}
      flexColumnBody
      fixedContent={
        isConnected ? (
          <Tabs
            value={currentTab}
            onChange={setCurrentTab}
            options={[
              {
                value: 'profile',
                label: <Trans>My Profile</Trans>,
              },
              {
                value: 'games-dashboard',
                label: <Trans>Games Dashboard</Trans>,
              },
            ]}
          />
        ) : null
      }
    >
      {authenticatedUser.loginState === 'loggingIn' ? (
        <PlaceholderLoader />
      ) : authenticatedUser.authenticated && authenticatedUser.profile ? (
        <>
          {currentTab === 'profile' && (
            <Line>
              <Column expand noMargin>
                <AuthenticatedUserProfileDetails
                  authenticatedUser={authenticatedUser}
                  onEditProfile={authenticatedUser.onOpenEditProfileDialog}
                  onChangeEmail={authenticatedUser.onOpenChangeEmailDialog}
                />
                <SubscriptionDetails
                  subscription={authenticatedUser.subscription}
                  onManageSubscription={onManageSubscription}
                  isManageSubscriptionLoading={isManageSubscriptionLoading}
                />
                <ContributionsDetails userId={authenticatedUser.profile.id} />
                {isConnected && (
                  <div ref={userAchievementsContainerRef}>
                    <UserAchievements
                      badges={authenticatedUser.badges}
                      displayUnclaimedAchievements
                      displayNotifications
                    />
                  </div>
                )}
              </Column>
            </Line>
          )}
          {currentTab === 'games-dashboard' && (
            <GamesList project={currentProject} />
          )}
        </>
      ) : (
        <Column noMargin expand justifyContent="center">
          <CreateProfile
            onLogin={authenticatedUser.onOpenLoginDialog}
            onCreateAccount={authenticatedUser.onOpenCreateAccountDialog}
            message={
              <Trans>
                Create an account to register your games and to get access to
                metrics collected anonymously, like the number of daily players
                and retention of the players after a few days.
              </Trans>
            }
          />
        </Column>
      )}
    </Dialog>
  );
};

const ProfileDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Profile</Trans>}
    scope="profile"
    onClose={props.onClose}
  >
    <ProfileDialog {...props} />
  </ErrorBoundary>
);

export default ProfileDialogWithErrorBoundary;
