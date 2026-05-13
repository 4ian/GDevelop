// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../Dialog';
import FlatButton from '../FlatButton';
import LeftLoader from '../LeftLoader';
import AlertMessage from '../AlertMessage';
import { ColumnStackLayout } from '../Layout';
import { acceptTeamInvitation } from '../../Utils/GDevelopServices/User';
import { markNotificationsAsSeen } from '../../Utils/GDevelopServices/Notification';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import Text from '../Text';

type Props = {|
  teamId: string,
  inviterEmail: string,
  notificationId: string,
  onClose: () => void,
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  onRefreshNotifications: () => Promise<void>,
|};

const TeamInvitationDialog = ({
  teamId,
  inviterEmail,
  notificationId,
  onClose,
  getAuthorizationHeader,
  userId,
  onRefreshNotifications,
}: Props): React.Node => {
  const { onRefreshUserProfile } = React.useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<?React.Node>(null);

  const onAccept = React.useCallback(
    async () => {
      setIsLoading(true);
      setError(null);
      try {
        await acceptTeamInvitation(getAuthorizationHeader, {
          userId,
          teamId,
        });
        await markNotificationsAsSeen(getAuthorizationHeader, {
          notificationIds: [notificationId],
          userId,
        });
        await Promise.all([onRefreshNotifications(), onRefreshUserProfile()]);
        onClose();
      } catch (err) {
        console.error(
          'An error occurred while accepting team invitation:',
          err
        );
        const extractedError = extractGDevelopApiErrorStatusAndCode(err);
        if (extractedError && extractedError.status === 404) {
          setError(<Trans>This invitation is no longer valid.</Trans>);
        } else if (
          extractedError &&
          extractedError.code === 'team-member-invitation/already-accepted'
        ) {
          setError(<Trans>You are already a member of this team.</Trans>);
        } else if (
          extractedError &&
          extractedError.code === 'team-member-invitation/user-has-subscription'
        ) {
          setError(
            <Trans>
              You need to cancel your current subscription before joining a
              team.
            </Trans>
          );
        } else {
          setError(
            <Trans>
              An error occurred while accepting the invitation. Please try again
              later.
            </Trans>
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      getAuthorizationHeader,
      userId,
      teamId,
      notificationId,
      onRefreshNotifications,
      onRefreshUserProfile,
      onClose,
    ]
  );

  return (
    <Dialog
      title={<Trans>Team invitation</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Ignore</Trans>}
          disabled={isLoading}
          key="ignore"
          onClick={onClose}
        />,
        <LeftLoader isLoading={isLoading} key="accept">
          <DialogPrimaryButton
            label={<Trans>Accept</Trans>}
            primary
            onClick={onAccept}
            disabled={isLoading}
          />
        </LeftLoader>,
      ]}
      maxWidth="sm"
      cannotBeDismissed={isLoading}
      onRequestClose={onClose}
      onApply={onAccept}
      open
    >
      <ColumnStackLayout noMargin>
        <Text>
          <Trans>You've been invited to join a team by {inviterEmail}</Trans>
        </Text>
        <Text>
          <Trans>
            By accepting, the team admin will be able to access your projects
            and may update your profile information such as your username.
          </Trans>
        </Text>
        {error && <AlertMessage kind="error">{error}</AlertMessage>}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default TeamInvitationDialog;
