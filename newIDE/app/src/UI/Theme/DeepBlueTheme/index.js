import { createGdevelopTheme } from '../CreateTheme';

import styles from './DeepBlueThemeVariables.json';
import './DeepBlueThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'DeepBlueTheme',
  paletteType: 'dark',
  gdevelopIconsCSSFilter: 'hue-rotate(-10deg) saturate(50%)',
});
