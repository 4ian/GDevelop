// @flow
import * as React from 'react';
import { type GDevelopTheme } from '.';
import DefaultTheme from './DefaultTheme';

const GDevelopThemeContext: React$Context<GDevelopTheme> = React.createContext<GDevelopTheme>(
  DefaultTheme.gdevelopTheme
);

export default GDevelopThemeContext;
