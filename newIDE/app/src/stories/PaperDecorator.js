// @flow
import React from 'react';
import { type StoryDecorator } from '@storybook/react';
import Paper from '../UI/Paper';

const style = {
  padding: 10,
};

const paperDecorator: StoryDecorator = (Story, context) => (
  <Paper background="dark" style={style}>
    <Story />
  </Paper>
);

export default paperDecorator;
