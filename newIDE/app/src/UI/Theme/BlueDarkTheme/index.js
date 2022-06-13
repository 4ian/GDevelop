import { createGdevelopTheme } from '../CreateTheme';

import styles from './BlueDarkThemeVariables.json';
import './BlueDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,
  isModern: true,
  rootClassNameIdentifier: 'BlueDarkTheme',
  paletteType: 'dark',
});
