// @flow
import React from 'react';
import { type StoryDecorator } from '@storybook/react';
import { I18nProvider } from '@lingui/react';

const i18nProviderDecorator: StoryDecorator = (story, context) => (
  <I18nProvider language="en">{story(context)}</I18nProvider>
);

export default i18nProviderDecorator;
