// @flow
import * as React from 'react';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import { type UserPublicProfile } from '../Utils/GDevelopServices/User';
import PublicProfileContext, {type PublicProfileOpenerType} from '../Profile/PublicProfileContext';

const styles = {
  chip: {
    marginRight: 2,
  },
};

type Props = {|
  user: UserPublicProfile,
  isClickable?: boolean,
|};

export const UserPublicProfileChip = ({ user, isClickable=false }: Props) => {
  return (
    <PublicProfileContext.Consumer>
      {(openPublicProfile: PublicProfileOpenerType) => (
        <Chip
          icon={<FaceIcon />}
          size="small"
          style={styles.chip}
          label={user.username}
          key={user.username}
          onClick={isClickable ? (() => openPublicProfile(user.id)) : null}
        />
      )}
    </PublicProfileContext.Consumer>
  );
};
