// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { UserPublicProfileChip as UserPublicProfileChipComponent } from '../../../UI/User/UserPublicProfileChip';

export default {
  title: 'User chips/UserPublicProfileChip',
  component: UserPublicProfileChipComponent,
  decorators: [paperDecorator],
};

export const UserPublicProfileChip = () => (
  <UserPublicProfileChipComponent
    user={{
      id: '123',
      username: 'username',
      description: 'something',
      donateLink: 'https://myurl.com',
      discordUsername: 'username#1234',
      communityLinks: {},
      iconUrl: 'https://resources.gdevelop-app.com/avatars/4ian.png',
    }}
  />
);
