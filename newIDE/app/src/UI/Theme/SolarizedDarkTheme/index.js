import { createGdevelopTheme } from '../CreateTheme';

import styles from './SolarizedDarkThemeVariables';
import './SolarizedDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'SolarizedDarkTheme',
  paletteType: 'dark',
  gdevelopIconsCSSFilter: 'hue-rotate(-15deg) saturate(70%) brightness(90%)',
});
