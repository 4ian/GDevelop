import { createGdevelopTheme } from '../CreateTheme';

import styles from './ModernDarkThemeVariables.json';
import './ModernDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'ModernDarkTheme',
  paletteType: 'dark',
});
