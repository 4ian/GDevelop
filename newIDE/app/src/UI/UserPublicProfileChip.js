// @flow
import * as React from 'react';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import { type UserPublicProfile } from '../Utils/GDevelopServices/User';

const styles = {
  chip: {
    marginRight: 2,
  },
};

type Props = {|
  user: UserPublicProfile,
|};

export const UserPublicProfileChip = ({ user }: Props) => {
  return (
    <Chip
      icon={<FaceIcon />}
      size="small"
      style={styles.chip}
      label={user.username}
      key={user.username}
    />
  );
};
