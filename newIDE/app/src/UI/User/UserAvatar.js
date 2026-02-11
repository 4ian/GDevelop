// @flow
import * as React from 'react';
import { Avatar } from '@material-ui/core';
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
      <Avatar src={iconUrl} style={styles.premiumAvatar} />
    </div>
  ) : (
    <Avatar src={iconUrl} style={styles.avatar} />
  );
}
