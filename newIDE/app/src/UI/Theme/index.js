import DarkTheme from './DarkTheme';
import DefaultTheme from './DefaultTheme';

export const themes = {
  'GDevelop default': DefaultTheme,
  Dark: DarkTheme,
};

export const getTheme = themeName =>
  themes[themeName] || themes['GDevelop default'];
