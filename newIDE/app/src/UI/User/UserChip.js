// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { makeStyles } from '@material-ui/core';
import Person from '@material-ui/icons/Person';
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

const useStyles = makeStyles({
  root: { flexDirection: 'column' },
  anchorOriginTopRightCircle: {
    top: 5,
    right: 5,
  },
});

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
};

type Props = {|
  onOpenProfile: () => void,
|};

const UserChip = ({ onOpenProfile }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, onLogin, onCreateAccount, loginState } = authenticatedUser;
  const displayNotificationBadge = hasPendingNotifications(authenticatedUser);
  const classes = useStyles();
  return loginState === 'loggingIn' ? (
    <CircularProgress size={25} />
  ) : profile ? (
    <DotBadge
      overlap="circle"
      invisible={!displayNotificationBadge}
      classes={classes}
    >
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
    <LineStackLayout noMargin>
      <FlatButton
        label={
          <span>
            <Trans>Log in</Trans>
          </span>
        }
        onClick={onLogin}
        leftIcon={<Person fontSize="small" />}
      />
      <RaisedButton
        label={
          <span>
            <Trans>Create account</Trans>
          </span>
        }
        onClick={onCreateAccount}
        primary
        icon={<Person fontSize="small" />}
      />
    </LineStackLayout>
  );
};

export default UserChip;
