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

const useStyles = makeStyles({
  root: { flexDirection: 'column' },
  anchorOriginTopRightCircle: {
    top: 5,
    right: 5,
  },
});

const styles = {
  avatar: {
    width: 25,
    height: 25,
  },
};

type Props = {|
  profile: ?Profile,
  onClick: () => void,
  displayNotificationBadge: boolean,
|};

const UserChip = ({ profile, onClick, displayNotificationBadge }: Props) => {
  const classes = useStyles();
  const label = profile ? profile.username || profile.email : undefined;
  const shortenedLabel = label ? shortenString(label, 20) : undefined;
  return (
    <DotBadge
      overlap="circle"
      invisible={!displayNotificationBadge}
      classes={classes}
    >
      <RaisedButton
        label={
          shortenedLabel || (
            <span>
              <Trans>Create account - Sign in</Trans>
            </span>
          )
        }
        onClick={onClick}
        primary
        icon={
          profile ? (
            <Avatar
              src={getGravatarUrl(profile.email || '', { size: 50 })}
              style={styles.avatar}
            />
          ) : (
            <Person style={styles.avatar} />
          )
        }
      />
    </DotBadge>
  );
};

export default UserChip;
