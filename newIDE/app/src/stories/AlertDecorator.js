// @flow
import React from 'react';
import { type StoryDecorator } from '@storybook/react';
import AlertProvider from '../UI/Alert/AlertProvider';

const alertDecorator: StoryDecorator = (Story, context) => (
  <AlertProvider>
    <Story />
  </AlertProvider>
);

export default alertDecorator;
