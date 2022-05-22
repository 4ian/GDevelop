// @flow
import * as React from 'react';
import { type GDevelopTheme } from '.';
import GDevelopThemeContext from './ThemeContext';

type Props = {|
  children: (gdevelopTheme: GDevelopTheme) => React.Node,
|};

/**
 * Expose the Material UI theme.
 */
const ThemeConsumer = (props: Props) => (
  <GDevelopThemeContext.Consumer>
    {(gdevelopTheme) => props.children(gdevelopTheme)}
  </GDevelopThemeContext.Consumer>
);

export default ThemeConsumer;
