import { createGdevelopTheme } from '../CreateTheme';

import styles from './ProfessionalDarkThemeVariables.json';
import './ProfessionalDarkThemeVariables.css';

export default createGdevelopTheme({
  styles,

  rootClassNameIdentifier: 'ProfessionalDarkTheme',
  paletteType: 'dark',
  gdevelopIconsCSSFilter: 'hue-rotate(-10deg) saturate(50%)',
});
