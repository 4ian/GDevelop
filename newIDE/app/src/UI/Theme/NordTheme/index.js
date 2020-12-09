import { createGdevelopTheme } from '../CreateTheme';

import darkStyles from './NordThemeVariables.json';
import './NordThemeVariables.css';

export default createGdevelopTheme(
  darkStyles,
  'NordTheme',
  'dark',
  'hue-rotate(-15deg) saturate(57%) brightness(120%)'
);
