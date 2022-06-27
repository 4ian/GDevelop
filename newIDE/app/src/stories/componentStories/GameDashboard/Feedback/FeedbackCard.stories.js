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
