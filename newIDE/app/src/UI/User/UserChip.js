// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { makeStyles } from '@material-ui/core';
import Person from '@material-ui/icons/Person';
import Avatar from '@material-ui/core/Avatar';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { getGravatarUrl } from '../GravatarUrl';
import DotBadge from '../DotBadge';
import RaisedButton from '../RaisedButton';
import { shortenString } from '../../Utils/StringHelpers';
import TextButton from '../TextButton';

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
  profile: ?Profile,
  onClick: () => void,
  displayNotificationBadge: boolean,
|};

const UserChip = ({ profile, onClick, displayNotificationBadge }: Props) => {
  const classes = useStyles();
  return (
    <DotBadge
      overlap="circle"
      invisible={!displayNotificationBadge}
      classes={classes}
    >
      {profile ? (
        <TextButton
          label={shortenString(profile.username || profile.email, 20)}
          onClick={onClick}
          allowBrowserAutoTranslate={false}
          icon={
            <Avatar
              src={getGravatarUrl(profile.email || '', { size: 50 })}
              style={styles.avatar}
            />
          }
        />
      ) : (
        <RaisedButton
          label={
            <span>
              <Trans>Create account - Sign in</Trans>
            </span>
          }
          onClick={onClick}
          primary
          icon={<Person fontSize="small" />}
        />
      )}
    </DotBadge>
  );
};

export default UserChip;
