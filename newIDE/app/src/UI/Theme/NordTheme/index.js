import { createGdevelopTheme } from '../CreateTheme';

import styles from './NordThemeVariables.json';
import './NordThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'NordTheme',
  paletteType: 'dark',
  gdevelopIconsCSSFilter: 'hue-rotate(-15deg) saturate(57%) brightness(120%)',
});
