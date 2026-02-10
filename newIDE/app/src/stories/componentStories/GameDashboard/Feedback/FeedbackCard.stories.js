// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';

import FeedbackCard from '../../../../GameDashboard/Feedbacks/FeedbackCard';

import {
  commentProcessed,
  commentUnprocessed,
  commentWithNoTextUnprocessed,
  fakeSilverAuthenticatedUser,
  indieUserProfile,
} from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'GameDashboard/Feedback/FeedbackCard',
  component: FeedbackCard,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <FeedbackCard
    comment={commentUnprocessed}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithoutText = (): React.Node => (
  <FeedbackCard
    comment={commentWithNoTextUnprocessed}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const Processed = (): React.Node => (
  <FeedbackCard
    comment={commentProcessed}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithContact = (): React.Node => (
  <FeedbackCard
    comment={{
      ...commentUnprocessed,
      contact: 'Clem#1234',
    }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithNamedBuild = (): React.Node => (
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

export const WithAuthenticatedPlayer = (): React.Node => (
  <FeedbackCard
    comment={{
      ...commentUnprocessed,
      playerId: indieUserProfile.id,
    }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const WithAuthenticatedPlayerAndContact = (): React.Node => (
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

export const FeedbackCardWithUnnamedBuild = (): React.Node => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{ id: 'build-id', isDeleted: false }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithDeletedBuild = (): React.Node => (
  <FeedbackCard
    comment={commentUnprocessed}
    buildProperties={{ id: 'build-id', isDeleted: true }}
    authenticatedUser={fakeSilverAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);
