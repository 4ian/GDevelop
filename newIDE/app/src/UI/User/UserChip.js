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
import { hasPendingNotifications } from '../../Utils/Notification';
import CircularProgress from '../CircularProgress';
import User from '../CustomSvgIcons/User';

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
  const { profile, onLogin, onCreateAccount, loginState } = authenticatedUser;
  const displayNotificationBadge = hasPendingNotifications(authenticatedUser);
  return loginState === 'loggingIn' ? (
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
          onClick={onLogin}
          leftIcon={<User fontSize="small" />}
        />
        <RaisedButton
          label={
            <span>
              <Trans>Create account</Trans>
            </span>
          }
          onClick={onCreateAccount}
          primary
          icon={<User fontSize="small" />}
        />
      </LineStackLayout>
    </div>
  );
};

export default UserChip;
