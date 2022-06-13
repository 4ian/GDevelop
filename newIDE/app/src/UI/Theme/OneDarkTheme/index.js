import { createGdevelopTheme } from '../CreateTheme';

import styles from './OneDarkThemeVariables.json';
import './OneDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'OneDarkTheme',
  paletteType: 'dark',
  gdevelopIconsCSSFilter: 'hue-rotate(-10deg) saturate(50%)',
});
