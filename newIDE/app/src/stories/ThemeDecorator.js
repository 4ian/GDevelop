// @flow
import React from 'react';
import { type StoryDecorator } from '@storybook/react';
import { FullThemeProvider } from '../UI/Theme/FullThemeProvider';

const themeDecorator: StoryDecorator = (Story, context) => {
  return (
    <FullThemeProvider forcedThemeName={context.globals.themeName}>
      <Story />
    </FullThemeProvider>
  );
};

export default themeDecorator;
