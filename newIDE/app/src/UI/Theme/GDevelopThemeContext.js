// @flow
import * as React from 'react';
import { type GDevelopTheme } from '.';
import DefaultLightTheme from './DefaultLightTheme';

const GDevelopThemeContext: React.Context<any> = React.createContext<GDevelopTheme>(
  DefaultLightTheme.gdevelopTheme
);

export default GDevelopThemeContext;
