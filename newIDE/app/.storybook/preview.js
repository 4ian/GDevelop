// @flow
import GDevelopJsInitializerDecorator from '../src/stories/GDevelopJsInitializerDecorator';
import i18nProviderDecorator from '../src/stories/I18nProviderDecorator';
import BrowserDropDownMenuDisablerDecorator from '../src/stories/BrowserDropDownMenuDisablerDecorator';
import themeDecorator from '../src/stories/ThemeDecorator';
import '../src/UI/icomoon-font.css'; // Styles for Icomoon font.
import './app-level-styling.css';
import { configureActions } from 'storybook/actions';

configureActions({
  depth: 2,
  limit: 20,
});

export const globalTypes = {
  themeName: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'GDevelop default Dark',
    toolbar: {
      icon: 'circlehollow',
      // See theme names in ThemeRegistry.js
      items: [
        'GDevelop default Dark',
        'GDevelop default Light',
        'Blue Dark',
        'Nord',
        'Solarized Dark',
        'One Dark',
        'Rosé Pine',
      ],
      showName: true,
    },
  },
};

export const parameters = {
  // Disable controls and docs, included in @storybook/addon-essentials,
  // that we don't use.
  controls: { hideNoControlsWarning: true },
  docs: { disable: true },
};

export const decorators = [
  themeDecorator,
  GDevelopJsInitializerDecorator,
  i18nProviderDecorator,
  BrowserDropDownMenuDisablerDecorator,
];
