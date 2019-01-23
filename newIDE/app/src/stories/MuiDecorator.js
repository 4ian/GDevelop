// @flow
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import defaultTheme from '../UI/Theme/DefaultTheme';
import { type StoryDecorator } from '@storybook/react';

const muiDecorator: StoryDecorator = (story, context) => (
  <MuiThemeProvider muiTheme={defaultTheme}>{story(context)}</MuiThemeProvider>
);

export default muiDecorator;
