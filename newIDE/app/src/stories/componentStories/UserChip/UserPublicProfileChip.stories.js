// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { UserPublicProfileChip as UserPublicProfileChipComponent } from '../../../UI/User/UserPublicProfileChip';

export default {
  title: 'User chips/UserPublicProfileChip',
  component: UserPublicProfileChipComponent,
  decorators: [paperDecorator, muiDecorator],
};

export const UserPublicProfileChip = () => (
  <UserPublicProfileChipComponent
    user={{
      id: '123',
      username: 'username',
      description: 'something',
      donateLink: 'https://myurl.com',
      personalWebsiteLink: 'https://indie-user.com',
      personalWebsite2Link: 'https://indie-user2.com',
      twitterUsername: 'indie-user',
      facebookUsername: 'indie-user',
      youtubeUsername: 'indie-user',
      tiktokUsername: 'indie-user',
      instagramUsername: 'indie-user',
      redditUsername: 'indie-user',
      snapchatUsername: 'indie-user',
      discordServerLink: 'https://discord.gg/indie-user',
    }}
  />
);
