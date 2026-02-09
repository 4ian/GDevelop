// @flow
import * as React from 'react';
import { type GDevelopTheme } from '.';
import DefaultLightTheme from './DefaultLightTheme';

// $FlowFixMe[value-as-type]
const GDevelopThemeContext: React.Context<GDevelopTheme> = React.createContext<GDevelopTheme>(
  DefaultLightTheme.gdevelopTheme
);

export default GDevelopThemeContext;
