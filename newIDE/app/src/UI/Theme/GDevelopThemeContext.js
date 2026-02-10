// @flow
import * as React from 'react';
import { type GDevelopTheme } from '.';
import DefaultLightTheme from './DefaultLightTheme';

// $FlowFixMe[value-as-type]
// $FlowFixMe[signature-verification-failure]
const GDevelopThemeContext = React.createContext<GDevelopTheme>(
  DefaultLightTheme.gdevelopTheme
);

export default GDevelopThemeContext;
