// @flow
import * as React from 'react';
import Chip from '../../UI/Chip';
import FaceIcon from '@material-ui/icons/Face';
import { type UserPublicProfile } from '../../Utils/GDevelopServices/User';
import PublicProfileContext from '../../Profile/PublicProfileContext';

const styles = {
  chip: {
    marginRight: 2,
  },
};

type Props = {|
  user: UserPublicProfile,
  isClickable?: boolean,
|};

export const UserPublicProfileChip = ({ user, isClickable = false }: Props) => {
  const { openUserPublicProfile } = React.useContext(PublicProfileContext);

  return (
    <Chip
      icon={<FaceIcon />}
      size="small"
      style={styles.chip}
      label={user.username}
      key={user.username}
      onClick={isClickable ? () => openUserPublicProfile(user.id) : null}
    />
  );
};
