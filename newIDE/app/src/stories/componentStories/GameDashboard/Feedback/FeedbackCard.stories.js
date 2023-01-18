// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import FeedbackCard from '../../../../GameDashboard/Feedbacks/FeedbackCard';

import {
  commentProcessed,
  commentUnprocessed,
  fakeIndieAuthenticatedUser,
  indieUserProfile,
} from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'GameDashboard/Feedback/FeedbackCard',
  component: FeedbackCard,
  decorators: [muiDecorator, paperDecorator],
};

export const Default = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const Processed = () => (
  <FeedbackCard
    comment={commentProcessed}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithContact = () => (
  <FeedbackCard
    comment={{
      ...commentUnprocessed,
      contact: 'Clem#1234',
    }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithNamedBuild = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{
      id: 'build-id',
      name: 'My magnificient build',
      isDeleted: false,
    }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithAuthenticatedPlayer = () => (
  <FeedbackCard
    comment={{
      ...commentUnprocessed,
      playerId: indieUserProfile.id,
    }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithAuthenticatedPlayerAndContact = () => (
  <FeedbackCard
    comment={{
      ...commentUnprocessed,
      playerId: indieUserProfile.id,
      contact: 'Clem#1234',
    }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithUnnamedBuild = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{ id: 'build-id', isDeleted: false }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithDeletedBuild = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{ id: 'build-id', isDeleted: true }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);
