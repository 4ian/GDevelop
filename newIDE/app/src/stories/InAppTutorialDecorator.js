// @flow
import React from 'react';
import { action } from '@storybook/addon-actions';
import { type StoryDecorator } from '@storybook/react';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';

const inAppTutorialDecorator: StoryDecorator = (Story, context) => {
  return (
    <InAppTutorialContext.Provider
      value={{
        currentlyRunningInAppTutorial: null,
        getInAppTutorialShortHeader: (tutorialId: string) => ({
          id: 'flingGame',
          availableLocales: ['en', 'fr-FR'],
          contentUrl: 'fakeContentUrl',
        }),
        startTutorial: async () => {
          action('Start tutorial')();
        },
        endTutorial: () => {
          action('End tutorial')();
        },
        inAppTutorialShortHeaders: [
          {
            id: 'flingGame',
            availableLocales: ['en', 'fr-FR'],
            contentUrl: 'fakeContentUrl',
          },
        ],
        startStepIndex: 0,
        startProjectData: {},
        inAppTutorialsFetchingError: null,
        fetchInAppTutorials: async () => {
          action('Fetch in app tutorials')();
        },
      }}
    >
      <Story />
    </InAppTutorialContext.Provider>
  );
};

export default inAppTutorialDecorator;
