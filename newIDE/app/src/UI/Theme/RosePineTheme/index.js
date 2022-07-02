import { createGdevelopTheme } from '../CreateTheme';

import styles from './RosePineThemeVariables.json';
import './RosePineThemeVariables.css';

export default createGdevelopTheme({
  styles,
  rootClassNameIdentifier: 'RosePineTheme',
  paletteType: 'dark',
  gdevelopIconsCSSFilter: 'hue-rotate(75deg) saturate(50%) brightness(100%)',
});
