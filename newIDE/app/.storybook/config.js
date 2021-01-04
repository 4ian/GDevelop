import { configure, addDecorator } from '@storybook/react';
import i18nProviderDecorator from '../src/stories/I18nProviderDecorator';

function loadStories() {
  require('../src/stories');
}

addDecorator(i18nProviderDecorator);

configure(loadStories, module);
