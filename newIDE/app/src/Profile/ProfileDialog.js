// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { Column, Line } from '../UI/Grid';
import AuthenticatedUserProfileDetails from './AuthenticatedUserProfileDetails';
import HelpButton from '../UI/HelpButton';
import SubscriptionDetails from './Subscription/SubscriptionDetails';
import ContributionsDetails from './ContributionsDetails';
import UserAchievements from './Achievement/UserAchievements';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import { getRedirectToSubscriptionPortalUrl } from '../Utils/GDevelopServices/Usage';
import Window from '../Utils/Window';
import { showErrorBox } from '../UI/Messages/MessageBox';
import CreateProfile from './CreateProfile';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import useIsElementVisibleInScroll from '../Utils/UseIsElementVisibleInScroll';
import { markBadgesAsSeen as doMarkBadgesAsSeen } from '../Utils/GDevelopServices/Badge';
import ErrorBoundary from '../UI/ErrorBoundary';
import useSubscriptionPlans from '../Utils/UseSubscriptionPlans';
import Text from '../UI/Text';
import Link from '../UI/Link';
import CreditsStatusBanner from '../Credits/CreditsStatusBanner';

type Props = {|
  open: boolean,
  onClose: () => void,
|};

const ProfileDialog = ({ open, onClose }: Props) => {
  const badgesSeenNotificationTimeoutRef = React.useRef<?TimeoutID>(null);
  const badgesSeenNotificationSentRef = React.useRef<boolean>(false);
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
  });

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const isUserLoading = authenticatedUser.loginState !== 'done';
  const userAchievementsContainerRef = React.useRef<?HTMLDivElement>(null);
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
        <HelpButton key="help" helpPagePath="/interface/profile" />,
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
    >
      {!isConnected && authenticatedUser.loginState === 'loggingIn' ? (
        <PlaceholderLoader />
      ) : authenticatedUser.authenticated && authenticatedUser.profile ? (
        <Line>
          <Column expand noMargin>
            <AuthenticatedUserProfileDetails
              authenticatedUser={authenticatedUser}
              onOpenEditProfileDialog={
                authenticatedUser.onOpenEditProfileDialog
              }
              onOpenChangeEmailDialog={
                authenticatedUser.onOpenChangeEmailDialog
              }
            />
            {subscriptionPlansWithPricingSystems ? (
              <SubscriptionDetails
                subscription={authenticatedUser.subscription}
                subscriptionPlansWithPricingSystems={
                  subscriptionPlansWithPricingSystems
                }
                onManageSubscription={onManageSubscription}
                isManageSubscriptionLoading={isManageSubscriptionLoading}
              />
            ) : (
              <PlaceholderLoader />
            )}
            <Column noMargin>
              <Line alignItems="center">
                <Column noMargin>
                  <Text size="block-title">
                    <Trans>GDevelop credits</Trans>
                  </Text>
                  <Text size="body" noMargin>
                    <Trans>
                      Get perks and cloud benefits when getting closer to your
                      game launch.{' '}
                      <Link
                        href="https://wiki.gdevelop.io/gdevelop5/interface/profile/credits"
                        onClick={() =>
                          Window.openExternalURL(
                            'https://wiki.gdevelop.io/gdevelop5/interface/profile/credits'
                          )
                        }
                      >
                        Learn more
                      </Link>
                    </Trans>
                  </Text>
                </Column>
              </Line>
              <CreditsStatusBanner displayPurchaseAction />
            </Column>
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
      ) : (
        <Column noMargin expand justifyContent="center">
          <CreateProfile
            onOpenLoginDialog={authenticatedUser.onOpenLoginDialog}
            onOpenCreateAccountDialog={
              authenticatedUser.onOpenCreateAccountDialog
            }
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
