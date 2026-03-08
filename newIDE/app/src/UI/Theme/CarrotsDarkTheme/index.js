import { createGdevelopTheme } from '../CreateTheme';

import styles from './CarrotsDarkThemeVariables.json';
import './CarrotsDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,
  rootClassNameIdentifier: 'CarrotsDarkTheme',
  paletteType: 'dark',
});
