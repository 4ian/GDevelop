// @flow
import React from 'react';
import { type StoryDecorator } from '@storybook/react';
import Paper from '../UI/Paper';

const style = {
  padding: 10,
};

export const getPaperDecorator = (
  background: 'medium' | 'dark'
): StoryDecorator => (Story, context) => (
  <Paper background={background} style={style}>
    <Story />
  </Paper>
);

const defaultPaperDecorator = getPaperDecorator('dark');

export default defaultPaperDecorator;
