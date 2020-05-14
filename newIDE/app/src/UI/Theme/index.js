// @flow
import DarkTheme from './DarkTheme';
import DefaultTheme from './DefaultTheme';
import { type Theme } from './DefaultTheme';
import './Global.css';

// To add a new theme:
// * copy the folder of an existing one (DarkTheme for example),
// * import it at the top of the file
// * add it below:
export const themes = {
  'GDevelop default': DefaultTheme,
  Dark: DarkTheme,
};

export const getTheme = (themeName: string): Theme =>
  themes[themeName] || themes['GDevelop default'];

export type GDevelopTheme = $PropertyType<Theme, 'gdevelopTheme'>;
