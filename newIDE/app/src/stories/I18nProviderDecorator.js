// @flow
import React from 'react';
import { type StoryDecorator } from '@storybook/react';
import { I18nProvider } from '@lingui/react';

const i18nProviderDecorator: StoryDecorator = (Story, context) => (
  <I18nProvider language="en">
    <Story />
  </I18nProvider>
);

export default i18nProviderDecorator;
