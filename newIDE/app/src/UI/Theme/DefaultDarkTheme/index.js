import { createGdevelopTheme } from '../CreateTheme';

import styles from './DefaultDarkThemeVariables.json';
import './DefaultDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,
  isModern: true,
  rootClassNameIdentifier: 'DefaultDarkTheme',
  paletteType: 'dark',
  gdevelopIconsCSSFilter:
    'hue-rotate(29deg) saturate(70%) contrast(1.1) brightness(1.3) ',
});
