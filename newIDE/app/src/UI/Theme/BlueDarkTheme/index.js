import { createGdevelopTheme } from '../CreateTheme';

import styles from './DarkThemeVariables.json';
import './DarkThemeVariables.css';

export default createGdevelopTheme({
  styles,
  isModern: true,
  rootClassNameIdentifier: 'DarkTheme',
  paletteType: 'dark',
});
