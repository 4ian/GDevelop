// @flow
import React from 'react';
import { type StoryDecorator } from '@storybook/react';
import ConfirmProvider from '../UI/Confirm/ConfirmProvider';

const confirmDecorator: StoryDecorator = (Story, context) => (
  <ConfirmProvider>
    <Story />
  </ConfirmProvider>
);

export default confirmDecorator;
