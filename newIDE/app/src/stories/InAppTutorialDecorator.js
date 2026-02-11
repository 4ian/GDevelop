// @flow
import React from 'react';
import { action } from '@storybook/addon-actions';
import { type StoryDecorator } from '@storybook/react';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';

const inAppTutorialShortHeaders = [
  {
    id: 'cameraParallax',
    titleByLocale: { en: "Let's improve the camera and the background" },
    bulletPointsByLocale: [
      { en: 'Add a background with parallax effect' },
      { en: 'Add an extension' },
      { en: 'Use basic camera movements to follow the player' },
    ],
    contentUrl:
      'https://resources.gdevelop-app.com/in-app-tutorials/cameraParallax.json',
    availableLocales: [
      'en',
      'fr',
      'ar',
      'de',
      'es',
      'it',
      'ja',
      'ko',
      'pl',
      'pt',
      'th',
      'ru',
      'sl',
      'sq',
      'uk',
      'zh',
    ],
    initialTemplateUrl:
      'https://resources.gdevelop-app.com/in-app-tutorials/templates/cameraParallax/game.json',
    initialProjectData: {
      cameraScene: 'CameraScene',
      player: 'PlayerObject',
      farBackground: 'FarBackground',
      midBackground: 'MidBackground',
    },
    isMiniTutorial: true,
  },
  {
    id: 'flingGame',
    titleByLocale: { en: "Let's make a Fling Game" },
    bulletPointsByLocale: [
      { en: 'Learn to create a game from zero.' },
      { en: 'Add a leaderboard to your game.' },
    ],
    contentUrl:
      'https://resources.gdevelop-app.com/in-app-tutorials/flingGame.json',
    availableLocales: ['en', 'fr', 'es', 'pt', 'th', 'ar'],
    isMiniTutorial: false,
  },
  {
    id: 'healthBar',
    titleByLocale: {
      en: "Let's communicate to the player the remaining health points",
    },
    bulletPointsByLocale: [
      { en: 'Use a prefab for a health bar' },
      { en: "Update the health bar based on the player's health" },
    ],
    contentUrl:
      'https://resources.gdevelop-app.com/in-app-tutorials/healthBar.json',
    availableLocales: [
      'en',
      'fr',
      'ar',
      'de',
      'es',
      'it',
      'ja',
      'ko',
      'pl',
      'pt',
      'th',
      'ru',
      'sl',
      'sq',
      'uk',
      'zh',
    ],
    initialTemplateUrl:
      'https://resources.gdevelop-app.com/in-app-tutorials/templates/healthBar/game.json',
    initialProjectData: { level: 'Level', player: 'Player' },
    isMiniTutorial: true,
  },
  {
    id: 'joystick',
    titleByLocale: { en: "Let's add mobile controls to our game" },
    bulletPointsByLocale: [
      { en: 'Add a joystick prefab' },
      { en: 'Add a behavior' },
    ],
    contentUrl:
      'https://resources.gdevelop-app.com/in-app-tutorials/joystick.json',
    availableLocales: [
      'en',
      'fr',
      'ar',
      'de',
      'es',
      'it',
      'ja',
      'ko',
      'pl',
      'pt',
      'th',
      'ru',
      'sl',
      'sq',
      'uk',
      'zh',
    ],
    initialTemplateUrl:
      'https://resources.gdevelop-app.com/in-app-tutorials/templates/joystick/game.json',
    initialProjectData: {
      gameScene: 'GameScene',
      ship: 'OrangePlayerShip3',
    },
    isMiniTutorial: true,
  },
];

const inAppTutorialDecorator: StoryDecorator = (Story, context) => {
  return (
    <InAppTutorialContext.Provider
      value={{
        currentlyRunningInAppTutorial: null,
        getInAppTutorialShortHeader: (tutorialId: string) => {
          return (
            inAppTutorialShortHeaders.find(
              header => header.id === tutorialId
            ) || null
          );
        },
        startTutorial: async () => {
          action('Start tutorial')();
        },
        endTutorial: () => {
          action('End tutorial')();
        },
        inAppTutorialShortHeaders,
        startStepIndex: 0,
        startProjectData: {},
        inAppTutorialsFetchingError: null,
        fetchInAppTutorials: async () => {
          action('Fetch in app tutorials')();
        },
        onLoadInAppTutorialFromLocalFile: async () => {
          action('load in app tutorial from local file')();
        },
      }}
    >
      <Story />
    </InAppTutorialContext.Provider>
  );
};

export default inAppTutorialDecorator;
