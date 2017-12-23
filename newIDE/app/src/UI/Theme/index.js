import DarkTheme from './DarkTheme';
import DefaultTheme from './DefaultTheme';

// To add a new theme:
// * copy the folder of an existing one (DefaultTheme for example),
// * import it at the top of the file
// * add it below:
export const themes = {
  'GDevelop default': DefaultTheme,
  Dark: DarkTheme,
};

export const getTheme = themeName =>
  themes[themeName] || themes['GDevelop default'];
