// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import Avatar from '@material-ui/core/Avatar';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { getGravatarUrl } from '../GravatarUrl';

type Props = {|
  profile: ?Profile,
  onClick: () => void,
|};

const UserChip = ({ profile, onClick }: Props) => {
  return (
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
          <Trans>Click to connect</Trans>
        )
      }
      onClick={onClick}
    />
  );
};

export default UserChip;
