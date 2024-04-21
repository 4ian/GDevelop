// @flow
import * as React from 'react';
import Chip from '../../UI/Chip';
import { type UserPublicProfile } from '../../Utils/GDevelopServices/User';
import PublicProfileContext from '../../Profile/PublicProfileContext';
import User from '../CustomSvgIcons/User';

const styles = {
  chip: {
    marginRight: 2,
    marginLeft: 2,
    marginBottom: 2,
  },
};

type Props = {|
  user: UserPublicProfile,
  isClickable?: boolean,
  variant?: 'default' | 'outlined',
|};

export const UserPublicProfileChip = ({
  user,
  isClickable = false,
  variant,
}: Props) => {
  const { openUserPublicProfile } = React.useContext(PublicProfileContext);

  return (
    <Chip
      icon={<User />}
      size="small"
      style={styles.chip}
      variant={variant}
      label={user.username}
      key={user.username}
      onClick={isClickable ? () => openUserPublicProfile(user.id) : null}
      disableAutoTranslate
    />
  );
};
