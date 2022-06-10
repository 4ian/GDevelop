import { createGdevelopTheme } from '../CreateTheme';
import styles from './DefaultThemeVariables.json';
import './DefaultThemeVariables.css';

export default createGdevelopTheme({
  styles,
  isModern: false,
  rootClassNameIdentifier: 'DefaultTheme',
  paletteType: 'light',
});
