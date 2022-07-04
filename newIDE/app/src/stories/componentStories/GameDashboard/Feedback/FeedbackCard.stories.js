// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import FeedbackCard from '../../../../GameDashboard/Feedbacks/FeedbackCard';

import { fakeIndieAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import { commentUnsolved } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'GameDashboard/Feedback/FeedbackCard',
  component: FeedbackCard,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultFeedbackCard = () => (
  <FeedbackCard
    comment={commentUnsolved}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithNamedBuild = () => (
  <FeedbackCard
    comment={commentUnsolved}
    buildProperties={{
      id: 'build-id',
      name: 'My magnificient build',
      isDeleted: false,
    }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithUnnamedBuild = () => (
  <FeedbackCard
    comment={commentUnsolved}
    buildProperties={{ id: 'build-id', isDeleted: false }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);

export const FeedbackCardWithDeletedBuild = () => (
  <FeedbackCard
    comment={commentUnsolved}
    buildProperties={{ id: 'build-id', isDeleted: true }}
    authenticatedUser={fakeIndieAuthenticatedUser}
    onCommentUpdated={action('onCommentUpdated')}
  />
);
