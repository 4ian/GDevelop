// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { makeStyles } from '@material-ui/core';
import Chip from '../../UI/Chip';
import FaceIcon from '@material-ui/icons/Face';
import Avatar from '@material-ui/core/Avatar';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { getGravatarUrl } from '../GravatarUrl';
import DotBadge from '../DotBadge';

type Props = {|
  profile: ?Profile,
  onClick: () => void,
  displayNotificationBadge: boolean,
|};

const useStyles = makeStyles({
  root: { flexDirection: 'column' },
  anchorOriginTopRightCircle: {
    top: 5,
    right: 5,
  },
});

const UserChip = ({ profile, onClick, displayNotificationBadge }: Props) => {
  const classes = useStyles();
  return (
    <DotBadge
      overlap="circle"
      invisible={!displayNotificationBadge}
      classes={classes}
    >
      <Chip
        variant="outlined"
        avatar={
          profile ? (
            <Avatar
              src={getGravatarUrl(profile.email || '', { size: 30 })}
              sx={{ width: 30, height: 30 }}
            />
          ) : (
            <FaceIcon />
          )
        }
        label={
          profile ? (
            profile.username || profile.email
          ) : (
            <span>
              <Trans>Click to connect</Trans>
            </span>
          )
        }
        onClick={onClick}
      />
    </DotBadge>
  );
};

export default UserChip;
