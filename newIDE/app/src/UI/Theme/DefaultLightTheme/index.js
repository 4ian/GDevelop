import { createGdevelopTheme } from '../CreateTheme';
import styles from './DefaultLightThemeVariables.json';
import './DefaultLightThemeVariables.css';

export default createGdevelopTheme({
  styles,
  isModern: true,
  rootClassNameIdentifier: 'DefaultLightTheme',
  paletteType: 'light',
});
