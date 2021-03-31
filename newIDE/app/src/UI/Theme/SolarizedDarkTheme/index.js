import { createGdevelopTheme } from '../CreateTheme';

import darkStyles from './SolarizedDarkThemeVariables';
import './SolarizedDarkThemeVariables.css';

export default createGdevelopTheme(
  darkStyles,
  'SolarizedDarkTheme',
  'dark',
  'hue-rotate(-15deg) saturate(70%) brightness(90%)'
);
