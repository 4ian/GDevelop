// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Avatar from '@material-ui/core/Avatar';
import { getGravatarUrl } from '../GravatarUrl';
import DotBadge from '../DotBadge';
import RaisedButton from '../RaisedButton';
import { shortenString } from '../../Utils/StringHelpers';
import TextButton from '../TextButton';
import { LineStackLayout } from '../Layout';
import FlatButton from '../FlatButton';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import CircularProgress from '../CircularProgress';
import User from '../CustomSvgIcons/User';
import { hasPendingBadgeNotifications } from '../../Utils/GDevelopServices/Badge';

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
  buttonContainer: { flexShrink: 0 },
};

type Props = {|
  onOpenProfile: () => void,
|};

const UserChip = ({ onOpenProfile }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    loginState,
  } = authenticatedUser;
  // TODO: Remove the badge on the user chip and handle badge notifications
  // with user notifications.
  const displayNotificationBadge = hasPendingBadgeNotifications(
    authenticatedUser
  );
  return !profile && loginState === 'loggingIn' ? (
    <CircularProgress size={25} />
  ) : profile ? (
    <DotBadge overlap="circle" invisible={!displayNotificationBadge}>
      <TextButton
        label={shortenString(profile.username || profile.email, 20)}
        onClick={onOpenProfile}
        allowBrowserAutoTranslate={false}
        icon={
          <Avatar
            src={getGravatarUrl(profile.email || '', { size: 50 })}
            style={styles.avatar}
          />
        }
      />
    </DotBadge>
  ) : (
    <div style={styles.buttonContainer}>
      <LineStackLayout noMargin alignItems="center">
        <FlatButton
          label={
            <span>
              <Trans>Log in</Trans>
            </span>
          }
          onClick={onOpenLoginDialog}
          leftIcon={<User fontSize="small" />}
        />
        <RaisedButton
          label={
            <span>
              <Trans>Create account</Trans>
            </span>
          }
          onClick={onOpenCreateAccountDialog}
          primary
          icon={<User fontSize="small" />}
        />
      </LineStackLayout>
    </div>
  );
};

export default UserChip;
