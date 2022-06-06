import { createGdevelopTheme } from '../CreateTheme';

import styles from './DarkThemeVariables.json';
import './DarkThemeVariables.css';

export default createGdevelopTheme({
  styles,
  rootClassNameIdentifier: 'DarkTheme',
  paletteType: 'dark',
});
