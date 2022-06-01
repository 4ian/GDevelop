// @flow
import { configure, addDecorator } from '@storybook/react';
import i18nProviderDecorator from '../src/stories/I18nProviderDecorator';
import '../src/UI/icomoon-font.css'; // Styles for Icomoon font.

export const globalTypes = {
  themeName: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'GDevelop default',
    toolbar: {
      icon: 'circlehollow',
      // See theme names in ThemeRegistry.js
      items: ['GDevelop default', 'GDevelop default Dark', 'Dark', 'Nord', 'Solarized Dark', 'One Dark'],
      showName: true,
    },
  },
};

export const parameters = {
  // Disable controls and docs, included in @storybook/addon-essentials,
  // that we don't use.
  controls: { hideNoControlsWarning: true },
  docs: { disable: true }
};

addDecorator(i18nProviderDecorator);
