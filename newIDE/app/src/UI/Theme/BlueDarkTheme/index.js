import { createGdevelopTheme } from '../CreateTheme';

import styles from './BlueDarkThemeVariables.json';
import './BlueDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'BlueDarkTheme',
  paletteType: 'dark',
});
