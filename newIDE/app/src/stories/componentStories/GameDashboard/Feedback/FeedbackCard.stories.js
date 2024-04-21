// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';

import FeedbackCard from '../../../../GameDashboard/Feedbacks/FeedbackCard';

import {
  commentProcessed,
  commentUnprocessed,
  fakeSilverAuthenticatedUser,
  indieUserProfile,
} from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'GameDashboard/Feedback/FeedbackCard',
  component: FeedbackCard,
  decorators: [paperDecorator],
};

export const Default = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const Processed = () => (
  <FeedbackCard
    comment={commentProcessed}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithContact = () => (
  <FeedbackCard
    comment={{
      ...commentUnprocessed,
      contact: 'Clem#1234',
    }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithNamedBuild = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{
      id: 'build-id',
      name: 'My magnificent build',
      isDeleted: false,
    }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithAuthenticatedPlayer = () => (
  <FeedbackCard
    comment={{
      ...commentUnprocessed,
      playerId: indieUserProfile.id,
    }}
    authenticatedUser={fakeSilverAuthenticatedUser}
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
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithUnnamedBuild = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{ id: 'build-id', isDeleted: false }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithDeletedBuild = () => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{ id: 'build-id', isDeleted: true }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);
