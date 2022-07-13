import { createGdevelopTheme } from '../CreateTheme';

import styles from './DefaultDarkThemeVariables.json';
import './DefaultDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'DefaultDarkTheme',
  paletteType: 'dark',
});
