import { createGdevelopTheme } from '../CreateTheme';
import styles from './DefaultThemeVariables.json';
import './DefaultThemeVariables.css';

export default createGdevelopTheme({
  styles,
  rootClassNameIdentifier: 'DefaultTheme',
  paletteType: 'light',
});
