import { createGdevelopTheme } from '../CreateTheme';

import styles from './DefaultDarkThemeVariables.json';
import './DefaultDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,
  isModern: true,
  rootClassNameIdentifier: 'DefaultDarkTheme',
  paletteType: 'dark',
});
