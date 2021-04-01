import { createGdevelopTheme } from '../CreateTheme';

import styles from './OneDarkThemeVariables.json';
import './OneDarkThemeVariables.css';

export default createGdevelopTheme(
  styles,
  'OneDarkTheme',
  'dark',
  'hue-rotate(-10deg) saturate(50%)'
);
