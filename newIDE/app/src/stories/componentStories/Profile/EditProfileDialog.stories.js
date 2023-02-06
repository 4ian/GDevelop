// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import EditProfileDialog from '../../../Profile/EditProfileDialog';

export default {
  title: 'Profile/EditProfileDialog',
  component: EditProfileDialog,
  decorators: [paperDecorator, muiDecorator],
};

const defaultProps = {
  onClose: () => {},
  onEdit: async () => {},
  updateProfileInProgress: false,
  error: null,
  profile: {
    id: 'id',
    email: 'email',
    username: 'username',
    description: 'I am just another video game enthusiast!',
    getGameStatsEmail: false,
    getNewsletterEmail: true,
    isCreator: true,
    isPlayer: false,
    createdAt: 12345,
    updatedAt: 12345,
    appLanguage: 'en',
    donateLink: 'https://www.gdevelop-app.com',
  },
};
export const Default = () => <EditProfileDialog {...defaultProps} />;

export const ErrorFromBackend = () => (
  <EditProfileDialog {...defaultProps} error={{ code: 'auth/username-used' }} />
);

export const Submitting = () => (
  <EditProfileDialog {...defaultProps} updateProfileInProgress />
);
