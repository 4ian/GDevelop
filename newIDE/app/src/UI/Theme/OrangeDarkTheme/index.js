import { createGdevelopTheme } from '../CreateTheme';

import styles from './OrangeDarkThemeVariables.json';
import './OrangeDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,
  rootClassNameIdentifier: 'OrangeDarkTheme',
  paletteType: 'dark',
});
