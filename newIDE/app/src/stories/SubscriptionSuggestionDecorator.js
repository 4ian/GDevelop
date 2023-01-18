// @flow
import React from 'react';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import { action } from '@storybook/addon-actions';
import { type StoryDecorator } from '@storybook/react';

const subscriptionSuggestionDecorator: StoryDecorator = (Story, context) => {
  return (
    <SubscriptionSuggestionContext.Provider
      value={{
        openSubscriptionDialog: action('open subscription dialog'),
      }}
    >
      <Story />
    </SubscriptionSuggestionContext.Provider>
  );
};

export default subscriptionSuggestionDecorator;
