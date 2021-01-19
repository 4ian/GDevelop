import { createGdevelopTheme } from '../theme';

import styles from './$THEME_IDVariables.json';
import './$THEME_IDVariables.css';

export default createGdevelopTheme(styles, '$THEME_ID', 'dark');
