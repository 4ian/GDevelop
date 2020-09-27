// @flow
import React from 'react';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import { ThemeProvider } from '@material-ui/styles';
import defaultTheme from '../UI/Theme';
import { type StoryDecorator } from '@storybook/react';

const themeDecorator: StoryDecorator = (story, context) => (
  <GDevelopThemeContext.Provider value={defaultTheme.gdevelopTheme}>
    <ThemeProvider theme={defaultTheme.muiTheme}>
      {story(context)}
    </ThemeProvider>
  </GDevelopThemeContext.Provider>
);

export default themeDecorator;
