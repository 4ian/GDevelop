// @flow
import React from 'react';
import V0MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import defaultTheme from '../UI/Theme/DefaultTheme';
import { type StoryDecorator } from '@storybook/react';

const muiDecorator: StoryDecorator = (story, context) => (
  <V0MuiThemeProvider muiTheme={defaultTheme}>
    {story(context)}
  </V0MuiThemeProvider>
);

export default muiDecorator;
