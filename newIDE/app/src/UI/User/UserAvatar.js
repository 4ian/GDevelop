// @flow
import * as React from 'react';
import { Avatar } from '@material-ui/core';
import { getGravatarUrl } from '../GravatarUrl';
import classes from './UserAvatar.module.css';

const styles = {
  avatar: {
    width: 20,
    height: 20,
  },
  premiumAvatar: {
    width: 16,
    height: 16,
  },
};

type Props = {| iconUrl: string, isPremium: boolean |};

export default function UserAvatar({ iconUrl, isPremium }: Props) {
  return isPremium ? (
    <div className={classes.premiumContainer}>
      <Avatar src={getGravatarUrl(iconUrl)} style={styles.premiumAvatar} />
    </div>
  ) : (
    <Avatar src={getGravatarUrl(iconUrl)} style={styles.avatar} />
  );
}
